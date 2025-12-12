import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  useReducer,
} from "react";
import Sidebar from "../components/common/Sidebar";
import Loader from "../components/common/Loader";
import { useAuth } from "../hooks/useAuth";
import api from "../services/api";
import "./ChatbotSettings.css";

/* Timer wheel internals */
const ROW_H = 36;
const CYCLES = 101;
const WHEEL_THRESHOLD = 60;
const SNAP_DEBOUNCE_MS = 120;
const VISIBLE_ROWS = 3;

const _norm = (i, base) => ((i % base) + base) % base;

/* different implementation but returns same API */
function useInfiniteWheel(initialValue, max, onChange) {
  const base = max + 1;
  const TOTAL = base * CYCLES;
  const MID = Math.floor(CYCLES / 2) * base;

  const scrollerRef = useRef(null);
  const lastIdxRef = useRef(MID + Number(initialValue || 0));
  const wheelAcc = useRef(0);
  const snapT = useRef(null);

  const [, tick] = useState(0); // force updates for currentIndex

  // ensure index is positioned in middle block with given value
  useEffect(() => {
    const target = MID + (Number(initialValue) || 0);
    lastIdxRef.current = target;
    if (scrollerRef.current) {
      scrollerRef.current.scrollTo({
        top: (target - 1) * ROW_H,
        behavior: "instant",
      });
      tick((n) => n + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValue, max]);

  const recenter = useCallback(
    (idx) => {
      if (!scrollerRef.current) return idx;
      if (idx < base || idx > TOTAL - base) {
        const val = _norm(idx, base);
        const midIdx = MID + val;
        lastIdxRef.current = midIdx;
        scrollerRef.current.scrollTo({
          top: (midIdx - 1) * ROW_H,
          behavior: "instant",
        });
        tick((n) => n + 1);
        return midIdx;
      }
      return idx;
    },
    [MID, TOTAL, base]
  );

  const doSnap = useCallback(() => {
    if (!scrollerRef.current) return;
    let idx = Math.round(scrollerRef.current.scrollTop / ROW_H) + 1;
    idx = recenter(idx);
    const top = (idx - 1) * ROW_H;
    if (Math.abs(scrollerRef.current.scrollTop - top) > 0.5) {
      scrollerRef.current.scrollTo({ top, behavior: "smooth" });
    }
  }, [recenter]);

  const scheduleSnap = useCallback(() => {
    if (snapT.current) clearTimeout(snapT.current);
    snapT.current = setTimeout(doSnap, SNAP_DEBOUNCE_MS);
  }, [doSnap]);

  const handleScroll = useCallback(() => {
    if (!scrollerRef.current) return;
    let idx = Math.round(scrollerRef.current.scrollTop / ROW_H) + 1;
    idx = recenter(idx);
    if (idx !== lastIdxRef.current) {
      lastIdxRef.current = idx;
      onChange(_norm(idx, base));
      tick((n) => n + 1);
    }
    scheduleSnap();
  }, [onChange, recenter, base, scheduleSnap]);

  const step = useCallback(
    (dir) => {
      const next = lastIdxRef.current + dir;
      lastIdxRef.current = next;
      if (scrollerRef.current) {
        scrollerRef.current.scrollTo({
          top: (next - 1) * ROW_H,
          behavior: "auto",
        });
      }
      onChange(_norm(next, base));
      setTimeout(() => recenter(next), 150);
      scheduleSnap();
      tick((n) => n + 1);
    },
    [onChange, recenter, base, scheduleSnap]
  );

  const handleWheel = useCallback(
    (e) => {
      e.preventDefault();
      wheelAcc.current += e.deltaY;
      while (wheelAcc.current >= WHEEL_THRESHOLD) {
        step(1);
        wheelAcc.current -= WHEEL_THRESHOLD;
      }
      while (wheelAcc.current <= -WHEEL_THRESHOLD) {
        step(-1);
        wheelAcc.current += WHEEL_THRESHOLD;
      }
    },
    [step]
  );

  const handleKey = useCallback(
    (e) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        step(-1);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        step(1);
      }
    },
    [step]
  );

  const doScrollEnd = useCallback(() => doSnap(), [doSnap]);
  const doMouseLeave = useCallback(() => doSnap(), [doSnap]);
  const doTouchEnd = useCallback(() => doSnap(), [doSnap]);

  const currentIndex = lastIdxRef.current;

  return {
    ref: scrollerRef,
    itemsCount: TOTAL,
    valueAt: (i) => _norm(i, base),
    currentIndex,
    onScroll: handleScroll,
    onScrollEnd: doScrollEnd,
    onMouseLeave: doMouseLeave,
    onTouchEnd: doTouchEnd,
    onWheel: handleWheel,
    onKeyDown: handleKey,
  };
}

