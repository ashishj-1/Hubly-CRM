import Ticket from "../models/Ticket.js";
import User from "../models/User.js";
import { USER_ROLES } from "../config/constants.js";

export const reassignTicketsToAdmin = async (deletedUserId) => {
  try {
    const admin = await User.findOne({ role: USER_ROLES.ADMIN }).select("_id");
    if (!admin?._id) throw new Error("No admin found to reassign tickets");

    const { modifiedCount } = await Ticket.updateMany(
      { assignedTo: deletedUserId },
      { assignedTo: admin._id }
    );

    return { success: true, ticketsReassigned: modifiedCount };
  } catch (e) {
    throw e;
  }
};

export const checkMissedChats = async (timerInMinutes) => {
  try {
    const cutoff = new Date(Date.now() - Number(timerInMinutes || 0) * 60000);

    const { modifiedCount } = await Ticket.updateMany(
      {
        status: { $ne: "resolved" },
        lastMessageAt: { $lt: cutoff },
        isMissed: false,
      },
      { isMissed: true }
    );

    return { success: true, missedChatsMarked: modifiedCount };
  } catch (e) {
    throw e;
  }
};

export const getTicketStatistics = async (userId = null, role = null) => {
  try {
    const base = role === USER_ROLES.MEMBER ? { assignedTo: userId } : {};

    const [
      totalTickets,
      resolvedTickets,
      openTickets,
      inProgressTickets,
      missedChats,
    ] = await Promise.all([
      Ticket.countDocuments(base),
      Ticket.countDocuments({ ...base, status: "resolved" }),
      Ticket.countDocuments({ ...base, status: "open" }),
      Ticket.countDocuments({ ...base, status: "in_progress" }),
      Ticket.countDocuments({ ...base, isMissed: true }),
    ]);

    return {
      totalTickets,
      resolvedTickets,
      openTickets,
      inProgressTickets,
      missedChats,
      unresolvedTickets: totalTickets - resolvedTickets,
    };
  } catch (e) {
    throw e;
  }
};