import React from "react";
import "./Loader.css";

const Loader = ({ size = "medium", fullScreen = false, text = "" }) => {
  // Build the loader structure
  const loader = (
    <div
      className={`loader-container ${fullScreen ? "loader-fullscreen" : ""}`}
    >
      {/* Spinner */}
      <div className={`loader loader-${size}`}>
        <div className="loader-spinner"></div>
      </div>

      {/* Optional text */}
      {text && <p className="loader-text">{text}</p>}
    </div>
  );

  return loader;
};

export default Loader;