import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import jwt from "jsonwebtoken";
import { storage } from "./storage";
import { insertUserSchema, insertProfileSchema, insertCollaborationRequestSchema, insertMessageSchema } from "@shared/schema";

const JWT_SECRET = process.env.JWT_SECRET || "business-nexus-secret-key";

// Middleware to verify JWT tokens
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const clients = new Map<number, WebSocket>();

  wss.on('connection', (ws, request) => {
    let userId: number | null = null;

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'auth') {
          try {
            const decoded = jwt.verify(message.token, JWT_SECRET) as any;
            userId = decoded.userId;
            if (userId) {
              clients.set(userId, ws);
            }
            ws.send(JSON.stringify({ type: 'auth_success' }));
          } catch (error) {
            ws.send(JSON.stringify({ type: 'auth_error', message: 'Invalid token' }));
          }
        } else if (message.type === 'chat_message' && userId) {
          const newMessage = await storage.createMessage({
            senderId: userId,
            receiverId: message.receiverId,
            content: message.content,
          });
          
          const messageWithSender = {
            ...newMessage,
            sender: await storage.getUser(userId),
          };

          // Send to recipient if online
          const recipientWs = clients.get(message.receiverId);
          if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
            recipientWs.send(JSON.stringify({
              type: 'new_message',
              message: messageWithSender,
            }));
          }

          // Send confirmation to sender
          ws.send(JSON.stringify({
            type: 'message_sent',
            message: messageWithSender,
          }));
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      if (userId) {
        clients.delete(userId);
      }
    });
  });

  // Authentication routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const user = await storage.createUser(userData);
      const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET);
      
      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword, token });
    } catch (error) {
      res.status(400).json({ message: 'Invalid user data', error });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.verifyPassword(email, password);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET);
      
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword, token });
    } catch (error) {
      res.status(500).json({ message: 'Login failed', error });
    }
  });

  // Profile routes
  app.get('/api/profile/:id', authenticateToken, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const userWithProfile = await storage.getUserWithProfile(userId);
      
      if (!userWithProfile) {
        return res.status(404).json({ message: 'User not found' });
      }

      const { password, ...userWithoutPassword } = userWithProfile;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch profile', error });
    }
  });

  app.put('/api/profile', authenticateToken, async (req, res) => {
    try {
      const profileData = insertProfileSchema.parse(req.body);
      const userId = (req as any).user.userId;

      const existingProfile = await storage.getProfile(userId);
      let profile;
      
      if (existingProfile) {
        profile = await storage.updateProfile(userId, profileData);
      } else {
        profile = await storage.createProfile({ ...profileData, userId });
      }

      res.json(profile);
    } catch (error) {
      res.status(400).json({ message: 'Failed to update profile', error });
    }
  });

  // User listing routes
  app.get('/api/entrepreneurs', authenticateToken, async (req, res) => {
    try {
      const entrepreneurs = await storage.getEntrepreneurs();
      const sanitizedEntrepreneurs = entrepreneurs.map(({ password, ...user }) => user);
      res.json(sanitizedEntrepreneurs);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch entrepreneurs', error });
    }
  });

  app.get('/api/investors', authenticateToken, async (req, res) => {
    try {
      const investors = await storage.getInvestors();
      const sanitizedInvestors = investors.map(({ password, ...user }) => user);
      res.json(sanitizedInvestors);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch investors', error });
    }
  });

  // Collaboration request routes
  app.post('/api/requests', authenticateToken, async (req, res) => {
    try {
      const requestData = insertCollaborationRequestSchema.parse({
        ...req.body,
        senderId: (req as any).user.userId,
      });

      const request = await storage.createCollaborationRequest(requestData);
      res.json(request);
    } catch (error) {
      res.status(400).json({ message: 'Failed to create collaboration request', error });
    }
  });

  app.get('/api/requests', authenticateToken, async (req, res) => {
    try {
      const userId = (req as any).user.userId;
      const requests = await storage.getCollaborationRequests(userId);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch collaboration requests', error });
    }
  });

  app.patch('/api/requests/:id', authenticateToken, async (req, res) => {
    try {
      const requestId = parseInt(req.params.id);
      const { status } = req.body;
      
      const updatedRequest = await storage.updateCollaborationRequestStatus(requestId, status);
      if (!updatedRequest) {
        return res.status(404).json({ message: 'Request not found' });
      }

      res.json(updatedRequest);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update request status', error });
    }
  });

  // Chat routes
  app.get('/api/chat/:userId', authenticateToken, async (req, res) => {
    try {
      const currentUserId = (req as any).user.userId;
      const otherUserId = parseInt(req.params.userId);
      
      const messages = await storage.getMessages(currentUserId, otherUserId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch messages', error });
    }
  });

  // Get current user info
  app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
      const userId = (req as any).user.userId;
      const userWithProfile = await storage.getUserWithProfile(userId);
      
      if (!userWithProfile) {
        return res.status(404).json({ message: 'User not found' });
      }

      const { password, ...userWithoutPassword } = userWithProfile;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch user info', error });
    }
  });

  return httpServer;
}
