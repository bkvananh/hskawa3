/**
 * HSKawa 3 — main.js
 * Bước 1: chỉ xử lý việc nạp dữ liệu quotes.json và hiển thị một câu
 * động lực ngẫu nhiên. Card Engine, Handwriting Pad, Gamification và
 * Easter Egg sẽ được thêm ở các module riêng trong các bước tiếp theo,
 * để tránh nhồi tất cả logic vào một file duy nhất.
 */

/**
 * Nạp danh sách quotes từ file JSON tĩnh.
 * Dùng đường dẫn tương đối để chạy đúng trên GitHub Pages
 * (kể cả khi app được deploy trong một subpath, ví dụ user.github.io/repo/).
 */
async function loadQuotes() {
  const response = await fetch("./data/quotes.json");
  if (!response.ok) {
    throw new Error(`Không tải được quotes.json — mã lỗi ${response.status}`);
  }
  return response.json();
}

/** Chọn ngẫu nhiên một phần tử trong mảng. */
function pickRandom(list) {
  const index = Math.floor(Math.random() * list.length);
  return list[index];
}

/** Hiển thị một quote lên banner đầu trang. */
function renderQuote(quote) {
  const quoteText = document.getElementById("quote-text");
  if (!quoteText) return;
  quoteText.textContent = quote.content;
}

/** Khởi động ứng dụng khi DOM đã sẵn sàng. */
async function initApp() {
  try {
    const quotes = await loadQuotes();
    renderQuote(pickRandom(quotes));
  } catch (error) {
    // Nếu lỗi tải dữ liệu, hiển thị fallback thay vì để trống banner
    console.error(error);
    renderQuote({ content: "Chào em, hôm nay cũng cố lên nhé!" });
  }
}

document.addEventListener("DOMContentLoaded", initApp);
