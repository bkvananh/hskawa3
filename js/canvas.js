/**
 * HSK 3 Flashcard App - Writing Canvas
 * Khắc phục triệt để lỗi lệch nét chuột trên Desktop bằng Dynamic Aspect Scale & ResizeObserver
 */

class WritingCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext("2d");
    this.isDrawing = false;
    this.undoStack = [];
    this.redoStack = [];
    this.maxHistory = 25;

    this.baseLineWidth = 4;
    this.strokeColor = "#1f2937";

    this.btnUndo = document.getElementById("btn-undo");
    this.btnRedo = document.getElementById("btn-redo");
    this.btnClear = document.getElementById("btn-clear");

    this.init();
  }

  init() {
    this.setupResolution();
    this.bindEvents();
    this.saveState();
  }

  // Khởi tạo buffer đồng bộ với tỉ lệ Retina và kích thước hiển thị thực tế
  setupResolution() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    if (rect.width > 0 && rect.height > 0) {
      // Sao chép lại nét vẽ cũ trước khi gán lại kích thước buffer
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = this.canvas.width;
      tempCanvas.height = this.canvas.height;
      const tempCtx = tempCanvas.getContext("2d");
      
      if (this.canvas.width > 0 && this.canvas.height > 0) {
        tempCtx.drawImage(this.canvas, 0, 0);
      }

      const targetWidth = Math.round(rect.width * dpr);
      const targetHeight = Math.round(rect.height * dpr);

      // Chỉ cập nhật khi kích thước có sự thay đổi thực sự
      if (this.canvas.width !== targetWidth || this.canvas.height !== targetHeight) {
        this.canvas.width = targetWidth;
        this.canvas.height = targetHeight;

        if (tempCanvas.width > 0 && tempCanvas.height > 0) {
          this.ctx.drawImage(tempCanvas, 0, 0, this.canvas.width, this.canvas.height);
        }
      }

      this.ctx.lineCap = "round";
      this.ctx.lineJoin = "round";
      this.ctx.strokeStyle = this.strokeColor;
      this.ctx.lineWidth = this.baseLineWidth * dpr;
    }
  }

  // Ánh xạ tọa độ chuột/cảm ứng sang tọa độ pixel nội tại của canvas
  getCoordinates(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }

  startDrawing(e) {
    this.isDrawing = true;
    const { x, y } = this.getCoordinates(e);

    this.ctx.beginPath();
    this.ctx.moveTo(x, y);

    const dpr = window.devicePixelRatio || 1;
    const currentRadius = (this.baseLineWidth * dpr) / 2;
    this.ctx.arc(x, y, currentRadius, 0, Math.PI * 2);
    this.ctx.fillStyle = this.strokeColor;
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
  }

  draw(e) {
    if (!this.isDrawing) return;
    e.preventDefault();

    const { x, y } = this.getCoordinates(e);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
  }

  stopDrawing() {
    if (!this.isDrawing) return;
    this.isDrawing = false;
    this.ctx.closePath();
    this.saveState();
  }

  saveState() {
    if (this.undoStack.length >= this.maxHistory) {
      this.undoStack.shift();
    }
    const snapshot = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    this.undoStack.push(snapshot);
    this.redoStack = [];
  }

  undo() {
    if (this.undoStack.length > 1) {
      const currentState = this.undoStack.pop();
      this.redoStack.push(currentState);
      const previousState = this.undoStack[this.undoStack.length - 1];
      this.ctx.putImageData(previousState, 0, 0);
    }
  }

  redo() {
    if (this.redoStack.length > 0) {
      const nextState = this.redoStack.pop();
      this.undoStack.push(nextState);
      this.ctx.putImageData(nextState, 0, 0);
    }
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.undoStack = [];
    this.redoStack = [];
    this.saveState();
  }

  bindEvents() {
    this.canvas.addEventListener("pointerdown", (e) => this.startDrawing(e));
    this.canvas.addEventListener("pointermove", (e) => this.draw(e));
    this.canvas.addEventListener("pointerup", () => this.stopDrawing());
    this.canvas.addEventListener("pointercancel", () => this.stopDrawing());
    this.canvas.addEventListener("pointerleave", () => this.stopDrawing());

    if (this.btnUndo) this.btnUndo.addEventListener("click", () => this.undo());
    if (this.btnRedo) this.btnRedo.addEventListener("click", () => this.redo());
    if (this.btnClear) this.btnClear.addEventListener("click", () => this.clear());

    // Cập nhật lại khung vẽ ngay khi chuyển chế độ tập viết
    window.addEventListener("writing-mode-enabled", () => {
      this.setupResolution();
      this.clear();
    });

    // Tự động xóa sạch bảng khi chuyển sang từ mới
    window.addEventListener("card-changed", () => {
      this.clear();
    });

    // Theo dõi chính xác kích thước container thay đổi trên desktop
    if (window.ResizeObserver) {
      const observer = new ResizeObserver(() => {
        this.setupResolution();
      });
      observer.observe(this.canvas);
    } else {
      window.addEventListener("resize", () => {
        this.setupResolution();
      });
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new WritingCanvas("writing-canvas");
});