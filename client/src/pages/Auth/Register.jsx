// src/pages/auth/Register.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
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
      const response = await fetch("http://127.0.0.1:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // Save tokens + role + user data immediately after signup
      if (data.data?.access_token) {
        localStorage.setItem("token", data.data.access_token);
      }

      let role = data.data?.user?.role || "user";
      if (role === "manager") role = "owner"; // normalize

      localStorage.setItem("role", role);
      if (data.data?.user?.id) {
        localStorage.setItem("user_id", data.data.user.id);
      }

      if (data.data?.user) {
        localStorage.setItem("user", JSON.stringify(data.data.user));
      }

      // Redirect to their dashboard
      navigate(`/${role}/dashboard`);
    } catch (err) {
      setError(err.message || "Something went wrong during registration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex
      {/* Left side (hero section) */}
      <div
        className="hidden md:flex w-1/2 relative bg-gradient-to-br from-purple-600 to-indigo-700 text-white items-center justify-center p-12 bg-cover bg-center"
        style={{ backgroundImage: "url('/hero1.jpg')" }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative text-center space-y-6 max-w-md z-10">
          <h1 className="text-4xl font-bold drop-shadow-lg">Join Jifunze 🚀</h1>
          <p className="text-lg text-purple-100 leading-relaxed font-medium">
            Create an account and start your journey of growth, collaboration,
            and learning.
          </p>
          <ul className="text-left space-y-3 text-purple-100 text-md font-medium">
            <li>👩‍🎓 Access curated courses and resources</li>
            <li>🤝 Connect with mentors and peers</li>
            <li>📈 Track your progress and achievements</li>
            <li>🌟 Unlock opportunities for growth</li>
          </ul>
        </div>
      </div>

      {/* Right side (registration form) */}



      {/* RIGHT SIDE - Form */}
      <div className="flex w-full md:w-1/2 items-center justify-center p-8 bg-gray-50 bg-gradient-to-br from-purple-600 to-indigo-600">
        <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-md transform transition-all hover:scale-[1.01]">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
            Create Your Account
          </h2>
          <p className="text-center text-gray-500 mb-6">
            Start your personalized learning journey today
          </p>

          {error && (
            <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-gray-700 text-sm mb-1">👤 Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-700 text-sm mb-1">📧 Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-700 text-sm mb-1">🔑 Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-gray-700 text-sm mb-1">🎓 Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 transition cursor-pointer"
              >
                <option value="student">Student</option>
                <option value="educator">Educator</option>
                <option value="manager">Manager</option>
              </select>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition duration-200 shadow-md hover:shadow-lg"
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </form>

          {/* Already have account */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-purple-600 hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
