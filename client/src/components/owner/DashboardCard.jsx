import React from "react";

export default function DashboardCard({ icon, title, value }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow flex items-center space-x-4">
      <div className="text-indigo-600">{icon}</div>
      <div>
        <h4 className="text-sm font-medium text-gray-600">{title}</h4>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );
}
