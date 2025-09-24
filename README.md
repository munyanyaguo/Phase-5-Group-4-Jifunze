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

## 📦 Installation

### Prerequisites
- `Node.js (v18+)`
- `Python (v3.12)`

### Frontend Setup
```bash
   cd client
   npm ci || npm run build
   cp .env.example .env
   npm run dev
```

### Backend Setup
```bash
   cd server
   pipenv install
   pipenv shell
   cp .env.example .env
   pipenv run flask run
```

## 📁Folder structure
```
jifunze/
├── .github/
│   └── workflows/             
│       ├── backend-ci.yml     
│       ├── frontend-ci.yml    
│       └── deploy-production.yml       
│
├── client/                     
│   ├── src/
│   │   ├── components/         
│   │   ├── pages/            
│   │   ├── tests/             
│   │   │   └── app.test.jsx 
│   │   ├── api.js  
│   │   ├── App.jsx   
│   │   ├── config.js          
│   │   └── main.jsx  
│   ├── eslint.config.js
│   ├── index.html
│   ├── package-lock.json          
│   ├── package.json 
│   ├── setupTests.js
│   ├── vite.config.js          
│   └── vitest.config.js         
│
├── documents/ 
│   ├── api_documentation.md  
│   ├── gitflow.md     
│   ├── schema.md 
│   ├── schema.png                        
│   └── system_architecture.md       
│
├── server/                     
│   ├── app/
│   │   ├── models/            
│   │   ├── routes/           
│   │   └── __init__.py        
│   ├── migrations/            
│   ├── tests/                 
│   │   └── test_app.py        
│   ├── .flake8             
│   ├── app.py                 
│   ├── Pipfile  
│   ├── Pipfile.lock
│   ├── Procfile             
│   └── runtime.txt         
│
├── .gitignore                                
├── LICENSE                  
└── README.md               
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

- GitHub Actions for CI/CD
- Render for hosting

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

##  Collaborators

For questions, support, or contributions regarding this project, please feel free to reach out to the development team:

| Team Member | Email Address |
|-------------|---------------|
| **Chege Wakiama** | 📧 [mailto:chege.wakiama@student.moringaschool.com](mailto:chege.wakiama@student.moringaschool.com) |
| **harriet chepng'eno** | 📧 [mailto:harriet.chepngeno@student.moringaschool.com](mailto:harriet.chepngeno@student.moringaschool.com) |
| **Marion Maghanga** | 📧 [marion.maghanga@student.moringaschool.com](mailto:marion.maghanga@student.moringaschool.com) |
| **Ian Derrick** | 📧 [mailto:ian.derrick@student.moringaschool.com](mailto:ian.derrick@student.moringaschool.com) |

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
