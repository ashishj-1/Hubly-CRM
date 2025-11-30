import User from "../models/User.js";
import { generateToken } from "../utils/token.js";
import { USER_ROLES } from "../config/constants.js";

// POST /api/auth/signup
export const signup = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const existingAdmin = await User.findOne({ role: USER_ROLES.ADMIN });
    if (existingAdmin) {
      return res.status(403).json({
        success: false,
        message:
          "Admin account already exists. New accounts must be created by the admin.",
      });
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: USER_ROLES.ADMIN,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "Admin account created successfully",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/profile
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/auth/profile
export const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, email } = req.body;

    if (email && email !== req.user.email) {
      return res.status(400).json({
        success: false,
        message: "Email cannot be changed",
      });
    }

    const user = await User.findById(req.user.id);

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;

    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/auth/change-password
export const changePassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide new password",
      });
    }

    const user = await User.findById(req.user.id).select("+password");

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully. Please login again.",
      forceLogout: true,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/signup-available
export const checkSignupAvailable = async (req, res, next) => {
  try {
    const existingAdmin = await User.findOne({ role: USER_ROLES.ADMIN });

    res.json({
      success: true,
      available: !existingAdmin,
    });
  } catch (error) {
    next(error);
  }
};