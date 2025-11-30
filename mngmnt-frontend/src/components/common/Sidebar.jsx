import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "./Sidebar.css";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Get user initials for avatar
  const getInitials = () => {
    if (!user) return "?";
    const first = user.firstName?.[0] || "";
    const last = user.lastName?.[0] || "";
    return (first + last).toUpperCase() || "?";
  };

  // Logout and redirect to login
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Check admin role
  const isAdmin = user?.role === "admin";

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <img src="/hubly-logo.png" alt="Hubly" />
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <img src="/dashboard.svg" alt="" />
          <span className="sidebar-label">Dashboard</span>
        </NavLink>

        <NavLink
          to="/contact-center"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <img src="/contactCenter.svg" alt="" />
          <span className="sidebar-label">Contact Center</span>
        </NavLink>

        <NavLink
          to="/analytics"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <img src="/analytics.svg" alt="" />
          <span className="sidebar-label">Analytics</span>
        </NavLink>

        {/* Admin Only - Chatbot Settings */}
        {isAdmin && (
          <NavLink
            to="/chatbot-settings"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <img src="/chatbot.svg" alt="" />
            <span className="sidebar-label">Chat bot</span>
          </NavLink>
        )}

        <NavLink
          to="/team"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <span className="sidebar-label">Team</span>
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <img src="/settings.svg" alt="" />
          <span className="sidebar-label">Setting</span>
        </NavLink>
      </nav>

      {/* Footer - User Avatar / Logout */}
      <div className="sidebar-footer">
        <button className="sidebar-user" onClick={handleLogout} title="Logout">
          <div className="sidebar-avatar">{getInitials()}</div>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;