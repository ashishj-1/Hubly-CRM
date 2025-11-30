import express from "express";
import {
  getAllTickets,
  getTicketById,
  createTicket,
  updateTicket,
  assignTicket,
  deleteTicket,
  getTicketStats,
} from "../controllers/ticketController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/", createTicket); // Create ticket from landing page

// Protected routes
router.get("/", protect, getAllTickets);
router.get("/stats", protect, getTicketStats);
router.get("/:id", protect, getTicketById);
router.put("/:id", protect, updateTicket);

// Admin only routes
router.patch("/:id/assign", protect, adminOnly, assignTicket);
router.delete("/:id", protect, adminOnly, deleteTicket);

export default router;