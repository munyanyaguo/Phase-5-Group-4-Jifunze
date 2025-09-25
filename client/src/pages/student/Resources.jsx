// src/pages/student/Resources.jsx
import React from "react";
import { getResources } from "../../services/studentService";
import { getCurrentUser } from "../../services/authServices";

function Card({ r }) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h4 className="font-semibold">{r.title}</h4>
      <p className="text-xs text-gray-500">Class: {r.className}</p>
      <div className="mt-2">
        <a href={r.url} className="text-sm bg-blue-600 text-white px-3 py-1 rounded">View</a>
      </div>
    </div>
  );
}

export default function StudentResources() {
  const user = getCurrentUser?.();
  const cls = user?.className || "Class A";
  const all = getResources();
  const visible = all.filter(r => r.className === cls);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Resources</h2>
        <p className="text-gray-500">Resources for {cls}</p>
      </div>
      {visible.length === 0 ? <div className="bg-white p-6 rounded shadow">No resources yet</div> :
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visible.map(r => <Card key={r.id} r={r} />)}
        </div>
      }
    </div>
  );
}
