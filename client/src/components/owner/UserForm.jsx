import { useState, useEffect } from "react";
import { fetchSchools, validateUserEmail } from "../../api";

export default function UserForm({ onSave, onCancel, initialData = null }) {
  const [form, setForm] = useState({
    email: "",
    role: "",       // 👈 added role field
    school_id: "",
  });

  const [schools, setSchools] = useState([]);
  const [error, setError] = useState("");

  // Load schools
  useEffect(() => {
    const loadSchools = async () => {
      try {
        const data = await fetchSchools();
        setSchools(data.schools || []);
      } catch (err) {
        console.error("Failed to load schools", err);
      }
    };
    loadSchools();
  }, []);

  // Prefill if editing
  useEffect(() => {
    if (initialData) {
      setForm({
        email: initialData.email || "",
        role: initialData.role || "",
        school_id: initialData.school?.id || "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email.trim() || !form.school_id || !form.role) {
      setError("Email, Role, and School are required.");
      return;
    }

    try {
      // ✅ Validate email belongs to the selected role
      const res = await validateUserEmail(form.email, form.role);
      if (!res.valid) {
        setError(`This email does not belong to a registered ${form.role}.`);
        return;
      }

      // ✅ Pass data up if valid
      onSave(form);
      setForm({ email: "", role: "", school_id: "" });
    } catch (err) {
      setError("Failed to validate email. Try again.");
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* Email Input */}
      <input
        type="email"
        name="email"
        placeholder="Enter user email"
        value={form.email}
        onChange={handleChange}
        required
        className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500"
      />

      {/* Role Dropdown */}
      <select
        name="role"
        value={form.role}
        onChange={handleChange}
        required
        className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Select Role</option>
        <option value="student">Student</option>
        <option value="educator">Educator</option>
      </select>

      {/* School Dropdown */}
      <select
        name="school_id"
        value={form.school_id}
        onChange={handleChange}
        required
        className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Select School</option>
        {schools.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      {/* Buttons */}
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
