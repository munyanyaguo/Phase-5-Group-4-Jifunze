// src/pages/owner/Students.jsx
import React, { useState } from "react";
import UserForm from "../../components/owner/UserForm";
import { UserPlus, Trash2 } from "lucide-react";

export default function Students() {
  const [students, setStudents] = useState([
    { id: 1, name: "Alice Mwangi", email: "alice@example.com", className: "Class A" },
    { id: 2, name: "Brian Otieno", email: "brian@example.com", className: "Class B" },
  ]);
  const [showForm, setShowForm] = useState(false);

  const addStudent = (s) => setStudents((p) => [...p, { id: Date.now(), ...s }]);
  const del = (id) => setStudents((p) => p.filter((x) => x.id !== id));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Students</h2>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg">
          <UserPlus /> Add Student
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {students.map((s) => (
          <div key={s.id} className="bg-white p-6 rounded-xl shadow relative">
            <h3 className="text-lg font-semibold">{s.name}</h3>
            <p className="text-xs text-gray-500">{s.email}</p>
            <p className="text-sm text-gray-400 mt-2">Class: {s.className}</p>
            <button onClick={() => del(s.id)} className="absolute top-3 right-3 text-red-500 hover:text-red-700">
              <Trash2 />
            </button>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Add Student</h3>
            <UserForm role="student" onAdd={(data) => { addStudent(data); setShowForm(false); }} onCancel={() => setShowForm(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
