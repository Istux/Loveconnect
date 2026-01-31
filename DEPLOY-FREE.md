# Deploy LoveConnect for FREE (no credit card)

Use **GitHub** + **Render.com** — both free, no card required.

---

## Part 1: Put your code on GitHub

### 1. Create a GitHub account (if you don’t have one)
- Go to **https://github.com** and sign up (free).

### 2. Create a new repository
- Click **+** (top right) → **New repository**
- **Repository name:** `loveconnect` (or any name)
- Leave **Public** selected
- **Do not** add a README, .gitignore, or license (you already have them)
- Click **Create repository**

### 3. Push your project to GitHub

Open **PowerShell** or **Command Prompt** and run (replace `YOUR_USERNAME` with your GitHub username):

```powershell
cd c:\Users\istiy\OneDrive\Desktop\mohstiyak

git remote add origin https://github.com/YOUR_USERNAME/loveconnect.git

git branch -M main

git push -u origin main
```

When asked for login, use your GitHub username and a **Personal Access Token** (not your password):
- GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)** → **Generate new token**
- Give it a name, check **repo**, generate, then copy the token and paste it when Git asks for a password.

---

## Part 2: Deploy on Render (free)

### 1. Sign up at Render
- Go to **https://render.com**
- Click **Get Started for Free**
- Sign up with **GitHub** (easiest — it will use your GitHub account)

### 2. Create a Web Service
- In the Render dashboard, click **New +** → **Web Service**
- Connect your GitHub account if asked
- Find and click **loveconnect** (your repo)
- If you don’t see it, click **Configure account** and allow Render to see your repos

### 3. Settings (fill in like this)
- **Name:** `loveconnect` (or whatever you like)
- **Region:** Pick one close to you
- **Branch:** `main`
- **Runtime:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start` or `node app.js`
- Leave **Instance type** as **Free**

### 4. Deploy
- Click **Create Web Service**
- Wait a few minutes for the first deploy
- When it’s done, Render shows a URL like: **https://loveconnect.onrender.com**

### 5. Use your site
- Open that URL and share it with your partner.

---

## Notes (free tier)
- The app may **sleep** after ~15 minutes of no visits; the first visit after that can take 30–60 seconds to wake up.
- **Photos** you upload are stored on Render’s server; they can be lost on redeploy. For long-term storage you’d use something like Cloudinary later.

---

## Quick checklist
- [ ] GitHub account + new repo created
- [ ] Pushed code: `git remote add origin ...` then `git push -u origin main`
- [ ] Render account (sign up with GitHub)
- [ ] New Web Service → connect repo → Build: `npm install`, Start: `npm start`
- [ ] Copy your live URL and share it
