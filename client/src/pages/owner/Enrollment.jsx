// src/pages/manager/ManagerEnrollments.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchSchoolCourses,
  fetchSchoolEnrollments,
  fetchOwnerStudents,
  fetchDashboard,
  createEnrollment,
  deleteEnrollment,
} from '../../api';
import { PlusCircle, UserMinus } from "lucide-react";

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
      // Handle both wrapped and unwrapped responses
      const dashData = dash?.dashboard || dash;
      const list = dashData?.schools || [];
      setSchools(list);
      if (list.length > 0) setSchoolId(list[0].id);
      else alert("No school found for this manager.");
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
      
      // Handle both wrapped and unwrapped responses
      const enrollmentsData = Array.isArray(enrs) ? enrs : (enrs?.enrollments || []);
      const studentsData = Array.isArray(studs) ? studs : (studs?.students || []);
      const coursesData = Array.isArray(crs) ? crs : (crs?.courses || []);
      
      setEnrollments(enrollmentsData);
      setStudents(studentsData);
      setCourses(coursesData);
    } catch (err) {
      console.error("Failed to load enrollment data:", err.message);
      alert("Failed to load enrollment data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchool();
  }, []);

  useEffect(() => {
    if (schoolId) loadData(schoolId);
  }, [schoolId]);

  useEffect(() => {
    setSelectedCourse("");
  }, [selectedStudent]);

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
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Manage Enrollments</h1>

      {/* School Selector */}
      {schools.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2">School</label>
          <select
            className="border p-2 rounded-lg w-full"
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
      <motion.form
        layout
        onSubmit={handleEnroll}
        className="mb-8 bg-white shadow p-6 rounded-xl"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-green-600" /> Enroll a Student
        </h2>
        <select
          className="border p-2 rounded-lg w-full mb-3"
          value={selectedStudent}
          onChange={(e) => setSelectedStudent(e.target.value)}
        >
          <option value="">-- Select Student --</option>
          {students.map((s) => {
            console.log("Student:", s, "School ID:", s.school_id, "Selected School:", schoolId);
            return (
              <option key={s.public_id || s.id} value={s.public_id || s.id}>
                {(s.name || s.full_name || s.username || "Unknown") + ` (${s.email}) - ${s.school || 'No School'}`}
              </option>
            );
          })}
        </select>

        <select
          className="border p-2 rounded-lg w-full mb-4"
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
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg shadow transition"
        >
          Enroll Student
        </button>
      </motion.form>

      {/* Enrollment List */}
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : enrollments.length === 0 ? (
        <p className="text-gray-500">No enrollments found.</p>
      ) : (
        <div className="bg-white shadow rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="px-4 py-2">Student</th>
                <th className="px-4 py-2">Course</th>
                <th className="px-4 py-2">Date Enrolled</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {enrollments.map((en) => (
                  <motion.tr
                    key={en.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="border-t"
                  >
                    <td className="px-4 py-2">
                      {en.user?.name ||
                        en.user?.full_name ||
                        getStudentName(en.user_public_id)}
                    </td>
                    <td className="px-4 py-2">
                      {en.course?.title || getCourseTitle(en.course_id)}
                    </td>
                    <td className="px-4 py-2">
                      {en.created_at
                        ? new Date(en.created_at).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        className="flex items-center gap-1 text-red-600 hover:text-red-800 mx-auto"
                        onClick={() => handleDelete(en.id)}
                      >
                        <UserMinus className="w-4 h-4" /> Unenroll
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
