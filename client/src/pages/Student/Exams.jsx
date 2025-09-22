// src/pages/student/Exams.jsx
import React from "react";
import { getExams } from "../../services/studentService";
import { getCurrentUser } from "../../services/authServices";
import ExamCard from "../../components/student/ExamCard";
import { useNavigate } from "react-router-dom";

export default function StudentExams() {
  const exams = getExams();
  const user = getCurrentUser?.();
  const userClass = user?.className || "Class A";
  const navigate = useNavigate();

  // only show exams for the student's class
  const visible = exams.filter((e) => e.className === userClass);

  const start = (exam) => {
    navigate(`/student/exams/${exam.id}/attempt`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Exams & Quizzes</h2>
        <p className="text-gray-500">Available exams for <strong>{userClass}</strong>.</p>
      </div>

      {visible.length === 0 ? (
        <div className="bg-white p-6 rounded shadow text-gray-600">No exams scheduled for your class.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {visible.map((exam) => (
            <ExamCard key={exam.id} exam={exam} onStart={start} />
          ))}
        </div>
      )}
    </div>
  );
}
