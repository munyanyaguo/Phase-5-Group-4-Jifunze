// client/src/components/owner/SchoolForm.jsx
import React, { useState } from "react";
import { createSchool, updateSchool } from "../../api";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export default function SchoolForm({ initialData, onClose, onSuccess }) {
  const [formData, setFormData] = useState(
    initialData || { name: "", description: "", location: "" }
  );
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let savedSchool;
      if (initialData) {
        savedSchool = await updateSchool(initialData.id, formData);
      } else {
        savedSchool = await createSchool(formData);
      }
      onSuccess(savedSchool);
    } catch (err) {
      alert("Failed to save school");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-black"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold mb-4">
          {initialData ? "Edit School" : "Create School"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Location</label>
            <input
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full border rounded p-2"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Saving..." : "Save"}
          </Button>
        </form>
      </div>
    </div>
  );
}
