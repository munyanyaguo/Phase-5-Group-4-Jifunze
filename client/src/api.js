const BASE_URL = "http://localhost:5000";

export async function fetchSchools() {
  const res = await fetch(`${BASE_URL}/schools`);
  return res.json();
}

export async function fetchCourses() {
  const res = await fetch(`${BASE_URL}/courses`);
  return res.json();
}

export async function fetchHealth() {
  const res = await fetch(`${BASE_URL}/health`);
  return res.json();
}

