# Phase-5-Group-4-Jifunze

## Project Description
Jifunze is a learning management platform that connects schools, educators, and students.  
It supports user management, attendance tracking, course resources, and facilitates classroom communication.

Built with React frontend and Flask backend, Jifunze provides a scalable solution for modern educational institutions.


## Project Overview
Jifunze addresses the following requirements:

- `School Management` -  Multi-tenant architecture supporting multiple schools
- `User Management` - Role-based access for students, educators, and managers
- `Course Management` - Complete course lifecycle from creation to enrollment
- `Attendance Tracking` - Digital attendance with educator verification
- `Resource Sharing` - Upload and organize course materials
Communication: Class-based messaging and discussion threads


## 📁Folder structure
```
jifunze/
├── client/                     # React frontend application
│   ├── public/                 
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/            # Route pages
│   │   ├── context/         # Auth context + hooks             
│   │   ├── App.jsx           # Main app
│   │   └── main.jsx         # Entry point
│   └── package.json
│
├── server/                     # Flask backend application
│   ├── app/
│   │   ├── models/            # SQLAlchemy models
│   │   ├── routes/            # API routes
│   │   └── __init__.py        # App factory
│   ├── migrations/            # Database migration files
│   ├── tests/                 # Backend tests
│   ├── requirements.txt
│   ├── config.py              # Configuration settings
│   └── app.py                 # Entry point
│
├── documents/                             # documentation
│   ├── api_documentation.md     # API endpoint documentation
│   ├── system_architecture.md       # Database design details
│   ├── schema.md     
│
├── .github/
│   └── workflows/             # GitHub Actions workflows
│       ├── backend-tests.yml
│       └── frontend-tests.yml
│
├── scripts/                   # Utility scripts
│
├── .gitignore
├── .env.example         # Environment variables template
├── LICENSE      
└── README.md     

```

## Tech Stack
#### Frontend
- React18 with Redux toolkit

#### Backend
- Flask web framework
- SQLAlchemy ORM
- JWT authentication
- Marshmallow for serialization

#### Database
- PostgreSQL for production
- Comprehensive relational schema

#### Deployment Platforms
- `Client -Render`
- `Server - Render`

## 🤝 How to Contribute

1. Fork the Repository
- Click the "Fork" button on GitHub
- Clone your fork locally


2. Create a Feature Branch

 ```bash   
    git checkout -b feature/your-feature-name
```

3. Make Your Changes

- Write clean, documented code
- Follow existing code style and conventions
- Add tests for new functionality
- Update documentation as needed


4. Test Your Changes
```bash   
# Run all tests
   cd server && pytest
   cd client && npm test
   ```

5. Submit a Pull Request

- Push your branch to your fork
- Create a pull request against the `develop` branch
- Provide clear description of changes
- Reference any related issues 


## Contribution Guidelines
### Code Standards

- Follow PEP 8 for Python code
- Use ESLint/Prettier for JavaScript formatting
- Write meaningful commit messages
- Include unit tests for new features
- Document public APIs and complex logic


### Pull Request Process

- Target the develop branch for new features
- Use main branch only for hotfixes
- All PRs must pass CI/CD checks
- Require at least one code review
- Maintain up-to-date documentation


