// src/services/authServices.js

const API_URL = "http://127.0.0.1:5000/api";

// 🔹 Helper: Get stored token
export function getToken() {
  return localStorage.getItem("token");
}

// 🔹 Helper: Handle API responses safely
async function handleResponse(res) {
  let result;
  try {
    result = await res.json();
  } catch {
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
export async function register({ name, email, password, role }) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, role }),
  });
  return handleResponse(res);
}

// 🔹 Login
export async function login(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await handleResponse(res);

  // Debug: log the login response structure
  

  if (data && data.user) {
    
  } else {
    
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
  const token = getToken();
  if (token) {
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {}); // ignore errors
  }
  localStorage.clear();
}

// 🔹 Request Password Reset
export async function resetPasswordRequest(email) {
  const res = await fetch(`${API_URL}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return handleResponse(res);
}

// 🔹 Confirm Password Reset
export async function resetPasswordConfirm(token, new_password) {
  const res = await fetch(`${API_URL}/auth/reset-password`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, new_password }),
  });
  return handleResponse(res);
}

// 🔹 Get current user
export async function getCurrentUser() {
  const token = getToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return await handleResponse(res);
  } catch (err) {
    console.error("getCurrentUser error:", err.message);
    return null;
  }
}

// 🔹 Role helper
export function getRole() {
  return localStorage.getItem("role");
}

// 🔹 Auth check
export function isAuthenticated() {
  return !!getToken();
}

// 🔹 Authenticated fetch with Bearer token
export async function authFetchWithRefresh(url, options = {}) {
  const token = getToken();

  const headers = {
    ...(options.headers || {}),
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${url}`, { ...options, headers });

  if (res.status === 401) {
    // Optional: try refresh flow later
    localStorage.clear();
    throw new Error("Session expired, please log in again.");
  }

  return handleResponse(res);
}
