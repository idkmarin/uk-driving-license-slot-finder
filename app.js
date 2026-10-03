const GOAL_KEY = 'snapcalorie_daily_goal';
const MEALS_KEY = 'snapcalorie_meals';
const DEFAULT_GOAL = 2000;

const ui = {
  remainingCalories: document.getElementById('remainingCalories'),
  dailyGoal: document.getElementById('dailyGoal'),
  cameraFeed: document.getElementById('cameraFeed'),
  capturePreview: document.getElementById('capturePreview'),
  captureCanvas: document.getElementById('captureCanvas'),
  startCameraBtn: document.getElementById('startCameraBtn'),
  captureBtn: document.getElementById('captureBtn'),
  snapMealForm: document.getElementById('snapMealForm'),
  snapMealName: document.getElementById('snapMealName'),
  snapCalories: document.getElementById('snapCalories'),
  manualMealForm: document.getElementById('manualMealForm'),
  manualMealName: document.getElementById('manualMealName'),
  manualCalories: document.getElementById('manualCalories'),
  manualSubmitBtn: document.getElementById('manualSubmitBtn'),
  mealHistory: document.getElementById('mealHistory'),
  historySheet: document.getElementById('historySheet'),
  openHistoryBtn: document.getElementById('openHistoryBtn'),
  closeHistoryBtn: document.getElementById('closeHistoryBtn'),
  sheetHandle: document.getElementById('sheetHandle'),
  installBtn: document.getElementById('installBtn')
};

let stream;
let deferredInstallPrompt;
let editingMealId = null;
let capturedPhoto = '';

const todayKey = () => new Date().toISOString().slice(0, 10);
const readGoal = () => Number(localStorage.getItem(GOAL_KEY)) || DEFAULT_GOAL;
const readMeals = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(MEALS_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};
const saveMeals = (meals) => localStorage.setItem(MEALS_KEY, JSON.stringify(meals));

function mealCard(entry) {
  const li = document.createElement('li');
  li.className = 'history-item';
  const time = new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  li.innerHTML = `
    <strong>${entry.name}</strong>
    <div class="history-meta">
      <span>${entry.calories} kcal</span>
      <span>${time}</span>
    </div>
    ${entry.image ? `<img src="${entry.image}" alt="${entry.name}" style="width:100%;border-radius:0.6rem;margin-top:0.5rem;">` : ''}
    <div class="history-actions">
      <button data-action="edit" data-id="${entry.id}" class="btn small">Edit</button>
      <button data-action="delete" data-id="${entry.id}" class="btn small delete">Delete</button>
    </div>
  `;
  return li;
}

function updateSummary() {
  const goal = readGoal();
  const meals = readMeals().filter((meal) => meal.day === todayKey());
  const eaten = meals.reduce((sum, meal) => sum + meal.calories, 0);
  ui.remainingCalories.textContent = Math.max(goal - eaten, 0).toString();
  ui.dailyGoal.value = goal;
}

function renderHistory() {
  const meals = readMeals().filter((meal) => meal.day === todayKey()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  ui.mealHistory.innerHTML = '';
  if (!meals.length) {
    const empty = document.createElement('li');
    empty.className = 'history-item';
    empty.textContent = 'No meals yet today. Start with a snap or manual entry.';
    ui.mealHistory.appendChild(empty);
    return;
  }
  meals.forEach((meal) => ui.mealHistory.appendChild(mealCard(meal)));
}

function addMeal({ name, calories, image, source }) {
  const meals = readMeals();
  const payload = {
    id: crypto.randomUUID(),
    name,
    calories: Number(calories),
    image: image || '',
    source,
    day: todayKey(),
    createdAt: new Date().toISOString()
  };
  meals.push(payload);
  saveMeals(meals);
  capturedPhoto = '';
  ui.capturePreview.hidden = true;
  ui.cameraFeed.hidden = false;
  updateSummary();
  renderHistory();
}

function saveEdit(mealId, name, calories) {
  const meals = readMeals();
  const updated = meals.map((meal) => meal.id === mealId ? { ...meal, name, calories: Number(calories) } : meal);
  saveMeals(updated);
  editingMealId = null;
  ui.manualSubmitBtn.textContent = 'Add manual meal';
  ui.manualMealForm.reset();
  updateSummary();
  renderHistory();
}

async function startCamera() {
  if (stream) return;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
    ui.cameraFeed.srcObject = stream;
  } catch {
    alert('Camera access failed. You can still use manual meal entry.');
  }
}

function captureFrame() {
  if (!stream) return;
  const video = ui.cameraFeed;
  const canvas = ui.captureCanvas;
  canvas.width = video.videoWidth || 1280;
  canvas.height = video.videoHeight || 720;
  canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
  capturedPhoto = canvas.toDataURL('image/jpeg', 0.85);
  ui.capturePreview.src = capturedPhoto;
  ui.capturePreview.hidden = false;
  ui.cameraFeed.hidden = true;
}

function toggleSheet(isOpen) {
  ui.historySheet.classList.toggle('open', isOpen);
}

ui.dailyGoal.addEventListener('change', () => {
  const goal = Math.max(1, Number(ui.dailyGoal.value) || DEFAULT_GOAL);
  localStorage.setItem(GOAL_KEY, String(goal));
  updateSummary();
});

ui.startCameraBtn.addEventListener('click', startCamera);
ui.captureBtn.addEventListener('click', captureFrame);

ui.snapMealForm.addEventListener('submit', (event) => {
  event.preventDefault();
  addMeal({
    name: ui.snapMealName.value.trim(),
    calories: ui.snapCalories.value,
    image: capturedPhoto,
    source: 'camera'
  });
  ui.snapMealForm.reset();
});

ui.manualMealForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = ui.manualMealName.value.trim();
  const calories = ui.manualCalories.value;
  if (editingMealId) {
    saveEdit(editingMealId, name, calories);
    return;
  }
  addMeal({ name, calories, source: 'manual' });
  ui.manualMealForm.reset();
});

ui.mealHistory.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  const { action, id } = button.dataset;
  if (action === 'delete') {
    const remaining = readMeals().filter((meal) => meal.id !== id);
    saveMeals(remaining);
    updateSummary();
    renderHistory();
    return;
  }
  if (action === 'edit') {
    const meal = readMeals().find((item) => item.id === id);
    if (!meal) return;
    editingMealId = id;
    ui.manualMealName.value = meal.name;
    ui.manualCalories.value = meal.calories;
    ui.manualSubmitBtn.textContent = 'Save edit';
    toggleSheet(false);
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }
});

ui.openHistoryBtn.addEventListener('click', () => toggleSheet(true));
ui.closeHistoryBtn.addEventListener('click', () => toggleSheet(false));

let touchStartY = 0;
ui.sheetHandle.addEventListener('touchstart', (event) => {
  touchStartY = event.touches[0].clientY;
}, { passive: true });
ui.sheetHandle.addEventListener('touchend', (event) => {
  const delta = touchStartY - event.changedTouches[0].clientY;
  if (delta > 25) toggleSheet(true);
  if (delta < -25) toggleSheet(false);
}, { passive: true });

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  ui.installBtn.hidden = false;
});

ui.installBtn.addEventListener('click', async () => {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  ui.installBtn.hidden = true;
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

updateSummary();
renderHistory();
startCamera();
