const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Track active users for join/leave notifications
let activeUsers = 0;

// Ensure uploads folder exists
try {
  if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');
} catch (e) { /* ignore */ }

const upload = multer({ dest: 'uploads/' });
app.use('/uploads', express.static('uploads'));

// Optional: shared code for privacy
const SHARED_CODE = process.env.SHARED_CODE;
app.use((req, res, next) => {
  if (SHARED_CODE && req.path === '/' && req.query.code !== SHARED_CODE) {
    return res.send('<h1 style="text-align:center;font-family:Arial;color:#DC143C;">🔒 LoveConnect</h1><p style="text-align:center;">Enter the secret code in the URL: <code>?code=yourcode</code></p><p style="text-align:center;">Share the full URL with your partner to let them in! 💕</p>');
  }
  next();
});

// Explicitly serve main page first
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
let currentQuizIndex = 0;

const quizzes = [
  { name: 'Fun Facts', questions: [{ q: 'Favorite color?', a: 'Pink', points: 10 }] },
  { name: 'Dream Vacation', questions: [{ q: 'Dream place?', a: 'Paris', points: 15 }] },
  { name: 'Favorite Memories', questions: [{ q: 'Best memory?', a: 'First Date', points: 20 }] }
];

// Photo upload
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
  activeUsers++;
  // Notify others when someone joins (joiner doesn't see this)
  socket.broadcast.emit('userJoined', { name: 'Partner', active: activeUsers });

  console.log('A user connected, active:', activeUsers);

  // Send existing data including active count
  socket.emit('loadData', {
    chatMessages,
    photos,
    moods,
    quizScores,
    lovePoints,
    countdown,
    drawingData,
    currentQuiz: quizzes[currentQuizIndex],
    active: activeUsers
  });

  // Reset everything
  socket.on('resetAll', () => {
    chatMessages = [];
    photos = [];
    moods = [];
    quizScores = { user1: 0, user2: 0 };
    lovePoints = { user1: 0, user2: 0 };
    countdown = { event: 'Next Date', date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] };
    drawingData = null;
    currentQuizIndex = 0;
    io.emit('resetAll');
  });

  // Chat (with notification for partner)
  socket.on('sendMessage', (msg) => {
    chatMessages.push(msg);
    socket.broadcast.emit('newMessage', msg);
    socket.broadcast.emit('notification', { type: 'message', text: 'New message from Partner!' });
    lovePoints.user1 += 5;
    lovePoints.user2 += 5;
    io.emit('updatePoints', lovePoints);
  });

  // Moods (with notification for partner)
  socket.on('shareMood', (mood) => {
    moods.push(mood);
    io.emit('newMood', mood);
    socket.broadcast.emit('notification', { type: 'mood', text: `Partner shared mood: ${mood.mood}` });
  });

  // Quiz (with notification for partner)
  socket.on('submitQuiz', (data) => {
    quizScores.user1 += data.points;
    currentQuizIndex = (currentQuizIndex + 1) % quizzes.length;
    io.emit('updateQuiz', { scores: quizScores, quiz: quizzes[currentQuizIndex] });
    socket.broadcast.emit('notification', { type: 'quiz', text: 'Partner answered quiz!' });
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

  // Drawing
  socket.on('drawUpdate', (data) => {
    drawingData = data;
    socket.broadcast.emit('drawUpdate', data);
  });

  socket.on('disconnect', () => {
    activeUsers = Math.max(0, activeUsers - 1);
    io.emit('userLeft', { name: 'Partner', active: activeUsers });
    console.log('A user disconnected, active:', activeUsers);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
