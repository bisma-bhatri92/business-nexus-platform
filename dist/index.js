// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import jwt from "jsonwebtoken";

// server/storage.ts
import bcrypt from "bcrypt";
var MemStorage = class {
  users;
  profiles;
  collaborationRequests;
  messages;
  currentUserId;
  currentProfileId;
  currentRequestId;
  currentMessageId;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.profiles = /* @__PURE__ */ new Map();
    this.collaborationRequests = /* @__PURE__ */ new Map();
    this.messages = /* @__PURE__ */ new Map();
    this.currentUserId = 1;
    this.currentProfileId = 1;
    this.currentRequestId = 1;
    this.currentMessageId = 1;
  }
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByEmail(email) {
    return Array.from(this.users.values()).find((user) => user.email === email);
  }
  async createUser(insertUser) {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const id = this.currentUserId++;
    const user = {
      id,
      firstName: insertUser.firstName,
      lastName: insertUser.lastName,
      email: insertUser.email,
      password: hashedPassword,
      role: insertUser.role,
      bio: insertUser.bio || null,
      location: insertUser.location || null,
      avatar: insertUser.avatar || null,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.users.set(id, user);
    return user;
  }
  async verifyPassword(email, password) {
    const user = await this.getUserByEmail(email);
    if (!user) return null;
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }
  async getProfile(userId) {
    return Array.from(this.profiles.values()).find((profile) => profile.userId === userId);
  }
  async createProfile(insertProfile) {
    const id = this.currentProfileId++;
    const profile = {
      id,
      userId: insertProfile.userId,
      company: insertProfile.company || null,
      title: insertProfile.title || null,
      industry: insertProfile.industry || null,
      stage: insertProfile.stage || null,
      founded: insertProfile.founded || null,
      employees: insertProfile.employees || null,
      fundingAmount: insertProfile.fundingAmount || null,
      fundingUse: insertProfile.fundingUse || null,
      equityOffered: insertProfile.equityOffered || null,
      website: insertProfile.website || null,
      linkedin: insertProfile.linkedin || null,
      skills: insertProfile.skills || null,
      portfolioCompanies: insertProfile.portfolioCompanies || null,
      investmentInterests: insertProfile.investmentInterests || null
    };
    this.profiles.set(id, profile);
    return profile;
  }
  async updateProfile(userId, profileUpdate) {
    const existingProfile = await this.getProfile(userId);
    if (!existingProfile) return void 0;
    const updatedProfile = { ...existingProfile, ...profileUpdate };
    this.profiles.set(existingProfile.id, updatedProfile);
    return updatedProfile;
  }
  async getEntrepreneurs() {
    const entrepreneurs = Array.from(this.users.values()).filter((user) => user.role === "entrepreneur");
    return entrepreneurs.map((user) => ({
      ...user,
      profile: Array.from(this.profiles.values()).find((profile) => profile.userId === user.id)
    }));
  }
  async getInvestors() {
    const investors = Array.from(this.users.values()).filter((user) => user.role === "investor");
    return investors.map((user) => ({
      ...user,
      profile: Array.from(this.profiles.values()).find((profile) => profile.userId === user.id)
    }));
  }
  async getUserWithProfile(id) {
    const user = this.users.get(id);
    if (!user) return void 0;
    const profile = Array.from(this.profiles.values()).find((profile2) => profile2.userId === id);
    return { ...user, profile };
  }
  async createCollaborationRequest(insertRequest) {
    const id = this.currentRequestId++;
    const request = {
      id,
      senderId: insertRequest.senderId,
      receiverId: insertRequest.receiverId,
      message: insertRequest.message || null,
      status: insertRequest.status || "pending",
      createdAt: /* @__PURE__ */ new Date()
    };
    this.collaborationRequests.set(id, request);
    return request;
  }
  async getCollaborationRequests(userId) {
    const requests = Array.from(this.collaborationRequests.values()).filter((request) => request.receiverId === userId || request.senderId === userId);
    return requests.map((request) => {
      const sender = this.users.get(request.senderId);
      const receiver = this.users.get(request.receiverId);
      return { ...request, sender, receiver };
    });
  }
  async updateCollaborationRequestStatus(id, status) {
    const request = this.collaborationRequests.get(id);
    if (!request) return void 0;
    const updatedRequest = { ...request, status };
    this.collaborationRequests.set(id, updatedRequest);
    return updatedRequest;
  }
  async createMessage(insertMessage) {
    const id = this.currentMessageId++;
    const message = {
      ...insertMessage,
      id,
      timestamp: /* @__PURE__ */ new Date()
    };
    this.messages.set(id, message);
    return message;
  }
  async getMessages(userId1, userId2) {
    const messages2 = Array.from(this.messages.values()).filter(
      (message) => message.senderId === userId1 && message.receiverId === userId2 || message.senderId === userId2 && message.receiverId === userId1
    ).sort((a, b) => (a.timestamp?.getTime() || 0) - (b.timestamp?.getTime() || 0));
    return messages2.map((message) => {
      const sender = this.users.get(message.senderId);
      return { ...message, sender };
    });
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { pgTable, text, serial, integer, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(),
  // 'investor' or 'entrepreneur'
  bio: text("bio"),
  location: text("location"),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow()
});
var profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  company: text("company"),
  title: text("title"),
  industry: text("industry"),
  stage: text("stage"),
  // For entrepreneurs: 'seed', 'series-a', etc.
  founded: integer("founded"),
  employees: integer("employees"),
  fundingAmount: integer("funding_amount"),
  fundingUse: text("funding_use"),
  equityOffered: integer("equity_offered"),
  website: text("website"),
  linkedin: text("linkedin"),
  skills: json("skills").$type(),
  portfolioCompanies: json("portfolio_companies").$type(),
  investmentInterests: json("investment_interests").$type()
});
var collaborationRequests = pgTable("collaboration_requests", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull().references(() => users.id),
  receiverId: integer("receiver_id").notNull().references(() => users.id),
  message: text("message"),
  status: text("status").notNull().default("pending"),
  // 'pending', 'accepted', 'rejected'
  createdAt: timestamp("created_at").defaultNow()
});
var messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull().references(() => users.id),
  receiverId: integer("receiver_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow()
});
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});
var insertProfileSchema = createInsertSchema(profiles).omit({
  id: true
});
var insertCollaborationRequestSchema = createInsertSchema(collaborationRequests).omit({
  id: true,
  createdAt: true
});
var insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  timestamp: true
});

