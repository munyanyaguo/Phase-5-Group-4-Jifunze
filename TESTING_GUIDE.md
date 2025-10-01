# Testing Guide - Student Components

## Backend Tests (pytest)

### Running Tests

```bash
cd server
source .venv/bin/activate
pytest tests/test_student_endpoints.py -v
```

### Test Coverage

The `test_student_endpoints.py` file includes comprehensive tests for:

#### 1. **Student Dashboard** (`TestStudentDashboard`)
- Student can access dashboard
- Dashboard contains enrollment data
- Dashboard shows recent activity

#### 2. **Student Enrollments** (`TestStudentEnrollments`)
- Student can view own enrollments
- Enrollment includes course details (with educator and school)
- Student cannot view other students' enrollments

#### 3. **Student Courses** (`TestStudentCourses`)
- Student can view available courses

#### 4. **Student Attendance** (`TestStudentAttendance`)
- Student can view own attendance records

#### 5. **Student Messages** (`TestStudentMessages`)
- Student can view messages in enrolled courses
- Student can post messages in enrolled courses
- Student cannot post in unenrolled courses

#### 6. **Student Resources** (`TestStudentResources`)
- Student can view resources in enrolled courses

#### 7. **Student Profile** (`TestStudentProfile`)
- Student can view own profile
- Student can update own profile

### Running Specific Test Classes

```bash
# Run only dashboard tests
pytest tests/test_student_endpoints.py::TestStudentDashboard -v

# Run only enrollment tests
pytest tests/test_student_endpoints.py::TestStudentEnrollments -v

# Run only message tests
pytest tests/test_student_endpoints.py::TestStudentMessages -v
```

### Running Individual Tests

```bash
# Run a specific test
pytest tests/test_student_endpoints.py::TestStudentDashboard::test_student_can_access_dashboard -v
```

### Test with Coverage

```bash
pytest tests/test_student_endpoints.py --cov=app.routes --cov-report=html
```

---

## Frontend Tests (Jest/Vitest)

### Setup (if not already done)

```bash
cd client
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event vitest jsdom
```

### Example Test Structure

Create `client/src/pages/Student/__tests__/StudentDashboard.test.jsx`:

```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import StudentDashboard from '../StudentDashboard';

// Mock API calls
vi.mock('../../../services/authServices', () => ({
  getCurrentUser: () => ({ name: 'Test Student', email: 'test@example.com' })
}));

describe('StudentDashboard', () => {
  beforeEach(() => {
    // Setup before each test
    localStorage.setItem('token', 'fake-token');
  });

  it('renders welcome message', async () => {
    render(
      <BrowserRouter>
        <StudentDashboard />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
    });
  });

  it('displays summary cards', async () => {
    render(
      <BrowserRouter>
        <StudentDashboard />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/My Courses/i)).toBeInTheDocument();
      expect(screen.getByText(/Attendance/i)).toBeInTheDocument();
    });
  });
});
```

### Running Frontend Tests

```bash
cd client
npm run test
```

---

## Manual Testing Checklist

### Prerequisites
1. Flask server running (`flask run`)
2. React dev server running (`npm run dev`)
3. Test student account created

### Test Steps

#### 1. **Login & Dashboard**
- [ ] Login with student credentials
- [ ] Dashboard loads with gradient background
- [ ] Welcome message shows student name
- [ ] Summary cards display correct counts
- [ ] Recent activity shows enrollments, attendance, messages

#### 2. **Enrollments Page**
- [ ] Navigate to Enrollments
- [ ] Enrollment cards display
- [ ] Educator names appear (not "N/A")
- [ ] Enrollment dates show correctly
- [ ] Active status badge visible

#### 3. **Courses Page**
- [ ] Navigate to Courses
- [ ] Course cards display with gradient headers
- [ ] Search functionality works
- [ ] Enrollment status shows correctly
- [ ] Course details modal opens

#### 4. **Attendance Page**
- [ ] Navigate to Attendance
- [ ] Attendance records display by course
- [ ] Progress bars show attendance rate
- [ ] Status badges display with icons
- [ ] Filter by status works

#### 5. **Messages Page**
- [ ] Navigate to Messages
- [ ] Course selector appears
- [ ] Messages load for selected course
- [ ] Can send new message
- [ ] Message bubbles display correctly

#### 6. **Resources Page**
- [ ] Navigate to Resources
- [ ] Resource cards display
- [ ] Search/filter works
- [ ] View button opens modal
- [ ] Download button works

#### 7. **Navigation & Logout**
- [ ] Sidebar navigation works
- [ ] Logout button visible in navbar
- [ ] Logout redirects to login page

---

## Performance Testing

### Check API Response Times

Open browser DevTools → Network tab:

1. **Dashboard API** - Should load in < 500ms
2. **Enrollments API** - Should load in < 300ms
3. **Messages API** - Should load in < 400ms

### Check for Console Errors

Open browser DevTools → Console tab:
- [ ] No errors on page load
- [ ] No errors when navigating
- [ ] No errors when submitting forms

---

## Troubleshooting

### Backend Tests Failing

```bash
# Check if database is clean
flask db downgrade
flask db upgrade

# Re-run tests
pytest tests/test_student_endpoints.py -v
```

### Frontend Build Issues

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### API Connection Issues

Check `.env` files:
- Backend: `FLASK_ENV=development`
- Frontend: `VITE_API_URL=http://localhost:5000/api`

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Run Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.12'
      - name: Install dependencies
        run: |
          cd server
          pip install -r requirements.txt
      - name: Run tests
        run: |
          cd server
          pytest tests/test_student_endpoints.py -v

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Node
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: |
          cd client
          npm install
      - name: Run tests
        run: |
          cd client
          npm run test
```

---

## Summary

**Key Features:**
- 13 comprehensive backend tests covering all student endpoints
- Test fixtures for easy test data creation
- Authorization tests to ensure students can only access their own data
- Integration tests for complete user workflows
- Manual testing checklist for QA
- Performance benchmarks for API response times

Run tests before every commit to ensure code quality and prevent regressions.
