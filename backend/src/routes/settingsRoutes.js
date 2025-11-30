import express from "express";
import {
  getChatbotSettings,
  updateChatbotSettings,
  resetChatbotSettings,
} from "../controllers/settingsController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public
router.get("/chatbot", getChatbotSettings);

// Admin only
router.put("/chatbot", protect, adminOnly, updateChatbotSettings);
router.post("/chatbot/reset", protect, adminOnly, resetChatbotSettings);

export default router;