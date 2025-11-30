import mongoose from "mongoose";
import { TICKET_STATUS } from "../config/constants.js";

const ticketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      unique: true,
    },
    userName: {
      type: String,
      required: [true, "User name is required"],
      trim: true,
    },
    userEmail: {
      type: String,
      required: [true, "User email is required"],
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    userPhone: {
      type: String,
      required: [true, "User phone is required"],
      trim: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(TICKET_STATUS),
      default: TICKET_STATUS.OPEN,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    isMissed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Auto-generate ticketId
ticketSchema.pre("save", async function (next) {
  if (!this.ticketId) {
    const year = new Date().getFullYear();
    const count = await mongoose.model("Ticket").countDocuments();
    this.ticketId = `${year}-${String(count + 1).padStart(5, "0")}`;
  }
  next();
});

export default mongoose.model("Ticket", ticketSchema);