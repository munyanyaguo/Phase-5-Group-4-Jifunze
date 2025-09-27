
const BASE_URL = "http://localhost:5000";

// Helper for authenticated requests
export async function authFetch(url, options = {}) {
  const token = localStorage.getItem("token");
  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  return fetch(url, { ...options, headers });
}


export async function fetchSchools() {
  const res = await fetch(`${BASE_URL}/schools`);
  return res.json();
}


// Use authFetch for protected endpoint
export async function fetchCourses() {
  const res = await authFetch(`${BASE_URL}/courses`);
  return res.json();
}


export async function fetchHealth() {
  const res = await fetch(`${BASE_URL}/health`);
  return res.json();
}

