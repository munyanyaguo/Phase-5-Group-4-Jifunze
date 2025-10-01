const API_URL = "http://127.0.0.1:5000/api";

// 🔹 Register
export async function register({ name, email, password, role, school_id }) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, role, school_id }),
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Registration failed");
  return result.data;
}

// 🔹 Login
export async function login(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Login failed");

  // Debug: log the login response structure
  console.log("Login response:", result);

  const data = result.data;
  if (data && data.user) {
    console.log("User object:", data.user);
    console.log("User ID:", data.user.id);
  } else {
    console.warn("No user object in login response!");
  }

  // Save tokens + user info in localStorage
  localStorage.setItem("token", data.access_token);
  localStorage.setItem("refresh_token", data.refresh_token);
  localStorage.setItem("role", data.user && data.user.role);
  localStorage.setItem("user", JSON.stringify(data.user));
  if (data.user && data.user.id) {
    localStorage.setItem("user_id", data.user.id);
  } else {
    localStorage.removeItem("user_id");
  }

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

// 🔹 Request Password Reset
export async function resetPasswordRequest(email) {
  const res = await fetch(`${API_URL}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Password reset request failed");
  return result.data;
}

// 🔹 Confirm Password Reset
export async function resetPasswordConfirm(token, new_password) {
  const res = await fetch(`${API_URL}/auth/reset-password`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, new_password }),
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Password reset failed");
  return result.data;
}

// 🔹 Get current user
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

// 🔹 Update current user's profile
export async function updateCurrentUser(updates) {
  return authFetchWithRefresh("/users/me", {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

// 🔹 Change current user's password
export async function changePassword(current_password, new_password) {
  return authFetchWithRefresh("/users/password", {
    method: "PUT",
    body: JSON.stringify({ current_password, new_password }),
  });
}
