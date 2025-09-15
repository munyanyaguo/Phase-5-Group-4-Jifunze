// src/pages/schoolOwner/Dashboard.jsx
import React, { useState } from "react";
import { Users, BookOpen, School, BarChart3, LogOut } from "lucide-react";
import DashboardCard from "../../components/DashboardCard";
import { logout } from "../../services/authServices";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats] = useState([
    {
      title: "Total Schools",
      value: "12",
      icon: School,
      color: "bg-gradient-to-r from-indigo-500 to-purple-500",
    },
    {
      title: "Educators",
      value: "48",
      icon: Users,
      color: "bg-gradient-to-r from-green-400 to-emerald-600",
    },
    {
      title: "Students",
      value: "1,230",
      icon: BookOpen,
      color: "bg-gradient-to-r from-pink-400 to-rose-600",
    },
    {
      title: "Attendance Rate",
      value: "92%",
      icon: BarChart3,
      color: "bg-gradient-to-r from-orange-400 to-yellow-600",
    },
  ]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="p-6">
      {/* Header with Logout */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">📊 School Owner Dashboard</h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((item, index) => (
          <DashboardCard
            key={index}
            title={item.title}
            value={item.value}
            icon={item.icon}
            color={item.color}
          />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
