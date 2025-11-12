# Backend/medical/audit.py
from typing import Optional, Dict, Any
from django.contrib.auth import get_user_model
from .models import AuditLog, Claim

User = get_user_model()

def log_claim_event(*, claim: Claim, actor: Optional[User], action: str,
                    note: Optional[str] = None, role: Optional[str] = None,
                    meta: Optional[Dict[str, Any]] = None) -> AuditLog:
    """
    Write one line to the audit log for a claim.
    """
    return AuditLog.objects.create(
        action=action,
        actor=actor,
        meta={
            "note": note,
            "role": role,
            **(meta or {})
        }
    )
