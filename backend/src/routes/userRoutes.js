import express from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All routes are protected
router.use(protect);

// GET all users - any authenticated user can view team
router.get("/", getAllUsers);

// GET single user by ID
router.get("/:id", getUserById);

// POST create new user - Admin only
router.post("/", adminOnly, createUser);

// PUT update user - Admin can update anyone, members can update self
router.put("/:id", updateUser);

// DELETE user - Admin only
router.delete("/:id", adminOnly, deleteUser);

export default router;