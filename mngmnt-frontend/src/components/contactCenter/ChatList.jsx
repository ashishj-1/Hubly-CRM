import React from "react";
import "./ChatList.css";

const ChatList = ({
  chats = [],
  selectedChat,
  onSelectChat,
  currentUserId,
  currentUserRole,
}) => {
  // Get initials from name
  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  // Return last message or fallback
  const getLastMessage = (chat) => {
    if (chat.lastMessage) return chat.lastMessage;
    return "No messages yet";
  };

  // Can user view this chat?
  const canViewChat = (chat) => {
    // Admin can view all chats
    if (currentUserRole === "admin") return true;

    // Members can view only assigned chats
    const assignedToId = (chat.assignedTo?._id || chat.assignedTo)?.toString();
    const userId = currentUserId?.toString();
    return assignedToId === userId;
  };

  // Can user interact (send messages)?
  const canInteractWithChat = (chat) => {
    const assignedToId = (chat.assignedTo?._id || chat.assignedTo)?.toString();
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

    // User can interact only if assigned
    return assignedToId === userId;
  };

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

  return (
    <div className="chat-list">
      <div className="chat-list-header">
        <h3>Chats</h3>
      </div>

      <div className="chat-list-items">
        {chats.length === 0 ? (
          <div className="chat-list-empty">
            {/* Empty message */}
            <p>No chats available</p>
          </div>
        ) : (
          chats.map((chat) => {
            const canView = canViewChat(chat);
            const canInteract = canInteractWithChat(chat);

            // Hide chats user cannot view
            if (!canView) return null;

            return (
              <div
                key={chat._id}
                className={`chat-list-item 
                  ${
                    selectedChat?._id === chat._id
                      ? "chat-list-item-active"
                      : ""
                  }
                  ${!canInteract ? "chat-list-item-disabled" : ""}
                  ${chat.isMissed ? "chat-list-item-missed" : ""}`.replace(
                  /\s+/g,
                  " "
                )}
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