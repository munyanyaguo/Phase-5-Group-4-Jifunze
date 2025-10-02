// src/services/messageService.js
import { API_URL as BASE_URL } from '../config';

const API_URL = `${BASE_URL}/api`;

const getToken = () => localStorage.getItem("token");

export async function fetchMessagesByCourse(courseId, page = 1, perPage = 50) {
  const token = getToken();
  const res = await fetch(`${API_URL}/messages?course_id=${courseId}&page=${page}&per_page=${perPage}`, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    const detail = data?.errors ? `: ${JSON.stringify(data.errors)}` : "";
    throw new Error((data.message || `Failed to fetch messages for course ${courseId}`) + detail);
  }
  return data?.data || { messages: [], meta: { total: 0 } };
}

export async function sendMessage(courseId, content, parentId) {
  const token = getToken();
  const body = { course_id: courseId, content };
  if (parentId) body.parent_id = parentId;
  const res = await fetch(`${API_URL}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    const detail = data?.errors ? `: ${JSON.stringify(data.errors)}` : "";
    throw new Error((data.message || "Failed to send message") + detail);
  }
  return data.data;
}


