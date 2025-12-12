import Ticket from "../models/Ticket.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import ChatbotSettings from "../models/ChatbotSettings.js";
import { TICKET_STATUS, USER_ROLES } from "../config/constants.js";

const msFromTimer = (t = {}) =>
  Number(t.hours || 0) * 3600000 +
  Number(t.minutes || 0) * 60000 +
  Number(t.seconds || 0) * 1000;

const memberCanAccess = (ticket, user) =>
  !(
    user.role === USER_ROLES.MEMBER &&
    String(ticket.assignedTo) !== String(user.id)
  );

const checkIfTicketIsMissed = async (ticket) => {
  try {
    const cfg = await ChatbotSettings.findOne();
    if (!cfg) return false;

    const waitMs = msFromTimer(cfg.missedChatTimer);
    if (!waitMs) return false;

    const msgs = await Message.find({ ticketId: ticket._id }).sort({
      timestamp: 1,
    });
    if (!msgs.length) return false;

    const firstCustomer = msgs.find((m) => !m.senderId);
    if (!firstCustomer) return false;

    const firstAt = new Date(
      firstCustomer.timestamp || firstCustomer.createdAt
    ).getTime();
    const staffAfter = msgs.some(
      (m) =>
        m.senderId && new Date(m.timestamp || m.createdAt).getTime() > firstAt
    );
    if (staffAfter) return false;

    return Date.now() - firstAt > waitMs;
  } catch {
    return false;
  }
};

/* Get all tickets */
export const getAllTickets = async (req, res, next) => {
  try {
    const { limit = 20, lastId, status, search } = req.query;
    const q = {};

    if (status && Object.values(TICKET_STATUS).includes(status))
      q.status = status;
    if (search) q.ticketId = { $regex: search, $options: "i" };
    if (lastId) q._id = { $lt: lastId };
    if (req.user.role === USER_ROLES.MEMBER) q.assignedTo = req.user.id;

    const limitNum = parseInt(limit);
    const list = await Ticket.find(q)
      .populate("assignedTo", "firstName lastName email role")
      .sort({ lastMessageAt: -1, _id: -1 })
      .limit(limitNum);

    const augmented = await Promise.all(
      list.map(async (t) => {
        try {
          const last = await Message.findOne({ ticketId: t._id })
            .sort({ timestamp: -1 })
            .limit(1)
            .select("text");

          const missed = await checkIfTicketIsMissed(t);

          if (t.isMissed !== missed) {
            await Ticket.findByIdAndUpdate(t._id, { isMissed: missed });
          }

          const o = t.toObject();
          o.lastMessage = last ? last.text : "";
          o.isMissed = missed;
          return o;
        } catch {
          const o = t.toObject();
          o.lastMessage = "";
          o.isMissed = false;
          return o;
        }
      })
    );

    const hasMore = list.length === limitNum;

    res.json({
      success: true,
      count: augmented.length,
      tickets: augmented,
      hasMore,
      lastId: list.length ? list[list.length - 1]._id : null,
    });
  } catch (err) {
    next(err);
  }
};

/* Get single ticket */
export const getTicketById = async (req, res, next) => {
  try {
    const t = await Ticket.findById(req.params.id).populate(
      "assignedTo",
      "firstName lastName email role"
    );

    if (!t) {
      return res
        .status(404)
        .json({ success: false, message: "Ticket not found" });
    }

    if (!memberCanAccess(t, req.user)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this ticket",
      });
    }

    const msgs = await Message.find({ ticketId: t._id })
      .populate("senderId", "firstName lastName role")
      .sort({ timestamp: 1 });

    const missed = await checkIfTicketIsMissed(t);
    if (t.isMissed !== missed) {
      t.isMissed = missed;
      await t.save();
    }

    res.json({
      success: true,
      ticket: { ...t.toObject(), isMissed: missed },
      messages: msgs,
    });
  } catch (err) {
    next(err);
  }
};

