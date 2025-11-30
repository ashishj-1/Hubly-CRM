import React, { useState, useEffect } from "react";
import Sidebar from "../components/common/Sidebar";
import MissedChatsChart from "../components/analytics/MissedChatsChart";
import ReplyTimeCard from "../components/analytics/ReplyTimeCard";
import ResolvedChart from "../components/analytics/ResolvedChart";
import TotalChatsCard from "../components/analytics/TotalChatsCard";
import Loader from "../components/common/Loader";
import api from "../services/api";
import "./Analytics.css";

const Analytics = () => {
  // Page data state
  const [data, setData] = useState({
    missedChats: [],
    replyTime: "0 secs",
    resolvedPercentage: 0,
    totalChats: 0,
  });

  // Loading state
  const [loading, setLoading] = useState(true);

  // Format seconds to human-readable string
  const formatReplyTime = (seconds) => {
    if (!seconds || seconds === 0) return "0 secs";
    if (seconds < 60) return `${Math.round(seconds)} secs`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} mins`;
    return `${Math.round(seconds / 3600)} hrs`;
  };

  // Fetch analytics data
  const fetchAnalytics = async () => {
    try {
      const res = await api.get("/analytics");

      if (res.data.success) {
        const analytics = res.data.data;

        setData({
          missedChats: analytics.missedChats || [],
          replyTime: formatReplyTime(analytics.avgReplyTime || 0),
          resolvedPercentage: analytics.resolvedPercentage || 0,
          totalChats: analytics.totalChats || 0,
        });
      }
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load analytics on mount
  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="analytics-layout">
        <Sidebar />
        <div className="analytics-loading">
          <Loader size="large" />
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-layout">
      <Sidebar />
      <div className="analytics-content">
        <div className="analytics-header">
          <h1>Analytics</h1>
        </div>

        <div className="analytics-grid">
          {/* Missed Chats */}
          <div className="analytics-section">
            <MissedChatsChart data={data.missedChats} />
          </div>

          {/* Average Reply Time */}
          <div className="analytics-section">
            <ReplyTimeCard time={data.replyTime} />
          </div>

          {/* Resolved Tickets */}
          <div className="analytics-section">
            <ResolvedChart percentage={data.resolvedPercentage} />
          </div>

          {/* Total Chats */}
          <div className="analytics-section">
            <TotalChatsCard count={data.totalChats} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;