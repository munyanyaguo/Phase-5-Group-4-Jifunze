// src/components/owner/UserForm.jsx
import { useState } from "react";

export default function UserForm({ role, onAdd, onCancel }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    className: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;
    onAdd({ ...formData, role });
    setFormData({ name: "", email: "", className: "" });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        name="name"
        placeholder="Full Name"
        value={formData.name}
        onChange={handleChange}
        className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500"
      />

      <input
        type="email"
        name="email"
        placeholder="Email Address"
        value={formData.email}
        onChange={handleChange}
        className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500"
      />

      <input
        type="text"
        name="className"
        placeholder="Class (e.g., Class A)"
        value={formData.className}
        onChange={handleChange}
        className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500"
      />

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
          Save
        </button>
      </div>
    </form>
  );
}
