import {
  getAverageReplyTime,
  getMissedChatsOverTime,
  getResolvedTicketsData,
  getTotalChats,
} from "../services/analyticsService.js";

const extractUser = (req) => ({
  id: req?.user?.id,
  role: req?.user?.role,
});

// GET /api/analytics
export const getAnalytics = async (req, res, next) => {
  const { id, role } = extractUser(req);
  const { startDate, endDate, weeks } = req.query;

  try {
    const weeksInt = Number(weeks ?? 10);

    const queries = [
      getAverageReplyTime(id, role),
      getMissedChatsOverTime(weeksInt, id, role),
      getResolvedTicketsData(id, role),
      getTotalChats(startDate, endDate, id, role),
    ];

    const [reply, missed, resolved, total] = await Promise.all(queries);

    res.json({
      success: true,
      data: {
        avgReplyTime: reply.averageReplyTimeSeconds,
        missedChats: missed,
        resolvedPercentage: resolved.percentage,
        totalChats: total.totalChats,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/analytics/missed-chats
export const getMissedChats = async (req, res, next) => {
  const { id, role } = extractUser(req);

  try {
    const weeks = Number(req.query.weeks ?? 10);
    const result = await getMissedChatsOverTime(weeks, id, role);

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

// GET /api/analytics/reply-time
export const getReplyTime = async (req, res, next) => {
  const { id, role } = extractUser(req);

  try {
    const info = await getAverageReplyTime(id, role);

    res.json({
      success: true,
      averageReplyTimeSeconds: info.averageReplyTimeSeconds,
      replyCount: info.replyCount,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/analytics/resolved-tickets
export const getResolvedTickets = async (req, res, next) => {
  const { id, role } = extractUser(req);

  try {
    const details = await getResolvedTicketsData(id, role);
    res.json({ success: true, ...details });
  } catch (err) {
    next(err);
  }
};

// GET /api/analytics/total-chats
export const getTotalChatsCount = async (req, res, next) => {
  const { id, role } = extractUser(req);
  const { startDate, endDate } = req.query;

  try {
    const output = await getTotalChats(startDate, endDate, id, role);
    res.json({ success: true, ...output });
  } catch (err) {
    next(err);
  }
};