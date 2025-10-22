# 🧭 SGSS MEDICAL FUND SYSTEM — FRONTEND BUILD & WORKFLOW DOCUMENTATION

## 💧 System Summary

The **SGSS Medical Fund Portal** digitizes operations for the Siri Guru Singh Sabha Medical Fund. It handles membership, medical claims, chronic illness requests, claim reviews, and notifications according to the SGSS Constitution (2015) and Medical Fund Bylaws (2024).

Backend is powered by **Django REST Framework**, and the frontend (React/Vite) consumes REST APIs to provide a modern, responsive web experience.

---

## ⚙️ System Architecture Overview

| Layer             | Technology                         | Purpose                               |
| ----------------- | ---------------------------------- | ------------------------------------- |
| **Frontend**      | React + TypeScript + Tailwind      | Web UI for Members, Committee, Admins |
| **Backend**       | Django REST Framework              | REST API, validation, business logic  |
| **Database**      | PostgreSQL                         | Persistent data storage               |
| **Media Storage** | Local `/media/` (S3 in production) | Claim attachments                     |
| **Auth & Roles**  | Django Groups                      | Role-based access control             |
| **Deployment**    | Local (dev) / VPS / Supabase       | Hosting & production-ready setup      |

---

## 👥 User Roles & Responsibilities

| Role          | Description            | Capabilities                                                                |
| ------------- | ---------------------- | --------------------------------------------------------------------------- |
| **Member**    | Registered beneficiary | Submit/view claims, chronic requests, attachments, notifications            |
| **Committee** | Fund reviewers         | Approve/reject claims, review chronic requests, manage reimbursement scales |
| **Admin**     | Fund administrator     | Manage users, settings, ceilings, audit logs                                |

---

## 🛠️ Core Functional Modules

### 1. Membership Management

* Admin registers members, assigns membership type (Single/Family).
* Backend enforces **60-day waiting period**.
* Member can view membership validity & annual limits.

**Frontend:** Dashboard card showing membership status and expiry.

### 2. Claims Processing

**Flow:**

1. Member creates claim → selects `Inpatient` / `Outpatient` / `Chronic`.
2. Adds claim items and uploads receipts.
3. Submits → status = `submitted`.
4. Committee reviews → updates to `reviewed`, `approved`, or `rejected`.
5. System auto-computes payable vs member share.
6. Notifications sent to member.

**Frontend:** Multi-step claim form, claim history table, claim detail view, upload section.

### 3. Chronic Illness Requests

* Member submits recurring medicine details.
* Committee approves/rejects.
* Member tracks medication request status.

**Frontend:** Chronic medication page with request form and approval history.

### 4. Reimbursement & Settings

* Admin configures annual limits, ceilings, fund share percentages.
* Committee can adjust category-based reimbursement scales.

**Frontend:** Settings dashboard (Admin view) + scales management table.

### 5. Notifications & Audit Trail

* Automatic alerts for all role-related actions.
* Committee/admin actions logged for transparency.

**Frontend:** Notification dropdown, mark-as-read feature, audit page (admin only).

### 6. File Attachments

* Members upload claim documents (PDF/JPG/PNG).
* Stored in `/media/claim_attachments/`.

**Frontend:** File upload input with preview & delete functionality.

---

## 🔐 Authentication & Access Flow

* Session-based authentication via Django.
* Frontend stores session cookie; backend identifies user role.

| Role      | Redirect               | Default Dashboard        |
| --------- | ---------------------- | ------------------------ |
| Member    | `/dashboard/member`    | Claims, Chronic Requests |
| Committee | `/dashboard/committee` | Reviews, Approvals       |
| Admin     | `/dashboard/admin`     | Members, Settings        |

---

## 📊 Data Lifecycle Example (Outpatient Claim)

| Step | Actor     | Description                                     |
| ---- | --------- | ----------------------------------------------- |
| 1    | Member    | Submits new claim with receipts                 |
| 2    | Backend   | Validates submission window & membership status |
| 3    | Committee | Reviews and approves/rejects                    |
| 4    | Backend   | Recalculates payable & logs event               |
| 5    | System    | Sends notification to member                    |
| 6    | Admin     | Marks claim as paid if approved                 |
| 7    | System    | Updates audit logs                              |

---

## 💡 Backend Rules Enforced

* **Waiting Period:** 60 days post-membership start.
* **Submission Window:** Within 90 days of treatment.
* **Annual Benefit Cap:** 250,000 KES.
* **Critical Illness Add-on:** +200,000 KES.
* **Fund Share:** 80% fund / 20% member.
* **Override Limit:** Up to 150,000 KES.
* **Automatic Notifications:** All major actions trigger alerts.

---

## 🛪️ Frontend Developer Responsibilities

| Area               | Task                                          | Notes                                    |
| ------------------ | --------------------------------------------- | ---------------------------------------- |
| **Authentication** | Implement login/logout & role-based redirects | Session auth with Django cookies         |
| **Routing**        | Setup protected routes for each role          | Use React Router 6                       |
| **Forms**          | Build claim & chronic request forms           | Include validation and multi-step wizard |
| **File Uploads**   | Connect to `/api/claim-attachments/`          | Support multiple uploads                 |
| **Data Fetching**  | Create centralized Axios/Fetch API client     | Handle errors and timeouts               |
| **UI State**       | Manage global state                           | React Context or Zustand                 |
| **Design**         | Use Tailwind or ShadCN                        | SGSS theme (blue/gold/white)             |
| **Testing**        | Verify all workflows using seeded data        | Focus on claim logic and review flows    |

---

## 📂 Collaboration & Workflow

| Step | Role         | Action                                     |
| ---- | ------------ | ------------------------------------------ |
| 1    | Abraham      | Maintains backend and endpoint definitions |
| 2    | Frontend Dev | Builds UI and integrates APIs              |
| 3    | Both         | Test claim flows end-to-end locally        |
| 4    | Abraham      | Handles backend deployment                 |
| 5    | Frontend Dev | Deploys React app to Vercel or Netlify     |

**Branches:**

* `main` – Stable version
* `dev` – Active development
* `feature/*` – Feature branches for new modules

---

## 🚀 Deployment Notes

**Local:**

* Backend: `python manage.py runserver`
* Frontend: `npm run dev`
* API: `http://localhost:8000/api/`
* UI: `http://localhost:5173/`

**Production:**

* Backend → VPS/Supabase
* Frontend → Vercel/Netlify
* Storage → AWS S3 or Supabase Storage

---

## ✅ Summary for Frontend Collaborator

1. Understand the **roles and workflows** (Member, Committee, Admin).
2. Base the frontend on REST endpoints from Django.
3. Build dashboards and forms according to user journeys.
4. Use session cookies for auth.
5. Keep all actions transactional and user-role scoped.
6. Work in feature branches and test against backend seed data.

This ensures the SGSS portal runs smoothly, respecting both the technical and governance logic of the Medical Fund.
