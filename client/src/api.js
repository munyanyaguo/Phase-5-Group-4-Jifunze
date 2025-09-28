// src/services/api.js
const API_URL = "http://127.0.0.1:5000/api";

// ✅ Helper: get token
function getToken() {
  return localStorage.getItem("token");
}

// ✅ Helper: handle API responses consistently
async function handleResponse(res) {
  let data;
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  // Return nested `data` if present, else the raw response
  return data.data ?? data;
}

// --------------------
// SCHOOL API
// --------------------

// 🔹 Fetch all schools for the logged-in manager
export async function fetchSchools() {
  const res = await fetch(`${API_URL}/schools`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
  });
  return handleResponse(res);
}

// 🔹 Create a new school
export async function createSchool(schoolData) {
  const res = await fetch(`${API_URL}/schools`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(schoolData), // { name, address, phone }
  });
  return handleResponse(res);
}

// 🔹 Get single school by ID
export async function fetchSchoolById(id) {
  const res = await fetch(`${API_URL}/schools/${id}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
  });
  return handleResponse(res);
}

// 🔹 Update school
export async function updateSchool(id, updates) {
  const res = await fetch(`${API_URL}/schools/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(updates),
  });
  return handleResponse(res);
}

// 🔹 Delete school
export async function deleteSchool(id) {
  const res = await fetch(`${API_URL}/schools/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
  });
  return handleResponse(res);
}


export async function apiAssignUser(schoolId, role, payload) {
  const token = getToken();
  const res = await fetch(`${API_URL}/schools/${schoolId}/assign/${role}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(res);
}

export async function fetchEducators() {
  const res = await fetch(`${API_URL}/users?role=educator`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
  });
  return handleResponse(res); // returns { users: [...] }
}

// Fetch only educators in the schools owned by the current manager
export async function fetchManagerEducators() {
  const res = await fetch(`${API_URL}/manager/educators`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
  });
  return handleResponse(res); // returns { educators: [...] }
}




// --------------------
// DASHBOARD API
// --------------------
export async function fetchDashboard() {
  const res = await fetch(`${API_URL}/schools/dashboard`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
  });
  return handleResponse(res);
}

// ✅ Export grouped service
export default {
  fetchSchools,
  createSchool,
  fetchSchoolById,
  updateSchool,
  deleteSchool,
  fetchDashboard,
};
