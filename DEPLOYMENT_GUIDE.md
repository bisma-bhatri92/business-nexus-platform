# Business Nexus - Deployment Guide

## 🚀 Quick Deploy to GitHub & Vercel

### Step 1: Upload to GitHub

1. **Create a new GitHub repository:**
   - Go to [github.com](https://github.com) and click "New repository"
   - Name it: `business-nexus-platform`
   - Make it public
   - Don't initialize with README (we have files already)

2. **Upload your code:**
   - Download all files from this Replit project
   - In your new GitHub repo, click "uploading an existing file"
   - Drag and drop all files EXCEPT:
     - `node_modules/` folder
     - `.replit` file
     - Any `.log` files

3. **Commit the files:**
   - Add commit message: "Initial Business Nexus platform release"
   - Click "Commit new files"

### Step 2: Deploy Frontend to Vercel

1. **Go to [vercel.com](https://vercel.com)**
2. **Sign up/login with your GitHub account**
3. **Click "New Project"**
4. **Import your `business-nexus-platform` repository**
5. **Configure build settings:**
   - Framework Preset: `Vite`
   - Root Directory: `./` (keep default)
   - Build Command: `npm run build`
   - Output Directory: `dist/public`
   - Install Command: `npm install`

6. **Add Environment Variables** (if needed):
   - `NODE_ENV`: `production`

7. **Click "Deploy"**

### Step 3: Deploy Backend to Railway

1. **Go to [railway.app](https://railway.app)**
2. **Sign up/login with GitHub**
3. **Click "New Project" → "Deploy from GitHub repo"**
4. **Select your `business-nexus-platform` repository**
5. **Railway will auto-detect Node.js and deploy**

### Step 4: Connect Frontend to Backend

1. **Get your Railway backend URL** (e.g., `https://your-app.railway.app`)
2. **In Vercel, go to your project settings**
3. **Add environment variable:**
   - `VITE_API_URL`: `https://your-app.railway.app`
4. **Redeploy your Vercel project**

## 📱 Features Included

✅ **Complete Authentication System**
- JWT-based login/register
- Password hashing with bcrypt
- Protected routes

✅ **Role-Based Dashboards**
- Investor dashboard with entrepreneur discovery
- Entrepreneur dashboard with collaboration requests
- Real-time statistics and metrics

✅ **Real-Time Chat System**
- WebSocket-based messaging
- Message history
- Online status indicators

✅ **Collaboration Requests**
- Send/receive investment requests
- Accept/decline functionality
- Status tracking

✅ **Professional Profiles**
- Detailed user profiles
- Company information
- Funding requirements
- Portfolio management

✅ **Modern UI/UX**
- Responsive design
- Dark/light mode support
- Professional styling
- Mobile-friendly

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📞 Support

Your Business Nexus platform is ready for your HR presentation! The application includes:

- Complete user authentication
- Real-time messaging
- Professional networking features
- Investment collaboration tools
- Modern, responsive design

## 🌐 Live Demo URLs

Once deployed, you'll have:
- **Frontend**: `https://your-project.vercel.app`
- **Backend API**: `https://your-app.railway.app`

---

**Built with**: React, TypeScript, Node.js, Express, WebSockets, PostgreSQL
**Deployment**: Vercel (Frontend) + Railway (Backend)