// server/routes.ts
var JWT_SECRET = process.env.JWT_SECRET || "business-nexus-secret-key";
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }
    req.user = user;
    next();
  });
}
async function registerRoutes(app2) {
  const httpServer = createServer(app2);
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });
  const clients = /* @__PURE__ */ new Map();
  wss.on("connection", (ws, request) => {
    let userId = null;
    ws.on("message", async (data) => {
      try {
        const message = JSON.parse(data.toString());
        if (message.type === "auth") {
          try {
            const decoded = jwt.verify(message.token, JWT_SECRET);
            userId = decoded.userId;
            if (userId) {
              clients.set(userId, ws);
            }
            ws.send(JSON.stringify({ type: "auth_success" }));
          } catch (error) {
            ws.send(JSON.stringify({ type: "auth_error", message: "Invalid token" }));
          }
        } else if (message.type === "chat_message" && userId) {
          const newMessage = await storage.createMessage({
            senderId: userId,
            receiverId: message.receiverId,
            content: message.content
          });
          const messageWithSender = {
            ...newMessage,
            sender: await storage.getUser(userId)
          };
          const recipientWs = clients.get(message.receiverId);
          if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
            recipientWs.send(JSON.stringify({
              type: "new_message",
              message: messageWithSender
            }));
          }
          ws.send(JSON.stringify({
            type: "message_sent",
            message: messageWithSender
          }));
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    });
    ws.on("close", () => {
      if (userId) {
        clients.delete(userId);
      }
    });
  });
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      const user = await storage.createUser(userData);
      const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET);
      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword, token });
    } catch (error) {
      res.status(400).json({ message: "Invalid user data", error });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await storage.verifyPassword(email, password);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET);
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword, token });
    } catch (error) {
      res.status(500).json({ message: "Login failed", error });
    }
  });
  app2.get("/api/profile/:id", authenticateToken, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const userWithProfile = await storage.getUserWithProfile(userId);
      if (!userWithProfile) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...userWithoutPassword } = userWithProfile;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch profile", error });
    }
  });
  app2.put("/api/profile", authenticateToken, async (req, res) => {
    try {
      const profileData = insertProfileSchema.parse(req.body);
      const userId = req.user.userId;
      const existingProfile = await storage.getProfile(userId);
      let profile;
      if (existingProfile) {
        profile = await storage.updateProfile(userId, profileData);
      } else {
        profile = await storage.createProfile({ ...profileData, userId });
      }
      res.json(profile);
    } catch (error) {
      res.status(400).json({ message: "Failed to update profile", error });
    }
  });
  app2.get("/api/entrepreneurs", authenticateToken, async (req, res) => {
    try {
      const entrepreneurs = await storage.getEntrepreneurs();
      const sanitizedEntrepreneurs = entrepreneurs.map(({ password, ...user }) => user);
      res.json(sanitizedEntrepreneurs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch entrepreneurs", error });
    }
  });
  app2.get("/api/investors", authenticateToken, async (req, res) => {
    try {
      const investors = await storage.getInvestors();
      const sanitizedInvestors = investors.map(({ password, ...user }) => user);
      res.json(sanitizedInvestors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch investors", error });
    }
  });
  app2.post("/api/requests", authenticateToken, async (req, res) => {
    try {
      const requestData = insertCollaborationRequestSchema.parse({
        ...req.body,
        senderId: req.user.userId
      });
      const request = await storage.createCollaborationRequest(requestData);
      res.json(request);
    } catch (error) {
      res.status(400).json({ message: "Failed to create collaboration request", error });
    }
  });
  app2.get("/api/requests", authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      const requests = await storage.getCollaborationRequests(userId);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch collaboration requests", error });
    }
  });
  app2.patch("/api/requests/:id", authenticateToken, async (req, res) => {
    try {
      const requestId = parseInt(req.params.id);
      const { status } = req.body;
      const updatedRequest = await storage.updateCollaborationRequestStatus(requestId, status);
      if (!updatedRequest) {
        return res.status(404).json({ message: "Request not found" });
      }
      res.json(updatedRequest);
    } catch (error) {
      res.status(500).json({ message: "Failed to update request status", error });
    }
  });
  app2.get("/api/chat/:userId", authenticateToken, async (req, res) => {
    try {
      const currentUserId = req.user.userId;
      const otherUserId = parseInt(req.params.userId);
      const messages2 = await storage.getMessages(currentUserId, otherUserId);
      res.json(messages2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages", error });
    }
  });
  app2.get("/api/auth/me", authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      const userWithProfile = await storage.getUserWithProfile(userId);
      if (!userWithProfile) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...userWithoutPassword } = userWithProfile;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user info", error });
    }
  });
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
var vite_config_default = defineConfig({
  root: path.resolve(__dirname, "client"),
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src")
    }
  },
  build: {
    outDir: path.resolve(__dirname, "dist", "public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
