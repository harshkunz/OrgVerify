const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("./utils/passport"); 
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const adminroutes = require("./routes/adminRoutes");
const uploadroutes = require("./routes/uploadRoutes");
const chatRoutes = require("./routes/chatRoutes");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const http = require("http"); // Required for Socket.IO
const { Server } = require("socket.io"); // Socket.IO server
const jwt = require("jsonwebtoken");
const Chat = require("./models/Chat");
const Admin = require("./models/Admin");
const User = require("./models/User");

// Initialize express app
const app = express();
const path = require("path");
const server = http.createServer(app); // Create HTTP server for Socket.IO

// Define allowed origins
const allowedOrigins = [
  "http://localhost:7000",
  "http://localhost:5173",
  "http://localhost:3000",
];

// Add production Vercel URL if it exists
if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL);
}

if (process.env.ORG_ID_SERVER_URL) {
  allowedOrigins.push(process.env.ORG_ID_SERVER_URL);
}

// Session store configuration - use MemoryStore only for development
const sessionConfig = {
  secret: process.env.SESSION_SECRET || "some_secret_key",
  resave: false,
  saveUninitialized: false,
};

// For production, consider using MongoDB session store or other persistent store
if (process.env.NODE_ENV === "production") {
  const MongoDBStore = require("connect-mongo");
  sessionConfig.store = new MongoDBStore({
    mongoUrl: process.env.MONGODB_URI,
    touchAfter: 24 * 3600, // Lazy session update (in seconds)
  });
}

app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());

app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
// Middleware
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet()); // Set security headers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);
// Serve static files from public directory

app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));
// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Socket.IO authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Authentication error"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check both User and Admin models
    let user = await User.findById(decoded.userId || decoded.id);
    if (!user) {
      user = await Admin.findById(decoded.userId || decoded.id);
      if (!user) return next(new Error("User not found"));
    }

    socket.user = user;
    socket.userType = user instanceof Admin ? "Admin" : "User";
    next();
  } catch (err) {
    next(new Error("Authentication failed"));
  }
});

// Socket.IO connection handler - UPDATED
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.user._id} (${socket.userType})`);

  // Join user to their personal room
  socket.join(socket.user._id.toString());

  // Join admin to admin room if user is admin
  if (socket.user.role === "admin") {
    socket.join("admin-room");
  }

  // Handle incoming messages - UPDATED
  socket.on("send-message", async ({ recipientId, recipientType, content }) => {
    try {
      let recipient;
      if (recipientType === "Admin") {
        recipient = await Admin.findById(recipientId);
      } else {
        recipient = await User.findById(recipientId);
      }

      if (!recipient) {
        return socket.emit("error", "Recipient not found");
      }

      const message = new Chat({
        sender: socket.user._id,
        senderModel: socket.userType,
        recipient: recipientId,
        recipientModel: recipientType,
        content,
        chatType: socket.user.role === "admin" ? "support" : "direct",
      });

      await message.save();

      // Populate sender info before emitting
      const populatedMessage = await Chat.findById(message._id)
        .populate("sender", "firstName lastName email")
        .populate("recipient", "firstName lastName email");

      // Emit to recipient
      io.to(recipientId).emit("receive-message", populatedMessage);

      // Notify admin room if needed
      if (socket.user.role !== "admin" && recipient.role !== "admin") {
        io.to("admin-room").emit("new-conversation", populatedMessage);
      }

      // Confirm message was sent
      socket.emit("message-sent", populatedMessage);
    } catch (err) {
      console.error("Error sending message:", err);
      socket.emit("error", "Failed to send message");
    }
  });

  // Handle message read status - NEW
  socket.on("mark-as-read", async (messageIds) => {
    try {
      await Chat.updateMany(
        {
          _id: { $in: messageIds },
          recipient: socket.user._id,
        },
        { $set: { read: true } }
      );
      socket.emit("messages-read", messageIds);
    } catch (err) {
      console.error("Error marking messages as read:", err);
    }
  });

  // Handle typing indicators - NEW
  socket.on("typing", ({ recipientId, isTyping }) => {
    io.to(recipientId).emit("typing", {
      senderId: socket.user._id,
      isTyping,
    });
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.user._id}`);
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong" });
});

// Add this middleware before your routes
app.use((req, res, next) => {
  req.io = io; // Make io available in all routes
  next();
});
// Routes
app.get("/", (req, res) => {
  res.send("Backend is running...");
});

app.use("/api/admin", adminroutes);
app.use("/api/upload", uploadroutes);
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/companies", require("./routes/companyRoutes"));
app.use("/api/employees", require("./routes/employeeRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong" });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
  // Changed from app.listen to server.listen
  try {
    await connectDB();
    console.log(`Server running on port http://localhost:${PORT}`);
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
});
