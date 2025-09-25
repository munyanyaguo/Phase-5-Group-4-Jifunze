import pytest
from app.models import Course, User, School, Enrollment, Attendance, Resource, Message, db


class TestCourseModel:
    """Test the Course model functionality"""

    def setup_method(self):
        """Set up test data for each test"""
        # Create school owner
        self.owner = User(
            name="School Owner",
            email="owner@example.com",
            password_hash="hash",
            role="manager"
        )
        self.owner.save()
        
        # Create school
        self.school = School(
            name="Test School",
            owner_id=self.owner.id
        )
        self.school.save()
        
        # Create educator
        self.educator = User(
            name="Test Educator",
            email="educator@example.com",
            password_hash="hash",
            role="educator",
            school_id=self.school.id
        )
        self.educator.save()

    def test_course_creation_with_required_fields(self):
        """Test creating a course with all required fields"""
        course = Course(
            title="Introduction to Python",
            description="Learn Python programming basics",
            educator_id=self.educator.id,
            school_id=self.school.id
        )
        course.save()
        
        assert course.id is not None
        assert course.title == "Introduction to Python"
        assert course.description == "Learn Python programming basics"
        assert course.educator_id == self.educator.id
        assert course.school_id == self.school.id

    def test_course_creation_without_description(self):
        """Test creating a course without description (nullable field)"""
        course = Course(
            title="Math 101",
            description=None,
            educator_id=self.educator.id,
            school_id=self.school.id
        )
        course.save()
        
        assert course.description is None
        assert course.title == "Math 101"

    def test_course_title_required(self):
        """Test that course title is required"""
        course = Course(
            title=None,  # Missing required field
            educator_id=self.educator.id,
            school_id=self.school.id
        )
        
        with pytest.raises(Exception):  # IntegrityError from database
            course.save()

    def test_course_educator_id_required(self):
        """Test that educator_id is required"""
        course = Course(
            title="Test Course",
            educator_id=None,  # Missing required field
            school_id=self.school.id
        )
        
        with pytest.raises(Exception):  # IntegrityError from database
            course.save()

    def test_course_school_id_required(self):
        """Test that school_id is required"""
        course = Course(
            title="Test Course",
            educator_id=self.educator.id,
            school_id=None  # Missing required field
        )
        
        with pytest.raises(Exception):  # IntegrityError from database
            course.save()

    def test_course_educator_foreign_key_constraint(self):
        """Test that educator_id must reference a valid user"""
        course = Course(
            title="Test Course",
            educator_id=99999,  # Non-existent user ID
            school_id=self.school.id
        )
        
        with pytest.raises(Exception):  # Foreign key constraint error
            course.save()

    def test_course_school_foreign_key_constraint(self):
        """Test that school_id must reference a valid school"""
        course = Course(
            title="Test Course",
            educator_id=self.educator.id,
            school_id=99999  # Non-existent school ID
        )
        
        with pytest.raises(Exception):  # Foreign key constraint error
            course.save()

    def test_course_educator_relationship(self):
        """Test the relationship between Course and Educator"""
        course = Course(
            title="Test Course",
            educator_id=self.educator.id,
            school_id=self.school.id
        )
        course.save()
        
        # Test relationship from course to educator
        assert course.educator == self.educator
        
        # Test relationship from educator to courses
        assert course in self.educator.courses

    def test_course_school_relationship(self):
        """Test the relationship between Course and School"""
        course = Course(
            title="Test Course",
            educator_id=self.educator.id,
            school_id=self.school.id
        )
        course.save()
        
        # Test relationship from course to school
        assert course.school == self.school
        
        # Test relationship from school to courses
        assert course in self.school.courses

    def test_course_enrollments_relationship(self):
        """Test the relationship between Course and Enrollments"""
        course = Course(
            title="Test Course",
            educator_id=self.educator.id,
            school_id=self.school.id
        )
        course.save()
        
        # Create a student
        student = User(
            name="Test Student",
            email="student@example.com",
            password_hash="hash",
            role="student",
            school_id=self.school.id
        )
        student.save()
        
        # Create enrollment
        from datetime import datetime
        enrollment = Enrollment(
            user_id=student.id,
            course_id=course.id,
            date_enrolled=datetime.utcnow()
        )
        enrollment.save()
        
        # Test relationships
        assert len(course.enrollments) == 1
        assert enrollment in course.enrollments
        assert enrollment.course == course

    def test_course_cascade_delete_enrollments(self):
        """Test that deleting a course cascades to enrollments"""
        course = Course(
            title="Test Course",
            educator_id=self.educator.id,
            school_id=self.school.id
        )
        course.save()
        
        # Create student and enrollment
        student = User(
            name="Test Student",
            email="student@example.com",
            password_hash="hash",
            role="student"
        )
        student.save()
        
        from datetime import datetime
        enrollment = Enrollment(
            user_id=student.id,
            course_id=course.id,
            date_enrolled=datetime.utcnow()
        )
        enrollment.save()
        enrollment_id = enrollment.id
        
        # Delete course
        course.delete()
        
        # Enrollment should be deleted due to cascade
        assert Enrollment.query.get(enrollment_id) is None

    def test_course_attendance_relationship(self):
        """Test the relationship between Course and Attendance"""
        course = Course(
            title="Test Course",
            educator_id=self.educator.id,
            school_id=self.school.id
        )
        course.save()
        
        # Create student
        student = User(
            name="Test Student",
            email="student@example.com",
            password_hash="hash",
            role="student"
        )
        student.save()
        
        # Create attendance record
        from datetime import date
        attendance = Attendance(
            user_id=student.id,
            course_id=course.id,
            date=date.today(),
            status="present"
        )
        attendance.save()
        
        # Test relationships
        assert len(course.attendance) == 1
        assert attendance in course.attendance
        assert attendance.course == course

    def test_course_resources_relationship(self):
        """Test the relationship between Course and Resources"""
        course = Course(
            title="Test Course",
            educator_id=self.educator.id,
            school_id=self.school.id
        )
        course.save()
        
        # Create resource
        resource = Resource(
            course_id=course.id,
            uploaded_by=self.educator.id,
            title="Course Syllabus",
            url="https://example.com/syllabus.pdf",
            type="pdf"
        )
        resource.save()
        
        # Test relationships
        assert len(course.resources) == 1
        assert resource in course.resources
        assert resource.course == course

    def test_course_messages_relationship(self):
        """Test the relationship between Course and Messages"""
        course = Course(
            title="Test Course",
            educator_id=self.educator.id,
            school_id=self.school.id
        )
        course.save()
        
        # Create message
        from datetime import datetime
        message = Message(
            user_id=self.educator.id,
            course_id=course.id,
            content="Welcome to the course!",
            timestamp=datetime.utcnow()
        )
        message.save()
        
        # Test relationships
        assert len(course.messages) == 1
        assert message in course.messages
        assert message.course == course

    def test_course_cascade_delete_all_related(self):
        """Test that deleting a course cascades to all related models"""
        course = Course(
            title="Test Course",
            educator_id=self.educator.id,
            school_id=self.school.id
        )
        course.save()
        
        # Create student
        student = User(
            name="Test Student",
            email="student@example.com",
            password_hash="hash",
            role="student"
        )
        student.save()
        
        # Create related records
        from datetime import datetime, date
        
        enrollment = Enrollment(
            user_id=student.id,
            course_id=course.id,
            date_enrolled=datetime.utcnow()
        )
        enrollment.save()
        
        attendance = Attendance(
            user_id=student.id,
            course_id=course.id,
            date=date.today(),
            status="present"
        )
        attendance.save()
        
        resource = Resource(
            course_id=course.id,
            uploaded_by=self.educator.id,
            title="Test Resource",
            url="https://example.com/test.pdf",
            type="pdf"
        )
        resource.save()
        
        message = Message(
            user_id=self.educator.id,
            course_id=course.id,
            content="Test message",
            timestamp=datetime.utcnow()
        )
        message.save()
        
        # Store IDs
        enrollment_id = enrollment.id
        attendance_id = attendance.id
        resource_id = resource.id
        message_id = message.id
        
        # Delete course
        course.delete()
        
        # All related records should be deleted due to cascade
        assert Enrollment.query.get(enrollment_id) is None
        assert Attendance.query.get(attendance_id) is None
        assert Resource.query.get(resource_id) is None
        assert Message.query.get(message_id) is None

    def test_course_repr(self):
        """Test the string representation of Course"""
        course = Course(
            title="Introduction to Python",
            educator_id=self.educator.id,
            school_id=self.school.id
        )
        
        repr_str = repr(course)
        assert "Introduction to Python" in repr_str
        assert repr_str.startswith("<Course")
        assert repr_str.endswith(">")

    def test_course_title_max_length(self):
        """Test course with maximum length title"""
        long_title = "A" * 150  # Maximum length according to model
        course = Course(
            title=long_title,
            educator_id=self.educator.id,
            school_id=self.school.id
        )
        course.save()
        
        assert course.title == long_title

    def test_course_title_too_long(self):
        """Test that course title has length constraints"""
        too_long_title = "A" * 151  # Exceeds maximum length
        course = Course(
            title=too_long_title,
            educator_id=self.educator.id,
            school_id=self.school.id
        )
        
        with pytest.raises(Exception):  # Database constraint error
            course.save()

    def test_course_long_description(self):
        """Test course with long description (Text field)"""
        long_description = "This is a very long description. " * 100
        course = Course(
            title="Test Course",
            description=long_description,
            educator_id=self.educator.id,
            school_id=self.school.id
        )
        course.save()
        
        assert course.description == long_description

    def test_multiple_courses_same_educator(self):
        """Test that one educator can teach multiple courses"""
        course1 = Course(
            title="Python 101",
            educator_id=self.educator.id,
            school_id=self.school.id
        )
        course1.save()
        
        course2 = Course(
            title="Python 102",
            educator_id=self.educator.id,
            school_id=self.school.id
        )
        course2.save()
        
        # Both courses should be created successfully
        assert course1.educator_id == self.educator.id
        assert course2.educator_id == self.educator.id
        assert len(self.educator.courses) == 2
        assert course1 in self.educator.courses
        assert course2 in self.educator.courses

    def test_multiple_courses_same_school(self):
        """Test that one school can have multiple courses"""
        # Create another educator
        educator2 = User(
            name="Second Educator",
            email="educator2@example.com",
            password_hash="hash",
            role="educator"
        )
        educator2.save()
        
        course1 = Course(
            title="Math 101",
            educator_id=self.educator.id,
            school_id=self.school.id
        )
        course1.save()
        
        course2 = Course(
            title="Science 101",
            educator_id=educator2.id,
            school_id=self.school.id
        )
        course2.save()
        
        # Both courses should belong to the same school
        assert course1.school_id == self.school.id
        assert course2.school_id == self.school.id
        assert len(self.school.courses) == 2
        assert course1 in self.school.courses
        assert course2 in self.school.courses