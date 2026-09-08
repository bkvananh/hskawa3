/**
 * HSK 3 Flashcard App - Core Logic, Gamification & Level Previews
 */

const MOCK_DATA = [
  {
    stt: 1,
    vocab: "爱",
    hanviet: "Ái",
    pinyin: "ài",
    meaning: "Động từ. Yêu; thích làm việc gì đó",
    example: "妈妈，我爱你。 / 我爱吃米饭。",
    example_meaning: "Mẹ ơi, con yêu mẹ. / Tôi thích ăn cơm."
  },
  {
    stt: 2,
    vocab: "八",
    hanviet: "Bát",
    pinyin: "bā",
    meaning: "Số từ. Tám (số 8)",
    example: "他儿子今年八岁了。",
    example_meaning: "Con trai anh ấy năm nay 8 tuổi rồi."
  },
  {
    stt: 3,
    vocab: "爸爸",
    hanviet: "Ba ba / Phụ thân",
    pinyin: "bàba",
    meaning: "Danh từ. Bố, cha",
    example: "我爸爸是医生。",
    example_meaning: "Bố tôi là bác sĩ."
  },
  {
    stt: 4,
    vocab: "杯子",
    hanviet: "Bôi tử",
    pinyin: "bēizi",
    meaning: "Danh từ. Cốc, ly, chén",
    example: "杯子里有茶。",
    example_meaning: "Trong cốc có trà."
  },
  {
    stt: 5,
    vocab: "北京",
    hanviet: "Bắc Kinh",
    pinyin: "Běijīng",
    meaning: "Danh từ riêng. Bắc Kinh (thủ đô Trung Quốc)",
    example: "我下星期去北京。",
    example_meaning: "Tuần sau tôi đi Bắc Kinh."
  }
];

const FALLBACK_QUOTES = [
  "Cố lên em yêu, mỗi chữ Hán là một bước gần hơn tới HSK3! 💙",
  "Mỗi ngày một chút kiên trì, quả ngọt đang chờ em ở phía trước! 🌸",
  "Nghỉ tay uống miếng nước nhé, em luôn là cô gái chăm chỉ nhất!",
  "Đừng lo nếu thấy khó, có anh luôn ở đây bên em! 🍀"
];

const LEVEL_CONFIG = [
  { level: 1, min: 0,   max: 75,  title: "chii lủng đầu" },
  { level: 2, min: 76,  max: 150, title: "chii thiếu ngủ" },
  { level: 3, min: 151, max: 225, title: "chii suy nghĩ" },
  { level: 4, min: 226, max: 300, title: "chii vui vẻ" },
  { level: 5, min: 301, max: 375, title: "chii động lực" },
  { level: 6, min: 376, max: 450, title: "chii quyết tâm" },
  { level: 7, min: 451, max: 525, title: "chii thành quả" },
  { level: 8, min: 526, max: 600, title: "chii béo phì" }
];

const STORAGE_KEY_MASTERED = "hsk3_mastered_words_v1";
const STORAGE_KEY_LAST_INDEX = "hsk3_last_index_v1";

// App State
const state = {
  flashcards: [],
  quotes: [],
  currentIndex: 0,
  currentMode: 1,
  isFlipped: false,
  masteredWords: new Set(),
  currentLevel: 1,
  cardsViewedCount: 0
};

