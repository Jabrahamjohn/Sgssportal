# 🔐 ROLE & PERMISSION MODEL

USER → belongs to → GROUP → has PERMISSIONS

Groups:
  • Member
  • Committee
  • Admin (Superuser included)

Permissions:
  Member:
    → Can submit new claims
    → Can upload attachments
    → Can view own claim history
    → Can check balance

  Committee:
    → Everything Member can
    → Can view ALL claims
    → Can review, approve, reject, pay
    → Can add notes
    → Can see audit logs

  Admin:
    → Full access to everything
    → Settings + reimbursement scale
    → Membership types
    → Reports (future module)

## 🔄 FULL CLAIM LIFECYCLE (End to End Flow)

Member → Submits claim  
           │
           ▼
Backend → Creates Claim + Items + Attachments  
           │
           ▼
AuditLog → “submitted” event  
           │
           ▼
Committee → Views claim  
           │
           ▼
Committee → Review → (approved/rejected/reviewed)  
           │
           ▼
AuditLog → “approved/rejected/reviewed” event  
           │
           ▼
If Approved → Claim is payable (80% rules apply)  
           │
           ▼
Committee → Mark Paid  
           │
           ▼
AuditLog → “paid”  
           │
           ▼
Member → Sees updated benefit balance  

### 📁 FILE / MEDIA FLOW

Frontend → upload file → /api/claim-attachments/
                │
                ▼
           MEDIA_ROOT/claim_attachments/YYYY/MM/
                │
                ▼
          ClaimAttachment row created  
                │
                ▼
Audit → logs "attachment_uploaded"  

#### 🔮 FUTURE MODULES (already compatible)

📌 Reporting Engine
📌 Claim PDF Exporter
📌 Monthly Reports Scheduler
📌 Webhooks to account office
📌 AI Fraud Detection (phase 2)
📌 Integration with M-Pesa or NHIF
ge