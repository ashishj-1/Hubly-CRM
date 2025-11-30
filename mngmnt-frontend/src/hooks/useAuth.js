import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export const useAuth = () => {
  // Access auth context
  const context = useContext(AuthContext);

  // Ensure hook is used inside provider
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};