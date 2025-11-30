import React, { useState } from "react";
import "./MessageInput.css";

const MessageInput = ({ onSend, disabled = false }) => {
  // Message state
  const [message, setMessage] = useState("");

  // Handle submit (button or Enter)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
    }
  };

  // Block Enter + allow Shift+Enter
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="message-input-container">
      <textarea
        className="message-input"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type here"
        disabled={disabled}
        rows={2}
      />

      {/* Send button */}
      <button
        className="message-send-btn"
        onClick={handleSubmit}
        disabled={!message.trim() || disabled}
      >
        <img
          src="/send-icon.png"
          alt="Send"
          className="send-icon"
        />
      </button>
    </div>
  );
};

export default MessageInput;