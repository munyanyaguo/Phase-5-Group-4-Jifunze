// src/services/authServices.js

// 🔹 Mock users (acting like a fake DB)
const users = {
  "owner@example.com": { role: "owner", password: "1234" },
  "educator@example.com": { role: "educator", password: "1234" },
  "student@example.com": { role: "student", password: "1234" },
};

export const login = async (email, password) => {
  const user = users[email];

  if (user && user.password === password) {
    const fakeToken = `fake-jwt-${user.role}`;
    localStorage.setItem("token", fakeToken);
    localStorage.setItem("role", user.role);
    return { role: user.role, token: fakeToken };
  }

  throw new Error("Invalid credentials");
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
};

export const getRole = () => {
  return localStorage.getItem("role");
};

export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

// 🔹 Mock forgot-password (normally sends email)
export const forgotPassword = async (email) => {
  if (!users[email]) {
    throw new Error("Email not found");
  }

  // In real app → send email with token
  // For mock → return a fake token
  return { message: "Reset link sent to email", token: "fake-reset-token" };
};

// 🔹 Mock reset-password
export const resetPassword = async (token, newPassword) => {
  // In real app → verify token & update DB
  if (token !== "fake-reset-token") {
    throw new Error("Invalid or expired reset token");
  }

  // For demo → just update all users with new password
  Object.keys(users).forEach((email) => {
    users[email].password = newPassword;
  });

  return { message: "Password reset successful" };
};
