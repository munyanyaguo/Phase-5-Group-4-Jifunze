import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBook, FaClipboardList, FaFileAlt, FaEnvelope, FaUserEdit } from "react-icons/fa";
import { API_URL } from "../../config";
import StudentMessages from "./StudentMessages";

const StudentDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", email: "" });
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  const navigate = useNavigate();

  // Fetch dashboard data
  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API_URL}/api/users/dashboard`, {
      headers: { Authorization: `Bearer ${token}`, "Cache-Control": "no-cache" },
    })
      .then((res) => res.json())
      .then((data) => {
        setDashboard(data.data.dashboard);
        setProfileForm({
          name: data.data.dashboard.user?.name || "",
          email: data.data.dashboard.user?.email || "",
        });
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load dashboard");
        setLoading(false);
      });
  }, []);

  // Profile form
  const handleProfileChange = (e) =>
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSuccess("");
    setProfileError("");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileForm),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProfileSuccess("Profile updated successfully.");
        setShowEditProfile(false);
      } else {
        setProfileError(data.message || "Failed to update profile.");
      }
    } catch {
      setProfileError("Network error");
    }
  };

  // Loading and error states
  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex justify-center items-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
        <p className="text-lg text-gray-600 font-medium">Loading your dashboard...</p>
      </div>
    </div>
  );
  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex justify-center items-center">
      <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md">
        <div className="text-red-500 text-5xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
        <p className="text-gray-600">{error}</p>
      </div>
    </div>
  );

  // Summary cards
  const summary = [
    {
      label: "Courses",
      value: dashboard.enrolled_courses || 0,
      icon: <FaBook className="text-blue-600 text-2xl" />,
      action: () => navigate("/student/courses"),
      actionLabel: "View Courses",
    },
    {
      label: "Attendance",
      value: dashboard.attendance_count || 0,
      icon: <FaClipboardList className="text-green-600 text-2xl" />,
      action: () => navigate("/student/attendance"),
      actionLabel: "View Attendance",
    },
    {
      label: "Resources",
      value: dashboard.resources_count || 0,
      icon: <FaFileAlt className="text-purple-600 text-2xl" />,
      action: () => navigate("/student/resources"),
      actionLabel: "View Resources",
    },
    {
      label: "Messages",
      value: dashboard.messages_count || 0,
      icon: <FaEnvelope className="text-pink-600 text-2xl" />,
      action: () => navigate("/student/messages"),
      actionLabel: "Send Message",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Welcome back, {dashboard.user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-600">Here's what's happening with your learning journey</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-8 bg-white rounded-xl p-2 shadow-sm w-fit">
          {["overview", "messages", "profile"].map((tab) => (
            <button
              key={tab}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab 
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md" 
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {summary.map((card, idx) => (
              <div 
                key={card.label} 
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${
                  idx === 0 ? 'bg-blue-100' : idx === 1 ? 'bg-green-100' : idx === 2 ? 'bg-purple-100' : 'bg-pink-100'
                }`}>
                  {card.icon}
                </div>
                <div className="text-3xl font-bold text-gray-800 mb-1">{card.value}</div>
                <div className="text-sm text-gray-500 mb-4">{card.label}</div>
                <button
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium text-sm"
                  onClick={card.action}
                >
                  {card.actionLabel}
                </button>
              </div>
            ))}
          </div>

          {/* Recent Activity + Profile */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Recent Enrollments */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <FaBook className="mr-2 text-blue-600" />
                Recent Enrollments
              </h3>
              {dashboard.recent_enrollments?.length ? (
                <div className="space-y-3">
                  {dashboard.recent_enrollments.map((e) => (
                    <div key={e.id} className="p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                      <p className="font-medium text-gray-800 text-sm">{e.course_title}</p>
                      {e.date_enrolled && (
                        <p className="text-xs text-gray-500 mt-1">
                          📅 {new Date(e.date_enrolled).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <FaBook className="mx-auto text-3xl mb-2 opacity-50" />
                  <p className="text-sm">No recent enrollments</p>
                </div>
              )}
            </div>

            {/* Recent Attendance */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <FaClipboardList className="mr-2 text-green-600" />
                Recent Attendance
              </h3>
              {dashboard.recent_attendance?.length ? (
                <div className="space-y-3">
                  {dashboard.recent_attendance.map((a, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">{a.date}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          a.status === 'present' ? 'bg-green-100 text-green-700' :
                          a.status === 'late' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {a.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <FaClipboardList className="mx-auto text-3xl mb-2 opacity-50" />
                  <p className="text-sm">No recent attendance</p>
                </div>
              )}
            </div>

            {/* Recent Messages */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <FaEnvelope className="mr-2 text-pink-600" />
                Recent Messages
              </h3>
              {dashboard.recent_messages?.length ? (
                <div className="space-y-3">
                  {dashboard.recent_messages.map((m) => (
                    <div key={m.id} className="p-3 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors">
                      <p className="text-sm text-gray-700 line-clamp-2">{m.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <FaEnvelope className="mx-auto text-3xl mb-2 opacity-50" />
                  <p className="text-sm">No recent messages</p>
                </div>
              )}
            </div>
          </div>

          {/* Profile Card - Full Width */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 shadow-xl text-white">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mr-4">
                  <FaUserEdit className="text-3xl" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">My Profile</h3>
                  <p className="text-blue-100">Your account information</p>
                </div>
              </div>
              {!showEditProfile && (
                <button
                  className="bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                  onClick={() => setShowEditProfile(true)}
                >
                  Edit Profile
                </button>
              )}
            </div>

            {!showEditProfile ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <p className="text-blue-200 text-sm mb-1">Name</p>
                  <p className="text-xl font-semibold">{dashboard.user?.name}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <p className="text-blue-200 text-sm mb-1">Email</p>
                  <p className="text-xl font-semibold">{dashboard.user?.email}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <p className="text-blue-200 text-sm mb-1">School</p>
                  <p className="text-xl font-semibold">{dashboard.school?.name || 'Not assigned'}</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleProfileSubmit} className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Name</label>
                    <input 
                      type="text" 
                      name="name" 
                      value={profileForm.name} 
                      onChange={handleProfileChange} 
                      className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input 
                      type="email" 
                      name="email" 
                      value={profileForm.email} 
                      onChange={handleProfileChange} 
                      className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50" 
                      required 
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button 
                    type="submit" 
                    className="bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                  >
                    Save Changes
                  </button>
                  <button 
                    type="button" 
                    className="bg-white/20 text-white px-6 py-2 rounded-lg font-medium hover:bg-white/30 transition-colors" 
                    onClick={() => setShowEditProfile(false)}
                  >
                    Cancel
                  </button>
                </div>
                {profileError && <div className="mt-4 p-3 bg-red-500/20 border border-red-300 rounded-lg text-white">{profileError}</div>}
                {profileSuccess && <div className="mt-4 p-3 bg-green-500/20 border border-green-300 rounded-lg text-white">{profileSuccess}</div>}
              </form>
            )}
          </div>
        </>
      )}

      {/* Messages Tab */}
      {activeTab === "messages" && (
        <StudentMessages enrolledCourses={dashboard.user?.enrollments || []} />
      )}

      {/* Profile Tab (expanded) */}
      {activeTab === "profile" && (
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Profile Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <span className="font-semibold text-gray-700 w-24">Name:</span>
              <span className="text-gray-600">{dashboard.user?.name}</span>
            </div>
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <span className="font-semibold text-gray-700 w-24">Email:</span>
              <span className="text-gray-600">{dashboard.user?.email}</span>
            </div>
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <span className="font-semibold text-gray-700 w-24">School:</span>
              <span className="text-gray-600">{dashboard.school?.name}</span>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default StudentDashboard;
  