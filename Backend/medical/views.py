# Backend/medical/views.py
from django.contrib.auth import authenticate, login, logout, get_user_model
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.db import transaction
from django.utils import timezone
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt
from django.middleware.csrf import get_token
from django.contrib.auth.models import Group

from .models import (
    Member, MembershipType, Claim, ClaimItem, ClaimReview,
    Notification, ReimbursementScale, Setting, ChronicRequest, ClaimAttachment
)
from .serializers import (
    MemberSerializer, MembershipTypeSerializer, ClaimSerializer, ClaimItemSerializer,
    ClaimReviewSerializer, NotificationSerializer, ReimbursementScaleSerializer,
    SettingSerializer, ChronicRequestSerializer, ClaimAttachmentSerializer
)
from .permissions import IsSelfOrAdmin, IsClaimOwnerOrCommittee, IsCommittee, IsAdmin


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
        claim.save(update_fields=["status", "submitted_at"])
        claim.compute_payable()
        return Response(ClaimSerializer(claim).data)


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
        serializer.save(uploaded_by=self.request.user)


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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_member(request):
    """Return membership info for the logged-in user"""
    try:
        member = Member.objects.get(user=request.user)
        return Response({
            "id": member.id,
            "nhif_number": member.nhif_number,
            "membership_type": member.membership_type.name if member.membership_type else None,
            "valid_from": member.valid_from,
            "valid_to": member.valid_to,
        })
    except Member.DoesNotExist:
        return Response({"detail": "Not registered as member."}, status=404)

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

    # ✅ Try both username and email for convenience
    from django.contrib.auth import authenticate, get_user_model
    User = get_user_model()

    user = authenticate(request, username=username, password=password)
    if user is None:
        # fallback: try to find by email
        try:
            user_obj = User.objects.get(email=username)
            user = authenticate(request, username=user_obj.username, password=password)
        except User.DoesNotExist:
            user = None

    if user is not None:
        login(request, user)
        return Response({"detail": "Login successful."}, status=status.HTTP_200_OK)

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

