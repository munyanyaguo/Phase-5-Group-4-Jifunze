// src/pages/educator/Resources.jsx
import React, { useState } from "react";

export default function EducatorResources() {
  const [resources, setResources] = useState([
    { id: 1, title: "Algebra Notes", type: "pdf" },
    { id: 2, title: "Chemistry Video", type: "video" },
  ]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">My Resources</h2>
      <div className="bg-white p-4 rounded shadow divide-y">
        {resources.map((r) => (
          <div key={r.id} className="p-3 flex justify-between items-center">
            <div>
              <div className="font-semibold">{r.title}</div>
              <div className="text-xs text-gray-500">{r.type.toUpperCase()}</div>
            </div>
            <div className="flex gap-2">
              <button className="text-sm text-blue-600">Edit</button>
              <button className="text-sm text-red-600">Delete</button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <button className="px-4 py-2 bg-indigo-600 text-white rounded">Upload New Resource</button>
      </div>
    </div>
  );
}
