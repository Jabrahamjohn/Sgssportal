# Backend/medical/email_notifications.py
"""
Email notification service for SGSS Medical Fund Portal
"""
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags


def send_member_registration_email(member):
    """Send welcome email to newly registered member"""
    subject = 'Welcome to SGSS Medical Fund'
    
    html_message = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1e40af;">Welcome to SGSS Medical Fund!</h2>
            
            <p>Dear {member.user.get_full_name() or member.user.username},</p>
            
            <p>Thank you for registering with the SGSS Medical Fund. Your application has been received and is currently under review by our committee. Please ensure your SHIF/SHA details are up to date in your profile.</p>
            
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Application Status:</strong> Pending Approval</p>
                <p style="margin: 5px 0 0 0;"><strong>Membership Type:</strong> {member.membership_type.name if member.membership_type else 'Standard'}</p>
            </div>
            
            <p>You will receive an email notification once your application has been reviewed. This typically takes 2-3 business days.</p>
            
            <p>If you have any questions, please contact us at admin@sgssmedicalfund.org</p>
            
            <p>Best regards,<br>
            <strong>SGSS Medical Fund Committee</strong></p>
        </div>
    </body>
    </html>
    """
    
    plain_message = strip_tags(html_message)
    
    try:
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[member.user.email],
            html_message=html_message,
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Failed to send registration email: {e}")
        return False


def send_member_approved_email(member):
    """Send email when member is approved"""
    subject = 'Your SGSS Medical Fund Membership (SHIF/SHA) Has Been Approved!'
    
    html_message = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #059669;">Congratulations! Your Membership is Approved</h2>
            
            <p>Dear {member.user.get_full_name() or member.user.username},</p>
            
            <p>We are pleased to inform you that your SGSS Medical Fund membership application has been approved!</p>
            
            <div style="background-color: #d1fae5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Membership Status:</strong> Active</p>
                <p style="margin: 5px 0 0 0;"><strong>Membership Type:</strong> {member.membership_type.name if member.membership_type else 'Standard'}</p>
                <p style="margin: 5px 0 0 0;"><strong>Annual Limit:</strong> KSh {member.membership_type.annual_limit if member.membership_type else '250,000'}</p>
                {f'<p style="margin: 5px 0 0 0;"><strong>Valid From:</strong> {member.valid_from}</p>' if member.valid_from else ''}
                {f'<p style="margin: 5px 0 0 0;"><strong>Valid To:</strong> {member.valid_to}</p>' if member.valid_to else ''}
            </div>
            
            <p>You can now submit claims through the portal. Please ensure you have all required documentation when submitting claims.</p>
            
            <p><a href="{settings.FRONTEND_URL or 'http://localhost:5173'}/dashboard" style="display: inline-block; background-color: #1e40af; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 10px 0;">Access Your Dashboard</a></p>
            
            <p>If you have any questions, please contact us at admin@sgssmedicalfund.org</p>
            
            <p>Best regards,<br>
            <strong>SGSS Medical Fund Committee</strong></p>
        </div>
    </body>
    </html>
    """
    
    plain_message = strip_tags(html_message)
    
    try:
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[member.user.email],
            html_message=html_message,
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Failed to send approval email: {e}")
        return False


def send_claim_submitted_email(claim):
    """Send email when claim is submitted"""
    subject = f'SHIF-linked Claim Submitted - {claim.claim_type.title()}'
    member = claim.member
    
    html_message = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1e40af;">Claim Submitted Successfully</h2>
            
            <p>Dear {member.user.get_full_name() or member.user.username},</p>
            
            <p>Your {claim.claim_type} claim (SHIF-linked) has been successfully submitted and is now under review.</p>
            
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Claim ID:</strong> {claim.id}</p>
                <p style="margin: 5px 0 0 0;"><strong>Claim Type:</strong> {claim.claim_type.title()}</p>
                <p style="margin: 5px 0 0 0;"><strong>Total Claimed:</strong> KSh {claim.total_claimed:,.2f}</p>
                <p style="margin: 5px 0 0 0;"><strong>Status:</strong> {claim.status.title()}</p>
                <p style="margin: 5px 0 0 0;"><strong>Submitted:</strong> {claim.submitted_at.strftime('%B %d, %Y') if claim.submitted_at else 'N/A'}</p>
            </div>
            
            <p>The committee will review your claim and you will be notified of the outcome. This typically takes 5-7 business days.</p>
            
            <p><a href="{settings.FRONTEND_URL or 'http://localhost:5173'}/claims/{claim.id}" style="display: inline-block; background-color: #1e40af; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 10px 0;">View Claim Details</a></p>
            
            <p>If you have any questions, please contact us at admin@sgssmedicalfund.org</p>
            
            <p>Best regards,<br>
            <strong>SGSS Medical Fund Committee</strong></p>
        </div>
    </body>
    </html>
    """
    
    plain_message = strip_tags(html_message)
    
    try:
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[member.user.email],
            html_message=html_message,
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Failed to send claim submission email: {e}")
        return False


def send_claim_status_email(claim, old_status=None):
    """Send email when claim status changes"""
    member = claim.member
    status_messages = {
        'approved': {
            'subject': 'Your Claim Has Been Approved!',
            'color': '#059669',
            'message': 'We are pleased to inform you that your claim has been approved.',
        },
        'rejected': {
            'subject': 'Claim Update - Action Required',
            'color': '#dc2626',
            'message': 'Unfortunately, your claim has been rejected. Please contact the committee for more information.',
        },
        'paid': {
            'subject': 'Payment Processed for Your Claim',
            'color': '#059669',
            'message': 'Your claim has been processed and payment has been initiated.',
        },
        'reviewed': {
            'subject': 'Your Claim is Under Review',
            'color': '#f59e0b',
            'message': 'Your claim is currently being reviewed by the committee.',
        },
    }
    
    status_info = status_messages.get(claim.status, {
        'subject': 'Claim Status Update',
        'color': '#6b7280',
        'message': f'Your claim status has been updated to {claim.status}.',
    })
    
    subject = status_info['subject']
    
    html_message = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: {status_info['color']};">{status_info['subject']}</h2>
            
            <p>Dear {member.user.get_full_name() or member.user.username},</p>
            
            <p>{status_info['message']}</p>
            
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Claim ID:</strong> {claim.id}</p>
                <p style="margin: 5px 0 0 0;"><strong>Claim Type:</strong> {claim.claim_type.title()}</p>
                <p style="margin: 5px 0 0 0;"><strong>Total Claimed:</strong> KSh {claim.total_claimed:,.2f}</p>
                <p style="margin: 5px 0 0 0;"><strong>Fund Payable:</strong> KSh {claim.total_payable:,.2f}</p>
                <p style="margin: 5px 0 0 0;"><strong>Member Payable:</strong> KSh {claim.member_payable:,.2f}</p>
                <p style="margin: 5px 0 0 0;"><strong>Status:</strong> <span style="color: {status_info['color']}; font-weight: bold;">{claim.status.upper()}</span></p>
            </div>
            
            <p><a href="{settings.FRONTEND_URL or 'http://localhost:5173'}/claims/{claim.id}" style="display: inline-block; background-color: #1e40af; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 10px 0;">View Claim Details</a></p>
            
            <p>If you have any questions, please contact us at admin@sgssmedicalfund.org</p>
            
            <p>Best regards,<br>
            <strong>SGSS Medical Fund Committee</strong></p>
        </div>
    </body>
    </html>
    """
    
    plain_message = strip_tags(html_message)
    
    try:
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[member.user.email],
            html_message=html_message,
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Failed to send claim status email: {e}")
        return False


