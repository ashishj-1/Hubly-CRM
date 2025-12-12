import Ticket from "../models/Ticket.js";
import User from "../models/User.js";
import { USER_ROLES } from "../config/constants.js";

// Reassign all tickets from a deleted user to admin
// Called when deleting a team member (from teamController.js)
export const reassignTicketsToAdmin = async (deletedUserId) => {
  try {
    const adminUser = await User.findOne({ role: USER_ROLES.ADMIN });
    if (!adminUser) {
      throw new Error("No admin found to reassign tickets");
    }

    const updateResult = await Ticket.updateMany(
      { assignedTo: deletedUserId },
      { $set: { assignedTo: adminUser._id } }
    );

    return {
      success: true,
      ticketsReassigned: updateResult.modifiedCount,
    };
  } catch (err) {
    throw err;
  }
};

// Mark tickets as missed based on timer setting
// Used in background job or periodic cron task
export const checkMissedChats = async (timerInMinutes) => {
  try {
    const limitTime = new Date(Date.now() - Number(timerInMinutes) * 60 * 1000);

    const updateResult = await Ticket.updateMany(
      {
        status: { $ne: "resolved" },
        lastMessageAt: { $lt: limitTime },
        isMissed: false,
      },
      { $set: { isMissed: true } }
    );

    return {
      success: true,
      missedChatsMarked: updateResult.modifiedCount,
    };
  } catch (err) {
    throw err;
  }
};

// Get ticket statistics optionally filtered by user and role
// Used in dashboard, reports, or metrics view
export const getTicketStatistics = async (userId = null, role = null) => {
  try {
    const baseQuery =
      role === USER_ROLES.MEMBER && userId ? { assignedTo: userId } : {};

    const [
      totalTickets,
      resolvedTickets,
      openTickets,
      inProgressTickets,
      missedChats,
    ] = await Promise.all([
      Ticket.countDocuments(baseQuery),
      Ticket.countDocuments({ ...baseQuery, status: "resolved" }),
      Ticket.countDocuments({ ...baseQuery, status: "open" }),
      Ticket.countDocuments({ ...baseQuery, status: "in_progress" }),
      Ticket.countDocuments({ ...baseQuery, isMissed: true }),
    ]);

    return {
      totalTickets,
      resolvedTickets,
      openTickets,
      inProgressTickets,
      missedChats,
      unresolvedTickets: totalTickets - resolvedTickets,
    };
  } catch (err) {
    throw err;
  }
};