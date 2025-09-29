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

  return data.data ?? data;
}

// --------------------
// SCHOOL API
// --------------------
export async function fetchSchools() {
  const res = await fetch(`${API_URL}/schools`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
  });
  return handleResponse(res);
}

export async function createSchool(schoolData) {
  const res = await fetch(`${API_URL}/schools`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(schoolData),
  });
  return handleResponse(res);
}

export async function fetchSchoolById(id) {
  const res = await fetch(`${API_URL}/schools/${id}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
  });
  return handleResponse(res);
}

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

// --------------------
// SCHOOL STATS
// --------------------
export async function fetchSchoolStats(schoolId) {
  const res = await fetch(`${API_URL}/schools/${schoolId}/stats`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
  });
  return handleResponse(res);
}

// --------------------
// SCHOOL USERS
// --------------------
export async function fetchSchoolUsers(schoolId, { page = 1, per_page = 20, role, search } = {}) {
  const params = new URLSearchParams({ page, per_page });
  if (role) params.append("role", role);
  if (search) params.append("search", search);

  const res = await fetch(`${API_URL}/schools/${schoolId}/users?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
  });
  return handleResponse(res);
}

// --------------------
// SCHOOL COURSES
// --------------------
export async function fetchSchoolCourses(schoolId, { educator_id, search } = {}) {
  const params = new URLSearchParams();
  if (educator_id) params.append("educator_id", educator_id);
  if (search) params.append("search", search);

  const res = await fetch(`${API_URL}/schools/${schoolId}/courses?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
  });
  return handleResponse(res);
}

// --------------------
// DASHBOARD API
// --------------------
export async function fetchDashboard(schoolId) {
  const url = schoolId ? `${API_URL}/schools/${schoolId}/dashboard` : `${API_URL}/schools/dashboard`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
  });
  return handleResponse(res);
}

// --------------------
// ASSIGN USER
// --------------------
export async function apiAssignUser(schoolId, role, payload) {
  const res = await fetch(`${API_URL}/schools/${schoolId}/assign/${role}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

// --------------------
// EDUCATORS / STUDENTS
// --------------------
export async function fetchEducators() {
  const res = await fetch(`${API_URL}/users?role=educator`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
  });
  return handleResponse(res);
}

export async function fetchManagerEducators() {
  const res = await fetch(`${API_URL}/manager/educators`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
  });
  return handleResponse(res);
}

export async function fetchOwnerStudents() {
  const res = await fetch(`${API_URL}/manager/students`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
  });
  return handleResponse(res);
}

// CRUD for students
export async function createStudent(studentData) {
  const res = await fetch(`${API_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(studentData),
  });
  return handleResponse(res);
}

export async function fetchStudentById(id) {
  const res = await fetch(`${API_URL}/users/${id}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
  });
  return handleResponse(res);
}

export async function updateStudent(id, updates) {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(updates),
  });
  return handleResponse(res);
}

export async function deleteUser(id) {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
  });
  return handleResponse(res);
}

export async function fetchOwnerUsers() {
  const res = await fetch(`${API_URL}/manager/users`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
  });
  return handleResponse(res);
}

export async function updateUser(id, updates) {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(updates),
  });
  return handleResponse(res);
}

// --------------------
// Export grouped service
// --------------------
export default {
  fetchSchools,
  createSchool,
  fetchSchoolById,
  updateSchool,
  deleteSchool,
  fetchSchoolStats,
  fetchSchoolUsers,
  fetchSchoolCourses,
  fetchDashboard,
  apiAssignUser,
  fetchEducators,
  fetchManagerEducators,
  fetchOwnerStudents,
  fetchOwnerUsers,   
  createStudent,
  fetchStudentById,
  updateStudent,
  deleteUser,
  updateUser,
};
