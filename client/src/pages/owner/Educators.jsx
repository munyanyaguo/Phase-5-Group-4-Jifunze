// src/pages/Educators.jsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Trash2, School } from "lucide-react";
import UserForm from "../../components/owner/UserForm";
import { fetchManagerEducators, fetchSchoolCourses } from "../../api";

export default function Educators() {
  const [educators, setEducators] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEducators = async () => {
      try {
        setLoading(true);
        const data = await fetchManagerEducators();
        const list = Array.isArray(data.educators) ? data.educators : [];

        // Fetch courses for each educator
        const educatorsWithCourses = await Promise.all(
          list.map(async (edu) => {
            let courses = [];
            if (edu.school?.id) {
              const allCourses = await fetchSchoolCourses(edu.school.id, {
                educator_id: edu.id,
              });
              courses = Array.isArray(allCourses)
                ? allCourses.map((c) => ({ id: c.id, name: c.title }))
                : [];
            }
            return { ...edu, courses };
          })
        );

        setEducators(educatorsWithCourses);
      } catch (err) {
        console.error("Failed to fetch educators", err);
      } finally {
        setLoading(false);
      }
    };
    loadEducators();
  }, []);

  const addEducator = (newEducator) => {
    const school = newEducator.school_id
      ? { id: newEducator.school_id, name: newEducator.school_name || "Assigned School" }
      : null;
    const courses = newEducator.courses?.map((c) => ({ id: c.id, name: c.name })) || [];

    setEducators((prev) => [...prev, { id: Date.now(), ...newEducator, school, courses }]);
  };

  const removeEducator = (id) => {
    setEducators((prev) => prev.filter((e) => e.id !== id));
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
          <UserPlus className="w-5 h-5" /> Add Educator
        </button>
      </div>

      {/* Educators list */}
      {loading ? (
        <p className="text-gray-500">Loading educators...</p>
      ) : (
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
                <span className="font-medium">School:</span>{" "}
                {e.school?.name || "None"}
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
      )}

      {/* Add Educator Modal */}
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
              <h3 className="text-xl font-semibold mb-4">Add Educator</h3>
              <UserForm
                role="educator"
                onSave={(d) => {
                  addEducator(d);
                  setShowForm(false);
                }}
                onCancel={() => setShowForm(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
