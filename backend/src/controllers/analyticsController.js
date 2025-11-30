import {
  getAverageReplyTime,
  getMissedChatsOverTime,
  getResolvedTicketsData,
  getTotalChats,
} from "../services/analyticsService.js";

// GET /api/analytics
export const getAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate, weeks = 10 } = req.query;
    const userId = req.user.id;
    const role = req.user.role;

    const [replyTime, missedChats, resolvedTickets, totalChats] =
      await Promise.all([
        getAverageReplyTime(userId, role),
        getMissedChatsOverTime(parseInt(weeks), userId, role),
        getResolvedTicketsData(userId, role),
        getTotalChats(startDate, endDate, userId, role),
      ]);

    res.json({
      success: true,
      data: {
        avgReplyTime: replyTime.averageReplyTimeSeconds,
        missedChats,
        resolvedPercentage: resolvedTickets.percentage,
        totalChats: totalChats.totalChats,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/analytics/missed-chats
export const getMissedChats = async (req, res, next) => {
  try {
    const { weeks = 10 } = req.query;
    const userId = req.user.id;
    const role = req.user.role;

    const data = await getMissedChatsOverTime(parseInt(weeks), userId, role);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/analytics/reply-time
export const getReplyTime = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    const data = await getAverageReplyTime(userId, role);

    res.json({
      success: true,
      averageReplyTimeSeconds: data.averageReplyTimeSeconds,
      replyCount: data.replyCount,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/analytics/resolved-tickets
export const getResolvedTickets = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    const data = await getResolvedTicketsData(userId, role);

    res.json({
      success: true,
      ...data,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/analytics/total-chats
export const getTotalChatsCount = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user.id;
    const role = req.user.role;

    const data = await getTotalChats(startDate, endDate, userId, role);

    res.json({
      success: true,
      ...data,
    });
  } catch (error) {
    next(error);
  }
};