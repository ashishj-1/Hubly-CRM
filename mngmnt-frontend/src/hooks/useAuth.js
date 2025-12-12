import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export const useAuth = () => {
  // Access auth context
  const authContext = useContext(AuthContext);

  // Ensure hook is used inside provider
  if (authContext === undefined || authContext === null) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return authContext;
};