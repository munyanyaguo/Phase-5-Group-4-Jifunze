"""
Tests for Student-specific endpoints
"""
import pytest
from datetime import datetime
from app.extensions import db
from app.models.user import User
from app.models.school import School
from app.models.course import Course
from app.models.enrollment import Enrollment
from app.models.attendance import Attendance
from app.models.message import Message
from app.models.resource import Resource


@pytest.fixture
def test_data(app):
    """Create all test data in one context"""
    with app.app_context():
        # Create owner
        owner = User(
            name="Test Owner",
            email="owner@test.com",
            role="manager"
        )
        owner.set_password("password123")
        db.session.add(owner)
        db.session.commit()
        
        # Create school
        school = School(
            name="Test School", 
            address="123 Test St",
            owner_id=owner.id
        )
        db.session.add(school)
        db.session.commit()
        
        # Create student
        student = User(
            name="Test Student",
            email="student@test.com",
            role="student",
            school_id=school.id
        )
        student.set_password("password123")
        db.session.add(student)
        db.session.commit()
        
        # Create educator
        educator = User(
            name="Test Educator",
            email="educator@test.com",
            role="educator",
            school_id=school.id
        )
        educator.set_password("password123")
        db.session.add(educator)
        db.session.commit()
        
        # Create course
        course = Course(
            title="Test Course",
            description="A test course",
            educator_id=educator.id,
            school_id=school.id
        )
        db.session.add(course)
        db.session.commit()
        
        # Create enrollment
        enrollment = Enrollment(
            user_public_id=student.public_id,
            course_id=course.id,
            date_enrolled=datetime.utcnow()
        )
        db.session.add(enrollment)
        db.session.commit()
        
        # Return IDs and data as dict
        return {
            'student_email': student.email,
            'student_public_id': student.public_id,
            'educator_id': educator.id,
            'school_id': school.id,
            'course_id': course.id,
            'enrollment_id': enrollment.id
        }


@pytest.fixture
def student_token(client, test_data):
    """Get JWT token for student"""
    response = client.post('/api/auth/login', json={
        'email': test_data['student_email'],
        'password': 'password123'
    })
    assert response.status_code == 200
    data = response.get_json()
    return data['data']['access_token']


class TestStudentDashboard:
    """Test student dashboard endpoint"""
    
    def test_student_can_access_dashboard(self, client, student_token):
        """Test that student can access their dashboard"""
        response = client.get(
            '/api/users/dashboard',
            headers={'Authorization': f'Bearer {student_token}'}
        )
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert 'dashboard' in data['data']
    
    def test_dashboard_contains_student_data(self, client, student_token, test_data):
        """Test that dashboard contains enrollment data"""
        response = client.get(
            '/api/users/dashboard',
            headers={'Authorization': f'Bearer {student_token}'}
        )
        data = response.get_json()
        dashboard = data['data']['dashboard']
        
        assert 'enrolled_courses' in dashboard
        assert dashboard['enrolled_courses'] >= 1
        assert 'recent_enrollments' in dashboard


class TestStudentEnrollments:
    """Test student enrollment endpoints"""
    
    def test_student_can_view_own_enrollments(self, client, student_token, test_data):
        """Test that student can view their enrollments"""
        response = client.get(
            '/api/enrollments',
            headers={'Authorization': f'Bearer {student_token}'}
        )
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert 'enrollments' in data['data']
        assert len(data['data']['enrollments']) >= 1
    
    def test_enrollment_includes_course_details(self, client, student_token, test_data):
        """Test that enrollment includes nested course with educator"""
        response = client.get(
            '/api/enrollments',
            headers={'Authorization': f'Bearer {student_token}'}
        )
        data = response.get_json()
        enrollment = data['data']['enrollments'][0]
        
        assert 'course' in enrollment
        assert 'title' in enrollment['course']
        assert 'educator' in enrollment['course']
        assert 'school' in enrollment['course']
    
    def test_student_cannot_view_other_enrollments(self, client, student_token, app):
        """Test that student can only see their own enrollments"""
        with app.app_context():
            # Create another student
            other_student = User(
                name="Other Student",
                email="other@test.com",
                role="student"
            )
            other_student.set_password("password123")
            db.session.add(other_student)
            db.session.commit()
        
        response = client.get(
            '/api/enrollments',
            headers={'Authorization': f'Bearer {student_token}'}
        )
        data = response.get_json()
        
        # Should only see own enrollments
        for enrollment in data['data']['enrollments']:
            assert enrollment['user']['email'] == 'student@test.com'


