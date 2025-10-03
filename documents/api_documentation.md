# API Documentation

## API Endpoints

### Schools
- GET /schools/:id: Get school by ID (managers can view any, others only their own).

- PUT /schools/:id: Update school details (managers only, only their own school).

- GET /schools: List schools (users see only their own).

- GET /schools/:id/stats: Get statistics for a school (user counts, courses, recent registrations).

- GET /schools/:id/users: List users in a school, with filtering and pagination.

- GET /schools/:id/courses: List courses in a school, with filtering.

- GET /schools/:id/dashboard: Get dashboard data for a school (managers only).


### Courses

- GET /courses: List courses, filter by school, educator, search, paginated.

- POST /courses: Create a new course (educator/manager only, auto-assigned to their school).

- GET /courses/:id: Get course by ID.

- PUT /courses/:id: Replace course (educator/manager only, must be in their school).

- PATCH /courses/:id: Update course (educator/manager only, must be in their school).

- DELETE /courses/:id: Delete course (educator/manager only, must be in their school).


### Auth

- POST /register: Register a new user (optionally with school).

- POST /login: Login, returns JWT tokens and user info.

- POST /logout: Logout (JWT blocklist).

- POST /reset-password: Request password reset (generates token, sends email).

- PATCH /reset-password: Reset password using token.


### Users

- GET /users/:id: Get user by ID or current user.

- PUT /users/:id: Update user info (self or manager for users in their school).

- DELETE /users/:id: Delete user (managers only, only in their school).

- GET /users: List users, filter by role, school, search, paginated.

- PATCH /users/password: Change current user’s password.

- GET /schools/:id/users: List users in a school (managers only, only their school).

- POST /schools/:id/users: Add user to school (managers only, only their school).

- GET /users/profile: Get current user’s profile.

- GET /users/dashboard: Get dashboard data based on user role.


### Resources
- GET /resources: List resources, paginated.

- POST /resources: Create resource (educator/manager only, supports file upload or URL).

- GET /resources/:id: Get resource by ID.

- PUT /resources/:id: Update resource (educator/manager only).

- DELETE /resources/:id: Delete resource (educator/manager only).


### Attendance
- GET /attendance: List attendance records, filter by course/user/status, paginated.

- POST /attendance: Create attendance (educator/manager only, same school).

- GET /attendance/:id: Get attendance record by ID.

- PUT /attendance/:id: Replace attendance record (educator/manager only, same school).

- PATCH /attendance/:id: Update attendance record (educator/manager only, same school).

- DELETE /attendance/:id: Delete attendance record (educator/manager only, same school).


### Enrollments
- GET /enrollments: List enrollments, filter by course/user, paginated.

- POST /enrollments: Enroll user in course (educator/manager only, same school).

- GET /enrollments/:id: Get enrollment by ID.

- PUT /enrollments/:id: Replace enrollment (educator/manager only, same school).

- PATCH /enrollments/:id: Update enrollment (educator/manager only, same school).

- DELETE /enrollments/:id: Unenroll user (educator/manager only, same school).


### Messages
- GET /messages: List messages, filter by course/user, paginated.

- POST /messages: Create message (student if enrolled, educator for own course, manager for own school).

- GET /messages/:id: Get message by ID.

- PUT /messages/:id: Replace message (manager or owner).

- PATCH /messages/:id: Update message (manager or owner).

- DELETE /messages/:id: Delete message (manager or owner).

