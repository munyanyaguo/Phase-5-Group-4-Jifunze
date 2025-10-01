// src/pages/manager/ManagerEnrollments.jsx
import React, { useEffect, useState } from "react";
import {
  fetchDashboard,
  fetchSchoolEnrollments,
  fetchOwnerStudents,
  fetchSchoolCourses,
  createEnrollment,
  deleteEnrollment,
} from "../../api";

export default function ManagerEnrollments() {
  const [schoolId, setSchoolId] = useState(null);
  const [schools, setSchools] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");

  // --------------------
  // Load manager's school
  // --------------------
  const loadSchool = async () => {
    try {
      const dash = await fetchDashboard();
      // Backend returns { dashboard: { schools: [...] } }
      const list = dash?.dashboard?.schools || [];
      setSchools(list);
      if (list.length > 0) {
        setSchoolId(list[0].id);
      } else {
        alert("No school found for this manager.");
      }
    } catch (err) {
      console.error("Failed to load dashboard:", err.message);
      alert("Failed to load school.");
    }
  };

  // --------------------
  // Load enrollments, students, courses
  // --------------------
  const loadData = async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const [enrs, studs, crs] = await Promise.all([
        fetchSchoolEnrollments(id),
        fetchOwnerStudents(),
        fetchSchoolCourses(id),
      ]);
      setEnrollments(enrs || []);
      setStudents((studs && studs.students) || []);
      setCourses((crs && crs.courses) || []);
    } catch (err) {
      console.error("Failed to load enrollment data:", err.message);
      alert("Failed to load enrollment data.");
    } finally {
      setLoading(false);
    }
  };

  // --------------------
  // Effects
  // --------------------
  useEffect(() => {
    loadSchool();
  }, []);

  useEffect(() => {
    if (schoolId) loadData(schoolId);
  }, [schoolId]);

  // When student changes, clear previously selected course to avoid mismatch
  useEffect(() => {
    setSelectedCourse("");
  }, [selectedStudent]);

  // --------------------
  // Helpers
  // --------------------
  const getStudentName = (publicId) => {
    const s = students.find((st) => (st.public_id || st.id) === publicId);
    return s ? `${s.full_name || s.username} (${s.email})` : publicId;
  };

  const getCourseTitle = (id) => {
    const c = courses.find((cr) => cr.id === id);
    return c ? c.title : id;
  };

  // --------------------
  // Handle Enroll
  // --------------------
  const handleEnroll = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !selectedCourse) {
      return alert("Select both a student and a course.");
    }
    try {
      await createEnrollment({
        user_public_id: selectedStudent,
        course_id: parseInt(selectedCourse),
      });
      await loadData(schoolId);
      setSelectedStudent("");
      setSelectedCourse("");
      alert("Student enrolled successfully.");
    } catch (err) {
      console.error("Enroll failed:", err.message);
      alert(err.message || "Failed to enroll student.");
    }
  };

  // --------------------
  // Handle Unenroll
  // --------------------
  const handleDelete = async (id) => {
    if (!window.confirm("Unenroll this student?")) return;
    try {
      await deleteEnrollment(id);
      await loadData(schoolId);
    } catch (err) {
      console.error("Delete failed:", err.message);
      alert(err.message || "Failed to unenroll student.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Enrollments</h1>

      {/* School selector */}
      {schools.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm mb-1">School</label>
          <select
            className="border p-2 w-full"
            value={schoolId || ""}
            onChange={(e) => setSchoolId(parseInt(e.target.value))}
          >
            {schools.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Enroll Form */}
      <form className="mb-6 border p-4 rounded" onSubmit={handleEnroll}>
        <select
          className="border p-2 w-full mb-2"
          value={selectedStudent}
          onChange={(e) => setSelectedStudent(e.target.value)}
        >
          <option value="">-- Select Student --</option>
          {students
            .filter((s) => (schoolId ? String(s.school_id) === String(schoolId) : true))
            .map((s) => (
            <option key={s.public_id || s.id} value={s.public_id || s.id}>
              {(s.full_name || s.name || s.username) + ` (${s.email})`}
            </option>
          ))}
        </select>

        <select
          className="border p-2 w-full mb-2"
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
        >
          <option value="">-- Select Course --</option>
          {courses.map((c) => (
            <option key={c.id} value={String(c.id)}>
              {c.title}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Enroll Student
        </button>
      </form>

      {/* Enrollment Table */}
      {loading ? (
        <p>Loading...</p>
      ) : enrollments.length === 0 ? (
        <p>No enrollments found.</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-2 py-1">ID</th>
              <th className="border px-2 py-1">Student</th>
              <th className="border px-2 py-1">Course</th>
              <th className="border px-2 py-1">Date Enrolled</th>
              <th className="border px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {enrollments.map((en) => (
              <tr key={en.id}>
                <td className="border px-2 py-1">{en.id}</td>
                <td className="border px-2 py-1">
                  {en.user?.name || en.user?.full_name || getStudentName(en.user_public_id)}
                </td>
                <td className="border px-2 py-1">
                  {en.course?.title || getCourseTitle(en.course_id)}
                </td>
                <td className="border px-2 py-1">
                  {(en.date_enrolled || en.created_at)
                    ? new Date(en.created_at).toLocaleDateString()
                    : "—"}
                </td>
                <td className="border px-2 py-1">
                  <button
                    className="text-red-600"
                    onClick={() => handleDelete(en.id)}
                  >
                    Unenroll
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
