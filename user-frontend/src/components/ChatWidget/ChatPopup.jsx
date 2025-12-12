import React, { useState, useMemo, useCallback } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const ChatPopup = ({ settings, onClose, formSubmitted, onFormSubmit }) => {
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [message, setMessage] = useState("");
  const [hasSent, setHasSent] = useState(false);
  const [firstMessage, setFirstMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(formSubmitted);
  const [error, setError] = useState("");

  const hasMessage1 = !!settings.customMessages?.message1?.trim?.();
  const hasMessage2 = !!settings.customMessages?.message2?.trim?.();
  const hasAnyMessage = hasMessage1 || hasMessage2;
  const isFormValid = !!(form.name && form.phone && form.email);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setError("");
  }, []);

  const commitFirstMessage = useCallback(() => {
    const trimmed = message.trim();
    if (!trimmed) return;
    setFirstMessage(trimmed);
    setHasSent(true);
    setMessage("");
  }, [message]);

  const handleFormSubmit = useCallback(async () => {
    if (!isFormValid) {
      setError("Please fill in all fields");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`${API_URL}/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: form.name,
          userPhone: form.phone,
          userEmail: form.email,
          initialMessage: firstMessage || "New conversation started",
        }),
      });
      const data = await res.json();
      if (data?.success) {
        setSubmitted(true);
        onFormSubmit();
      } else {
        setError(data?.message || "Something went wrong");
      }
    } catch {
      setError("Failed to submit. Please try again.");
    } finally {
      setBusy(false);
    }
  }, [form, firstMessage, isFormValid, onFormSubmit]);

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

          {/* Show user's first message if sent */}
          {hasSent && firstMessage && (
            <div className="chat-message chat-message-user">
              <div className="chat-message-bubble">{firstMessage}</div>
            </div>
          )}

          {/* Show form ONLY after user sends first message */}
          {hasSent && !submitted && (
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
                      value={form.name}
                      onChange={handleChange}
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
                      value={form.phone}
                      onChange={handleChange}
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
                      value={form.email}
                      onChange={handleChange}
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
                    disabled={!isFormValid || busy}
                    style={{
                      backgroundColor: isFormValid
                        ? settings.headerColor
                        : "#999999",
                    }}
                  >
                    {busy ? "Submitting..." : "Thank You!"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Thank-you message after form submission!! */}
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
            // Handle Enter key to send message
            if (e.key === "Enter" && !hasSent && message.trim()) {
              commitFirstMessage();
            }
          }}
          placeholder="Write a message"
          className="chat-popup-input"
          disabled={submitted}
        />
        <button
          className="chat-popup-send"
          onClick={() => {
            // Send first message when clicked
            if (!hasSent && message.trim()) {
              commitFirstMessage();
            }
          }}
          disabled={submitted || (!hasSent && !message.trim())}
        >
          <img src="/send-icon.png" alt="" />
        </button>
      </div>
    </div>
  );
};

export default ChatPopup;