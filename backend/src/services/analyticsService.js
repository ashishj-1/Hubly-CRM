import Ticket from "../models/Ticket.js";
import Message from "../models/Message.js";
import ChatbotSettings from "../models/ChatbotSettings.js";
import { USER_ROLES, TICKET_STATUS } from "../config/constants.js";

const isoWeek = (dt) => {
  const d = new Date(Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
};

const isoWeekYear = (dt) => {
  const d = new Date(Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  return d.getUTCFullYear();
};

const timerToMs = (cfg) => {
  const h = Number(cfg?.hours || 0);
  const m = Number(cfg?.minutes || 10);
  const s = Number(cfg?.seconds || 0);
  return (h * 3600 + m * 60 + s) * 1000;
};

// Mark tickets as missed
export const updateMissedChats = async () => {
  try {
    const settings = await ChatbotSettings.findOne();
    const waitMs = timerToMs(settings?.missedChatTimer);
    const now = Date.now();

    const openish = [
      TICKET_STATUS.OPEN,
      "open",
      TICKET_STATUS.IN_PROGRESS,
      "in_progress",
    ];

    const candidates = await Ticket.find({
      status: { $in: openish },
      isMissed: false,
    });

    for (const t of candidates) {
      const adminReply = await Message.findOne({
        ticketId: t._id,
        senderType: { $in: ["admin", "member", "Admin", "Member"] },
      });

      if (!adminReply) {
        const since = now - new Date(t.createdAt).getTime();
        if (since > waitMs) {
          t.isMissed = true;
          await t.save();
        }
      }
    }

    return { success: true };
  } catch (e) {
    console.error("Error updating missed chats:", e);
    throw e;
  }
};

// Calculate average reply time
export const getAverageReplyTime = async (userId = null, role = null) => {
  try {
    const match = {};

    if (role === USER_ROLES.MEMBER) {
      const ids = await Ticket.find({ assignedTo: userId }).select("_id");
      match.ticketId = { $in: ids.map((t) => t._id) };
    }

    const grouped = await Message.aggregate([
      { $match: match },
      { $sort: { ticketId: 1, timestamp: 1 } },
      {
        $group: {
          _id: "$ticketId",
          messages: { $push: { timestamp: "$timestamp" } },
        },
      },
    ]);

    const { totalMs, count } = grouped.reduce(
      (acc, t) => {
        const msgs = t.messages;
        if (msgs.length > 1) {
          acc.totalMs += msgs[1].timestamp - msgs[0].timestamp;
          acc.count += 1;
        }
        return acc;
      },
      { totalMs: 0, count: 0 }
    );

    const averageReplyTimeMs = count ? totalMs / count : 0;
    const averageReplyTimeSeconds = Math.round(averageReplyTimeMs / 1000);

    return { averageReplyTimeSeconds, replyCount: count };
  } catch (e) {
    throw e;
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

    const start = new Date();
    start.setDate(start.getDate() - weeks * 7);

    const match = { createdAt: { $gte: start }, isMissed: true };
    if (role === USER_ROLES.MEMBER) match.assignedTo = userId;

    const agg = await Ticket.aggregate([
      { $match: match },
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

    const byWeek = {};
    agg.forEach((row) => {
      const key = `${row._id.year}-${row._id.week}`;
      byWeek[key] = row.count;
    });

    const out = [];
    const now = new Date();

    for (let i = weeks - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i * 7);
      const w = isoWeek(d);
      const y = isoWeekYear(d);
      const key = `${y}-${w}`;

      out.push({
        week: `Week ${weeks - i}`,
        chats: byWeek[key] || 0,
      });
    }

    return out;
  } catch (e) {
    throw e;
  }
};

// Get resolved vs unresolved
export const getResolvedTicketsData = async (userId = null, role = null) => {
  try {
    const filter = {};
    if (role === USER_ROLES.MEMBER) filter.assignedTo = userId;

    const resolved = await Ticket.countDocuments({
      ...filter,
      status: "resolved",
    });
    const unresolved = await Ticket.countDocuments({
      ...filter,
      status: { $ne: "resolved" },
    });

    const total = resolved + unresolved;
    const percentage = total ? Math.round((resolved / total) * 100) : 0;

    return { resolved, unresolved, percentage };
  } catch (e) {
    throw e;
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
    const filter = {};

    if (startDate && endDate) {
      filter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    if (role === USER_ROLES.MEMBER) filter.assignedTo = userId;

    const totalChats = await Ticket.countDocuments(filter);

    return { totalChats, startDate, endDate };
  } catch (e) {
    throw e;
  }
};