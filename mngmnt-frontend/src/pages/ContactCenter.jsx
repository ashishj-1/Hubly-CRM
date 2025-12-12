import React, { useEffect, useState, useCallback } from "react";
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
    loadTickets();
    loadMembers();
  }, []);

  // Fetch tickets
  const loadTickets = useCallback(async () => {
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
  }, []);

  // Fetch team members
  const loadMembers = useCallback(async () => {
    try {
      const res = await api.get("/users");
      if (res.data.success) {
        setTeamMembers(res.data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch team members:", err);
      setTeamMembers([]);
    }
  }, []);

  // Fetch messages for a ticket
  const loadMessages = useCallback(async (ticketId) => {
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
  }, []);

  // Select chat
  const handleSelectChat = useCallback(
    (ticket) => {
      setSelectedTicket(ticket);
      loadMessages(ticket._id);
    },
    [loadMessages]
  );

  // Send message
  const handleSendMessage = useCallback(
    async (text) => {
      if (!selectedTicket) return;

      try {
        const res = await api.post("/messages", {
          ticketId: selectedTicket._id,
          text,
        });

        if (res.data.success) {
          const newMsgFromServer = res.data.message || res.data.data || {};

          // Ensure staff messages have sender info
          const formattedMessage = {
            ...newMsgFromServer,
            senderId: newMsgFromServer.senderId || {
              _id: user?._id,
              firstName: user?.firstName,
              lastName: user?.lastName,
            },
          };

          setMessages((prev) => [...prev, formattedMessage]);

          // Update ticket last activity
          const stamp = new Date().toISOString();
          setTickets((prev) =>
            prev.map((t) =>
              t._id === selectedTicket._id ? { ...t, lastMessageAt: stamp } : t
            )
          );
        }
      } catch (err) {
        console.error("Failed to send message:", err);
      }
    },
    [selectedTicket, user]
  );

  // Assign ticket
  const handleAssign = useCallback(
    async (ticketId, memberId) => {
      try {
        const res = await api.patch(`/tickets/${ticketId}/assign`, {
          assignedTo: memberId,
        });

        if (res.data.success) {
          const updated = res.data.data || res.data.ticket;

          setTickets((prev) =>
            prev.map((t) => (t._id === ticketId ? updated : t))
          );

          if (selectedTicket?._id === ticketId) {
            setSelectedTicket(updated);
          }

          await refreshSelectedTicket(ticketId);
        }
      } catch (err) {
        console.error("Failed to assign ticket:", err);
      }
    },
    [selectedTicket]
  );

  // Update status
  const handleStatusChange = useCallback(
    async (ticketId, status) => {
      try {
        const res = await api.put(`/tickets/${ticketId}`, { status });
        if (res.data.success) {
          const upd = res.data.data || res.data.ticket;

          setTickets((prev) => prev.map((t) => (t._id === ticketId ? upd : t)));

          if (selectedTicket?._id === ticketId) {
            setSelectedTicket(upd);
          }
        }
      } catch (err) {
        console.error("Failed to update status:", err);
      }
    },
    [selectedTicket]
  );

  // Refresh a single ticket from server
  const refreshSelectedTicket = useCallback(async (ticketId) => {
    try {
      const res = await api.get(`/tickets/${ticketId}`);
      if (res.data.success) {
        const serverTicket = res.data.ticket;
        setSelectedTicket(serverTicket);

        setTickets((prev) =>
          prev.map((t) => (t._id === ticketId ? serverTicket : t))
        );
      }
    } catch (err) {
      console.error("Failed to refresh ticket:", err);
    }
  }, []);

  // Check if user can interact with selected ticket
  const canInteractWithTicket = useCallback(() => {
    if (!selectedTicket) return false;

    const assignedTo = (
      selectedTicket.assignedTo?._id || selectedTicket.assignedTo
    )?.toString();

    const uid = (user?._id || user?.id)?.toString();

    console.log("Interaction check:", {
      currentUserId: uid,
      assignedToId: assignedTo,
      userRole: user?.role,
      canInteract: assignedTo === uid,
      selectedTicket: selectedTicket,
    });

    return assignedTo === uid;
  }, [selectedTicket, user]);

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