// src/pages/Students.jsx
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import UserForm from "../../components/owner/UserForm";
import { UserPlus, Trash2, Eye, X } from "lucide-react";
import { fetchOwnerStudents, createStudent, deleteUser } from "../../api";

export default function Students() {
  const location = useLocation();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Load students
  const loadStudents = async () => {
    setLoading(true);
    try {
      const res = await fetchOwnerStudents();
      setStudents(res.students || []);
    } catch (err) {
      console.error("Failed to load students:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [location.pathname]); // Re-fetch when navigating back to this page

  // Add student
  const handleAddStudent = async (data) => {
    try {
      const newStudent = await createStudent({ ...data, role: "student" });
      setStudents((prev) => [...prev, newStudent]);
      setShowForm(false);
    } catch (err) {
      alert(err.message);
    }
  };

  // Delete student
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this student?")) return;
    try {
      await deleteUser(id);
      setStudents((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">Students</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition"
        >
          <UserPlus className="w-5 h-5" /> Add Student
        </button>
      </div>

      {/* Students List */}
      {loading ? (
        <p className="text-gray-500">Loading students...</p>
      ) : students.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No students found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((s) => (
            <div
              key={s.id}
              className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition relative"
            >
              {/* Avatar */}
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-green-100 text-green-700 font-bold mb-3">
                {s.name ? s.name.charAt(0).toUpperCase() : "S"}
              </div>

              {/* Info */}
              <h3 className="text-lg font-semibold">{s.name}</h3>
              <p className="text-xs text-gray-500">{s.email}</p>
              <p className="text-sm text-gray-400 mt-2">Class: {s.className || "N/A"}</p>
              <p className="text-sm text-gray-400">School: {s.school || "N/A"}</p>

              {/* Actions */}
              <div className="absolute top-3 right-3 flex gap-2">
                <button
                  onClick={() => setSelectedStudent(s)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <Eye />
                </button>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add student modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white p-6 rounded-xl w-full max-w-md relative animate-[fadeIn_0.2s_ease-out]">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <X />
            </button>
            <h3 className="text-xl font-semibold mb-4">Add Student</h3>
            <UserForm
              role="student"
              onAdd={handleAddStudent}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      {/* View student modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white p-6 rounded-xl w-full max-w-md relative animate-[fadeIn_0.2s_ease-out]">
            <button
              onClick={() => setSelectedStudent(null)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <X />
            </button>
            <h3 className="text-xl font-semibold mb-4">Student Details</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Name:</strong> {selectedStudent.name}</p>
              <p><strong>Email:</strong> {selectedStudent.email}</p>
              <p><strong>Class:</strong> {selectedStudent.className || "N/A"}</p>
              <p><strong>School:</strong> {selectedStudent.school || "N/A"}</p>
              <p><strong>Phone:</strong> {selectedStudent.phone || "N/A"}</p>
              <p>
                <strong>Registered:</strong>{" "}
                {selectedStudent.createdAt
                  ? new Date(selectedStudent.createdAt).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
            <button
              onClick={() => setSelectedStudent(null)}
              className="mt-6 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
