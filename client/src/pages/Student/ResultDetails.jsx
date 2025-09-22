// src/pages/student/ResultDetail.jsx
import React from "react";
import { useParams, Link } from "react-router-dom";
import { getAttemptById } from "../../services/studentService";

export default function ResultDetail() {
  const { id } = useParams();
  const attempt = getAttemptById(id);
  if (!attempt) return <div className="p-6">Result not found.</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">{attempt.examTitle} — Result</h2>
      <p className="text-gray-600">Score: {attempt.score} / {attempt.total}</p>

      <div className="bg-white p-4 rounded shadow">
        {attempt.answers && Object.keys(attempt.answers).map((qId, idx) => (
          <div key={qId} className="mb-3">
            <p className="font-medium">Question {idx + 1}: Answered {attempt.answers[qId]}</p>
          </div>
        ))}
      </div>

      <Link to="/student/results" className="text-blue-600">Back to results</Link>
    </div>
  );
}