/* Page */
const ChatbotSettings = () => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const defaultState = useMemo(
    () => ({
      headerColor: "#33475B",
      backgroundColor: "#EEEEEE",
      customMessages: {
        message1: "How can I help you?",
        message2: "Ask me anything!",
      },
      introductionForm: {
        nameLabel: "Your name",
        namePlaceholder: "Your name",
        phoneLabel: "Your Phone",
        phonePlaceholder: "+91 0000000000",
        emailLabel: "Your Email",
        emailPlaceholder: "example@gmail.com",
      },
      welcomeMessage:
        "👋 Want to chat about Hubly? I'm a chatbot here to help you find your way.",
      missedChatTimer: { hours: 0, minutes: 10, seconds: 0 },
    }),
    []
  );

  function settingsReducer(state, action) {
    switch (action.type) {
      case "SET_ALL":
        return { ...state, ...action.payload };
      case "MERGE_CUSTOM_MESSAGES":
        return {
          ...state,
          customMessages: { ...state.customMessages, ...action.payload },
        };
      case "MERGE_INTRO_FORM":
        return {
          ...state,
          introductionForm: { ...state.introductionForm, ...action.payload },
        };
      case "SET_TIMER_PART":
        return {
          ...state,
          missedChatTimer: { ...state.missedChatTimer, ...action.payload },
        };
      case "SET_FIELD":
        return { ...state, [action.field]: action.value };
      default:
        return state;
    }
  }

  const [settings, dispatch] = useReducer(settingsReducer, defaultState);
  const [editingField, setEditingField] = useState(null);

  // Load from API
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await api.get("/settings/chatbot");
        if (!active) return;
        if (res.data?.success && res.data.settings) {
          const s = res.data.settings;
          dispatch({
            type: "SET_ALL",
            payload: {
              ...s,
              customMessages: { ...(s.customMessages || {}) },
              introductionForm: { ...(s.introductionForm || {}) },
              missedChatTimer: {
                hours: Number(
                  s?.missedChatTimer?.hours ??
                    defaultState.missedChatTimer.hours
                ),
                minutes: Number(
                  s?.missedChatTimer?.minutes ??
                    defaultState.missedChatTimer.minutes
                ),
                seconds: Number(
                  s?.missedChatTimer?.seconds ??
                    defaultState.missedChatTimer.seconds
                ),
              },
            },
          });
        }
      } catch (e) {
        console.error("Failed to fetch settings:", e);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Other controls */
  const handleColorChange = useCallback((field, value) => {
    dispatch({ type: "SET_FIELD", field, value });
  }, []);

  const handleMessageChange = useCallback((key, value) => {
    dispatch({ type: "MERGE_CUSTOM_MESSAGES", payload: { [key]: value } });
  }, []);

  const handleFormChange = useCallback((key, value) => {
    dispatch({ type: "MERGE_INTRO_FORM", payload: { [key]: value } });
  }, []);

  /* Timer wheels */
  const setTimerPart = useCallback(
    (part) => (v) => {
      dispatch({ type: "SET_TIMER_PART", payload: { [part]: Number(v) } });
    },
    []
  );

  const hoursWheel = useInfiniteWheel(
    settings.missedChatTimer.hours,
    23,
    setTimerPart("hours")
  );
  const minutesWheel = useInfiniteWheel(
    settings.missedChatTimer.minutes,
    59,
    setTimerPart("minutes")
  );
  const secondsWheel = useInfiniteWheel(
    settings.missedChatTimer.seconds,
    59,
    setTimerPart("seconds")
  );

  const renderInfinite = useCallback((wheel) => {
    const rows = [];
    for (let i = 0; i < wheel.itemsCount; i++) {
      const value = wheel.valueAt(i);
      const isCenter = i === wheel.currentIndex;
      rows.push(
        <div key={i} className={`timer-item${isCenter ? " is-center" : ""}`}>
          {String(value).padStart(2, "0")}
        </div>
      );
    }
    return rows;
  }, []);

  /* Save whole settings */
  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const res = await api.put("/settings/chatbot", settings);
      if (res.data?.success) {
        alert("Settings saved successfully");
      } else {
        alert("Failed to save settings");
      }
    } catch (e) {
      console.error("Failed to save settings:", e);
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }, [settings]);

  if (loading) {
    return (
      <div className="chatbot-settings-layout">
        <Sidebar />
        <div className="chatbot-settings-loading">
          <Loader size="large" />
        </div>
      </div>
    );
  }

  const colorOptions = ["#FFFFFF", "#000000", "#33475B"];

  return (
    <div className="chatbot-settings-layout">
      <Sidebar />

      <div className="chatbot-settings-header">
        <h1>Chat Bot</h1>
      </div>

      <div className="chatbot-settings-content">
        <div className="chatbot-settings-main">
          {/* Left: Preview */}
          <div className="chatbot-preview-section">
            <div className="chatbot-preview-widget">
              <div
                className="preview-header"
                style={{ backgroundColor: settings.headerColor }}
              >
                <img
                  src="/robot-avatar.png"
                  alt="Hubly"
                  className="preview-avatar"
                />
                <span className="preview-title">Hubly</span>
              </div>

              <div
                className="preview-body"
                style={{ backgroundColor: settings.backgroundColor }}
              >
                <div className="preview-messages">
                  <div className="preview-bot-message">
                    <img
                      src="/robot-avatar.png"
                      alt=""
                      className="preview-msg-avatar"
                    />
                    <div className="preview-bubbles">
                      {settings.customMessages?.message1 && (
                        <div className="preview-bubble">
                          {settings.customMessages.message1}
                        </div>
                      )}
                      {settings.customMessages?.message2 && (
                        <div className="preview-bubble">
                          {settings.customMessages.message2}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="preview-form-card">
                  <h4>Introduction Form</h4>

                  <div className="preview-form-field">
                    <label>
                      {settings.introductionForm?.nameLabel || "Your name"}
                    </label>
                    <input
                      placeholder={
                        settings.introductionForm?.namePlaceholder ||
                        "Your name"
                      }
                      disabled
                    />
                  </div>

                  <div className="preview-form-field">
                    <label>
                      {settings.introductionForm?.phoneLabel || "Your Phone"}
                    </label>
                    <input
                      placeholder={
                        settings.introductionForm?.phonePlaceholder ||
                        "+1 (000) 000-0000"
                      }
                      disabled
                    />
                  </div>

                  <div className="preview-form-field">
                    <label>
                      {settings.introductionForm?.emailLabel || "Your Email"}
                    </label>
                    <input
                      placeholder={
                        settings.introductionForm?.emailPlaceholder ||
                        "example@gmail.com"
                      }
                      disabled
                    />
                  </div>

                  <button
                    className="preview-submit-btn"
                    style={{ backgroundColor: settings.headerColor }}
                  >
                    Thank You!
                  </button>
                </div>
              </div>

              <div className="preview-footer">
                <span>Write a message</span>
                <img src="/send-icon.png" alt="" />
              </div>
            </div>

            <div className="chatbot-preview-welcome">
              <img src="/robot-avatar.png" alt="" className="welcome-avatar" />
              <button className="welcome-close">×</button>
              <p>{settings.welcomeMessage}</p>
            </div>
          </div>

          {/* Right: Controls */}
          <div className="chatbot-controls-section">
            {/* Header Color */}
            <div className="control-card">
              <h3>Header Color</h3>
              <div className="color-options">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    className={`color-option ${
                      settings.headerColor === color ? "selected" : ""
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorChange("headerColor", color)}
                  />
                ))}
              </div>
              <div className="color-input-row">
                <div
                  className="color-preview"
                  style={{ backgroundColor: settings.headerColor }}
                />
                <input
                  type="text"
                  value={settings.headerColor}
                  onChange={(e) =>
                    handleColorChange("headerColor", e.target.value)
                  }
                />
              </div>
            </div>

            {/* Background Color */}
            <div className="control-card">
              <h3>Custom Background Color</h3>
              <div className="color-options">
                {["#FFFFFF", "#000000", "#EEEEEE"].map((color) => (
                  <button
                    key={color}
                    className={`color-option ${
                      settings.backgroundColor === color ? "selected" : ""
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorChange("backgroundColor", color)}
                  />
                ))}
              </div>
              <div className="color-input-row">
                <div
                  className="color-preview"
                  style={{ backgroundColor: settings.backgroundColor }}
                />
                <input
                  type="text"
                  value={settings.backgroundColor}
                  onChange={(e) =>
                    handleColorChange("backgroundColor", e.target.value)
                  }
                />
              </div>
            </div>

            {/* Customize Message */}
            <div className="control-card">
              <h3>Customize Message</h3>
              <div className="message-input-row">
                <input
                  type="text"
                  value={settings.customMessages?.message1 || ""}
                  onChange={(e) =>
                    handleMessageChange("message1", e.target.value)
                  }
                />
                <button className="edit-btn">✎</button>
              </div>
              <div className="message-input-row">
                <input
                  type="text"
                  value={settings.customMessages?.message2 || ""}
                  onChange={(e) =>
                    handleMessageChange("message2", e.target.value)
                  }
                />
                <button className="edit-btn">✎</button>
              </div>
            </div>

            {/* Introduction Form */}
            <div className="control-card">
              <h3>Introduction Form</h3>

              <div className="intro-form-preview">
                {/* Name */}
                <div className="intro-field">
                  {editingField === "nameLabel" ? (
                    <input
                      type="text"
                      value={settings.introductionForm?.nameLabel || ""}
                      onChange={(e) =>
                        handleFormChange("nameLabel", e.target.value)
                      }
                      onBlur={() => setEditingField(null)}
                      autoFocus
                      className="intro-field-editing"
                    />
                  ) : (
                    <label
                      onClick={() => setEditingField("nameLabel")}
                      className="intro-field-clickable"
                    >
                      {settings.introductionForm?.nameLabel || "Your name"}
                    </label>
                  )}

                  {editingField === "namePlaceholder" ? (
                    <input
                      type="text"
                      value={settings.introductionForm?.namePlaceholder || ""}
                      onChange={(e) =>
                        handleFormChange("namePlaceholder", e.target.value)
                      }
                      onBlur={() => setEditingField(null)}
                      autoFocus
                      className="intro-field-editing"
                    />
                  ) : (
                    <input
                      value={
                        settings.introductionForm?.namePlaceholder ||
                        "Your name"
                      }
                      onClick={() => setEditingField("namePlaceholder")}
                      readOnly
                      className="intro-field-clickable-input"
                    />
                  )}
                </div>

                {/* Phone */}
                <div className="intro-field">
                  {editingField === "phoneLabel" ? (
                    <input
                      type="text"
                      value={settings.introductionForm?.phoneLabel || ""}
                      onChange={(e) =>
                        handleFormChange("phoneLabel", e.target.value)
                      }
                      onBlur={() => setEditingField(null)}
                      autoFocus
                      className="intro-field-editing"
                    />
                  ) : (
                    <label
                      onClick={() => setEditingField("phoneLabel")}
                      className="intro-field-clickable"
                    >
                      {settings.introductionForm?.phoneLabel || "Your Phone"}
                    </label>
                  )}

                  {editingField === "phonePlaceholder" ? (
                    <input
                      type="text"
                      value={settings.introductionForm?.phonePlaceholder || ""}
                      onChange={(e) =>
                        handleFormChange("phonePlaceholder", e.target.value)
                      }
                      onBlur={() => setEditingField(null)}
                      autoFocus
                      className="intro-field-editing"
                    />
                  ) : (
                    <input
                      value={
                        settings.introductionForm?.phonePlaceholder ||
                        "+1 (000) 000-0000"
                      }
                      onClick={() => setEditingField("phonePlaceholder")}
                      readOnly
                      className="intro-field-clickable-input"
                    />
                  )}
                </div>

                {/* Email */}
                <div className="intro-field">
                  {editingField === "emailLabel" ? (
                    <input
                      type="text"
                      value={settings.introductionForm?.emailLabel || ""}
                      onChange={(e) =>
                        handleFormChange("emailLabel", e.target.value)
                      }
                      onBlur={() => setEditingField(null)}
                      autoFocus
                      className="intro-field-editing"
                    />
                  ) : (
                    <label
                      onClick={() => setEditingField("emailLabel")}
                      className="intro-field-clickable"
                    >
                      {settings.introductionForm?.emailLabel || "Your Email"}
                    </label>
                  )}

                  {editingField === "emailPlaceholder" ? (
                    <input
                      type="text"
                      value={settings.introductionForm?.emailPlaceholder || ""}
                      onChange={(e) =>
                        handleFormChange("emailPlaceholder", e.target.value)
                      }
                      onBlur={() => setEditingField(null)}
                      autoFocus
                      className="intro-field-editing"
                    />
                  ) : (
                    <input
                      value={
                        settings.introductionForm?.emailPlaceholder ||
                        "example@gmail.com"
                      }
                      onClick={() => setEditingField("emailPlaceholder")}
                      readOnly
                      className="intro-field-clickable-input"
                    />
                  )}
                </div>

                <button
                  className="intro-submit-btn"
                  style={{ backgroundColor: settings.headerColor }}
                >
                  Thank You!
                </button>
              </div>
            </div>

            {/* Missed chat timer */}
            <div className="control-card">
              <h3>Missed chat timer</h3>

              <div className="timer-wrap">
                {/* single highlight band over all 3 columns */}
                <div className="timer-band" aria-hidden="true"></div>

                <div
                  className="timer-wheel"
                  role="group"
                  aria-label="Missed chat timer"
                >
                  {/* Hours */}
                  <div className="timer-col" aria-label="Hours">
                    <div
                      className="timer-track"
                      ref={hoursWheel.ref}
                      onScroll={hoursWheel.onScroll}
                      onMouseUp={hoursWheel.onScrollEnd}
                      onMouseLeave={hoursWheel.onMouseLeave}
                      onTouchEnd={hoursWheel.onTouchEnd}
                      onWheel={hoursWheel.onWheel}
                      onKeyDown={hoursWheel.onKeyDown}
                      tabIndex={0}
                      data-selected={settings.missedChatTimer.hours}
                    >
                      {renderInfinite(hoursWheel)}
                    </div>
                  </div>

                  <div className="timer-sep">:</div>

                  {/* Minutes */}
                  <div className="timer-col" aria-label="Minutes">
                    <div
                      className="timer-track"
                      ref={minutesWheel.ref}
                      onScroll={minutesWheel.onScroll}
                      onMouseUp={minutesWheel.onScrollEnd}
                      onMouseLeave={minutesWheel.onMouseLeave}
                      onTouchEnd={minutesWheel.onTouchEnd}
                      onWheel={minutesWheel.onWheel}
                      onKeyDown={minutesWheel.onKeyDown}
                      tabIndex={0}
                      data-selected={settings.missedChatTimer.minutes}
                    >
                      {renderInfinite(minutesWheel)}
                    </div>
                  </div>

                  <div className="timer-sep">:</div>

                  {/* Seconds */}
                  <div className="timer-col" aria-label="Seconds">
                    <div
                      className="timer-track"
                      ref={secondsWheel.ref}
                      onScroll={secondsWheel.onScroll}
                      onMouseUp={secondsWheel.onScrollEnd}
                      onMouseLeave={secondsWheel.onMouseLeave}
                      onTouchEnd={secondsWheel.onTouchEnd}
                      onWheel={secondsWheel.onWheel}
                      onKeyDown={secondsWheel.onKeyDown}
                      tabIndex={0}
                      data-selected={settings.missedChatTimer.seconds}
                    >
                      {renderInfinite(secondsWheel)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="timer-actions">
                <button
                  className="save-btn"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
            {/* End timer */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotSettings;