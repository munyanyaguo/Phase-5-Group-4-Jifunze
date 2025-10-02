// src/components/SchoolCard.jsx
import React, { useState } from "react";
import AssignUserModal from "./AssignUserModal";
import SchoolForm from "./SchoolForm";

export default function SchoolCard({ school, onDelete, onAssignSuccess, onUpdate }) {
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editing, setEditing] = useState(false);

  const handleAssignClick = () => setShowAssignModal(true);
  const handleCloseModal = () => setShowAssignModal(false);

  const handleEditClick = () => setEditing(true);
  const handleCancelEdit = () => setEditing(false);

  const handleSaveEdit = async (updatedData) => {
    await onUpdate(school.id, updatedData);
    setEditing(false);
  };

  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 flex flex-col justify-between hover:shadow-md transition">
      {editing ? (
        <SchoolForm
          initialData={school}
          onCreate={handleSaveEdit}
          onCancel={handleCancelEdit}
        />
      ) : (
        <>
          {/* School Info */}
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-slate-800">{school.name}</h2>
            <p className="text-sm text-slate-600">{school.address || "No address"}</p>
            <p className="text-sm text-slate-600">{school.phone || "No phone"}</p>
            <p className="text-xs text-slate-500">
              Manager:{" "}
              <span className="font-medium text-slate-700">
                {school.owner?.name || "Unknown"}
              </span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => onDelete(school.id)}
              className="px-3 py-1.5 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
            >
              Delete
            </button>
            <button
              onClick={handleEditClick}
              className="px-3 py-1.5 text-sm rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 transition"
            >
              Edit
            </button>
            <button
              onClick={handleAssignClick}
              className="px-3 py-1.5 text-sm rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition"
            >
              Assign User
            </button>
          </div>

          {/* Assign Modal */}
          {showAssignModal && (
            <AssignUserModal
              school={school}
              onClose={handleCloseModal}
              onSuccess={onAssignSuccess}
            />
          )}
        </>
      )}
    </div>
  );
}
