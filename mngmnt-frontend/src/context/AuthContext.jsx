import React, { createContext, useState, useEffect } from "react";
import api from "../services/api";
import * as authService from "../services/authService";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // State
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token"));

  // Fetch logged-in user profile
  const fetchProfile = async () => {
    try {
      const response = await authService.getProfile();
      const data = response.data;

      if (data.success) {
        setUser(data.user);
      } else {
        logout();
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Load profile when token exists
  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  // Login user
  const login = async (email, password) => {
    try {
      const response = await authService.login({ email, password });
      const data = response.data;

      if (data.success) {
        localStorage.setItem("token", data.token);
        api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (err) {
      console.error("Login error:", err);
      return {
        success: false,
        message:
          err.response?.data?.message || "Login failed. Please try again.",
      };
    }
  };

  // Signup user
  const signup = async (userData) => {
    try {
      const data = await authService.signup(userData);

      if (data.success) {
        localStorage.setItem("token", data.token);
        api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (err) {
      console.error("Signup error:", err);
      return {
        success: false,
        message:
          err.response?.data?.message || "Signup failed. Please try again.",
      };
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
    setToken(null);
    setUser(null);
  };

  // Update stored user
  const updateUser = (updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        updateUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;