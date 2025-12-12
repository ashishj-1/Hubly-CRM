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

router.route("/").get(protect, getAnalytics);
router.route("/missed-chats").get(protect, getMissedChats);
router.route("/reply-time").get(protect, getReplyTime);
router.route("/resolved-tickets").get(protect, getResolvedTickets);
router.route("/total-chats").get(protect, getTotalChatsCount);

export default router;