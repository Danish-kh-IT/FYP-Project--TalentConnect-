# 🚀 TalentConnect - Premium Recruitment Intelligence Platform

TalentConnect is a state-of-the-art Job Portal and Recruitment Management System designed to streamline the hiring process for both candidates and employers. Built with a modern tech stack, it provides a seamless, secure, and highly interactive experience for the modern workforce.

---

## ✨ Key Features

### 👤 For Candidates
- **Professional Profiles:** Detailed CV-like profiles with education, experience, and skill management.
- **Resume Parsing:** Securely upload and manage resumes (PDF/Docx support).
- **Job Applications:** Track upcoming interviews and application statuses in real-time.
- **Personalized Dashboards:** A dedicated hub for managing all recruitment activities.

### 🏢 For Employers
- **Company Management:** Register and manage company profiles with branding.
- **Job Lifecycle:** Post, edit, and track job listings with granular control.
- **Candidate Intelligence:** Browse and filter potential candidates for roles.
- **Recruitment Analytics:** Monitor applications and hire the best talent efficiently.

### 💬 Core Platform Features
- **Real-time Chat:** Instant messaging between candidates and employers for quick coordination.
- **Admin Control:** Comprehensive dashboard for platform oversight and verification.
- **Responsive Design:** Fully optimized for Mobile, Tablet, and Desktop.
- **Secure Auth:** JWT-based authentication for robust security.

---

## 🛠 Tech Stack

### Frontend
- **React (Vite):** Blazing fast UI development.
- **Tailwind CSS:** Modern, utility-first styling with a premium aesthetic.
- **Lucide-React:** Beautiful, consistent iconography.
- **Axios:** Reliable API communication.
- **React Router:** Seamless client-side navigation.

### Backend
- **Django (DRF):** High-level Python Web framework for rapid, secure development.
- **Django Channels:** WebSocket support for real-time chat functionality.
- **MySQL:** Industrial-grade relational database for data integrity.
- **SimpleJWT:** Token-based authentication for the REST API.

---

## 📂 Project Structure

```text
FYP1/
├── backend/            # Django REST API
│   ├── admin_api/      # Platform administration logic
│   ├── applications/   # Job application management
│   ├── chat/           # Real-time WebSocket logic
│   ├── companies/      # Employer & Company management
│   ├── jobs/           # Job listings & categories
│   ├── users/          # User authentication & profiles
│   └── nokri_clone/    # Project configuration
├── frontend/           # React Application
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── context/    # Global state management (Auth)
│   │   └── pages/      # Route-level components
│   └── public/         # Static assets
└── README.md           # Project Documentation (You are here)
```

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- [Python](https://www.python.org/) (v3.9+)
- [MySQL](https://www.mysql.com/)

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   source venv/bin/activate  # Linux/Mac
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure Environment Variables:
   Create a `.env` file in the `backend/` root with:
   ```env
   SECRET_KEY=your_secret_key
   DEBUG=True
   DB_NAME=nokri_clone_db
   DB_USER=root
   DB_PASSWORD=your_password
   DB_HOST=localhost
   DB_PORT=3306
   ```
5. Run Migrations:
   ```bash
   python manage.py migrate
   ```
6. Start the Server:
   ```bash
   python manage.py runserver
   ```

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend 
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Development Server:
   ```bash
   npm run dev
   ```

---

## 📸 Screenshots
*(Add your project screenshots here to showcase the premium UI)*

---

## 🛠 Utility Scripts

The backend includes several utility scripts to help with development:

- **`python manage.py seed_jobs`**: Populate the database with sample job listings.
- **`python reset_db.py`**: A quick script to reset the MySQL database and clear migrations if needed.
- **`python clean_migrations.py`**: Removes all migration files for a fresh start.

---

## 📝 License
This project is part of a Final Year Project (FYP). Contact the author for licensing details.

---

### 👨‍💻 Author
**TalentConnect Team**

---
