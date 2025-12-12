import React from "react";

// Circular resolved ticket chart
const ResolvedChart = ({ percentage = 80 }) => {
  const r = 45;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - percentage / 100);
  const accent = "#00D907";

  return (
    <div className="analytics-card">
      <div className="analytics-card-row">
        {/* Text content */}
        <span className="analytics-card-content">
          <h3 className="analytics-card-title" style={{ color: accent }}>
            Resolved Tickets
          </h3>
          <p className="analytics-card-description">
            A callback widget with proactive prompts enhances engagement. A
            small animated button for requesting a call can increase customer
            actions and improve overall interaction rates.
          </p>
        </span>

        {/* Circular progress chart */}
        <span className="resolved-chart-container">
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r={r}
              fill="none"
              stroke="#e0e0e0"
              strokeWidth="8"
            />
            <circle
              cx="60"
              cy="60"
              r={r}
              fill="none"
              stroke={accent}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              transform="rotate(-90 60 60)"
              style={{ transition: "stroke-dashoffset 0.5s ease" }}
            />
            <text
              x="60"
              y="60"
              fontSize="20"
              fontWeight="600"
              textAnchor="middle"
              dominantBaseline="middle"
              fill={accent}
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