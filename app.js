const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Ensure uploads folder exists (skip on Heroku if needed)
try {
  if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');
} catch (e) { /* ignore */ }

const upload = multer({ dest: 'uploads/' });
app.use('/uploads', express.static('uploads'));

// Optional: shared code for privacy (set SHARED_CODE env var, e.g. heroku config:set SHARED_CODE=love2023)
const SHARED_CODE = process.env.SHARED_CODE;
app.use((req, res, next) => {
  if (SHARED_CODE && req.path === '/' && req.query.code !== SHARED_CODE) {
    return res.send('<h1 style="text-align:center;font-family:Arial;color:#DC143C;">🔒 LoveConnect</h1><p style="text-align:center;">Enter the secret code in the URL: <code>?code=yourcode</code></p><p style="text-align:center;">Share the full URL with your partner to let them in! 💕</p>');
  }
  next();
});

// Explicitly serve main page first (ensures index.html is always served)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use(express.static(path.join(__dirname, 'public')));

// In-memory storage
let chatMessages = [];
let photos = [];
let moods = [];
let quizScores = { user1: 0, user2: 0 };
let lovePoints = { user1: 0, user2: 0 };
let countdown = { event: 'Next Date', date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] };
let drawingData = null;

// Photo upload endpoint
app.post('/upload', upload.single('photo'), (req, res) => {
  if (req.file) {
    const photo = { url: `/uploads/${req.file.filename}`, time: new Date().toLocaleString() };
    photos.push(photo);
    io.emit('newPhoto', photo);
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

io.on('connection', (socket) => {
  console.log('A user connected');

  // Send existing data
  socket.emit('loadData', {
    chatMessages,
    photos,
    moods,
    quizScores,
    lovePoints,
    countdown,
    drawingData
  });

  // Chat
  socket.on('sendMessage', (msg) => {
    chatMessages.push(msg);
    socket.broadcast.emit('newMessage', msg);
    lovePoints.user1 += 5;
    lovePoints.user2 += 5;
    io.emit('updatePoints', lovePoints);
  });

  // Moods
  socket.on('shareMood', (mood) => {
    moods.push(mood);
    io.emit('newMood', mood);
  });

  // Quiz
  socket.on('submitQuiz', (score) => {
    quizScores.user1 += score;
    io.emit('updateQuiz', quizScores);
  });

  // Gifts
  socket.on('sendGift', (gift) => {
    socket.broadcast.emit('receiveGift', gift);
  });

  // Countdown
  socket.on('setCountdown', (data) => {
    countdown = data;
    io.emit('updateCountdown', countdown);
  });

  // Drawing (Fabric.js)
  socket.on('drawUpdate', (data) => {
    drawingData = data;
    socket.broadcast.emit('drawUpdate', data);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
