# medical/permissions.py
from rest_framework import permissions

class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Owner (member.user) or superuser can access/modify.
    """

    def has_object_permission(self, request, view, obj):
        if request.user and request.user.is_superuser:
            return True

        # member-owned
        if hasattr(obj, "user"):
            return obj.user == request.user
        if hasattr(obj, "member") and hasattr(obj.member, "user"):
            return obj.member.user == request.user

        return False
