# Production OS 🎬

A complete production management web app for small video production companies.

## Features
- 📅 **Shoot Calendar** – Add/manage shoots with crew, location, Google Docs brief
- 📋 **Client Self-Booking** – Public booking page with date availability
- 🗂 **Admin Dashboard** – Stats, notifications, upcoming shoots
- ✅ **Task Management** – Assign tasks with priorities, deadlines, status updates
- 👥 **Team System** – Admin & Member roles with permissions
- 📁 **Client Projects** – Client database with linked projects & shoots
- 🔔 **Notifications** – Booking alerts, deadline warnings, shoot reminders

## Demo Accounts
| Name | Email | Password | Role |
|------|-------|----------|------|
| Arjun Mehta | arjun@prodco.in | admin123 | Admin |
| Priya Sharma | priya@prodco.in | priya123 | Member |
| Rahul Das | rahul@prodco.in | rahul123 | Member |
| Sneha Kapoor | sneha@prodco.in | sneha123 | Member |
| Kiran Bose | kiran@prodco.in | kiran123 | Member |

---

## 🚀 FREE Deployment Guide (Step by Step)

### Option 1: Deploy on Vercel (Recommended — FREE)

#### Step 1: Push to GitHub
```bash
# 1. Create a new repo on github.com (click + → New repository)
# 2. Then in your project folder:
git init
git add .
git commit -m "Initial commit: Production OS"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/production-os.git
git push -u origin main
```

#### Step 2: Deploy on Vercel
1. Go to **https://vercel.com** → Sign up free with GitHub
2. Click **"Add New Project"**
3. Import your `production-os` GitHub repository
4. Vercel auto-detects Vite — leave all settings as default
5. Click **"Deploy"**
6. Done! Your app is live at `https://production-os-XXXXX.vercel.app`

> **Free tier:** Unlimited deployments, custom domains, 100GB bandwidth/month

---

### Option 2: Deploy on Netlify (Also FREE)

#### Step 1: Build locally
```bash
npm install
npm run build
```

#### Step 2: Deploy
1. Go to **https://netlify.com** → Sign up free
2. Drag and drop the **`dist/`** folder onto the Netlify dashboard
3. Done! Live in 30 seconds.

Or connect GitHub for automatic deploys on every push.

---

### Option 3: GitHub Pages (FREE)

#### Step 1: Update vite.config.js
```js
export default defineConfig({
  plugins: [react()],
  base: '/production-os/', // your repo name
})
```

#### Step 2: Install gh-pages
```bash
npm install --save-dev gh-pages
```

#### Step 3: Add to package.json scripts
```json
"scripts": {
  "deploy": "npm run build && gh-pages -d dist"
}
```

#### Step 4: Deploy
```bash
npm run deploy
```

Your app goes live at `https://YOUR_USERNAME.github.io/production-os/`

---

## 💾 Adding a Real Backend (Optional, for persistent data)

The current version uses in-memory state (data resets on refresh). To add persistence:

### Supabase (FREE tier available)
1. Go to **https://supabase.com** → Create free project
2. Create these tables in SQL editor:
   - `shoots`, `tasks`, `clients`, `bookings`, `team`, `date_marks`
3. Install: `npm install @supabase/supabase-js`
4. Replace AppContext state with Supabase queries

### Environment Variables for Vercel
In Vercel dashboard → Settings → Environment Variables:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## Local Development
```bash
npm install
npm run dev
# Opens at http://localhost:5173
```

## Build for Production
```bash
npm run build
npm run preview  # Preview the production build
```

---

## Tech Stack
- **Frontend:** React 18 + Vite
- **Styling:** Tailwind CSS + Custom CSS Variables
- **Icons:** Lucide React
- **Fonts:** Syne (headings) + DM Sans (body)
- **State:** React Context API (no backend required)
- **Deploy:** Vercel / Netlify / GitHub Pages

---

*Built for small video production teams. All data is stored in browser memory.*
*For persistent storage, integrate Supabase (free tier available).*
