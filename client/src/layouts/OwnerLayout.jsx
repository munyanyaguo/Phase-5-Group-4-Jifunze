// src/layouts/OwnerLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/owner/Sidebar";
import Navbar from "../components/owner/Navbar";

export default function OwnerLayout() {
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="p-4 md:p-6 max-h-screen overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
