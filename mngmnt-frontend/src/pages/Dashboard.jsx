import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/common/Sidebar";
import Loader from "../components/common/Loader";
import { useAuth } from "../hooks/useAuth";
import { useDebounce } from "../hooks/useDebounce";
import api from "../services/api";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // State
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // all | resolved | unresolved
  const [searchQuery, setSearchQuery] = useState("");
  const [noTickets, setNoTickets] = useState(false); // "No tickets found" placeholder
  const [notFound, setNotFound] = useState(false); // "Ticket not found" alert
  const [lastId, setLastId] = useState(null);

  // Debounced search
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Build query parameters
  const buildParams = useCallback(
    (reset) => {
      const params = new URLSearchParams();

      if (activeTab === "resolved") params.set("status", "resolved");
      if (activeTab === "unresolved") params.set("status", "open");
      if (debouncedSearch) params.set("search", debouncedSearch);

      if (!reset && lastId) params.set("lastId", lastId);

      return params.toString();
    },
    [activeTab, debouncedSearch, lastId]
  );

  // Fetch tickets whenever tab or search changes
  useEffect(() => {
    fetchTickets(true);
  }, [activeTab, debouncedSearch]);

  // Fetch tickets (supports reset/infinite-scroll)
  const fetchTickets = useCallback(
    async (reset = false) => {
      reset
        ? (setLoading(true),
          setLastId(null),
          setError(""),
          setNoTickets(false),
          setNotFound(false))
        : setLoadingMore(true);

      try {
        const { data } = await api.get(`/tickets?${buildParams(reset)}`);
        const fetched = data?.tickets || [];

        if (reset) {
          setTickets(fetched);

          const none = fetched.length === 0;
          setNotFound(none && !!debouncedSearch);
          setNoTickets(none && !debouncedSearch);
        } else {
          setTickets((prev) => [...prev, ...fetched]);
        }

        const nextId = fetched.at(-1)?._id || null;
        setLastId(nextId);
      } catch (e) {
        setError(e?.response?.data?.message || "Failed to load tickets");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [buildParams]
  );

  // Infinite scroll handler
  const handleScroll = useCallback(
    (e) => {
      const el = e.target;
      const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 48;

      if (nearBottom && !loadingMore && !loading && lastId) {
        fetchTickets(false);
      }
    },
    [loading, loadingMore, lastId, fetchTickets]
  );

  // Navigate to Contact Center on link click
  const handleTicketClick = useCallback(
    (id) => navigate(`/contact-center?ticket=${id}`),
    [navigate]
  );

  // Helpers
  const formatTime = (date) =>
    new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }) +
    " at " +
    formatTime(date);

  const getInitials = (name = "") => {
    const parts = name.trim().split(" ");
    return `${parts[0]?.[0] || ""}${parts[1]?.[0] || ""}`.toUpperCase() || "?";
  };

  const getStatusColor = (status) =>
    status === "resolved"
      ? "#22c55e"
      : status === "in_progress"
      ? "#f59e0b"
      : "#f59e0b";

  const displayedTickets =
    activeTab === "all"
      ? tickets
      : activeTab === "resolved"
      ? tickets.filter((t) => t.status === "resolved")
      : tickets.filter((t) => t.status !== "resolved");

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
        </div>

        {/* Search row */}
        <div className="dashboard-search-row">
          <div className="dashboard-search">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder="Search for ticket"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Tabs row with All Tickets icon and divider below */}
        <div className="dashboard-tabs">
          <button
            className={`tab ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            <img src="/message-icon.svg" alt="" />
            All Tickets
          </button>
          <button
            className={`tab ${activeTab === "resolved" ? "active" : ""}`}
            onClick={() => setActiveTab("resolved")}
          >
            Resolved
          </button>
          <button
            className={`tab ${activeTab === "unresolved" ? "active" : ""}`}
            onClick={() => setActiveTab("unresolved")}
          >
            Unresolved
          </button>
        </div>
        <div className="dashboard-tabs-divider" />

        {/* NOT FOUND ALERT (when a search yields zero tickets) */}
        {!loading && notFound && (
          <div
            className="dashboard-alert"
            role="alert"
            aria-live="polite"
            aria-atomic="true"
          >
            Ticket not found
          </div>
        )}

        <div className="dashboard-list" onScroll={handleScroll}>
          {loading && (
            <div className="dashboard-loader">
              <Loader />
            </div>
          )}

          {/* No Tickets Placeholder */}
          {!loading && noTickets && (
            <div className="dashboard-empty">
              <div className="empty-icon" aria-hidden="true"></div>
              <p>No tickets found</p>
            </div>
          )}

          {!loading &&
            displayedTickets.map((ticket) => (
              <div key={ticket._id} className="ticket-card">
                <div className="ticket-header">
                  <div
                    className="ticket-status"
                    style={{ background: getStatusColor(ticket.status) }}
                  ></div>
                  <span className="ticket-id">Ticket# {ticket.ticketId}</span>
                  <span className="ticket-date">
                    Posted at {formatTime(ticket.createdAt)}
                  </span>
                </div>

                <div className="ticket-body">
                  <p className="ticket-message">{ticket.lastMessage || ""}</p>
                  <span className="ticket-timer">
                    {new Date(
                      ticket?.lastMessageAt ||
                        ticket?.updatedAt ||
                        ticket?.createdAt
                    ).toLocaleTimeString("en-GB", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                  </span>
                </div>

                <div className="ticket-footer">
                  <div className="ticket-user-avatar">
                    {getInitials(ticket.userName)}
                  </div>
                  <div className="ticket-user-info">
                    <span className="ticket-user-name">{ticket.userName}</span>
                    <span className="ticket-user-contact">
                      {ticket.userPhone}
                    </span>
                    <span className="ticket-user-email">
                      {ticket.userEmail}
                    </span>
                  </div>

                  <div className="ticket-footer-spacer"></div>

                  <button
                    type="button"
                    className="ticket-open-link"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTicketClick(ticket._id);
                    }}
                  >
                    Open Ticket
                  </button>
                </div>
              </div>
            ))}

          {loadingMore && (
            <div className="dashboard-loading-more">
              <Loader size="small" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;