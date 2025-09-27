// client/src/api.js
import { getToken } from "./services/authServices";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// 🔹 Generic request wrapper
async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "API Error");
  }

  return res.json();
}

/* -------- AUTH/USER -------- */
export async function getUserDashboard() {
  return request("/api/users/dashboard");
}

/* -------- SCHOOLS -------- */
export async function getMySchool() {
  return request("/api/schools/me");
}

export async function getSchools() {
  return request("/api/schools");
}

export async function createSchool(data) {
  return request("/api/schools", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateSchool(id, data) {
  return request(`/api/schools/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteSchool(id) {
  return request(`/api/schools/${id}`, {
    method: "DELETE",
  });
}

export async function getSchoolById(id) {
  return request(`/api/schools/${id}`);
}

export async function getSchoolDashboard(id) {
  return request(`/api/schools/${id}/dashboard`);
}
export async function getOwnerDashboard(school_id) {
  return request(`/api/schools/${school_id}/dashboard`);
}

/* -------- DEFAULT EXPORT -------- */
export default {
  request,
  getUserDashboard,
  getMySchool,
  getSchools,
  createSchool,
  updateSchool,
  deleteSchool,
  getSchoolById,
  getSchoolDashboard,
};