// DOM Selectors
const elements = {
  appContainer: document.getElementById("app-container"),
  studyWorkspace: document.getElementById("study-workspace"),
  cardContainer: document.getElementById("flashcard"),
  cardVocabFront: document.getElementById("card-vocab"),
  cardHintFront: document.getElementById("card-hint"),
  cardLearnedTag: document.getElementById("card-learned-tag"),
  backVocab: document.getElementById("back-vocab"),
  backPinyin: document.getElementById("back-pinyin"),
  backHanviet: document.getElementById("back-hanviet"),
  backMeaning: document.getElementById("back-meaning"),
  backExample: document.getElementById("back-example"),
  backExampleMeaning: document.getElementById("back-example-meaning"),
  progressText: document.getElementById("progress-text"),
  levelTitle: document.getElementById("level-title"),
  avatarContainer: document.getElementById("avatar-container"),
  avatarImg: document.getElementById("avatar-img"),
  btnPrev: document.getElementById("btn-prev"),
  btnNext: document.getElementById("btn-next"),
  btnShuffle: document.getElementById("btn-shuffle"),
  btnToggleMaster: document.getElementById("btn-toggle-master"),
  masterBtnLabel: document.getElementById("master-btn-label"),
  btnMode1: document.getElementById("btn-mode-1"),
  btnMode2: document.getElementById("btn-mode-2"),
  writingArea: document.getElementById("writing-area"),
  dailyQuote: document.getElementById("daily-quote"),
  // Modal Chứng Chỉ
  levelBadge: document.getElementById("level-badge"),
  certModal: document.getElementById("cert-modal"),
  btnCloseModal: document.getElementById("btn-close-modal"),
  certAvatarWrapper: document.getElementById("cert-avatar-wrapper"),
  certAvatarImg: document.getElementById("cert-avatar-img"),
  certOverlayImg: document.getElementById("cert-overlay-img"),
  certLevelName: document.getElementById("cert-level-name"),
  certDesc: document.getElementById("cert-desc"),
  certProgressFill: document.getElementById("cert-progress-fill"),
  certPercentage: document.getElementById("cert-percentage"),
  mysteryUnlockBox: document.getElementById("mystery-unlock-box"),
  // Preview Cấp Độ & Reset
  teaserNextCard: document.getElementById("teaser-next-card"),
  teaserNextImg: document.getElementById("teaser-next-img"),
  teaserNextTitle: document.getElementById("teaser-next-title"),
  teaserFinalCard: document.getElementById("teaser-final-card"),
  teaserFinalImg: document.getElementById("teaser-final-img"),
  teaserFinalTitle: document.getElementById("teaser-final-title"),
  btnResetProgress: document.getElementById("btn-reset-progress")
};

// Khởi chạy ứng dụng
async function initApp() {
  loadSavedProgress();
  await Promise.all([loadFlashcardData(), loadQuotesData()]);
  bindEvents();
  updateGamificationUI(false);
  rotateQuote();
  renderCurrentCard();
}

// Đọc tiến độ từ LocalStorage
function loadSavedProgress() {
  try {
    const savedMastered = localStorage.getItem(STORAGE_KEY_MASTERED);
    if (savedMastered) {
      state.masteredWords = new Set(JSON.parse(savedMastered));
    }
    const savedIndex = localStorage.getItem(STORAGE_KEY_LAST_INDEX);
    if (savedIndex) {
      state.currentIndex = parseInt(savedIndex, 10) || 0;
    }
  } catch (err) {
    console.error("Không thể đọc localStorage:", err);
  }
}

// Lưu tiến độ vào LocalStorage
function saveProgress() {
  try {
    localStorage.setItem(STORAGE_KEY_MASTERED, JSON.stringify(Array.from(state.masteredWords)));
    localStorage.setItem(STORAGE_KEY_LAST_INDEX, state.currentIndex.toString());
  } catch (err) {
    console.error("Không thể lưu localStorage:", err);
  }
}

// Fetch flashcards.json
async function loadFlashcardData() {
  try {
    const response = await fetch("./data/flashcards.json");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    state.flashcards = await response.json();
  } catch (error) {
    console.warn("Dùng mock flashcards data:", error);
    state.flashcards = [...MOCK_DATA];
  }

  if (state.currentIndex >= state.flashcards.length) {
    state.currentIndex = 0;
  }
}

// Fetch quotes.json
async function loadQuotesData() {
  try {
    const response = await fetch("./data/quotes.json");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    state.quotes = await response.json();
  } catch (error) {
    console.warn("Dùng fallback quotes:", error);
    state.quotes = [...FALLBACK_QUOTES];
  }
}

