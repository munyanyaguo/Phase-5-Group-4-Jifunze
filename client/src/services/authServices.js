const API_URL = "http://127.0.0.1:5000/api";

// 🔹 Login
export async function login(email, password) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error("Login failed");
  }

  const result = await response.json();
  const data = result.data; // 👈 backend wraps in { message, data }

  // Save tokens + role in localStorage
  localStorage.setItem("token", data.access_token);
  localStorage.setItem("refresh_token", data.refresh_token);
  localStorage.setItem("role", data.user.role);
  localStorage.setItem("user", JSON.stringify(data.user));

  return data;
}

// 🔹 Logout
export async function logout() {
  const token = localStorage.getItem("token");
  await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  localStorage.clear();
}

// 🔹 Current User
export async function getCurrentUser() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  const res = await fetch(`${API_URL}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Failed to fetch user");
  return await res.json();
}

// 🔹 Role helper
export function getRole() {
  return localStorage.getItem("role");
}

// 🔹 Auth check
export function isAuthenticated() {
  return !!localStorage.getItem("token");
}
