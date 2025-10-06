import { API_URL as BASE_URL } from "./config";

const API_URL = `${BASE_URL}/api`;

// --------------------
// Helpers
// --------------------
function getToken() {
  return localStorage.getItem("token");
}

async function handleResponse(res) {
  let data;
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    const message =
      data.message ||
      (data.errors && JSON.stringify(data.errors)) ||
      "Something went wrong";

    // Handle expired token
    if (
      message.toLowerCase().includes("signature has expired") ||
      message.toLowerCase().includes("token has expired")
    ) {
      localStorage.removeItem("token");
      window.location.href = "/login"; // or your login route
    }

    throw new Error(message);
  }

  return data;
}

console.log("Resolved API_URL:", API_URL);
console.log("VITE_API_URL =", import.meta.env.VITE_API_URL);



// Common fetch with auth
async function fetchWithAuth(url, options = {}) {
  try {
    let token = getToken();
    // Remove invalid tokens
    if (!token || token === "null" || token === "undefined") {
      localStorage.removeItem("token");
      token = null;
    }
    options.headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    };

    const res = await fetch(url, options);
    return await handleResponse(res);
  } catch (error) {
    console.error("❌ Fetch failed:", error.message);
    throw error;
  }
}

// --------------------
// SCHOOL API
// --------------------
export const fetchSchools = async () => {
  const response = await fetchWithAuth(`${API_URL}/schools`);
  return response.data || response || [];
};

export const createSchool = (schoolData) =>
  fetchWithAuth(`${API_URL}/schools`, {
    method: "POST",
    body: JSON.stringify(schoolData),
  });

export const fetchSchoolById = (id) =>
  fetchWithAuth(`${API_URL}/schools/${id}`) || {};

export const updateSchool = (id, updates) =>
  fetchWithAuth(`${API_URL}/schools/${id}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });

export const deleteSchool = (id) =>
  fetchWithAuth(`${API_URL}/schools/${id}`, { method: "DELETE" });

// --------------------
// SCHOOL STATS & USERS
// --------------------
export const fetchSchoolStats = async (schoolId) => {
  const response = await fetchWithAuth(`${API_URL}/schools/${schoolId}/stats`);
  return response.data || response || {};
};

export const fetchSchoolUsers = async (
  schoolId,
  { page = 1, per_page = 20, role, search } = {}
) => {
  const params = new URLSearchParams({ page, per_page });
  if (role) params.append("role", role);
  if (search) params.append("search", search);
  const response = await fetchWithAuth(
    `${API_URL}/schools/${schoolId}/users?${params.toString()}`
  );
  return response.data || response || [];
};

// --------------------
// SCHOOL COURSES
// --------------------
export const fetchSchoolCourses = async (
  schoolId,
  { educator_id, search } = {}
) => {
  const params = new URLSearchParams();
  if (educator_id) params.append("educator_id", educator_id);
  if (search) params.append("search", search);
  const response = await fetchWithAuth(
    `${API_URL}/schools/${schoolId}/courses?${params.toString()}`
  );
  return response.data || response || [];
};

// --------------------
// DASHBOARD
// --------------------
export const fetchDashboard = async (schoolId) => {
  const url = schoolId
    ? `${API_URL}/schools/${schoolId}/dashboard`
    : `${API_URL}/schools/dashboard`;
  const response = await fetchWithAuth(url);
  return response.data || response || {};
};

// --------------------
// ASSIGN USER
// --------------------
export const apiAssignUser = (schoolId, role, email) =>
  fetchWithAuth(`${API_URL}/schools/${schoolId}/assign/${role}`, {
    method: "POST",
    body: JSON.stringify({ email }),
  });

// --------------------
// VALIDATE USER EMAIL
// --------------------
export const validateUserEmail = async (email, role) => {
  const response = await fetchWithAuth(`${API_URL}/users/validate-email`, {
    method: "POST",
    body: JSON.stringify({ email, role }),
  });
  return response; // { valid: true/false, user_id?, role?, message? }
};


// --------------------
// EDUCATORS / STUDENTS
// --------------------
export const fetchEducators = async () => {
  const response = await fetchWithAuth(`${API_URL}/users?role=educator`);
  return response.data || response || [];
};

export const fetchManagerEducators = async () => {
  const response = await fetchWithAuth(`${API_URL}/manager/educators`);
  return response.data || response || [];
};

export const fetchOwnerStudents = async () => {
  const response = await fetchWithAuth(`${API_URL}/manager/students`);
  return response.data || response || [];
};

// ✅ Fixed this function
export async function fetchOwnerSchools() {
  const response = await fetchWithAuth(`${API_URL}/schools`);
  return response.data || response || [];
}

// --------------------
// STUDENT CRUD
// --------------------
export const createStudent = (studentData) => {
  return fetchWithAuth(`${API_URL}/users`, {
    method: "POST",
    body: JSON.stringify({ ...studentData, role: "student" }),
  });
};

export const fetchStudentById = (id) =>
  fetchWithAuth(`${API_URL}/users/${id}`) || {};

export const updateStudent = (id, updates) =>
  fetchWithAuth(`${API_URL}/users/${id}`, {
    method: "PUT",
    body: JSON.stringify({ ...updates, role: "student" }),
  });

export const deleteUser = (id) =>
  fetchWithAuth(`${API_URL}/users/${id}`, { method: "DELETE" });

export const fetchOwnerUsers = async () => {
  const response = await fetchWithAuth(`${API_URL}/manager/users`);
  return response.data || response || [];
};

export const updateUser = (id, updates) =>
  fetchWithAuth(`${API_URL}/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });

