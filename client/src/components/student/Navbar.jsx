// src/components/student/Navbar.jsx
import React from "react";
import * as AuthService from "../../services/authServices";
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaUserCircle } from "react-icons/fa";

export default function Navbar() {
  const user = AuthService.getCurrentUser?.();
  const navigate = useNavigate();
  const logout = () => { AuthService.logout(); navigate("/login"); };

  return (
    <header className="bg-white shadow-md px-6 py-4 flex justify-between items-center border-b border-gray-200">
      <div className="flex items-center gap-3">
        <FaUserCircle className="text-3xl text-blue-600" />
        <div>
          <h3 className="font-bold text-gray-800">Welcome back!</h3>
          <p className="text-sm text-gray-600">{user?.name || "Student"}</p>
        </div>
      </div>
      <div>
        <button 
          onClick={logout} 
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all font-medium shadow-md hover:shadow-lg"
        >
          <FaSignOutAlt />
          Logout
        </button>
      </div>
    </header>
  );
}
