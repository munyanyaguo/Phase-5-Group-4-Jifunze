import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", form);
    // TODO: Add API call for registration
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* LEFT SIDE - Illustration + Tagline */}
      <div className="hidden md:flex w-1/2 relative bg-gradient-to-br from-purple-600 to-indigo-600 text-white items-center justify-center p-12 bg-cover bg-center bg-[url('/hero1.jpg')]">
  {/* Overlay for text visibility */}
  <div className="absolute inset-0 bg-black bg-opacity-50"></div>

  {/* Content */}
  <div className="relative text-center space-y-6 max-w-md z-10">
    <h1 className="text-4xl font-bold drop-shadow-lg">Join Jifunze 🚀</h1>

    {/* Expanded Paragraph with features */}
    <p className="text-lg text-purple-100 leading-relaxed font-semibold">
      🚀 With <span className="font-bold">Jifunze</span>, you can:
    </p>

    <ul className="text-left space-y-3 text-purple-100 text-md font-medium">
      <li>👩‍🎓 Explore curated courses and learning paths</li>
      <li>👨‍🏫 Share and access valuable resources</li>
      <li>🤝 Connect with mentors, peers, and leaders</li>
      <li>🏆 Unlock opportunities for personal and academic growth</li>
    </ul>

    <p className="text-md text-purple-200 italic mt-4">
      🌟 Start your journey today — because learning is better together.
    </p>
  </div>
</div>


      {/* RIGHT SIDE - Form */}
      <div className="flex w-full md:w-1/2 items-center justify-center p-8 bg-gray-50 bg-gradient-to-br from-purple-600 to-indigo-600">
        <div className="bg-white shadow-lg rounded-2xl w-full max-w-md p-8">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
            ✍️ Create Your Account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                👤 Full Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full px-4 py-2 border rounded-lg bg-gray-50 
                           focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                📧 Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full px-4 py-2 border rounded-lg bg-gray-50 
                           focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                🔑 Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full px-4 py-2 border rounded-lg bg-gray-50 
                           focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                required
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                🎓 Role
              </label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg bg-gray-50 
                           focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none cursor-pointer"
                required
              >
                <option value="student"> Student</option>
                <option value="educator"> Educator</option>
                <option value="manager"> Manager</option>
              </select>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-purple-600 text-white font-semibold py-3 
                         rounded-lg shadow-md hover:bg-purple-700 
                         transform hover:scale-105 transition"
            >
              🚀 Register
            </button>
          </form>

          <p className="text-center text-gray-600 mt-6">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-purple-600 hover:underline cursor-pointer"
            >
              Login
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
