# Nokri- Job Board Platform

A modern job board platform built with Django and Tailwind CSS, inspired by the Nokri job portal.

## Features

- **Job Listings**: Browse and search for jobs with advanced filtering
- **Company Profiles**: Detailed company information and job postings
- **User Authentication**: Separate registration for job seekers and employers
- **Job Applications**: Apply for jobs with cover letter and resume upload
- **Responsive Design**: Modern UI built with Tailwind CSS
- **Admin Interface**: Comprehensive admin panel for managing jobs and users

## Technology Stack

- **Backend**: Django 4.2.7
- **API**: Django REST Framework
- **Real-time**: Django Channels (WebSocket)
- **Frontend**: Tailwind CSS, HTML5, JavaScript
- **Database**: MySQL
- **Image Handling**: Pillow
- **Authentication**: Django built-in authentication system

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nokri-clone
   ```

2. **Create virtual environment (recommended)**
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On Linux/Mac:
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   
   Create a `.env` file in the project root with the following content:
   ```env
   SECRET_KEY=your-secret-key-here
   DEBUG=True
   ALLOWED_HOSTS=localhost,127.0.0.1
   
   DB_NAME=nokri_clone_db
   DB_USER=root
   DB_PASSWORD=your-database-password-here
   DB_HOST=localhost
   DB_PORT=3306
   
   CHANNEL_LAYERS_BACKEND=channels.layers.InMemoryChannelLayer
   ```
   
   **Important**: Never commit the `.env` file to version control. It's already in `.gitignore`.

5. **Run migrations**
   ```bash
   python manage.py migrate
   ```

4. **Create superuser**
   ```bash
   python manage.py createsuperuser
   ```

5. **Populate sample data**
   ```bash
   python manage.py populate_data
   ```

6. **Start development server**
   ```bash
   python manage.py runserver
   ```

7. **Access the application**
   - Main site: http://127.0.0.1:8000/
   - Admin panel: http://127.0.0.1:8000/admin/

## Project Structure

```
nokri_clone/
├── jobs/                # Jobs app (main functionality)
│   ├── models.py        # Job, Company, Category models
│   ├── views.py         # Job listing, detail, application views
│   ├── urls.py          # URL patterns
│   └── admin.py         # Admin configuration
├── users/               # User management app
│   ├── models.py        # User profiles, education, experience
│   ├── views.py         # Authentication and profile views
│   └── forms.py         # Registration and profile forms
├── companies/           # Company management app
├── templates/           # HTML templates
│   ├── base/           # Base templates
│   ├── jobs/           # Job-related templates
│   └── users/          # User-related templates
└── static/             # Static files (CSS, JS, images)
```

## Key Features

### For Job Seekers
- Browse and search jobs
- Filter by category, location, salary, job type
- Apply for jobs with cover letter and resume
- Save jobs for later
- Create detailed profiles with experience and education
- **Real-time chat** with employers
- **Typing indicators** in chat

### For Employers
- Post job listings
- Manage company profile
- View applications and applicant counts
- Featured job options (featured, urgent, private)
- **Real-time chat** with candidates
- **Typing indicators** in chat

### Real-time Features
- **WebSocket-based chat** between candidates and employers
- **Typing indicators** showing when someone is typing
- **Floating chat popup** on home screen
- Message history and thread management

### Admin Features
- Manage all jobs and companies
- User management
- Category and location management
- Application tracking

## Sample Data

The `populate_data` command creates:
- 8 job categories (Technology, Healthcare, Education, etc.)
- 8 locations across different countries
- 6 job types (Full Time, Part Time, Contract, etc.)
- 5 sample companies
- 6 sample jobs with different features

## Default Login Credentials

- **Superuser**: admin / password123
- **Company Users**: company_1, company_2, etc. / password123

## API Endpoints

### Web Interface
- `/` - Homepage with featured jobs
- `/jobs/` - Job listings with search and filters
- `/jobs/<id>/` - Job detail page
- `/jobs/<id>/apply/` - Job application form
- `/companies/` - Company listings
- `/users/register/` - User registration
- `/users/login/` - User login
- `/chat/` - Chat interface
- `/admin/` - Admin interface

### REST API (Django REST Framework)

**Jobs API** (`/api/jobs/`)
- `GET /api/jobs/jobs/` - List all jobs
- `GET /api/jobs/jobs/<id>/` - Job details
- `POST /api/jobs/jobs/<id>/apply/` - Apply for a job
- `POST /api/jobs/jobs/<id>/save/` - Save a job
- `DELETE /api/jobs/jobs/<id>/save/` - Unsave a job
- `GET /api/jobs/categories/` - List categories
- `GET /api/jobs/locations/` - List locations
- `GET /api/jobs/companies/` - List companies

**Users API** (`/api/users/`)
- `GET /api/users/profiles/` - List user profiles
- `GET /api/users/profiles/me/` - Current user's profile
- `GET /api/users/profiles/candidates/` - List candidates
- `GET /api/users/profiles/employers/` - List employers

**Chat API** (`/api/chat/`)
- `GET /api/chat/threads/` - List chat threads
- `POST /api/chat/threads/start/` - Start new chat
- `GET /api/chat/threads/<id>/messages/` - Get messages
- `GET /api/chat/messages/` - List messages
- `POST /api/chat/messages/<id>/mark_read/` - Mark as read

**WebSocket** (Real-time Chat)
- `ws://localhost:8000/ws/chat/<thread_id>/` - WebSocket connection for real-time chat

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is for educational purposes and is inspired by the Nokri job portal.

The application features:
- Modern, responsive design
- Hero section with job search
- Category-based job browsing
- Detailed job and company pages
- User-friendly application process
- Admin interface for content management


 daphne -p 8000 nokri_clone.asgi:application# nokri_clone_at_internship
