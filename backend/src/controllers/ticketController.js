import Ticket from "../models/Ticket.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import ChatbotSettings from "../models/ChatbotSettings.js";
import { TICKET_STATUS, USER_ROLES } from "../config/constants.js";

// Helper: Check if ticket is missed based on timer settings
const checkIfTicketIsMissed = async (ticket) => {
  try {
    // Get chatbot settings for missed chat timer
    const settings = await ChatbotSettings.findOne();
    if (!settings) return false;

    // Calculate total missed chat time in milliseconds
    const missedChatMs =
      (settings.missedChatTimer.hours || 0) * 60 * 60 * 1000 +
      (settings.missedChatTimer.minutes || 0) * 60 * 1000 +
      (settings.missedChatTimer.seconds || 0) * 1000;

    // If timer is 0, no missed chat logic
    if (missedChatMs === 0) return false;

    // Get messages for this ticket
    const messages = await Message.find({ ticketId: ticket._id }).sort({
      timestamp: 1,
    });

    // If no messages, not missed
    if (messages.length === 0) return false;

    // Check if there's at least one customer message
    const hasCustomerMessage = messages.some((msg) => !msg.senderId);
    if (!hasCustomerMessage) return false;

    // Check if there's at least one staff reply
    const hasStaffReply = messages.some((msg) => msg.senderId);

    // If staff has already replied, not missed
    if (hasStaffReply) return false;

    // Get the first customer message (ticket creation time)
    const firstMessage = messages[0];
    const messageTime = new Date(
      firstMessage.timestamp || firstMessage.createdAt
    );
    const now = new Date();
    const timeDiff = now - messageTime;

    // If time difference exceeds the timer, mark as missed
    return timeDiff > missedChatMs;
  } catch (err) {
    console.error("Error checking missed ticket:", err);
    return false;
  }
};

// GET /api/tickets (infinite scroll)
export const getAllTickets = async (req, res, next) => {
  try {
    const { limit = 20, lastId, status, search } = req.query;
    const query = {};

    // Filter by status
    if (status && Object.values(TICKET_STATUS).includes(status)) {
      query.status = status;
    }

    // Search by ticketId
    if (search) {
      query.ticketId = { $regex: search, $options: "i" };
    }

    // Infinite scroll
    if (lastId) {
      query._id = { $lt: lastId };
    }

    // Visibility rules
    if (req.user.role === USER_ROLES.MEMBER) {
      query.assignedTo = req.user.id;
    } else if (req.user.role === USER_ROLES.ADMIN) {
      console.log("Admin query - sees all tickets");
    }

    const tickets = await Ticket.find(query)
      .populate("assignedTo", "firstName lastName email role")
      .sort({ lastMessageAt: -1, _id: -1 })
      .limit(parseInt(limit));

    // Fetch last message and check missed status for each ticket
    const ticketsWithLastMessage = await Promise.all(
      tickets.map(async (ticket) => {
        try {
          // Get the last message for this ticket
          const lastMessage = await Message.findOne({ ticketId: ticket._id })
            .sort({ timestamp: -1 })
            .limit(1)
            .select("text");

          // Check if ticket is missed
          const isMissed = await checkIfTicketIsMissed(ticket);

          // Convert to plain object and add lastMessage + isMissed
          const ticketObj = ticket.toObject();
          ticketObj.lastMessage = lastMessage ? lastMessage.text : "";
          ticketObj.isMissed = isMissed;

          // Update ticket isMissed field in database if changed
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

// GET /api/tickets/:id
export const getTicketById = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate(
      "assignedTo",
      "firstName lastName email role"
    );

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    // Member access check
    if (req.user.role === USER_ROLES.MEMBER) {
      const assignedToId =
        ticket.assignedTo?._id?.toString() || ticket.assignedTo?.toString();
      const currentUserId = req.user.id.toString();

      if (assignedToId !== currentUserId) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to access this ticket",
        });
      }
    }

    // Load messages
    const messages = await Message.find({ ticketId: ticket._id })
      .populate("senderId", "firstName lastName role")
      .sort({ timestamp: 1 });

    // Check if ticket is missed
    const isMissed = await checkIfTicketIsMissed(ticket);

    // Update ticket if missed status changed
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

// POST /api/tickets (public create with initial message)
export const createTicket = async (req, res, next) => {
  try {
    const { userName, userEmail, userPhone, initialMessage } = req.body;

    console.log("Creating ticket with data:", {
      userName,
      userEmail,
      userPhone,
      hasInitialMessage: !!initialMessage,
    });

    // assign to admin
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

    console.log("Ticket created:", ticket.ticketId);

    // Create initial message if provided
    if (initialMessage && initialMessage.trim()) {
      try {
        const message = await Message.create({
          ticketId: ticket._id,
          senderId: null, // null = customer message
          text: initialMessage.trim(),
        });

        console.log("Initial message created:", message._id);

        // Update ticket's lastMessageAt
        ticket.lastMessageAt = Date.now();
        await ticket.save();

        console.log("Ticket lastMessageAt updated");
      } catch (msgError) {
        console.error("Failed to create initial message:", msgError);
        // Don't fail the ticket creation if message fails
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

// PUT /api/tickets/:id (status update)
export const updateTicket = async (req, res, next) => {
  try {
    const { status } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    // member ownership check
    if (req.user.role === USER_ROLES.MEMBER) {
      const assignedToId = ticket.assignedTo?.toString();
      const currentUserId = req.user.id.toString();

      if (assignedToId !== currentUserId) {
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

// PATCH /api/tickets/:id/assign (admin)
export const assignTicket = async (req, res, next) => {
  try {
    const memberId = req.body.assignedTo || req.body.userId;

    if (!memberId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    // verify user
    const user = await User.findById(memberId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

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

// DELETE /api/tickets/:id (admin)
export const deleteTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    await Message.deleteMany({ ticketId: ticket._id });
    await ticket.deleteOne();

    res.json({
      success: true,
      message: "Ticket deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/tickets/stats
export const getTicketStats = async (req, res, next) => {
  try {
    const query = {};

    // member-only scope
    if (req.user.role === USER_ROLES.MEMBER) {
      query.assignedTo = req.user.id;
    }

    const allTickets = await Ticket.countDocuments(query);
    const resolvedTickets = await Ticket.countDocuments({
      ...query,
      status: TICKET_STATUS.RESOLVED,
    });
    const unresolvedTickets = await Ticket.countDocuments({
      ...query,
      status: { $ne: TICKET_STATUS.RESOLVED },
    });

    res.json({
      success: true,
      stats: {
        allTickets,
        resolvedTickets,
        unresolvedTickets,
      },
    });
  } catch (error) {
    next(error);
  }
};