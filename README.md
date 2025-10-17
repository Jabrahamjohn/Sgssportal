


# SGSS Portal - Medical Fund Management System

A comprehensive medical fund management system built with React, TypeScript, and Supabase for managing members, claims, reimbursements, and fund administration.

---

## 🌟 Overview

The *SGSS Portal* is a modern, full-featured *medical fund management system* designed to streamline the entire claims process — from submission to approval and reimbursement.  

Built with cutting-edge technologies, it ensures *security, **scalability, and **ease of use* for both members and administrators.

---

## ✨ Key Features

### 👥 Member Management
- *Multi-tier Membership*: Life, Patron, Vice Patron, Family, Joint, and Single memberships  
- *NHIF Integration*: Seamless NHIF number validation  
- *Profile Management*: Editable profiles with photo uploads  
- *Membership Validation*: Automated validity tracking  

### 📋 Claims Processing
- *Multiple Claim Types*:
  - Outpatient
  - Inpatient
  - Chronic Illness
  - Emergency Services  
- *Status Workflow*: Draft → Submitted → Processed → Approved → Paid  
- *Automated Calculations*: In line with fund bylaws  
- *Document Uploads*: Secure receipts and medical file handling  
- *Bulk Claim Management*: Process multiple claims efficiently  

### 🔐 Administration & Security
- *Role-Based Access Control* (RBAC): Member, Committee, Admin, Trustee, Claims Officer  
- *Advanced Settings*: Reimbursement scales, annual limits, bylaws configuration  
- *Comprehensive Reporting*: Real-time analytics  
- *Audit Logging*: Tracks every action for compliance  
- *Row-Level Security (RLS)* for fine-grained data protection  

### ⚡ Technical Excellence
- Real-time synchronization  
- PDF export for reports and claims  
- Mobile-first responsive design  
- 100% TypeScript for reliability  
- Progressive Web App (PWA) ready  

---

## 🛠 Technology Stack

### Frontend
- *React 18* – Modern hooks and concurrent rendering  
- *TypeScript* – Type safety for large-scale code  
- *Vite* – Fast build and hot reload  
- *Tailwind CSS* – Utility-first styling  
- *Lucide React* – Clean, lightweight icons  

### Backend
- *Supabase* – PostgreSQL, Authentication, Storage, Functions  
- *PostgreSQL* – Relational database with triggers and views  
- *Edge Functions* – For automated emails and audits  

### Libraries
- *Zustand* – Lightweight state management  
- *React Query* – API data caching and revalidation  
- *React Hook Form* + *Zod* – Validation and forms  
- *jsPDF* – PDF generation  
- *Date-fns* – Date utilities  

---

## 📋 Prerequisites

You’ll need:
- Node.js v18+
- npm v8+ or yarn v1.22+
- Supabase CLI
- Git (latest)

---

## 🚀 Installation & Setup

