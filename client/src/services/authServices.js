// src/services/authServices.js

// 🔹 Mock users (acting like a fake DB)
const users = {
  "owner@example.com": { role: "owner", password: "1234", name: "Owner Admin" },
  "educator@example.com": { role: "educator", password: "1234", name: "Educator Jane" },
  "student@example.com": { role: "student", password: "1234", name: "Student John" },
};

export const login = async (email, password) => {
  const user = users[email];

  if (user && user.password === password) {
    const fakeToken = `fake-jwt-${user.role}`;
    localStorage.setItem("token", fakeToken);
    localStorage.setItem("role", user.role);
    localStorage.setItem("email", email);
    localStorage.setItem("name", user.name);
    return { role: user.role, token: fakeToken, email, name: user.name };
  }

  throw new Error("Invalid credentials");
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("email");
  localStorage.removeItem("name");
};

export const getRole = () => {
  return localStorage.getItem("role");
};

export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

// 🔹 New: get current user info
export const getCurrentUser = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  return {
    token,
    role: localStorage.getItem("role"),
    email: localStorage.getItem("email"),
    name: localStorage.getItem("name"),
  };
};

// 🔹 Mock forgot-password (normally sends email)
export const forgotPassword = async (email) => {
  if (!users[email]) {
    throw new Error("Email not found");
  }

  return { message: "Reset link sent to email", token: "fake-reset-token" };
};

// 🔹 Mock reset-password
export const resetPassword = async (token, newPassword) => {
  if (token !== "fake-reset-token") {
    throw new Error("Invalid or expired reset token");
  }

  Object.keys(users).forEach((email) => {
    users[email].password = newPassword;
  });

  return { message: "Password reset successful" };
};
