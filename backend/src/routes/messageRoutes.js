import express from "express";
import {
  getMessagesByTicket,
  sendMessage,
} from "../controllers/messageController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Protected message routes
router.get("/:ticketId", protect, getMessagesByTicket);
router.post("/", protect, sendMessage);

export default router;