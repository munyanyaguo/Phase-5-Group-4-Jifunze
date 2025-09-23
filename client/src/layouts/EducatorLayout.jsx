// src/layouts/EducatorLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/educator/Sidebar";
import Navbar from "../components/educator/Navbar";

export default function EducatorLayout() {
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
