// src/pages/educator/Classes.jsx
import React from "react";
import { motion } from "framer-motion";
import { BookOpen, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Classes() {
  const navigate = useNavigate();

  const classes = [
    { id: 1, name: "Mathematics Form 2", students: 45 },
    { id: 2, name: "Physics Form 3", students: 38 },
    { id: 3, name: "Chemistry Form 4", students: 42 },
  ];

  return (
    <motion.div
      className="p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <BookOpen className="w-6 h-6 text-blue-600" />
        My Classes
      </h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((cls) => (
          <motion.div
            key={cls.id}
            className="p-5 rounded-2xl shadow-lg bg-white hover:shadow-xl transition"
            whileHover={{ scale: 1.03 }}
          >
            <h2 className="text-lg font-semibold text-gray-800">{cls.name}</h2>
            <p className="text-gray-500 flex items-center gap-1 mt-2">
              <Users className="w-4 h-4 text-gray-400" />
              {cls.students} Students
            </p>

            <button
              onClick={() => navigate(`/educator/classes/${cls.id}`)}
              className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
            >
              View Class
            </button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
