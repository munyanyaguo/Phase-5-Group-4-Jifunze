// src/pages/Student/StudentProfile.jsx
import React, { useEffect, useState } from "react";
import { User, Mail, School, Calendar, BookOpen, Edit2, Save, X } from "lucide-react";
import * as AuthService from "../../services/authServices";

export default function StudentProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        // Try localStorage first
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }

        // Fetch fresh data
        const freshUser = await AuthService.getCurrentUser();
        if (freshUser) {
          const userData = freshUser.data?.profile || freshUser.data?.user || freshUser.profile || freshUser.user || freshUser;
          setUser(userData);
          setFormData({ name: userData.name || "", email: userData.email || "" });
          localStorage.setItem('user', JSON.stringify(userData));
        }
      } catch (err) {
        console.error('Failed to load user:', err);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const updatedUser = await AuthService.updateCurrentUser(formData);
      const userData = updatedUser.profile || updatedUser.user || updatedUser;
      
      setUser({ ...user, ...formData });
      setSuccess("Profile updated successfully!");
      setEditing(false);
      
      // Update localStorage
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...storedUser, ...formData }));
    } catch (error) {
      console.error('Update profile error:', error);
      setError(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading profile...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">No user data available</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Profile</h1>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8 text-white">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-4xl backdrop-blur-sm">
              {(user.name || 'S').charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{user.name || 'Student'}</h2>
              <p className="text-blue-100">{user.email || ''}</p>
              <div className="mt-2 inline-block px-3 py-1 bg-white/20 rounded-full text-sm">
                Student
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="p-8 space-y-6">
          {/* Alerts */}
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-xl shadow-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-50 border-l-4 border-green-500 text-green-700 px-6 py-4 rounded-xl shadow-sm">
              {success}
            </div>
          )}

          {/* Edit Button */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800">Personal Information</h3>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setFormData({ name: user?.name || "", email: user?.email || "" });
                    setError("");
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-all flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            )}
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                {editing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-semibold"
                    placeholder="Enter your name"
                  />
                ) : (
                  <p className="font-semibold text-gray-800">{user.name || 'N/A'}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Mail className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Email Address</p>
                {editing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-semibold"
                    placeholder="Enter your email"
                  />
                ) : (
                  <p className="font-semibold text-gray-800">{user.email || 'N/A'}</p>
                )}
              </div>
            </div>

            {/* School */}
            {user.school && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <School className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">School</p>
                  <p className="font-semibold text-gray-800">{user.school.name || user.school || 'N/A'}</p>
                </div>
              </div>
            )}

            {/* Role */}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-orange-50 rounded-lg">
                <BookOpen className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Role</p>
                <p className="font-semibold text-gray-800 capitalize">{user.role || 'Student'}</p>
              </div>
            </div>

            {/* Member Since */}
            {user.created_at && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="font-semibold text-gray-800">
                    {new Date(user.created_at).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
