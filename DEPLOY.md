# Deploy LoveConnect to Heroku

Your code is ready! Follow these steps to publish your site.

---

## Step 1: Log in to Heroku

Open a terminal in your project folder and run:

```bash
heroku login
```

- Press **any key** when prompted
- Your browser will open
- Log in to (or create) your Heroku account
- Return to the terminal when done

---

## Step 2: Create and Deploy

Run these commands in order:

```bash
cd c:\Users\istiy\OneDrive\Desktop\mohstiyak

heroku create loveconnect-mohstiyak
```

*(If that app name is taken, try `loveconnect-2024` or any unique name)*

```bash
git push heroku master
```

*(Use `git push heroku main` if your branch is `main`)*

---

## Step 3: Open Your Site

When deployment finishes, run:

```bash
heroku open
```

Or visit the URL Heroku shows (e.g. `https://loveconnect-mohstiyak.herokuapp.com`).

---

## Optional: Add a Secret Code

To keep it private, set a code and share the full URL with your partner:

```bash
heroku config:set SHARED_CODE=love2023
```

Then share: `https://your-app.herokuapp.com?code=love2023`

---

## Troubleshooting

- **"Couldn't find that app"** – The app name is taken. Try a different one: `heroku create my-loveconnect-123`
- **Deploy fails** – Run `heroku logs --tail` to see errors
- **Updates** – After changing code: `git add .` → `git commit -m "Update"` → `git push heroku master`
