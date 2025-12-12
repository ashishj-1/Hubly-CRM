import React, { useCallback, useMemo } from "react";
import "./ChatList.css";

const ChatList = ({
  chats = [],
  selectedChat,
  onSelectChat,
  currentUserId,
  currentUserRole,
}) => {
  // Get initials from name
  const getInitials = useCallback((name) => {
    if (!name) return "?";
    const [a = "", b = ""] = name.trim().split(" ");
    const out = (a.charAt(0) + b.charAt(0)).toUpperCase();
    return out || "?";
  }, []);

  // Return last message or fallback
  const getLastMessage = useCallback((chat) => {
    return chat.lastMessage || "No messages yet";
  }, []);

  // Can user view this chat?
  const canViewChat = useCallback(
    (chat) => {
      if (currentUserRole === "admin") return true;
      const assignedToId = (
        chat.assignedTo?._id || chat.assignedTo
      )?.toString();
      const userId = currentUserId?.toString();
      return assignedToId === userId;
    },
    [currentUserId, currentUserRole]
  );

  // Can user interact (send messages)?
  const canInteractWithChat = useCallback(
    (chat) => {
      const assignedToId = (
        chat.assignedTo?._id || chat.assignedTo
      )?.toString();
      const userId = currentUserId?.toString();

      // Debug logging
      console.log("ChatList - Access check:", {
        ticketId: chat._id,
        ticketNumber: chat.ticketId,
        assignedToId: assignedToId,
        currentUserId: userId,
        currentUserRole: currentUserRole,
        isAdmin: currentUserRole === "admin",
        idsMatch: assignedToId === userId,
        canInteract: assignedToId === userId,
      });

      return assignedToId === userId;
    },
    [currentUserId, currentUserRole]
  );

  // Debug: Summary of chats being rendered
  console.log("ChatList - Rendering chats:", {
    totalChats: chats.length,
    currentUserId,
    currentUserRole,
    chats: chats.map((c) => ({
      id: c._id,
      ticketId: c.ticketId,
      userName: c.userName,
      assignedTo: c.assignedTo?._id || c.assignedTo,
      canView: canViewChat(c),
      canInteract: canInteractWithChat(c),
    })),
  });

  const items = useMemo(() => chats, [chats]);

  return (
    <div className="chat-list">
      <div className="chat-list-header">
        <h3>Chats</h3>
      </div>

      <div className="chat-list-items">
        {items.length === 0 ? (
          <div className="chat-list-empty">
            {/* Empty message */}
            <p>No chats available</p>
          </div>
        ) : (
          items.map((chat) => {
            const canView = canViewChat(chat);
            const canInteract = canInteractWithChat(chat);
            if (!canView) return null;

            const classNames = [
              "chat-list-item",
              selectedChat?._id === chat._id && "chat-list-item-active",
              !canInteract && "chat-list-item-disabled",
              chat.isMissed && "chat-list-item-missed",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <div
                key={chat._id}
                className={classNames}
                onClick={() => onSelectChat(chat)}
              >
                {/* Status indicator bar */}
                <div
                  className={`chat-list-item-indicator ${
                    chat.isMissed ? "chat-list-item-missed" : ""
                  }`}
                ></div>

                {/* Avatar */}
                <div className="chat-list-avatar">
                  {getInitials(chat.userName)}
                </div>

                {/* Name + Preview */}
                <div className="chat-list-content">
                  <div className="chat-list-name">
                    {chat.userName || "Chat"}
                  </div>

                  <div className="chat-list-preview">
                    {!canInteract && currentUserRole === "admin"
                      ? `Assigned to ${
                          chat.assignedTo?.firstName || "team member"
                        }`
                      : getLastMessage(chat)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatList;