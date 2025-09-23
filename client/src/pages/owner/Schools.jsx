// src/pages/owner/Schools.jsx
import React, { useState } from "react";
import SchoolForm from "../../components/owner/SchoolForm";
import { PlusCircle, Users, BookOpen, Edit, Trash2 } from "lucide-react";

export default function Schools() {
  const [schools, setSchools] = useState([
    { id: 1, name: "Sunrise Academy", students: 120, educators: 15 },
    { id: 2, name: "Bright Future School", students: 200, educators: 25 },
    { id: 3, name: "Greenfield High", students: 150, educators: 20 },
  ]);

  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState(null);

  const create = (s) => {
    setSchools((prev) => [...prev, { id: Date.now(), students: 0, educators: 0, ...s }]);
    setShowCreate(false);
  };

  const update = (updated) => {
    setSchools((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setEditing(null);
  };

  const remove = (id) => {
    if (!confirm("Delete this school?")) return;
    setSchools((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Schools</h2>
        <div className="flex gap-3">
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg">
            <PlusCircle /> Add School
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {schools.map((s) => (
          <div key={s.id} className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-xl font-semibold">{s.name}</h3>
            <p className="text-sm text-gray-500 mt-2">An independent online school space</p>

            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-blue-500" />
                <span>{s.students} Students</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen size={18} className="text-green-500" />
                <span>{s.educators} Educators</span>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-4">
              <button onClick={() => setEditing(s)} className="flex items-center gap-2 text-blue-600">
                <Edit /> Edit
              </button>
              <button onClick={() => remove(s.id)} className="flex items-center gap-2 text-red-600">
                <Trash2 /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Create School</h3>
            <SchoolForm onSave={create} onCancel={() => setShowCreate(false)} />
          </div>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Edit School</h3>
            <SchoolForm editingSchool={editing} onSave={update} onCancel={() => setEditing(null)} />
          </div>
        </div>
      )}
    </div>
  );
}
