# Backend/medical/views.py
from django.contrib.auth import authenticate, login, logout, get_user_model
from rest_framework import viewsets, permissions, status 
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.views import APIView
from django.db import transaction
from django.utils import timezone
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt
from django.middleware.csrf import get_token
from django.contrib.auth.models import Group
from medical.models import Member  # adjust import to your actual model
from medical.serializers import MemberSerializer  # adjust import if serializer exists
from django.db.models import Q, Sum
from datetime import date
from .models import (
    Member, MembershipType, Claim, ClaimItem, ClaimReview, AuditLog, 
    Notification, ReimbursementScale, Setting, ChronicRequest, ClaimAttachment
)
from .serializers import (
    MemberSerializer, MembershipTypeSerializer, ClaimSerializer, ClaimItemSerializer,
    ClaimReviewSerializer, NotificationSerializer, ReimbursementScaleSerializer,
    SettingSerializer, ChronicRequestSerializer, ClaimAttachmentSerializer, AuditLogSerializer
)
from .permissions import IsSelfOrAdmin, IsClaimOwnerOrCommittee, IsCommittee, IsAdmin
from .audit import log_claim_event

# ============================================================
#                MEMBERSHIP MANAGEMENT
# ============================================================

class MembershipTypeViewSet(viewsets.ModelViewSet):
    queryset = MembershipType.objects.all().order_by("name")
    serializer_class = MembershipTypeSerializer
    permission_classes = [permissions.IsAuthenticated, IsCommittee]


class MemberViewSet(viewsets.ModelViewSet):
    queryset = Member.objects.select_related("user", "membership_type").all()
    serializer_class = MemberSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ["list", "create", "destroy", "update", "partial_update"]:
            return [permissions.IsAuthenticated(), IsAdmin()]
        if self.action in ["retrieve"]:
            return [permissions.IsAuthenticated(), IsSelfOrAdmin()]
        return super().get_permissions()


# ============================================================
#                CLAIMS MANAGEMENT
# ============================================================

