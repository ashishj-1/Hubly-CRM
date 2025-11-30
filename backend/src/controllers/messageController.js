import Message from "../models/Message.js";
import Ticket from "../models/Ticket.js";
import { USER_ROLES } from "../config/constants.js";

// GET /api/messages/:ticketId
export const getMessagesByTicket = async (req, res, next) => {
  try {
    const { ticketId } = req.params;

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    // Member permission check
    if (
      req.user.role === USER_ROLES.MEMBER &&
      ticket.assignedTo.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view messages for this ticket",
      });
    }

    const messages = await Message.find({ ticketId })
      .populate("senderId", "firstName lastName role")
      .sort({ timestamp: 1 });

    res.json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/messages
export const sendMessage = async (req, res, next) => {
  try {
    const { ticketId, text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message text is required",
      });
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    // Member permission check
    if (
      req.user.role === USER_ROLES.MEMBER &&
      ticket.assignedTo.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to send message to this ticket",
      });
    }

    const message = await Message.create({
      ticketId,
      senderId: req.user.id,
      text: text.trim(),
    });

    ticket.lastMessageAt = Date.now();
    await ticket.save();

    await message.populate("senderId", "firstName lastName role");

    res.status(201).json({
      success: true,
      message,
    });
  } catch (error) {
    next(error);
  }
};