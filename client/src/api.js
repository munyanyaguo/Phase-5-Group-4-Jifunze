
const BASE_URL = "http://localhost:5000";

export async function fetchDashboard() {
  const res = await authFetch(`${BASE_URL}/dashboard`);
  if (!res.ok) {
    throw new Error("Failed to fetch dashboard data");
  }
  return res.json();
}

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


// Create a new school (managers only)
export async function createSchool(schoolData) {
  const res = await authFetch(`${BASE_URL}/schools`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(schoolData),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.message || "Failed to create school");
  }

  return res.json();
}

// Update an existing school (managers only)
export async function updateSchool(schoolId, schoolData) {
  const res = await authFetch(`${BASE_URL}/schools/${schoolId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(schoolData),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.message || "Failed to update school");
  }

  return res.json();
}

// Delete a school (managers only)
export async function deleteSchool(schoolId) {
  const res = await authFetch(`${BASE_URL}/schools/${schoolId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.message || "Failed to delete school");
  }

  return res.json();
}

// Fetch students for the manager (all students in manager's schools)
export async function fetchOwnerStudents() {
  const res = await authFetch(`${BASE_URL}/manager/students`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.message || "Failed to fetch students");
  }
  return res.json();
}

// Fetch educators for the manager (all educators in manager's schools)
export async function fetchManagerEducators() {
  const res = await authFetch(`${BASE_URL}/manager/educators`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.message || "Failed to fetch educators");
  }
  return res.json();
}

// Fetch all users for the manager (all users in manager's schools)
export async function fetchOwnerUsers() {
  const res = await authFetch(`${BASE_URL}/manager/users`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.message || "Failed to fetch users");
  }
  return res.json();
}

// Create a new student
export async function createStudent(studentData) {
  const res = await authFetch(`${BASE_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...studentData, role: "student" }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.message || "Failed to create student");
  }

  return res.json();
}

// Delete a user (student, educator, etc.)
export async function deleteUser(userId) {
  const res = await authFetch(`${BASE_URL}/users/${userId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.message || "Failed to delete user");
  }

  return res.json();
}

// Assign a user (student or educator) to a school (managers only)
export async function apiAssignUser(schoolId, role, { email }) {
  const res = await authFetch(`${BASE_URL}/schools/${schoolId}/assign/${role}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    // Try to extract error message from API
    try {
      const data = await res.json();
      throw new Error(data?.message || "Failed to assign user");
    } catch (_) {
      throw new Error("Failed to assign user");
    }
  }

  return res.json();
}

