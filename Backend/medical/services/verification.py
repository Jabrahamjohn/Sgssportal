# medical/services/verification.py
import hashlib
from medical.models import ClaimFingerprint

def calculate_claim_hash(claim):
    """
    Generate a SHA256 hash based on:
    - Member ID
    - Hospital/Provider (from details or notes)
    - Receipt/Invoice Number (from details)
    - Amount
    - Date of Visit/Discharge
    """
    details = claim.details or {}
    
    # Extract identifiers from structured data
    receipt_no = str(details.get('receipt_number', '') or details.get('invoice_number', '')).strip().upper()
    hospital = str(details.get('hospital_name', '') or claim.notes or '').strip().lower()
    amount = str(claim.total_claimed or '0.00')
    date_val = str(claim.date_of_first_visit or claim.date_of_discharge or '')

    # Salt with Member ID to prevent cross-member collisions on generic receipt numbers
    data = f"{claim.member_id}|{hospital}|{receipt_no}|{amount}|{date_val}"
    
    return hashlib.sha256(data.encode()).hexdigest()

def check_for_duplicate(claim):
    """
    Returns (hash_value, is_duplicate)
    """
    h = calculate_claim_hash(claim)
    exists = ClaimFingerprint.objects.filter(hash_value=h).exclude(claim=claim).exists()
    return h, exists

def register_claim_fingerprint(claim):
    """
    Store the hash for a claim to prevent future duplicates.
    """
    h = calculate_claim_hash(claim)
    ClaimFingerprint.objects.get_or_create(
        claim=claim,
        defaults={'hash_value': h}
    )
