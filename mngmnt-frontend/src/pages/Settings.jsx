import React, { useState, useEffect } from "react";
import Sidebar from "../components/common/Sidebar";
import Loader from "../components/common/Loader";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Settings.css";

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Active tab state (profile / chatbot)
  const [activeTab, setActiveTab] = useState("profile");

  // Loading & saving states
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Error message
  const [error, setError] = useState("");

  // Profile form fields
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Chatbot settings object
  const [chatbotSettings, setChatbotSettings] = useState({
    headerColor: "#334755",
    backgroundColor: "#EEEEEE",
    customMessages: {
      message1: "How can I help you?",
      message2: "Ask me anything!",
    },
    introductionForm: {
      nameLabel: "Your name",
      namePlaceholder: "Your name",
      phoneLabel: "Your Phone",
      phonePlaceholder: "+1 (000) 000-0000",
      emailLabel: "Your Email",
      emailPlaceholder: "example@gmail.com",
    },
    welcomeMessage:
      "👋 Want to chat about Hubly? I'm an chatbot here to help you find your way.",
    missedChatTimer: { hours: 0, minutes: 10, seconds: 0 },
  });

  // Load user profile + chatbot settings on page load
  useEffect(() => {
    if (user) {
      setProfileData((prev) => ({
        ...prev,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
      }));
    }

    fetchChatbotSettings();
  }, [user]);

  // Fetch chatbot settings from API
  const fetchChatbotSettings = async () => {
    try {
      const res = await api.get("/settings/chatbot");
      if (res.data.success) {
        setChatbotSettings(res.data.settings);
      }
    } catch (err) {
      console.error("Failed to fetch chatbot settings:", err);
    }
  };

  // Handle profile input change
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  // Save updated profile
  const handleProfileSave = async () => {
    setError("");

    // Validate name
    if (!profileData.firstName.trim() || !profileData.lastName.trim()) {
      setError("First name and last name are required");
      return;
    }

    // Check if password is being updated
    const isChangingPassword =
      profileData.password || profileData.confirmPassword;

    // Validate password fields
    if (isChangingPassword) {
      if (!profileData.password) {
        setError("Please provide new password");
        return;
      }
      if (profileData.password.length < 6) {
        setError("New password must be at least 6 characters");
        return;
      }
      if (profileData.password !== profileData.confirmPassword) {
        setError("New passwords do not match");
        return;
      }
    }

    setSaving(true);

    try {
      // Update name
      await api.put("/auth/profile", {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
      });

      // If password is updated
      if (isChangingPassword) {
        await api.put("/auth/change-password", {
          newPassword: profileData.password,
        });

        alert(
          "Password changed successfully. You will be logged out and redirected to login page."
        );

        logout();
        navigate("/login");
        return;
      }

      // Only profile updated
      alert("Profile updated successfully");
      setProfileData((prev) => ({
        ...prev,
        password: "",
        confirmPassword: "",
      }));
    } catch (err) {
      console.error("Failed to update profile:", err);
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  // Handle chatbot settings update
  const handleChatbotChange = (field, value) => {
    setChatbotSettings((prev) => {
      // Support nested fields using dot notation
      if (field.includes(".")) {
        const [parent, child] = field.split(".");
        return {
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value,
          },
        };
      }
      return { ...prev, [field]: value };
    });
  };

  // Save chatbot settings
  const handleChatbotSave = async () => {
    setSaving(true);

    try {
      const res = await api.put("/settings/chatbot", chatbotSettings);
      if (res.data.success) {
        alert("Chatbot settings saved successfully");
      }
    } catch (err) {
      console.error("Failed to save chatbot settings:", err);
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  // Pre-made colors
  const colorOptions = ["#FFFFFF", "#334755", "#4A90A4", "#EEEEEE"];

  const isAdmin = user?.role === "admin";

  return (
    <div className="settings-layout">
      {/* Left sidebar */}
      <Sidebar />

      <div className="settings-content">
        {/* Page Header */}
        <div className="settings-header">
          <h1>{activeTab === "profile" ? "Settings" : "Chat Bot"}</h1>
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="settings-section">
            {/* Tabs (only one active) */}
            <div className="settings-tabs">
              <button
                className="settings-tab settings-tab-active"
                onClick={() => setActiveTab("profile")}
              >
                Edit Profile
              </button>
            </div>

            {/* Profile Form */}
            <div className="settings-form">
              {/* First Name */}
              <div className="settings-form-group">
                <label>First name</label>
                <input
                  type="text"
                  name="firstName"
                  value={profileData.firstName}
                  onChange={handleProfileChange}
                />
              </div>

              {/* Last Name */}
              <div className="settings-form-group">
                <label>Last name</label>
                <input
                  type="text"
                  name="lastName"
                  value={profileData.lastName}
                  onChange={handleProfileChange}
                />
              </div>

              {/* Email (disabled) */}
              <div className="settings-form-group">
                <label>Email</label>
                <div className="settings-input-with-icon">
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    disabled
                  />
                  <span
                    className="settings-info-icon"
                    title="Email cannot be changed"
                  >
                    <img src="/info.svg" alt="" />
                  </span>
                </div>
              </div>

              {/* New Password */}
              <div className="settings-form-group">
                <label>New Password</label>
                <div className="settings-input-with-icon">
                  <input
                    type="password"
                    name="password"
                    value={profileData.password}
                    onChange={handleProfileChange}
                    placeholder="Enter new password"
                  />
                  <span
                    className="settings-info-icon"
                    title="User will be logged out immediately"
                  >
                    <img src="/info.svg" alt="" />
                  </span>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="settings-form-group">
                <label>Confirm New Password</label>
                <div className="settings-input-with-icon">
                  <input
                    type="password"
                    name="confirmPassword"
                    value={profileData.confirmPassword}
                    onChange={handleProfileChange}
                    placeholder="Confirm new password"
                  />
                  <span
                    className="settings-info-icon"
                    title="User will be logged out immediately"
                  >
                    <img src="/info.svg" alt="" />
                  </span>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div
                  style={{
                    color: "#ef4444",
                    fontSize: "14px",
                    padding: "12px",
                    background: "#fef2f2",
                    borderRadius: "6px",
                    marginBottom: "16px",
                  }}
                >
                  {error}
                </div>
              )}

              {/* Save Button */}
              <div className="settings-form-actions">
                <button
                  className="settings-save-btn"
                  onClick={handleProfileSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;