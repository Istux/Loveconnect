const socket = io();
let canvas = new fabric.Canvas('canvas');
let currentBrushSize = 5;

// YouTube music playlist (official embeds)
const musicPlaylist = [
  { id: 'MJ8AkW7Q4GY', name: 'Love Yourself', artist: 'Justin Bieber' },
  { id: 'Umqb9KENgmk', name: 'Tum Hi Ho', artist: 'Arijit Singh' },
  { id: 'JGwWNGJdvx8', name: 'Shape of You', artist: 'Ed Sheeran' }
];
let currentSongIndex = 0;
let isMuted = false;

let currentActiveCount = 1;

// Fabric.js canvas setup
canvas.freeDrawingBrush.width = currentBrushSize;
canvas.freeDrawingBrush.color = '#FFB6C1';
canvas.isDrawingMode = true;

// Load initial data
socket.on('loadData', (data) => {
  (data.chatMessages || []).forEach(msg => addMessageToUI(msg));
  (data.photos || []).forEach(photo => addPhotoToUI(photo));
  (data.moods || []).forEach(mood => addMoodToUI(mood));
  updateQuizUI(data.quizScores || { user1: 0, user2: 0 }, data.currentQuiz);
  updatePoints(data.lovePoints || { user1: 0, user2: 0 });
  updateCountdownUI(data.countdown || {});
  updateActiveUsers(data.active !== undefined ? data.active : 1);
  if (data.drawingData && typeof data.drawingData === 'object') {
    canvas.loadFromJSON(data.drawingData, () => canvas.renderAll());
  }
});

// Join/Leave notifications
socket.on('userJoined', (data) => {
  updateActiveUsers(data.active);
  showNotification(`💖 ${data.name} Joined! Active: ${data.active}`);
});

socket.on('userLeft', (data) => {
  updateActiveUsers(data.active);
  showNotification(`😢 ${data.name} Left. Active: ${data.active}`);
});

// Interaction notifications (message, mood, quiz)
socket.on('notification', (data) => {
  showNotification(`💕 ${data.text}`);
  playChime();
});

function updateActiveUsers(count) {
  currentActiveCount = count;
  const el = document.getElementById('notif-text');
  const box = document.getElementById('notification');
  if (el) el.textContent = `💖 Active Users: ${count}`;
  if (box) box.classList.add('show');
}

function showNotification(text) {
  const notif = document.getElementById('notification');
  const textEl = document.getElementById('notif-text');
  if (textEl) textEl.textContent = text;
  if (notif) notif.classList.add('show');
  setTimeout(() => {
    if (notif) notif.classList.remove('show');
    setTimeout(() => updateActiveUsers(currentActiveCount), 500);
  }, 5000);
}

function playChime() {
  const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869-pop-alert-2869.wav');
  audio.volume = 0.3;
  audio.play().catch(() => {});
}

// Reset everything
function resetEverything() {
  if (confirm('Are you sure? This will clear everything for both of you!')) {
    socket.emit('resetAll');
  }
}

socket.on('resetAll', () => {
  document.getElementById('chat-messages').innerHTML = '';
  document.getElementById('photo-grid').innerHTML = '';
  document.getElementById('mood-list').innerHTML = '';
  document.getElementById('quiz-content').innerHTML = '';
  document.getElementById('quiz-score').textContent = 'Your Score: 0 | Partner: 0';
  document.getElementById('userPoints').textContent = '0';
  document.getElementById('partnerPoints').textContent = '0';
  document.getElementById('countdown-display').textContent = '';
  canvas.clear();
  canvas.backgroundColor = '#ffffff';
  canvas.renderAll();
  
  // Confetti effect
  for (let i = 0; i < 20; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.textContent = '🎉';
    confetti.style.position = 'fixed';
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.top = '10%';
    confetti.style.fontSize = '2em';
    confetti.style.zIndex = '9999';
    document.body.appendChild(confetti);
    setTimeout(() => confetti.remove(), 2000);
  }
});

