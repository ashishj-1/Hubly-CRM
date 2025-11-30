import React, { useState } from "react";

// API base URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Chat popup widget
const ChatPopup = ({ settings, onClose, formSubmitted, onFormSubmit }) => {
  // Form state
  const [formData, setFormData] = useState({ name: "", phone: "", email: "" });

  // Message input state
  const [message, setMessage] = useState("");

  // NEW: Track if user has sent first message
  const [userHasSentMessage, setUserHasSentMessage] = useState(false);

  // NEW: Store user's first message
  const [userFirstMessage, setUserFirstMessage] = useState("");

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(formSubmitted);
  const [error, setError] = useState("");

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  // NEW: Handle user sending first message
  const handleSendFirstMessage = () => {
    if (!message.trim()) return;

    // Save the user's message
    setUserFirstMessage(message);
    setUserHasSentMessage(true);

    // Clear input for next interaction
    setMessage("");
  };

  // Submit intro form
  const handleFormSubmit = async () => {
    if (!formData.name || !formData.phone || !formData.email) {
      setError("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: formData.name,
          userPhone: formData.phone,
          userEmail: formData.email,
          initialMessage: userFirstMessage || "New conversation started",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        onFormSubmit();
      } else {
        setError(data.message || "Something went wrong");
      }
    } catch (err) {
      setError("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Derived flags
  const isFormValid = formData.name && formData.phone && formData.email;

  const hasMessage1 =
    settings.customMessages?.message1 &&
    typeof settings.customMessages.message1 === "string" &&
    settings.customMessages.message1.trim() !== "";

  const hasMessage2 =
    settings.customMessages?.message2 &&
    typeof settings.customMessages.message2 === "string" &&
    settings.customMessages.message2.trim() !== "";

  const hasAnyMessage = hasMessage1 || hasMessage2;

  return (
    <div className="chat-popup">
      {/* Header */}
      <div
        className="chat-popup-header"
        style={{ backgroundColor: settings.headerColor }}
      >
        <div className="chat-popup-header-content">
          <img
            src="/robot-avatar.png"
            alt="Hubly"
            className="chat-popup-avatar"
          />
          <span className="chat-popup-title">Hubly</span>
          <span className="chat-popup-status"></span>
        </div>
      </div>

      {/* Body */}
      <div
        className="chat-popup-body"
        style={{ backgroundColor: settings.backgroundColor }}
      >
        <div className="chat-messages">
          {/* Bot intro messages */}
          {hasAnyMessage && (
            <div className="chat-message chat-message-bot">
              <img
                src="/robot-avatar.png"
                alt=""
                className="chat-message-avatar"
              />
              <div className="chat-message-bubbles">
                {hasMessage1 && (
                  <div className="chat-message-bubble">
                    {settings.customMessages.message1}
                  </div>
                )}
                {hasMessage2 && (
                  <div className="chat-message-bubble">
                    {settings.customMessages.message2}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CHANGED: Show user's first message if sent */}
          {userHasSentMessage && userFirstMessage && (
            <div className="chat-message chat-message-user">
              <div className="chat-message-bubble">{userFirstMessage}</div>
            </div>
          )}

          {/* CHANGED: Show form ONLY after user sends first message */}
          {userHasSentMessage && !submitted && (
            <div className="chat-intro-form">
              <div className="chat-message-bot">
                <img
                  src="/robot-avatar.png"
                  alt=""
                  className="chat-message-avatar"
                />
                <div className="chat-form-card">
                  <h4 className="chat-form-title">Introduction Form</h4>

                  {/* Name */}
                  <div className="chat-form-group">
                    <label>
                      {settings.introductionForm?.nameLabel || "Your name"}
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder={
                        settings.introductionForm?.namePlaceholder ||
                        "Your name"
                      }
                    />
                  </div>

                  {/* Phone */}
                  <div className="chat-form-group">
                    <label>
                      {settings.introductionForm?.phoneLabel || "Your Phone"}
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder={
                        settings.introductionForm?.phonePlaceholder ||
                        "+1 (000) 000-0000"
                      }
                    />
                  </div>

                  {/* Email */}
                  <div className="chat-form-group">
                    <label>
                      {settings.introductionForm?.emailLabel || "Your Email"}
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder={
                        settings.introductionForm?.emailPlaceholder ||
                        "example@gmail.com"
                      }
                    />
                  </div>

                  {/* Error state */}
                  {error && <p className="chat-form-error">{error}</p>}

                  {/* Submit */}
                  <button
                    className="chat-form-submit"
                    onClick={handleFormSubmit}
                    disabled={!isFormValid || isSubmitting}
                    style={{
                      backgroundColor: isFormValid
                        ? settings.headerColor
                        : "#999999",
                    }}
                  >
                    {isSubmitting ? "Submitting..." : "Thank You!"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Thank-you message after form submission */}
          {submitted && (
            <div className="chat-message chat-message-bot">
              <img
                src="/robot-avatar.png"
                alt=""
                className="chat-message-avatar"
              />
              <div className="chat-message-bubbles">
                <div className="chat-message-bubble">
                  Thank you! Our team will get back to you soon.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="chat-popup-footer">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            // NEW: Handle Enter key to send message
            if (e.key === "Enter" && !userHasSentMessage && message.trim()) {
              handleSendFirstMessage();
            }
          }}
          placeholder="Write a message"
          className="chat-popup-input"
          disabled={submitted}
        />
        <button
          className="chat-popup-send"
          onClick={() => {
            // NEW: Send first message when clicked
            if (!userHasSentMessage && message.trim()) {
              handleSendFirstMessage();
            }
          }}
          disabled={submitted || (!userHasSentMessage && !message.trim())}
        >
          <img src="/send-icon.png" alt="" />
        </button>
      </div>
    </div>
  );
};

export default ChatPopup;