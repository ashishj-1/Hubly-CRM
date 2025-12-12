import React from "react";

// Reply time information card
const ReplyTimeCard = ({ time = "0 secs" }) => {
  const metricColor = "#00D907";

  return (
    <div className="analytics-card">
      <div className="analytics-card-row">
        {/* Content section */}
        <span className="analytics-card-content">
          <h3 className="analytics-card-title" style={{ color: metricColor }}>
            Average Reply time
          </h3>
          <p className="analytics-card-description">
            For highest customer satisfaction rates you should aim to reply to
            an incoming customer's message in 15 seconds or less. Quick
            responses help build trust, increase conversations and boost sales.
          </p>
        </span>

        {/* Metric section */}
        <span className="analytics-metric">
          <span
            className="analytics-metric-value"
            style={{ color: metricColor }}
          >
            {time}
          </span>
        </span>
      </div>
    </div>
  );
};

export default ReplyTimeCard;