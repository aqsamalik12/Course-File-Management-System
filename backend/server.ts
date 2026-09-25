import express from "express";
import path from "path";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { connectDB, disconnectDB } from "./config/db";
import { logger } from "./config/logger";
import { seedInitialData } from "./utils/seedDatabase";
import { errorHandler } from "./middlewares/errorHandler";

// Import Routers
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import departmentRoutes from "./routes/departmentRoutes";
import courseRoutes from "./routes/courseRoutes";
import sessionRoutes from "./routes/sessionRoutes";
import courseFileRoutes from "./routes/courseFileRoutes";
import templateRoutes from "./routes/templateRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import reportRoutes from "./routes/reportRoutes";
import auditRoutes from "./routes/auditRoutes";
import settingRoutes from "./routes/settingRoutes";
import feedbackRoutes from "./routes/feedbackRoutes";
import programRoutes from "./routes/programRoutes";
import deadlineRoutes from "./routes/deadlineRoutes";
import announcementRoutes from "./routes/announcementRoutes";
import archiveRoutes from "./routes/archiveRoutes";
import teacherRequestRoutes from "./routes/teacherRequestRoutes";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

  // Global Middlewares
  app.use(
    cors({
      origin: true,
      credentials: true
    })
  );
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // Morgan HTTP logging to Winston
  app.use(
    morgan("short", {
      stream: { write: (message: string) => logger.info(message.trim()) }
    })
  );

  // Serve static file uploads directory
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  // Connect Database & Seed initial university data
  const isConnected = await connectDB();
  if (isConnected) {
    await seedInitialData();
  }

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "online",
      database: "Supabase (PostgreSQL Cloud)",
      service: "Backend API Server",
      system: "University Course File Management System (CFMS)",
      institution: "University of Education, Attock Campus",
      version: "2.4.0-separated-backend",
      timestamp: new Date().toISOString()
    });
  });

  // Mount Production REST API Endpoints
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/departments", departmentRoutes);
  app.use("/api/courses", courseRoutes);
  app.use("/api/programs", programRoutes);
  app.use("/api/deadlines", deadlineRoutes);
  app.use("/api/announcements", announcementRoutes);
  app.use("/api/archives", archiveRoutes);
  app.use("/api/system", sessionRoutes);
  app.use("/api/course-files", courseFileRoutes);
  app.use("/api/templates", templateRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use("/api/reports", reportRoutes);
  app.use("/api/audit-logs", auditRoutes);
  app.use("/api/settings", settingRoutes);
  app.use("/api/feedback", feedbackRoutes);
  app.use("/api/teacher-requests", teacherRequestRoutes);

  // Centralized Error Handling Middleware
  app.use(errorHandler);

  const server = app.listen(PORT, "0.0.0.0", () => {
    logger.info(`[CFMS Backend API] Running on http://localhost:${PORT}`);
  });

  server.on("error", (err: any) => {
    if (err.code === "EADDRINUSE") {
      logger.error(`[CFMS Backend] Port ${PORT} is already in use. Please terminate the process or change PORT in .env.`);
      process.exit(1);
    } else {
      logger.error("[CFMS Backend Error]", err);
    }
  });

  // Graceful shutdown
  const shutdown = async () => {
    logger.info('[CFMS Backend] Shutting down gracefully...');
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startServer().catch((err) => {
  console.error("[CFMS Backend Startup Error]", err);
});
