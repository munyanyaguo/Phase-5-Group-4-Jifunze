// src/components/owner/Navbar.jsx
import { Bell, User } from "lucide-react";

export default function Navbar() {
  return (
    <header className="bg-white shadow px-6 py-3 flex justify-between items-center">
      <h1 className="text-xl font-semibold">Owner Dashboard</h1>
      <div className="flex items-center gap-4">
        <Bell className="cursor-pointer" />
        <User className="cursor-pointer" />
      </div>
    </header>
  );
}
