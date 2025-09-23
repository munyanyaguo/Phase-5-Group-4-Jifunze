// src/pages/educator/Attendance.jsx
import React, { useState } from "react";

export default function Attendance() {
  const [students] = useState([
    { id: 1, name: "Alice Mwangi" },
    { id: 2, name: "Brian Otieno" },
    { id: 3, name: "Carol Wambui" },
  ]);
  const [present, setPresent] = useState({});

  const toggle = (id) => setPresent((p) => ({ ...p, [id]: !p[id] }));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Take Attendance</h2>

      <div className="bg-white rounded-xl shadow p-6">
        <div className="grid gap-4">
          {students.map((s) => (
            <div key={s.id} className="flex items-center justify-between">
              <div>{s.name}</div>
              <button onClick={() => toggle(s.id)} className={`px-3 py-1 rounded ${present[s.id] ? "bg-green-500 text-white" : "bg-gray-200"}`}>
                {present[s.id] ? "Present" : "Absent"}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-end">
          <button className="px-4 py-2 bg-blue-600 text-white rounded">Save Attendance</button>
        </div>
      </div>
    </div>
  );
}
