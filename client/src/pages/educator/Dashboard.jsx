// src/pages/educator/Dashboard.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashboardCard from "../../components/common/DashboardCard";
import { Users, BookOpen, MessageSquare, FileText, ClipboardCheck, UserCircle, TrendingUp, Calendar } from "lucide-react";
import { fetchEducatorCourses } from "../../services/courseService";
import EducatorMessages from "./Messages";
import { cache } from "../../utils/cache";
import { DashboardSkeleton } from "../../components/common/SkeletonLoader";

export default function EducatorDashboard() {
  const [stats, setStats] = useState({ students: 0, classes: 0, resources: 0, sessions: 0 });
  const [initialLoading, setInitialLoading] = useState(true);
  const API_URL = "http://127.0.0.1:5000/api";
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ name: "", email: "", school: "" });
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", email: "" });
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  const loadStats = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      // Check cache first
      const cachedStats = cache.get('dashboard_stats');
      if (cachedStats) {
        setStats(cachedStats);
        setInitialLoading(false);
        return;
      }

      // 1) Courses assigned to educator
      const coursesRes = await fetchEducatorCourses();
      const courses = Array.isArray(coursesRes?.data) ? coursesRes.data : [];
      const courseIds = courses.map((c) => c.id);

        // 2) Aggregate unique students from enrollments (backend now filters by educator's courses)
        let studentsTotal = 0;
        try {
          const allEnrollmentsRes = await fetch(`${API_URL}/enrollments?per_page=1000`, {
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          });
          if (allEnrollmentsRes.ok) {
            const allEnrollmentsBody = await allEnrollmentsRes.json();
            
            // Backend now filters enrollments to educator's courses automatically
            const allEnrollments = allEnrollmentsBody?.data?.enrollments || allEnrollmentsBody?.data?.items || [];
            
            // Count unique students
            const uniqueStudents = new Set();
            allEnrollments.forEach(enrollment => {
              if (enrollment.user_public_id) {
                uniqueStudents.add(enrollment.user_public_id);
              }
            });
            studentsTotal = uniqueStudents.size;
          }
        } catch (error) {
          console.error('Failed to fetch enrollments:', error);
        }

        // 3) Count resources across educator's courses
        let resourcesCount = 0;
        try {
          const rr = await fetch(`${API_URL}/resources?page=1&per_page=1000`, {
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          });
          const rb = await rr.json();
          
          let allResources = [];
          if (rr.ok && rb.success) {
            allResources = rb?.data?.resources || rb?.data?.items || rb?.resources || [];
          }
          
          // Filter resources by educator's courses
          const educatorResources = allResources.filter(resource => {
            const matches = courseIds.includes(resource.course_id);
            return matches;
          });
          resourcesCount = educatorResources.length;
        } catch (error) {
          console.error('Failed to fetch resources:', error);
          resourcesCount = 0;
        }

        // 4) Count unread messages across all courses (optimized - parallel with limit)
        let totalUnreadMessages = 0;
        try {
          // Limit to first 5 courses to reduce load time
          const limitedCourseIds = courseIds.slice(0, 5);
          const messagePromises = limitedCourseIds.map(async (courseId) => {
            try {
              const res = await fetch(`${API_URL}/messages?course_id=${courseId}`, {
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
              });
              if (res.ok) {
                const body = await res.json();
                const messages = body?.data?.messages || body?.messages || [];
                
                const lastReadKey = `lastRead_course_${courseId}`;
                const lastReadTime = localStorage.getItem(lastReadKey);
                
                // Count messages newer than last read time
                const unreadCount = messages.filter(msg => {
                  if (!lastReadTime) return true;
                  return new Date(msg.timestamp) > new Date(lastReadTime);
                }).length;
                
                return unreadCount;
              }
              return 0;
            } catch (error) {
              console.error('Failed to fetch messages:', error);
              return 0;
            }
          });
          
          const unreadCounts = await Promise.all(messagePromises);
          totalUnreadMessages = unreadCounts.reduce((sum, count) => sum + count, 0);
        } catch (err) {
          console.error('Failed to count unread messages:', err);
        }

        const newStats = {
          students: studentsTotal,
          classes: courses.length,
          resources: resourcesCount,
          sessions: totalUnreadMessages,
        };
        
        setStats(newStats);
        
        // Cache the stats for 5 minutes
        cache.set('dashboard_stats', newStats, 5 * 60 * 1000);
    } catch (e) {
      console.error("Failed to load educator dashboard stats", e);
    } finally {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
    
    // Listen for new messages and refresh stats
    const handleNewMessage = () => {
      loadStats();
    };
    
    window.addEventListener('edu:new-message', handleNewMessage);
    return () => window.removeEventListener('edu:new-message', handleNewMessage);
  }, [loadStats]);

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
      } catch (err) {
        console.error('Failed to load profile:', err);
      }
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
    } catch (err) {
      console.error('Profile update error:', err);
      setProfileError("Network error");
    }
  };

  if (initialLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {profile.name || 'Educator'}! 👋</h1>
          <p className="text-gray-600">Here's what's happening with your classes today.</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-8 bg-white p-1 rounded-xl shadow-sm w-fit">
          {[
            { key: "overview", label: "Overview", icon: <TrendingUp className="w-4 h-4" /> },
            { key: "messages", label: "Messages", icon: <MessageSquare className="w-4 h-4" /> },
            { key: "profile", label: "Profile", icon: <UserCircle className="w-4 h-4" /> },
          ].map((t) => (
            <button
              key={t.key}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                activeTab === t.key 
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md" 
                  : "text-gray-600 hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab(t.key)}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === "overview" && (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl shadow-lg text-white transform hover:scale-105 transition-transform duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <TrendingUp className="w-5 h-5 opacity-70" />
                </div>
                <div className="text-3xl font-bold mb-1">{stats.classes}</div>
                <div className="text-blue-100 text-sm">Active Classes</div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl shadow-lg text-white transform hover:scale-105 transition-transform duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Users className="w-6 h-6" />
                  </div>
                  <TrendingUp className="w-5 h-5 opacity-70" />
                </div>
                <div className="text-3xl font-bold mb-1">{stats.students}</div>
                <div className="text-purple-100 text-sm">Total Students</div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl shadow-lg text-white transform hover:scale-105 transition-transform duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <FileText className="w-6 h-6" />
                  </div>
                  <TrendingUp className="w-5 h-5 opacity-70" />
                </div>
                <div className="text-3xl font-bold mb-1">{stats.resources}</div>
                <div className="text-green-100 text-sm">Resources Shared</div>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-2xl shadow-lg text-white transform hover:scale-105 transition-transform duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <TrendingUp className="w-5 h-5 opacity-70" />
                </div>
                <div className="text-3xl font-bold mb-1">{stats.sessions}</div>
                <div className="text-orange-100 text-sm">Unread Messages</div>
              </div>
            </div>

            {/* Quick actions + Profile */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Actions */}
              <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  Quick Actions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button 
                    className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl hover:shadow-md transition-all duration-200 group"
                    onClick={() => navigate("/educator/courses")}
                  >
                    <div className="p-3 bg-blue-600 rounded-lg group-hover:scale-110 transition-transform">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-800">View Courses</div>
                      <div className="text-sm text-gray-600">Manage your classes</div>
                    </div>
                  </button>

                  <button 
                    className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl hover:shadow-md transition-all duration-200 group"
                    onClick={() => navigate("/educator/resources")}
                  >
                    <div className="p-3 bg-green-600 rounded-lg group-hover:scale-110 transition-transform">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-800">Upload Resource</div>
                      <div className="text-sm text-gray-600">Share materials</div>
                    </div>
                  </button>

                  <button 
                    className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl hover:shadow-md transition-all duration-200 group"
                    onClick={() => navigate("/educator/attendance")}
                  >
                    <div className="p-3 bg-purple-600 rounded-lg group-hover:scale-110 transition-transform">
                      <ClipboardCheck className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-800">Take Attendance</div>
                      <div className="text-sm text-gray-600">Mark present/absent</div>
                    </div>
                  </button>

                  <button 
                    className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl hover:shadow-md transition-all duration-200 group"
                    onClick={() => setActiveTab("messages")}
                  >
                    <div className="p-3 bg-orange-600 rounded-lg group-hover:scale-110 transition-transform">
                      <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-800">Messages</div>
                      <div className="text-sm text-gray-600">Chat with students</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Profile Card */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                    <UserCircle className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">My Profile</h3>
                </div>
                {!showEditProfile ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="text-sm text-gray-500 mb-1">Name</div>
                      <div className="font-semibold text-gray-800">{profile.name || 'Not set'}</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="text-sm text-gray-500 mb-1">Email</div>
                      <div className="font-semibold text-gray-800">{profile.email || 'Not set'}</div>
                    </div>
                    {profile.school && (
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <div className="text-sm text-gray-500 mb-1">School</div>
                        <div className="font-semibold text-gray-800">{profile.school}</div>
                      </div>
                    )}
                    <button 
                      className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200"
                      onClick={() => setShowEditProfile(true)}
                    >
                      Edit Profile
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleProfileSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                      <input 
                        name="name" 
                        type="text" 
                        value={profileForm.name} 
                        onChange={handleProfileChange} 
                        className="w-full border border-gray-300 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input 
                        name="email" 
                        type="email" 
                        value={profileForm.email} 
                        onChange={handleProfileChange} 
                        className="w-full border border-gray-300 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                        required 
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button 
                        type="submit" 
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2.5 rounded-xl font-medium hover:shadow-lg transition-all"
                      >
                        Save
                      </button>
                      <button 
                        type="button" 
                        className="flex-1 bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-medium hover:bg-gray-300 transition-all" 
                        onClick={() => setShowEditProfile(false)}
                      >
                        Cancel
                      </button>
                    </div>
                    {profileError && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{profileError}</div>}
                    {profileSuccess && <div className="text-green-600 text-sm bg-green-50 p-3 rounded-lg">{profileSuccess}</div>}
                  </form>
                )}
              </div>
            </div>
          </>
        )}

        {/* Messages Tab */}
        {activeTab === "messages" && (
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <EducatorMessages />
          </div>
        )}

        {/* Profile Tab (expanded) */}
        {activeTab === "profile" && (
          <div className="bg-white rounded-2xl p-8 shadow-lg max-w-2xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                <UserCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Profile Settings</h3>
            </div>
            {!showEditProfile ? (
              <div className="space-y-6">
                <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                  <div className="text-sm text-gray-600 mb-2">Full Name</div>
                  <div className="text-xl font-semibold text-gray-800">{profile.name || 'Not set'}</div>
                </div>
                <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                  <div className="text-sm text-gray-600 mb-2">Email Address</div>
                  <div className="text-xl font-semibold text-gray-800">{profile.email || 'Not set'}</div>
                </div>
                {profile.school && (
                  <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                    <div className="text-sm text-gray-600 mb-2">School</div>
                    <div className="text-xl font-semibold text-gray-800">{profile.school}</div>
                  </div>
                )}
                <button 
                  className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium text-lg hover:shadow-xl transition-all duration-200"
                  onClick={() => setShowEditProfile(true)}
                >
                  Edit Profile
                </button>
              </div>
            ) : (
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input 
                    name="name" 
                    type="text" 
                    value={profileForm.name} 
                    onChange={handleProfileChange} 
                    className="w-full border-2 border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input 
                    name="email" 
                    type="email" 
                    value={profileForm.email} 
                    onChange={handleProfileChange} 
                    className="w-full border-2 border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    required 
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    type="submit" 
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-xl transition-all"
                  >
                    Save Changes
                  </button>
                  <button 
                    type="button" 
                    className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-300 transition-all" 
                    onClick={() => setShowEditProfile(false)}
                  >
                    Cancel
                  </button>
                </div>
                {profileError && <div className="text-red-600 text-sm bg-red-50 p-4 rounded-xl border border-red-200">{profileError}</div>}
                {profileSuccess && <div className="text-green-600 text-sm bg-green-50 p-4 rounded-xl border border-green-200">{profileSuccess}</div>}
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
