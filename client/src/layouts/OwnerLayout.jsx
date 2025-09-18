// src/layouts/OwnerLayout.jsx
import { Outlet } from "react-router-dom";
import Sidebar from "../components/owner/Sidebar";
import Navbar from "../components/owner/Navbar";

export default function OwnerLayout() {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="p-6 overflow-y-auto">
          <Outlet /> {/* Renders child pages */}
        </main>
      </div>
    </div>
  );
}
