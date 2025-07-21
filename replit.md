# Business Nexus - Professional Networking Platform

## Overview

Business Nexus is a full-stack web application designed to connect entrepreneurs and investors in a professional networking environment. The platform facilitates meaningful business relationships, collaboration requests, and real-time communication between users.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Radix UI components with Tailwind CSS styling
- **Build Tool**: Vite for fast development and optimized production builds
- **Component Library**: shadcn/ui design system

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **WebSocket**: Real-time communication using native WebSocket server
- **Authentication**: JWT-based authentication with bcrypt for password hashing
- **Session Management**: PostgreSQL session storage with connect-pg-simple

### Database Architecture
- **Database**: PostgreSQL (configured for Neon serverless)
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Validation**: Zod schemas integrated with Drizzle for runtime validation

## Key Components

### Authentication System
- JWT token-based authentication
- Secure password hashing with bcrypt
- Protected routes with middleware authentication
- Persistent login sessions

### User Management
- Role-based user system (investors vs entrepreneurs)
- Comprehensive user profiles with industry-specific fields
- Avatar support and personal information management

### Networking Features
- Collaboration request system with status tracking
- Real-time messaging between connected users
- User discovery by role (find investors or entrepreneurs)
- Profile browsing and connection requests

### Real-time Communication
- WebSocket-based chat system
- Message history persistence
- Online presence indicators
- Real-time notifications for new messages and collaboration requests

## Data Flow

### Client-Server Communication
1. **Authentication Flow**: Login/register → JWT token → stored in localStorage → included in API requests
2. **Data Fetching**: React Query manages server state with automatic caching and invalidation
3. **Real-time Updates**: WebSocket connection for instant message delivery and notifications
4. **Form Submissions**: API requests through custom request wrapper with error handling

### Database Operations
1. **User Data**: CRUD operations through Drizzle ORM with type safety
2. **Messages**: Real-time insertion with WebSocket broadcasting
3. **Collaboration Requests**: Status-based workflow management
4. **Profiles**: Rich user profile data with JSON fields for complex data types

## External Dependencies

### Core Framework Dependencies
- React 18 ecosystem (React DOM, hooks)
- Express.js with TypeScript support
- Drizzle ORM with PostgreSQL driver (@neondatabase/serverless)

### UI/UX Dependencies
- Radix UI component primitives for accessibility
- Tailwind CSS for utility-first styling
- shadcn/ui component library
- Lucide React for icons

### Authentication & Security
- jsonwebtoken for JWT handling
- bcrypt for password hashing
- connect-pg-simple for session storage

### Development Tools
- TypeScript for type safety
- Vite for development and building
- ESBuild for server bundling
- Replit-specific development plugins

## Deployment Strategy

### Development Environment
- Vite dev server for frontend with HMR
- tsx for TypeScript execution in development
- Replit-specific tooling for cloud development

### Production Build
- Vite builds optimized client bundle to dist/public
- ESBuild bundles server code to dist/index.js
- Static file serving through Express
- Environment-based configuration

### Database Deployment
- Neon PostgreSQL serverless database
- Drizzle migrations for schema management
- Environment variable configuration for database URL

### Hosting Considerations
- Single-server deployment with Express serving both API and static files
- WebSocket server runs on the same HTTP server instance
- Session storage in PostgreSQL for scalability
- JWT tokens for stateless authentication across requests