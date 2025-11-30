import React from "react";

// Total chats information card
const TotalChatsCard = ({ count = 0 }) => {
  return (
    <div className="analytics-card">
      <div className="analytics-card-row">
        {/* Text content */}
        <div className="analytics-card-content">
          <h3 className="analytics-card-title">Total Chats</h3>
          <p className="analytics-card-description">
            This metric shows the total number of chats for all channels for the
            selected period.
          </p>
        </div>

        {/* Metric display */}
        <div className="analytics-metric">
          <span className="analytics-metric-value" style={{ color: "#00D907" }}>
            {count} Chats
          </span>
        </div>
      </div>
    </div>
  );
};

export default TotalChatsCard;