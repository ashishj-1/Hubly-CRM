import { createContext, useReducer } from "react";

export const ChatContext = createContext();

// Initial reducer state
const initialState = {
  // Selected ticket
  selectedTicket: null,

  // Messages for the selected ticket
  messages: [],

  // Loading state for messages
  loadingMessages: false,
};

const chatReducer = (state, action) => {
  switch (action.type) {
    case "SELECT":
      return { ...state, selectedTicket: action.ticket };

    case "CLEAR_SELECTION":
      return { ...state, selectedTicket: null, messages: [] };

    case "SET_ALL_MESSAGES":
      return { ...state, messages: action.list };

    case "PUSH_MESSAGE":
      return { ...state, messages: [...state.messages, action.item] };

    case "LOADING_MESSAGES":
      return { ...state, loadingMessages: action.status };

    default:
      return state;
  }
};

export const ChatProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  // Set selected ticket
  const selectTicket = (ticket) => {
    dispatch({ type: "SELECT", ticket });
  };

  // Clear selected ticket and messages
  const clearSelectedTicket = () => {
    dispatch({ type: "CLEAR_SELECTION" });
  };

  // Add a new message
  const addMessage = (message) => {
    dispatch({ type: "PUSH_MESSAGE", item: message });
  };

  const setMessages = (messages) => {
    dispatch({ type: "SET_ALL_MESSAGES", list: messages });
  };

  const setLoadingMessages = (flag) => {
    dispatch({ type: "LOADING_MESSAGES", status: flag });
  };

  return (
    <ChatContext.Provider
      value={{
        selectedTicket: state.selectedTicket,
        selectTicket,
        clearSelectedTicket,
        messages: state.messages,
        setMessages,
        addMessage,
        loadingMessages: state.loadingMessages,
        setLoadingMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};