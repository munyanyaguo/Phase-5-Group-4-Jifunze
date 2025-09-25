// src/components/owner/Navbar.jsx
import React, { useState, useEffect, useRef } from "react";
import { Bell, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as AuthService from "../../services/authServices";

export default function Navbar() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const ref = useRef();

  useEffect(() => {
    setUser(AuthService.getCurrentUser?.());
  }, []);

  // close menus on click outside
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setShowNotifications(false);
        setShowProfile(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

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

      <div className="flex items-center gap-4" ref={ref}>
        <div className="relative">
          <Bell
            className={`cursor-pointer hover:text-blue-600 transition ${showNotifications ? "text-blue-600" : ""}`}
            onClick={() => {
              setShowNotifications((s) => !s);
              setShowProfile(false);
            }}
          />
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-lg p-4 z-50">
              <h3 className="font-semibold mb-2">Notifications</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>✅ New student registered</li>
                <li>📌 Resource uploaded</li>
              </ul>
            </div>
          )}
        </div>

        <div className="relative">
          <User
            className={`cursor-pointer hover:text-blue-600 transition ${showProfile ? "text-blue-600" : ""}`}
            onClick={() => {
              setShowProfile((s) => !s);
              setShowNotifications(false);
            }}
          />
          {showProfile && (
            <div className="absolute right-0 mt-2 w-56 bg-white shadow-lg rounded-lg p-4 z-50">
              <div className="mb-3 border-b pb-2">
                <p className="font-semibold text-gray-800">{user?.name || "Owner"}</p>
                <p className="text-sm text-gray-500">{user?.email || ""}</p>
              </div>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="cursor-pointer hover:text-blue-600">View Profile</li>
                <li className="cursor-pointer hover:text-blue-600">Settings</li>
                <li onClick={handleLogout} className="cursor-pointer text-red-600 hover:text-red-700">Logout</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
