import express from "express";
import {
  getMessagesByTicket,
  sendMessage,
} from "../controllers/messageController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/:ticketId").get(protect, getMessagesByTicket);
router.route("/").post(protect, sendMessage);

export default router;