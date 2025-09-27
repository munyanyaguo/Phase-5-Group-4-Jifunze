// src/pages/educator/ClassDetails.jsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Users, FileText, ClipboardList } from "lucide-react";

export default function ClassDetails() {
  const { id } = useParams(); // class id from URL
  const navigate = useNavigate();

  // Mock data (later connect to backend)
  const classData = {
    id,
    name: "Mathematics Form 2",
    students: 45,
    lessons: ["Algebra", "Trigonometry", "Geometry"],
    resources: ["Algebra Notes.pdf", "Trigonometry Past Paper.docx"],
    attendance: [
      { date: "2025-09-20", present: 42, absent: 3 },
      { date: "2025-09-21", present: 44, absent: 1 },
    ],
  };

  return (
    <motion.div
      className="p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>

      {/* Header */}
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <BookOpen className="w-6 h-6 text-blue-600" />
        {classData.name}
      </h1>

      {/* Info cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <div className="p-5 rounded-2xl shadow bg-white">
          <h2 className="font-semibold flex items-center gap-2">
            <Users className="w-5 h-5 text-green-600" /> Students
          </h2>
          <p className="text-gray-700 mt-2">{classData.students} Enrolled</p>
        </div>

        <div className="p-5 rounded-2xl shadow bg-white">
          <h2 className="font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" /> Lessons
          </h2>
          <ul className="list-disc list-inside text-gray-700 mt-2">
            {classData.lessons.map((lesson, idx) => (
              <li key={idx}>{lesson}</li>
            ))}
          </ul>
        </div>

        <div className="p-5 rounded-2xl shadow bg-white">
          <h2 className="font-semibold flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-red-600" /> Attendance
          </h2>
          <ul className="mt-2 text-gray-700">
            {classData.attendance.map((att, idx) => (
              <li key={idx}>
                {att.date}: {att.present}/{classData.students} present
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Resources */}
      <div className="p-5 rounded-2xl shadow bg-white">
        <h2 className="font-semibold mb-2 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" /> Resources
        </h2>
        <ul className="list-disc list-inside text-gray-700">
          {classData.resources.map((res, idx) => (
            <li key={idx}>{res}</li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
