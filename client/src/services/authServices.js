import { API_URL as BASE_URL } from '../config';

const API_URL = `${BASE_URL}/api`;

// 🔹 Helper: Get stored token
export function getToken() {
  return localStorage.getItem("token");
}

// 🔹 Helper: Handle API responses safely
export async function handleResponse(res) {
  let result;
  try {
    result = await res.json();
  } catch (err) {
    console.error('Failed to parse response:', err);
    throw new Error("Invalid server response");
  }

  if (!res.ok) {
    // Combine main message + validation errors if present
    let errorMsg = result.message || "Request failed";
    if (result.errors) {
      errorMsg += " - " + JSON.stringify(result.errors);
    }
    throw new Error(errorMsg);
  }

  return result.data || result;
}

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

  const data = result.data;
  
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

// 🔹 Helper: Authenticated fetch
export async function authFetch(endpoint, options = {}) {
  const token = getToken();
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  return handleResponse(res);
}

// 🔹 Update current user's profile
export async function updateCurrentUser(updates) {
  return authFetch("/users/me", {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

// 🔹 Change current user's password
export async function changePassword(current_password, new_password) {
  return authFetch("/users/password", {
    method: "PUT",
    body: JSON.stringify({ current_password, new_password }),
  });
}
