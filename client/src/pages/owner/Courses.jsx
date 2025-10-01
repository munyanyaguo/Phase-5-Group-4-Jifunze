// src/pages/manager/ManagerCourses.jsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchSchools,
  fetchSchoolCourses,
  fetchManagerEducators,
  createCourse,
  updateCourse,
  deleteCourse,
} from "../../api";
import { BookOpen, Edit, Trash2, PlusCircle } from "lucide-react";

export default function ManagerCourses() {
  const [schools, setSchools] = useState([]);
  const [schoolId, setSchoolId] = useState(null);
  const [courses, setCourses] = useState([]);
  const [educators, setEducators] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    educator_id: "",
  });

  // --------------------
  // Load manager schools
  // --------------------
  const loadManagerSchools = async () => {
    try {
      const res = await fetchSchools();
      setSchools(res.schools || []);
      if (res.schools?.length) {
        setSchoolId(res.schools[0].id);
      }
    } catch (err) {
      console.error("Failed to load manager schools:", err.message);
      alert("Failed to load schools.");
    }
  };

  // --------------------
  // Load courses
  // --------------------
  const loadCourses = async () => {
    if (!schoolId) return;
    setLoading(true);
    try {
      const data = await fetchSchoolCourses(schoolId);
      setCourses(data.courses || []);
    } catch (err) {
      console.error("Failed to load courses:", err.message);
      alert("Failed to load courses.");
    } finally {
      setLoading(false);
    }
  };

  // --------------------
  // Load educators
  // --------------------
  const loadEducators = async () => {
    if (!schoolId) return;
    try {
      const data = await fetchManagerEducators();
      setEducators(data.educators || []);
    } catch (err) {
      console.error("Failed to load educators:", err.message);
      alert("Failed to load educators.");
    }
  };

  // --------------------
  // Effects
  // --------------------
  useEffect(() => {
    loadManagerSchools();
  }, []);

  useEffect(() => {
    if (schoolId) {
      loadCourses();
      loadEducators();
    }
  }, [schoolId]);

  // --------------------
  // Handle form submit
  // --------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!schoolId) return alert("No school selected");

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      school_id: schoolId,
      educator_id: formData.educator_id ? parseInt(formData.educator_id) : null,
    };

    try {
      if (editingCourse) {
        await updateCourse(editingCourse.id, payload);
      } else {
        await createCourse(payload);
      }
      setShowForm(false);
      setEditingCourse(null);
      setFormData({ title: "", description: "", educator_id: "" });
      loadCourses();
    } catch (err) {
      console.error(err);
      alert(err.message || "An error occurred while saving the course.");
    }
  };

  // --------------------
  // Edit course
  // --------------------
  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      educator_id: course.educator?.id || "",
    });
    setShowForm(true);
  };

  // --------------------
  // Delete course
  // --------------------
  const handleDeleteCourse = async (course) => {
    if (!window.confirm(`Delete course "${course.title}"?`)) return;
    try {
      await deleteCourse(course.id);
      loadCourses();
    } catch (err) {
      console.error(err.message);
      alert(err.message);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BookOpen className="w-7 h-7 text-blue-600" />
          My Courses
        </h1>

        <button
          onClick={() => {
            setShowForm(true);
            setEditingCourse(null);
            setFormData({ title: "", description: "", educator_id: "" });
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow"
        >
          <PlusCircle className="w-5 h-5" />
          New Course
        </button>
      </div>

      {/* School selector */}
      {schools.length > 1 && (
        <select
          className="border p-2 rounded-lg shadow-sm"
          value={schoolId || ""}
          onChange={(e) => setSchoolId(parseInt(e.target.value))}
        >
          {schools.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      )}

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            key="modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl p-6 w-full max-w-lg shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-semibold mb-4">
                {editingCourse ? "Edit Course" : "New Course"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  className="border p-2 w-full rounded"
                  placeholder="Course Title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
                <textarea
                  className="border p-2 w-full rounded"
                  placeholder="Course Description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
                <select
                  className="border p-2 w-full rounded"
                  value={formData.educator_id}
                  onChange={(e) =>
                    setFormData({ ...formData, educator_id: e.target.value })
                  }
                >
                  <option value="">-- Assign Educator --</option>
                  {educators.map((ed) => (
                    <option key={ed.id} value={ed.id}>
                      {ed.name}
                    </option>
                  ))}
                </select>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 rounded border"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                  >
                    {editingCourse ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Courses Table */}
      {loading ? (
        <p className="text-gray-500">Loading courses...</p>
      ) : courses.length === 0 ? (
        <p className="text-gray-500">No courses found.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="px-4 py-2">Title</th>
                <th className="px-4 py-2">Description</th>
                <th className="px-4 py-2">Educator</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <motion.tr
                  key={course.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-t hover:bg-gray-50"
                >
                  <td className="px-4 py-2 font-medium">{course.title}</td>
                  <td className="px-4 py-2">{course.description}</td>
                  <td className="px-4 py-2">
                    {course.educator?.name || (
                      <span className="text-gray-400">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => handleEditCourse(course)}
                      className="text-blue-600 hover:text-blue-800 mr-3 inline-flex items-center gap-1"
                    >
                      <Edit className="w-4 h-4" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course)}
                      className="text-red-600 hover:text-red-800 inline-flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
