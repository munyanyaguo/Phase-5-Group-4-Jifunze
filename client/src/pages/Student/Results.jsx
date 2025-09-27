// src/pages/student/Results.jsx
import React, { useEffect, useState } from "react";
import { getAttemptsForCurrentUser } from "../../services/studentService";
import { useNavigate } from "react-router-dom";

export default function StudentResults() {
  const [attempts, setAttempts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setAttempts(getAttemptsForCurrentUser());
  }, []);

  if (!attempts.length) return <div className="p-6 bg-white rounded shadow">You have not taken any exams yet.</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">My Results</h2>
      <div className="grid gap-4">
        {attempts.map(a => (
          <div key={a.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
            <div>
              <div className="font-semibold">{a.examTitle}</div>
              <div className="text-sm text-gray-500">Taken: {new Date(a.submittedAt).toLocaleString()}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Score</div>
              <div className="font-bold">{a.score} / {a.total}</div>
              <div className="mt-2">
                <button onClick={() => navigate(`/student/results/${a.id}`)} className="px-3 py-1 bg-blue-600 text-white rounded">View</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
