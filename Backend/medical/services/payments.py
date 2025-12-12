import logging
from django.conf import settings
from decimal import Decimal

logger = logging.getLogger(__name__)

class PaymentService:
    """
    Service layer for handling payment interactions.
    Currently a stub implementation for future M-Pesa / Bank integration.
    """
    
    @staticmethod
    def initiate_payment(member, amount, description, reference=None):
        """
        Initiate a payment from Member to Fund (e.g. premiums)
        OR Fund to Member (e.g. claim payout).
        """
        amount = Decimal(amount)
        logger.info(f"Initiating payment of {amount} for {member} - {description}")
        
        # TODO: Integrate with M-Pesa Daraja API or Bank API here.
        # For now, we simulate a successful transaction.
        
        return {
            "status": "success",
            "transaction_id": f"SIM_{reference or 'GEN'}_12345",
            "provider": "MPESA_SIMULATOR",
            "amount": str(amount)
        }

    @staticmethod
    def process_payout(claim):
        """
        Process a claim payout to a member.
        """
        if claim.status != 'approved':
            raise ValueError("Claim must be approved before payout.")
            
        amount = claim.total_payable
        logger.info(f"Processing payout for Claim {claim.id}: {amount}")
        
        # Simulate API Call
        response = PaymentService.initiate_payment(
            member=claim.member,
            amount=amount,
            description=f"Claim Payout {claim.id}",
            reference=str(claim.id)
        )
        
        return response
