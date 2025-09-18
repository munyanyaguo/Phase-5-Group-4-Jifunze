// src/pages/schoolOwner/Students.jsx
import { useState } from "react";
import UserForm from "../../components/owner/UserForm";
import { UserPlus, Trash2 } from "lucide-react";

export default function Students() {
  const [students, setStudents] = useState([
    { id: 1, name: "Alice Mwangi", email: "alice@example.com", className: "Class A" },
    { id: 2, name: "Brian Otieno", email: "brian@example.com", className: "Class B" },
  ]);

  const [showForm, setShowForm] = useState(false);

  // Add a new student
  const addStudent = (student) => {
    setStudents([...students, { id: Date.now(), ...student }]);
    setShowForm(false);
  };

  // Delete a student by id
  const deleteStudent = (id) => {
    setStudents(students.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">Students</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700"
        >
          <UserPlus size={20} /> Add Student
        </button>
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {students.map((s) => (
          <div
            key={s.id}
            className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition relative"
          >
            <h3 className="text-xl font-semibold text-gray-700">{s.name}</h3>
            <p className="text-sm text-gray-500">{s.email}</p>
            <p className="text-sm text-gray-400 mt-1">Class: {s.className}</p>

            {/* Delete Button */}
            <button
              onClick={() => deleteStudent(s.id)}
              className="absolute top-3 right-3 text-red-500 hover:text-red-700"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Add New Student</h3>
            <UserForm
              role="student"
              onAdd={addStudent}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
