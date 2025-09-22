// src/pages/student/Resources.jsx
import React from "react";
import ResourceCard from "../../components/student/ResourceCard";
import { getResources } from "../../services/studentService";
import { getCurrentUser } from "../../services/authServices";

export default function StudentResources() {
  const user = getCurrentUser?.();
  const userClass = user?.className || "Class A"; // fallback if not set
  const all = getResources();

  // filter to resources for this student's class only
  const visible = all.filter((r) => r.className === userClass);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Resources</h2>
          <p className="text-gray-500">Resources available to <strong>{userClass}</strong></p>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="bg-white p-6 rounded shadow text-gray-600">No resources available for your class yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visible.map((r) => (
            <ResourceCard key={r.id} resource={r} />
          ))}
        </div>
      )}
    </div>
  );
}
