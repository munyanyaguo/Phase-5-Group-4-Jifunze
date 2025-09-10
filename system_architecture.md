# System Architecture – Jifunze

## Components
- **Client (Frontend)**: React with Redux Toolkit  
  - Handles UI, user interactions, and API calls.  
  - Deployed on Netlify or Vercel.  

- **Server (Backend)**: Flask + SQLAlchemy  
  - Provides REST API endpoints.  
  - Manages authentication, attendance, resources, and chat.  
  - Deployed on Render or Heroku.  

- **Database**: SQLite (development) / PostgreSQL (production-ready)  
  - Stores users, schools, classes, attendance, and resources.  

## Data Flow
1. User interacts with the **Client (React UI)**.  
2. Client sends API requests to the **Server (Flask backend)**.  
3. Server processes the request, interacts with the **Database**.  
4. Server returns JSON response to the Client for rendering.  

## Deployment Overview
- **Client** → Netlify / Vercel / Render 
- **Server** → Render / Heroku  
- **Database** → SQLite (development), PostgreSQL (scalable production option)  

## Example Request Flow
- Student logs in from client → API request to `/api/auth/login`  
- Server verifies credentials in database.  
- Server returns JWT token.  
- Client stores token and uses it for further API requests.  

## Architecture Diagram (ASCII)

```text
               +------------------+
               |      Client      |
               |  React + Redux   |
               | (Netlify/Vercel) |
               +--------+---------+
                        |
                        | API Calls (HTTP/JSON)
                        v
               +------------------+
               |      Server      |
               | Flask + SQLAlchemy|
               |  (Render/Heroku) |
               +--------+---------+
                        |
                        | SQL Queries
                        v
               +------------------+
               |     Database     |
               |   SQLite (dev)   |
               | PostgreSQL (prod)|
               +------------------+
