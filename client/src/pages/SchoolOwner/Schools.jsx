// src/pages/schoolOwner/Schools.jsx
import { useState } from "react";
import SchoolForm from "../../components/owner/SchoolForm";
import { PlusCircle } from "lucide-react";

export default function Schools() {
  const [schools, setSchools] = useState([
    { id: 1, name: "Sunrise Academy" },
    { id: 2, name: "Bright Future School" },
  ]);

  const [showForm, setShowForm] = useState(false);

  const addSchool = (school) => {
    setSchools([...schools, { id: Date.now(), ...school }]);
    setShowForm(false);
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
          </div>
        ))}
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Create New School</h3>
            <SchoolForm onAdd={addSchool} onCancel={() => setShowForm(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
