import React, { createContext, useEffect, useReducer } from "react";
import api from "../services/api";
import * as authService from "../services/authService";

export const AuthContext = createContext(null);

const TOKEN_KEY = "token";

const initialState = {
  user: null,
  loading: true,
  token: typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null,
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_TOKEN":
      return { ...state, token: action.payload };
    case "MERGE_USER":
      return { ...state, user: { ...(state.user || {}), ...action.payload } };
    case "RESET":
      return { user: null, loading: false, token: null };
    default:
      return state;
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // State
  const { user, loading, token } = state;

  // Fetch logged-in user profile
  const fetchProfile = async () => {
    try {
      const resp = await authService.getProfile();
      const payload = resp?.data;

      if (payload?.success) {
        dispatch({ type: "SET_USER", payload: payload.user });
      } else {
        logout();
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      logout();
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  // Load profile when token exists
  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      fetchProfile();
    } else {
      dispatch({ type: "SET_LOADING", payload: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Login user
  const login = async (email, password) => {
    try {
      const resp = await authService.login({ email, password });
      const payload = resp?.data;

      if (payload?.success) {
        localStorage.setItem(TOKEN_KEY, payload.token);
        api.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${payload.token}`;
        dispatch({ type: "SET_TOKEN", payload: payload.token });
        dispatch({ type: "SET_USER", payload: payload.user });
        return { success: true };
      }

      return { success: false, message: payload?.message };
    } catch (err) {
      console.error("Login error:", err);
      return {
        success: false,
        message:
          err?.response?.data?.message || "Login failed. Please try again.",
      };
    }
  };

  // Signup user
  const signup = async (userData) => {
    try {
      const resp = await authService.signup(userData);
      const payload = resp?.data ?? resp; // handle services that return data directly

      if (payload?.success) {
        localStorage.setItem(TOKEN_KEY, payload.token);
        api.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${payload.token}`;
        dispatch({ type: "SET_TOKEN", payload: payload.token });
        dispatch({ type: "SET_USER", payload: payload.user });
        return { success: true };
      }

      return { success: false, message: payload?.message };
    } catch (err) {
      console.error("Signup error:", err);
      return {
        success: false,
        message:
          err?.response?.data?.message || "Signup failed. Please try again.",
      };
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    if (api?.defaults?.headers?.common) {
      delete api.defaults.headers.common["Authorization"];
    }
    dispatch({ type: "RESET" });
  };

  // Update stored user
  const updateUser = (updatedData) => {
    dispatch({ type: "MERGE_USER", payload: updatedData });
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