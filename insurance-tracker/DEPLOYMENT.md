# Insurance Tracker - Deployment Guide

## ✅ What You've Done So Far
1. Created Supabase project and database schema
2. Created your super admin account

## 📦 What You Have
- Complete React application with:
  - User authentication (Login/Signup)
  - Agent Dashboard
  - Manager Dashboard  
  - Super Admin Dashboard
  - Activity logging
  - Application entry
  - Conversion funnel visualization
  - Manager signup links

## 🚀 Next Steps: Deploy to Vercel

### Step 1: Push Code to GitHub

1. **Create a new GitHub repository:**
   - Go to https://github.com/new
   - Name it: `insurance-tracker` (or whatever you want)
   - Make it **Private**
   - DON'T initialize with README
   - Click "Create repository"

2. **Upload your code:**
   You have two options:

   **Option A - If you have Git installed locally:**
   - Download the entire `/home/claude/insurance-tracker` folder I've created
   - Open terminal in that folder and run:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/insurance-tracker.git
   git push -u origin main
   ```

   **Option B - Upload via GitHub web interface:**
   - Download the `/home/claude/insurance-tracker` folder
   - On your GitHub repo page, click "uploading an existing file"
   - Drag and drop all the files from the insurance-tracker folder
   - Commit the upload

### Step 2: Deploy to Vercel

1. **Go to Vercel:**
   - Open https://vercel.com
   - Login with your GitHub account

2. **Import your project:**
   - Click "Add New..." → "Project"
   - Find your `insurance-tracker` repository
   - Click "Import"

3. **Configure the build:**
   - Framework Preset: Create React App (should auto-detect)
   - Root Directory: `./` (leave as is)
   - Build Command: `npm run build` (default)
   - Output Directory: `build` (default)

4. **Add Environment Variables:**
   Click "Environment Variables" and add these:
   ```
   REACT_APP_SUPABASE_URL = https://rpadvxbqtspamjqtouhm.supabase.co
   REACT_APP_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwYWR2eGJxdHNwYW1qcXRvdWhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NzczOTUsImV4cCI6MjA4MTE1MzM5NX0.SL1tOxXSKPzREVaFayJeHei9AL0w-XkUTj0BW8Cml8Y
   ```

5. **Click "Deploy"**
   - Vercel will build and deploy your app
   - This takes 2-3 minutes
   - You'll get a URL like: `https://insurance-tracker-xyz.vercel.app`

### Step 3: Test Your Deployment

1. **Open your Vercel URL**
2. **Login with your super admin account:**
   - Email: pauldmiller3@gmail.com
   - Password: (whatever you set when creating the user)

3. **Create a test scenario:**
   - Invite a manager
   - Have that manager generate their signup link
   - Create a test agent account using the manager's link
   - Log in as the test agent
   - Log some activity
   - Add an application
   - Log back in as manager to see the data

## 🔧 If Something Goes Wrong

### Build Fails on Vercel
- Check the build logs in Vercel
- Common issue: Missing dependencies
  - Solution: Make sure package.json is uploaded correctly

### Can't Login
- Check Supabase → Authentication → URL Configuration
- Make sure your Vercel URL is added to allowed redirect URLs:
  1. Go to Supabase Dashboard
  2. Settings → Authentication → URL Configuration
  3. Add your Vercel URL to "Redirect URLs"

### Database Errors
- Double-check that you ran the SQL schema in Supabase
- Check that Row Level Security policies are enabled
- Verify your super admin profile exists in the profiles table

## 📱 Using the App

### As Super Admin (You):
- Login at your-url.com/login
- Go to dashboard
- Invite managers
- See all managers and agents

### As Manager:
- Login at your-url.com/login
- See your signup link on dashboard
- Share that link with your agents
- View team performance
- Click on individual agents to see details

### As Agent:
- Signup at your-url.com/signup?code=MANAGER_CODE
  (or use general signup)
- Log activity throughout the day
- Add applications (automatically updates activity counts)
- View conversion funnel
- Track progress

## 🎯 What's Next (v1.1)

After you've tested and it's working:
1. Chrome Extension for quick tallies
2. We can discuss additional features

## 📞 Need Help?

Come back to this chat with:
- Screenshots of errors
- What you were trying to do
- The URL where you see the problem

I'll help you debug!
