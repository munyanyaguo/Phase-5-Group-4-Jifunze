from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from datetime import datetime, timedelta
import random

app = Flask(__name__)

app.config['SECRET_KEY'] = os.getenv("SECRET_KEY")
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("DATABASE_URL")

CORS(app, origins=os.getenv("CORS_ORIGINS").split(","))

@app.route("/ping")
def ping():
    return jsonify({"message": "pong"}), 200

# Dummy data just for development
SCHOOLS_DATA = [
    {
        "id": 1,
        "name": "Kibera Academy",
        "address": "Kibera, Nairobi",
        "students": 245,
        "teachers": 18,
        "established": "2015"
    },
    {
        "id": 2,
        "name": "Mathare High School", 
        "address": "Mathare, Nairobi",
        "students": 312,
        "teachers": 22,
        "established": "2012"
    },
    {
        "id": 3,
        "name": "Eastlands Primary",
        "address": "Eastlands, Nairobi", 
        "students": 189,
        "teachers": 15,
        "established": "2018"
    }
]

COURSES_DATA = [
    {
        "id": 1,
        "title": "Mathematics Grade 8",
        "description": "Advanced mathematics for grade 8 students",
        "school_id": 1,
        "educator": "John Kamau",
        "enrolled": 45,
        "schedule": "Mon, Wed, Fri - 9:00 AM"
    },
    {
        "id": 2,
        "title": "English Literature",
        "description": "Comprehensive English literature course",
        "school_id": 1,
        "educator": "Mary Wanjiku", 
        "enrolled": 38,
        "schedule": "Tue, Thu - 10:30 AM"
    },
    {
        "id": 3,
        "title": "Science & Technology",
        "description": "Integrated science and technology studies",
        "school_id": 2,
        "educator": "Peter Ochieng",
        "enrolled": 52,
        "schedule": "Daily - 2:00 PM"
    },
    {
        "id": 4,
        "title": "Kiswahili",
        "description": "Advanced Kiswahili language studies",
        "school_id": 3,
        "educator": "Grace Akinyi",
        "enrolled": 41,
        "schedule": "Mon, Wed - 11:00 AM"
    }
]

STUDENTS_DATA = [
    {"id": 1, "name": "James Mwangi", "school_id": 1, "grade": "Grade 8", "attendance": 95},
    {"id": 2, "name": "Sarah Njeri", "school_id": 1, "grade": "Grade 7", "attendance": 88},
    {"id": 3, "name": "David Ochieng", "school_id": 2, "grade": "Form 2", "attendance": 92},
    {"id": 4, "name": "Faith Auma", "school_id": 2, "grade": "Form 1", "attendance": 97},
    {"id": 5, "name": "Kevin Mutua", "school_id": 3, "grade": "Standard 6", "attendance": 85}
]

MESSAGES_DATA = [
    {
        "id": 1,
        "course_id": 1,
        "sender": "John Kamau",
        "message": "Tomorrow's class will focus on algebraic equations. Please bring your calculators.",
        "timestamp": "2 hours ago",
        "replies": 3
    },
    {
        "id": 2, 
        "course_id": 2,
        "sender": "Mary Wanjiku",
        "message": "Great discussion today about Shakespeare's themes. Assignment due Friday.",
        "timestamp": "1 day ago",
        "replies": 8
    }
]

@app.route('/')
def home():
    return jsonify({
        "message": "🎓 Jifunze API - Educational Management Platform",
        "status": "deployed and running",
        "environment": os.environ.get('FLASK_ENV', 'development'),
        "timestamp": datetime.utcnow().isoformat(),
        "endpoints": {
            "schools": "/schools",
            "courses": "/courses", 
            "students": "/students",
            "attendance": "/attendance",
            "messages": "/messages",
            "health": "/health"
        }
    })

@app.route('/health')
def health():
    return jsonify({
        "status": "healthy",
        "database": "SQLite (demo mode)",
        "services": {
            "authentication": "✅ ready",
            "file_upload": "✅ ready",
            "messaging": "✅ ready",
            "attendance": "✅ ready"
        },
        "uptime": "99.9%",
        "last_backup": "2024-01-15T08:00:00Z"
    })

