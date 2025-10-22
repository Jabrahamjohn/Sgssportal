# 🧭 SGSS MEDICAL FUND SYSTEM — WORKFLOW & FRONTEND BUILD OVERVIEW

## 🏗️ System Summary

The **SGSS Medical Fund Portal** digitizes all operations of the Siri Guru Singh Sabha Medical Fund.
It handles **member management**, **medical claims**, **chronic illness requests**, **claim reviews**, and **fund governance** as per the Constitution (2015) and Bylaws (2024).

The backend (Django REST Framework) exposes structured APIs for the frontend (React/Vite) to interact with.

---

## ⚙️ System Architecture Overview

| Layer             | Technology                              | Purpose                                     |
| ----------------- | --------------------------------------- | ------------------------------------------- |
| **Frontend**      | React + TypeScript + Tailwind (Planned) | Web UI for Members, Committee, and Admins   |
| **Backend**       | Django + DRF                            | REST API, business logic, rules enforcement |
| **Database**      | PostgreSQL                              | Persistent data storage                     |
| **Media Storage** | Local `/media/` (S3 in production)      | Claim attachments and supporting documents  |
| **Auth & Roles**  | Django Groups & Permissions             | Role-based system access                    |
| **Deployment**    | Local (Dev) / Supabase / VPS            | Backend hosting                             |
| **Integration**   | REST over HTTPS                         | JSON-based communication                    |

---

## 👥 User Roles & Permissions

| Role          | Description                              | Key Capabilities                                                                                                                                                                                  |
| ------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Member**    | Registered SGSS Medical Fund beneficiary | - View personal details<br>- Submit medical claims<br>- Upload claim attachments<br>- Request chronic illness medication<br>- View claim status<br>- View notifications                           |
| **Committee** | Fund review committee                    | - View all submitted claims<br>- Review and approve/reject claims<br>- Add claim reviews/notes<br>- Manage reimbursement scales<br>- Approve chronic requests<br>- Access reports and analytics   |
| **Admin**     | Fund administrators and SGSS leadership  | - Manage users and membership types<br>- Configure global settings (limits, ceilings, shares)<br>- Manage reimbursement scales<br>- Access and export audit logs<br>- Oversee all data operations |

---

## 🧩 Core Functional Modules (System Flow)

### 1️⃣ **Membership Management**

**Purpose:** Register and maintain fund members and their coverage types.

**Data Flow:**

* Admin adds or updates **Membership Types** (e.g., Single, Family, Senior).
* Admin creates or approves **Member** profiles → assigns membership type, NHIF number, and validity period.
* Backend ensures **60-day waiting period** before a member becomes eligible for claims.

**Frontend Tasks:**

* Member registration form (Admin view)
* Member dashboard showing membership status, expiry, and limits

---

### 2️⃣ **Claims Processing**

**Purpose:** Members request medical reimbursement according to fund rules.

**Workflow:**

1. **Member creates claim** → selects type (`Inpatient`, `Outpatient`, `Chronic`).
2. Adds **claim items** (consultation, drugs, procedures, etc.).
3. Uploads **attachments** (receipts, NHIF slips, doctor report).
4. Submits → claim status = `submitted`.
5. **Committee reviews:**

   * May set status to `reviewed`, `approved`, `rejected`, or `paid`.
   * May enter discretionary override if necessary (≤ Ksh 150,000).
6. Claim undergoes **auto-computation**:

   * Fund share = 80%
   * Member share = 20%
   * NHIF/other insurance amounts deducted
   * Ceilings and annual limits enforced
7. **Member gets notifications** of each update.

**Frontend Tasks:**

* Claim submission form (multi-step)
* Claim detail view with itemized charges
* Upload section for documents
* Real-time status updates (via notifications)
* Review dashboard (Committee view)

---

### 3️⃣ **Chronic Illness Requests**

**Purpose:** For members with recurring medical conditions requiring monthly drug support.

**Workflow:**

1. Member submits chronic medication list (JSON-style: name, strength, dosage, duration).
2. Request reviewed by committee.
3. Committee updates status: `pending` → `approved` or `rejected`.
4. Member receives notification and can view approved medicines.

**Frontend Tasks:**

* Chronic request form
* Chronic medicine tracker (status timeline)
* Admin/Committee chronic list management

---

### 4️⃣ **Reimbursement & Settings**

**Purpose:** Define global financial limits, rules, and ceilings.

**Managed By:** Admins & Committee.

**Data Flow:**

* `Settings` model holds key configurations:

  * Annual benefit limits (Ksh 250,000)
  * Critical illness top-up (Ksh 200,000)
  * Fund share percentage (80%)
* `Reimbursement Scales` define category-based limits.

**Frontend Tasks:**

* Admin dashboard: configurable fields for ceilings & fund shares
* Committee view: adjustable reimbursement scales table

---

### 5️⃣ **Notifications & Audit Trail**

**Purpose:** Track every system action and notify relevant users.

**Events Trigger Notifications:**

* Claim submission, approval, or rejection
* Chronic request updates
* Admin changes or overrides

**Frontend Tasks:**

