// src/components/owner/SchoolForm.jsx
import React, { useState, useEffect } from "react";

export default function SchoolForm({ onSave, onCancel, editingSchool }) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (editingSchool) setName(editingSchool.name || "");
  }, [editingSchool]);

  const submit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const payload = editingSchool ? { ...editingSchool, name } : { name };
    onSave(payload);
    setName("");
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full p-2 border rounded"
        placeholder="School name"
      />
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="px-3 py-2 border rounded">Cancel</button>
        <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded">
          {editingSchool ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
}
