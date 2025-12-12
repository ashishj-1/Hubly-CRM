import User from "../models/User.js";
import Ticket from "../models/Ticket.js";
import { USER_ROLES } from "../config/constants.js";

const shape = (u) => {
  const o = u.toObject ? u.toObject() : u;
  delete o.password;
  return o;
};
const isAdmin = (u) => u.role === USER_ROLES.ADMIN;
const idEq = (a, b) => String(a) === String(b);

// GET /api/users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch users",
        error: error.message,
      });
  }
};

// GET /api/users/:id
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch user",
        error: error.message,
      });
  }
};

// POST /api/users (admin)
export const createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, role } =
      req.body || {};
    const normalizedEmail = (email || "").toLowerCase();

    const exists = await User.exists({ email: normalizedEmail });
    if (exists) {
      return res
        .status(400)
        .json({ success: false, message: "Email already exists" });
    }

    if (role === USER_ROLES.ADMIN) {
      const adminExists = await User.exists({ role: USER_ROLES.ADMIN });
      if (adminExists) {
        return res
          .status(400)
          .json({ success: false, message: "Admin account already exists" });
      }
    }

    const created = await User.create({
      firstName,
      lastName,
      email: normalizedEmail,
      phone: phone || "",
      password: password || "password123",
      role: role || USER_ROLES.MEMBER,
    });

    res.status(201).json({
      success: true,
      message: "Team member created successfully",
      data: shape(created),
    });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to create user",
        error: error.message,
      });
  }
};

// PUT /api/users/:id
export const updateUser = async (req, res) => {
  try {
    const { firstName, lastName, phone, role } = req.body || {};
    const userId = req.params.id;
    const requester = req.user;

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const requesterIsAdmin = isAdmin(requester);
    const requesterIsSelf = idEq(requester._id, userId);

    if (!requesterIsAdmin && !requesterIsSelf) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to update this user",
        });
    }

    if (!requesterIsAdmin && requesterIsSelf && role) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized to change role" });
    }

    if (user.role === USER_ROLES.ADMIN && role && role !== USER_ROLES.ADMIN) {
      const adminCount = await User.countDocuments({ role: USER_ROLES.ADMIN });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: "Cannot change role. At least one admin must exist.",
        });
      }
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;
    if (role && requesterIsAdmin) user.role = role;

    await user.save();

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: shape(user),
    });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to update user",
        error: error.message,
      });
  }
};

// DELETE /api/users/:id (admin)
export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const requester = req.user;

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (isAdmin(user)) {
      return res
        .status(400)
        .json({ success: false, message: "Cannot delete admin account" });
    }

    if (idEq(requester._id, userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Cannot delete your own account" });
    }

    const admin = await User.findOne({ role: USER_ROLES.ADMIN });
    if (admin) {
      await Ticket.updateMany(
        { assignedTo: userId },
        { assignedTo: admin._id }
      );
    }

    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: "User deleted successfully. Tickets reassigned to admin.",
    });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to delete user",
        error: error.message,
      });
  }
};