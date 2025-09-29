// src/services/schoolService.js
import api from "../api";

// Fetch all schools for the logged-in owner
export const getSchools = async () => {
  const res = await api.get("/schools");
  return res.data;
};

// Create new school
export const createSchool = async (data) => {
  const res = await api.post("/schools", data);
  return res.data;
};

// Update existing school
export const updateSchool = async (id, data) => {
  const res = await api.put(`/schools/${id}`, data);
  return res.data;
};

// Delete a school
export const deleteSchool = async (id) => {
  const res = await api.delete(`/schools/${id}`);
  return res.data;
};
