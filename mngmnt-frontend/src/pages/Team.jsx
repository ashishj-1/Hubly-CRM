import React, { useState, useEffect } from "react";
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
  const isAdmin = user?.role === "admin";
  const currentUserId = user?._id;
  const currentUserEmail = user?.email;

  // UI state
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editMember, setEditMember] = useState(null);
  const [deleteMember, setDeleteMember] = useState(null);
  const [error, setError] = useState(null);

  // Self-check by id or email
  const isSelf = (member) => {
    const byId = norm(member?._id) === norm(currentUserId);
    const byEmail =
      normLower(member?.email) && normLower(currentUserEmail)
        ? normLower(member.email) === normLower(currentUserEmail)
        : false;
    return byId || byEmail;
  };

  // Load members once
  useEffect(() => {
    fetchMembers();
  }, []);

  // API: fetch team
  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/users");
      if (res.data?.success) {
        setMembers(res.data.data || []);
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
  };

  // Handlers: open modals
  const handleAddMember = () => {
    setEditMember(null);
    setShowAddModal(true);
  };

  const handleEditMember = (member) => {
    // Members may edit only themselves
    if (!isAdmin && !isSelf(member)) return;
    setEditMember(member);
    setShowAddModal(true);
  };

  const handleDeleteMember = (member) => {
    // Members may delete only themselves
    if (!isAdmin && !isSelf(member)) return;
    setDeleteMember(member);
    setShowDeleteModal(true);
  };

  // Save (create/update)
  const handleSaveMember = async (memberData) => {
    try {
      if (!memberData.firstName || !memberData.lastName || !memberData.email) {
        alert(
          "Please fill in all required fields (First Name, Last Name, Email)"
        );
        return;
      }

      let res;
      if (editMember) {
        res = await api.put(`/users/${editMember._id}`, memberData);
        if (res.data?.success) {
          setMembers((prev) =>
            prev.map((m) => (m._id === editMember._id ? res.data.data : m))
          );
        }
      } else {
        res = await api.post("/users", memberData);
        if (res.data?.success) {
          setMembers((prev) => [...prev, res.data.data]);
        }
      }

      alert(res.data?.message || "Member saved successfully");
      setShowAddModal(false);
      setEditMember(null);
    } catch (err) {
      console.error("Failed to save member:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        sentData: memberData,
      });

      let errorMessage = "Failed to save member";
      if (err.response?.status === 401) {
        errorMessage = "You are not authorized. Please log in again.";
      } else if (err.response?.status === 403) {
        errorMessage = "You do not have permission to perform this action.";
      } else if (err.response?.status === 400) {
        errorMessage = err.response?.data?.message || "Invalid data provided";
      } else if (err.response?.status === 500) {
        errorMessage =
          err.response?.data?.message || "Server error. Please try again.";
        if (err.response?.data?.error) {
          console.error("Server Error Details:", err.response.data.error);
        }
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      alert(errorMessage);
    }
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    try {
      if (deleteMember?.role === "admin") {
        alert("Admins cannot be deleted.");
        setShowDeleteModal(false);
        setDeleteMember(null);
        return;
      }

      // Members may delete only themselves
      if (!isAdmin && !isSelf(deleteMember)) {
        alert("You can only delete your own account.");
        setShowDeleteModal(false);
        setDeleteMember(null);
        return;
      }

      const res = await api.delete(`/users/${deleteMember._id}`);
      if (res.data?.success) {
        setMembers((prev) => prev.filter((m) => m._id !== deleteMember._id));
        alert(res.data?.message || "Member deleted successfully");
      }

      setShowDeleteModal(false);
      setDeleteMember(null);
    } catch (err) {
      console.error("Failed to delete member:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });

      let errorMessage = "Failed to delete member";
      if (err.response?.status === 401) {
        errorMessage = "You are not authorized. Please log in again.";
      } else if (err.response?.status === 403) {
        errorMessage = "You do not have permission to delete this member.";
      } else if (err.response?.status === 400) {
        errorMessage =
          err.response?.data?.message || "Cannot delete this member";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      alert(errorMessage);
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
            currentUserEmail={currentUserEmail} // Ensure table can match by email too
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
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="16"></line>
                <line x1="8" y1="12" x2="16" y2="12"></line>
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