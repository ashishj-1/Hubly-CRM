import React, { useCallback, useEffect, useMemo, useState } from "react";
import Sidebar from "../components/common/Sidebar";
import TeamTable from "../components/team/TeamTable";
import AddMemberModal from "../components/team/AddMemberModal";
import DeleteModal from "../components/team/DeleteModal";
import Loader from "../components/common/Loader";
import { useAuth } from "../hooks/useAuth";
import api from "../services/api";
import "./Team.css";

// Helpers
const norm = (v) => (v == null ? "" : String(v).trim());
const normLower = (v) => norm(v).toLowerCase();

const Team = () => {
  // Auth / current user
  const { user } = useAuth();
  const currentUserId = user?._id;
  const currentUserEmail = user?.email;
  const isAdmin = user?.role === "admin";

  // UI state
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editMember, setEditMember] = useState(null);
  const [deleteMember, setDeleteMember] = useState(null);
  const [error, setError] = useState(null);

  // Self-check by id or email
  const isSelf = useCallback(
    (member) => {
      const idMatch = norm(member?._id) === norm(currentUserId);
      const emailMatch =
        normLower(member?.email) && normLower(currentUserEmail)
          ? normLower(member.email) === normLower(currentUserEmail)
          : false;
      return idMatch || emailMatch;
    },
    [currentUserId, currentUserEmail]
  );

  // API: fetch team
  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/users");
      if (response.data?.success) {
        setMembers(response.data.data || []);
      } else {
        setError("Failed to load team members");
      }
    } catch (err) {
      console.error("Failed to fetch team members:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });
      setError(err.response?.data?.message || "Failed to load team members");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load members once
  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Handlers: open modals
  const handleAddMember = () => {
    setEditMember(null);
    setShowAddModal(true);
  };

  const handleEditMember = (member) => {
    if (!isAdmin && !isSelf(member)) return;
    setEditMember(member);
    setShowAddModal(true);
  };

  const handleDeleteMember = (member) => {
    if (!isAdmin && !isSelf(member)) return;
    setDeleteMember(member);
    setShowDeleteModal(true);
  };

  // Save (create/update)
  const handleSaveMember = async (memberData) => {
    if (!memberData.firstName || !memberData.lastName || !memberData.email) {
      alert(
        "Please fill in all required fields (First Name, Last Name, Email)"
      );
      return;
    }

    try {
      let response;
      if (editMember) {
        response = await api.put(`/users/${editMember._id}`, memberData);
        if (response.data?.success) {
          setMembers((list) =>
            list.map((m) => (m._id === editMember._id ? response.data.data : m))
          );
        }
      } else {
        response = await api.post("/users", memberData);
        if (response.data?.success) {
          setMembers((list) => list.concat(response.data.data));
        }
      }

      alert(response.data?.message || "Member saved successfully");
      setShowAddModal(false);
      setEditMember(null);
    } catch (err) {
      console.error("Failed to save member:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        sentData: memberData,
      });

      let msg = "Failed to save member";
      if (err.response?.status === 401) {
        msg = "You are not authorized. Please log in again.";
      } else if (err.response?.status === 403) {
        msg = "You do not have permission to perform this action.";
      } else if (err.response?.status === 400) {
        msg = err.response?.data?.message || "Invalid data provided";
      } else if (err.response?.status === 500) {
        msg = err.response?.data?.message || "Server error. Please try again.";
        if (err.response?.data?.error) {
          console.error("Server Error Details:", err.response.data.error);
        }
      } else if (err.response?.data?.message) {
        msg = err.response.data.message;
      }

      alert(msg);
    }
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (deleteMember?.role === "admin") {
      alert("Admins cannot be deleted.");
      setShowDeleteModal(false);
      setDeleteMember(null);
      return;
    }

    if (!isAdmin && !isSelf(deleteMember)) {
      alert("You can only delete your own account.");
      setShowDeleteModal(false);
      setDeleteMember(null);
      return;
    }

    try {
      const response = await api.delete(`/users/${deleteMember._id}`);
      if (response.data?.success) {
        setMembers((list) => list.filter((m) => m._id !== deleteMember._id));
        alert(response.data?.message || "Member deleted successfully");
      }
      setShowDeleteModal(false);
      setDeleteMember(null);
    } catch (err) {
      console.error("Failed to delete member:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });

      let msg = "Failed to delete member";
      if (err.response?.status === 401) {
        msg = "You are not authorized. Please log in again.";
      } else if (err.response?.status === 403) {
        msg = "You do not have permission to delete this member.";
      } else if (err.response?.status === 400) {
        msg = err.response?.data?.message || "Cannot delete this member";
      } else if (err.response?.data?.message) {
        msg = err.response.data.message;
      }

      alert(msg);
    }
  };

  // Dev-only debug logs
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.log("Current user:", user);
      console.log("Token exists:", !!localStorage.getItem("token"));
      console.log("Team members count:", members.length);
    }
  }, [user, members]);

  // Loading state
  if (loading) {
    return (
      <div className="team-layout">
        <Sidebar />
        <div className="team-loading">
          <Loader size="large" />
        </div>
      </div>
    );
  }

  // Error state
  if (error && members.length === 0) {
    return (
      <div className="team-layout">
        <Sidebar />
        <div className="team-content">
          <div className="team-header">
            <h1>Team</h1>
          </div>
          <div className="team-error">
            <p>{error}</p>
            <button onClick={fetchMembers} className="retry-button">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Page
  return (
    <div className="team-layout">
      <Sidebar />
      <div className="team-content">
        <div className="team-header">
          <h1>Team</h1>
          {!isAdmin && (
            <p className="team-info">
              Contact your administrator to manage team members
            </p>
          )}
        </div>

        <div className="team-main">
          <TeamTable
            members={members}
            onEdit={handleEditMember}
            onDelete={handleDeleteMember}
            currentUserId={currentUserId}
            currentUserRole={user?.role}
            currentUserEmail={currentUserEmail}
          />

          {isAdmin && (
            <button className="team-add-btn" onClick={handleAddMember}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              Add Team members
            </button>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      <AddMemberModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditMember(null);
        }}
        onSave={handleSaveMember}
        editMember={editMember}
        currentUserRole={user?.role}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteMember(null);
        }}
        onConfirm={handleConfirmDelete}
        memberName={
          deleteMember
            ? `${deleteMember.firstName} ${deleteMember.lastName}`
            : ""
        }
      />
    </div>
  );
};

export default Team;