// src/pages/student/Results.jsx
import React, { useState, useEffect } from "react";
import { getAttemptsForCurrentUser, getAttemptById } from "../../services/studentService";
import { useNavigate } from "react-router-dom";

export default function StudentResults() {
  const [attempts, setAttempts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setAttempts(getAttemptsForCurrentUser());
  }, []);

  if (!attempts.length) {
    return <div className="p-6 bg-white rounded shadow">You have not taken any exams yet.</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">My Results</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {attempts.map((a) => (
          <div key={a.id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
            <div>
              <h4 className="font-semibold">{a.examTitle}</h4>
              <p className="text-sm text-gray-500">Taken: {new Date(a.submittedAt).toLocaleString()}</p>
              <p className="text-sm text-gray-600 mt-1">Score: {a.score} / {a.total}</p>
            </div>
            <div>
              <button onClick={() => navigate(`/student/results/${a.id}`)} className="px-3 py-1 bg-blue-600 text-white rounded">View</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
