import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Custom tooltip for the chart
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "#334755",
          padding: "8px 16px",
          borderRadius: "8px",
          textAlign: "center",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        }}
      >
        <p
          style={{
            fontSize: "12px",
            color: "#fff",
            margin: "0 0 2px 0",
            opacity: 0.9,
          }}
        >
          Chats
        </p>
        <p
          style={{
            fontSize: "20px",
            fontWeight: "700",
            color: "#fff",
            margin: 0,
          }}
        >
          {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

const MissedChatsChart = ({ data = [] }) => {
  // Keep default dataset for empty state, but recompute when prop changes
  const chartData = useMemo(
    () =>
      data.length > 0
        ? data
        : [
            { week: "Week 1", chats: 12 },
            { week: "Week 2", chats: 14 },
            { week: "Week 3", chats: 9 },
            { week: "Week 4", chats: 10 },
            { week: "Week 5", chats: 13 },
            { week: "Week 6", chats: 5 },
            { week: "Week 7", chats: 8 },
            { week: "Week 8", chats: 9 },
            { week: "Week 9", chats: 15 },
            { week: "Week 10", chats: 12 },
          ],
    [data]
  );

  // Key forces Recharts to fully refresh when data shape changes
  const chartKey = useMemo(
    () => chartData.map((d) => `${d.week}:${d.chats}`).join("|"),
    [chartData]
  );

  return (
    <div className="analytics-card">
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "16px",
        }}
      >
        <h3 className="analytics-card-title">Missed Chats</h3>

        {/* Options button */}
        <button
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#999",
            padding: "4px",
            lineHeight: 0,
          }}
          aria-label="More options"
          className="analytics-card-menu"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <circle cx="5" cy="12" r="2"></circle>
            <circle cx="12" cy="12" r="2"></circle>
            <circle cx="19" cy="12" r="2"></circle>
          </svg>
        </button>
      </div>

      {/* Chart */}
      <div style={{ width: "100%", height: 280 }}>
        <ResponsiveContainer>
          <LineChart
            key={chartKey}
            data={chartData}
            margin={{ top: 20, right: 30, left: 0, bottom: 10 }}
          >
            <CartesianGrid
              strokeDasharray="0"
              stroke="#f0f0f0"
              vertical={false}
            />

            <XAxis
              dataKey="week"
              tick={{ fontSize: 12, fill: "#999" }}
              axisLine={{ stroke: "#e0e0e0" }}
              tickLine={false}
              dy={10}
            />

            <YAxis
              tick={{ fontSize: 12, fill: "#999" }}
              axisLine={false}
              tickLine={false}
              domain={[0, 25]}
              ticks={[0, 5, 10, 15, 20, 25]}
              dx={-10}
            />

            <Tooltip content={<CustomTooltip />} />

            <Line
              type="monotone"
              dataKey="chats"
              stroke="#00D907"
              strokeWidth={3}
              dot={{ fill: "#ffffff", stroke: "#000000", strokeWidth: 2, r: 5 }}
              activeDot={{
                fill: "#000000",
                stroke: "#ffffff",
                strokeWidth: 2,
                r: 7,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MissedChatsChart;