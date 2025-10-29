# Backend/api/members/urls.py
from django.urls import path
from api.members import views  # ✅ Correct import path

urlpatterns = [
    path("me/", views.member_me, name="my-member"),
]
