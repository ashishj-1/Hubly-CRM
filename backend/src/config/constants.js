// Ticket status types
export const TICKET_STATUS = {
  OPEN: "open",
  IN_PROGRESS: "in_progress",
  RESOLVED: "resolved",
};

// User roles
export const USER_ROLES = {
  ADMIN: "admin",
  MEMBER: "member",
};

// Sender types for chats
export const SENDER_TYPES = {
  ADMIN: "admin",
  MEMBER: "member",
  CUSTOMER: "customer",
};

// Default chatbot settings
export const DEFAULT_CHATBOT_SETTINGS = {
  headerColor: "#334755",
  backgroundColor: "#ffffff",
  initialMessage: "How can I help you?",
  introFormFields: {
    name: { label: "Your name", placeholder: "Your name", required: true },
    phone: {
      label: "Your Phone",
      placeholder: "+1 (000) 000-0000",
      required: true,
    },
    email: {
      label: "Your Email",
      placeholder: "example@gmail.com",
      required: true,
    },
  },
  popMessageText:
    "👋 Want to chat about Hubly? I'm an chatbot here to help you find your way.",
  missedChatTimer: 5,
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};