* Notification panel for all roles
* “Mark as read” interaction
* Audit log page (Admin only)

---

### 6️⃣ **Attachments (File Uploads)**

**Purpose:** Store supporting claim documents.

**Data Flow:**

* Member uploads claim files (PDFs, images)
* Stored in `/media/claim_attachments/`
* Linked to claim via `ClaimAttachment` model
* Downloadable via API

**Frontend Tasks:**

* File upload component (drag & drop)
* File preview/download link per claim

---

## 🔐 7️⃣ Authentication & Access Flow

**Auth Framework:** Django session-based authentication (cookie stored).

**Frontend Behavior:**

* On login, session cookie stored in browser
* Axios/Fetch automatically sends cookie on every request
* Backend identifies user role via Django Groups

**Frontend Routing Example:**

| Role      | Default Route          | Redirects  |
| --------- | ---------------------- | ---------- |
| Member    | `/dashboard/member`    | `/claims`  |
| Committee | `/dashboard/committee` | `/reviews` |
| Admin     | `/dashboard/admin`     | `/members` |

---

## 🔄 8️⃣ Data Lifecycle Example

**Claim Example (Outpatient):**

| Step | Action                                           | Responsible | Status                  |
| ---- | ------------------------------------------------ | ----------- | ----------------------- |
| 1    | Submit new claim with items & attachments        | Member      | `submitted`             |
| 2    | Auto-validation (waiting period, NHIF, ceilings) | Backend     | -                       |
| 3    | Review claim                                     | Committee   | `reviewed`              |
| 4    | Approve or reject                                | Committee   | `approved` / `rejected` |
| 5    | Update payable calculations                      | Backend     |                         |
| 6    | Notify member                                    | System      | Notification sent       |
| 7    | Pay claim                                        | Admin       | `paid`                  |
| 8    | Log event                                        | System      | Audit log entry         |

---

## 🧮 9️⃣ Key Backend Rules Enforced by API

| Rule                        | Description                                         |
| --------------------------- | --------------------------------------------------- |
| **Waiting Period**          | 60 days before first claim eligibility              |
| **Claim Submission Window** | Must be submitted within 90 days of discharge/visit |
| **Annual Benefit Cap**      | Max 250,000 per member/year                         |
| **Critical Illness Top-up** | +200,000 for qualifying critical conditions         |
| **Fund Share Ratio**        | 80% fund / 20% member (varies by category)          |
| **Discretionary Override**  | Up to 150,000, by committee                         |
| **Exclusions**              | Cosmetic, infertility, etc. (manually flagged)      |
| **Notifications**           | Sent automatically on every claim status change     |

---

## 🧠 10️⃣ Frontend Developer Focus Points

| Area                    | Responsibility                                      | Notes                                          |
| ----------------------- | --------------------------------------------------- | ---------------------------------------------- |
| **Authentication Flow** | Build login, logout, session persistence            | Backend uses session-based cookies             |
| **Role Detection**      | Identify role from `/api/members/` or user endpoint | Redirect dashboard accordingly                 |
| **Forms**               | Build modular claim and chronic request forms       | Validation & dynamic lists (e.g., claim items) |
| **File Uploads**        | Connect to `/api/claim-attachments/`                | Support multiple files                         |
| **Data Fetching**       | Centralized Axios API handler                       | Handle 401 → redirect to login                 |
| **UI State**            | Use React Context or Zustand                        | For notifications & current user               |
| **Routing**             | React Router 6                                      | Protect routes by role                         |
| **Design**              | Use Tailwind or ShadCN                              | Match SGSS theme (blue/gold/white)             |
| **Error Handling**      | Surface Django validation errors cleanly            | e.g. 400 messages on claim form                |

---

## 🧑‍💻 11️⃣ Team Collaboration Workflow

| Step | Who          | Description                                           |
| ---- | ------------ | ----------------------------------------------------- |
| 1    | Abraham      | Maintains backend API, data logic, and endpoint specs |
| 2    | Frontend Dev | Builds UI, integrates REST endpoints                  |
| 3    | Both         | Test flows together in dev environment                |
| 4    | Abraham      | Approves PRs or merges after backend sync             |
| 5    | Both         | QA: ensure claims and notifications flow end-to-end   |
| 6    | Abraham      | Handles deployment of backend and frontend builds     |

---

## 🚀 12️⃣ Build & Deployment Notes

**Local Development**

* Backend: `python manage.py runserver`
* Frontend: `npm run dev`
* Access API via: `http://localhost:8000/api/`
* Access frontend via: `http://localhost:5173/`

**Production Plan**

* Backend: deploy to VPS or Render/Supabase
* Frontend: deploy to Vercel or Netlify
* Media storage: migrate `/media/` → AWS S3 or Supabase Storage

---

## ✅ Final Recap

The **Frontend Developer’s primary goals** are:

1. Implement **role-based dashboards**.
2. Build **data-driven components** consuming REST APIs.
3. Enable **file uploads**, **form validation**, and **notifications**.
4. Maintain **clean modular structure** — you’ll define your own boilerplate.
5. Ensure the **system’s workflow mirrors real SGSS operations** as above.
