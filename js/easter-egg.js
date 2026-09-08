/**
 * HSK 3 Flashcard App - Easter Egg & Secret Message Logic
 * Hỗ trợ đa dạng biến thể có dấu, không dấu và đối sánh ngữ nghĩa linh hoạt
 */

// Hàm chuẩn hóa chuỗi: chuyển chữ thường, bỏ dấu thanh, bỏ dấu câu và khoảng trắng thừa
function normalizeText(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Bỏ dấu tiếng Việt
    .replace(/đ/g, "d")
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'<>]/g, "") // Bỏ dấu câu
    .replace(/\s+/g, " ")
    .trim();
}

// Danh sách mở rộng các biến thể câu trả lời thường gặp (cả có dấu và văn phong đời thường)
const VALID_ANSWERS = [
  // Biến thể chuẩn từ "tôi"
  "tôi dễ thương, làm ơn cho tôi tiền.",
  "tôi dễ thương làm ơn cho tôi tiền",
  "tôi rất dễ thương, làm ơn cho tôi tiền",
  "tôi rất dễ thương làm ơn cho tôi tiền",
  "tôi dễ thương, xin hãy cho tôi tiền",
  "tôi dễ thương hãy cho tôi tiền",
  "tôi dễ thương cho tôi tiền",
  "tôi dễ thương cho tôi tiền đi",
  "tôi dễ thương cho tôi xin tiền",
  "tôi đáng yêu, làm ơn cho tôi tiền",
  "tôi rất đáng yêu làm ơn cho tôi tiền",

  // Biến thể xưng "em"
  "em dễ thương, làm ơn cho em tiền",
  "em dễ thương làm ơn cho em tiền",
  "em rất dễ thương làm ơn cho em tiền",
  "em dễ thương cho em tiền",
  "em dễ thương cho em tiền đi",
  "em dễ thương cho em xin tiền",
  "em đáng yêu làm ơn cho em tiền",
  "em đáng yêu cho em tiền đi",

  // Biến thể xưng "tui"
  "tui dễ thương, làm ơn cho tui tiền",
  "tui dễ thương làm ơn cho tui tiền",
  "tui rất dễ thương làm ơn cho tui tiền",
  "tui dễ thương cho tui tiền",
  "tui dễ thương cho tui tiền đi",
  "tui dễ thương cho tui xin tiền",
  "tui đáng yêu cho tui tiền",

  // Biến thể xưng "mình", "tớ"
  "mình dễ thương, làm ơn cho mình tiền",
  "mình dễ thương làm ơn cho mình tiền",
  "tớ dễ thương, làm ơn cho tớ tiền",
  "tớ dễ thương làm ơn cho tớ tiền",

  // Biến thể rút gọn
  "dễ thương quá làm ơn cho tiền",
  "dễ thương quá cho tiền đi",
  "dễ thương cho tiền",
  "rất dễ thương làm ơn cho tiền",

  // Tiếng Trung & Pinyin
  "我很可爱请给我钱",
  "我很可爱，请给我钱",
  "wo hen ke ai qing gei wo qian",
  "wǒ hěn kě'ài qǐng gěi wǒ qián"
];

// Hàm kiểm tra ngữ nghĩa thông minh: phòng trường hợp gõ thêm từ đệm
function isSmartMatch(normalizedInput) {
  const hasCute = 
    normalizedInput.includes("de thuong") || 
    normalizedInput.includes("dang yeu") || 
    normalizedInput.includes("ke ai") ||
    normalizedInput.includes("可爱");

  const hasMoney = 
    normalizedInput.includes("tien") || 
    normalizedInput.includes("qian") ||
    normalizedInput.includes("钱");

  const hasGiveOrAsk = 
    normalizedInput.includes("cho") || 
    normalizedInput.includes("xin") || 
    normalizedInput.includes("lam on") || 
    normalizedInput.includes("gei") || 
    normalizedInput.includes("qing") ||
    normalizedInput.includes("给") ||
    normalizedInput.includes("请");

  return hasCute && hasMoney && hasGiveOrAsk;
}

function triggerMassiveConfetti() {
  if (typeof confetti !== "function") return;

  const duration = 3.5 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 2000 };

  const interval = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    confetti(Object.assign({}, defaults, { particleCount, origin: { x: 0.1, y: 0.8 } }));
    confetti(Object.assign({}, defaults, { particleCount, origin: { x: 0.9, y: 0.8 } }));
  }, 250);
}

function initEasterEgg() {
  const inputElem = document.getElementById("secret-input");
  const checkBtn = document.getElementById("btn-check-secret");
  const modalElem = document.getElementById("easter-egg-modal");
  const closeModalBtn = document.getElementById("btn-close-secret-modal");

  if (!inputElem || !checkBtn || !modalElem) return;

  function verifyAnswer() {
    const rawVal = inputElem.value.trim();
    if (!rawVal) {
      inputElem.focus();
      return;
    }

    const normalizedInput = normalizeText(rawVal);

    // Kiểm tra trùng khớp danh sách mẫu HOẶC đạt điều kiện ngữ nghĩa
    const matchedList = VALID_ANSWERS.some(ans => {
      const normalizedTarget = normalizeText(ans);
      return normalizedInput.includes(normalizedTarget) || normalizedTarget.includes(normalizedInput);
    });

    const isCorrect = matchedList || isSmartMatch(normalizedInput);

    if (isCorrect) {
      modalElem.classList.remove("hidden");
      triggerMassiveConfetti();
      inputElem.value = "";
    } else {
      inputElem.classList.remove("shake-error");
      void inputElem.offsetWidth;
      inputElem.classList.add("shake-error");
      inputElem.placeholder = "iya! 🐰";
      inputElem.value = "";
    }
  }

  checkBtn.addEventListener("click", verifyAnswer);

  inputElem.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      verifyAnswer();
    }
  });

  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", () => {
      modalElem.classList.add("hidden");
    });
  }

  modalElem.addEventListener("click", (e) => {
    if (e.target === modalElem) {
      modalElem.classList.add("hidden");
    }
  });
}

document.addEventListener("DOMContentLoaded", initEasterEgg);