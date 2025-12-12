import api from "./api";

const analyticsBase = "/analytics";

export const getAnalyticsData = (params) => {
  return api.get(analyticsBase, {
    params,
  });
};

export const getMissedChatsData = (days = 10) => {
  return api.get(`${analyticsBase}/missed-chats`, {
    params: { days },
  });
};

export const getAverageReplyTime = () => {
  return api.get(`${analyticsBase}/reply-time`);
};

export const getResolvedTicketsData = () => {
  return api.get(`${analyticsBase}/resolved-tickets`);
};

export const getTotalChatsCount = (params) => {
  return api.get(`${analyticsBase}/total-chats`, {
    params,
  });
};