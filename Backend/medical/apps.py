from django.apps import AppConfig


class MedicalConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "medical"

    def ready(self):
        # ✅ Import inside ready(), after Django apps are fully loaded
        from django.db.models.signals import post_save
        from django.contrib.auth import get_user_model
        from django.contrib.auth.models import Group

        User = get_user_model()

        def assign_default_group(sender, instance, created, **kwargs):
            if created and not instance.is_superuser:
                member_group, _ = Group.objects.get_or_create(name="Member")
                instance.groups.add(member_group)

        post_save.connect(assign_default_group, sender=User)
