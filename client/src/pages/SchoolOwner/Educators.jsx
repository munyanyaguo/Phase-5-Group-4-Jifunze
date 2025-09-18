// src/pages/schoolOwner/Educators.jsx
import { useState } from "react";
import UserForm from "../../components/owner/UserForm";
import { UserPlus, Trash2 } from "lucide-react";

export default function Educators() {
  const [educators, setEducators] = useState([
    { id: 1, name: "Mr. Kamau", email: "kamau@example.com", className: "Class A" },
    { id: 2, name: "Ms. Wanjiku", email: "wanjiku@example.com", className: "Class B" },
  ]);

  const [showForm, setShowForm] = useState(false);

  // Add educator
  const addEducator = (educator) => {
    setEducators([...educators, { id: Date.now(), ...educator }]);
    setShowForm(false);
  };

  // Delete educator
  const deleteEducator = (id) => {
    setEducators(educators.filter((e) => e.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">Educators</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg shadow hover:bg-purple-700"
        >
          <UserPlus size={20} /> Add Educator
        </button>
      </div>

      {/* Educators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {educators.map((e) => (
          <div
            key={e.id}
            className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition relative"
          >
            <h3 className="text-xl font-semibold text-gray-700">{e.name}</h3>
            <p className="text-sm text-gray-500">{e.email}</p>
            <p className="text-sm text-gray-400 mt-1">Class: {e.className}</p>

            {/* Delete Button */}
            <button
              onClick={() => deleteEducator(e.id)}
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
            <h3 className="text-xl font-bold mb-4">Add New Educator</h3>
            <UserForm
              role="educator"
              onAdd={addEducator}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
