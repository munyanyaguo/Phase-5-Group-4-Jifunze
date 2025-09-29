import React, { useEffect, useState } from "react";
import { UserPlus, Trash2 } from "lucide-react";
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Educators</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg"
        >
          <UserPlus /> Add Educator
        </button>
      </div>

      {loading ? (
        <p>Loading educators...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {educators.map((e) => (
            <div key={e.id} className="bg-white p-6 rounded-xl shadow relative">
              <h3 className="text-lg font-semibold">{e.name}</h3>
              <p className="text-xs text-gray-500">{e.email}</p>
              <p className="text-sm text-gray-400 mt-2">
                School: {e.school?.name || "None"}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Courses:{" "}
                {e.courses?.length
                  ? e.courses.map((c) => c.name).join(", ")
                  : "None"}
              </p>
              <button
                onClick={() => removeEducator(e.id)}
                className="absolute top-3 right-3 text-red-500 hover:text-red-700"
              >
                <Trash2 />
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Add Educator</h3>
            <UserForm
              role="educator"
              onSave={(d) => {
                addEducator(d);
                setShowForm(false);
              }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
