import mongoose from "mongoose";

const { Schema } = mongoose;

const chatbotSettingsSchema = new Schema(
  {
    headerColor: {
      type: String,
      trim: true,
      default: "#334755",
    },
    backgroundColor: {
      type: String,
      trim: true,
      default: "#EEEEEE",
    },
    customMessages: {
      message1: {
        type: String,
        default: "How can I help you?",
        maxlength: [200, "Message cannot exceed 200 characters"],
      },
      message2: {
        type: String,
        default: "Ask me anything!",
        maxlength: [200, "Message cannot exceed 200 characters"],
      },
    },
    introductionForm: {
      nameLabel: { type: String, default: "Your name" },
      namePlaceholder: { type: String, default: "Your name" },
      phoneLabel: { type: String, default: "Your Phone" },
      phonePlaceholder: { type: String, default: "+1 (000) 000-0000" },
      emailLabel: { type: String, default: "Your Email" },
      emailPlaceholder: { type: String, default: "example@gmail.com" },
    },
    welcomeMessage: {
      type: String,
      default:
        "👋 Want to chat about Hubly? I'm an chatbot here to help you find your way.",
      maxlength: [500, "Welcome message cannot exceed 500 characters"],
    },
    missedChatTimer: {
      hours: { type: Number, min: 0, max: 23, default: 0 },
      minutes: { type: Number, min: 0, max: 59, default: 10 },
      seconds: { type: Number, min: 0, max: 59, default: 0 },
    },
  },
  { timestamps: true }
);

chatbotSettingsSchema.methods.getMissedChatTimeInMinutes = function () {
  const t = this.missedChatTimer;
  return t.hours * 60 + t.minutes + t.seconds / 60;
};

export default mongoose.model("ChatbotSettings", chatbotSettingsSchema);