import React, { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Students() {
  const navigate = useNavigate();

  // Mock students (replace with API later)
  const [students] = useState([
    { id: 1, name: "Alice Johnson", email: "alice@student.com", status: "Active" },
    { id: 2, name: "Brian Smith", email: "brian@student.com", status: "Inactive" },
    { id: 3, name: "Cynthia Wang", email: "cynthia@student.com", status: "Active" },
    { id: 4, name: "David Kim", email: "david@student.com", status: "Active" },
  ]);

  const [search, setSearch] = useState("");

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div
      className="p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Page Header */}
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <User className="w-6 h-6 text-green-600" />
        My Students
      </h1>

      {/* Search Bar */}
      <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2 mb-6 w-full md:w-1/2">
        <Search className="w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="Search students..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ml-2 bg-transparent outline-none w-full"
        />
      </div>

      {/* Students Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student) => (
          <motion.div
            key={student.id}
            className="p-5 rounded-2xl shadow-lg bg-white hover:shadow-xl transition"
            whileHover={{ scale: 1.03 }}
          >
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              {student.name}
            </h2>
            <p className="text-gray-500 flex items-center gap-1 mt-2">
              <Mail className="w-4 h-4 text-gray-400" />
              {student.email}
            </p>
            <p
              className={`mt-2 text-sm font-medium ${
                student.status === "Active" ? "text-green-600" : "text-red-600"
              }`}
            >
              {student.status}
            </p>

            <button
              onClick={() => navigate(`/educator/students/${student.id}`)}
              className="mt-4 px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition"
            >
              View Profile
            </button>
          </motion.div>
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <p className="text-gray-500 text-center mt-10">No students found.</p>
      )}
    </motion.div>
  );
}
