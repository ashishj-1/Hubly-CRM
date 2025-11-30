import Ticket from "../models/Ticket.js";
import User from "../models/User.js";
import { USER_ROLES } from "../config/constants.js";

// Reassign all tickets from a deleted user to admin
// Called when deleting a team member (from teamController.js)
export const reassignTicketsToAdmin = async (deletedUserId) => {
  try {
    const admin = await User.findOne({ role: USER_ROLES.ADMIN });
    if (!admin) throw new Error("No admin found to reassign tickets");

    const result = await Ticket.updateMany(
      { assignedTo: deletedUserId },
      { assignedTo: admin._id }
    );

    return {
      success: true,
      ticketsReassigned: result.modifiedCount,
    };
  } catch (error) {
    throw error;
  }
};

// Mark tickets as missed based on timer setting
// Used in background job or periodic cron task
export const checkMissedChats = async (timerInMinutes) => {
  try {
    const cutoffTime = new Date(Date.now() - timerInMinutes * 60 * 1000);

    const result = await Ticket.updateMany(
      {
        status: { $ne: "resolved" },
        lastMessageAt: { $lt: cutoffTime },
        isMissed: false,
      },
      { isMissed: true }
    );

    return {
      success: true,
      missedChatsMarked: result.modifiedCount,
    };
  } catch (error) {
    throw error;
  }
};

// Get ticket statistics optionally filtered by user and role
// Used in dashboard, reports, or metrics view
export const getTicketStatistics = async (userId = null, role = null) => {
  try {
    const query = {};
    if (role === USER_ROLES.MEMBER) {
      query.assignedTo = userId;
    }

    const totalTickets = await Ticket.countDocuments(query);
    const resolvedTickets = await Ticket.countDocuments({
      ...query,
      status: "resolved",
    });
    const openTickets = await Ticket.countDocuments({
      ...query,
      status: "open",
    });
    const inProgressTickets = await Ticket.countDocuments({
      ...query,
      status: "in_progress",
    });
    const missedChats = await Ticket.countDocuments({
      ...query,
      isMissed: true,
    });

    return {
      totalTickets,
      resolvedTickets,
      openTickets,
      inProgressTickets,
      missedChats,
      unresolvedTickets: totalTickets - resolvedTickets,
    };
  } catch (error) {
    throw error;
  }
};