class ClaimViewSet(viewsets.ModelViewSet):
    queryset = Claim.objects.select_related(
        "member__user", "member__membership_type"
    ).prefetch_related("items", "attachments")
    serializer_class = ClaimSerializer
    permission_classes = [permissions.IsAuthenticated, IsClaimOwnerOrCommittee]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.is_superuser or user.groups.filter(name__in=["Admin", "Committee"]).exists():
            return qs
        return qs.filter(member__user=user)

    @transaction.atomic
    def perform_create(self, serializer):
        claim = serializer.save()
        if claim.status == "submitted" and claim.submitted_at is None:
            claim.submitted_at = timezone.now()
            claim.save(update_fields=["submitted_at"])
        claim.recalc_total()
        claim.compute_payable()

    @transaction.atomic
    def perform_update(self, serializer):
        claim = serializer.save()
        old_status = claim.status  # status after serializer.save()
        claim.recalc_total()
        claim.compute_payable()
    # Optional: no audit here unless you want to log edits explicitly

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated, IsCommittee])
    def set_status(self, request, pk=None):
        claim = self.get_object()
        status_val = request.data.get("status")
        if status_val not in dict(Claim.STATUS_CHOICES):
            return Response({"detail": "Invalid status."}, status=400)

        claim.status = status_val
        if status_val == "submitted" and not claim.submitted_at:
            claim.submitted_at = timezone.now()
        claim.save(update_fields=["status", "submitted_at"])
        claim.compute_payable()

        # 🧾 Audit: status change
        note = request.data.get("note")
        log_claim_event(
            claim=claim,
            actor=request.user,
            action=status_val,
            note=note,
            role=request.user.groups.values_list("name", flat=True).first()
                or ("admin" if request.user.is_superuser else "member"),
            meta={"claim_id": str(claim.id)}
        )

        return Response(ClaimSerializer(claim).data)
    
    @action(detail=True, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def audit(self, request, pk=None):
        claim = self.get_object()
        qs = AuditLog.objects.filter(meta__claim_id=str(claim.id)).order_by("created_at")
        data = AuditLogSerializer(qs, many=True).data
        return Response({"results": data})



# ============================================================
#                CLAIM ITEMS MANAGEMENT
# ============================================================

class ClaimItemViewSet(viewsets.ModelViewSet):
    queryset = ClaimItem.objects.select_related("claim", "claim__member__user")
    serializer_class = ClaimItemSerializer
    permission_classes = [permissions.IsAuthenticated, IsClaimOwnerOrCommittee]

    def perform_create(self, serializer):
        item = serializer.save()
        item.claim.recalc_total()
        item.claim.compute_payable()

    def perform_update(self, serializer):
        item = serializer.save()
        item.claim.recalc_total()
        item.claim.compute_payable()

    def perform_destroy(self, instance):
        claim = instance.claim
        instance.delete()
        claim.recalc_total()
        claim.compute_payable()


# ============================================================
#                CLAIM REVIEW PROCESS
# ============================================================

class ClaimReviewViewSet(viewsets.ModelViewSet):
    queryset = ClaimReview.objects.select_related("claim", "reviewer")
    serializer_class = ClaimReviewSerializer
    permission_classes = [permissions.IsAuthenticated, IsCommittee]

    def perform_create(self, serializer):
        review = serializer.save(reviewer=self.request.user)
        claim = review.claim
        if review.action == "approved":
            claim.status = "approved"
        elif review.action == "rejected":
            claim.status = "rejected"
        elif review.action == "paid":
            claim.status = "paid"
        elif review.action == "reviewed":
            claim.status = "reviewed"
        claim.save(update_fields=["status"])
        claim.compute_payable()


# ============================================================
#                CLAIM ATTACHMENTS
# ============================================================

class ClaimAttachmentViewSet(viewsets.ModelViewSet):
    queryset = ClaimAttachment.objects.select_related(
        "claim", "claim__member__user", "uploaded_by"
    )
    serializer_class = ClaimAttachmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsClaimOwnerOrCommittee]
    http_method_names = ["get", "post", "delete"]

    def perform_create(self, serializer):
        obj = serializer.save(uploaded_by=self.request.user)
        # 🧾 Audit: attachment uploaded
        log_claim_event(
            claim=obj.claim,
            actor=self.request.user,
            action="attachment_uploaded",
            note=obj.file.name if hasattr(obj.file, "name") else "Attachment uploaded",
            role=self.request.user.groups.values_list("name", flat=True).first()
                or ("admin" if self.request.user.is_superuser else "member"),
            meta={
                "attachment_id": str(obj.id),
                "content_type": obj.content_type,
                "file": obj.file.url if hasattr(obj.file, "url") else None
            }
        )



# ============================================================
#                CHRONIC ILLNESS REQUESTS
# ============================================================

class ChronicRequestViewSet(viewsets.ModelViewSet):
    queryset = ChronicRequest.objects.select_related("member__user").all()
    serializer_class = ChronicRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()
        if user.is_superuser or user.groups.filter(name__in=["Admin", "Committee"]).exists():
            return qs
        return qs.filter(member__user=user)

    def perform_create(self, serializer):
        serializer.save()

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated, IsCommittee])
    def set_status(self, request, pk=None):
        cr = self.get_object()
        st = request.data.get("status")
        if st not in {"pending", "approved", "rejected"}:
            return Response({"detail": "Invalid status"}, status=400)
        cr.status = st
        cr.save(update_fields=["status"])
        return Response(ChronicRequestSerializer(cr).data)


# ============================================================
#                NOTIFICATIONS
# ============================================================

class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user).order_by("-created_at")

    @action(detail=True, methods=["post"])
    def mark_read(self, request, pk=None):
        notif = self.get_object()
        notif.read = True
        notif.save(update_fields=["read"])
        return Response({"status": "marked"})


# ============================================================
#                SETTINGS & REIMBURSEMENT
# ============================================================

