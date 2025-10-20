# medical/views.py (DRF viewsets)

from rest_framework import viewsets, permissions
from .models import Member, Claim, ClaimItem, ClaimReview, MembershipType
from .serializers import MemberSerializer, ClaimSerializer, ClaimItemSerializer, ClaimReviewSerializer, MembershipTypeSerializer


class IsAdminOrOwner(permissions.BasePermission):
def has_object_permission(self, request, view, obj):
if request.user.is_superuser: return True
if hasattr(obj,'member'):
return obj.member.user == request.user
if hasattr(obj,'user'):
return obj.user == request.user
return False


class MembershipTypeViewSet(viewsets.ReadOnlyModelViewSet):
queryset = MembershipType.objects.all()
serializer_class = MembershipTypeSerializer
permission_classes = [permissions.IsAuthenticated]


class MemberViewSet(viewsets.ModelViewSet):
queryset = Member.objects.select_related('user','membership_type').all()
serializer_class = MemberSerializer
permission_classes = [permissions.IsAuthenticated, IsAdminOrOwner]


class ClaimViewSet(viewsets.ModelViewSet):
queryset = Claim.objects.select_related('member').prefetch_related('items','reviews').all()
serializer_class = ClaimSerializer
permission_classes = [permissions.IsAuthenticated, IsAdminOrOwner]


class ClaimItemViewSet(viewsets.ModelViewSet):
queryset = ClaimItem.objects.select_related('claim').all()
serializer_class = ClaimItemSerializer
permission_classes = [permissions.IsAuthenticated, IsAdminOrOwner]


class ClaimReviewViewSet(viewsets.ModelViewSet):
queryset = ClaimReview.objects.select_related('claim','reviewer').all()
serializer_class = ClaimReviewSerializer
permission_classes = [permissions.IsAuthenticated]