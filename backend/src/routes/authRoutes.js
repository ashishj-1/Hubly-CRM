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

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/signup-available").get(checkSignupAvailable);

router.route("/profile").get(protect, getProfile).put(protect, updateProfile);
router.route("/change-password").put(protect, changePassword);

export default router;