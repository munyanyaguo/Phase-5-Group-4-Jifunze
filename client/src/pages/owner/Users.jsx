import React, { useState } from "react";
import { motion } from "framer-motion";
import { User, Shield, School } from "lucide-react";

export default function Users() {
  const initialUsers = [
    { id: 1, name: "Alice Johnson", role: "Educator", school: "DeKUT" },
    { id: 2, name: "Brian Otieno", role: "Student", school: "DeKUT" },
    { id: 3, name: "Clara Njeri", role: "Student", school: "Kisumu High" },
    { id: 4, name: "David Mwangi", role: "Educator", school: "Kisumu High" },
  ];

  const [users, setUsers] = useState(initialUsers);
  const [filterSchool, setFilterSchool] = useState("All");

  const schools = ["All", ...new Set(users.map((u) => u.school))];

  // Update role handler
  const handleRoleChange = (id, newRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, role: newRole } : u))
    );
  };

  // Filter users by school
  const filteredUsers =
    filterSchool === "All"
      ? users
      : users.filter((u) => u.school === filterSchool);

  return (
    <motion.div
      className="p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Page Title */}
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <User className="w-6 h-6 text-blue-600" />
        User Management
      </h1>

      {/* School Filter */}
      <div className="mb-4 flex gap-2 items-center">
        <label className="text-sm font-medium text-gray-600">Filter by School:</label>
        <select
          className="border rounded-lg px-3 py-1 text-sm"
          value={filterSchool}
          onChange={(e) => setFilterSchool(e.target.value)}
        >
          {schools.map((school) => (
            <option key={school}>{school}</option>
          ))}
        </select>
      </div>

      {/* User Table */}
      <div className="overflow-x-auto bg-white shadow rounded-2xl">
        <table className="w-full text-left">
          <thead className="bg-gray-100 text-gray-600 text-sm">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">School</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <motion.tr
                key={user.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border-b hover:bg-gray-50 transition"
              >
                {/* Name */}
                <td className="px-4 py-3 font-medium text-gray-800">
                  {user.name}
                </td>

                {/* Role Badge */}
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === "Student"
                        ? "bg-green-100 text-green-700"
                        : user.role === "Educator"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    <Shield className="w-3 h-3" />
                    {user.role}
                  </span>
                </td>

                {/* School */}
                <td className="px-4 py-3 flex items-center gap-2 text-gray-700">
                  <School className="w-4 h-4 text-gray-400" />
                  {user.school}
                </td>

                {/* Action - Role Assignment */}
                <td className="px-4 py-3">
                  <select
                    className="border rounded-lg px-2 py-1 text-sm"
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  >
                    <option>Student</option>
                    <option>Educator</option>
                    <option>Admin</option>
                  </select>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
