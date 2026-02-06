# Backend/medical/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model, models as auth_models
from django.utils import timezone
from datetime import datetime, date
from django.contrib.auth.models import Group
from .models import (
    Member, MembershipType, Claim, ClaimItem, ClaimReview, AuditLog,
    Notification, ReimbursementScale, Setting, ChronicRequest, ClaimAttachment, MemberDependent,
    CommitteeMeeting, MeetingAttendance, ClaimMeetingLink, ClaimAppeal, PaymentRecord
)

User = get_user_model()


class MembershipTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = MembershipType
        fields = ["id", "key", "name", "annual_limit", "fund_share_percent"]


class MemberDependentSerializer(serializers.ModelSerializer):
    class Meta:
        model = MemberDependent
        fields = [
            "id",
            "full_name",
            "date_of_birth",
            "blood_group",
            "id_number",
            "relationship",
            "created_at",
        ]

class MemberApplicationSerializer(serializers.ModelSerializer):
    user_full_name = serializers.CharField(source="user.get_full_name", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    membership_type_name = serializers.SerializerMethodField()

    def get_membership_type_name(self, obj):
        return obj.membership_type.name if obj.membership_type else ""

    class Meta:
        model = Member
        fields = [
            "id",
            "user_full_name",
            "email",
            "membership_type_name",
            "status",
            "shif_number",
            "mailing_address",
            "phone_mobile",
            "benefits_from",
            "valid_from",
            "valid_to",
        ]


class MemberSerializer(serializers.ModelSerializer):
    user_full_name = serializers.SerializerMethodField()
    email = serializers.SerializerMethodField()
    membership_type_details = serializers.SerializerMethodField()
    dependants = MemberDependentSerializer(many=True, read_only=True)

    class Meta:
        model = Member
        fields = [
            "id",
            "user_full_name",
            "email",
            "membership_type",
            "membership_type_details",
            "shif_number",
            "mailing_address",
            "phone_office",
            "phone_home",
            "phone_fax",
            "phone_mobile",
            "family_doctor_name",
            "family_doctor_phone_office",
            "family_doctor_phone_home",
            "family_doctor_phone_fax",
            "family_doctor_phone_mobile",
            "other_medical_scheme",
            "status",
            "valid_from",
            "valid_to",
            "benefits_from",
            "dependants",
        ]
        read_only_fields = ["status", "valid_from", "valid_to", "benefits_from"]

    def get_user_full_name(self, obj):
        return obj.user.get_full_name() or obj.user.username

    def get_email(self, obj):
        return obj.user.email
    
    def get_membership_type_details(self, obj):
        if obj.membership_type:
            return {
                "id": obj.membership_type.id,
                "name": obj.membership_type.name,
                "annual_limit": obj.membership_type.annual_limit
            }
        return None

class AdminUserSerializer(serializers.ModelSerializer):
    groups = serializers.SlugRelatedField(
        many=True,
        slug_field="name",
        read_only=True,
    )

    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "is_active", "is_superuser", "groups"]

class ClaimItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClaimItem
        fields = ["id", "claim", "category", "description", "amount", "quantity"]
        read_only_fields = ["id"]


# medical/serializers.py
class ClaimReviewSerializer(serializers.ModelSerializer):
    reviewer = serializers.SerializerMethodField()
    role = serializers.CharField(source="reviewer.groups.first.name", read_only=True)

    def get_reviewer(self, obj):
        if not obj.reviewer:
            return None
        return {
            "id": obj.reviewer.id,
            "username": obj.reviewer.username,
            "name": f"{obj.reviewer.first_name} {obj.reviewer.last_name}".strip() or obj.reviewer.username,
        }

    class Meta:
        model = ClaimReview
        fields = ["id", "claim", "role", "action", "note", "created_at", "reviewer"]

    def validate(self, attrs):
        from django.core.exceptions import ValidationError as DjangoValidationError
        # Create a temporary instance to trigger model-level clean()
        # Note: self.instance might exist if updating
        review = self.instance or ClaimReview()
        for attr, value in attrs.items():
            setattr(review, attr, value)
        
        try:
            review.clean()
        except DjangoValidationError as e:
            raise serializers.ValidationError(
                e.message_dict if hasattr(e, "message_dict") else e.messages
            )
        return attrs


