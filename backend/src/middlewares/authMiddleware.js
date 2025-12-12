import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { USER_ROLES } from "../config/constants.js";

const extractToken = (req) => {
  const h = req.headers.authorization;
  return h && h.startsWith("Bearer") ? h.split(" ")[1] : null;
};

// auth middleware
export const protect = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
      });
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({
        success: false,
        message: "Not authorized, token failed",
      });
    }

    const user = await User.findById(payload.id).select("-password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.changedPasswordAfter(payload.iat)) {
      return res.status(401).json({
        success: false,
        message: "Password recently changed. Please login again.",
      });
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

// Admin role check
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === USER_ROLES.ADMIN) {
    return next();
  }
  res.status(403).json({
    success: false,
    message: "Access denied. Admin only.",
  });
};