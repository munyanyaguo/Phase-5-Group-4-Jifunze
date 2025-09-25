// src/pages/student/Dashboard.jsx
import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, Calendar, FolderOpen } from "lucide-react";

export default function StudentDashboard() {
  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-800">Welcome, Student!</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Upcoming Lessons */}
        <div className="bg-gradient-to-r from-blue-400 to-blue-600 text-white p-6 rounded-2xl shadow-lg transform hover:scale-105 transition duration-300">
          <div className="flex items-center space-x-4">
            <Calendar size={36} className="text-white" />
            <h3 className="text-xl font-semibold">Upcoming Lessons</h3>
          </div>
          <p className="mt-4 text-sm opacity-90">
            Math - Tomorrow <span className="font-medium">10:00 AM</span>
          </p>
        </div>

        {/* Exams */}
        <div className="bg-gradient-to-r from-purple-400 to-purple-600 text-white p-6 rounded-2xl shadow-lg transform hover:scale-105 transition duration-300">
          <div className="flex items-center space-x-4">
            <BookOpen size={36} className="text-white" />
            <h3 className="text-xl font-semibold">Exams</h3>
          </div>
          <p className="mt-4 text-sm opacity-90">
            <Link to="/student/exams" className="underline hover:opacity-80">
              Go to exams
            </Link>
          </p>
        </div>

        {/* Resources */}
        <div className="bg-gradient-to-r from-green-400 to-green-600 text-white p-6 rounded-2xl shadow-lg transform hover:scale-105 transition duration-300">
          <div className="flex items-center space-x-4">
            <FolderOpen size={36} className="text-white" />
            <h3 className="text-xl font-semibold">Resources</h3>
          </div>
          <p className="mt-4 text-sm opacity-90">
            <Link to="/student/resources" className="underline hover:opacity-80">
              Open resources
            </Link>
          </p>
        </div>
      </div>

      {/* Optional Quick Links */}
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          to="/student/profile"
          className="bg-white p-4 rounded-xl shadow hover:shadow-xl transition duration-300 flex flex-col items-center justify-center"
        >
          <div className="text-blue-500 mb-2">
            <Calendar size={28} />
          </div>
          <span className="font-medium">Profile</span>
        </Link>

        <Link
          to="/student/grades"
          className="bg-white p-4 rounded-xl shadow hover:shadow-xl transition duration-300 flex flex-col items-center justify-center"
        >
          <div className="text-purple-500 mb-2">
            <BookOpen size={28} />
          </div>
          <span className="font-medium">Grades</span>
        </Link>

        <Link
          to="/student/assignments"
          className="bg-white p-4 rounded-xl shadow hover:shadow-xl transition duration-300 flex flex-col items-center justify-center"
        >
          <div className="text-green-500 mb-2">
            <FolderOpen size={28} />
          </div>
          <span className="font-medium">Assignments</span>
        </Link>

        <Link
          to="/student/messages"
          className="bg-white p-4 rounded-xl shadow hover:shadow-xl transition duration-300 flex flex-col items-center justify-center"
        >
          <div className="text-yellow-500 mb-2">
            <Calendar size={28} />
          </div>
          <span className="font-medium">Messages</span>
        </Link>
      </div>
    </div>
  );
}
