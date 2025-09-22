// src/pages/schoolOwner/Schools.jsx
import { useState } from "react";
import SchoolForm from "../../components/owner/SchoolForm";
import { PlusCircle, Users, BookOpen, Edit, Trash2 } from "lucide-react";

export default function Schools() {
  const [schools, setSchools] = useState([
    { id: 1, name: "Sunrise Academy", students: 120, educators: 15 },
    { id: 2, name: "Bright Future School", students: 200, educators: 25 },
    { id: 3, name: "Greenfield High", students: 150, educators: 20 },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingSchool, setEditingSchool] = useState(null);

  // CREATE
  const addSchool = (school) => {
    setSchools([
      ...schools,
      { id: Date.now(), students: 0, educators: 0, ...school },
    ]);
    setShowForm(false);
  };

  // UPDATE
  const updateSchool = (updatedSchool) => {
    setSchools(
      schools.map((s) => (s.id === updatedSchool.id ? updatedSchool : s))
    );
    setEditingSchool(null);
  };

  // DELETE
  const deleteSchool = (id) => {
    if (confirm("Are you sure you want to delete this school?")) {
      setSchools(schools.filter((s) => s.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">Schools</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700"
        >
          <PlusCircle size={20} /> Add School
        </button>
      </div>

      {/* Schools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {schools.map((s) => (
          <div
            key={s.id}
            className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition"
          >
            <h3 className="text-xl font-semibold text-gray-700">{s.name}</h3>
            <p className="text-sm text-gray-500 mt-2">
              Independent online school space
            </p>

            {/* Stats */}
            <div className="mt-4 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Users size={18} className="text-blue-500" />
                <span>{s.students} Students</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <BookOpen size={18} className="text-green-500" />
                <span>{s.educators} Educators</span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setEditingSchool(s)}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
              >
                <Edit size={16} /> Edit
              </button>
              <button
                onClick={() => deleteSchool(s.id)}
                className="flex items-center gap-1 text-red-600 hover:text-red-800"
              >
                <Trash2 size={16} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal Form */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Create New School</h3>
            <SchoolForm onAdd={addSchool} onCancel={() => setShowForm(false)} />
          </div>
        </div>
      )}

      {/* Edit Modal Form */}
      {editingSchool && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Edit School</h3>
            <SchoolForm
              initialData={editingSchool}
              onAdd={updateSchool}
              onCancel={() => setEditingSchool(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
