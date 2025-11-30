import express from "express";
import {
  getAnalytics,
  getMissedChats,
  getReplyTime,
  getResolvedTickets,
  getTotalChatsCount,
} from "../controllers/analyticsController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Protected analytics routes
router.get("/", protect, getAnalytics);
router.get("/missed-chats", protect, getMissedChats);
router.get("/reply-time", protect, getReplyTime);
router.get("/resolved-tickets", protect, getResolvedTickets);
router.get("/total-chats", protect, getTotalChatsCount);

export default router;