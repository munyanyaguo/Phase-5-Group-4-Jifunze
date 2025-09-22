// src/components/owner/Navbar.jsx
import { useState, useEffect } from "react";
import { Bell, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as AuthService from "../../services/authServices";


export default function Navbar() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    // Assuming AuthService has a method to get current logged-in user
    const currentUser = AuthService.getCurrentUser?.();
    if (currentUser) setUser(currentUser);
  }, []);

  const handleLogout = () => {
    AuthService.logout();
    navigate("/login");
  };

  return (
    <header className="bg-white shadow px-6 py-3 flex justify-between items-center relative">
      <h1 className="text-xl font-semibold">Owner Dashboard</h1>

      <div className="flex items-center gap-6">
        {/* Notifications */}
        <div className="relative">
          <Bell
            className={`cursor-pointer hover:text-blue-600 transition ${
              showNotifications ? "text-blue-600" : ""
            }`}
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfile(false); // close profile if open
            }}
          />
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-lg p-4 z-50">
              <h3 className="font-semibold mb-2">Notifications</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✅ New student registered</li>
                <li>📌 Educator uploaded a resource</li>
                <li>📢 System update available</li>
              </ul>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <User
            className={`cursor-pointer hover:text-blue-600 transition ${
              showProfile ? "text-blue-600" : ""
            }`}
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotifications(false); // close notifications if open
            }}
          />
          {showProfile && (
            <div className="absolute right-0 mt-2 w-56 bg-white shadow-lg rounded-lg p-4 z-50">
              {/* Show user info */}
              <div className="mb-3 border-b pb-2">
                <p className="font-semibold text-gray-800">
                  {user?.name || "Unknown User"}
                </p>
                <p className="text-sm text-gray-500">
                  {user?.email || "No email"}
                </p>
              </div>

              {/* Actions */}
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="cursor-pointer hover:text-blue-600">
                  View Profile
                </li>
                <li className="cursor-pointer hover:text-blue-600">
                  Settings
                </li>
                <li
                  onClick={handleLogout}
                  className="cursor-pointer hover:text-red-600"
                >
                  Logout
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
