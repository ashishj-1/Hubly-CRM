import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import errorHandler from "./middlewares/errorHandler.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";

// Load environment variables
dotenv.config();

// Connect DB
connectDB();

const app = express();

app.set("trust proxy", 1);

const nop = (req, res, next) => next();

const maybeImport = async (mod, note) => {
  try {
    const { default: d } = await import(mod);
    return d;
  } catch {
    console.warn(`${note} not installed — skipping`);
    return null;
  }
};

const Helmet = await maybeImport("helmet", "helmet");
const Compression = await maybeImport("compression", "compression");
const RateLimit = await maybeImport("express-rate-limit", "express-rate-limit");

// Apply (or no-op) middlewares
app.use(
  Helmet
    ? Helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } })
    : nop
);
app.use(Compression ? Compression() : nop);

app.use(
  "/api",
  RateLimit
    ? RateLimit({
        windowMs: 60 * 1000,
        max: 120,
        standardHeaders: true,
        legacyHeaders: false,
      })
    : nop
);

const allowedOrigins = new Set(
  (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean)
);

const corsOptions = {
  origin(origin, cb) {
    if (!origin || allowedOrigins.has(origin)) return cb(null, true);
    return cb(new Error(`CORS blocked -> ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  credentials: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

// Parsers & dev logging
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === "development") {
  app.use((req, _res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/analytics", analyticsRoutes);

// Health
app.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(
    `MongoDB: ${process.env.MONGO_URI ? "Configured" : "Not configured"}`
  );
});