class ClaimAttachmentSerializer(serializers.ModelSerializer):
    uploaded_by_email = serializers.EmailField(source="uploaded_by.email", read_only=True)
    label = serializers.SerializerMethodField()
    is_summary = serializers.SerializerMethodField()

    class Meta:
        model = ClaimAttachment
        fields = [
            "id",
            "claim",
            "uploaded_by",
            "uploaded_by_email",
            "file",
            "content_type",
            "uploaded_at",
            "label",
            "is_summary",
        ]
        read_only_fields = ["id", "uploaded_at", "uploaded_by_email", "label", "is_summary"]

    def _file_name(self, obj):
        try:
            return (getattr(obj.file, "name", "") or "").lower()
        except Exception:
            return ""

    def get_is_summary(self, obj):
        name = self._file_name(obj)
        # any filename that looks like the auto-generated summary pdf
        return "summary" in name or "claim_summary" in name

    def get_label(self, obj):
        if self.get_is_summary(obj):
            return "Claim Summary PDF"
        # fallback: use content type for human-friendly label
        ct = (obj.content_type or "").lower()
        if "pdf" in ct:
            return "Supporting Document (PDF)"
        if "image" in ct:
            return "Supporting Image"
        return "Attachment"


# -------------------------------
# CLEAN + LAW-COMPLIANT CLAIM SERIALIZER
# -------------------------------

