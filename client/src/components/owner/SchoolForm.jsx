import React, { useState, useEffect } from "react";

export default function SchoolForm({ onCreate, initialData = {}, onCancel }) {
  const [name, setName] = useState(initialData.name || "");
  const [address, setAddress] = useState(initialData.address || "");
  const [phone, setPhone] = useState(initialData.phone || "");
  const [loading, setLoading] = useState(false);

  // Update form if initialData changes (useful when editing different schools)
  useEffect(() => {
    setName(initialData.name || "");
    setAddress(initialData.address || "");
    setPhone(initialData.phone || "");
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    await onCreate({ name, address, phone });
    setLoading(false);

    // Clear form only if not editing
    if (!initialData.id) {
      setName("");
      setAddress("");
      setPhone("");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-4 shadow-md rounded-lg grid grid-cols-1 md:grid-cols-4 gap-3 mb-6"
    >
      <input
        type="text"
        placeholder="School name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className="border p-2 rounded"
      />
      <input
        type="text"
        placeholder="Address (optional)"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        className="border p-2 rounded"
      />
      <input
        type="text"
        placeholder="Phone (optional)"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="border p-2 rounded"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          {loading ? (initialData.id ? "Saving..." : "Creating...") : initialData.id ? "Save" : "Add School"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
