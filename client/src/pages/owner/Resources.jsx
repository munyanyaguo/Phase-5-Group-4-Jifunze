// src/pages/owner/Resources.jsx
import React, { useState } from "react";
import { Upload } from "lucide-react";

export default function Resources() {
  const [resources, setResources] = useState([
    { id: 1, title: "Math Notes", type: "PDF" },
    { id: 2, title: "Physics Lecture", type: "Video" },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Resources</h2>
        <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg">
          <Upload /> Upload Resource
        </button>
      </div>

      <div className="bg-white rounded-lg shadow divide-y">
        {resources.map((r) => (
          <div key={r.id} className="p-4 flex justify-between items-center">
            <div>
              <div className="font-semibold">{r.title}</div>
              <div className="text-sm text-gray-500">{r.type}</div>
            </div>
            <div className="text-sm text-gray-500">Owner</div>
          </div>
        ))}
      </div>
    </div>
  );
}