@app.route('/schools')
def schools():
    return jsonify({
        "schools": SCHOOLS_DATA,
        "total": len(SCHOOLS_DATA),
        "active": len(SCHOOLS_DATA),
        "total_students": sum(school["students"] for school in SCHOOLS_DATA),
        "total_teachers": sum(school["teachers"] for school in SCHOOLS_DATA)
    })

@app.route('/schools/<int:school_id>')
def school_detail(school_id):
    school = next((s for s in SCHOOLS_DATA if s["id"] == school_id), None)
    if not school:
        return jsonify({"error": "School not found"}), 404
    
    school_detail = school.copy()
    school_detail["courses"] = [c for c in COURSES_DATA if c["school_id"] == school_id]
    school_detail["recent_activity"] = f"Last updated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M')}"
    
    return jsonify(school_detail)

@app.route('/courses')
def courses():
    school_id = request.args.get('school_id', type=int)
    courses = COURSES_DATA
    
    if school_id:
        courses = [c for c in courses if c["school_id"] == school_id]
    
    return jsonify({
        "courses": courses,
        "total": len(courses),
        "total_enrolled": sum(course["enrolled"] for course in courses)
    })

@app.route('/students')
def students():
    school_id = request.args.get('school_id', type=int)
    students = STUDENTS_DATA
    
    if school_id:
        students = [s for s in students if s["school_id"] == school_id]
    
    return jsonify({
        "students": students,
        "total": len(students),
        "average_attendance": sum(s["attendance"] for s in students) / len(students) if students else 0
    })

@app.route('/attendance')
def attendance():
    # Generate some dummy attendance data
    today = datetime.now()
    attendance_data = []
    
    for i in range(7):  # Last 7 days
        date = today - timedelta(days=i)
        attendance_data.append({
            "date": date.strftime("%Y-%m-%d"),
            "present": random.randint(680, 750),
            "absent": random.randint(20, 66),
            "late": random.randint(5, 25),
            "percentage": round(random.uniform(88, 97), 1)
        })
    
    return jsonify({
        "weekly_attendance": attendance_data,
        "summary": {
            "average_attendance": "92.5%",
            "total_students": 746,
            "trend": "improving"
        }
    })

@app.route('/messages')
def messages():
    course_id = request.args.get('course_id', type=int)
    messages = MESSAGES_DATA
    
    if course_id:
        messages = [m for m in messages if m["course_id"] == course_id]
    
    return jsonify({
        "messages": messages,
        "total": len(messages),
        "unread": random.randint(2, 8)
    })

@app.route('/dashboard/stats')
def dashboard_stats():
    return jsonify({
        "total_schools": len(SCHOOLS_DATA),
        "total_students": sum(school["students"] for school in SCHOOLS_DATA),
        "total_teachers": sum(school["teachers"] for school in SCHOOLS_DATA),
        "total_courses": len(COURSES_DATA),
        "active_sessions": random.randint(45, 89),
        "attendance_today": "94.2%",
        "new_messages": random.randint(12, 28),
        "system_health": "excellent"
    })

@app.route('/resources')
def resources():
    resources_data = [
        {
            "id": 1,
            "title": "Mathematics Workbook - Grade 8",
            "type": "PDF",
            "course_id": 1,
            "uploaded_by": "John Kamau",
            "size": "2.4 MB",
            "downloads": 45
        },
        {
            "id": 2,
            "title": "English Literature Notes",
            "type": "Document", 
            "course_id": 2,
            "uploaded_by": "Mary Wanjiku",
            "size": "1.8 MB",
            "downloads": 38
        },
        {
            "id": 3,
            "title": "Science Experiment Videos",
            "type": "Video",
            "course_id": 3,
            "uploaded_by": "Peter Ochieng", 
            "size": "45.2 MB",
            "downloads": 52
        }
    ]
    
    return jsonify({
        "resources": resources_data,
        "total": len(resources_data),
        "total_size": "49.4 MB"
    })

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({
        "error": "Endpoint not found",
        "available_endpoints": [
            "/health",
            "/schools", 
            "/courses",
            "/students",
            "/attendance",
            "/messages",
            "/dashboard/stats",
            "/resources"
        ]
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        "error": "Internal server error",
        "message": "Something went wrong on our end"
    }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug_mode = os.environ.get('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug_mode)