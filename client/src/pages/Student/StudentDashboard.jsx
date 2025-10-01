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
  if (loading) return <div className="flex justify-center items-center h-96 text-lg text-gray-500">Loading dashboard...</div>;
  if (error) return <div className="flex justify-center items-center h-96 text-lg text-red-500">{error}</div>;

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
    <div className="max-w-6xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        {["overview", "messages", "profile"].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded ${
              activeTab === tab ? "bg-blue-600 text-white" : "bg-gray-200 text-blue-700"
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {summary.map((card) => (
              <div key={card.label} className="flex flex-col items-center bg-gray-50 rounded-lg p-6 shadow hover:shadow-lg transition">
                {card.icon}
                <div className="text-3xl font-bold mt-2">{card.value}</div>
                <div className="text-lg text-gray-700 mb-2">{card.label}</div>
                <button
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  onClick={card.action}
                >
                  {card.actionLabel}
                </button>
              </div>
            ))}
          </div>

          {/* Recent Activity + Profile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Recent Activity */}
            <div className="bg-gray-50 rounded-lg p-6 shadow">
              <h3 className="text-xl font-semibold text-blue-700 mb-4">Recent Activity</h3>
              <div>
                {/* Enrollments */}
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-700">Recent Enrollments</h4>
                  {dashboard.recent_enrollments?.length ? (
                    <ul className="list-disc ml-6">
                      {dashboard.recent_enrollments.map((e) => (
                        <li key={e.id} className="mb-1">{e.course_title} ({e.status})</li>
                      ))}
                    </ul>
                  ) : <div className="text-gray-400">No recent enrollments.</div>}
                </div>

                {/* Attendance */}
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-700">Recent Attendance</h4>
                  {dashboard.recent_attendance?.length ? (
                    <ul className="list-disc ml-6">
                      {dashboard.recent_attendance.map((a, idx) => (
                        <li key={idx} className="mb-1">{a.date}: {a.status}</li>
                      ))}
                    </ul>
                  ) : <div className="text-gray-400">No recent attendance.</div>}
                </div>

                {/* Messages */}
                <div>
                  <h4 className="font-semibold text-gray-700">Recent Messages</h4>
                  {dashboard.recent_messages?.length ? (
                    <ul className="list-disc ml-6">
                      {dashboard.recent_messages.map((m) => (
                        <li key={m.id} className="mb-1">{m.content.slice(0, 40)}...</li>
                      ))}
                    </ul>
                  ) : <div className="text-gray-400">No recent messages.</div>}
                </div>
              </div>
            </div>

            {/* Profile Card */}
            <div className="bg-gray-50 rounded-lg p-6 shadow flex flex-col items-center">
              <div className="flex items-center mb-4">
                <FaUserEdit className="text-blue-600 text-3xl mr-2" />
                <span className="text-xl font-bold text-blue-700">My Profile</span>
              </div>
              {!showEditProfile ? (
                <>
                  <div className="mb-2"><strong>Name:</strong> {dashboard.user?.name}</div>
                  <div className="mb-2"><strong>Email:</strong> {dashboard.user?.email}</div>
                  <div className="mb-2"><strong>School:</strong> {dashboard.school?.name}</div>
                  <button
                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={() => setShowEditProfile(true)}
                  >
                    Edit Profile
                  </button>
                </>
              ) : (
                <form onSubmit={handleProfileSubmit} className="w-full max-w-xs">
                  <div className="mb-2">
                    <label className="block font-medium">Name:</label>
                    <input type="text" name="name" value={profileForm.name} onChange={handleProfileChange} className="border p-2 rounded w-full" required />
                  </div>
                  <div className="mb-2">
                    <label className="block font-medium">Email:</label>
                    <input type="email" name="email" value={profileForm.email} onChange={handleProfileChange} className="border p-2 rounded w-full" required />
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
                    <button type="button" className="bg-gray-300 px-4 py-2 rounded" onClick={() => setShowEditProfile(false)}>Cancel</button>
                  </div>
                  {profileError && <div className="text-red-500 mt-2">{profileError}</div>}
                  {profileSuccess && <div className="text-green-600 mt-2">{profileSuccess}</div>}
                </form>
              )}
            </div>
          </div>
        </>
      )}

      {activeTab === "messages" && (() => {
  const firstCourse = dashboard.user?.enrollments?.[0];
  return (
    <StudentMessages courseId={firstCourse?.course_id} />
  );
  })()}


      {/* Profile Tab (expanded) */}
      {activeTab === "profile" && (
        <div className="bg-gray-50 rounded-lg p-6 shadow">
          <h3 className="text-xl font-semibold text-blue-700 mb-4">Profile Settings</h3>
          <p><strong>Name:</strong> {dashboard.user?.name}</p>
          <p><strong>Email:</strong> {dashboard.user?.email}</p>
          <p><strong>School:</strong> {dashboard.school?.name}</p>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
  