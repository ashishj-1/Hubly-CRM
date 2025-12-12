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
router.route("/").post(createTicket); // Create ticket from landing page

// Protected routes
router.route("/").get(protect, getAllTickets);
router.route("/stats").get(protect, getTicketStats);
router.route("/:id").get(protect, getTicketById).put(protect, updateTicket);

// Admin only routes
router.route("/:id/assign").patch(protect, adminOnly, assignTicket);
router.route("/:id").delete(protect, adminOnly, deleteTicket);

export default router;