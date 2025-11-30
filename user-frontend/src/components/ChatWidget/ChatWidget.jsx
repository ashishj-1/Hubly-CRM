import React, { useState, useEffect } from "react";
import axios from "axios";
import ChatPopup from "./ChatPopup";
import "./ChatWidget.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Chat widget container and logic
const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Default fallback settings
  const [settings, setSettings] = useState({
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
  });

  // Fetch settings + show welcome popup
  useEffect(() => {
    fetchSettings();

    const timer = setTimeout(() => {
      if (!isOpen) setShowWelcome(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Get chatbot settings from backend
  const fetchSettings = async () => {
    try {
      const apiUrl =
        import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${apiUrl}/settings/chatbot`);
      const data = await res.json();

      if (data.success && data.settings) {
        setSettings(data.settings);
      }
    } catch (err) {
      console.error("Failed to fetch chatbot settings:", err);
    }
  };

  // Open/close widget
  const handleToggle = () => {
    setIsOpen(!isOpen);
    setShowWelcome(false);
  };

  // Close welcome popup
  const handleCloseWelcome = (e) => {
    e.stopPropagation();
    setShowWelcome(false);
  };

  // Mark form as submitted
  const handleFormSubmit = () => {
    setFormSubmitted(true);
  };

  // Close chat popup
  const handleClosePopup = () => {
    setIsOpen(false);
  };

  return (
    <div className="chat-widget">
      {/* Welcome popup */}
      {showWelcome && !isOpen && (
        <div className="chat-welcome-popup">
          <button className="chat-welcome-close" onClick={handleCloseWelcome}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <div className="chat-welcome-avatar">
            <img
              src="/robot-avatar.png"
              alt="Hubly Bot"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>

          <p className="chat-welcome-text">{settings.welcomeMessage}</p>
        </div>
      )}

      {/* Chat popup */}
      {isOpen && (
        <ChatPopup
          settings={settings}
          onClose={handleClosePopup}
          formSubmitted={formSubmitted}
          onFormSubmit={handleFormSubmit}
        />
      )}

      {/* Main toggle button */}
      <button
        className="chat-widget-button"
        onClick={handleToggle}
        style={{ backgroundColor: settings.headerColor || "#334755" }}
        type="button"
      >
        {isOpen ? (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <img src="/msg-icon.svg" />
        )}
      </button>
    </div>
  );
};

export default ChatWidget;