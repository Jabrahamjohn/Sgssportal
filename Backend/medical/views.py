# Backend/medical/views.py
from django.contrib.auth import authenticate, login, logout, get_user_model
from django.contrib.auth.models import Group
from django.db import transaction, models, connection
from django.db.models import Q, Sum, Count
from django.db.models.functions import TruncMonth
from django.http import JsonResponse, HttpResponse
from django.middleware.csrf import get_token
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from datetime import date

from .models import (
    Member, MembershipType, MemberDependent,
    Claim, ClaimItem, ClaimReview, AuditLog,
    Notification, ReimbursementScale, Setting,
    ChronicRequest, ClaimAttachment,
)
from .serializers import (
    MemberSerializer, MembershipTypeSerializer, ClaimSerializer, ClaimItemSerializer,
    ClaimReviewSerializer, NotificationSerializer, ReimbursementScaleSerializer,
    SettingSerializer, ChronicRequestSerializer, ClaimAttachmentSerializer,
    AuditLogSerializer, MemberDependentSerializer, AdminUserSerializer
)
from .permissions import IsSelfOrAdmin, IsClaimOwnerOrCommittee, IsCommittee, IsAdmin
from .audit import log_claim_event

User = get_user_model()

# ============================================================
#                MEMBERSHIP MANAGEMENT
# ============================================================

class MembershipTypeViewSet(viewsets.ModelViewSet):
    queryset = MembershipType.objects.all().order_by("name")
    serializer_class = MembershipTypeSerializer
    permission_classes = [permissions.IsAuthenticated, IsCommittee]


