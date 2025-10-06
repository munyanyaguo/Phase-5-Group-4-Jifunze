// src/pages/Educators.jsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Trash2, School } from "lucide-react";
import UserForm from "../../components/owner/UserForm";
import {
  fetchManagerEducators,
  fetchSchoolCourses,
  fetchSchools,
  apiAssignUser,
} from "../../api";

export default function Educators() {
  const [educators, setEducators] = useState([]);
  const [schools, setSchools] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load educators
  const loadEducators = async () => {
    try {
      setLoading(true);
      const data = await fetchManagerEducators();
      const list = Array.isArray(data) ? data : data.educators || [];

      // Fetch courses per educator
      const educatorsWithCourses = await Promise.all(
        list.map(async (edu) => {
          let courses = [];
          if (edu.school?.id) {
            const allCourses = await fetchSchoolCourses(edu.school.id, {
              educator_id: edu.id,
            });
            courses = Array.isArray(allCourses)
              ? allCourses
              : allCourses.courses || [];
            courses = courses.map((c) => ({ id: c.id, name: c.title }));
          }
          return { ...edu, courses };
        })
      );

      setEducators(educatorsWithCourses);
    } catch (err) {
      console.error("Failed to load educators:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load schools
  const loadSchools = async () => {
    try {
      const res = await fetchSchools();
      const list = Array.isArray(res) ? res : res.schools || [];
      setSchools(list);
    } catch (err) {
      console.error("Failed to load schools:", err);
    }
  };

  useEffect(() => {
    loadEducators();
    loadSchools();
  }, []);

  // Remove educator (frontend only)
  const removeEducator = (id) => {
    setEducators((prev) => prev.filter((e) => e.id !== id));
  };

  // Save educator handler
  const handleSave = async (formData) => {
    try {
      setError("");
      await apiAssignUser(formData.school_id, "educator", formData.email);
      alert("✅ Educator assigned successfully!");
      setShowForm(false);
      loadEducators();
    } catch (err) {
      console.error("Failed to assign educator:", err);
      setError(err.message || "Failed to assign educator.");
    }
  };

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Educators</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg shadow-md transition-all"
        >
          <UserPlus className="w-5 h-5" /> Assign Educator
        </button>
      </div>

      {/* Educators List */}
      {loading ? (
        <p className="text-gray-500">Loading educators...</p>
      ) : educators.length > 0 ? (
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {educators.map((e) => (
            <motion.div
              key={e.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition relative"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <School className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{e.name}</h3>
                  <p className="text-xs text-gray-500">{e.email}</p>
                </div>
              </div>

              <p className="text-sm text-gray-600">
                <span className="font-medium">School:</span> {e.school?.name || "None"}
              </p>

              <div className="mt-2">
                <span className="font-medium text-sm text-gray-600">Courses:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {e.courses?.length ? (
                    e.courses.map((c) => (
                      <span
                        key={c.id}
                        className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full"
                      >
                        {c.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-400">No courses</span>
                  )}
                </div>
              </div>

              <button
                onClick={() => removeEducator(e.id)}
                className="absolute top-3 right-3 text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <p className="text-gray-500">No educators found.</p>
      )}

      {/* Assign Educator Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            key="modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold mb-4">Assign Educator</h3>
              <UserForm
                onSave={handleSave}
                onCancel={() => setShowForm(false)}
                initialData={{ role: "educator" }}
              />
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
