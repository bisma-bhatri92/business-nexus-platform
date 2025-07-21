import { users, profiles, collaborationRequests, messages, type User, type InsertUser, type Profile, type InsertProfile, type CollaborationRequest, type InsertCollaborationRequest, type Message, type InsertMessage } from "@shared/schema";
import bcrypt from "bcrypt";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  verifyPassword(email: string, password: string): Promise<User | null>;
  
  // Profile operations
  getProfile(userId: number): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(userId: number, profile: Partial<InsertProfile>): Promise<Profile | undefined>;
  
  // User listing operations
  getEntrepreneurs(): Promise<(User & { profile?: Profile })[]>;
  getInvestors(): Promise<(User & { profile?: Profile })[]>;
  getUserWithProfile(id: number): Promise<(User & { profile?: Profile }) | undefined>;
  
  // Collaboration request operations
  createCollaborationRequest(request: InsertCollaborationRequest): Promise<CollaborationRequest>;
  getCollaborationRequests(userId: number): Promise<(CollaborationRequest & { sender: User, receiver: User })[]>;
  updateCollaborationRequestStatus(id: number, status: string): Promise<CollaborationRequest | undefined>;
  
  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getMessages(userId1: number, userId2: number): Promise<(Message & { sender: User })[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private profiles: Map<number, Profile>;
  private collaborationRequests: Map<number, CollaborationRequest>;
  private messages: Map<number, Message>;
  private currentUserId: number;
  private currentProfileId: number;
  private currentRequestId: number;
  private currentMessageId: number;

  constructor() {
    this.users = new Map();
    this.profiles = new Map();
    this.collaborationRequests = new Map();
    this.messages = new Map();
    this.currentUserId = 1;
    this.currentProfileId = 1;
    this.currentRequestId = 1;
    this.currentMessageId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const id = this.currentUserId++;
    const user: User = {
      id,
      firstName: insertUser.firstName,
      lastName: insertUser.lastName,
      email: insertUser.email,
      password: hashedPassword,
      role: insertUser.role,
      bio: insertUser.bio || null,
      location: insertUser.location || null,
      avatar: insertUser.avatar || null,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async verifyPassword(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }

  async getProfile(userId: number): Promise<Profile | undefined> {
    return Array.from(this.profiles.values()).find(profile => profile.userId === userId);
  }

  async createProfile(insertProfile: InsertProfile): Promise<Profile> {
    const id = this.currentProfileId++;
    const profile: Profile = {
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
      investmentInterests: insertProfile.investmentInterests || null,
    };
    this.profiles.set(id, profile);
    return profile;
  }

  async updateProfile(userId: number, profileUpdate: Partial<InsertProfile>): Promise<Profile | undefined> {
    const existingProfile = await this.getProfile(userId);
    if (!existingProfile) return undefined;
    
    const updatedProfile = { ...existingProfile, ...profileUpdate };
    this.profiles.set(existingProfile.id, updatedProfile);
    return updatedProfile;
  }

  async getEntrepreneurs(): Promise<(User & { profile?: Profile })[]> {
    const entrepreneurs = Array.from(this.users.values()).filter(user => user.role === 'entrepreneur');
    return entrepreneurs.map(user => ({
      ...user,
      profile: Array.from(this.profiles.values()).find(profile => profile.userId === user.id)
    }));
  }

  async getInvestors(): Promise<(User & { profile?: Profile })[]> {
    const investors = Array.from(this.users.values()).filter(user => user.role === 'investor');
    return investors.map(user => ({
      ...user,
      profile: Array.from(this.profiles.values()).find(profile => profile.userId === user.id)
    }));
  }

  async getUserWithProfile(id: number): Promise<(User & { profile?: Profile }) | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const profile = Array.from(this.profiles.values()).find(profile => profile.userId === id);
    return { ...user, profile };
  }

  async createCollaborationRequest(insertRequest: InsertCollaborationRequest): Promise<CollaborationRequest> {
    const id = this.currentRequestId++;
    const request: CollaborationRequest = {
      id,
      senderId: insertRequest.senderId,
      receiverId: insertRequest.receiverId,
      message: insertRequest.message || null,
      status: insertRequest.status || "pending",
      createdAt: new Date(),
    };
    this.collaborationRequests.set(id, request);
    return request;
  }

  async getCollaborationRequests(userId: number): Promise<(CollaborationRequest & { sender: User, receiver: User })[]> {
    const requests = Array.from(this.collaborationRequests.values())
      .filter(request => request.receiverId === userId || request.senderId === userId);
    
    return requests.map(request => {
      const sender = this.users.get(request.senderId)!;
      const receiver = this.users.get(request.receiverId)!;
      return { ...request, sender, receiver };
    });
  }

  async updateCollaborationRequestStatus(id: number, status: string): Promise<CollaborationRequest | undefined> {
    const request = this.collaborationRequests.get(id);
    if (!request) return undefined;
    
    const updatedRequest = { ...request, status };
    this.collaborationRequests.set(id, updatedRequest);
    return updatedRequest;
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const message: Message = {
      ...insertMessage,
      id,
      timestamp: new Date(),
    };
    this.messages.set(id, message);
    return message;
  }

  async getMessages(userId1: number, userId2: number): Promise<(Message & { sender: User })[]> {
    const messages = Array.from(this.messages.values())
      .filter(message => 
        (message.senderId === userId1 && message.receiverId === userId2) ||
        (message.senderId === userId2 && message.receiverId === userId1)
      )
      .sort((a, b) => (a.timestamp?.getTime() || 0) - (b.timestamp?.getTime() || 0));
    
    return messages.map(message => {
      const sender = this.users.get(message.senderId)!;
      return { ...message, sender };
    });
  }
}

export const storage = new MemStorage();
