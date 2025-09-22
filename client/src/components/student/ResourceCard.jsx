// src/components/student/ResourceCard.jsx
import React from "react";

export default function ResourceCard({ resource }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-semibold text-gray-800">{resource.title}</h4>
          <p className="text-sm text-gray-500 mt-1">Class: {resource.className}</p>
          <p className="text-xs text-gray-400 mt-2">Type: {resource.type.toUpperCase()}</p>
        </div>

        <div className="flex flex-col items-end">
          <a
            href={resource.url}
            target="_blank"
            rel="noreferrer"
            className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
          >
            View
          </a>
        </div>
      </div>
    </div>
  );
}
