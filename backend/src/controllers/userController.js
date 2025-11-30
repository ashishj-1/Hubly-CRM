import User from "../models/User.js";
import Ticket from "../models/Ticket.js";
import { USER_ROLES } from "../config/constants.js";

// GET /api/users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
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
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
      error: error.message,
    });
  }
};

// POST /api/users (admin)
export const createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, role } = req.body;

    // Email must be unique
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Only one admin allowed
    if (role === USER_ROLES.ADMIN) {
      const adminExists = await User.findOne({ role: USER_ROLES.ADMIN });
      if (adminExists) {
        return res.status(400).json({
          success: false,
          message: "Admin account already exists",
        });
      }
    }

    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone: phone || "",
      password: password || "password123",
      role: role || USER_ROLES.MEMBER,
    });

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: "Team member created successfully",
      data: userResponse,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create user",
      error: error.message,
    });
  }
};

// PUT /api/users/:id
export const updateUser = async (req, res) => {
  try {
    const { firstName, lastName, phone, role } = req.body;
    const userId = req.params.id;
    const requestingUser = req.user;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Permissions
    const isAdmin = requestingUser.role === USER_ROLES.ADMIN;
    const isSelf = requestingUser._id.toString() === userId;

    if (!isAdmin && !isSelf) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this user",
      });
    }

    // Members can't change role
    if (!isAdmin && isSelf) {
      if (role) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to change role",
        });
      }
    }

    // Keep at least one admin
    if (user.role === USER_ROLES.ADMIN && role && role !== USER_ROLES.ADMIN) {
      const adminCount = await User.countDocuments({ role: USER_ROLES.ADMIN });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: "Cannot change role. At least one admin must exist.",
        });
      }
    }

    // Updates
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;
    if (role && isAdmin) user.role = role;

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: userResponse,
    });
  } catch (error) {
    res.status(500).json({
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
    const requestingUser = req.user;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Don't delete admin
    if (user.role === USER_ROLES.ADMIN) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete admin account",
      });
    }

    // Don't allow self-delete
    if (requestingUser._id.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete your own account",
      });
    }

    // Reassign tickets to admin
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
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: error.message,
    });
  }
};