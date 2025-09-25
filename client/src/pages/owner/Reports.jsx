// src/pages/owner/Reports.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, FileText } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export default function Reports() {
  // Attendance Data
  const attendanceData = [
    { school: "DeKUT", attendance: 92 },
    { school: "Kisumu High", attendance: 85 },
    { school: "Nairobi School", attendance: 78 },
  ];

  // Performance Data (hierarchical: school → class → subjects)
  const performanceData = [
    {
      school: "DeKUT",
      classes: [
        {
          class: "Form 1",
          subjects: [
            { subject: "Math", avg: 75 },
            { subject: "Physics", avg: 68 },
          ],
        },
        {
          class: "Form 2",
          subjects: [
            { subject: "Math", avg: 80 },
            { subject: "Chemistry", avg: 70 },
          ],
        },
      ],
    },
    {
      school: "Kisumu High",
      classes: [
        {
          class: "Form 1",
          subjects: [
            { subject: "Math", avg: 72 },
            { subject: "Physics", avg: 65 },
          ],
        },
      ],
    },
    {
      school: "Nairobi School",
      classes: [
        {
          class: "Form 1",
          subjects: [
            { subject: "Math", avg: 68 },
            { subject: "Chemistry", avg: 74 },
          ],
        },
      ],
    },
  ];

  // State for drilldown
  const [selectedSchool, setSelectedSchool] = useState(performanceData[0]);
  const [selectedClass, setSelectedClass] = useState(
    performanceData[0].classes[0]
  );

  return (
    <motion.div
      className="p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <FileText className="w-6 h-6 text-blue-600" />
        Reports & Analytics
      </h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Attendance Summary */}
        <motion.div
          className="bg-white shadow rounded-2xl p-5"
          whileHover={{ scale: 1.02 }}
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-green-600" />
            Attendance Summary
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={attendanceData}>
              <XAxis dataKey="school" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="attendance" fill="#2563eb" radius={8} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Student Performance Drilldown */}
        <motion.div
          className="bg-white shadow rounded-2xl p-5"
          whileHover={{ scale: 1.02 }}
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            Student Performance Overview
          </h2>

          {/* School Selector */}
          <select
            className="border p-2 rounded mb-4"
            onChange={(e) => {
              const school = performanceData.find(
                (s) => s.school === e.target.value
              );
              setSelectedSchool(school);
              setSelectedClass(school.classes[0]); // reset to first class
            }}
            value={selectedSchool.school}
          >
            {performanceData.map((s) => (
              <option key={s.school} value={s.school}>
                {s.school}
              </option>
            ))}
          </select>

          {/* Class Selector */}
          <select
            className="border p-2 rounded mb-4 ml-4"
            onChange={(e) => {
              const cls = selectedSchool.classes.find(
                (c) => c.class === e.target.value
              );
              setSelectedClass(cls);
            }}
            value={selectedClass.class}
          >
            {selectedSchool.classes.map((c) => (
              <option key={c.class} value={c.class}>
                {c.class}
              </option>
            ))}
          </select>

          {/* Subject Performance Chart */}
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={selectedClass.subjects}>
              <XAxis dataKey="subject" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="avg" fill="#9333ea" radius={8} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </motion.div>
  );
}

