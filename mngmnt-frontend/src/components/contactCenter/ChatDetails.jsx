import React, { useState, useMemo, useCallback } from "react";
import Dropdown from "../common/Dropdown";
import Modal from "../common/Modal";
import "./ChatDetails.css";

const ChatDetails = ({
  ticket,
  teamMembers,
  onAssign,
  onStatusChange,
  currentUser,
}) => {
  // Modal visibility states
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  // Pending updates before confirmation
  const [pendingAssign, setPendingAssign] = useState(null);
  const [pendingStatus, setPendingStatus] = useState(null);

  // Get initials from first and last name
  const getInitials = useCallback((firstName, lastName) => {
    const a = firstName?.[0] || "";
    const b = lastName?.[0] || "";
    const out = (a + b).toUpperCase();
    return out || "?";
  }, []);

  // When a new teammate is selected
  const handleAssignChange = useCallback(
    (memberId) => {
      if (memberId !== ticket?.assignedTo?._id) {
        setPendingAssign(memberId);
        setShowAssignModal(true);
      }
    },
    [ticket?.assignedTo?._id]
  );

  // Confirm teammate assignment
  const confirmAssign = useCallback(() => {
    if (!ticket) return;
    onAssign(ticket._id, pendingAssign);
    setShowAssignModal(false);
    setPendingAssign(null);
  }, [onAssign, ticket, pendingAssign]);

  // When changing status (resolved / unresolved)
  const handleStatusChange = useCallback(
    (status) => {
      if (!ticket) return;
      if (status === "resolved" && ticket.status !== "resolved") {
        setPendingStatus(status);
        setShowStatusModal(true);
      } else {
        onStatusChange(ticket._id, status);
      }
    },
    [ticket, onStatusChange]
  );

  // Confirm closing the chat
  const confirmStatusChange = useCallback(() => {
    if (!ticket) return;
    onStatusChange(ticket._id, pendingStatus);
    setShowStatusModal(false);
    setPendingStatus(null);
  }, [onStatusChange, ticket, pendingStatus]);

  // Format team members for dropdown
  const teamOptions = useMemo(
    () =>
      teamMembers.map((m) => ({
        value: m._id,
        label: `${m.firstName} ${m.lastName}`,
        firstName: m.firstName,
        lastName: m.lastName,
      })),
    [teamMembers]
  );

  // Ticket status dropdown options
  const statusOptions = useMemo(
    () => [
      { value: "resolved", label: "Resolved" },
      { value: "unresolved", label: "Unresolved" },
    ],
    []
  );

  const isAdmin = currentUser?.role === "admin";

  if (!ticket) {
    return (
      <div className="chat-details chat-details-empty">
        <p>Select a chat to view details</p>
      </div>
    );
  }

  return (
    <div className="chat-details">
      {/* Header */}
      <div className="chat-details-header">
        <div className="chat-details-avatar">
          {getInitials(
            ticket.userName?.split(" ")[0],
            ticket.userName?.split(" ")[1]
          )}
        </div>
        <span className="chat-details-title">Chat</span>
      </div>

      {/* User details */}
      <div className="chat-details-section">
        <h4 className="chat-details-section-title">Details</h4>

        <div className="chat-details-row">
          <div className="chat-details-icon">
            <img src="/member-icon.png" alt="" />
          </div>
          <span className="chat-details-value">{ticket.userName}</span>
        </div>

        <div className="chat-details-row">
          <div className="chat-details-icon">
            <img src="/phone-icon.svg" alt="" />
          </div>
          <span className="chat-details-value">{ticket.userPhone}</span>
        </div>

        <div className="chat-details-row">
          <div className="chat-details-icon">
            <img src="/message-icon.svg" alt="" />
          </div>
          <span className="chat-details-value">{ticket.userEmail}</span>
        </div>
      </div>

      {/* Assign teammate */}
      <div className="chat-details-section">
        <h4 className="chat-details-section-title">Teammates</h4>

        <Dropdown
          options={teamOptions}
          value={ticket.assignedTo?._id}
          onChange={handleAssignChange}
          disabled={!isAdmin}
          renderOption={(option) => (
            <div className="dropdown-option-avatar">
              <div className="avatar">
                {getInitials(option.firstName, option.lastName)}
              </div>
              <span>{option.label}</span>
            </div>
          )}
          renderSelected={(option) => (
            <div className="dropdown-option-avatar">
              <div className="avatar">
                {getInitials(option.firstName, option.lastName)}
              </div>
              <span>{option.label}</span>
            </div>
          )}
        />
      </div>

      {/* Status dropdown */}
      <div className="chat-details-section">
        <h4 className="chat-details-section-title">Ticket Status</h4>
        <Dropdown
          options={statusOptions}
          value={ticket.status === "resolved" ? "resolved" : "unresolved"}
          onChange={handleStatusChange}
          icon={
            <img
              src="/ticket-icon.png"
              alt=""
              style={{ width: "18px", height: "18px" }}
            />
          }
          placeholder="Ticket status"
        />
      </div>

      {/* Assign Confirmation Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        onConfirm={confirmAssign}
        confirmText="Confirm"
        size="small"
      >
        <p className="modal-description">
          Chat would be assigned to a different team member.
        </p>
      </Modal>

      {/* Status Change Confirmation Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        onConfirm={confirmStatusChange}
        confirmText="Confirm"
        size="small"
      >
        <p className="modal-description">Chat will be closed.</p>
      </Modal>
    </div>
  );
};

export default ChatDetails;