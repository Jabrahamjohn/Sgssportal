from django.urls import path
from .views import member_me

urlpatterns = [
    path("me/", member_me, name="member_me"),
]