class ClaimSerializer(serializers.ModelSerializer):
    items = ClaimItemSerializer(many=True, read_only=True)
    attachments = ClaimAttachmentSerializer(many=True, read_only=True)
    reviews = ClaimReviewSerializer(many=True, read_only=True)
    member_user_email = serializers.EmailField(source="member.user.email", read_only=True)

    details = serializers.DictField(required=False)

    class Meta:
        model = Claim
        fields = [
            "id", "member", "member_user_email",
            "claim_type", "details",
            "date_of_first_visit", "date_of_discharge",
            "total_claimed", "total_payable", "member_payable",
            "status", "submitted_at", "notes",
            "excluded", "override_amount", "shif_number", "other_insurance",
            "created_at", "items", "attachments", "reviews"
        ]
        read_only_fields = [
            "id", "member", "member_user_email",
            "total_claimed", "total_payable", "member_payable",
            "created_at", "submitted_at"
        ]

    # -----------------------
    # PHASE 2C: PII MASKING
    # -----------------------
    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get("request")
        if not request:
            return data
            
        user = request.user
        # Logic: Only Medical Reviewers (handled via specific group or admin) see full notes.
        # For general Committee members, redact the 'notes' (diagnosis) field.
        # Admin and Owner see it.
        
        is_owner = instance.member.user == user
        is_admin = user.is_superuser
        
        # Check if user is in "Committee" but NOT specifically "MedicalReviewer" (if role exists)
        # For now, if role is just "Committee", we redact if they are not the owner/admin.
        # We need _in_group which is in permissions.py, but we can't easily import it here 
        # without circularity if views/permissions import serializers.
        # Let's use user.groups.filter instead.
        is_committee = user.groups.filter(name="Committee").exists() or is_admin
        
        # Determine if they should see PII
        # In a real system, we'd have a 'MedicalReviewer' group for this.
        can_see_pii = is_owner or is_admin or user.groups.filter(name="MedicalReviewer").exists()

        if is_committee and not can_see_pii:
            if data.get("notes"):
                data["notes"] = "[REDACTED - MEDICAL PRIVACY]"
            if data.get("details"):
                 # Mask sensitive fields in JSON
                 if "diagnosis" in data["details"]:
                     data["details"]["diagnosis"] = "[REDACTED]"
        
        return data

    # -----------------------
    # SAFE DATE PARSER
    # -----------------------
    def _parse_date(self, val):
        if not val:
            return None
        if isinstance(val, date):
            return val
        try:
            return datetime.fromisoformat(val).date()
        except Exception:
            return None

    # -----------------------
    # CREATE CLAIM
    # -----------------------
    def create(self, validated_data):
        request = self.context["request"]
        member = Member.objects.get(user=request.user)
        validated_data["member"] = member

        # Pull out details from payload
        details = validated_data.pop("details", {}) or {}
        claim_type = validated_data.get("claim_type")

        # 🔹 Persist the structured form payload on the model
        validated_data["details"] = details

        if claim_type == "outpatient":
            validated_data["date_of_first_visit"] = self._parse_date(
                details.get("date_of_first_visit")
            )
            validated_data["notes"] = details.get("diagnosis") or "Outpatient treatment"

        elif claim_type == "inpatient":
            validated_data["date_of_discharge"] = self._parse_date(
                details.get("date_of_discharge")
            )
            validated_data["notes"] = details.get("hospital_name") or "Inpatient treatment"

        elif claim_type == "chronic":
            validated_data["notes"] = "Chronic medication request"

        # Auto-submission timestamp
        if validated_data.get("status") == "submitted":
            validated_data["submitted_at"] = timezone.now()

        # NEW: Auto-compute totals BEFORE saving
        temp = Claim(**validated_data)
        temp.member = member
        temp.compute_fund_distribution()

        validated_data["total_claimed"] = temp.total_claimed
        validated_data["total_payable"] = temp.total_payable
        validated_data["member_payable"] = temp.member_payable

        return super().create(validated_data)


    # -----------------------
    # VALIDATION (BYELAWS)
    # -----------------------
    def validate(self, attrs):
        from django.core.exceptions import ValidationError as DjangoValidationError

        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return attrs

        try:
            member = Member.objects.get(user=request.user)
        except Member.DoesNotExist:
            raise serializers.ValidationError({"detail": "Member profile not found."})

        details = attrs.get("details") or {}
        claim_type = attrs.get("claim_type") or getattr(self.instance, "claim_type", None)
        status = attrs.get("status") or getattr(self.instance, "status", "draft")

        # Build temporary claim
        candidate = self.instance or Claim(member=member)
        candidate.member = member
        candidate.claim_type = claim_type

        # 🔹 Ensure the rule-engine sees the same structured payload
        candidate.details = details or getattr(candidate, "details", {}) or {}

        # Set dates safely
        if claim_type == "outpatient":
            candidate.date_of_first_visit = self._parse_date(
                details.get("date_of_first_visit")
            ) or candidate.date_of_first_visit

        elif claim_type == "inpatient":
            candidate.date_of_discharge = self._parse_date(
                details.get("date_of_discharge")
            ) or candidate.date_of_discharge

        # Submitted timestamp
        if status == "submitted" and not candidate.submitted_at:
            candidate.submitted_at = timezone.now()

        candidate.status = status

        # First, run model-level clean() (90-day + 60-day rules)
        try:
            candidate.clean()
        except DjangoValidationError as e:
            raise serializers.ValidationError(
                e.message_dict if hasattr(e, "message_dict") else e.messages
            )

        # -------------------------------------------------------
        # Duplicate Detection (Phase 2B)
        # -------------------------------------------------------
        if status == "submitted":
            from medical.services.verification import check_for_duplicate
            _, is_duplicate = check_for_duplicate(candidate)
            if is_duplicate:
                raise serializers.ValidationError(
                    {"detail": "Conflict: A claim with the same receipt number, amount, and date already exists for this member."}
                )

        return attrs



class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ["id", "recipient", "title", "message", "link", "type", "read", "actor", "metadata", "created_at"]
        read_only_fields = ["id", "created_at"]


class ReimbursementScaleSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReimbursementScale
        fields = ["id", "category", "fund_share", "member_share", "ceiling", "updated_at"]
        read_only_fields = ["id", "updated_at"]


class SettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Setting
        fields = ["id", "key", "value", "updated_at"]
        read_only_fields = ["id", "updated_at"]


class ChronicRequestSerializer(serializers.ModelSerializer):
    member_user_email = serializers.EmailField(source="member.user.email", read_only=True)

    class Meta:
        model = ChronicRequest
        fields = [
            "id", "member", "member_user_email",
            "doctor_name", "medicines",
            "total_amount", "member_payable",
            "status", "created_at"
        ]
        read_only_fields = ["id", "created_at", "member_user_email"]



class AuditLogSerializer(serializers.ModelSerializer):
    reviewer = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()

    class Meta:
        model = AuditLog
        fields = ["id", "action", "meta", "created_at", "reviewer", "role"]

    def get_reviewer(self, obj):
        if not obj.actor:
            return None
        return {
            "id": obj.actor.id,
            "username": obj.actor.username,
            "email": obj.actor.email,
            "name": f"{obj.actor.first_name} {obj.actor.last_name}".strip() or obj.actor.username,
        }

    def get_role(self, obj):
        if not obj.actor:
            return obj.meta.get("role")
        # First group name or fallback
        try:
            return obj.actor.groups.values_list("name", flat=True).first() or ("admin" if obj.actor.is_superuser else "member")
        except Exception:
            return "member"


# ---------------------------
# Governance Serializers
# ---------------------------
class MeetingAttendanceSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.get_full_name", read_only=True)

    class Meta:
        model = MeetingAttendance
        fields = ["id", "user", "user_name", "present", "role"]


class ClaimMeetingLinkSerializer(serializers.ModelSerializer):
    claim_details = serializers.SerializerMethodField()

    def get_claim_details(self, obj):
        return {
            "id": obj.claim.id,
            "claim_type": obj.claim.claim_type,
            "total_claimed": obj.claim.total_claimed,
            "member_name": obj.claim.member.user.get_full_name() or obj.claim.member.user.username
        }

    class Meta:
        model = ClaimMeetingLink
        fields = ["id", "meeting", "claim", "claim_details", "decision", "decision_notes"]


class CommitteeMeetingSerializer(serializers.ModelSerializer):
    attendance = MeetingAttendanceSerializer(many=True, read_only=True)
    claim_links = ClaimMeetingLinkSerializer(many=True, read_only=True)
    created_by_name = serializers.CharField(source="created_by.get_full_name", read_only=True)

    class Meta:
        model = CommitteeMeeting
        fields = [
            "id", "date", "meeting_type", "quorum_confirmed", 
            "minutes_upload", "status", "attendance", "claim_links",
            "created_by_name", "created_at"
        ]
        read_only_fields = ["id", "created_at", "created_by_name"]


class ClaimAppealSerializer(serializers.ModelSerializer):
    member_name = serializers.CharField(source="appealed_by.user.get_full_name", read_only=True)
    claim_type = serializers.CharField(source="claim.claim_type", read_only=True)

    class Meta:
        model = ClaimAppeal
        fields = [
            "id", "claim", "claim_type", "appealed_by", "member_name", 
            "reason", "status", "trustee_decision", "trustee_notes", 
            "decided_at", "created_at"
        ]
        read_only_fields = ["id", "created_at", "member_name", "claim_type"]

class PaymentRecordSerializer(serializers.ModelSerializer):
    reconciled_by_name = serializers.CharField(source="reconciled_by.get_full_name", read_only=True)

    class Meta:
        model = PaymentRecord
        fields = [
            "id", "claim", "payment_method", "reference_number", 
            "amount", "payment_date", "reconciled", 
            "reconciled_by_name", "reconciled_at"
        ]
        read_only_fields = ["id", "reconciled", "reconciled_by_name", "reconciled_at"]
