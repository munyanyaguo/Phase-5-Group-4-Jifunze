// src/pages/manager/Users.jsx
import React, { useState, useEffect } from "react";
import { User, Shield, School, Eye, Trash2 } from "lucide-react";
import { fetchOwnerUsers, deleteUser } from "../../api";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [filterSchool, setFilterSchool] = useState("All");
  const [filterRole, setFilterRole] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Fetch users from API
  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetchOwnerUsers(); // { users: [...] }
      setUsers(res.users || []);
    } catch (err) {
      console.error("Failed to load users:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Delete user
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      alert("Failed to delete: " + err.message);
    }
  };

  // Schools for filter dropdown
  const schools = ["All", ...new Set(users.map((u) => u.school?.name || "Unknown"))];

  // Apply filters & search
  const filteredUsers = users.filter((u) => {
    const matchesSchool =
      filterSchool === "All" || u.school?.name === filterSchool;

    const matchesRole =
      filterRole === "All" ||
      u.role?.toLowerCase() === filterRole.toLowerCase();

    const matchesSearch = u.name
      ?.toLowerCase()
      .includes(search.toLowerCase());

    return matchesSchool && matchesRole && matchesSearch;
  });

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

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        {/* Search */}
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm flex-1"
        />

        {/* School Filter */}
        <select
          className="border rounded-lg px-3 py-2 text-sm"
          value={filterSchool}
          onChange={(e) => setFilterSchool(e.target.value)}
        >
          {schools.map((school) => (
            <option key={school}>{school}</option>
          ))}
        </select>

        {/* Role Filter (Student & Educator only) */}
        <select
          className="border rounded-lg px-3 py-2 text-sm"
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
        >
          <option>All</option>
          <option>Student</option>
          <option>Educator</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow rounded-2xl">
        {loading ? (
          <p className="p-4 text-gray-500">Loading users...</p>
        ) : filteredUsers.length === 0 ? (
          <p className="p-4 text-gray-500">No users found.</p>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-100 text-gray-600 text-sm">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">School</th>
                <th className="px-4 py-3">Actions</th>
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
                        user.role?.toLowerCase() === "student"
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      <Shield className="w-3 h-3" />
                      {user.role}
                    </span>
                  </td>

                  {/* School */}
                  <td className="px-4 py-3 flex items-center gap-2 text-gray-700">
                    <School className="w-4 h-4 text-gray-400" />
                    {user.school?.name || "N/A"}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 flex gap-3">
                    {/* View */}
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <Eye className="w-5 h-5" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">User Details</h3>
            <p><strong>Name:</strong> {selectedUser.name}</p>
            <p><strong>Email:</strong> {selectedUser.email}</p>
            <p><strong>Role:</strong> {selectedUser.role}</p>
            <p><strong>School:</strong> {selectedUser.school?.name || "N/A"}</p>
            <p><strong>Joined:</strong> {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : "N/A"}</p>

            <button
              onClick={() => setSelectedUser(null)}
              className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
