// src/components/educator/Navbar.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as AuthService from "../../services/authServices";
import { Bell, User, Settings, Lock, LogOut, ChevronDown, X, MessageSquare } from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [toastNotifications, setToastNotifications] = useState([]);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Load user data
  useEffect(() => {
    const loadUser = async () => {
      // First try from localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error('Failed to parse stored user:', e);
        }
      }
      
      // Then fetch fresh data from API
      const freshUser = await AuthService.getCurrentUser();
      if (freshUser) {
        setUser(freshUser.profile || freshUser.user || freshUser);
      }
    };
    loadUser();
  }, []);

  const logout = () => {
    AuthService.logout();
    navigate("/login");
  };

  // Click outside to close notifications
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

  // Listen for new message notifications from messages page
  useEffect(() => {
    const onNew = (e) => {
      const { courseId, courseTitle, message } = e.detail || {};
      const notification = {
        id: message?.id || `${courseId}-${Date.now()}`,
        text: `New message in ${courseTitle}`,
        courseId,
        courseTitle,
        at: message?.timestamp || new Date().toISOString(),
      };
      
      // Add to persistent notifications
      setNotifications((prev) => [notification, ...prev].slice(0, 10));
      
      // Add to toast notifications
      const toastId = `toast-${Date.now()}`;
      setToastNotifications((prev) => [...prev, { ...notification, toastId }]);
      
      // Auto-remove toast after 3 seconds with animation
      setTimeout(() => {
        const toastElement = document.querySelector(`[data-toast-id="${toastId}"]`);
        if (toastElement) {
          toastElement.classList.add('toast-exit');
          setTimeout(() => {
            setToastNotifications((prev) => prev.filter(t => t.toastId !== toastId));
          }, 300);
        } else {
          setToastNotifications((prev) => prev.filter(t => t.toastId !== toastId));
        }
      }, 3000);
    };
    window.addEventListener("edu:new-message", onNew);
    return () => window.removeEventListener("edu:new-message", onNew);
  }, []);

  // Function to manually dismiss a toast with animation
  const dismissToast = (toastId) => {
    // Add exit animation class
    const toastElement = document.querySelector(`[data-toast-id="${toastId}"]`);
    if (toastElement) {
      toastElement.classList.add('toast-exit');
      // Remove after animation completes
      setTimeout(() => {
        setToastNotifications((prev) => prev.filter(t => t.toastId !== toastId));
      }, 300);
    } else {
      setToastNotifications((prev) => prev.filter(t => t.toastId !== toastId));
    }
  };

  return (
    <header className="bg-white shadow px-6 py-3 flex justify-between items-center">
      <div>
        <h3 className="font-semibold">Educator Dashboard</h3>
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
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1">
              {notifications.length}
            </span>
          )}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 bg-white shadow-lg rounded-lg p-4 z-50">
              <h3 className="font-semibold mb-2">Notifications</h3>
              {notifications.length === 0 ? (
                <div className="text-sm text-gray-500">No notifications</div>
              ) : (
                <ul className="text-sm text-gray-700 space-y-2 max-h-64 overflow-auto">
                  {notifications.map((n) => (
                    <li key={n.id} className="flex justify-between items-start">
                      <div>
                        <div>{n.text}</div>
                        <div className="text-xs text-gray-400">{new Date(n.at).toLocaleString()}</div>
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
              {(user?.name || 'U').charAt(0).toUpperCase()}
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white shadow-xl rounded-xl overflow-hidden z-50 border border-gray-100">
              {/* Profile Header */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-lg backdrop-blur-sm">
                    {(user?.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold">{user?.name || 'User'}</div>
                    <div className="text-xs text-blue-100">{user?.email || ''}</div>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate('/educator/profile');
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
                    navigate('/educator/settings');
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
                    navigate('/educator/change-password');
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

      {/* Toast Notifications - Stacked Horizontally */}
      <div className="fixed top-20 right-6 z-50 flex flex-row-reverse gap-3 pointer-events-none">
        {toastNotifications.map((toast, index) => (
          <div
            key={toast.toastId}
            data-toast-id={toast.toastId}
            className="pointer-events-auto bg-white shadow-2xl rounded-xl overflow-hidden border border-gray-200 w-80 transform transition-all duration-300 ease-out"
            style={{
              animation: 'slideIn 0.3s ease-out',
              animationDelay: `${index * 0.05}s`,
              zIndex: toastNotifications.length - index
            }}
          >
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <span className="font-semibold text-sm">New Message</span>
              </div>
              <button
                onClick={() => dismissToast(toast.toastId)}
                className="text-white/80 hover:text-white hover:bg-white/20 p-1 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm font-medium text-gray-800 mb-1">{toast.text}</p>
              <p className="text-xs text-gray-500">
                {new Date(toast.at).toLocaleTimeString()}
              </p>
            </div>
            {/* Progress bar */}
            <div className="h-1 bg-gray-100">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                style={{
                  animation: 'progress 3s linear',
                  transformOrigin: 'left'
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Add animations */}
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px) scale(0.9);
            opacity: 0;
          }
          to {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
        }
        
        @keyframes slideOut {
          from {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
          to {
            transform: translateX(400px) scale(0.9);
            opacity: 0;
          }
        }
        
        @keyframes progress {
          from {
            transform: scaleX(1);
          }
          to {
            transform: scaleX(0);
          }
        }
        
        .toast-exit {
          animation: slideOut 0.3s ease-in forwards;
        }
      `}</style>
    </header>
  );
}
