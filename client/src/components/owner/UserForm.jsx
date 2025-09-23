// src/components/owner/UserForm.jsx
import { useState, useEffect } from "react";

export default function UserForm({ onSave, onCancel, initialData = null }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "student",
    school: "",
  });

  // Prefill form when editing
  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        email: initialData.email || "",
        role: initialData.role || "student",
        school: initialData.school || "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    onSave(form);
    setForm({ name: "", email: "", role: "student", school: "" });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <input
        type="text"
        name="name"
        placeholder="Full Name"
        value={form.name}
        onChange={handleChange}
        className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500"
      />

      {/* Email */}
      <input
        type="email"
        name="email"
        placeholder="Email Address"
        value={form.email}
        onChange={handleChange}
        className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500"
      />

      {/* Role */}
      <select
        name="role"
        value={form.role}
        onChange={handleChange}
        className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500"
      >
        <option value="student">Student</option>
        <option value="educator">Educator</option>
      </select>

      {/* School */}
      <input
        type="text"
        name="school"
        placeholder="School Name"
        value={form.school}
        onChange={handleChange}
        className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500"
      />

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          {initialData ? "Update" : "Save"}
        </button>
      </div>
    </form>
  );
}
