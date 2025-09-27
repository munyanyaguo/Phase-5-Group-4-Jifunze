import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Mail, ArrowLeft, BarChart3, Calendar } from "lucide-react";

export default function StudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock student data (replace with API later)
  const students = [
    { id: 1, name: "Alice Johnson", email: "alice@student.com", status: "Active" },
    { id: 2, name: "Brian Smith", email: "brian@student.com", status: "Inactive" },
    { id: 3, name: "Cynthia Wang", email: "cynthia@student.com", status: "Active" },
    { id: 4, name: "David Kim", email: "david@student.com", status: "Active" },
  ];

  const exams = [
    { id: 1, subject: "Mathematics", score: 85, date: "2025-02-10" },
    { id: 2, subject: "Physics", score: 72, date: "2025-02-18" },
    { id: 3, subject: "Chemistry", score: 90, date: "2025-03-01" },
  ];

  const student = students.find((s) => s.id === parseInt(id));

  if (!student) {
    return <p className="p-6 text-red-500">Student not found.</p>;
  }

  return (
    <motion.div
      className="p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-blue-600 hover:underline mb-6"
      >
        <ArrowLeft className="w-5 h-5" /> Back to Students
      </button>

      {/* Student Info */}
      <motion.div
        className="p-6 rounded-2xl shadow-md bg-white mb-6"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-2xl font-bold flex items-center gap-2 mb-4">
          <User className="w-6 h-6 text-blue-600" />
          {student.name}
        </h1>
        <p className="text-gray-600 flex items-center gap-2">
          <Mail className="w-5 h-5" /> {student.email}
        </p>
        <p
          className={`mt-2 font-medium ${
            student.status === "Active" ? "text-green-600" : "text-red-600"
          }`}
        >
          {student.status}
        </p>
      </motion.div>

      {/* Attendance */}
      <motion.div
        className="p-6 rounded-2xl shadow-md bg-white mb-6"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7 }}
      >
        <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-green-600" />
          Attendance
        </h2>
        <p className="text-gray-700">Present: <span className="font-bold">40</span></p>
        <p className="text-gray-700">Absent: <span className="font-bold">5</span></p>
        <p className="text-gray-700">Total: <span className="font-bold">45</span></p>
      </motion.div>

      {/* Exam Results */}
      <motion.div
        className="p-6 rounded-2xl shadow-md bg-white"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-purple-600" />
          Exam Results
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-3">Subject</th>
                <th className="p-3">Score</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((exam) => (
                <tr key={exam.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{exam.subject}</td>
                  <td className="p-3 font-semibold">{exam.score}%</td>
                  <td className="p-3">{exam.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
