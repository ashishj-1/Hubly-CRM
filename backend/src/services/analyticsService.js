import Ticket from "../models/Ticket.js";
import Message from "../models/Message.js";
import ChatbotSettings from "../models/ChatbotSettings.js";
import { USER_ROLES, TICKET_STATUS } from "../config/constants.js";

// Get ISO week number
const getISOWeek = (date) => {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
};

// Get ISO week year
const getISOWeekYear = (date) => {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  return d.getUTCFullYear();
};

// Mark tickets as missed
export const updateMissedChats = async () => {
  try {
    const settings = await ChatbotSettings.findOne();
    const hours = settings?.missedChatTimer?.hours || 0;
    const minutes = settings?.missedChatTimer?.minutes || 10;
    const seconds = settings?.missedChatTimer?.seconds || 0;

    const timerMs = (hours * 60 * 60 + minutes * 60 + seconds) * 1000;
    const now = new Date();

    const tickets = await Ticket.find({
      status: {
        $in: [
          TICKET_STATUS.OPEN,
          "open",
          TICKET_STATUS.IN_PROGRESS,
          "in_progress",
        ],
      },
      isMissed: false,
    });

    for (const ticket of tickets) {
      const adminReply = await Message.findOne({
        ticketId: ticket._id,
        senderType: { $in: ["admin", "member", "Admin", "Member"] },
      });

      if (!adminReply) {
        const timeSinceCreation = now - new Date(ticket.createdAt);
        if (timeSinceCreation > timerMs) {
          ticket.isMissed = true;
          await ticket.save();
        }
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating missed chats:", error);
    throw error;
  }
};

// Calculate average reply time
export const getAverageReplyTime = async (userId = null, role = null) => {
  try {
    const matchQuery = {};

    if (role === USER_ROLES.MEMBER) {
      const tickets = await Ticket.find({ assignedTo: userId }).select("_id");
      const ticketIds = tickets.map((t) => t._id);
      matchQuery.ticketId = { $in: ticketIds };
    }

    const result = await Message.aggregate([
      { $match: matchQuery },
      { $sort: { ticketId: 1, timestamp: 1 } },
      {
        $group: {
          _id: "$ticketId",
          messages: { $push: { timestamp: "$timestamp" } },
        },
      },
    ]);

    let totalReplyTime = 0;
    let replyCount = 0;

    result.forEach((ticket) => {
      const messages = ticket.messages;
      if (messages.length > 1) {
        const firstReplyTime = messages[1].timestamp - messages[0].timestamp;
        totalReplyTime += firstReplyTime;
        replyCount++;
      }
    });

    const averageReplyTimeMs = replyCount > 0 ? totalReplyTime / replyCount : 0;
    const averageReplyTimeSeconds = Math.round(averageReplyTimeMs / 1000);

    return { averageReplyTimeSeconds, replyCount };
  } catch (error) {
    throw error;
  }
};

// Get missed chats over time
export const getMissedChatsOverTime = async (
  weeks = 10,
  userId = null,
  role = null
) => {
  try {
    await updateMissedChats();

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - weeks * 7);

    const matchQuery = { createdAt: { $gte: startDate }, isMissed: true };
    if (role === USER_ROLES.MEMBER) matchQuery.assignedTo = userId;

    const result = await Ticket.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            week: { $isoWeek: "$createdAt" },
            year: { $isoWeekYear: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.week": 1 } },
    ]);

    const missedChatsMap = {};
    result.forEach((item) => {
      const key = `${item._id.year}-${item._id.week}`;
      missedChatsMap[key] = item.count;
    });

    const formattedData = [];
    const now = new Date();

    for (let i = weeks - 1; i >= 0; i--) {
      const weekDate = new Date();
      weekDate.setDate(now.getDate() - i * 7);

      const weekNum = getISOWeek(weekDate);
      const year = getISOWeekYear(weekDate);
      const key = `${year}-${weekNum}`;

      formattedData.push({
        week: `Week ${weeks - i}`,
        chats: missedChatsMap[key] || 0,
      });
    }

    return formattedData;
  } catch (error) {
    throw error;
  }
};

// Get resolved vs unresolved
export const getResolvedTicketsData = async (userId = null, role = null) => {
  try {
    const query = {};
    if (role === USER_ROLES.MEMBER) query.assignedTo = userId;

    const resolvedCount = await Ticket.countDocuments({
      ...query,
      status: "resolved",
    });
    const unresolvedCount = await Ticket.countDocuments({
      ...query,
      status: { $ne: "resolved" },
    });

    const total = resolvedCount + unresolvedCount;
    const percentage =
      total > 0 ? Math.round((resolvedCount / total) * 100) : 0;

    return { resolved: resolvedCount, unresolved: unresolvedCount, percentage };
  } catch (error) {
    throw error;
  }
};

// Get total chats
export const getTotalChats = async (
  startDate = null,
  endDate = null,
  userId = null,
  role = null
) => {
  try {
    const query = {};

    if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    if (role === USER_ROLES.MEMBER) query.assignedTo = userId;

    const totalChats = await Ticket.countDocuments(query);

    return { totalChats, startDate, endDate };
  } catch (error) {
    throw error;
  }
};