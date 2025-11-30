import React, { useState } from "react";
import "./TeamTable.css";

const TeamTable = ({
  members,
  onEdit,
  onDelete,
  currentUserId,
  currentUserRole,
  currentUserEmail,
}) => {
  // Sort order state
  const [sortOrder, setSortOrder] = useState("asc");

  // Build initials from first + last
  const getInitials = (firstName, lastName) => {
    const first = firstName?.[0] || "";
    const last = lastName?.[0] || "";
    return (first + last).toUpperCase() || "?";
  };

  // Normalizers
  const norm = (v) => (v == null ? "" : String(v).trim());
  const normLower = (v) => norm(v).toLowerCase();

  // Sort by firstName, then lastName
  const sortedMembers = [...members].sort((a, b) => {
    const firstA = normLower(a.firstName);
    const firstB = normLower(b.firstName);

    if (firstA !== firstB) {
      return sortOrder === "asc"
        ? firstA.localeCompare(firstB)
        : firstB.localeCompare(firstA);
    }

    const lastA = normLower(a.lastName);
    const lastB = normLower(b.lastName);

    return sortOrder === "asc"
      ? lastA.localeCompare(lastB)
      : lastB.localeCompare(lastA);
  });

  // Toggle ascending/descending
  const toggleSort = () =>
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));

  return (
    <div className="team-table-container">
      <table className="team-table">
        <thead>
          <tr>
            <th className="team-table-sortable" onClick={toggleSort}>
              Full Name
              <img src="/up-down.svg" alt="" />
            </th>
            <th>Phone</th>
            <th>Email</th>
            <th>Role</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {sortedMembers.map((member) => {
            const isAdmin = member.role === "admin";

            // Robust self check (by id or email)
            const isSelfById = norm(member._id) === norm(currentUserId);
            const isSelfByEmail =
              normLower(member.email) && normLower(currentUserEmail)
                ? normLower(member.email) === normLower(currentUserEmail)
                : false;
            const isSelf = isSelfById || isSelfByEmail;

            const isCurrentUserAdmin = currentUserRole === "admin";

            // Admin: Can edit all members except other admins
            // Member: Can only edit themselves
            const canEdit = isCurrentUserAdmin ? !isAdmin : isSelf;

            // Admin: Can delete members (not admins)
            // Member: Cannot delete anyone (including themselves)
            const canDelete = isCurrentUserAdmin && !isAdmin;

            return (
              <tr key={member._id}>
                <td>
                  <div className="team-member-info">
                    <div className="team-member-avatar">
                      {getInitials(member.firstName, member.lastName)}
                    </div>
                    <span className="team-member-name">
                      {member.firstName} {member.lastName}
                    </span>
                  </div>
                </td>

                <td>{member.phone || "+1 (000) 000-0000"}</td>
                <td>{member.email}</td>

                <td>
                  <span
                    className={`team-role-badge ${
                      isAdmin ? "team-role-admin" : "team-role-member"
                    }`}
                  >
                    {isAdmin ? "Admin" : "Member"}
                  </span>
                </td>

                <td className="team-actions">
                  {canEdit && (
                    <button
                      className="team-action-btn"
                      onClick={() => onEdit(member)}
                      title="Edit member"
                      aria-label="Edit member"
                    >
                      <img src="/edit.svg" alt="" />
                    </button>
                  )}

                  {canDelete && (
                    <button
                      className="team-action-btn team-action-delete"
                      onClick={() => onDelete(member)}
                      title="Delete member"
                      aria-label="Delete member"
                    >
                      <img src="/delete.svg" alt="" />
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {members.length === 0 && (
        <div className="team-table-empty">
          <p>No team members found</p>
        </div>
      )}
    </div>
  );
};

export default TeamTable;