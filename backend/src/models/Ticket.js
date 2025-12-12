import mongoose from "mongoose";
import { TICKET_STATUS } from "../config/constants.js";

const { Schema, model } = mongoose;

const ticketSchema = new Schema(
  {
    ticketId: {
      type: String,
      unique: true,
    },
    userName: {
      type: String,
      trim: true,
      required: [true, "User name is required"],
    },
    userEmail: {
      type: String,
      trim: true,
      lowercase: true,
      required: [true, "User email is required"],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    userPhone: {
      type: String,
      trim: true,
      required: [true, "User phone is required"],
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: [...Object.values(TICKET_STATUS)],
      default: TICKET_STATUS.OPEN,
    },
    lastMessageAt: {
      type: Date,
      default: () => Date.now(),
    },
    isMissed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

ticketSchema.pre("save", async function (next) {
  if (!this.ticketId) {
    const currentYear = new Date().getFullYear();
    const total = await model("Ticket").countDocuments();
    this.ticketId = `${currentYear}-${String(total + 1).padStart(5, "0")}`;
  }
  next();
});

export default model("Ticket", ticketSchema);