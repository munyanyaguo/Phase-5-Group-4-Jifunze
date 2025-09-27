// src/components/student/Navbar.jsx
import React from "react";
import * as AuthService from "../../services/authServices";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const user = AuthService.getCurrentUser?.();
  const navigate = useNavigate();
  const logout = () => { AuthService.logout(); navigate("/login"); };

  return (
    <header className="bg-white shadow px-6 py-3 flex justify-between items-center">
      <div>
        <h3 className="font-semibold">Student Dashboard</h3>
        <p className="text-sm text-gray-500">{user?.name || ""}</p>
      </div>
      <div>
        <button onClick={logout} className="px-3 py-1 rounded bg-red-500 text-white">Logout</button>
      </div>
    </header>
  );
}
