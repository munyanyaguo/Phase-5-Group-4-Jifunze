import React, { useEffect, useState } from "react";
import { fetchSchools, createSchool, deleteSchool } from "../../api";
import SchoolCard from "../../components/owner/SchoolCard";
import CreateSchoolForm from "../../components/owner/SchoolForm";

export default function SchoolsPage() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);

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

  const handleCreate = async (schoolData) => {
    try {
      await createSchool(schoolData);
      loadSchools(); // Refresh list after creation
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this school?")) return;
    try {
      await deleteSchool(id);
      loadSchools(); // Refresh list after deletion
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAssignSuccess = () => {
    loadSchools(); // Refresh list after assigning user
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">My Schools</h1>

      <CreateSchoolForm onCreate={handleCreate} />

      {loading ? (
        <p className="text-gray-500">Loading schools...</p>
      ) : schools.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schools.map((school) => (
            <SchoolCard
              key={school.id}
              school={school}
              onDelete={handleDelete}
              onAssignSuccess={handleAssignSuccess} // Pass assign callback
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No schools found.</p>
      )}
    </div>
  );
}
