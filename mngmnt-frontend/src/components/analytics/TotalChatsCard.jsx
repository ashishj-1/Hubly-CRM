import React from "react";

// Total chats information card
const TotalChatsCard = ({ count = 0 }) => {
  const highlight = "#00D907";

  return (
    <div className="analytics-card">
      <div className="analytics-card-row">
        {/* Text content */}
        <div className="analytics-card-content">
          <h3 className="analytics-card-title">Total Chats</h3>
          <p className="analytics-card-description">
            This metric represents the full volume of chats across all channels
            within the selected time range.
          </p>
        </div>

        {/* Metric display */}
        <div className="analytics-metric">
          <span className="analytics-metric-value" style={{ color: highlight }}>
            {count} Chats
          </span>
        </div>
      </div>
    </div>
  );
};

export default TotalChatsCard;