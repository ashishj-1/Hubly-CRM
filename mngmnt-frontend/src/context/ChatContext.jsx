import { createContext, useState } from "react";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  // Selected ticket
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Messages for the selected ticket
  const [messages, setMessages] = useState([]);

  // Loading state for messages
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Set selected ticket
  const selectTicket = (ticket) => {
    setSelectedTicket(ticket);
  };

  // Clear selected ticket and messages
  const clearSelectedTicket = () => {
    setSelectedTicket(null);
    setMessages([]);
  };

  // Add a new message
  const addMessage = (message) => {
    setMessages((prev) => [...prev, message]);
  };

  const value = {
    selectedTicket,
    selectTicket,
    clearSelectedTicket,
    messages,
    setMessages,
    addMessage,
    loadingMessages,
    setLoadingMessages,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};