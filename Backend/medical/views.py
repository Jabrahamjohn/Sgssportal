# medical/views.py
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model

from .models import (
    Setting, MembershipType, Member, ReimbursementScale,
    Claim, ClaimItem, ClaimReview, Notification
)
from .serializers import (
    SettingSerializer, MembershipTypeSerializer, MemberSerializer, ReimbursementScaleSerializer,
    ClaimSerializer, ClaimItemSerializer, ClaimReviewSerializer, NotificationSerializer
)
from .permissions import IsOwnerOrAdmin

User = get_user_model()


class SettingViewSet(viewsets.ModelViewSet):
    queryset = Setting.objects.all()
    serializer_class = SettingSerializer
    permission_classes = [permissions.IsAdminUser]


class MembershipTypeViewSet(viewsets.ModelViewSet):
    queryset = MembershipType.objects.all()
    serializer_class = MembershipTypeSerializer
    permission_classes = [permissions.IsAuthenticated]


class MemberViewSet(viewsets.ModelViewSet):
    queryset = Member.objects.select_related('user', 'membership_type').all()
    serializer_class = MemberSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]


class ReimbursementScaleViewSet(viewsets.ModelViewSet):
    queryset = ReimbursementScale.objects.all()
    serializer_class = ReimbursementScaleSerializer
    permission_classes = [permissions.IsAuthenticated]


class ClaimViewSet(viewsets.ModelViewSet):
    queryset = Claim.objects.select_related('member').prefetch_related('items', 'reviews').all()
    serializer_class = ClaimSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsOwnerOrAdmin])
    def recompute(self, request, pk=None):
        claim = self.get_object()
        claim.recalc_total()
        claim.compute_payable()
        return Response(ClaimSerializer(claim).data)


class ClaimItemViewSet(viewsets.ModelViewSet):
    queryset = ClaimItem.objects.select_related('claim').all()
    serializer_class = ClaimItemSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]


class ClaimReviewViewSet(viewsets.ModelViewSet):
    queryset = ClaimReview.objects.select_related('claim', 'reviewer').all()
    serializer_class = ClaimReviewSerializer
    permission_classes = [permissions.IsAuthenticated]


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user).order_by('-created_at')

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notif = self.get_object()
        notif.read = True
        notif.save(update_fields=['read'])
        return Response({'status': 'marked as read'})