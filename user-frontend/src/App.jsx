import React from "react";
import ChatWidget from "./components/ChatWidget/ChatWidget.jsx";
import "./components/ChatWidget/ChatWidget.css";

export default function App() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fff",
        borderRadius: "28px",
      }}
    >
      <ChatWidget />
    </div>
  );
}