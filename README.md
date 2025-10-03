# Phase-5-Group-4-Jifunze

## Project Description

Jifunze is a learning management platform that connects schools, educators, and students.  
It supports user management, attendance tracking, course resources, and facilitates classroom communication.

Built with React frontend and Flask backend, Jifunze provides a scalable solution for modern educational institutions.

## Project Overview

Jifunze addresses the following requirements:

- `School Management` - Multi-tenant architecture supporting multiple schools
- `User Management` - Role-based access for students, educators, and managers
- `Course Management` - Complete course lifecycle from creation to enrollment
- `Attendance Tracking` - Digital attendance with educator verification
- `Resource Sharing` - Upload and organize course materials
- `Communication` - Class-based messaging and discussion threads

## Live Demo

### Server link

[Server](https://jifunze-31gc.onrender.com)


### Client Link

[Client](https://phase-5-group-4-jifunze.onrender.com)

## 📦 Installation & Setup

### Prerequisites
Ensure you have the following installed:
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Python** (v3.12) - [Download](https://www.python.org/)
- **PostgreSQL** (v15 or higher) - [Download](https://www.postgresql.org/)
- **Git** - [Download](https://git-scm.com/)
- **pipenv** - Install via `pip install pipenv`

### Clone the Repository
```bash
git clone https://github.com/munyanyaguo/Phase-5-Group-4-Jifunze.git
cd Phase-5-Group-4-Jifunze
```

### Backend Setup

1. **Navigate to server directory:**
   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   pipenv install --dev
   ```

3. **Activate virtual environment:**
   ```bash
   pipenv shell
   ```

4. **Set up environment variables:**
   ```bash
   # Create .env file
   touch .env
   ```
   
   Add the following to `.env`:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/jifunze_db
   SECRET_KEY=your-secret-key-here
   JWT_SECRET_KEY=your-jwt-secret-key-here
   FLASK_ENV=development
   ```
   
   To generate secure keys:
   ```bash
   python generate_keys_safe.py
   ```

5. **Create database:**
   ```bash
   # Using PostgreSQL CLI
   createdb jifunze_db
   
   # Or using psql
   psql -U postgres
   CREATE DATABASE jifunze_db;
   \q
   ```

6. **Run database migrations:**
   ```bash
   flask db upgrade
   ```

7. **Seed the database (optional):**
   ```bash
   python -c "from app.seed import seed_database; seed_database()"
   ```

### Frontend Setup

1. **Navigate to client directory:**
   ```bash
   cd ../client
   ```

2. **Install dependencies:**
   ```bash
   npm ci
   ```

3. **Set up environment variables:**
   ```bash
   # Create .env file
   touch .env
   ```
   
   Add the following to `.env`:
   ```env
   VITE_API_URL=http://localhost:5000
   ```

## 🚀 Running the Application

### Start Backend Server
```bash
cd server
pipenv shell
flask run
# Server runs on http://localhost:5000
```

### Start Frontend Development Server
```bash
cd client
npm run dev
# App runs on http://localhost:5173
```

### Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Documentation**: See `/documents/api_documentation.md`

## 🧪 Running Tests

### Backend Tests
```bash
cd server
pipenv shell

# Run all tests
pytest tests/ -v

# Run with coverage
pytest tests/ -v --cov=app --cov-report=term-missing

# Run specific test file
pytest tests/test_routes/test_auth_routes.py -v
```

### Frontend Tests
```bash
cd client

# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch
```

## 📁 File Structure
```
Phase-5-Group-4-Jifunze/
├── .github/
│   └── workflows/
│       ├── backend-ci.yml           # Backend CI: pytest, flake8, coverage, PostgreSQL
│       ├── frontend-ci.yml          # Frontend CI: vitest, build, coverage
│       ├── deploy-staging.yml       # Auto-deploy develop → staging
│       └── deploy-production.yml    # Auto-deploy main → production
│
├── client/                          # React Frontend Application
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   │   ├── ui/                  # shadcn/ui components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── ...
│   │   ├── pages/                   # Route pages
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Attendance.jsx
│   │   │   ├── Courses.jsx
│   │   │   ├── Chat.jsx
│   │   │   └── ...
│   │   ├── layouts/                 # Layout components
│   │   ├── services/                # API service layer
│   │   ├── store/                   # Redux state management
│   │   ├── tests/                   # Vitest test files
│   │   │   └── app.test.jsx
│   │   ├── api.js                   # API client configuration
│   │   ├── config.js                # App configuration
│   │   ├── App.jsx                  # Main app component
│   │   └── main.jsx                 # Entry point
│   ├── components.json              # shadcn/ui config
│   ├── eslint.config.js             # ESLint configuration
│   ├── index.html                   # HTML template
│   ├── package.json                 # Node dependencies
│   ├── package-lock.json            # Locked dependencies
│   ├── postcss.config.js            # PostCSS config
│   ├── setupTests.js                # Test setup
│   ├── tailwind.config.js           # Tailwind CSS config
│   ├── vite.config.js               # Vite bundler config
│   └── vitest.config.js             # Vitest test config
│
├── documents/                       # Project Documentation
│   ├── api_documentation.md         # API endpoints reference
│   ├── cicd_flow.md                 # CI/CD pipeline documentation
│   ├── deployment.md                # Deployment guide
│   ├── gitflow.md                   # Git workflow guidelines
│   ├── schema.md                    # Database schema documentation
│   ├── Schema.png                   # Database ERD diagram
│   └── system_architecture.md       # System architecture overview
│
├── server/                          # Flask Backend Application
│   ├── app/
│   │   ├── models/                  # SQLAlchemy models
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── school.py
│   │   │   ├── course.py
│   │   │   ├── attendance.py
│   │   │   ├── message.py
│   │   │   └── resource.py
│   │   ├── routes/                  # API route blueprints
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   ├── users.py
│   │   │   ├── schools.py
│   │   │   ├── courses.py
│   │   │   ├── attendance.py
│   │   │   ├── messages.py
│   │   │   ├── resources.py
│   │   │   └── enrollments.py
│   │   ├── schemas/                 # Marshmallow schemas
│   │   ├── utils/                   # Utility functions
│   │   ├── __init__.py              # App factory
│   │   ├── extensions.py            # Flask extensions
│   │   └── seed.py                  # Database seeding
│   ├── migrations/                  # Alembic database migrations
│   │   ├── versions/
│   │   ├── alembic.ini
│   │   └── env.py
│   ├── tests/                       # Pytest test suite
│   │   ├── test_models/             # Model tests
│   │   ├── test_routes/             # Route/endpoint tests
│   │   ├── test_schemas/            # Schema validation tests
│   │   ├── conftest.py              # Test fixtures & config
│   │   └── __init__.py
│   ├── .flake8                      # Flake8 linter config
│   ├── Pipfile                      # Python dependencies
│   ├── Pipfile.lock                 # Locked dependencies
│   ├── Procfile                     # Render deployment config
│   ├── runtime.txt                  # Python version
│   ├── wsgi.py                      # WSGI entry point
│   └── manage.py                    # CLI management commands
│
├── .gitignore                       # Git ignore rules
├── LICENSE                          # MIT License
├── README.md                        # This file
└── render.yaml                      # Render deployment config
```

## 🛠 Tech Stack

#### Frontend

- React 19.1.1
- Vite 7.1.2
- Vitest 3.2.4 for testing

#### Backend

- Flask web framework
- SQLAlchemy ORM
- JWT authentication
- Marshmallow for serialization
- pytest for testing

#### Database

- PostgreSQL for production
- Comprehensive relational schema

### CI/CD & Deployment

- **CI/CD**: GitHub Actions
  - Automated testing on PRs
  - PostgreSQL test database
  - Code coverage reporting
  - Automated deployments
- **Hosting**: Render
  - Staging environment (develop branch)
  - Production environment (main branch)
  - Auto-deploy on branch updates
- **Documentation**: See `/documents/deployment.md` and `/documents/cicd_flow.md`

## 🤝 How to Contribute

1️⃣ Fork the Repository

- Click the "Fork" button on GitHub
- Clone your fork locally

2️⃣ Set up the development environment
   ```bash
      # Frontend
      cd client
      npm install
   
      # Backend
      cd server
      pipenv install --dev
   ```

3️⃣ Create a Feature Branch

```bash
   git checkout -b feature/your-feature-name
```

4️⃣ Make Your Changes

- Write clean, documented code
- Follow existing code style and conventions
- Add tests for new functionality
- Update documentation as needed

5️⃣ Test Your Changes

```bash
   cd server && pipenv run pytest tests/ -v
   cd client && npm run test
```

6️⃣ Submit a Pull Request

- Push your branch to your fork
- Create a pull request against the `develop` branch
- Provide clear description of changes
- Reference any related issues

## Contribution Guidelines

### Code Standards

- Backend: Follow PEP 8 (use `flake8`)
- Frontend: Use ESLint/Prettier
- Write meaningful commit messages
- Add tests for new features
- Document public APIs and complex logic

### Pull Request Process

- Target the develop branch for new features
- Use main branch only for hotfixes
- All PRs must pass CI/CD checks
- Require at least one code review
- Maintain up-to-date documentation

## 📚 Additional Documentation

- **[API Documentation](./documents/api_documentation.md)** - Complete API reference
- **[Deployment Guide](./documents/deployment.md)** - How to deploy the application
- **[CI/CD Flow](./documents/cicd_flow.md)** - CI/CD pipeline documentation
- **[Git Workflow](./documents/gitflow.md)** - Branch strategy and workflow
- **[Database Schema](./documents/schema.md)** - Database structure and relationships
- **[System Architecture](./documents/system_architecture.md)** - High-level architecture overview

## 👥 Authors & Acknowledgements

For questions, support, or contributions regarding this project, please feel free to reach out to the development team:

| Team Member | Email Address |
|-------------|---------------|
| **Chege Wakiama** | 📧 [mailto:chege.wakiama@student.moringaschool.com](mailto:chege.wakiama@student.moringaschool.com) |
| **harriet chepng'eno** | 📧 [mailto:harriet.chepngeno@student.moringaschool.com](mailto:harriet.chepngeno@student.moringaschool.com) |
| **Marion Maghanga** | 📧 [marion.maghanga@student.moringaschool.com](mailto:marion.maghanga@student.moringaschool.com) |
| **Ian Derrick** | 📧 [mailto:ian.derrick@student.moringaschool.com](mailto:ian.derrick@student.moringaschool.com) |

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
