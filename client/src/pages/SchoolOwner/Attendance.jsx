// src/pages/owner/Reports.jsx
import { BarChart3 } from "lucide-react";

export default function Reports() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <BarChart3 /> Reports & Analytics
      </h2>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Attendance Overview</h3>
        <p className="text-gray-500">📈 Chart integration coming soon...</p>
      </div>
    </div>
  );
}
