# Backend/api/members/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from medical.models import Member

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def member_me(request):
    """Return the Member profile of the currently logged-in user"""
    try:
        member = Member.objects.select_related("membership_type").get(user=request.user)
        data = {
            "id": member.id,
            "full_name": member.user.get_full_name() or member.user.username,
            "email": member.user.email,
            "membership_type": member.membership_type.name if member.membership_type else None,
            "nhif_number": member.nhif_number,
            "valid_from": member.valid_from,
            "valid_to": member.valid_to,
        }
        return Response(data)
    except Member.DoesNotExist:
        return Response({"detail": "No member profile found for this user."}, status=404)
