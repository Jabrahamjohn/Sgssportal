# Backend/medical/views.py
from rest_framework import viewsets, mixins, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db import transaction
from django.utils import timezone
from django.shortcuts import get_object_or_404

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


# --------- MembershipType ----------
class MembershipTypeViewSet(viewsets.ModelViewSet):
    queryset = MembershipType.objects.all().order_by("name")
    serializer_class = MembershipTypeSerializer
    permission_classes = [permissions.IsAuthenticated, IsCommittee]  # read/write by committee/admin
    http_method_names = ["get", "post", "put", "patch", "delete"]


# --------- Member ----------
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


# --------- Claim ----------
class ClaimViewSet(viewsets.ModelViewSet):
    queryset = Claim.objects.select_related("member__user", "member__membership_type").prefetch_related("items", "attachments")
    serializer_class = ClaimSerializer
    permission_classes = [permissions.IsAuthenticated, IsClaimOwnerOrCommittee]

    def get_queryset(self):
        qs = super().get_queryset()
        # members see their claims; committee/admin see all
        user = self.request.user
        if user.is_superuser:
            return qs
        if user.groups.filter(name__in=["Admin", "Committee"]).exists():
            return qs
        return qs.filter(member__user=user)

    @transaction.atomic
    def perform_create(self, serializer):
        claim = serializer.save()
        # mark submitted_at if status == submitted
        if claim.status == "submitted" and claim.submitted_at is None:
            claim.submitted_at = timezone.now()
            claim.save(update_fields=["submitted_at"])
        # compute totals
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


# --------- ClaimItem ----------
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


# --------- ClaimReview ----------
class ClaimReviewViewSet(viewsets.ModelViewSet):
    queryset = ClaimReview.objects.select_related("claim", "reviewer")
    serializer_class = ClaimReviewSerializer
    permission_classes = [permissions.IsAuthenticated, IsCommittee]

    def perform_create(self, serializer):
        review = serializer.save(reviewer=self.request.user)
        # update claim status according to action
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


# --------- ClaimAttachment ----------
class ClaimAttachmentViewSet(viewsets.ModelViewSet):
    queryset = ClaimAttachment.objects.select_related("claim", "claim__member__user", "uploaded_by")
    serializer_class = ClaimAttachmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsClaimOwnerOrCommittee]
    http_method_names = ["get", "post", "delete"]  # update isn't needed for files

    def perform_create(self, serializer):
        attachment = serializer.save(uploaded_by=self.request.user)
        # nothing to recompute, but could validate file type if needed


# --------- Chronic Requests ----------
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


# --------- Notifications (current user) ----------
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


# --------- Settings & Reimbursement (admin/committee) ----------
class SettingViewSet(viewsets.ModelViewSet):
    queryset = Setting.objects.all()
    serializer_class = SettingSerializer
    permission_classes = [permissions.IsAuthenticated, IsCommittee]


class ReimbursementScaleViewSet(viewsets.ModelViewSet):
    queryset = ReimbursementScale.objects.all().order_by("category")
    serializer_class = ReimbursementScaleSerializer
    permission_classes = [permissions.IsAuthenticated, IsCommittee]


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    user = request.user
    return Response({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "groups": list(user.groups.values_list('name', flat=True))
    })