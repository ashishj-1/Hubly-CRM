import React, { useMemo } from "react";
import "./Loader.css";

const Loader = ({ size = "medium", fullScreen = false, text = "" }) => {
  const classes = useMemo(() => {
    return ["loader-container", fullScreen ? "loader-fullscreen" : ""]
      .filter(Boolean)
      .join(" ");
  }, [fullScreen]);

  const sizeClass = `loader loader-${size}`;

  return (
    <div className={classes}>
      {/* Spinner */}
      <div className={sizeClass}>
        <div className="loader-spinner"></div>
      </div>

      {/* Optional text */}
      {text && <p className="loader-text">{text}</p>}
    </div>
  );
};

export default Loader;