from django.contrib.auth.views import PasswordResetView, PasswordResetConfirmView
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.conf import settings
import json

@method_decorator(csrf_exempt, name='dispatch')
class CustomPasswordResetView(PasswordResetView):
    """
    API view to request a password reset email.
    Validates that the user is an active member or staff before sending.
    """
    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)
            email = data.get('email')
        except:
            return JsonResponse({'detail': 'Invalid JSON'}, status=400)

        if not email:
            return JsonResponse({'detail': 'Email is required'}, status=400)

        user = User.objects.filter(email=email).first()
        
        # Security: Allow staff/committee always. For members, check status.
        allow_reset = False
        if user:
            # 1. Staff / Superuser / Committee
            if user.is_staff or user.is_superuser or user.groups.filter(name="Committee").exists():
                allow_reset = True
            # 2. Member
            elif hasattr(user, 'member_profile'):
                member = user.member_profile
                if member.status in ['active', 'approved']:
                    allow_reset = True
                else:
                    return JsonResponse({'detail': 'Password reset is not available for pending or inactive memberships.'}, status=403)
            else:
                # User exists but no role - arguably shouldn't happen, but let's deny or silent fail
                # For safety, we can allow reset for raw users if that's a valid state,
                # but based on requirements, "approved members only" suggests restriction.
                # We'll default to blocking unless they have a clear role.
                 return JsonResponse({'detail': 'Account not authorized for password reset.'}, status=403)

        if allow_reset:
            # Inject frontend URL for the link construction
            # Django's PasswordResetForm uses 'domain' and 'protocol' from the request
            # But we want to point to the React frontend.
            # We can override the email template or use the 'extra_email_context'
            
            # Since this is an API, we actually just want to invoke the standard form save
            # but configured to point to our frontend link.
            
            # Standard Django PasswordResetForm sends email to a link like:
            # protocol://domain/reset/uid/token
            # We need: FRONTEND_URL/reset-password?uid=...&token=...
            
            # To achieve this without complex custom forms, we often just rely on 
            # custom templates. Let's assume we configure the template path in urls.py 
            # or we accept that Django sends a link and we might need to adjust the domain via
            # the "Site" framework or request host.
            
            # Simplest approach for SPA: Pass 'html_email_template_name' that has the hardcoded frontend link structure.
            pass # Standard logic below will handle it if we passed the right params
            
        # Call the standard Django logic which handles the email sending
        # Note: We only call super() if allow_reset is True.
        # But wait, super().post() expects form data (request.POST), not JSON.
        # So we need to reconstruct POST data or manually instantiate the form.
        
        from django.contrib.auth.forms import PasswordResetForm
        
        if allow_reset:
            form = PasswordResetForm(data={'email': email})
            if form.is_valid():
                # We use a custom template context to pass the frontend base URL
                opts = {
                    'use_https': request.is_secure(),
                    'token_generator': self.token_generator,
                    'from_email': self.from_email,
                    'email_template_name': 'registration/password_reset_email.html', # We'll create this
                    'subject_template_name': 'registration/password_reset_subject.txt',
                    'request': request,
                    'html_email_template_name': 'registration/password_reset_email.html',
                    'extra_email_context': {'frontend_url': settings.FRONTEND_URL}
                }
                form.save(**opts)
                return JsonResponse({'detail': 'Password reset email sent.'})
        
        # If user not found, strictly we should say "sent" to avoid enumeration,
        # but user requirements imply specific feedback for "unapproved".
        # If allow_reset was False, we returned 403 above.
        # If user was None, we fall through here.
        
        # Mimic success for user-not-found to prevent enumeration?
        # Or be helpful? Plan didn't specify. Let's be helpful for now since it's an internal portal.
        if not user:
             return JsonResponse({'detail': 'User not found.'}, status=404)
             
        return JsonResponse({'detail': 'Password reset email sent.'})


@method_decorator(csrf_exempt, name='dispatch')
class CustomPasswordResetConfirmView(PasswordResetConfirmView):
    """
    API View to set the new password.
    """
    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)
            uidb64 = data.get('uid') # Frontend should send these
            token = data.get('token')
            password = data.get('password')
        except:
             return JsonResponse({'detail': 'Invalid JSON'}, status=400)
             
        if not (uidb64 and token and password):
            return JsonResponse({'detail': 'Missing parameters.'}, status=400)
            
        # Standard format expects parameters in URL kwargs, but we can manually invoke form.
        # Actually, PasswordResetConfirmView expects uidb64 and token in kwargs.
        
        # We can dynamically set them on 'self.kwargs' if we route this as a generic POST endpoint.
        self.kwargs['uidb64'] = uidb64
        self.kwargs['token'] = token
        
        # And injection of password into expected POST dict for the form
        request.POST = request.POST.copy()
        request.POST['new_password1'] = password
        request.POST['new_password1'] = password # form expects this? usually new_password1
        
        from django.contrib.auth.forms import SetPasswordForm
        user = self.get_user(uidb64)
        
        if user is None:
             return JsonResponse({'detail': 'Invalid link.'}, status=400)
             
        form = SetPasswordForm(user, data={'new_password1': password})
        
        if form.is_valid():
            form.save()
            return JsonResponse({'detail': 'Password has been reset successfully.'})
        else:
            return JsonResponse({'detail': 'Invalid password.', 'errors': form.errors}, status=400)
