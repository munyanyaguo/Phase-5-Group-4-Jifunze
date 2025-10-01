// src/pages/educator/ChangePassword.jsx
import React, { useState } from "react";
import { Lock, Eye, EyeOff, CheckCircle, XCircle, Shield } from "lucide-react";

const API_URL = "http://127.0.0.1:5000/api";

export default function ChangePassword() {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [validations, setValidations] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    match: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Validate password requirements
    if (name === "newPassword" || name === "confirmPassword") {
      setValidations({
        length: formData.newPassword.length >= 8 || value.length >= 8,
        uppercase: /[A-Z]/.test(name === "newPassword" ? value : formData.newPassword),
        lowercase: /[a-z]/.test(name === "newPassword" ? value : formData.newPassword),
        number: /[0-9]/.test(name === "newPassword" ? value : formData.newPassword),
        match:
          name === "confirmPassword"
            ? value === formData.newPassword
            : formData.confirmPassword === value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (formData.newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      setError("New password must be different from current password");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/users/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: formData.currentPassword,
          new_password: formData.newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess("Password changed successfully!");
        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setValidations({
          length: false,
          uppercase: false,
          lowercase: false,
          number: false,
          match: false,
        });
      } else {
        setError(data.message || "Failed to change password");
      }
    } catch (err) {
      setError("Failed to change password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords({ ...showPasswords, [field]: !showPasswords[field] });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <Lock className="w-8 h-8 text-white" />
            </div>
            Change Password
          </h1>
          <p className="text-gray-600">Update your password to keep your account secure</p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-xl shadow-sm flex items-center gap-2">
            <XCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 text-green-700 px-6 py-4 rounded-xl shadow-sm flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            {success}
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Password */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <Shield className="w-4 h-4 text-blue-600" />
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? "text" : "password"}
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your current password"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("current")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPasswords.current ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <Lock className="w-4 h-4 text-purple-600" />
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? "text" : "password"}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("new")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPasswords.new ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <Lock className="w-4 h-4 text-green-600" />
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Confirm your new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("confirm")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            {formData.newPassword && (
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  Password Requirements:
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {validations.length ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-gray-400" />
                    )}
                    <span
                      className={`text-sm ${
                        validations.length ? "text-green-600" : "text-gray-600"
                      }`}
                    >
                      At least 8 characters
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {validations.uppercase ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-gray-400" />
                    )}
                    <span
                      className={`text-sm ${
                        validations.uppercase ? "text-green-600" : "text-gray-600"
                      }`}
                    >
                      One uppercase letter
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {validations.lowercase ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-gray-400" />
                    )}
                    <span
                      className={`text-sm ${
                        validations.lowercase ? "text-green-600" : "text-gray-600"
                      }`}
                    >
                      One lowercase letter
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {validations.number ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-gray-400" />
                    )}
                    <span
                      className={`text-sm ${
                        validations.number ? "text-green-600" : "text-gray-600"
                      }`}
                    >
                      One number
                    </span>
                  </div>
                  {formData.confirmPassword && (
                    <div className="flex items-center gap-2">
                      {validations.match ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-gray-400" />
                      )}
                      <span
                        className={`text-sm ${
                          validations.match ? "text-green-600" : "text-gray-600"
                        }`}
                      >
                        Passwords match
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Changing Password...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  Change Password
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security Tips */}
        <div className="mt-6 bg-blue-50 rounded-xl p-6 border-l-4 border-blue-500">
          <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security Tips
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Use a unique password you don't use elsewhere</li>
            <li>• Avoid using personal information in your password</li>
            <li>• Consider using a password manager</li>
            <li>• Change your password regularly</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