// Tab switching with smooth transitions
function showTab(tab) {
  document.querySelectorAll('.tab-content').forEach(el => {
    el.classList.remove('show');
    el.style.display = 'none';
  });
  const activeTab = document.getElementById(tab + '-tab');
  if (activeTab) {
    activeTab.style.display = 'block';
    activeTab.offsetHeight; // Trigger reflow for animation
    activeTab.classList.add('show');
  }
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-tab') === tab);
  });
}

// Chat
function sendMessage() {
  const input = document.getElementById('message-input');
  if (input.value.trim()) {
    const msg = { text: input.value, time: new Date().toLocaleString(), sender: 'You' };
    socket.emit('sendMessage', msg);
    addMessageToUI(msg);
    input.value = '';
  }
}

socket.on('newMessage', (msg) => {
  addMessageToUI(msg);
});

function addMessageToUI(msg) {
  const div = document.createElement('div');
  div.className = 'message';
  div.innerHTML = `<strong>${msg.sender || 'Partner'} (${msg.time}):</strong> ${msg.text}`;
  document.getElementById('chat-messages').appendChild(div);
  document.getElementById('chat-messages').scrollTop = document.getElementById('chat-messages').scrollHeight;
}

// Gifts
function sendGift(type) {
  socket.emit('sendGift', type);
  showGiftAnimation(type);
}

socket.on('receiveGift', (type) => {
  showGiftAnimation(type);
});

function showGiftAnimation(type) {
  const giftDiv = document.createElement('div');
  giftDiv.className = 'gift-animation';
  giftDiv.textContent = type === 'heart' ? '💖' : type === 'flower' || type === 'rose' ? '🌹' : '💝';
  document.body.appendChild(giftDiv);
  setTimeout(() => giftDiv.remove(), 3000);
}

// Drawing (Fabric.js)
function addText() {
  const text = new fabric.IText('Love You!', { left: 100, top: 100, fill: '#FF69B4', fontFamily: 'Arial' });
  canvas.add(text);
  canvas.renderAll();
  syncCanvas();
}

function addShape(shape) {
  let obj;
  if (shape === 'heart') {
    obj = new fabric.Path('M 272.70141,238.71731 C 206.46141,238.71731 152.70146,292.4773 152.70146,358.71731 C 152.70146,493.47282 288.63461,528.80461 381.26391,662.02535 C 468.83815,529.62199 609.82641,489.17075 609.82641,358.71731 C 609.82641,292.4773 556.06651,238.71731 489.82641,238.71731 C 441.77851,238.71731 400.42481,267.08774 381.26391,307.90481 C 362.10311,267.08774 320.74941,238.71731 272.70141,238.71731 z', { fill: '#FF69B4', scaleX: 0.1, scaleY: 0.1 });
  }
  if (obj) {
    canvas.add(obj);
    canvas.renderAll();
    syncCanvas();
  }
}

function setBrushSize(size) {
  currentBrushSize = size;
  canvas.freeDrawingBrush.width = size;
}

function syncCanvas() {
  socket.emit('drawUpdate', canvas.toJSON());
}