// Đổi quote ngẫu nhiên
function rotateQuote() {
  if (!elements.dailyQuote || state.quotes.length === 0) return;
  const randomIndex = Math.floor(Math.random() * state.quotes.length);
  
  elements.dailyQuote.style.opacity = "0";
  setTimeout(() => {
    elements.dailyQuote.textContent = `"${state.quotes[randomIndex]}"`;
    elements.dailyQuote.style.opacity = "1";
  }, 200);
}

// Tính Level
function calculateLevel(masteredCount) {
  for (let i = LEVEL_CONFIG.length - 1; i >= 0; i--) {
    if (masteredCount >= LEVEL_CONFIG[i].min) {
      return LEVEL_CONFIG[i];
    }
  }
  return LEVEL_CONFIG[0];
}

// Cập nhật giao diện Gamification & Sneak Peek Preview
function updateGamificationUI(triggerCelebration = true) {
  const masteredCount = state.masteredWords.size;
  const total = state.flashcards.length || 600;
  const levelInfo = calculateLevel(masteredCount);
  const isLevelUp = levelInfo.level > state.currentLevel;
  state.currentLevel = levelInfo.level;

  elements.levelTitle.textContent = `Cấp ${levelInfo.level}: ${levelInfo.title}`;
  elements.progressText.textContent = `${masteredCount} / ${total} từ`;

  const avatarPath = `assets/images/avatar-lv${levelInfo.level}.jpg`;
  const isMystery = levelInfo.level === 8;
  const overlayPath = isMystery ? `assets/images/overlay-mystery.png` : `assets/images/overlay-normal.png`;

  // Avatar Header (Full hình)
  elements.avatarImg.src = avatarPath;

  // Modal Chứng Chỉ
  elements.certAvatarImg.src = avatarPath;
  elements.certOverlayImg.src = overlayPath;

  if (isMystery) {
    elements.avatarContainer.classList.add("rainbow-border");
    elements.certAvatarWrapper.classList.add("rainbow-border");
    elements.mysteryUnlockBox.classList.remove("hidden");
  } else {
    elements.avatarContainer.classList.remove("rainbow-border");
    elements.certAvatarWrapper.classList.remove("rainbow-border");
    elements.mysteryUnlockBox.classList.add("hidden");
  }

  const percentage = Math.min(100, Math.round((masteredCount / total) * 100));
  elements.certLevelName.textContent = `Cấp ${levelInfo.level} - ${levelInfo.title}`;
  elements.certDesc.textContent = `Em đã thuộc được ${masteredCount} / ${total} từ vựng HSK 3!`;
  elements.certProgressFill.style.width = `${percentage}%`;
  elements.certPercentage.textContent = `${percentage}% hoàn thành`;

  // Cập nhật ô xem trước cấp độ kế tiếp
  updateTeaserPreviews(levelInfo.level);

  if (triggerCelebration && isLevelUp && typeof confetti === "function") {
    confetti({
      particleCount: isMystery ? 200 : 80,
      spread: isMystery ? 100 : 60,
      origin: { y: 0.6 }
    });
  }
}

// Cập nhật ô Sneak Peek Preview
function updateTeaserPreviews(currentLevel) {
  if (currentLevel < 8) {
    const nextLevelNum = currentLevel + 1;
    const nextConfig = LEVEL_CONFIG.find(c => c.level === nextLevelNum);
    elements.teaserNextCard.style.display = "flex";
    elements.teaserNextImg.src = `assets/images/avatar-lv${nextLevelNum}.jpg`;
    elements.teaserNextTitle.textContent = nextConfig ? nextConfig.title : "???";
  } else {
    // Đã đạt cấp 8 tối đa
    elements.teaserNextCard.style.display = "none";
  }

  // Cấp tối thượng
  elements.teaserFinalImg.src = `assets/images/avatar-lv8.jpg`;
  elements.teaserFinalTitle.textContent = LEVEL_CONFIG[7].title;
}

