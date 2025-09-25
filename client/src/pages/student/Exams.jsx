// src/pages/student/Exams.jsx
import React from "react";
import { getExams } from "../../services/studentService";
import { getCurrentUser } from "../../services/authServices";
import { useNavigate } from "react-router-dom";

export default function StudentExams() {
  const navigate = useNavigate();
  const user = getCurrentUser?.();
  const cls = user?.className || "Class A";
  const all = getExams();
  const visible = all.filter(e => e.className === cls);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Exams</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {visible.map(e => (
          <div key={e.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
            <div>
              <h4 className="font-semibold">{e.title}</h4>
              <p className="text-sm text-gray-500">Duration: {e.durationMinutes} mins</p>
            </div>
            <div>
              <button onClick={() => navigate(`/student/exams/${e.id}/attempt`)} className="px-3 py-1 bg-blue-600 text-white rounded">Start</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