def send_committee_notification_email(claim, notification_type='new_claim'):
    """Send email to committee members about new claims"""
    from django.contrib.auth.models import Group
    
    committee_group = Group.objects.filter(name="Committee").first()
    if not committee_group:
        return False
    
    committee_emails = list(committee_group.user_set.values_list('email', flat=True))
    if not committee_emails:
        return False
    
    member = claim.member
    
    if notification_type == 'new_claim':
        subject = f'New {claim.claim_type.title()} Claim Submitted'
        message = f"""
        A new {claim.claim_type} claim has been submitted and requires review.
        
        Member: {member.user.get_full_name() or member.user.username}
        Claim ID: {claim.id}
        Amount Claimed: KSh {claim.total_claimed:,.2f}
        Submitted: {claim.submitted_at.strftime('%B %d, %Y') if claim.submitted_at else 'N/A'}
        
        Please log in to the portal to review this claim.
        """
    else:
        return False
    
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=committee_emails,
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Failed to send committee notification: {e}")
        return False


def send_application_rejected_email(member):
    """Send email when membership application is rejected"""
    subject = 'Update on Your SGSS Medical Fund Application'
    
    html_message = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #dc2626;">Application Status Update</h2>
            
            <p>Dear {member.user.get_full_name() or member.user.username},</p>
            
            <p>We regret to inform you that your application for membership with the SGSS Medical Fund has been declined at this time.</p>
            
            <div style="background-color: #fef2f2; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Status:</strong> Rejected</p>
            </div>
            
            <p>If you believe this decision was made in error or if you would like more information, please contact the committee.</p>
            
            <p>If you wish to re-apply in the future or update your details, please log in to your dashboard.</p>
            
            <p>Best regards,<br>
            <strong>SGSS Medical Fund Committee</strong></p>
        </div>
    </body>
    </html>
    """
    
    plain_message = strip_tags(html_message)
    
    try:
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[member.user.email],
            html_message=html_message,
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Failed to send rejection email: {e}")
        return False


def send_new_member_committee_email(member):
    """Send email to committee when a new member registers"""
    from django.contrib.auth.models import Group
    
    committee_group = Group.objects.filter(name="Committee").first()
    if not committee_group:
        return False
    
    committee_emails = list(committee_group.user_set.values_list('email', flat=True))
    if not committee_emails:
        return False
        
    subject = 'New Member Registration'
    
    html_message = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1e40af;">New Member Registration</h2>
            
            <p>A new member has registered and requires review.</p>
            
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Name:</strong> {member.user.get_full_name() or member.user.username}</p>
                <p style="margin: 5px 0 0 0;"><strong>Email:</strong> {member.user.email}</p>
                <p style="margin: 5px 0 0 0;"><strong>Membership Type:</strong> {member.membership_type.name if member.membership_type else 'Not Selected'}</p>
                <p style="margin: 5px 0 0 0;"><strong>Status:</strong> Pending</p>
            </div>
            
            <p><a href="{settings.FRONTEND_URL or 'http://localhost:3000'}/dashboard/committee/members" style="display: inline-block; background-color: #1e40af; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 10px 0;">Review Application</a></p>
        </div>
    </body>
    </html>
    """
    
    plain_message = strip_tags(html_message)
    
    try:
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=committee_emails,
            html_message=html_message,
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Failed to send new member committee alert: {e}")
        return False
