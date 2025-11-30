import React, { useEffect, useRef } from "react";
import MessageInput from "./MessageInput";
import "./ChatBox.css";

const ChatBox = ({
  ticket,
  messages = [],
  onSendMessage,
  isResolved,
  isMissed,
  isAccessible,
  currentUser,
}) => {
  const messagesEndRef = useRef(null);

  // Helper: always scroll to bottom
  const scrollToBottom = (behavior = "auto") => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior });
    });
  };

  // On mount (first render)
  useEffect(() => {
    scrollToBottom("auto");
  }, []);

  // When switching tickets
  useEffect(() => {
    if (ticket?._id) {
      scrollToBottom("auto");
    }
  }, [ticket?._id]);

  // When a new message arrives
  useEffect(() => {
    scrollToBottom("smooth");
  }, [messages.length]);

  // Get initials
  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  // Format date
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  // Group messages
  const groupMessagesByDate = (msgs) => {
    const groups = {};
    msgs.forEach((msg) => {
      const date = formatDate(msg.timestamp || msg.createdAt);
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
    });
    return groups;
  };

  // No chat selected
  if (!ticket) {
    return (
      <div className="chatbox chatbox-empty">
        <div className="chatbox-empty-content">
          <p>Select a chat to view messages</p>
        </div>
      </div>
    );
  }

  const groupedMessages = groupMessagesByDate(messages);

  // Admin viewing someone else's chat
  const isAdminViewingMemberChat =
    currentUser?.role === "admin" && !isAccessible;

  return (
    <div className="chatbox">
      {/* Header */}
      <div className="chatbox-header">
        <span className="chatbox-ticket-id">Ticket# {ticket.ticketId}</span>
        <button
          className="chatbox-home-btn"
          onClick={() => (window.location.href = "/dashboard")}
        >
          <img src="/dashboard.svg" alt="dashboard" />
        </button>
      </div>

      {/* Messages */}
      <div className="chatbox-messages">
        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <div key={date} className="chatbox-date-group">
            {/* Date separator */}
            <div className="chatbox-date-separator">
              <span>{date}</span>
            </div>

            {/* Message list */}
            {msgs.map((msg, idx) => {
              const hasSender = !!msg.senderId;
              const isCustomer = !hasSender;

              const senderIdObj =
                typeof msg.senderId === "object" && msg.senderId !== null
                  ? msg.senderId
                  : null;

              const isFromCurrentUser =
                senderIdObj?._id === currentUser?._id ||
                senderIdObj?._id === currentUser?.id ||
                msg.senderId === currentUser?._id ||
                msg.senderId === currentUser?.id;

              const senderName = isCustomer
                ? ticket.userName
                : isFromCurrentUser
                ? `${currentUser?.firstName || ""} ${
                    currentUser?.lastName || ""
                  }`.trim() || "You"
                : `${senderIdObj?.firstName || ""} ${
                    senderIdObj?.lastName || ""
                  }`.trim() || "Staff";

              return (
                <div
                  key={msg._id || idx}
                  className={`chatbox-message ${
                    isCustomer
                      ? "chatbox-message-left"
                      : "chatbox-message-right"
                  }`}
                >
                  {/* Avatar - customer */}
                  {isCustomer && (
                    <div className="chatbox-message-avatar">
                      {getInitials(ticket.userName)}
                    </div>
                  )}

                  {/* Message text */}
                  <div className="chatbox-message-content">
                    <span className="chatbox-message-sender">{senderName}</span>
                    <div className="chatbox-message-bubble">{msg.text}</div>
                  </div>

                  {/* Avatar - staff */}
                  {!isCustomer && (
                    <div className="chatbox-message-avatar chatbox-message-avatar-staff">
                      {getInitials(senderName)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}

        {/* Missed indicator */}
        {isMissed && !isResolved && (
          <div className="chatbox-missed-indicator">
            Replying to missed chat
          </div>
        )}

        {/* Resolved indicator */}
        {isResolved && (
          <div className="chatbox-resolved-indicator">
            This chat has been resolved
          </div>
        )}

        {/* Admin access info */}
        {isAdminViewingMemberChat && (
          <div className="chatbox-no-access">
            Chat assigned to {ticket.assignedTo?.firstName}{" "}
            {ticket.assignedTo?.lastName}. You can view but not reply.
          </div>
        )}

        {/* Member no-access */}
        {!isAccessible && !isAdminViewingMemberChat && (
          <div className="chatbox-no-access">
            This chat is no longer accessible to you
          </div>
        )}

        {/* anchor for auto-scroll */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {isAccessible && !isResolved && <MessageInput onSend={onSendMessage} />}
    </div>
  );
};

export default ChatBox;