from rest_framework import viewsets, permissions
from .models import Member, Claim, MembershipType
from .serializers import MemberSerializer, ClaimSerializer, MembershipTypeSerializer


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Custom permission: only owner or admin can access.
    """

    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser:
            return True
        if hasattr(obj, "user"):
            return obj.user == request.user
        if hasattr(obj, "member"):
            return obj.member.user == request.user
        return False


class MembershipTypeViewSet(viewsets.ModelViewSet):
    queryset = MembershipType.objects.all()
    serializer_class = MembershipTypeSerializer
    permission_classes = [permissions.IsAuthenticated]


class MemberViewSet(viewsets.ModelViewSet):
    queryset = Member.objects.all()
    serializer_class = MemberSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]


class ClaimViewSet(viewsets.ModelViewSet):
    queryset = Claim.objects.all().select_related("member")
    serializer_class = ClaimSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]
