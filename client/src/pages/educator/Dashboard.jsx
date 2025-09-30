// src/pages/educator/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardCard from "../../components/common/DashboardCard";
import { Users, BookOpen, MessageSquare } from "lucide-react";
import { fetchEducatorCourses } from "../../services/courseService";

export default function EducatorDashboard() {
  const [stats, setStats] = useState({ students: 0, classes: 0, resources: 0, sessions: 0 });
  const API_URL = "http://127.0.0.1:5000/api";
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ name: "", email: "", school: "" });
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", email: "" });
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  useEffect(() => {
    const loadStats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        // 1) Courses assigned to educator
        const coursesRes = await fetchEducatorCourses();
        const courses = Array.isArray(coursesRes?.data) ? coursesRes.data : [];
        const courseIds = courses.map((c) => c.id);

        // 2) Aggregate unique students from enrollments per course
        const enrollmentPromises = courseIds.map(async (courseId) => {
          const res = await fetch(`${API_URL}/enrollments?course_id=${courseId}&page=1&per_page=1`, {
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          });
          const body = await res.json();
          const total = (res.ok && body.success && body?.data?.meta?.total) ? body.data.meta.total : 0;
          return total;
        });
        const perCourseTotals = await Promise.all(enrollmentPromises);
        const studentsTotal = perCourseTotals.reduce((sum, n) => sum + (Number.isFinite(n) ? n : 0), 0);

        // 3) Count resources across educator's courses using meta.total per course
        const claims = (() => {
          try {
            const payload = token.split(".")[1];
            let base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
            const pad = base64.length % 4; if (pad) base64 += "=".repeat(4 - pad);
            return JSON.parse(atob(base64));
          } catch { return {}; }
        })();
        const resourceCountPromises = courseIds.map(async (courseId) => {
          try {
            const rr = await fetch(`${API_URL}/courses/${courseId}/resources?page=1&per_page=1`, {
              headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            });
            const rb = await rr.json();
            const total = (rr.ok && rb.success && rb?.data?.meta?.total) ? rb.data.meta.total : 0;
            return total;
          } catch {
            return 0;
          }
        });
        const perCourseResourceTotals = await Promise.all(resourceCountPromises);
        const resourcesCount = perCourseResourceTotals.reduce((sum, n) => sum + (Number.isFinite(n) ? n : 0), 0);

        // Unread messages best-effort: teacher's courses messages count (no read state in API yet)
        const unreadApprox = 0;

        setStats({
          students: studentsTotal,
          classes: courses.length,
          resources: resourcesCount,
          sessions: unreadApprox,
        });
      } catch (e) {
        console.error("Failed to load educator dashboard stats", e);
      }
    };

    loadStats();
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await fetch(`${API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        const data = await res.json();
        if (res.ok && data.success) {
          const user = data?.data?.profile || data?.data?.user || {};
          setProfile({ name: user.name || "", email: user.email || "", school: user.school?.name || "" });
          setProfileForm({ name: user.name || "", email: user.email || "" });
        }
      } catch (_) {}
    };
    loadProfile();
  }, []);

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileForm),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProfile((p) => ({ ...p, ...profileForm }));
        setProfileSuccess("Profile updated successfully.");
        setShowEditProfile(false);
      } else {
        setProfileError(data.message || "Failed to update profile.");
      }
    } catch (_) {
      setProfileError("Network error");
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-4 p-6 bg-white rounded-lg shadow">
      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        {[
          { key: "overview", label: "Overview" },
          { key: "messages", label: "Messages" },
        ].map((t) => (
          <button
            key={t.key}
            className={`px-4 py-2 rounded ${activeTab === t.key ? "bg-blue-600 text-white" : "bg-gray-200 text-blue-700"}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === "overview" && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <DashboardCard title="Classes" value={stats.classes} icon={<BookOpen />} />
            <DashboardCard title="Students" value={stats.students} icon={<Users />} />
            <DashboardCard title="Resources" value={stats.resources} icon={<BookOpen />} />
            <DashboardCard title="Unread" value={stats.sessions} icon={<MessageSquare />} />
          </div>

          {/* Quick actions + Profile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-50 rounded-lg p-6 shadow">
              <h3 className="text-xl font-semibold text-blue-700 mb-4">Quick Actions</h3>
              <div className="flex flex-wrap gap-3">
                <button className="bg-blue-600 text-white px-3 py-2 rounded" onClick={() => navigate("/educator/courses")}>View Courses</button>
                <button className="bg-blue-600 text-white px-3 py-2 rounded" onClick={() => navigate("/educator/resources")}>Upload Resource</button>
                <button className="bg-blue-600 text-white px-3 py-2 rounded" onClick={() => navigate("/educator/attendance")}>Take Attendance</button>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 shadow">
              <h3 className="text-xl font-semibold text-blue-700 mb-4">My Profile</h3>
              {!showEditProfile ? (
                <>
                  <div className="mb-2"><strong>Name:</strong> {profile.name}</div>
                  <div className="mb-2"><strong>Email:</strong> {profile.email}</div>
                  {profile.school && (
                    <div className="mb-2"><strong>School:</strong> {profile.school}</div>
                  )}
                  <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded" onClick={() => setShowEditProfile(true)}>Edit Profile</button>
                </>
              ) : (
                <form onSubmit={handleProfileSubmit} className="max-w-sm">
                  <div className="mb-3">
                    <label className="block text-sm font-medium">Name</label>
                    <input name="name" type="text" value={profileForm.name} onChange={handleProfileChange} className="mt-1 w-full border px-3 py-2 rounded" required />
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium">Email</label>
                    <input name="email" type="email" value={profileForm.email} onChange={handleProfileChange} className="mt-1 w-full border px-3 py-2 rounded" required />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
                    <button type="button" className="bg-gray-300 px-4 py-2 rounded" onClick={() => setShowEditProfile(false)}>Cancel</button>
                  </div>
                  {profileError && <div className="text-red-600 mt-2 text-sm">{profileError}</div>}
                  {profileSuccess && <div className="text-green-600 mt-2 text-sm">{profileSuccess}</div>}
                </form>
              )}
            </div>
          </div>
        </>
      )}

      {/* Messages Tab */}
      {activeTab === "messages" && (
        <div className="bg-gray-50 rounded-lg p-6 shadow">
          <h3 className="text-xl font-semibold text-blue-700 mb-4">Messages</h3>
          <p className="text-gray-600 mb-4">Go to the messages page to chat by course.</p>
          <button className="bg-blue-600 text-white px-3 py-2 rounded" onClick={() => navigate("/educator/messages")}>Open Messages</button>
        </div>
      )}
    </div>
  );
}
