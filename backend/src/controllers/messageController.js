import Message from "../models/Message.js";
import Ticket from "../models/Ticket.js";
import { USER_ROLES } from "../config/constants.js";

const canMemberAccess = (ticket, user) =>
  !(user.role === USER_ROLES.MEMBER && String(ticket.assignedTo) !== user.id);

// GET /api/messages/:ticketId
export const getMessagesByTicket = async (req, res, next) => {
  try {
    const { ticketId } = req.params;

    const t = await Ticket.findById(ticketId);
    if (!t) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    if (!canMemberAccess(t, req.user)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view messages for this ticket",
      });
    }

    const msgs = await Message.find({ ticketId })
      .populate("senderId", "firstName lastName role")
      .sort({ timestamp: 1 });

    res.json({
      success: true,
      count: msgs.length,
      messages: msgs,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/messages
export const sendMessage = async (req, res, next) => {
  try {
    const { ticketId, text } = req.body || {};
    const trimmed = text?.trim();

    if (!trimmed) {
      return res.status(400).json({
        success: false,
        message: "Message text is required",
      });
    }

    const t = await Ticket.findById(ticketId);
    if (!t) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    if (!canMemberAccess(t, req.user)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to send message to this ticket",
      });
    }

    const msg = await Message.create({
      ticketId,
      senderId: req.user.id,
      text: trimmed,
    });

    t.lastMessageAt = Date.now();
    await t.save();

    await msg.populate("senderId", "firstName lastName role");

    res.status(201).json({
      success: true,
      message: msg,
    });
  } catch (err) {
    next(err);
  }
};