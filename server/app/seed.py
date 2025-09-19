import random
from datetime import datetime, timedelta, timezone
from flask.cli import with_appcontext 
import click
from faker import Faker

from app.extensions import db
from app.models import (
    Attendance,
    Course,
    Enrollment,
    Message,
    Resource,
    School,
    User,
)

fake = Faker()


def get_or_create_school(name: str = "Demo School", owner_id: int | None = None) -> School:
    school = School.query.filter_by(name=name).first()
    if school:
        return school
    school = School(name=name, address=fake.address(), owner_id=owner_id)
    db.session.add(school)
    db.session.commit()
    return school



def get_or_create_user(email: str, name: str, role: str, school_id: int) -> User:
    user = User.query.filter_by(email=email).first()
    if user:
        return user
    user = User(name=name, email=email, role=role, school_id=school_id)
    user.set_password("password")
    db.session.add(user)
    db.session.commit()
    return user


def create_course(title: str, educator_id: int, school_id: int) -> Course:
    course = Course.query.filter_by(title=title, school_id=school_id).first()
    if course:
        return course
    course = Course(
        title=title,
        description=fake.sentence(nb_words=10),
        educator_id=educator_id,
        school_id=school_id,
    )
    db.session.add(course)
    db.session.commit()
    return course


def enroll_user(user_id: int, course_id: int, when: datetime) -> Enrollment:
    existing = Enrollment.query.filter_by(user_id=user_id, course_id=course_id).first()
    if existing:
        return existing
    enrollment = Enrollment(user_id=user_id, course_id=course_id, date_enrolled=when)
    db.session.add(enrollment)
    db.session.commit()
    return enrollment


def record_attendance(user_id: int, course_id: int, when: datetime, status: str) -> Attendance:
    existing = Attendance.query.filter_by(
        user_id=user_id, course_id=course_id, date=when.date()
    ).first()
    if existing:
        return existing
    att = Attendance(
        user_id=user_id,
        course_id=course_id,
        date=when.date(),
        status=status,
        verified_by=None,
    )
    db.session.add(att)
    db.session.commit()
    return att


def add_resource(course_id: int, uploader_id: int, title: str) -> Resource:
    existing = Resource.query.filter_by(course_id=course_id, title=title).first()
    if existing:
        return existing
    res = Resource(
        course_id=course_id,
        uploaded_by=uploader_id,
        title=title,
        url=fake.url(),
        type=random.choice(["pdf", "doc", "link"]),
    )
    db.session.add(res)
    db.session.commit()
    return res


def add_message(course_id: int, user_id: int, content: str, parent_id: int | None = None) -> Message:
    msg = Message(
        user_id=user_id,
        course_id=course_id,
        parent_id=parent_id,
        content=content,
        timestamp=datetime.now(timezone.utc),
    )
    db.session.add(msg)
    db.session.commit()
    return msg


@click.group(help="Seed database with demo data.")
def seed():
    pass


@seed.command("run")
@with_appcontext
@click.option("--students", default=5, show_default=True, help="Number of students")
@click.option("--educators", default=1, show_default=True, help="Number of educators")
@click.option("--courses", default=2, show_default=True, help="Number of courses")
def seed_run(students: int, educators: int, courses: int):
    manager = get_or_create_user(
        email="manager@demo.com", name="Manager", role="manager", school_id=None
    )

    school = get_or_create_school(owner_id=manager.id)

    manager.school_id = school.id
    db.session.commit()

    educator_users: list[User] = []
    for i in range(educators):
        educator_users.append(
            get_or_create_user(
                email=f"educator{i+1}@demo.com",
                name=fake.name(),
                role="educator",
                school_id=school.id,
            )
        )

    student_users: list[User] = []
    for i in range(students):
        student_users.append(
            get_or_create_user(
                email=f"student{i+1}@demo.com",
                name=fake.name(),
                role="student",
                school_id=school.id,
            )
        )

    course_rows: list[Course] = []
    for i in range(courses):
        educator = random.choice(educator_users) if educator_users else manager
        course_rows.append(
            create_course(title=f"Course {i+1}", educator_id=educator.id, school_id=school.id)
        )

    now = datetime.now(timezone.utc)
    for course in course_rows:
        for s in student_users:
            enroll_user(s.id, course.id, now - timedelta(days=random.randint(1, 10)))
            # attendance for past few days
            for d in range(3):
                day = now - timedelta(days=d)
                record_attendance(
                    user_id=s.id,
                    course_id=course.id,
                    when=day,
                    status=random.choice(["present", "absent", "late"]),
                )
        # sample resources and chat
        add_resource(course.id, course.educator_id, f"Syllabus {course.title}")
        add_message(course.id, course.educator_id, "Welcome to the course!")
        if student_users:
            add_message(course.id, student_users[0].id, "Thank you!", parent_id=None)

    click.echo("Seed complete (idempotent). Default password for demo users: password")


@seed.command("clear")
@with_appcontext
def seed_clear():
    # delete in dependency-safe order
    Message.query.delete()
    Resource.query.delete()
    Attendance.query.delete()
    Enrollment.query.delete()
    Course.query.delete()
    User.query.delete()
    School.query.delete()
    db.session.commit()
    click.echo("Seed cleared.")