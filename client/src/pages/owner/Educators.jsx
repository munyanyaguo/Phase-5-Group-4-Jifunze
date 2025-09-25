// src/pages/owner/Educators.jsx
import React, { useState } from "react";
import UserForm from "../../components/owner/UserForm";
import { UserPlus, Trash2 } from "lucide-react";

export default function Educators() {
  const [educators, setEducators] = useState([
    { id: 1, name: "Mr. Kamau", email: "kamau@example.com", className: "Class A" },
    { id: 2, name: "Ms. Wanjiku", email: "wanjiku@example.com", className: "Class B" },
  ]);
  const [showForm, setShowForm] = useState(false);

  const add = (e) => setEducators((p) => [...p, { id: Date.now(), ...e }]);
  const remove = (id) => setEducators((p) => p.filter((x) => x.id !== id));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Educators</h2>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg">
          <UserPlus /> Add Educator
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {educators.map((e) => (
          <div key={e.id} className="bg-white p-6 rounded-xl shadow relative">
            <h3 className="text-lg font-semibold">{e.name}</h3>
            <p className="text-xs text-gray-500">{e.email}</p>
            <p className="text-sm text-gray-400 mt-2">Class: {e.className}</p>
            <button onClick={() => remove(e.id)} className="absolute top-3 right-3 text-red-500 hover:text-red-700">
              <Trash2 />
            </button>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Add Educator</h3>
            <UserForm role="educator" onAdd={(d) => { add(d); setShowForm(false); }} onCancel={() => setShowForm(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
