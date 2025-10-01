// src/components/owner/Navbar.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import * as AuthService from "../../services/authServices";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    AuthService.logout();
    navigate("/login");
  };

  return (
    <header className="bg-white shadow px-6 py-3 flex justify-between items-center relative">
      <div>
        <h1 className="text-lg font-semibold">Owner Dashboard</h1>
        <p className="text-sm text-gray-500">Manage schools & users</p>
      </div>

      <button
        onClick={handleLogout}
        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
      >
        Logout
      </button>
    </header>
  );
}
