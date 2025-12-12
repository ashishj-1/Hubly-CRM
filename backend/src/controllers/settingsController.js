import ChatbotSettings from "../models/ChatbotSettings.js";

const ensureSettings = async () =>
  (await ChatbotSettings.findOne()) || (await ChatbotSettings.create({}));

// GET /api/settings/chatbot
export const getChatbotSettings = async (req, res, next) => {
  try {
    const settings = await ensureSettings();
    res.json({ success: true, settings });
  } catch (err) {
    next(err);
  }
};

// PUT /api/settings/chatbot
export const updateChatbotSettings = async (req, res, next) => {
  try {
    const {
      headerColor,
      backgroundColor,
      customMessages,
      introductionForm,
      welcomeMessage,
      missedChatTimer,
    } = req.body || {};

    const settings = await ensureSettings();

    if (headerColor !== undefined) settings.headerColor = headerColor;
    if (backgroundColor !== undefined)
      settings.backgroundColor = backgroundColor;

    if (customMessages !== undefined) {
      settings.customMessages = {
        ...settings.customMessages,
        ...(customMessages.message1 !== undefined && {
          message1: customMessages.message1,
        }),
        ...(customMessages.message2 !== undefined && {
          message2: customMessages.message2,
        }),
      };
    }

    if (introductionForm !== undefined) {
      settings.introductionForm = {
        ...settings.introductionForm,
        ...introductionForm,
      };
    }

    if (welcomeMessage !== undefined) settings.welcomeMessage = welcomeMessage;

    if (missedChatTimer !== undefined) {
      const prev = settings.missedChatTimer || {};
      settings.missedChatTimer = {
        ...prev,
        ...(missedChatTimer.hours !== undefined && {
          hours: missedChatTimer.hours,
        }),
        ...(missedChatTimer.minutes !== undefined && {
          minutes: missedChatTimer.minutes,
        }),
        ...(missedChatTimer.seconds !== undefined && {
          seconds: missedChatTimer.seconds,
        }),
      };
    }

    await settings.save();

    res.json({
      success: true,
      message: "Chatbot settings updated successfully",
      settings,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/settings/chatbot/reset
export const resetChatbotSettings = async (req, res, next) => {
  try {
    await ChatbotSettings.deleteMany({});
    const settings = await ChatbotSettings.create({});
    res.json({
      success: true,
      message: "Chatbot settings reset to default",
      settings,
    });
  } catch (err) {
    next(err);
  }
};