import React, { useEffect, useReducer, useRef, useCallback } from "react";
import Sidebar from "../components/common/Sidebar";
import MissedChatsChart from "../components/analytics/MissedChatsChart";
import ReplyTimeCard from "../components/analytics/ReplyTimeCard";
import ResolvedChart from "../components/analytics/ResolvedChart";
import TotalChatsCard from "../components/analytics/TotalChatsCard";
import Loader from "../components/common/Loader";
import api from "../services/api";
import "./Analytics.css";

const initialState = {
  missedChats: [],
  replyTime: "0 secs",
  resolvedPercentage: 0,
  totalChats: 0,
  loading: true,
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_ALL":
      return { ...state, ...action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    default:
      return state;
  }
}

const Analytics = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const intervalRef = useRef(null);

  const formatReplyTime = useCallback((secs) => {
    const s = Number(secs) || 0;
    if (s === 0) return "0 secs";
    if (s < 60) return `${Math.round(s)} secs`;
    if (s < 3600) return `${Math.round(s / 60)} mins`;
    return `${Math.round(s / 3600)} hrs`;
  }, []);

  const fetchAnalytics = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const res = await api.get("/analytics");
      const payload = res?.data;

      if (payload?.success) {
        const analytics = payload.data || {};
        dispatch({
          type: "SET_ALL",
          payload: {
            missedChats: analytics.missedChats || [],
            replyTime: formatReplyTime(analytics.avgReplyTime || 0),
            resolvedPercentage: analytics.resolvedPercentage || 0,
            totalChats: analytics.totalChats || 0,
          },
        });
      }
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [formatReplyTime]);

  useEffect(() => {
    fetchAnalytics();

    intervalRef.current = setInterval(fetchAnalytics, 30000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchAnalytics]);

  if (state.loading) {
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
          <div className="analytics-section">
            <MissedChatsChart data={state.missedChats} />
          </div>

          <div className="analytics-section">
            <ReplyTimeCard time={state.replyTime} />
          </div>

          <div className="analytics-section">
            <ResolvedChart percentage={state.resolvedPercentage} />
          </div>

          <div className="analytics-section">
            <TotalChatsCard count={state.totalChats} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;