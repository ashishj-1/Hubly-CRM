import express from "express";
import {
  getChatbotSettings,
  updateChatbotSettings,
  resetChatbotSettings,
} from "../controllers/settingsController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

router
  .route("/chatbot")
  .get(getChatbotSettings)
  .put(protect, adminOnly, updateChatbotSettings);
router.route("/chatbot/reset").post(protect, adminOnly, resetChatbotSettings);

export default router;