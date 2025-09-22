// src/components/owner/Sidebar.jsx
import { Link } from "react-router-dom";
import { Home, Users, BookOpen, BarChart3, School } from "lucide-react";

export default function Sidebar() {
  return (
    <div className="w-64 bg-white shadow-md p-4 flex flex-col">
      <h2 className="text-2xl font-bold mb-6">Jifunze</h2>
      <nav className="space-y-4">
        <Link to="/owner/dashboard" className="flex items-center gap-2 hover:text-blue-600">
          <Home size={20}/> Dashboard
        </Link>
        <Link to="/owner/schools" className="flex items-center gap-2 hover:text-blue-600">
          <School size={20}/> Schools
        </Link>
        <Link to="/owner/students" className="flex items-center gap-2 hover:text-blue-600">
          <Users size={20}/> Students
        </Link>
        <Link to="/owner/educators" className="flex items-center gap-2 hover:text-blue-600">
          <Users size={20}/> Educators
        </Link>
        <Link to="/owner/resources" className="flex items-center gap-2 hover:text-blue-600">
          <BookOpen size={20}/> Resources
        </Link>
        <Link to="/owner/attendance" className="flex items-center gap-2 hover:text-blue-600">
          <BarChart3 size={20}/> Reports
        </Link>
        
      </nav>
    </div>
  );
}