class TestStudentCourses:
    """Test student course viewing"""
    
    def test_student_can_view_courses(self, client, student_token, test_data):
        """Test that student can view available courses"""
        response = client.get(
            '/api/courses',
            headers={'Authorization': f'Bearer {student_token}'}
        )
        assert response.status_code == 200
        data = response.get_json()
        # API returns paginated data with 'items' inside 'data'
        assert 'items' in data.get('data', {})


class TestStudentAttendance:
    """Test student attendance endpoints"""
    
    def test_student_can_view_own_attendance(self, client, student_token, test_data, app):
        """Test that student can view their attendance"""
        with app.app_context():
            # Create attendance record
            attendance = Attendance(
                user_public_id=test_data['student_public_id'],
                course_id=test_data['course_id'],
                date=datetime.utcnow().date(),
                status='present'
            )
            db.session.add(attendance)
            db.session.commit()
        
        response = client.get(
            '/api/attendance',
            headers={'Authorization': f'Bearer {student_token}'}
        )
        assert response.status_code == 200
        data = response.get_json()
        assert 'attendance' in data['data']


class TestStudentMessages:
    """Test student messaging"""
    
    def test_student_can_view_course_messages(self, client, student_token, test_data, app):
        """Test that student can view messages in enrolled course"""
        with app.app_context():
            # Create a message
            message = Message(
                user_public_id=test_data['student_public_id'],
                course_id=test_data['course_id'],
                content="Test message",
                timestamp=datetime.utcnow()
            )
            db.session.add(message)
            db.session.commit()
        
        response = client.get(
            f'/api/messages?course_id={test_data["course_id"]}',
            headers={'Authorization': f'Bearer {student_token}'}
        )
        assert response.status_code == 200
        data = response.get_json()
        assert 'messages' in data['data']
    
    def test_student_can_post_message_in_enrolled_course(self, client, student_token, test_data):
        """Test that student can post message in enrolled course"""
        response = client.post(
            '/api/messages',
            headers={'Authorization': f'Bearer {student_token}'},
            json={
                'course_id': test_data['course_id'],
                'content': 'Hello from student!'
            }
        )
        assert response.status_code in [200, 201]
    
    def test_student_cannot_post_in_unenrolled_course(self, client, student_token, test_data, app):
        """Test that student cannot post in course they're not enrolled in"""
        with app.app_context():
            # Create another course
            other_course = Course(
                title="Other Course",
                description="Another course",
                educator_id=test_data['educator_id'],
                school_id=test_data['school_id']
            )
            db.session.add(other_course)
            db.session.commit()
            other_course_id = other_course.id
        
        response = client.post(
            '/api/messages',
            headers={'Authorization': f'Bearer {student_token}'},
            json={
                'course_id': other_course_id,
                'content': 'Should not work'
            }
        )
        # Should return 403 (forbidden) or 400 (bad request)
        assert response.status_code in [400, 403]


class TestStudentResources:
    """Test student resource access"""
    
    def test_student_can_view_course_resources(self, client, student_token, test_data, app):
        """Test that student can view resources in enrolled course"""
        with app.app_context():
            # Get educator's public_id
            educator = User.query.get(test_data['educator_id'])
            
            # Create a resource
            resource = Resource(
                title="Test Resource",
                type="pdf",
                url="http://example.com/resource.pdf",
                course_id=test_data['course_id'],
                uploaded_by_public_id=educator.public_id
            )
            db.session.add(resource)
            db.session.commit()
        
        response = client.get(
            f'/api/courses/{test_data["course_id"]}/resources',
            headers={'Authorization': f'Bearer {student_token}'}
        )
        assert response.status_code == 200
        data = response.get_json()
        assert 'resources' in data['data']


class TestStudentProfile:
    """Test student profile management"""
    
    def test_student_can_view_own_profile(self, client, student_token):
        """Test that student can view their profile"""
        response = client.get(
            '/api/users/me',
            headers={'Authorization': f'Bearer {student_token}'}
        )
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert 'user' in data['data']
        assert data['data']['user']['role'] == 'student'
    
    def test_student_can_update_own_profile(self, client, student_token):
        """Test that student can update their profile"""
        response = client.put(
            '/api/users/me',
            headers={'Authorization': f'Bearer {student_token}'},
            json={
                'name': 'Updated Student Name'
            }
        )
        # Should succeed or return appropriate status
        assert response.status_code in [200, 201, 204]
