// src/pages/owner/Students.jsx
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { UserPlus, Trash2, GraduationCap } from "lucide-react";
import {
  fetchOwnerStudents,
  deleteUser,
  apiAssignUser,
  fetchOwnerSchools,
} from "../../api";

export default function Students() {
  const location = useLocation();
  const [students, setStudents] = useState([]);
  const [schools, setSchools] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ email: "", school_id: "" });

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchOwnerStudents();
        let normalized = [];
        if (Array.isArray(data)) normalized = data;
        else if (data?.students && Array.isArray(data.students))
          normalized = data.students;
        else if (data) normalized = [data];
        setStudents(normalized);

        // Fetch schools
        const schoolData = await fetchOwnerSchools();
        let schoolsArray = [];
        if (Array.isArray(schoolData)) schoolsArray = schoolData;
        else if (schoolData?.schools && Array.isArray(schoolData.schools))
          schoolsArray = schoolData.schools;
        setSchools(schoolsArray);
      } catch (err) {
        console.error("Failed to load data:", err);
      }
    };
    load();
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiAssignUser(formData.school_id, "student", formData.email);
      // Reload students
      const data = await fetchOwnerStudents();
      let normalized = [];
      if (Array.isArray(data)) normalized = data;
      else if (data?.students && Array.isArray(data.students))
        normalized = data.students;
      else if (data) normalized = [data];
      setStudents(normalized);
      setFormData({ email: "", school_id: "" });
      setShowForm(false);
    } catch (err) {
      console.error("Failed to assign student:", err);
      alert("Failed to assign student: " + (err.message || ""));
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteUser(id);
      setStudents((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Failed to delete student:", err);
    }
  };

  // Find school name by ID
  const getSchoolName = (id) =>
    schools.find((s) => s.id === id)?.name || "Not assigned";

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">🎓 Students</h1>

      <button
        onClick={() => setShowForm((prev) => !prev)}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md shadow hover:bg-green-700"
      >
        <UserPlus size={18} /> Add Student
      </button>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-4 p-4 bg-white rounded-xl shadow-md border border-gray-200"
        >
          <input
            type="email"
            placeholder="Student email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            className="border p-2 rounded w-full mb-3"
          />

          <select
            value={formData.school_id}
            onChange={(e) =>
              setFormData({ ...formData, school_id: e.target.value })
            }
            required
            className="border p-2 rounded w-full mb-3"
          >
            <option value="">Select School</option>
            {schools.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Save
          </button>
        </form>
      )}

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {students.length === 0 ? (
          <p className="text-gray-600">No students found.</p>
        ) : (
          students.map((student) => (
            <div
              key={student.id}
              className="bg-white shadow-md rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <GraduationCap className="text-blue-600" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    {student.email}
                  </h2>
                  <p className="text-sm text-gray-600">
                    School:{" "}
                    <span className="font-medium text-gray-900">
                      {student.school?.name ||
                        getSchoolName(student.school_id) ||
                        "Not assigned"}
                    </span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(student.id)}
                className="flex items-center gap-2 text-red-600 hover:text-red-800 mt-2"
              >
                <Trash2 size={16} /> Remove
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
