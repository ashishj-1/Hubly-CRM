import api from "./api";

const authBase = "/auth";

export const checkSignupAvailable = () => {
  return api.get(`${authBase}/signup-available`);
};

export const signup = (payload) => {
  return api.post(`${authBase}/signup`, payload);
};

export const login = (payload) => {
  return api.post(`${authBase}/login`, payload);
};

export const getProfile = () => {
  return api.get(`${authBase}/profile`);
};

export const updateProfile = (payload) => {
  return api.put(`${authBase}/profile`, payload);
};

export const changePassword = (payload) => {
  return api.put(`${authBase}/change-password`, payload);
};