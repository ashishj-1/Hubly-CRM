import api from './api';

export const getAnalyticsData = (params) => {
  return api.get('/analytics', { params });
};

export const getMissedChatsData = (days = 10) => {
  return api.get('/analytics/missed-chats', { params: { days } });
};

export const getAverageReplyTime = () => {
  return api.get('/analytics/reply-time');
};

export const getResolvedTicketsData = () => {
  return api.get('/analytics/resolved-tickets');
};

export const getTotalChatsCount = (params) => {
  return api.get('/analytics/total-chats', { params });
};