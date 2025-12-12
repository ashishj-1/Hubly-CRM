import User from "../models/User.js";
import { generateToken } from "../utils/token.js";
import { USER_ROLES } from "../config/constants.js";

const publicUser = (u) => ({
  id: u._id,
  firstName: u.firstName,
  lastName: u.lastName,
  email: u.email,
  role: u.role,
});

// POST /api/auth/signup
export const signup = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const adminExists = await User.exists({ role: USER_ROLES.ADMIN });
    if (adminExists) {
      return res.status(403).json({
        success: false,
        message:
          "Admin account already exists. New accounts must be created by the admin.",
      });
    }

    const created = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: USER_ROLES.ADMIN,
    });

    const token = generateToken(created._id);

    res.status(201).json({
      success: true,
      message: "Admin account created successfully",
      token,
      user: publicUser(created),
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
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
      user: publicUser(user),
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/profile
export const getProfile = async (req, res, next) => {
  try {
    const u = await User.findById(req.user.id);

    res.json({
      success: true,
      user: {
        ...publicUser(u),
        createdAt: u.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/auth/profile
export const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, email } = req.body || {};

    if (email && email !== req.user.email) {
      return res.status(400).json({
        success: false,
        message: "Email cannot be changed",
      });
    }

    const u = await User.findById(req.user.id);

    if (firstName != null) u.firstName = firstName;
    if (lastName != null) u.lastName = lastName;

    await u.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: publicUser(u),
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/auth/change-password
export const changePassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body || {};
    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide new password",
      });
    }

    const u = await User.findById(req.user.id).select("+password");
    u.password = newPassword;
    await u.save();

    res.json({
      success: true,
      message: "Password changed successfully. Please login again.",
      forceLogout: true,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/signup-available
export const checkSignupAvailable = async (req, res, next) => {
  try {
    const adminExists = await User.exists({ role: USER_ROLES.ADMIN });

    res.json({
      success: true,
      available: !adminExists,
    });
  } catch (err) {
    next(err);
  }
};