// Render từ vựng hiện tại
function renderCurrentCard() {
  if (state.flashcards.length === 0) return;

  const card = state.flashcards[state.currentIndex];
  const cardId = card.stt || card.vocab;
  const isMastered = state.masteredWords.has(cardId);

  state.isFlipped = false;
  elements.cardContainer.classList.remove("is-flipped");

  if (isMastered) {
    elements.cardLearnedTag.classList.remove("hidden");
    elements.btnToggleMaster.classList.add("is-mastered");
    elements.btnToggleMaster.querySelector(".heart-icon").textContent = "💚";
    elements.masterBtnLabel.textContent = "Đã thuộc từ này";
  } else {
    elements.cardLearnedTag.classList.add("hidden");
    elements.btnToggleMaster.classList.remove("is-mastered");
    elements.btnToggleMaster.querySelector(".heart-icon").textContent = "🤍";
    elements.masterBtnLabel.textContent = "Đánh dấu đã thuộc";
  }

  if (state.currentMode === 1) {
    elements.cardVocabFront.classList.remove("hidden");
    elements.cardHintFront.classList.add("hidden");
    elements.cardVocabFront.textContent = card.vocab;
  } else {
    elements.cardVocabFront.classList.add("hidden");
    elements.cardHintFront.classList.remove("hidden");
    elements.cardHintFront.innerHTML = `<strong>${card.hanviet}</strong> (${card.pinyin})<br><br>${card.meaning}`;
  }

  elements.backVocab.textContent = card.vocab;
  elements.backPinyin.textContent = card.pinyin;
  elements.backHanviet.textContent = `[ ${card.hanviet} ]`;
  elements.backMeaning.textContent = card.meaning;
  elements.backExample.textContent = card.example;
  elements.backExampleMeaning.textContent = card.example_meaning;

  window.dispatchEvent(new CustomEvent("card-changed", { 
    detail: { currentIndex: state.currentIndex } 
  }));

  saveProgress();
}

// Đánh dấu từ đã thuộc
function toggleMasteredCurrentWord() {
  if (state.flashcards.length === 0) return;
  const card = state.flashcards[state.currentIndex];
  const cardId = card.stt || card.vocab;

  if (state.masteredWords.has(cardId)) {
    state.masteredWords.delete(cardId);
  } else {
    state.masteredWords.add(cardId);
    if (typeof confetti === "function") {
      confetti({ particleCount: 25, spread: 45, origin: { y: 0.7 } });
    }
  }

  updateGamificationUI(true);
  renderCurrentCard();
  saveProgress();
}

// Đặt lại toàn bộ tiến độ học
function resetAllProgress() {
  const isConfirmed = window.confirm("Chắc chắn muốn đặt lại toàn bộ tiến độ (xóa hết các từ đã thuộc) để học lại từ đầu không?");
  if (isConfirmed) {
    state.masteredWords.clear();
    state.currentLevel = 1;
    saveProgress();
    updateGamificationUI(false);
    renderCurrentCard();
    alert("Đã đặt lại tiến độ về Cấp 1.🌸");
  }
}

// Lật thẻ khi chạm vào card
function toggleFlipCard() {
  state.isFlipped = !state.isFlipped;
  elements.cardContainer.classList.toggle("is-flipped", state.isFlipped);
}

// Đổi quote sau mỗi cụm 10 từ
function checkAndRotateQuote() {
  state.cardsViewedCount++;
  if (state.cardsViewedCount % 10 === 0) {
    rotateQuote();
  }
}

// Sang từ tiếp theo
function nextCard() {
  if (state.currentIndex < state.flashcards.length - 1) {
    state.currentIndex++;
  } else {
    state.currentIndex = 0;
  }
  checkAndRotateQuote();
  renderCurrentCard();
}

