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
    } catch (err) {
      alert(err.message);
    }
  };

  // Update existing school
  const handleUpdate = async (id, updatedData) => {
    try {
      await updateSchool(id, updatedData);
      loadSchools();
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
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">My Schools</h1>

      {/* Form to create new school */}
      <SchoolForm onCreate={handleCreate} />

      {/* Schools list */}
      {loading ? (
        <p className="text-gray-500">Loading schools...</p>
      ) : schools.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schools.map((school) => (
            <SchoolCard
              key={school.id}
              school={school}
              onDelete={handleDelete}
              onUpdate={handleUpdate} // for inline edit
              onAssignSuccess={loadSchools} // refresh after assigning user
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No schools found.</p>
      )}
    </div>
  );
}
