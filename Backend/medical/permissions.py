# medical/permissions.py
from rest_framework import permissions


def _in_group(user, names: list[str]) -> bool:
    if not user or not user.is_authenticated:
        return False
    if user.is_superuser:
        return True
    groups = set(user.groups.values_list("name", flat=True))
    return any(name in groups for name in names)


class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return _in_group(request.user, ["Admin"])

class IsCommittee(permissions.BasePermission):
    def has_permission(self, request, view):
        return _in_group(request.user, ["Committee", "Admin"])

class IsTrustee(permissions.BasePermission):
    def has_permission(self, request, view):
        return _in_group(request.user, ["Trustee", "Admin"])

class IsSelfOrAdmin(permissions.BasePermission):
    """
    Used with Member endpoints where object has .user
    """
    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        if _in_group(request.user, ["Admin"]):
            return True
        return getattr(obj, "user_id", None) == request.user.id


class IsClaimOwnerOrCommittee(permissions.BasePermission):
    """
    Object is a Claim or related (ClaimItem, ClaimAttachment) having .member.user
    """
    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        if _in_group(request.user, ["Admin", "Committee"]):
            return True

        # figure out the claim owner
        claim = getattr(obj, "claim", None) or obj  # might already be a Claim
        member = getattr(claim, "member", None)
        user_id = getattr(getattr(member, "user", None), "id", None)
        return user_id == request.user.id

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
