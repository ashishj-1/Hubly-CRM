import Ticket from "../models/Ticket.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import ChatbotSettings from "../models/ChatbotSettings.js";
import { TICKET_STATUS, USER_ROLES } from "../config/constants.js";

/* Missed chat helper */
const checkIfTicketIsMissed = async (ticket) => {
  try {
    const settings = await ChatbotSettings.findOne();
    if (!settings) return false;

    const ms =
      Number(settings?.missedChatTimer?.hours || 0) * 60 * 60 * 1000 +
      Number(settings?.missedChatTimer?.minutes || 0) * 60 * 1000 +
      Number(settings?.missedChatTimer?.seconds || 0) * 1000;

    if (ms === 0) return false; // Timer disabled

    // All messages oldest → newest
    const messages = await Message.find({ ticketId: ticket._id }).sort({
      timestamp: 1,
    });
    if (!messages.length) return false;

    const firstCustomer = messages.find((m) => !m.senderId);
    if (!firstCustomer) return false;

    const firstCustomerTime = new Date(
      firstCustomer.timestamp || firstCustomer.createdAt
    ).getTime();

    const staffRepliedAfter = messages.some((m) => {
      if (!m.senderId) return false;
      const t = new Date(m.timestamp || m.createdAt).getTime();
      return t > firstCustomerTime;
    });
    if (staffRepliedAfter) return false;

    return Date.now() - firstCustomerTime > ms;
  } catch (err) {
    console.error("Missed-ticket-check error:", err);
    return false;
  }
};

/* Get all tickets */
export const getAllTickets = async (req, res, next) => {
  try {
    const { limit = 20, lastId, status, search } = req.query;
    const query = {};

    if (status && Object.values(TICKET_STATUS).includes(status)) {
      query.status = status;
    }
    if (search) {
      query.ticketId = { $regex: search, $options: "i" };
    }
    if (lastId) {
      query._id = { $lt: lastId };
    }

    if (req.user.role === USER_ROLES.MEMBER) {
      query.assignedTo = req.user.id;
    }

    const tickets = await Ticket.find(query)
      .populate("assignedTo", "firstName lastName email role")
      .sort({ lastMessageAt: -1, _id: -1 })
      .limit(parseInt(limit));

    const ticketsWithLastMessage = await Promise.all(
      tickets.map(async (ticket) => {
        try {
          const lastMessage = await Message.findOne({ ticketId: ticket._id })
            .sort({ timestamp: -1 })
            .limit(1)
            .select("text");

          const isMissed = await checkIfTicketIsMissed(ticket);

          const ticketObj = ticket.toObject();
          ticketObj.lastMessage = lastMessage ? lastMessage.text : "";
          ticketObj.isMissed = isMissed;

          if (ticket.isMissed !== isMissed) {
            await Ticket.findByIdAndUpdate(ticket._id, { isMissed });
          }

          return ticketObj;
        } catch (err) {
          console.error(
            `Error fetching last message for ticket ${ticket._id}:`,
            err
          );
          const ticketObj = ticket.toObject();
          ticketObj.lastMessage = "";
          ticketObj.isMissed = false;
          return ticketObj;
        }
      })
    );

    const hasMore = tickets.length === parseInt(limit);

    res.json({
      success: true,
      count: ticketsWithLastMessage.length,
      tickets: ticketsWithLastMessage,
      hasMore,
      lastId: tickets.length > 0 ? tickets[tickets.length - 1]._id : null,
    });
  } catch (error) {
    next(error);
  }
};

/* Get single ticket */
export const getTicketById = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate(
      "assignedTo",
      "firstName lastName email role"
    );

    if (!ticket) {
      return res
        .status(404)
        .json({ success: false, message: "Ticket not found" });
    }

    if (req.user.role === USER_ROLES.MEMBER) {
      const assignedToId =
        ticket.assignedTo?._id?.toString() || ticket.assignedTo?.toString();
      if (assignedToId !== req.user.id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to access this ticket",
        });
      }
    }

    const messages = await Message.find({ ticketId: ticket._id })
      .populate("senderId", "firstName lastName role")
      .sort({ timestamp: 1 });

    const isMissed = await checkIfTicketIsMissed(ticket);
    if (ticket.isMissed !== isMissed) {
      ticket.isMissed = isMissed;
      await ticket.save();
    }

    res.json({
      success: true,
      ticket: { ...ticket.toObject(), isMissed },
      messages,
    });
  } catch (error) {
    next(error);
  }
};

