// src/components/student/ExamCard.jsx
import React from "react";

export default function ExamCard({ exam, onStart }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition">
      <h4 className="font-semibold text-gray-800">{exam.title}</h4>
      <p className="text-sm text-gray-500">Class: {exam.className}</p>
      <p className="text-xs text-gray-400 mt-2">Duration: {exam.durationMinutes} mins</p>
      <div className="mt-3 flex justify-end">
        <button onClick={() => onStart(exam)} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm">
          Start
        </button>
      </div>
    </div>
  );
}
