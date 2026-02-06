# Backend/medical/audit.py
from __future__ import annotations
from typing import Optional, Dict, Any
from django.contrib.auth import get_user_model
from .models import AuditLog, Claim, ClaimReview, CommitteeMeeting

User = get_user_model()

def log_claim_event(*, claim: Claim, actor: Optional[User], action: str,
                    note: Optional[str] = None, role: Optional[str] = None,
                    meeting: Optional[CommitteeMeeting] = None,
                    previous_state: Optional[Dict[str, Any]] = None,
                    new_state: Optional[Dict[str, Any]] = None,
                    meta: Optional[Dict[str, Any]] = None) -> AuditLog:
    """
    Write one line to the audit log for a claim and create a ClaimReview record
    for the history visible to members/committee.
    """
    # 1. Create a structured ClaimReview record if this is a review action
    REVIEW_ACTIONS = [a[0] for a in ClaimReview.ACTIONS]
    if action in REVIEW_ACTIONS:
        ClaimReview.objects.create(
            claim=claim,
            reviewer=actor,
            role=role,
            action=action,
            note=note
        )

    # 2. Maintain the AuditLog for system-wide forensic auditing
    return AuditLog.objects.create(
        action=action,
        actor=actor,
        previous_state=previous_state,
        new_state=new_state,
        meeting=meeting,
        meta={
            "note": note,
            "role": role,
            "claim_id": claim.id,
            **(meta or {})
        }
    )