### 1️⃣ Clone Repository
```bash
git clone https://github.com/Jabrahamjohn/Sgssportal.git
cd Sgssportal

2️⃣ Install Dependencies

npm install
# or
yarn install

3️⃣ Environment Variables

Create a .env file in your project root:

VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

4️⃣ Database Setup (Local)

npm install -g supabase
npx supabase start
npx supabase db push
npx supabase db reset --seed

5️⃣ Run Development Server

npm run dev

Open ➡ http://localhost:5173

⸻

🗄 Database Architecture

Table	Description
users	Basic user info & roles
members	Linked member profiles
membership_types	Membership category & limits
claims	Claim data and processing status
claim_items	Detailed line items per claim
chronic_requests	Chronic illness medication tracking
settings	Fund rules, tiers, reimbursement scales
notifications	Alerts, system messages, claim updates
audit_logs	Historical user activity
roles	Role definitions for RBAC


⸻

🔐 Security
	•	Supabase Auth (email/magic link login)
	•	Row-Level Security (RLS) on all tables
	•	Role-based policies for each table
	•	Audit Logs for system traceability

⸻

📁 Project Structure

src/
├── components/
│   ├── admin/
│   ├── auth/
│   ├── claims/
│   ├── layout/
│   ├── members/
│   ├── system/
│   └── ui/
├── hooks/
├── pages/
├── services/
├── types/
├── utils/
└── styles/


⸻

👥 User Roles & Permissions

Role	Description	Permissions
Member	Registered fund member	Submit & track claims
Committee	Claim reviewers	Review & recommend claims
Admin	System administrator	Full access
Trustee	Oversight role	View analytics, approve limits
Claims Officer	Processor	Validate and compute reimbursements


⸻

💰 Reimbursement Framework

Tier	Annual Limit	Coverage	Example
Minor	30,000	100%	Consultations, meds
Medium	35,000	100%	Diagnostic tests
Major	50,000	100%	Surgeries
Regional	90,000	80%	Specialized treatment
Special	70,000	80%	Emergency, ICU


⸻

🔄 Claims Workflow

graph TD
A[Member Creates Draft] --> B[Submit for Review]
B --> C[Claims Officer Review]
C --> D{Docs Complete?}
D -->|No| E[Request Info]
E --> C
D -->|Yes| F[Calculate Reimbursement]
F --> G[Committee Approval]
G --> H{Approved?}
H -->|No| I[Return with Comments]
H -->|Yes| J[Mark as Paid]
J --> K[Generate Payment Report]


⸻

🧩 Development Scripts

Command	Description
npm run dev	Start dev server
npm run build	Production build
npm run preview	Test production build
npm run lint	Lint code
npm run test	Run test suites
npx supabase db reset	Reset database


⸻

🧪 Testing

npm run test
npm run test:watch
npm run test:coverage


⸻

📦 Deployment

Vercel

npm install -g vercel
vercel --prod

Netlify

npm run build
# then upload /dist

Docker

FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["npx", "serve", "-s", "dist", "-l", "3000"]


⸻

🤝 Contributing

Steps:
	1.	Fork repo
	2.	Create branch: git checkout -b feature/new-feature
	3.	Commit: git commit -m "Added new feature"
	4.	Push: git push origin feature/new-feature
	5.	Open Pull Request

⸻

📄 License

Licensed under the MIT License.
See the LICENSE file for details.

⸻

🆘 Support

📧 Email: support@sgssportal.com
🌐 Website: https://sgssportal.com
📱 WhatsApp: +254-XXX-XXX-XXX

⸻

🙏 Acknowledgments

Built with ❤ by Abraham John and contributors for the SGSS Medical Fund community.
Powered by Supabase & Vercel.

⸻

🧭 Appendix A — Local Developer Guide

🧩 Database Lifecycle Commands

Command	Purpose
npx supabase db push	Apply migrations
npx supabase db reset	Reset database (drops + seeds)
npx supabase start	Start local Supabase instance
npx supabase stop	Stop local Supabase
npx supabase functions serve	Serve edge functions locally

⚙ Local Mail Testing (Mailpit)

When running npx supabase start, Supabase sets up Mailpit for local email capture.
Visit http://localhost:8025 to see magic links and password reset emails.

🧱 Troubleshooting Common Errors

Issue	Solution
there is no unique or exclusion constraint matching the ON CONFLICT specification	Ensure your seed inserts use ON CONFLICT (key) or correct primary key constraints
trigger does not exist, skipping	Safe to ignore — Supabase skips missing triggers automatically
Login magic link works but blank screen	Ensure .env VITE_SUPABASE_URL matches local instance URL (e.g., http://127.0.0.1:54321)
Seed fails midway	Drop schema manually: npx supabase db reset --force

🔑 Default Seed Accounts

Role	Email	Password	Description
Admin	admin@sgss.com	Magic Link Only	Full control
Committee	committee@sgss.com	Magic Link Only	Approvals
Member	member@sgss.com	Magic Link Only	Claims submission


## 🧭 Appendix B — Database Schema & Relationships (ERD)

### 🧩 Entity Relationship Overview
Below is a high-level diagram showing how all SGSS Medical Fund tables connect.

```mermaid
erDiagram
    AUTH_USERS ||--o{ USERS : "linked via id"
    USERS ||--o{ MEMBERS : "each member belongs to one user"
    MEMBERS ||--o{ CLAIMS : "one member can file many claims"
    CLAIMS ||--o{ CLAIM_ITEMS : "detailed claim line items"
    MEMBERS ||--o{ CHRONIC_REQUESTS : "long-term medication"
    USERS ||--o{ NOTIFICATIONS : "system alerts and messages"
    USERS ||--o{ AUDIT_LOGS : "activity tracking"
    ROLES ||--o{ USERS : "role assignment"
    MEMBERSHIP_TYPES ||--o{ MEMBERS : "membership category"
    SETTINGS ||--o{ REIMBURSEMENT_SCALES : "configurable fund rules"

🗂 Table Relationships in Detail

Table	Key Columns	Description	Related To
auth.users	id, email	Managed by Supabase Auth	→ public.users
public.users	id, email, role	App-level users	→ members, notifications, audit_logs
roles	id, name	Defines user roles	→ users
membership_types	id, key, annual_limit	Configurable tiers	→ members
members	id, user_id, membership_type_id	Member profiles	→ claims, chronic_requests
claims	id, member_id, status, total_claimed	Medical claims	→ claim_items, notifications
claim_items	id, claim_id, amount	Detailed cost lines	→ claims
chronic_requests	id, member_id, doctor_name	Chronic illness requests	→ members
reimbursement_scales	id, category, fund_share, member_share, ceiling	Reimbursement logic	—
settings	key, value	Global configuration	—
notifications	id, recipient_id, message, type	System alerts	→ users
audit_logs	id, actor_id, action, meta	History and traceability	→ users


⸻

⚙ Triggers & Functions Summary

Trigger / Function	Table	Purpose
handle_new_user()	auth.users	Auto-create entry in public.users when new user signs up
log_audit_event()	multiple tables	Inserts record into audit_logs on insert/update/delete
notify_on_claim_event()	claims	Generates notification when claim submitted or status changes
trigger_email_on_notification()	notifications	Sends email via Edge function after new notification
compute_claim_payable()	claims	Calculates reimbursement payable amount (based on fund rules)


⸻

🔐 Row Level Security Policies

Table	Policy	Access Granted To
users	self-read/update	current authenticated user
members	same user or admin	members + admins
claims	owner (member) or committee/admin	claim visibility
claim_items	follows parent claim	same RLS as claims
chronic_requests	owner (member) or committee	restricted by role
notifications	recipient only	secure user notifications
audit_logs	admin/trustee only	compliance records
settings, reimbursement_scales	admin/trustee	configuration control


⸻

🧮 Automatic Processes
	1.	New User Signup → Inserts into public.users
	2.	New Claim → Creates notification + audit log
	3.	Claim Update → Sends notification email
	4.	Database Reset (Development) → Seeds default users and test claims

⸻

🧰 Developer Notes
	•	Run npx supabase db push after every migration update.
	•	Keep supabase/seed.sql in sync with current schema.
	•	Always verify RLS policies after schema changes.
	•	For quick debugging, use Supabase Studio → SQL Editor → SELECT * FROM audit_logs ORDER BY created_at DESC;

⸻

End of Appendix B
(Schema Diagram & Database Reference — v2.0.0 | October 2025)

---
⸻


## ⚙ Appendix C — Supabase Edge Functions & Automation Guide

### 🌐 Overview

Supabase Edge Functions provide secure, server-side logic that runs close to the database.
They are used in *SGSS Portal* to send notifications, manage automated jobs,
and perform administrative tasks such as email dispatch and scheduled claim reviews.

---

### 📨 Core Functions

| Function Name | Path | Trigger | Description |
|---------------|------|----------|--------------|
| **send-notification-email** | /functions/v1/send-notification-email | Trigger: notifications → AFTER INSERT | Sends transactional emails for claim updates and system alerts |
| **daily-claim-summary** | /functions/v1/daily-claim-summary | Cron (24 h) | Compiles a summary of new claims and status changes for committee members |
| **cleanup-temp-files** | /functions/v1/cleanup-temp-files | Cron (weekly) | Removes unused or expired attachments from Supabase Storage to save space |
| **recalculate-claims** | /functions/v1/recalculate-claims | Manual (Admin Panel) | Forces re-evaluation of claim payables when fund rules change |
| **sync-settings-cache** | /functions/v1/sync-settings-cache | Trigger: settings → AFTER UPDATE | Keeps Edge Function cache in sync with database configuration changes |

---

### 📬 Function Example — send-notification-email

```ts
// supabase/functions/send-notification-email/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  const payload = await req.json()
  const record = payload.record

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  )

  // Fetch recipient email
  const { data: user } = await supabase
    .from("users")
    .select("email")
    .eq("id", record.recipient_id)
    .single()

  if (!user) return new Response("User not found", { status: 404 })

  // Compose email
  const subject = [SGSS Portal] ${record.title}
  const body = `
    Hello,
    \n${record.message}
    \n\nView details → ${record.link}
    \n\n— SGSS Medical Fund System
  `

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": Bearer ${Deno.env.get("RESEND_API_KEY")},
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: "SGSS Portal <noreply@sgssportal.com>",
      to: user.email,
      subject,
      text: body
    })
  })

  return new Response("Notification email sent", { status: 200 })
})


⸻

🕓 Scheduled Tasks (Cron)

Supabase supports cron jobs
for recurring automation:

Function	Schedule	Purpose
daily-claim-summary	0 6 * * * → 06:00 EAT daily	Sends morning claim digest to committee email list
cleanup-temp-files	0 3 * * SUN → Sunday 3 AM	Weekly cleanup of attachments and old logs

Deployment command:

npx supabase functions deploy daily-claim-summary --project-ref your_project_ref


⸻

🧠 Environment Variables (for Edge Functions)

Store these securely under Project → Functions → Environment Variables:

Variable	Description
SUPABASE_URL	Base URL of your Supabase project
SUPABASE_SERVICE_ROLE_KEY	Service key for server-side operations
RESEND_API_KEY	API key for sending emails via Resend
SYSTEM_EMAIL_FROM	Default “from” address for outbound emails
CRON_AUTH_SECRET	Optional token to authenticate scheduled jobs


⸻

🔐 Security Considerations
	•	Never expose SUPABASE_SERVICE_ROLE_KEY in frontend code.
	•	Use RLS and Edge Functions for privileged operations only.
	•	Validate payloads using Zod or Deno’s standard validators.
	•	Log function execution to audit_logs for transparency.
	•	Rotate API keys and secrets regularly.

⸻

🧰 Local Development Tips
	1.	Run Supabase locally:

npx supabase start


	2.	Start Edge Functions emulator:

npx supabase functions serve send-notification-email


	3.	Trigger test event:

curl -X POST http://localhost:54321/functions/v1/send-notification-email \
-H "Content-Type: application/json" \
-d '{"record":{"recipient_id":"00000000-0000-0000-0000-000000000001","title":"Test Email","message":"Hello from local dev!","link":"/dashboard"}}'


	4.	View logs in:

supabase/logs/functions/send-notification-email.log



⸻

🧩 Best Practices for Edge Functions
	•	Keep each function small and single-purpose.
	•	Use environment variables for credentials and URLs.
	•	Deploy frequently (npx supabase functions deploy <name>).
	•	Version control Edge Functions under supabase/functions/.
	•	Add error handling and response codes for frontend integration.

⸻

End of Appendix C
(Edge Functions & Automation Guide — v2.0.0 | October 2025)

---
⸻

Version: 2.0.0
Last Updated: October 2025
Status: Active Development 🚀

---
