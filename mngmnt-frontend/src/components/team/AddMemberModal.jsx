import React, { useState, useEffect, useCallback, useMemo } from "react";
import Modal from "../common/Modal";

const AddMemberModal = ({
  isOpen,
  onClose,
  onSave,
  editMember = null,
  currentUserRole,
}) => {
  // Form state
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    phone: "",
    password: "",
    role: "member",
  });

  // Error state
  const [error, setError] = useState("");

  // Toggle password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Reset or pre-fill form on open
  useEffect(() => {
    if (editMember) {
      setFormData({
        userName: `${editMember.firstName} ${editMember.lastName}`,
        email: editMember.email,
        phone: editMember.phone || "",
        password: "",
        role: editMember.role,
      });
    } else {
      setFormData({
        userName: "",
        email: "",
        phone: "",
        password: "",
        role: "member",
      });
    }
    setError("");
  }, [editMember, isOpen]);

  // Handle input change
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
    setError("");
  }, []);

  // Submit form
  const handleSubmit = useCallback(() => {
    // Required fields
    if (!formData.userName.trim() || !formData.email.trim()) {
      setError("Please fill in required fields");
      return;
    }

    // Password validation for new users
    if (!editMember && formData.password && formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    // Split name into first + last
    const parts = formData.userName.trim().split(" ").filter(Boolean);

    let firstName, lastName;

    if (parts.length === 0) {
      setError("Please enter a valid name");
      return;
    } else if (parts.length === 1) {
      [firstName] = parts;
      lastName = parts[0];
    } else {
      [firstName] = parts;
      lastName = parts.slice(1).join(" ");
    }

    // Validate email format
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    const payload = {
      firstName,
      lastName,
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      role: formData.role,
      ...(editMember && { _id: editMember._id }),
    };

    // Include password only if provided
    if (formData.password.trim()) {
      payload.password = formData.password.trim();
    }

    // Debug log (password masked)
    console.log("Submitting member data:", {
      ...payload,
      password: payload.password ? "****" : "default",
    });

    onSave(payload);
  }, [formData, editMember, onSave]);

  // Members cannot change roles
  const isRoleDisabled = useMemo(
    () => currentUserRole === "member",
    [currentUserRole]
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editMember ? "Edit Team member" : "Add Team members"}
      onConfirm={handleSubmit}
      confirmText="Save"
      size="medium"
    >
      {/* User name */}
      <div className="modal-form-group">
        <label>User name *</label>
        <input
          type="text"
          name="userName"
          value={formData.userName}
          onChange={handleChange}
          placeholder="Enter full name"
          required
        />
      </div>

      {/* Email */}
      <div className="modal-form-group">
        <label>Email ID *</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="example@email.com"
          disabled={!!editMember}
          required
        />
      </div>

      {/* Phone */}
      <div className="modal-form-group">
        <label>Phone</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="+1 (000) 000-0000"
        />
      </div>

      {/* Password */}
      <div className="modal-form-group">
        <label>
          Password {!editMember && "*"}
          {editMember && (
            <span
              style={{
                fontSize: "12px",
                color: "#6b7280",
                fontWeight: "normal",
              }}
            >
              {" "}
              (leave blank to keep current)
            </span>
          )}
        </label>

        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder={
              editMember
                ? "Enter new password (optional)"
                : "Enter password (min 6 characters)"
            }
            minLength={6}
            required={!editMember}
          />
        </div>

        {!editMember && (
          <small style={{ fontSize: "12px", color: "#6b7280" }}>
            Leave blank to use default password: "password123"
          </small>
        )}
      </div>

      {/* Role selection */}
      <div className="modal-form-group">
        <label>Designation</label>
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          disabled={isRoleDisabled}
        >
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>

        {isRoleDisabled && (
          <small
            style={{
              fontSize: "12px",
              color: "#6b7280",
              display: "block",
              marginTop: "4px",
            }}
          >
            Only admins can change roles
          </small>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p style={{ color: "#ef4444", fontSize: "14px", marginTop: "8px" }}>
          {error}
        </p>
      )}
    </Modal>
  );
};

export default AddMemberModal;