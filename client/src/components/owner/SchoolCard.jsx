import React, { useState } from "react";
import AssignUserModal from "./AssignUserModal";

export default function SchoolCard({ school, onDelete, onAssignSuccess, onEdit }) {
  const [showAssignModal, setShowAssignModal] = useState(false);

  const handleAssignClick = () => setShowAssignModal(true);
  const handleCloseModal = () => setShowAssignModal(false);

  return (
    <div className="bg-white shadow-md rounded-lg p-4 flex flex-col justify-between">
      <div>
        <h2 className="text-lg font-bold">{school.name}</h2>
        <p>{school.address || "No address"}</p>
        <p>{school.phone || "No phone"}</p>
        <p className="text-sm text-gray-500">
          Manager: {school.owner?.name || "Unknown"}
        </p>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => onDelete(school.id)}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
        >
          Delete
        </button>
        <button
          onClick={() => onEdit(school)}
          className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
        >
          Edit
        </button>
        <button
          onClick={handleAssignClick}
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
        >
          Assign User
        </button>
      </div>

      {showAssignModal && (
        <AssignUserModal
          school={school}
          onClose={handleCloseModal}
          onSuccess={onAssignSuccess}
        />
      )}
    </div>
  );
}
