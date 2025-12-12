import mongoose from "mongoose";

const { Schema, model } = mongoose;

const messageSchema = new Schema(
  {
    ticketId: {
      type: Schema.Types.ObjectId,
      ref: "Ticket",
      required: true,
      index: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    text: {
      type: String,
      trim: true,
      required: [true, "Message text is required"],
    },
    timestamp: {
      type: Date,
      default: () => Date.now(),
    },
  },
  { timestamps: true }
);

messageSchema.index({ ticketId: 1, timestamp: 1 });

export default model("Message", messageSchema);