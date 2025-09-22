// src/pages/owner/Resources.jsx
import { useState } from "react";
import { Upload } from "lucide-react";

export default function Resources() {
  const [resources] = useState([
    { id: 1, title: "Math Notes", type: "PDF" },
    { id: 2, title: "Science Lecture", type: "Video" },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">📚 Resources</h2>
        <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700">
          <Upload size={20} /> Upload Resource
        </button>
      </div>

      <div className="bg-white rounded-lg shadow divide-y">
        {resources.map((r) => (
          <div key={r.id} className="p-4 flex justify-between items-center">
            <span>{r.title}</span>
            <span className="text-gray-500">{r.type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