class SettingViewSet(viewsets.ModelViewSet):
    queryset = Setting.objects.all()
    serializer_class = SettingSerializer
    permission_classes = [permissions.IsAuthenticated, IsCommittee]


class ReimbursementScaleViewSet(viewsets.ModelViewSet):
    queryset = ReimbursementScale.objects.all().order_by("category")
    serializer_class = ReimbursementScaleSerializer
    permission_classes = [permissions.IsAuthenticated, IsCommittee]


# ============================================
#                REPORTS (placeholder)
# ============================================

class ReportViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        return Response({
            "message": "Reporting endpoints coming soon.",
            "available": []
        })



# ============================================================
#                USER & MEMBER INFO
# ============================================================

@ensure_csrf_cookie
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    """Return info about the logged-in user"""
    user = request.user
    try:
        groups = list(user.groups.values_list("name", flat=True))
    except Exception:
        groups = []

    return Response({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "full_name": f"{user.first_name} {user.last_name}".strip() or user.username,
        "role": groups[0] if groups else "member",
        "groups": groups,
        "is_superuser": user.is_superuser,
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_member(request):
    """
    Return the logged-in user's member profile.
    """
    try:
        member = Member.objects.get(user=request.user)
        serializer = MemberSerializer(member)
        return Response(serializer.data)
    except Member.DoesNotExist:
        return Response({"detail": "Member profile not found."}, status=404)
    

# ============================================================
# BENEFIT BALANCE ENDPOINT
# ============================================================


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def benefit_balance(request):
    """Return remaining annual benefit for logged-in member"""
    try:
        member = Member.objects.get(user=request.user)
    except Member.DoesNotExist:
        return Response({"detail": "Member not found"}, status=404)

    year_start = date.today().replace(month=1, day=1)
    year_end = date.today().replace(month=12, day=31)

    # Sum approved and paid claims within current year
    total_used = (
        Claim.objects.filter(
            member=member,
            status__in=["approved", "paid"],
            created_at__range=[year_start, year_end],
        )
        .aggregate(total=Sum("total_claimed"))
        .get("total")
        or 0
    )

    # Determine annual limit
    critical_topup = 200000 if member.claims.filter(status="approved", claim_type="inpatient", total_claimed__gte=200000).exists() else 0
    annual_limit = 250000 + critical_topup
    remaining = max(0, annual_limit - total_used)

    return Response({
        "annual_limit": annual_limit,
        "total_used": total_used,
        "remaining_balance": remaining,
        "as_of": date.today(),
    })


@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    """JSON-based login endpoint for frontend."""
    username = request.data.get("username")
    password = request.data.get("password")

    if not username or not password:
        return Response(
            {"detail": "Username and password are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    from django.contrib.auth import authenticate, get_user_model
    from django.utils import timezone
    from medical.models import MembershipType, Member

    User = get_user_model()

    # ✅ Try both username and email
    user = authenticate(request, username=username, password=password)
    if user is None:
        try:
            user_obj = User.objects.get(email=username)
            user = authenticate(request, username=user_obj.username, password=password)
        except User.DoesNotExist:
            user = None

    if user is not None:
        # ✅ Log the user in
        login(request, user)

        # ✅ Auto-create Member profile if missing
        member, created = Member.objects.get_or_create(
            user=user,
            defaults={
                "membership_type": MembershipType.objects.first(),  # fallback to first type
                "nhif_number": "PENDING",
                "valid_from": timezone.now().date(),
                "valid_to": timezone.now().date() + timezone.timedelta(days=365),
            },
        )

        if created:
            print(f"🟢 Auto-created Member profile for {user.username}")

        return Response({"detail": "Login successful."}, status=status.HTTP_200_OK)

    # ❌ Invalid credentials
    return Response(
        {"detail": "Invalid username or password."},
        status=status.HTTP_401_UNAUTHORIZED,
    )


@csrf_exempt  # <-- this must be directly on top and no DRF decorator above
def logout_view(request):
    """Logs out the user and reissues CSRF cookie manually (CSRF bypass)."""
    if request.method != "POST":
        return JsonResponse({"detail": "Method not allowed"}, status=405)

    logout(request)
    new_token = get_token(request)
    response = JsonResponse({"detail": "Logged out successfully."})
    response.set_cookie(
        "csrftoken",
        new_token,
        httponly=False,
        secure=False,
        samesite=None,
    )
    return response


# ============================================================
#                CSRF TOKEN ISSUER
# ============================================================


@ensure_csrf_cookie
@api_view(["GET"])
@permission_classes([AllowAny])
def get_csrf_token(request):
    return JsonResponse({'csrfToken': 'set'})

@api_view(["GET"])
@permission_classes([AllowAny])
def csrf_cookie(request):
    token = get_token(request)
    response = Response({"csrfToken": token})
    response.set_cookie(
        key="csrftoken",
        value=token,
        httponly=False,
        secure=False,
        samesite=None,
    )
    return response

# ============================================================
#                USER REGISTRATION
# ============================================================

@api_view(["POST"])
@permission_classes([AllowAny])
def register_view(request):
    """
    Register a new user (auto-assigns Member group and creates Member record)
    JSON body: { "username": "", "email": "", "password": "", "first_name": "", "last_name": "" }
    """
    username = request.data.get("username")
    email = request.data.get("email")
    password = request.data.get("password")
    first_name = request.data.get("first_name", "")
    last_name = request.data.get("last_name", "")

    if not username or not password or not email:
        return Response({"detail": "Username, email, and password are required."}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({"detail": "Username already exists."}, status=status.HTTP_400_BAD_REQUEST)
    if User.objects.filter(email=email).exists():
        return Response({"detail": "Email already registered."}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name,
    )

    # assign default "Member" group
    member_group, _ = Group.objects.get_or_create(name="Member")
    user.groups.add(member_group)

    # create linked Member record
    single_type, _ = MembershipType.objects.get_or_create(
        key="single",
        defaults={"name": "Single", "annual_limit": 250000, "fund_share_percent": 80},
    )

    Member.objects.create(
        user=user,
        membership_type=single_type,
        nhif_number="PENDING",
        valid_from=timezone.now().date(),
        valid_to=timezone.now().date() + timezone.timedelta(days=365),
    )

    return Response(
        {"detail": "Registration successful.", "username": username, "email": email},
        status=status.HTTP_201_CREATED,
    )


# Committee: list all claims
@api_view(["GET"])
@permission_classes([IsAuthenticated, IsCommittee])
def committee_claims(request):
    """
    List claims for committee with optional filters:
    ?status=submitted|reviewed|approved|rejected|paid
    ?type=outpatient|inpatient
    ?q=<member name or username or nhif>
    """
    status_f = request.GET.get("status")
    type_f = request.GET.get("type")
    q = request.GET.get("q")

    qs = Claim.objects.select_related(
        "member__user", "member__membership_type"
    ).order_by("-created_at")

    if status_f:
        qs = qs.filter(status=status_f)
    if type_f:
        qs = qs.filter(claim_type=type_f)
    if q:
        qs = qs.filter(
            Q(member__user__username__icontains=q) |
            Q(member__user__first_name__icontains=q) |
            Q(member__user__last_name__icontains=q) |
            Q(nhif_number__icontains=q)
        )

    data = []
    for c in qs[:300]:  # soft cap page for now
        data.append({
            "id": str(c.id),
            "member_name": f"{c.member.user.first_name} {c.member.user.last_name}".strip() or c.member.user.username,
            "membership_type": c.member.membership_type.name if c.member.membership_type else None,
            "claim_type": c.claim_type,
            "status": c.status,
            "total_claimed": str(c.total_claimed),
            "total_payable": str(c.total_payable),
            "member_payable": str(c.member_payable),
            "created_at": c.created_at,
            "submitted_at": c.submitted_at,
        })
    return Response({"results": data})


# Committee: change claim status
@api_view(["POST"])
@permission_classes([IsAuthenticated, IsCommittee])
def set_claim_status(request, claim_id):
    try:
        claim = Claim.objects.get(id=claim_id)
    except Claim.DoesNotExist:
        return Response({"detail": "Claim not found."}, status=404)

    new_status = request.data.get("status")
    if new_status not in dict(Claim.STATUS_CHOICES):
        return Response({"detail": "Invalid status."}, status=400)

    claim.status = new_status
    claim.save(update_fields=["status"])
    return Response({"detail": f"Claim marked as {new_status}."})


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsCommittee])
def committee_claim_detail(request, pk):
    """
    Detailed claim view for modal: items, attachments, computed totals, dates.
    """
    try:
        c = Claim.objects.select_related(
            "member__user", "member__membership_type"
        ).prefetch_related("items", "attachments").get(pk=pk)
    except Claim.DoesNotExist:
        return Response({"detail": "Not found."}, status=404)

    items = [{
        "id": str(i.id),
        "category": i.category,
        "description": i.description,
        "amount": str(i.amount),
        "quantity": i.quantity,
        "line_total": str(i.amount * i.quantity),
    } for i in c.items.all()]

    atts = [{
        "id": str(a.id),
        "file": a.file.url if a.file else None,
        "content_type": a.content_type,
        "uploaded_at": a.uploaded_at,
        "uploaded_by": a.uploaded_by.username if a.uploaded_by else None,
    } for a in c.attachments.all()]

    data = {
        "id": str(c.id),
        "member": {
            "name": f"{c.member.user.first_name} {c.member.user.last_name}".strip() or c.member.user.username,
            "username": c.member.user.username,
            "email": c.member.user.email,
            "membership_type": c.member.membership_type.name if c.member.membership_type else None,
            "nhif_number": c.nhif_number or c.member.nhif_number,
        },
        "claim": {
            "type": c.claim_type,
            "status": c.status,
            "notes": c.notes,
            "date_of_first_visit": c.date_of_first_visit,
            "date_of_discharge": c.date_of_discharge,
            "total_claimed": str(c.total_claimed),
            "total_payable": str(c.total_payable),
            "member_payable": str(c.member_payable),
            "override_amount": str(c.override_amount) if c.override_amount is not None else None,
            "submitted_at": c.submitted_at,
            "created_at": c.created_at,
        },
        "items": items,
        "attachments": atts,
    }
    return Response(data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_committee_claim_detail(request, pk):
    claim = get_object_or_404(Claim, pk=pk)
    serializer = ClaimSerializer(claim)
    reviews = ClaimReviewSerializer(claim.reviews.all(), many=True).data
    data = serializer.data
    data["reviews"] = reviews
    return Response(data)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def upload_summary_pdf(request, claim_id):
    """
    Receives generated PDF summary for a claim and stores it as ClaimAttachment.
    """
    try:
        claim = Claim.objects.get(id=claim_id, member__user=request.user)
    except Claim.DoesNotExist:
        return Response({"detail": "Claim not found."}, status=404)

    file = request.FILES.get("file")
    if not file:
        return Response({"detail": "No file uploaded."}, status=400)

    ClaimAttachment.objects.create(
        claim=claim,
        file=file,
        content_type="application/pdf",
        uploaded_by=request.user,
    )
    return Response({"detail": "PDF uploaded successfully."}, status=status.HTTP_201_CREATED)


@transaction.atomic
def perform_create(self, serializer):
    claim = serializer.save()
    if claim.status == "submitted" and claim.submitted_at is None:
        claim.submitted_at = timezone.now()
        claim.save(update_fields=["submitted_at"])
    claim.recalc_total()
    claim.compute_payable()

    # 🧾 Audit: claim created / submitted
    action = "submitted" if claim.status == "submitted" else "created"
    log_claim_event(
        claim=claim,
        actor=self.request.user if self.request.user.is_authenticated else None,
        action=action,
        note="Claim created by member" if action == "created" else "Claim submitted by member",
        role=None,
        meta={"claim_id": str(claim.id), "status": claim.status}
    )
