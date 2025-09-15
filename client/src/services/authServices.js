// src/services/authServices.js
export const login = async (email, password) => {
  // 🔹 TODO: Replace with backend API call
  let user = null;

  if (email === "owner@example.com" && password === "1234") {
    user = { role: "owner", token: "fake-jwt-owner" };
  } else if (email === "educator@example.com" && password === "1234") {
    user = { role: "educator", token: "fake-jwt-educator" };
  } else if (email === "student@example.com" && password === "1234") {
    user = { role: "student", token: "fake-jwt-student" };
  } else {
    throw new Error("Invalid credentials");
  }

  // store credentials in localStorage
  localStorage.setItem("token", user.token);
  localStorage.setItem("role", user.role);
  return user;
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
