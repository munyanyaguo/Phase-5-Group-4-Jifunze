import { useState, useEffect } from "react";
import { fetchSchools } from "../../api";

export default function UserForm({ onSave, onCancel, initialData = null, role = "student" }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    school_id: "",
    courses: [],
  });
  const [schools, setSchools] = useState([]);
  const [loadingSchools, setLoadingSchools] = useState(true);

  // Load schools on mount
  useEffect(() => {
    const loadSchools = async () => {
      try {
        const data = await fetchSchools();
        setSchools(data.schools || []);
      } catch (err) {
        console.error("Failed to load schools", err);
      } finally {
        setLoadingSchools(false);
      }
    };
    loadSchools();
  }, []);

  // Prefill form for editing
  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        email: initialData.email || "",
        school_id: initialData.school?.id || "",
        courses: initialData.courses?.map((c) => c.id) || [],
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.school_id) return;
    onSave(form);
    setForm({ name: "", email: "", school_id: "", courses: [] });
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

      {/* School Dropdown */}
      <select
        name="school_id"
        value={form.school_id}
        onChange={handleChange}
        className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Select School</option>
        {schools.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      {/* Optional: add multi-select courses if needed */}
      {/* <select
        name="courses"
        multiple
        value={form.courses}
        onChange={(e) =>
          setForm({
            ...form,
            courses: Array.from(e.target.selectedOptions, (o) => o.value),
          })
        }
        className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500"
      >
        {courses.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select> */}

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
