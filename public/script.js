const socket = io();
let canvas = new fabric.Canvas('canvas');
let currentBrushSize = 5;

// Music tracks (replace with real URLs)
const musicTracks = {
  track1: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
  track2: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
  track3: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
  track4: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
  track5: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
};

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
  updateActiveCount(data.active !== undefined ? data.active : 1);
  if (data.drawingData && typeof data.drawingData === 'object') {
    canvas.loadFromJSON(data.drawingData, () => canvas.renderAll());
  }
});

// Join/Leave notifications
socket.on('userJoined', (data) => {
  updateActiveCount(data.active);
  showNotification(`💖 ${data.name} Joined!`, `Active: ${data.active}`);
});

socket.on('userLeft', (data) => {
  updateActiveCount(data.active);
  showNotification(`😢 ${data.name} Left`, `Active: ${data.active}`);
});

function updateActiveCount(count) {
  const el = document.getElementById('activeCount');
  if (el) el.textContent = count;
}

function showNotification(title, subtitle) {
  const container = document.getElementById('notification-container');
  const notify = document.createElement('div');
  notify.className = 'notification-box';
  notify.innerHTML = `<span class="notify-icon">💖</span><strong>${title}</strong><br><small>${subtitle}</small>`;
  container.appendChild(notify);
  setTimeout(() => {
    notify.classList.add('fade-out');
    setTimeout(() => notify.remove(), 500);
  }, 5000);
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

// Tab switching
function showTab(tab) {
  const tabs = ['chat', 'drawing', 'gallery', 'quiz', 'mood', 'timer', 'music'];
  tabs.forEach(t => {
    const el = document.getElementById(t + '-tab');
    if (el) el.style.display = t === tab ? 'block' : 'none';
  });
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.classList.toggle('active', btn.textContent.trim().toLowerCase().includes(tab) || 
      (tab === 'timer' && btn.textContent.includes('Countdown')));
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

// Music
function playMusic() {
  const select = document.getElementById('music-select');
  const source = document.getElementById('music-source');
  source.src = musicTracks[select.value];
  const audio = document.getElementById('bg-music');
  audio.load();
  audio.play().catch(() => {});
}

function pauseMusic() {
  document.getElementById('bg-music').pause();
}

function setVolume() {
  document.getElementById('bg-music').volume = document.getElementById('volume').value;
}