// Về từ trước
function prevCard() {
  if (state.currentIndex > 0) {
    state.currentIndex--;
  } else {
    state.currentIndex = state.flashcards.length - 1;
  }
  checkAndRotateQuote();
  renderCurrentCard();
}

// Trộn ngẫu nhiên
function shuffleCards() {
  for (let i = state.flashcards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [state.flashcards[i], state.flashcards[j]] = [state.flashcards[j], state.flashcards[i]];
  }
  state.currentIndex = 0;
  rotateQuote();
  renderCurrentCard();
}

// Chuyển chế độ
function switchMode(newMode) {
  if (state.currentMode === newMode) return;
  state.currentMode = newMode;

  if (newMode === 1) {
    elements.btnMode1.classList.add("active");
    elements.btnMode2.classList.remove("active");
    elements.writingArea.classList.add("hidden");
    elements.studyWorkspace.classList.remove("writing-mode-active");
    elements.appContainer.classList.remove("writing-layout-expanded");
  } else {
    elements.btnMode2.classList.add("active");
    elements.btnMode1.classList.remove("active");
    elements.writingArea.classList.remove("hidden");
    elements.studyWorkspace.classList.add("writing-mode-active");
    elements.appContainer.classList.add("writing-layout-expanded");
    
    window.dispatchEvent(new CustomEvent("writing-mode-enabled"));
  }

  renderCurrentCard();
}

// Gán sự kiện
function bindEvents() {
  elements.cardContainer.addEventListener("click", toggleFlipCard);

  elements.btnNext.addEventListener("click", (e) => {
    e.stopPropagation();
    nextCard();
  });
  
  elements.btnPrev.addEventListener("click", (e) => {
    e.stopPropagation();
    prevCard();
  });
  
  elements.btnShuffle.addEventListener("click", shuffleCards);
  elements.btnToggleMaster.addEventListener("click", toggleMasteredCurrentWord);

  elements.btnMode1.addEventListener("click", () => switchMode(1));
  elements.btnMode2.addEventListener("click", () => switchMode(2));

  // Modal Chứng Chỉ
  elements.levelBadge.addEventListener("click", () => {
    elements.certModal.classList.remove("hidden");
  });
  elements.btnCloseModal.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    elements.certModal.classList.add("hidden");
  });
  elements.certModal.addEventListener("click", (e) => {
    if (e.target === elements.certModal) {
      elements.certModal.classList.add("hidden");
    }
  });

  // Nút đặt lại tiến độ
  if (elements.btnResetProgress) {
    elements.btnResetProgress.addEventListener("click", resetAllProgress);
  }

  // Phím tắt Desktop
  window.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT") return;
    
    if (e.code === "Space") {
      e.preventDefault();
      toggleFlipCard();
    } else if (e.code === "ArrowRight") {
      nextCard();
    } else if (e.code === "ArrowLeft") {
      prevCard();
    } else if (e.code === "KeyM") {
      toggleMasteredCurrentWord();
    }
  });

  // Vuốt chạm Mobile
  let touchStartX = 0;
  let touchEndX = 0;

  elements.cardContainer.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  elements.cardContainer.addEventListener("touchend", (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const swipeThreshold = 50;
    if (touchEndX < touchStartX - swipeThreshold) nextCard();
    if (touchEndX > touchStartX + swipeThreshold) prevCard();
  }, { passive: true });
}

// Console test: window.testLevel(8)
window.testLevel = function(targetLevel = 8) {
  const targetConfig = LEVEL_CONFIG.find(c => c.level === targetLevel) || LEVEL_CONFIG[7];
  state.masteredWords.clear();
  for (let i = 1; i <= targetConfig.min + 1; i++) {
    state.masteredWords.add(i);
  }
  updateGamificationUI(true);
  renderCurrentCard();
  console.log(`Đã chuyển test sang Cấp ${targetLevel}: ${targetConfig.title}!`);
};

export { state, renderCurrentCard, nextCard };

document.addEventListener("DOMContentLoaded", initApp);