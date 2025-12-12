import api from "./api";

// Get all team members/users
export const getAllUsers = async () => {
  const res = await api.get("/users");
  return res.data;
};

// Get single user by ID
export const getUserById = async (userId) => {
  const res = await api.get(`/users/${userId}`);
  return res.data;
};

// Create new team member (Admin only)
export const createUser = async (payload) => {
  const res = await api.post("/users", payload);
  return res.data;
};

// Update user
export const updateUser = async (userId, payload) => {
  const res = await api.put(`/users/${userId}`, payload);
  return res.data;
};

// Delete user (Admin only)
export const deleteUser = async (userId) => {
  const res = await api.delete(`/users/${userId}`);
  return res.data;
};

export default {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};