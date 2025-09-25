// src/components/educator/Navbar.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import * as AuthService from "../../services/authServices";

export default function Navbar() {
  const navigate = useNavigate();
  const user = AuthService.getCurrentUser?.();

  const logout = () => {
    AuthService.logout();
    navigate("/login");
  };

  return (
    <header className="bg-white shadow px-6 py-3 flex justify-between items-center">
      <div>
        <h3 className="font-semibold">Educator Dashboard</h3>
        <p className="text-sm text-gray-500">Welcome {user?.name || ""}</p>
      </div>
      <div className="flex items-center gap-4">
        <button onClick={logout} className="px-3 py-1 bg-red-500 text-white rounded">Logout</button>
      </div>
    </header>
  );
}
