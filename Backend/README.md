# 🏥 SGSS Medical Fund — Backend (Django REST Framework)

A secure, bylaws-compliant backend API for the **Siri Guru Singh Sabha Medical Fund (SGSS Mombasa)**.
Implements membership management, claims processing, reimbursements, chronic illness tracking, notifications, and role-based access — aligned with the **Medical Fund Constitution (2015)** and **Byelaws (2024)**.

---

## 🚀 Quick Start

### 1️⃣ Clone & Setup Environment

```bash
git clone https://github.com/<your-org>/sgssportal.git
cd sgssportal/backend
python -m venv venv
source venv/Scripts/activate    # (on Windows: .\venv\Scripts\activate)
pip install -r requirements.txt
```

### 2️⃣ Environment Variables (`.env`)

Create a `.env` file inside `/backend`:

```bash
DEBUG=True
SECRET_KEY=your_secret_key_here
DATABASE_URL=postgres://postgres:postgres@localhost:5432/sgss_medical_fund
```

---

### 3️⃣ Database Setup

```bash
python manage.py makemigrations
python manage.py migrate
```

Then load sample data:

```bash
python manage.py seed_sgss
```

---

### 4️⃣ Run Server

```bash
python manage.py runserver
```

Server: [http://127.0.0.1:8000](http://127.0.0.1:8000)
Admin Panel: [http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/)

Default Users:

| Role      | Email                                           | Password       |
| --------- | ----------------------------------------------- | -------------- |
| Admin     | [admin@sgss.com](mailto:admin@sgss.com)         | `admin123`     |
| Committee | [committee@sgss.com](mailto:committee@sgss.com) | `committee123` |
| Member    | [member@sgss.com](mailto:member@sgss.com)       | `member123`    |

---

## 🔐 Authentication

**JWT (JSON Web Tokens)** via `djangorestframework-simplejwt`.

| Endpoint                   | Method | Description                    |
| -------------------------- | ------ | ------------------------------ |
| `/api/auth/token/`         | `POST` | Obtain Access & Refresh tokens |
| `/api/auth/token/refresh/` | `POST` | Refresh Access Token           |
| `/api/auth/token/verify/`  | `POST` | Verify Token Validity          |
| `/api/me/`                 | `GET`  | Returns logged-in user details |

> Swagger supports Bearer tokens: click **“Authorize”** → enter `Bearer <access_token>`.

---

## 📘 API Documentation

| UI                    | URL             | Description              |
| --------------------- | --------------- | ------------------------ |
| Swagger (interactive) | `/swagger/`     | Live testing interface   |
| ReDoc (static)        | `/redoc/`       | Clean documentation view |
| JSON Schema           | `/swagger.json` | Raw OpenAPI export       |

---

## 🧱 Core Modules Overview

| Module                | Description                                           | Key Models                          |
| --------------------- | ----------------------------------------------------- | ----------------------------------- |
| **Membership**        | Registration, validation, waiting period              | `Member`, `MembershipType`          |
| **Claims Processing** | Claim creation, totals, fund/member share, exclusions | `Claim`, `ClaimItem`, `ClaimReview` |
| **Reimbursements**    | Category-based fund share percentages                 | `ReimbursementScale`                |
| **Chronic Illness**   | Long-term medication requests                         | `ChronicRequest`                    |
| **Attachments**       | Medical documents and receipts                        | `ClaimAttachment`                   |
| **Settings**          | Key-value store for fund config                       | `Setting`                           |
| **Notifications**     | Alerts for claim submission, approval, and updates    | `Notification`                      |
| **Auditing**          | Logs all CRUD operations for traceability             | `AuditLog`                          |

---

## ⚙️ Key Business Rules (Bylaws & Constitution Compliance)

| Rule                                   | Implementation                      |
| -------------------------------------- | ----------------------------------- |
| 60-day membership waiting period       | `Member.is_active_for_claims()`     |
| 90-day claim submission limit          | `Claim.clean()`                     |
| Annual limit (Ksh 250,000 per member)  | `Claim.compute_payable()`           |
| Critical illness add-on (Ksh 200,000)  | Stored in `Setting.general_limits`  |
| Reimbursement rates (80/20 default)    | `ReimbursementScale`                |
| In-house outpatient (100%)             | Auto-applied for SGN Clinic         |
| NHIF / Other deductions                | Included in `Claim.other_insurance` |
| Exclusions (cosmetic, transport, etc.) | `Claim.excluded=True`               |
| Discretionary override (≤ 150,000)     | Enforced via `ClaimReview.clean()`  |
| Notifications & audit trail            | Auto-generated in `signals.py`      |
| JWT-based authentication               | via `simplejwt`                     |
| Swagger documentation                  | via `drf_yasg`                      |

---

## 🧪 Example API Routes

| Endpoint                     | Description                    |
| ---------------------------- | ------------------------------ |
| `/api/members/`              | View all members               |
| `/api/claims/`               | Submit or review claims        |
| `/api/claim-items/`          | Add claim line items           |
| `/api/claim-reviews/`        | Approve or reject claims       |
| `/api/reimbursement-scales/` | Manage fund share settings     |
| `/api/chronic-requests/`     | Manage chronic illness meds    |
| `/api/claim-attachments/`    | Upload related documents       |
| `/api/settings/`             | Retrieve or update fund limits |
| `/api/notifications/`        | System notifications           |
| `/api/audit-logs/`           | Admin action logs              |

---

## 🧠 Developer Notes

* **Signals** handle claim recalculations and notifications (recursion-safe).
* **@transaction.atomic** ensures database integrity during fund calculations.
* **Role-based access** is enforced via Django Groups (admin, committee, member).
* **Seeder** initializes minimal data for local testing.

---

## 🧩 Future Enhancements

| Feature                              | Description                       | Status      |
| ------------------------------------ | --------------------------------- | ----------- |
| Family members & dependents          | Multiple beneficiaries per member | 🟡 Planned  |
| Email/SMS notifications              | Send alerts via Celery + Twilio   | 🟡 Planned  |
| PDF Claim Reports                    | Auto-generate claim summary PDFs  | 🟡 Planned  |
| Aggregated Dashboards                | Fund-wide statistics for admins   | 🟡 Planned  |
| API Pagination & Filtering           | Enhanced query support            | 🟢 Partial  |
| Integration with Supabase / Firebase | Optional future sync              | 🟡 Possible |

---

## 🧰 Tech Stack

| Layer         | Tool                       |
| ------------- | -------------------------- |
| Backend       | Django REST Framework      |
| Auth          | JWT (SimpleJWT)            |
| Database      | PostgreSQL                 |
| Documentation | drf-yasg (Swagger / ReDoc) |
| File Storage  | Django Media / FileField   |
| ORM           | Django Models              |
| Task Safety   | `@transaction.atomic`      |
| Frontend      | React + Vite (separate)    |

---

## 👨‍💻 Maintainer

**Abraham John**  
Software Engineer, Fullstack Developer, Security Analyst  
📍 Mombasa, Kenya  
📧 [jabrahamjohns@gmail.com](mailto:jabrahamjohns@gmail.com)  
🔗 [LinkedIn](https://www.linkedin.com/in/jabrahamjohns)