/* Create ticket */
export const createTicket = async (req, res, next) => {
  try {
    const { userName, userEmail, userPhone, initialMessage } = req.body || {};

    const admin = await User.findOne({ role: USER_ROLES.ADMIN });
    if (!admin) {
      return res.status(500).json({
        success: false,
        message: "No admin user found. Please create an admin account first.",
      });
    }

    const t = await Ticket.create({
      userName,
      userEmail,
      userPhone,
      assignedTo: admin._id,
      status: TICKET_STATUS.OPEN,
    });

    const text = initialMessage?.trim();
    if (text) {
      try {
        await Message.create({
          ticketId: t._id,
          senderId: null,
          text,
        });
        t.lastMessageAt = Date.now();
        await t.save();
      } catch {}
    }

    res.status(201).json({
      success: true,
      message:
        "Ticket created successfully. Our team will get back to you soon.",
      ticket: {
        id: t._id,
        ticketId: t.ticketId,
        userName: t.userName,
        userEmail: t.userEmail,
      },
    });
  } catch (err) {
    next(err);
  }
};

/* Update ticket */
export const updateTicket = async (req, res, next) => {
  try {
    const { status } = req.body || {};
    const t = await Ticket.findById(req.params.id);
    if (!t) {
      return res
        .status(404)
        .json({ success: false, message: "Ticket not found" });
    }

    if (!memberCanAccess(t, req.user)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this ticket",
      });
    }

    if (status && Object.values(TICKET_STATUS).includes(status)) {
      t.status = status;
    }

    await t.save();
    await t.populate("assignedTo", "firstName lastName email role");

    res.json({
      success: true,
      message: "Ticket updated successfully",
      data: t,
    });
  } catch (err) {
    next(err);
  }
};

/* Assign ticket */
export const assignTicket = async (req, res, next) => {
  try {
    const memberId = req.body?.assignedTo || req.body?.userId;
    if (!memberId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    const t = await Ticket.findById(req.params.id);
    if (!t) {
      return res
        .status(404)
        .json({ success: false, message: "Ticket not found" });
    }

    const user = await User.findById(memberId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const prev = t.assignedTo?.toString();
    t.assignedTo = memberId;
    await t.save();
    await t.populate("assignedTo", "firstName lastName email role");

    console.log(
      "Ticket reassigned:",
      String(t._id),
      "from:",
      prev,
      "to:",
      String(memberId)
    );

    res.json({
      success: true,
      message: "Ticket assigned successfully",
      data: t,
    });
  } catch (err) {
    next(err);
  }
};

/* Delete ticket */
export const deleteTicket = async (req, res, next) => {
  try {
    const t = await Ticket.findById(req.params.id);
    if (!t) {
      return res
        .status(404)
        .json({ success: false, message: "Ticket not found" });
    }

    await Message.deleteMany({ ticketId: t._id });
    await t.deleteOne();

    res.json({ success: true, message: "Ticket deleted successfully" });
  } catch (err) {
    next(err);
  }
};

/* Analytics */
export const getTicketStats = async (req, res, next) => {
  try {
    const base = {};
    if (req.user.role === USER_ROLES.MEMBER) base.assignedTo = req.user.id;

    const toRefresh = await Ticket.find(base).select("_id isMissed");
    await Promise.all(
      toRefresh.map(async (t) => {
        const missed = await checkIfTicketIsMissed(t);
        if (t.isMissed !== missed) {
          await Ticket.findByIdAndUpdate(t._id, { isMissed: missed });
        }
      })
    );

    const allTickets = await Ticket.countDocuments(base);
    const resolvedTickets = await Ticket.countDocuments({
      ...base,
      status: TICKET_STATUS.RESOLVED,
    });
    const unresolvedTickets = await Ticket.countDocuments({
      ...base,
      status: { $ne: TICKET_STATUS.RESOLVED },
    });
    const missedTickets = await Ticket.countDocuments({
      ...base,
      isMissed: true,
    });

    res.json({
      success: true,
      stats: { allTickets, resolvedTickets, unresolvedTickets, missedTickets },
    });
  } catch (err) {
    next(err);
  }
};