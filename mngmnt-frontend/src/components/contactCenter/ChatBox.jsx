import React, { useEffect, useRef, useMemo, useCallback } from "react";
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
  const prevLenRef = useRef(messages.length);
  const prevTicketRef = useRef(ticket?._id);

  // Helper: always scroll to bottom
  const scrollToBottom = useCallback((behavior = "auto") => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior });
    });
  }, []);

  // On mount (first render)
  useEffect(() => {
    scrollToBottom("auto");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When switching tickets / When a new message arrives
  useEffect(() => {
    const idChanged = ticket?._id && prevTicketRef.current !== ticket._id;
    const lenChanged = messages.length !== prevLenRef.current;

    if (idChanged) {
      scrollToBottom("auto");
      prevTicketRef.current = ticket._id;
    } else if (lenChanged) {
      scrollToBottom("smooth");
    }

    prevLenRef.current = messages.length;
  }, [ticket?._id, messages.length, scrollToBottom]);

  // Get initials
  const getInitials = useCallback((name) => {
    if (!name) return "?";
    const [first = "", second = ""] = name.trim().split(/\s+/);
    const a = first.charAt(0);
    const b = second.charAt(0);
    const out = (a + b).toUpperCase();
    return out || "?";
  }, []);

  // Format date
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    []
  );

  const formatDate = useCallback(
    (dateStr) => dateFormatter.format(new Date(dateStr)),
    [dateFormatter]
  );

  // Group messages
  const groupedMessages = useMemo(() => {
    return messages.reduce((acc, msg) => {
      const bucket = formatDate(msg.timestamp || msg.createdAt);
      (acc[bucket] ||= []).push(msg);
      return acc;
    }, {});
  }, [messages, formatDate]);

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