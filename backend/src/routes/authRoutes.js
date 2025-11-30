import express from "express";
import {
  signup,
  login,
  getProfile,
  updateProfile,
  changePassword,
  checkSignupAvailable,
} from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public
router.post("/signup", signup);
router.post("/login", login);
router.get("/signup-available", checkSignupAvailable);

// Protected
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);

export default router;