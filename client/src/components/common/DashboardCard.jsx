// src/components/common/DashboardCard.jsx
import React from "react";
import { motion } from "framer-motion";

export default function DashboardCard({ title, value, icon }) {
  return (
    <motion.div
      initial={{ y: 8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="bg-white p-5 rounded-xl shadow flex items-center gap-4"
    >
      <div className="p-3 bg-gray-100 rounded-lg">{icon}</div>
      <div>
        <div className="text-sm text-gray-500">{title}</div>
        <div className="text-2xl font-bold text-gray-800">{value}</div>
      </div>
    </motion.div>
  );
}
