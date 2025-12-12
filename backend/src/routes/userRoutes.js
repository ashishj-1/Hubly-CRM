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

router
  .route("/")
  // GET all users - any authenticated user can view team
  .get(getAllUsers)
  // POST create new user - Admin only
  .post(adminOnly, createUser);

router
  .route("/:id")
  // GET single user by ID
  .get(getUserById)
  // PUT update user - Admin can update anyone, members can update self
  .put(updateUser)
  // DELETE user - Admin only
  .delete(adminOnly, deleteUser);

export default router;