import React, { useEffect, useState } from "react";
import { getCurrentUser } from "../../services/authServices";

export default function OwnerProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const me = await getCurrentUser();
        if (mounted) setUser(me?.user || me || null);
      } catch (e) {
        if (mounted) setError(e.message || "Failed to load profile");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="p-6">Loading profile...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-2xl font-bold mb-4">My Profile</h1>
      <div className="space-y-3">
        <div>
          <div className="text-sm text-gray-500">Name</div>
          <div className="text-lg">{user?.name}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Email</div>
          <div className="text-lg">{user?.email}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Role</div>
          <div className="text-lg capitalize">{user?.role}</div>
        </div>
      </div>
    </div>
  );
}
