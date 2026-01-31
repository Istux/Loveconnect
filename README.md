# 💖 LoveConnect

A real-time love notes, chat, drawing pad, and more for long-distance couples. Share messages, photos, moods, and draw together instantly—no matter the distance.

---

## Run Locally

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```
   Or: `node app.js`

3. Open **http://localhost:3000** in your browser.

4. **Test with two users:** Open the same URL in two browser tabs. Chat, draw, and upload—changes sync in real time.

---

## Deploy to Heroku (Make It Public & Shareable)

To let your partner access LoveConnect from anywhere (not just your Wi‑Fi), deploy to Heroku. You'll get a shareable URL like `https://your-app.herokuapp.com`.

### Prerequisites
- [Node.js](https://nodejs.org) and npm installed
- [Git](https://git-scm.com) installed
- Free [Heroku](https://heroku.com) account
- [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) installed

### Step-by-Step

1. **Initialize Git** (in your project folder):
   ```bash
   git init
   git add .
   git commit -m "Initial commit for LoveConnect"
   ```

2. **Log in to Heroku:**
   ```bash
   heroku login
   ```
   (Opens browser for login)

3. **Create and deploy:**
   ```bash
   heroku create your-loveconnect-app
   ```
   Replace `your-loveconnect-app` with a unique name (e.g. `my-love-hub-123`).

   ```bash
   git push heroku main
   ```
   (Use `git push heroku master` if your branch is `master`)

4. **Open the URL** Heroku shows (e.g. `https://your-loveconnect-app.herokuapp.com`). Share it with your partner.

### Optional: Add a Shared Secret Code

To keep the app private, set a shared code:

```bash
heroku config:set SHARED_CODE=love2023
```

Then share this URL with your partner: `https://your-app.herokuapp.com?code=love2023`

Without `?code=love2023`, visitors will see an "Enter Code" message.

### Troubleshooting
- **Deployment fails?** Run `heroku logs --tail` to see errors.
- **Update your app:** `git add .` → `git commit -m "Update"` → `git push heroku main`
- **Free tier:** Heroku apps sleep after inactivity but wake up quickly when visited.

### Important Notes for Heroku
- **Photos:** Heroku's file system resets on redeploy. Uploaded photos are temporary. For permanent storage, use a service like [Cloudinary](https://cloudinary.com).
- **Data:** Chat, moods, and drawings are in-memory and reset when the app restarts.

---

## Features
- Real-time chat
- Virtual gifts (hearts, etc.)
- Drawing pad (Fabric.js) with brushes, text, shapes
- Photo gallery
- Love Quiz
- Mood tracker
- Countdown timer
- Love Points

---

*Distance means so little when someone means so much. 💕*
