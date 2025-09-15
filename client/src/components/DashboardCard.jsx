// src/components/common/DashboardCard.jsx
import React from "react";

const DashboardCard = ({ title, value, Icon, color }) => {
  return (
    <div className={`rounded-2xl shadow-md p-6 flex items-center gap-4 ${color}`}>
      <div className="p-4 bg-white/20 rounded-full">
        <div className="w-8 h-8 text-white" >{Icon}</div>
      </div>
      <div>
        <h3 className="text-sm text-gray-200">{title}</h3>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
};

export default DashboardCard;
