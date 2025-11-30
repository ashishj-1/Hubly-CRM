import React from "react";

// Circular resolved ticket chart
const ResolvedChart = ({ percentage = 80 }) => {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="analytics-card">
      <div className="analytics-card-row">
        {/* Text content */}
        <span className="analytics-card-content">
          <h3 className="analytics-card-title" style={{ color: "#00D907" }}>
            Resolved Tickets
          </h3>
          <p className="analytics-card-description">
            A callback system on a website, as well as proactive invitations,
            help to attract even more customers. A separate round button for
            ordering a call with a small animation helps to motivate more
            customers to make calls.
          </p>
        </span>

        {/* Circular progress chart */}
        <span className="resolved-chart-container">
          <svg width="120" height="120" viewBox="0 0 120 120">
            {/* Background circle */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="#e0e0e0"
              strokeWidth="8"
            />

            {/* Progress circle */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="#00D907"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 60 60)"
              style={{ transition: "stroke-dashoffset 0.5s ease" }}
            />

            {/* Percentage text */}
            <text
              x="60"
              y="60"
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="20"
              fontWeight="600"
              fill="#00D907"
            >
              {percentage}%
            </text>
          </svg>
        </span>
      </div>
    </div>
  );
};

export default ResolvedChart;