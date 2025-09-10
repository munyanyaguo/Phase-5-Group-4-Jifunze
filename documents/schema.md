# Database Schema (Draft)

This document describes the database schema for the **Jifunze Project**.  
It provides an overview of the entities, their attributes, and relationships, aligned with the MVP features.

---

## ERD Diagram

![Jifunze Schema](./Schema.png)

---

## Tables

### 1. Schools
Represents independent schools that exist on the platform.  
- **id** (int, PK) – Unique identifier.  
- **name** (varchar) – School name.  
- **address** (varchar) – Physical address or location.  
- **owner_id** (int, FK → users.id) – School owner/manager.  
- **created_at** (datetime) – When the school was created.  

---

### 2. Users
Stores all users of the system (students, educators, managers).  
- **id** (int, PK) – Unique identifier.  
- **name** (varchar) – User’s full name.  
- **email** (varchar, unique) – User’s email address.  
- **password_hash** (varchar) – Encrypted password.  
- **role** (varchar) – User role (`student`, `educator`, `manager`).  
- **school_id** (int, FK → schools.id) – The school the user belongs to.  
- **created_at** (datetime) – Account creation timestamp.  

---

### 3. Courses
Contains courses created and managed by educators.  
- **id** (int, PK) – Unique identifier.  
- **title** (varchar) – Course title.  
- **description** (text) – Description of the course.  
- **educator_id** (int, FK → users.id) – The educator responsible.  
- **school_id** (int, FK → schools.id) – School offering the course.  
- **created_at** (datetime) – Course creation date.  

---

### 4. Enrollments
Links students to courses (many-to-many).  
- **id** (int, PK) – Unique identifier.  
- **user_id** (int, FK → users.id) – Student enrolled.  
- **course_id** (int, FK → courses.id) – Course enrolled in.  
- **date_enrolled** (datetime) – Enrollment date.  

🔹 **Constraint**: A student can only be enrolled once per course (`UNIQUE(user_id, course_id)`).  

---

### 5. Attendance
Tracks student attendance per course session.  
- **id** (int, PK) – Unique identifier.  
- **user_id** (int, FK → users.id) – Student attending.  
- **course_id** (int, FK → courses.id) – Course attended.  
- **date** (date) – Session date.  
- **status** (varchar) – `present`, `absent`, or `late`.  
- **verified_by** (int, FK → users.id) – Educator verifying attendance.  

🔹 **Constraint**: One record per student per course per day (`UNIQUE(user_id, course_id, date)`).  

---

### 6. Resources
Stores course learning materials.  
- **id** (int, PK) – Unique identifier.  
- **course_id** (int, FK → courses.id) – Related course.  
- **uploaded_by** (int, FK → users.id) – Educator who uploaded.  
- **title** (varchar) – Resource title.  
- **url** (varchar) – Resource link.  
- **type** (varchar) – File type (e.g., `pdf`, `doc`, `video`).  
- **created_at** (datetime) – Upload timestamp.  

---

### 7. Messages
Supports class-based communication.  
- **id** (int, PK) – Unique identifier.  
- **user_id** (int, FK → users.id) – Sender of the message.  
- **course_id** (int, FK → courses.id) – Related course.  
- **parent_id** (int, FK → messages.id, nullable) – For replies (threaded chat).  
- **content** (text) – Message body.  
- **timestamp** (datetime) – Time the message was sent.  

---

## Relationships Overview
- **Schools → Users**: A school has many users.  
- **Schools → Courses**: A school has many courses.  
- **Users → Courses**: An educator can manage many courses.  
- **Users ↔ Enrollments ↔ Courses**: Many-to-many between students and courses.  
- **Users ↔ Attendance ↔ Courses**: Tracks daily participation.  
- **Courses → Resources**: Each course can have many resources.  
- **Users + Courses → Messages**: Users communicate within course contexts.  

---

## Notes
- This schema supports the **MVP features**: school management, user management, resources, attendance, and classroom interaction.  
- Future updates may add **assessments, exams, and co-curricular activities**.  