function saveCanvas() {
  const link = document.createElement('a');
  link.download = 'love-drawing.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

function clearCanvas() {
  canvas.clear();
  canvas.backgroundColor = '#ffffff';
  canvas.renderAll();
  syncCanvas();
}

canvas.on('path:created', () => {
  syncCanvas();
});

canvas.on('object:modified', () => {
  syncCanvas();
});

socket.on('drawUpdate', (data) => {
  if (data && data.objects !== undefined) {
    canvas.loadFromJSON(data, () => canvas.renderAll());
  }
});

// Photo Gallery
function uploadPhoto() {
  const fileInput = document.getElementById('photo-upload');
  const file = fileInput.files[0];
  if (file) {
    const formData = new FormData();
    formData.append('photo', file);
    fetch('/upload', { method: 'POST', body: formData })
      .then(res => res.json())
      .then(data => { if (data.success) fileInput.value = ''; });
  }
}

socket.on('newPhoto', (photo) => {
  addPhotoToUI(photo);
});

function addPhotoToUI(photo) {
  const img = document.createElement('img');
  img.src = photo.url;
  img.alt = 'Uploaded photo';
  img.className = 'photo';
  document.getElementById('photo-grid').appendChild(img);
}

// Quiz
function answerQuiz(answer, points) {
  socket.emit('submitQuiz', { answer, points });
}

socket.on('updateQuiz', (data) => {
  updateQuizUI(data.scores, data.quiz);
});

function updateQuizUI(scores, quiz) {
  document.getElementById('quiz-score').textContent = `Your Score: ${scores.user1 || 0} | Partner: ${scores.user2 || 0}`;
  const content = document.getElementById('quiz-content');
  if (quiz && quiz.questions && quiz.questions.length) {
    content.innerHTML = `<p><strong>${quiz.name}</strong>: ${quiz.questions[0].q}</p>
      <button onclick="answerQuiz('${quiz.questions[0].a}', ${quiz.questions[0].points})">${quiz.questions[0].a}</button>
      <button onclick="answerQuiz('Other', 0)">Other</button>`;
  } else {
    content.innerHTML = '<p>No quiz available</p>';
  }
}

// Mood
function shareMood(mood) {
  const moodData = { mood, time: new Date().toLocaleString() };
  socket.emit('shareMood', moodData);
}

socket.on('newMood', (mood) => {
  addMoodToUI(mood);
});

function addMoodToUI(mood) {
  const div = document.createElement('div');
  div.className = 'mood-item';
  div.textContent = `${mood.mood} - ${mood.time}`;
  document.getElementById('mood-list').appendChild(div);
}

// Countdown
function setCountdown() {
  const eventName = document.getElementById('event-name').value || 'Special Day';
  const eventDate = document.getElementById('event-date').value;
  if (eventDate) {
    const data = { event: eventName, date: eventDate };
    socket.emit('setCountdown', data);
    updateCountdownUI(data);
  }
}

socket.on('updateCountdown', (data) => {
  updateCountdownUI(data);
});

function updateCountdownUI(data) {
  const display = document.getElementById('countdown-display');
  if (!data || !data.date) {
    display.textContent = 'Set an event and date above!';
    return;
  }
  const target = new Date(data.date);
  const now = new Date();
  const diff = target - now;
  if (diff <= 0) {
    display.textContent = `🎉 ${data.event || 'Event'} is today!`;
    return;
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  display.textContent = `${data.event || 'Event'}: ${days} days, ${hours} hours left! 💕`;
}

// Love Points
socket.on('updatePoints', (points) => {
  updatePoints(points);
});

function updatePoints(points) {
  document.getElementById('userPoints').textContent = points.user1 || 0;
  document.getElementById('partnerPoints').textContent = points.user2 || 0;
}

// Music (YouTube embeds)
function loadSong(index) {
  const song = musicPlaylist[index];
  const iframe = document.getElementById('music-iframe');
  const titleEl = document.getElementById('song-name');
  if (iframe && song) {
    iframe.src = `https://www.youtube.com/embed/${song.id}?autoplay=0&mute=${isMuted ? 1 : 0}&enablejsapi=1`;
    if (titleEl) titleEl.textContent = `${song.name} - ${song.artist}`;
  }
}

function nextSong() {
  currentSongIndex = (currentSongIndex + 1) % musicPlaylist.length;
  loadSong(currentSongIndex);
}

function playMusic() {
  const iframe = document.getElementById('music-iframe');
  if (iframe && iframe.contentWindow) {
    try { iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*'); } catch (e) {}
  }
}

function pauseMusic() {
  const iframe = document.getElementById('music-iframe');
  if (iframe && iframe.contentWindow) {
    try { iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*'); } catch (e) {}
  }
}

function toggleMute() {
  isMuted = !isMuted;
  const btn = document.getElementById('mute-btn');
  if (btn) btn.textContent = isMuted ? 'Unmute 🔊' : 'Mute 🔇';
  loadSong(currentSongIndex);
}
