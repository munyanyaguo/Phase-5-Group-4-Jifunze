// src/pages/manager/ManagerCourses.jsx
import React, { useEffect, useState } from "react";
import {
  fetchSchools,
  fetchSchoolCourses,
  fetchManagerEducators,
  createCourse,
  updateCourse,
  deleteCourse,
} from "../../api";

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
    educator_id: formData.educator_id ? parseInt(formData.educator_id) : null, // convert string → int
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
    if (err.response && err.response.data && err.response.data.errors) {
      const fieldErrors = err.response.data.errors;
      alert(JSON.stringify(fieldErrors, null, 2));
    } else {
      alert(err.message || "An error occurred while saving the course.");
    }
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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Courses</h1>

      {/* School selector */}
      {schools.length > 1 && (
        <select
          className="border p-2 mb-4"
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

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
        onClick={() => {
          setShowForm(true);
          setEditingCourse(null);
          setFormData({ title: "", description: "", educator_id: "" });
        }}
      >
        + New Course
      </button>

      {/* Form */}
      {showForm && (
        <form className="mb-6 border p-4 rounded" onSubmit={handleSubmit}>
          <input
            className="border p-2 w-full mb-2"
            placeholder="Course Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <textarea
            className="border p-2 w-full mb-2"
            placeholder="Course Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <select
            className="border p-2 w-full mb-2"
            value={formData.educator_id}
            onChange={(e) => setFormData({ ...formData, educator_id: e.target.value })}
          >
            <option value="">-- Assign Educator --</option>
            {educators.map((ed) => (
              <option key={ed.id} value={ed.id}>
                {ed.name}
              </option>
            ))}
          </select>

          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
            {editingCourse ? "Update Course" : "Create Course"}
          </button>
          <button
            type="button"
            className="ml-2 px-4 py-2 rounded border"
            onClick={() => setShowForm(false)}
          >
            Cancel
          </button>
        </form>
      )}

      {/* Courses Table */}
      {loading ? (
        <p>Loading...</p>
      ) : courses.length === 0 ? (
        <p>No courses found.</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-2 py-1">Title</th>
              <th className="border px-2 py-1">Description</th>
              <th className="border px-2 py-1">Educator</th>
              <th className="border px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.id}>
                <td className="border px-2 py-1">{course.title}</td>
                <td className="border px-2 py-1">{course.description}</td>
                <td className="border px-2 py-1">{course.educator?.name || "Unassigned"}</td>
                <td className="border px-2 py-1">
                  <button
                    className="mr-2 text-blue-600"
                    onClick={() => handleEditCourse(course)}
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-600"
                    onClick={() => handleDeleteCourse(course)}
                  >
                    Delete
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
