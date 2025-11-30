import React, { useState, useEffect } from "react";
import Sidebar from "../components/common/Sidebar";
import ChatList from "../components/contactCenter/ChatList";
import ChatBox from "../components/contactCenter/ChatBox";
import ChatDetails from "../components/contactCenter/ChatDetails";
import Loader from "../components/common/Loader";
import { useAuth } from "../hooks/useAuth";
import api from "../services/api";
import "./ContactCenter.css";

const ContactCenter = () => {
  const { user } = useAuth();

  // State
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);

  // Load tickets and members
  useEffect(() => {
    console.log("Current user from useAuth:", user);
    fetchTickets();
    fetchTeamMembers();
  }, []);

  // Fetch tickets
  const fetchTickets = async () => {
    try {
      const res = await api.get("/tickets");
      if (res.data.success) {
        setTickets(res.data.tickets || []);
      }
    } catch (err) {
      console.error("Failed to fetch tickets:", err);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch team members
  const fetchTeamMembers = async () => {
    try {
      const res = await api.get("/users");
      if (res.data.success) {
        setTeamMembers(res.data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch team members:", err);
      setTeamMembers([]);
    }
  };

  // Fetch messages for a ticket
  const fetchMessages = async (ticketId) => {
    setMessagesLoading(true);
    try {
      const res = await api.get(`/messages/${ticketId}`);
      if (res.data.success) {
        setMessages(res.data.messages || res.data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err);
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  };

  // Select chat
  const handleSelectChat = (ticket) => {
    setSelectedTicket(ticket);
    fetchMessages(ticket._id);
  };

  // Send message
  const handleSendMessage = async (text) => {
    if (!selectedTicket) return;

    try {
      const res = await api.post("/messages", {
        ticketId: selectedTicket._id,
        text,
      });

      if (res.data.success) {
        const newMessageFromServer = res.data.message || res.data.data || {};

        // Ensure staff messages have sender info
        const newMessage = {
          ...newMessageFromServer,
          senderId: newMessageFromServer.senderId || {
            _id: user?._id,
            firstName: user?.firstName,
            lastName: user?.lastName,
          },
        };

        setMessages((prev) => [...prev, newMessage]);

        // Update ticket last activity
        setTickets((prev) =>
          prev.map((t) =>
            t._id === selectedTicket._id
              ? { ...t, lastMessageAt: new Date().toISOString() }
              : t
          )
        );
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  // Assign ticket
  const handleAssign = async (ticketId, memberId) => {
    try {
      const res = await api.patch(`/tickets/${ticketId}/assign`, {
        assignedTo: memberId,
      });

      if (res.data.success) {
        const updatedTicket = res.data.data || res.data.ticket;

        // Update list
        setTickets((prev) =>
          prev.map((t) => (t._id === ticketId ? updatedTicket : t))
        );

        // Update selected ticket if open
        if (selectedTicket?._id === ticketId) {
          setSelectedTicket(updatedTicket);
        }

        // Refresh from server
        await refreshSelectedTicket(ticketId);
      }
    } catch (err) {
      console.error("Failed to assign ticket:", err);
    }
  };

  // Update status
  const handleStatusChange = async (ticketId, status) => {
    try {
      const res = await api.put(`/tickets/${ticketId}`, { status });

      if (res.data.success) {
        const updatedTicket = res.data.data || res.data.ticket;

        setTickets((prev) =>
          prev.map((t) => (t._id === ticketId ? updatedTicket : t))
        );

        if (selectedTicket?._id === ticketId) {
          setSelectedTicket(updatedTicket);
        }
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  // Refresh a single ticket from server
  const refreshSelectedTicket = async (ticketId) => {
    try {
      const res = await api.get(`/tickets/${ticketId}`);
      if (res.data.success) {
        const freshTicket = res.data.ticket;
        setSelectedTicket(freshTicket);

        setTickets((prev) =>
          prev.map((t) => (t._id === ticketId ? freshTicket : t))
        );
      }
    } catch (err) {
      console.error("Failed to refresh ticket:", err);
    }
  };

  // Check if user can interact with selected ticket
  const canInteractWithTicket = () => {
    if (!selectedTicket) return false;

    const assignedToId = (
      selectedTicket.assignedTo?._id || selectedTicket.assignedTo
    )?.toString();
    const userId = (user?._id || user?.id)?.toString();

    console.log("Interaction check:", {
      currentUserId: userId,
      assignedToId: assignedToId,
      userRole: user?.role,
      canInteract: assignedToId === userId,
      selectedTicket: selectedTicket,
    });

    return assignedToId === userId;
  };

  if (loading) {
    return (
      <div className="contact-center-layout">
        <Sidebar />
        <div className="contact-center-loading">
          <Loader size="large" />
        </div>
      </div>
    );
  }

  return (
    <div className="contact-center-layout">
      <Sidebar />
      <div className="contact-center-content">
        <div className="contact-center-header">
          <h1>Contact Center</h1>
        </div>

        <div className="contact-center-main">
          <ChatList
            chats={tickets}
            selectedChat={selectedTicket}
            onSelectChat={handleSelectChat}
            currentUserId={user?.id || user?._id}
            currentUserRole={user?.role}
          />

          <ChatBox
            ticket={selectedTicket}
            messages={messages}
            onSendMessage={handleSendMessage}
            isResolved={selectedTicket?.status === "resolved"}
            isMissed={selectedTicket?.isMissed}
            isAccessible={canInteractWithTicket()}
            currentUser={user}
          />

          <ChatDetails
            ticket={selectedTicket}
            teamMembers={teamMembers}
            onAssign={handleAssign}
            onStatusChange={handleStatusChange}
            currentUser={user}
          />
        </div>
      </div>
    </div>
  );
};

export default ContactCenter;