// --------------------
// COURSES CRUD
// --------------------
export const fetchCourses = async ({
  school_id,
  educator_id,
  search,
  page = 1,
  per_page = 20,
} = {}) => {
  const params = new URLSearchParams({ page, per_page });
  if (school_id) params.append("school_id", school_id);
  if (educator_id) params.append("educator_id", educator_id);
  if (search) params.append("search", search);
  const response = await fetchWithAuth(
    `${API_URL}/courses?${params.toString()}`
  );
  return response.data || response || [];
};

export const createCourse = (courseData) =>
  fetchWithAuth(`${API_URL}/courses`, {
    method: "POST",
    body: JSON.stringify(courseData),
  });

export const updateCourse = (course_id, updates) =>
  fetchWithAuth(`${API_URL}/courses/${course_id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });

export const deleteCourse = (course_id) =>
  fetchWithAuth(`${API_URL}/courses/${course_id}`, { method: "DELETE" });

// --------------------
// ENROLLMENTS
// --------------------
export const fetchEnrollments = async () => {
  const response = await fetchWithAuth(`${API_URL}/enrollments`);
  return response.data || response || [];
};

export const fetchSchoolEnrollments = async (schoolId) => {
  const response = await fetchWithAuth(
    `${API_URL}/schools/${schoolId}/enrollments`
  );
  return response.data || response || [];
};

export const createEnrollment = (payload) =>
  fetchWithAuth(`${API_URL}/enrollments`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const deleteEnrollment = (enrollmentId) =>
  fetchWithAuth(`${API_URL}/enrollments/${enrollmentId}`, { method: "DELETE" });

// --------------------
// NOTIFICATIONS
// --------------------
export const fetchNotifications = async (unreadOnly = false) => {
  const params = unreadOnly ? "?unread_only=true" : "";
  const response = await fetchWithAuth(`${API_URL}/notifications${params}`);
  return response.data || response || { notifications: [], unread_count: 0 };
};

export const markNotificationAsRead = (notificationId) =>
  fetchWithAuth(`${API_URL}/notifications/${notificationId}`, {
    method: "PATCH",
  });

export const deleteNotification = (notificationId) =>
  fetchWithAuth(`${API_URL}/notifications/${notificationId}`, {
    method: "DELETE",
  });

export const markAllNotificationsAsRead = () =>
  fetchWithAuth(`${API_URL}/notifications/mark-all-read`, { method: "POST" });

// --------------------
// EXPORT ALL SERVICES
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
  fetchCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  fetchEnrollments,
  fetchSchoolEnrollments,
  createEnrollment,
  deleteEnrollment,
};
