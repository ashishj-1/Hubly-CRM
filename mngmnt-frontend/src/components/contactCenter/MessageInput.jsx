import React, { useState } from "react";
import "./MessageInput.css";

const MessageInput = ({ onSend, disabled = false }) => {
  // Message state
  const [value, setValue] = useState("");

  // Handle submit (button or Enter)
  const submitMessage = (e) => {
    e.preventDefault();
    const text = value.trim();
    if (!text || disabled) return;
    onSend(text);
    setValue("");
  };

  // Block Enter + allow Shift+Enter
  const onKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitMessage(e);
    }
  };

  return (
    <div className="message-input-container">
      <textarea
        className="message-input"
        placeholder="Type here"
        disabled={disabled}
        rows={2}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyPress}
      />

      {/* Send button */}
      <button
        className="message-send-btn"
        onClick={submitMessage}
        disabled={!value.trim() || disabled}
      >
        <img src="/send-icon.png" alt="Send" className="send-icon" />
      </button>
    </div>
  );
};

export default MessageInput;