import { Routes, Route } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Dashboard from "../pages/SchoolOwner/Dashboard";

export default function OwnerLayout() {
  const dummyCourses = [
    { id: 1, title: "Math", educator: "Mr. Otieno" },
    { id: 2, title: "Physics", educator: "Ms. Achieng" },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar role="owner" />
      <div className="flex-1 flex flex-col">
        {/* ✅ Pass courses here */}
        <Navbar courses={dummyCourses} />
        <main className="p-6 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
