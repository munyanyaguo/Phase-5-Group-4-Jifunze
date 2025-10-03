// src/pages/auth/Login.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_URL } from '../../config';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Save tokens + role + user_id + user data
      if (data.data?.access_token) {
        localStorage.setItem("token", data.data.access_token);
      }

      let role = data.data?.user?.role || "user";
      if (role === "manager") role = "owner"; // normalize

      localStorage.setItem("role", role);
      if (data.data?.user?.id) {
        localStorage.setItem("user_id", data.data.user.id);
      }
      
      // Save full user object for navbar display
      if (data.data?.user) {
        localStorage.setItem("user", JSON.stringify(data.data.user));
      }

      // Redirect
      navigate(`/${role}/dashboard`);
    } catch (err) {
      setError(err.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side (hero with bg image/gradient) */}
      <div 
        className="hidden md:flex w-1/2 relative bg-gradient-to-br from-blue-600 to-indigo-700 text-white items-center justify-center p-12 bg-cover bg-center"
        style={{ backgroundImage: "url('/hero2.jpg')" }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative text-center space-y-6 max-w-md z-10">
          <h1 className="text-4xl font-bold drop-shadow-lg">Welcome Back ✨</h1>
          <p className="text-lg text-blue-100 leading-relaxed font-medium">
            Your learning journey continues here. <br />
            Sign in to access your courses, track progress, and connect with
            mentors and peers.
          </p>
          <ul className="text-left space-y-3 text-blue-100 text-md font-medium">
            <li>📚 Access all your enrolled courses</li>
            <li>⚡ Pick up right where you left off</li>
            <li>💬 Engage with your community</li>
            <li>🏆 Achieve your learning goals faster</li>
          </ul>
          <p className="text-md text-blue-200 italic mt-4">
            🚀 Ready to dive back in? Let’s go!
          </p>
        </div>
      </div>

      {/* Right side (login form) */}
      <div className="flex w-full md:w-1/2 items-center justify-center p-8 bg-gray-50 bg-gradient-to-br from-purple-600 to-indigo-600">
        <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-md transform transition-all hover:scale-[1.01]">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
            Login to Jifunze
          </h2>
          <p className="text-center text-gray-500 mb-6">
            Continue your learning journey with us
          </p>

          {error && (
            <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-gray-700 text-sm mb-1">
                📧 Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-700 text-sm mb-1">
                🔑 Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition duration-200 shadow-md hover:shadow-lg"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Register link */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Don’t have an account?{" "}
            <Link to="/register" className="text-blue-600 hover:underline">
              Register here
            </Link>
          </p>

          {/* Forgot Password */}
          <p className="text-center text-sm text-gray-600 mt-2">
            Forgot your password?{" "}
            <Link to="/reset-password" className="text-blue-600 hover:underline">
              Reset it here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
