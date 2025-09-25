// src/layouts/StudentLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/student/Sidebar";
import Navbar from "../components/student/Navbar";

export default function StudentLayout() {
  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="p-6 max-h-screen overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
