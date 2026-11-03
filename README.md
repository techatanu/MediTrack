#MediTrack — Personal Health Record Management System

## Current implementation status

The public homepage has been redesigned as MediTrack: it includes responsive navigation, a healthcare hero, product overview, feature showcase, a synthetic assistant preview with a working source-document dialog, workflow explanation, trust information, and signup/login links. The preview is explicitly labeled as synthetic; it does not call an AI endpoint.

The existing authenticated MERN application remains the source of truth for accounts, doctors, and medical reports. Existing upload, list, view, update, delete, search, and signed file access flows remain in place.

| Capability | Status |
| --- | --- |
| Original responsive public landing page | Implemented; build/lint verification pending |
| Existing JWT authentication and report CRUD | Existing functionality retained; not re-verified in this update |
| Private report storage and short-lived download URLs | Existing Cloudinary integration; requires configured credentials |
| OCR, structured extraction, document review, embeddings, vector retrieval, live RAG chat | Not implemented |
| Synthetic assistant and citation preview | Implemented; demo-only, no private or real patient data |
| Production deployment | Not performed |

See [docs/architecture.md](docs/architecture.md) for the current system boundary, local setup, and AI integration prerequisites.

##Project Proposal

##Project Title
**MediTrack – Personal Health Record Management System**

---

###Problem Statement
People often have their medical reports, prescriptions, and test results scattered across photos, WhatsApp messages, or paper files.  
This makes it difficult to access critical information quickly — especially during emergencies or follow-up visits.  

There’s a strong need for a **secure, centralized platform** to organize and share personal medical history with healthcare providers when required.

---

###System Architecture

**Architecture Flow:**  
`Frontend → Backend (API) → Database`

**Stack Overview:**
- 🖥️ **Frontend:** React.js with React Router  
- ⚙️ **Backend:** Node.js + Express.js REST API  
- 🗄️ **Database:** MongoDB (NoSQL) hosted on MongoDB Atlas  
- 🔐 **Authentication:** JWT-based login and authorization  
- ☁️ **Hosting:**
  - Frontend → Vercel  
  - Backend → Render  
  - Database → MongoDB Atlas  

---

### 4️⃣ Key Features

| Category | Features |
|-----------|-----------|
| **Authentication & Authorization** | User registration, login, and role-based access (Admin/User) |
| **CRUD Operations** | Upload, view, update, and delete medical reports and prescriptions |
| **Filtering & Searching** | Filter reports by doctor, date, or category; search by report name |
| **Frontend Routing** | Pages: Home, Login, Dashboard, Upload Report, View Report, Profile |
| **Admin Dashboard** | Manage user accounts and monitor activity |
| **Hosting** | Deployed frontend and backend to public URLs (Vercel + Render) |

---

### 5️⃣ Tech Stack

| Layer | Technologies |
|--------|--------------|
| **Frontend** | React.js, React Router, Axios, Tailwind CSS |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas |
| **Authentication** | JWT (JSON Web Token) |
| **Hosting** | 
Vercel (Frontend) - https://medi-track-lemon.vercel.app/
Render (Backend) - https://meditrack-backend-2zb0.onrender.com/api



---

### 6️⃣ API Overview

| Endpoint | Method | Description | Access |
|-----------|--------|--------------|--------|
| `/api/auth/signup` | POST | Register a new user | Public |
| `/api/auth/login` | POST | Authenticate user and issue token | Public |
| `/api/reports` | GET | Retrieve all reports (with filters & pagination) | Authenticated |
| `/api/reports` | POST | Upload a new report | Authenticated |
| `/api/reports/:id` | PUT | Update report details | Authenticated |
| `/api/reports/:id` | DELETE | Delete a report | Authenticated |
| `/api/users` | GET | View all users (Admin only) | Admin |


