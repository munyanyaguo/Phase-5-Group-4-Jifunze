// src/pages/SchoolsPage.jsx
import React, { useEffect, useState } from "react";
import {
  fetchSchools,
  createSchool,
  updateSchool,
  deleteSchool,
} from "../../api";
import SchoolCard from "../../components/owner/SchoolCard";
import SchoolForm from "../../components/owner/SchoolForm";

export default function SchoolsPage() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingSchool, setEditingSchool] = useState(null); // null = create

  // Load all schools
  const loadSchools = async () => {
    setLoading(true);
    try {
      const res = await fetchSchools();
      setSchools(res.data?.schools || res.schools || []);
    } catch (err) {
      console.error("Error loading schools:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchools();
  }, []);

  // Create a new school
  const handleCreate = async (schoolData) => {
    try {
      await createSchool(schoolData);
      loadSchools();
      setEditingSchool(null); // close modal after create
    } catch (err) {
      alert(err.message);
    }
  };

  // Update existing school
  const handleUpdate = async (schoolData) => {
    try {
      await updateSchool(editingSchool.id, schoolData);
      loadSchools();
      setEditingSchool(null); // close modal after update
    } catch (err) {
      alert(err.message);
    }
  };

  // Delete school
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this school?")) return;
    try {
      await deleteSchool(id);
      loadSchools();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Schools</h1>
        <button
          onClick={() => setEditingSchool({})} // empty object = create
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Create School
        </button>
      </div>

      {/* Schools list */}
      {loading ? (
        <p className="text-gray-500 text-center">Loading schools...</p>
      ) : schools.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schools.map((school) => (
            <SchoolCard
              key={school.id}
              school={school}
              onDelete={handleDelete}
              onUpdate={() => setEditingSchool(school)} // open modal with school data
              onAssignSuccess={loadSchools}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center">No schools found.</p>
      )}

      {/* Modal */}
      {editingSchool !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
            {/* Close button */}
            <button
              onClick={() => setEditingSchool(null)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>

            <h2 className="text-xl font-semibold mb-4">
              {editingSchool.id ? "Edit School" : "Create New School"}
            </h2>

            <SchoolForm
              initialData={editingSchool}
              onCreate={editingSchool.id ? handleUpdate : handleCreate}
              onCancel={() => setEditingSchool(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
