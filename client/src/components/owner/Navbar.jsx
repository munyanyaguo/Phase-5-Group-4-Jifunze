// src/components/owner/Navbar.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as AuthService from "../../services/authServices";
import { fetchNotifications, markNotificationAsRead } from "../../api";
import { Bell, User, Settings, Lock, LogOut, ChevronDown } from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // Load user data
  useEffect(() => {
    const loadUser = async () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        } catch (e) {
          console.error('Failed to parse stored user:', e);
        }
      }
      
      try {
        const freshUser = await AuthService.getCurrentUser();
        if (freshUser) {
          const userData = freshUser.data?.profile || freshUser.data?.user || freshUser.profile || freshUser.user || freshUser;
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        }
      } catch (err) {
        console.error('Failed to fetch fresh user data:', err);
      }
    };
    loadUser();
  }, []);

  const logout = () => {
    AuthService.logout();
    navigate("/login");
  };

  // Click outside to close menus
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Fetch notifications from backend
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const data = await fetchNotifications();
        const notifs = data.notifications || [];
        setNotifications(notifs.map(n => ({
          id: n.id,
          text: n.title,
          message: n.message,
          at: n.created_at,
          is_read: n.is_read
        })));
      } catch (err) {
        console.error('Failed to load notifications:', err);
      }
    };
    loadNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleNotificationClick = async (notif) => {
    if (!notif.is_read) {
      try {
        await markNotificationAsRead(notif.id);
        // Update local state
        setNotifications(prev => 
          prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n)
        );
      } catch (err) {
        console.error('Failed to mark notification as read:', err);
      }
    }
  };

  return (
    <header className="bg-white shadow px-6 py-3 flex justify-between items-center">
      <div>
        <h3 className="font-semibold">Owner Dashboard</h3>
        <p className="text-sm text-gray-500">Welcome {user?.name || ""}</p>
      </div>
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <Bell
            className={`cursor-pointer hover:text-blue-600 transition ${showNotifications ? "text-blue-600" : ""}`}
            onClick={() => setShowNotifications((s) => !s)}
          />
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1 min-w-[18px] h-[18px] flex items-center justify-center">
              {notifications.length}
            </span>
          )}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white shadow-xl rounded-xl p-4 z-50 border border-gray-100">
              <h3 className="font-semibold mb-3 text-gray-800">Notifications</h3>
              {notifications.length === 0 ? (
                <div className="text-sm text-gray-500 py-4 text-center">No notifications</div>
              ) : (
                <ul className="text-sm text-gray-700 space-y-3 max-h-80 overflow-auto">
                  {notifications.map((n) => (
                    <li 
                      key={n.id} 
                      className={`p-3 hover:bg-gray-50 rounded-lg transition cursor-pointer ${!n.is_read ? 'bg-blue-50' : ''}`}
                      onClick={() => handleNotificationClick(n)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="font-medium text-gray-800">{n.text}</div>
                        {!n.is_read && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full mt-1 ml-2"></span>
                        )}
                      </div>
                      {n.message && (
                        <div className="text-xs text-gray-600 mt-1">{n.message}</div>
                      )}
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(n.at).toLocaleString()}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu((s) => !s)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
              {(user?.name || 'O').charAt(0).toUpperCase()}
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white shadow-xl rounded-xl overflow-hidden z-50 border border-gray-100">
              {/* Profile Header */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-lg backdrop-blur-sm">
                    {(user?.name || 'O').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold">{user?.name || 'Owner'}</div>
                    <div className="text-xs text-blue-100">{user?.email || ''}</div>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate('/owner/profile');
                  }}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
                >
                  <User className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="font-medium text-gray-800">View Profile</div>
                    <div className="text-xs text-gray-500">See your profile details</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate('/owner/settings');
                  }}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
                >
                  <Settings className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="font-medium text-gray-800">Edit Profile</div>
                    <div className="text-xs text-gray-500">Update your information</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate('/owner/change-password');
                  }}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
                >
                  <Lock className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="font-medium text-gray-800">Change Password</div>
                    <div className="text-xs text-gray-500">Update your password</div>
                  </div>
                </button>

                <div className="border-t my-2"></div>

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    logout();
                  }}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-red-50 transition-colors text-left text-red-600"
                >
                  <LogOut className="w-5 h-5" />
                  <div>
                    <div className="font-medium">Logout</div>
                    <div className="text-xs text-red-400">Sign out of your account</div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
