const F = Object.freeze;

export const TICKET_STATUS = F({
  OPEN: "open",
  IN_PROGRESS: "in_progress",
  RESOLVED: "resolved",
});

export const USER_ROLES = F({
  ADMIN: "admin",
  MEMBER: "member",
});

export const SENDER_TYPES = F({
  ADMIN: "admin",
  MEMBER: "member",
  CUSTOMER: "customer",
});

const introFormFields = F({
  name: F({ label: "Your name", placeholder: "Your name", required: true }),
  phone: F({
    label: "Your Phone",
    placeholder: "+1 (000) 000-0000",
    required: true,
  }),
  email: F({
    label: "Your Email",
    placeholder: "example@gmail.com",
    required: true,
  }),
});

export const DEFAULT_CHATBOT_SETTINGS = F({
  headerColor: "#334755",
  backgroundColor: "#ffffff",
  initialMessage: "How can I help you?",
  introFormFields,
  popMessageText:
    "👋 Want to chat about Hubly? I'm an chatbot here to help you find your way.",
  missedChatTimer: 5,
});

export const PAGINATION = F({
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
});