/* Create ticket */
export const createTicket = async (req, res, next) => {
  try {
    const { userName, userEmail, userPhone, initialMessage } = req.body;

    const admin = await User.findOne({ role: USER_ROLES.ADMIN });
    if (!admin) {
      return res.status(500).json({
        success: false,
        message: "No admin user found. Please create an admin account first.",
      });
    }

    const ticket = await Ticket.create({
      userName,
      userEmail,
      userPhone,
      assignedTo: admin._id,
      status: TICKET_STATUS.OPEN,
    });

    if (initialMessage && initialMessage.trim()) {
      try {
        await Message.create({
          ticketId: ticket._id,
          senderId: null, // customer
          text: initialMessage.trim(),
        });

        ticket.lastMessageAt = Date.now();
        await ticket.save();
      } catch (e) {
        console.error("Failed to create initial message:", e);
      }
    }

    res.status(201).json({
      success: true,
      message:
        "Ticket created successfully. Our team will get back to you soon.",
      ticket: {
        id: ticket._id,
        ticketId: ticket.ticketId,
        userName: ticket.userName,
        userEmail: ticket.userEmail,
      },
    });
  } catch (error) {
    console.error("Error creating ticket:", error);
    next(error);
  }
};

/* Update ticket */
export const updateTicket = async (req, res, next) => {
  try {
    const { status } = req.body;
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket)
      return res
        .status(404)
        .json({ success: false, message: "Ticket not found" });

    if (req.user.role === USER_ROLES.MEMBER) {
      const assignedToId = ticket.assignedTo?.toString();
      if (assignedToId !== req.user.id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to update this ticket",
        });
      }
    }

    if (status && Object.values(TICKET_STATUS).includes(status)) {
      ticket.status = status;
    }

    await ticket.save();
    await ticket.populate("assignedTo", "firstName lastName email role");

    res.json({
      success: true,
      message: "Ticket updated successfully",
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};

/* Assign ticket */
export const assignTicket = async (req, res, next) => {
  try {
    const memberId = req.body.assignedTo || req.body.userId;
    if (!memberId)
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket)
      return res
        .status(404)
        .json({ success: false, message: "Ticket not found" });

    const user = await User.findById(memberId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const oldAssignedTo = ticket.assignedTo?.toString();
    ticket.assignedTo = memberId;
    await ticket.save();
    await ticket.populate("assignedTo", "firstName lastName email role");

    console.log(
      "Assigned ticket:",
      ticket._id,
      "from:",
      oldAssignedTo,
      "to:",
      memberId
    );

    res.json({
      success: true,
      message: "Ticket assigned successfully",
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};

/* Delete ticket */
export const deleteTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket)
      return res
        .status(404)
        .json({ success: false, message: "Ticket not found" });

    await Message.deleteMany({ ticketId: ticket._id });
    await ticket.deleteOne();

    res.json({ success: true, message: "Ticket deleted successfully" });
  } catch (error) {
    next(error);
  }
};

/* Analytics */
/* Recomputes isMissed before returning counts so charts stay fresh */
export const getTicketStats = async (req, res, next) => {
  try {
    const scope = {};
    if (req.user.role === USER_ROLES.MEMBER) {
      scope.assignedTo = req.user.id;
    }

    const allForMissed = await Ticket.find(scope).select("_id isMissed");
    await Promise.all(
      allForMissed.map(async (t) => {
        const isMissed = await checkIfTicketIsMissed(t);
        if (t.isMissed !== isMissed) {
          await Ticket.findByIdAndUpdate(t._id, { isMissed });
        }
      })
    );

    const allTickets = await Ticket.countDocuments(scope);
    const resolvedTickets = await Ticket.countDocuments({
      ...scope,
      status: TICKET_STATUS.RESOLVED,
    });
    const unresolvedTickets = await Ticket.countDocuments({
      ...scope,
      status: { $ne: TICKET_STATUS.RESOLVED },
    });
    const missedTickets = await Ticket.countDocuments({
      ...scope,
      isMissed: true,
    });

    res.json({
      success: true,
      stats: {
        allTickets,
        resolvedTickets,
        unresolvedTickets,
        missedTickets,
      },
    });
  } catch (error) {
    next(error);
  }
};