class MemberViewSet(viewsets.ModelViewSet):
    """
    Core member management.

    - Committee/Admin:
        * list members
        * filter by ?status=pending|active|...
        * approve membership via /members/<id>/approve/
    - Normal members:
        * can only see their own record (retrieve)
    """
    queryset = Member.objects.select_related("user", "membership_type").all()
    serializer_class = MemberSerializer
    permission_classes = [permissions.IsAuthenticated]
    

    def get_permissions(self):
        # Committee/Admin can list + modify
        if self.action in ["list", "update", "partial_update", "destroy", "approve"]:
            return [permissions.IsAuthenticated(), IsCommittee()]
        # Members can view their own profile
        if self.action in ["retrieve"]:
            return [permissions.IsAuthenticated(), IsSelfOrAdmin()]
        return super().get_permissions()

    def get_queryset(self):
        qs = super().get_queryset()

        # For Swagger fake view
        if getattr(self, "swagger_fake_view", False):
            return qs.none()

        user = self.request.user

        # Committee / Admin see all, with optional ?status filter
        if user.is_superuser or user.groups.filter(name__in=["Admin", "Committee"]).exists():
            status_f = self.request.GET.get("status")
            if status_f:
                qs = qs.filter(status=status_f)
            return qs

        # Normal member sees only own record
        return qs.filter(user=user)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated, IsCommittee])
    def approve(self, request, pk=None):
        member = self.get_object()

        from medical.services.membership import approve_member
        member = approve_member(member)

        return Response(MemberSerializer(member).data)
    
    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated, IsCommittee])
    def reject(self, request, pk=None):
        member = self.get_object()

        reason = request.data.get("reason", "")
        from medical.services.membership import reject_member
        member = reject_member(member, reason)

        # Send rejection email
        try:
            from .email_notifications import send_application_rejected_email
            send_application_rejected_email(member)
        except Exception as e:
            print(f"Error sending rejection email: {e}")

        return Response(MemberSerializer(member).data)
    
    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated, IsCommittee])
    def revoke(self, request, pk=None):
        """Revoke an approved/active membership"""
        member = self.get_object()
        
        if member.status not in ['approved', 'active']:
            return Response(
                {"detail": "Only approved/active memberships can be revoked."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        reason = request.data.get("reason", "")
        member.status = 'inactive'
        member.save()
        
        # Log the revocation
        AuditLog.objects.create(
            actor=request.user,
            action=f"membership:REVOKED",
            meta={"member_id": member.id, "reason": reason}
        )
        
        # Notify member
        _notify =lambda recipient, title, message, link=None, type_="system": (
            Notification.objects.create(
                recipient=recipient, title=title, message=message,
                link=link, type=type_, actor=request.user
            )
        )
        _notify(
            member.user,
            "Membership Revoked",
            f"Your membership has been revoked. {reason}",
            "/dashboard/member",
            "member"
        )
        
        return Response(MemberSerializer(member).data)



@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_member_rules(request):
    try:
        member = Member.objects.select_related("membership_type").get(user=request.user)
    except Member.DoesNotExist:
        return Response({"detail": "Member not found"}, status=404)

    mt = member.membership_type
    annual_limit = getattr(mt, "annual_limit", None)
    fund_share = getattr(mt, "fund_share_percent", 80)

    data = {
      "status": member.status,
      "benefits_from": member.benefits_from,
      "valid_from": getattr(member, "valid_from", None),
      "valid_to": getattr(member, "valid_to", None),
      "annual_limit": annual_limit,
      "fund_share_percent": fund_share,
      "waiting_period_days": 60,
      "claim_window_days": 90,
    }
    return Response(data)


# ============================================================
#   MEMBER PROFILE & DEPENDANTS
# ============================================================

@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def my_member_profile(request):
    """
    GET  -> full member profile + dependants
    PATCH -> update editable profile fields (not membership_type, status, etc.)
    """
    try:
        member = Member.objects.get(user=request.user)
    except Member.DoesNotExist:
        return Response({"detail": "Member profile not found."}, status=404)

    if request.method == "GET":
        return Response(MemberSerializer(member).data)

    # PATCH
    serializer = MemberSerializer(member, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def my_dependants(request):
    """
    GET -> list logged-in member dependants
    POST -> create dependant for logged-in member
    """
    try:
        member = Member.objects.get(user=request.user)
    except Member.DoesNotExist:
        return Response({"detail": "Member profile not found."}, status=404)

    if request.method == "GET":
        deps = member.dependants.all()
        return Response(MemberDependentSerializer(deps, many=True).data)

    # POST
    payload = request.data.copy()
    payload["member"] = str(member.id)
    serializer = MemberDependentSerializer(data=payload)
    if serializer.is_valid():
        serializer.save(member=member)
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)



@api_view(["PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def dependant_detail(request, pk):
    """
    PATCH/DELETE a dependant belonging to the logged-in member.
    """
    try:
        dep = MemberDependent.objects.get(id=pk, member__user=request.user)
    except MemberDependent.DoesNotExist:
        return Response({"detail": "Not found."}, status=404)

    if request.method == "DELETE":
        dep.delete()
        return Response(status=204)

    serializer = MemberDependentSerializer(dep, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)

@api_view(["PUT", "PATCH"])
@permission_classes([IsAuthenticated])
def update_my_member(request):
    """Update editable fields of member profile."""
    try:
        member = Member.objects.get(user=request.user)
    except Member.DoesNotExist:
        return Response({"detail": "Member not found"}, status=404)

    allowed_fields = [
        "mailing_address",
        "phone_office",
        "phone_home",
        "phone_mobile",
        "phone_fax",
        "family_doctor_name",
        "family_doctor_phone_office",
        "family_doctor_phone_home",
        "family_doctor_phone_mobile",
        "family_doctor_phone_fax",
        "shif_number",
        "other_medical_scheme",
    ]

    for field in allowed_fields:
        if field in request.data:
            setattr(member, field, request.data[field])

    member.save()
    return Response(MemberSerializer(member).data)



@api_view(["GET"])
@permission_classes([IsAuthenticated])
def member_rules(request):
    user = request.user

    try:
        member = Member.objects.get(user=user)
    except Member.DoesNotExist:
        return Response({
            "can_submit": False,
            "errors": ["You are not registered as a member."]
        }, status=400)

    today = timezone.now().date()
    messages = []
    can_submit = True

    # 1️⃣ STATUS CHECK
    if member.status != "active":
        can_submit = False
        messages.append("Your membership is not active.")

    # 2️⃣ VALIDITY DATE CHECK
    if member.valid_from and member.valid_from > today:
        can_submit = False
        messages.append("Your coverage has not started yet.")

    if member.valid_to and member.valid_to < today:
        can_submit = False
        messages.append("Your coverage period has expired.")

    # 3️⃣ WAITING PERIOD CHECK (default 30 days)
    waiting_days = 30
    if member.created_at and (today - member.created_at).days < waiting_days:
        remaining = waiting_days - (today - member.created_at).days
        can_submit = False
        messages.append(f"Waiting period in effect. {remaining} days remaining.")

    # 4️⃣ BENEFIT LIMIT CHECK
    # Total claims PAID this year
    year_start = today.replace(month=1, day=1)
    total_paid = Claim.objects.filter(
        member=member,
        status="approved",
        paid_amount__isnull=False,
        created_at__date__gte=year_start
    ).aggregate(total=models.Sum("paid_amount"))["total"] or 0

    annual_limit = 250000

    # Extra 200k if critical illness flag exists
    if hasattr(member, "critical_illness") and member.critical_illness:
        annual_limit += 200000

    remaining_balance = annual_limit - total_paid

    if remaining_balance <= 0:
        can_submit = False
        messages.append("You have exhausted your annual medical benefit limit.")

    return Response({
        "can_submit": can_submit,
        "messages": messages,
        "status": member.status,
        "valid_from": member.valid_from,
        "valid_to": member.valid_to,
        "annual_limit": annual_limit,
        "used_amount": total_paid,
        "remaining_balance": remaining_balance,
        "waiting_period_days": waiting_days,
    })

# ============================================================
#                CLAIMS MANAGEMENT
class ClaimViewSet(viewsets.ModelViewSet):
    queryset = Claim.objects.select_related(
        "member__user", "member__membership_type"
    ).prefetch_related("items", "attachments")
    serializer_class = ClaimSerializer
    permission_classes = [permissions.IsAuthenticated, IsClaimOwnerOrCommittee]

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user

        # Fixed Swagger issue
        if getattr(self, 'swagger_fake_view', False):
            return qs.none()

        if user.is_superuser or user.groups.filter(name__in=["Admin", "Committee"]).exists():
            return qs
        return qs.filter(member__user=user)

    @transaction.atomic
    def perform_create(self, serializer):
        # 1. Save claim first (signals will handle 'created' notifications if status=submitted)
        claim = serializer.save()
        
        # 2. Validation (if fails, atomic transaction rolls back)
        from medical.services.rules import validate_claim_before_submit
        validate_claim_before_submit(claim)

        # 3. Enforce submission timestamp if submitted
        if claim.status == "submitted" and claim.submitted_at is None:
            claim.submitted_at = timezone.now()
            claim.save(update_fields=["submitted_at"])

        # 4. Compute totals
        claim.recalc_total()
        claim.compute_payable()

        # 5. Audit trail
        action = "submitted" if claim.status == "submitted" else "created"
        log_claim_event(
            claim=claim,
            actor=self.request.user,
            action=action,
            note="Claim submitted" if action == "submitted" else "Claim created",
            role=self.request.user.groups.values_list("name", flat=True).first(),
            meta={"claim_id": str(claim.id)}
        )

    @transaction.atomic
    def perform_update(self, serializer):
        claim = serializer.save()
        claim.recalc_total()
        claim.compute_payable()

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated, IsCommittee])
    def set_status(self, request, pk=None):
        claim = self.get_object()
        status_val = request.data.get("status")
        if status_val not in dict(Claim.STATUS_CHOICES):
            return Response({"detail": "Invalid status."}, status=400)

        claim.status = status_val
        if status_val == "submitted" and not claim.submitted_at:
            claim.submitted_at = timezone.now()
        
        # Attach note for signal to pick up
        note = request.data.get("note")
        if note:
            claim.status_note = note
            
        claim.save(update_fields=["status", "submitted_at"])
        claim.compute_payable()

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
    
    @action(detail=True, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def reviews(self, request, pk=None):
        """
        Get all reviews for a claim (visible to claim owner and committee).
        Shows committee review messages, actions, and notes.
        """
        claim = self.get_object()
        reviews_qs = ClaimReview.objects.filter(claim=claim).select_related('reviewer').order_by('-created_at')
        data = ClaimReviewSerializer(reviews_qs, many=True).data
        return Response({"results": data})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def upload_summary_pdf(request, claim_id):
    """
    Called by the frontend after claim submission to upload a generated PDF summary.
    """
    claim = get_object_or_404(Claim, id=claim_id)

    # Verify ownership or committee status
    user = request.user
    is_committee = user.groups.filter(name__in=["Admin", "Committee"]).exists() or user.is_superuser
    if not is_committee and claim.member.user != user:
        return Response({"detail": "Permission denied."}, status=403)

    file_obj = request.FILES.get("file")
    if not file_obj:
        return Response({"detail": "No file uploaded."}, status=400)

    # Save as ClaimAttachment
    attachment = ClaimAttachment.objects.create(
        claim=claim,
        uploaded_by=user,
        file=file_obj,
        content_type="application/pdf"
    )

    return Response({
        "id": str(attachment.id),
        "message": "Summary PDF uploaded successfully"
    }, status=status.HTTP_201_CREATED)


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

    def enforce_annual_limit(claim):
        member = claim.member
        year = timezone.now().year
        
        spent = Claim.objects.filter(
            member=member,
            status__in=["approved", "paid"],
            created_at__year=year
        ).aggregate(Sum("total_payable"))["total_payable__sum"] or 0

        limit = member.membership_type.annual_limit or 250000

        if (spent + claim.total_payable) > limit:
            raise ValidationError("Annual limit exceeded.")



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
        from medical.services.rules import enforce_annual_limit
        enforce_annual_limit(claim)

        if review.action == "approved":
            claim.status = "approved"
        elif review.action == "rejected":
            claim.status = "rejected"
        elif review.action == "paid":
            claim.status = "paid"
            # Trigger Payout
            try:
                from medical.services.payments import PaymentService
                PaymentService.process_payout(claim)
            except Exception as e:
                # Log error but don't fail the review transaction for now
                print(f"Payment Error: {e}")

        elif review.action == "reviewed":
            claim.status = "reviewed"

        claim.save(update_fields=["status"])
        claim.compute_payable()

        role = (
            self.request.user.groups.values_list("name", flat=True).first()
            or ("admin" if self.request.user.is_superuser else "member")
        )

        log_claim_event(
            claim=claim,
            actor=self.request.user,
            action=f"review:{review.action}",
            note=review.note,
            role=role,
            meta={"review_id": str(review.id)},
        )


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
        qs = super().get_queryset()
        user = self.request.user

        if getattr(self, 'swagger_fake_view', False):
            return qs.none()

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
    queryset = Notification.objects.all().order_by("-created_at")

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Notification.objects.none()
        return Notification.objects.filter(
            recipient=self.request.user
        ).order_by('-created_at')

    @action(detail=True, methods=["post"])
    def mark_read(self, request, pk=None):
        notif = self.get_object()
        notif.read = True
        notif.save(update_fields=["read"])
        return Response({"ok": True, "id": str(notif.id)})

    @action(detail=False, methods=["post"])
    def mark_all_read(self, request):
        Notification.objects.filter(
            recipient=request.user,
            read=False
        ).update(read=True)
        return Response({"ok": True})


def notify(user, title, message, link=None, typ="system", actor=None, metadata=None):
    Notification.objects.create(
        recipient=user,
        title=title,
        message=message,
        link=link,
        type=typ,
        actor=actor,
        metadata=metadata or {},
    )

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def mark_notifications_read(request):
    Notification.objects.filter(recipient=request.user, read=False).update(read=True)
    return Response({"ok": True, "message": "All notifications marked as read"})

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def unread_notifications_count(request):
    count = Notification.objects.filter(recipient=request.user, read=False).count()
    return Response({"unread": count})


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

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    """Return info about the logged-in user to frontend"""
    user = request.user
    try:
        groups = list(user.groups.values_list("name", flat=True))
    except Exception:
        groups = []

    groups_normalized = [g.lower() for g in groups]

    if user.is_superuser:
        role = "admin"
    elif "committee" in groups_normalized:
        role = "committee"
    elif "member" in groups_normalized:
        role = "member"
    else:
        role = "member"

    return Response({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "full_name": f"{user.first_name} {user.last_name}".strip() or user.username,
        "role": role,
        "groups": groups_normalized,
        "is_superuser": user.is_superuser,
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_member(request):
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
    try:
        member = Member.objects.get(user=request.user)
    except Member.DoesNotExist:
        return Response({"detail": "Member not found"}, status=404)

    year_start = date.today().replace(month=1, day=1)
    year_end = date.today().replace(month=12, day=31)

    total_used = (
        Claim.objects.filter(
            member=member,
            status__in=["approved", "paid"],
            created_at__range=[year_start, year_end],
        )
        .aggregate(total=Sum("total_payable"))
        .get("total")
        or 0
    )

    critical_topup = 200000 if member.claims.filter(
        status="approved",
        claim_type="inpatient",
        total_claimed__gte=200000
    ).exists() else 0

    annual_limit = 250000 + critical_topup
    remaining = max(0, annual_limit - total_used)

    return Response({
        "annual_limit": annual_limit,
        "total_used": total_used,
        "remaining_balance": remaining,
        "as_of": date.today(),
    })


# ============================================================
#                AUTH: LOGIN / LOGOUT / CSRF
# ============================================================

@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    """
    Secure login using Django session auth.
    Supports username or email.
    Auto-generates basic Member if missing (legacy).
    """
    username = request.data.get("username")
    password = request.data.get("password")

    if not username or not password:
        return Response(
            {"detail": "Username and password are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = authenticate(request, username=username, password=password)
    if user is None:
        try:
            user_obj = User.objects.get(email=username)
            user = authenticate(request, username=user_obj.username, password=password)
        except User.DoesNotExist:
            user = None

    if user is None:
        return Response(
            {"detail": "Invalid username or password."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    login(request, user)

    member_group, _ = Group.objects.get_or_create(name="Member")
    if not user.groups.exists():
        user.groups.add(member_group)

    Member.objects.get_or_create(
        user=user,
        defaults={
            "membership_type": MembershipType.objects.first(),
            "shif_number": "PENDING",
            "valid_from": timezone.now().date(),
            "valid_to": timezone.now().date() + timezone.timedelta(days=365),
            "status": "active",
            "benefits_from": timezone.now().date(),  # legacy
        },
    )

    return Response({"detail": "Login successful."})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request):
    logout(request)

    new_token = get_token(request)

    response = JsonResponse({"detail": "Logged out successfully."})
    response.set_cookie(
        key="csrftoken",
        value=new_token,
        httponly=False,
        secure=False,
        samesite="Lax",
    )
    return response


@api_view(["GET"])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def csrf_cookie(request):
    from django.middleware.csrf import get_token
    return JsonResponse({"detail": "CSRF cookie set", "csrfToken": get_token(request)})


@api_view(["GET"])
@permission_classes([AllowAny])
def health_check(request):
    """
    Health check endpoint for monitoring and load balancers.
    Returns 200 OK if the service is running and can connect to the database.
    """
    try:
        # Test database connectivity
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        return JsonResponse({
            "status": "healthy",
            "timestamp": timezone.now().isoformat(),
            "database": "connected"
        })
    except Exception as e:
        return JsonResponse({
            "status": "unhealthy",
            "timestamp": timezone.now().isoformat(),
            "database": "disconnected",
            "error": str(e)
        }, status=503)


# ============================================================
#                PUBLIC REGISTRATION
# ============================================================

@api_view(["POST"])
@permission_classes([AllowAny])
def register_view(request):
    """
    Public registration endpoint.

    JSON body:
    {
      "username": "",
      "email": "",
      "password": "",
      "first_name": "",
      "last_name": "",
      "membership_type": "single" | "family" | "joint" | "life" | "patron" | "vice_patron" | "senior",
      "mailing_address": "",
      "phone_office": "",
      "phone_home": "",
      "phone_fax": "",
      "phone_mobile": "",
      "family_doctor_name": "",
      "family_doctor_phone_office": "",
      "family_doctor_phone_home": "",
      "family_doctor_phone_fax": "",
      "family_doctor_phone_mobile": "",
      "shif_number": "",
      "other_medical_scheme": "",
      "dependants": [
        {
          "full_name": "",
          "date_of_birth": "YYYY-MM-DD",
          "blood_group": "",
          "id_number": ""
        }
      ]
    }
    """

    data = request.data
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")
    first_name = data.get("first_name", "")
    last_name = data.get("last_name", "")

    if not username or not password or not email:
        return Response(
            {"detail": "Username, email, and password are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if User.objects.filter(username=username).exists():
        return Response({"detail": "Username already exists."}, status=status.HTTP_400_BAD_REQUEST)
    if User.objects.filter(email=email).exists():
        return Response({"detail": "Email already registered."}, status=status.HTTP_400_BAD_REQUEST)

    # 1️⃣ Create User
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name,
    )

    member_group, _ = Group.objects.get_or_create(name="Member")
    user.groups.add(member_group)

    # 2️⃣ Membership Type
    mt_key = data.get("membership_type") or "single"
    try:
        mt = MembershipType.objects.get(key=mt_key)
    except MembershipType.DoesNotExist:
        mt = MembershipType.objects.get(key="single")

    today = timezone.now().date()

    # 3️⃣ Create Member in PENDING status (committee must approve)
    member = Member.objects.create(
        user=user,
        membership_type=mt,
        mailing_address=data.get("mailing_address", ""),
        phone_office=data.get("phone_office", ""),
        phone_home=data.get("phone_home", ""),
        phone_fax=data.get("phone_fax", ""),
        phone_mobile=data.get("phone_mobile", ""),
        family_doctor_name=data.get("family_doctor_name", ""),
        family_doctor_phone_office=data.get("family_doctor_phone_office", ""),
        family_doctor_phone_home=data.get("family_doctor_phone_home", ""),
        family_doctor_phone_fax=data.get("family_doctor_phone_fax", ""),
        family_doctor_phone_mobile=data.get("family_doctor_phone_mobile", ""),
        shif_number=data.get("shif_number", "") or "PENDING",
        other_medical_scheme=data.get("other_medical_scheme", ""),
        status="pending",
        valid_from=None,
        valid_to=None,
        benefits_from=today + timezone.timedelta(days=60),
    )

    # 4️⃣ Optional dependants
    dependants = data.get("dependants") or []
    for d in dependants:
        MemberDependent.objects.create(
            member=member,
            full_name=d.get("full_name", ""),
            date_of_birth=d.get("date_of_birth") or None,
            blood_group=d.get("blood_group", ""),
            id_number=d.get("id_number", ""),
        )

    # Notification handled by post_save signal on Member

    return Response(
        {
            "detail": "Registration submitted successfully. Pending committee approval.",
            "username": username,
            "email": email,
        },
        status=status.HTTP_201_CREATED,
    )


# ============================================================
#                COMMITTEE CLAIM LIST & DETAIL
# ============================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated, IsCommittee])
def committee_claims(request):
    """
    List claims for committee with optional filters:
    ?status=submitted|reviewed|approved|rejected|paid
    ?type=outpatient|inpatient|chronic
    ?q=<member name or username or shif/sha>
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
            Q(shif_number__icontains=q)
        )

    data = []
    for c in qs[:300]:
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


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsCommittee])
def committee_claim_detail(request, pk):
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
            "shif_number": c.shif_number or c.member.shif_number,
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


# ============================================================
#                SUMMARY EXPORTS & ADMIN DASHBOARD
# ============================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated, IsCommittee])
def export_claims_csv(request):
    qs = Claim.objects.all().order_by("-created_at")

    response = HttpResponse(content_type="text/csv")
    response["Content-Disposition"] = 'attachment; filename="sgss_claims.csv"'

    import csv
    writer = csv.writer(response)
    writer.writerow([
        "ID", "Member", "Type", "Total Claimed",
        "Total Payable", "Member Payable", "Status", "Created"
    ])

    for c in qs:
        writer.writerow([
            str(c.id),
            c.member.user.get_full_name(),
            c.claim_type,
            c.total_claimed,
            c.total_payable,
            c.member_payable,
            c.status,
            c.created_at,
        ])

    return response


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_users_list(request):
    """
    List all users with groups/roles.
    Optional filters: ?q=<search>&role=admin|committee|member
    """
    qs = User.objects.all().order_by("username")

    q = request.GET.get("q")
    if q:
        qs = qs.filter(
            Q(username__icontains=q)
            | Q(first_name__icontains=q)
            | Q(last_name__icontains=q)
            | Q(email__icontains=q)
        )

    role = request.GET.get("role")
    if role:
        role = role.lower()
        if role == "admin":
            qs = qs.filter(Q(is_superuser=True) | Q(groups__name="Admin"))
        elif role == "committee":
            qs = qs.filter(groups__name="Committee")
        elif role == "member":
            qs = qs.filter(groups__name="Member")

    qs = qs.distinct()
    data = AdminUserSerializer(qs, many=True).data
    return Response({"results": data})


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_update_user_roles(request, user_id):
    """
    Body:
    {
      "make_admin": true|false,
      "make_committee": true|false,
      "make_member": true|false
    }
    """
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"detail": "User not found"}, status=404)

    make_admin = bool(request.data.get("make_admin"))
    make_committee = bool(request.data.get("make_committee"))
    make_member = bool(request.data.get("make_member"))

    admin_group, _ = Group.objects.get_or_create(name="Admin")
    committee_group, _ = Group.objects.get_or_create(name="Committee")
    member_group, _ = Group.objects.get_or_create(name="Member")

    # Admin flag & group
    if make_admin:
        user.is_staff = True
        user.is_superuser = True
        user.groups.add(admin_group)
    else:
        user.groups.remove(admin_group)

    # Committee
    if make_committee:
        user.groups.add(committee_group)
    else:
        user.groups.remove(committee_group)

    # Member
    if make_member:
        user.groups.add(member_group)
    else:
        user.groups.remove(member_group)

    user.save()
    return Response(AdminUserSerializer(user).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_toggle_user_active(request, user_id):
    """
    Toggle a user's active flag.
    Body: { "is_active": true|false }
    """
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"detail": "User not found"}, status=404)

    is_active = request.data.get("is_active")
    if is_active is None:
        return Response({"detail": "is_active required"}, status=400)

    user.is_active = bool(is_active)
    user.save()
    return Response(AdminUserSerializer(user).data)



@api_view(["POST"])
@permission_classes([IsAuthenticated, IsCommittee])
def bulk_change_status(request):
    ids = request.data.get("ids", [])
    status_val = request.data.get("status")

    if status_val not in dict(Claim.STATUS_CHOICES):
        return Response({"detail": "Invalid status."}, status=400)

    Claim.objects.filter(id__in=ids).update(status=status_val)
    return Response({"detail": "Bulk update complete."})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def member_dashboard_info(request):
    member = Member.objects.filter(user=request.user).first()

    if not member:
        return Response({"detail": "Member profile not found"}, status=404)

    claim_counts = (
        Claim.objects.filter(member=member)
        .values("status")
        .annotate(count=Count("id"))
    )
    counts = {c["status"]: c["count"] for c in claim_counts}

    return Response({
        "full_name": request.user.get_full_name(),
        "email": request.user.email,
        "membership_type": member.membership_type.name if member.membership_type else None,
        "membership_no": str(member.id),
        "shif_number": member.shif_number,
        "valid_from": member.valid_from,
        "valid_to": member.valid_to,
        "status": member.status,
        "benefits_from": member.benefits_from,
        "claim_counts": counts,
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def committee_dashboard_info(request):
    if not (
        request.user.groups.filter(name="Committee").exists()
        or request.user.is_superuser
    ):
        return Response({"detail": "Not committee"}, status=403)

    member = Member.objects.filter(user=request.user).first()
    today = timezone.now().date()
    pending = Claim.objects.filter(status="submitted").count()
    today_new = Claim.objects.filter(created_at__date=today).count()
    reviewed = Claim.objects.filter(status="reviewed").count()

    return Response({
        "full_name": request.user.get_full_name(),
        "email": request.user.email,
        "role": "Committee",
        "membership_no": str(member.id) if member else None,
        "shif_number": member.shif_number if member else None,
        "membership_type": member.membership_type.name if member and member.membership_type else None,
        "pending_total": pending,
        "today_new": today_new,
        "reviewed_total": reviewed,
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_dashboard_summary(request):
    today = timezone.now().date()
    year = today.year

    claims_qs = Claim.objects.filter(created_at__year=year)

    total_members = Member.objects.count()
    total_claims = claims_qs.count()

    status_qs = (
        claims_qs.values("status")
        .annotate(count=Count("id"))
    )
    status_counts = {row["status"]: row["count"] for row in status_qs}

    pending_qs = claims_qs.exclude(status__in=["paid", "rejected"])
    total_payable_pending = (
        pending_qs.aggregate(total=Sum("total_payable"))["total"] or 0
    )

    paid_qs = claims_qs.filter(status="paid")
    total_paid_out = (
        paid_qs.aggregate(total=Sum("total_payable"))["total"] or 0
    )

    chronic_requests = ChronicRequest.objects.filter(
        created_at__year=year
    ).count()

    monthly_qs = (
        claims_qs
        .annotate(month=TruncMonth("created_at"))
        .values("month")
        .annotate(
            claims=Count("id"),
            total_payable=Sum("total_payable"),
        )
        .order_by("month")
    )

    monthly = [
        {
            "month": row["month"].strftime("%Y-%m-01"),
            "month_label": row["month"].strftime("%b"),
            "claims": row["claims"],
            "total_payable": float(row["total_payable"] or 0),
        }
        for row in monthly_qs
    ]

    return Response({
        "year": year,
        "total_members": total_members,
        "total_claims": total_claims,
        "status_counts": status_counts,
        "total_payable_pending": float(total_payable_pending),
        "total_paid_out": float(total_paid_out),
        "chronic_requests": chronic_requests,
        "monthly": monthly,
    })


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated, IsAdmin])
def audit_all_logs(request):
    logs = AuditLog.objects.all().order_by("-created_at")[:500]
    data = AuditLogSerializer(logs, many=True).data
    return Response({"results": data})



@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdmin])
def committee_members(request):
    group = Group.objects.filter(name="Committee").first()
    if not group:
        return Response({"results": []})
    data = []
    for u in group.user_set.all().order_by("first_name", "last_name"):
        data.append({
            "id": u.id,
            "username": u.username,
            "full_name": u.get_full_name() or u.username,
            "email": u.email,
            "is_superuser": u.is_superuser,
        })
    return Response({"results": data})
