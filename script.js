// === 获取真实月相 ===
function getMoonPhase() {
  const moon = SunCalc.getMoonIllumination(new Date());
  return moon.phase;
}

// === 获取纬度 ===
function getLatitude(callback) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => callback(pos.coords.latitude),
      () => callback(null)
    );
  } else {
    callback(null);
  }
}

// === 绘制单个月亮 ===
function drawMoon(canvasId, size, phase, latitude) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext("2d");

  const ratio = window.devicePixelRatio || 1;
  canvas.width = size * ratio;
  canvas.height = size * ratio;
  canvas.style.width = `${size}px`;
  canvas.style.height = `${size}px`;
  ctx.scale(ratio, ratio);

  ctx.clearRect(0, 0, size, size);
  ctx.save();
  ctx.translate(0.5, 0.5);

  ctx.lineWidth = 1;
  ctx.strokeStyle = "black";
  ctx.strokeRect(0, 0, size - 1, size - 1);

  const r = size * 0.4;
  const cx = size / 2;
  const cy = size / 2;

  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  const angle = (phase - 0.25) * 2 * Math.PI;
  let offset = r * 0.7 * Math.sin(angle);
  const bend = Math.abs(Math.cos(angle));
  if (latitude !== null && latitude < 0) offset = -offset;

  ctx.beginPath();
  ctx.moveTo(cx + offset, cy - r);
  ctx.bezierCurveTo(
    cx - offset * bend, cy - r * 0.5,
    cx - offset * bend, cy + r * 0.5,
    cx + offset, cy + r
  );
  ctx.stroke();

  ctx.restore();
}

// === 渲染 ===
getLatitude(latitude => {
  const phase = getMoonPhase();

  drawMoon("moon1", 100, phase, latitude);
  drawMoon("moon2", 200, phase, latitude);
  drawMoon("moon3", 300, phase, latitude);

  const m = SunCalc.getMoonIllumination(new Date());
  const pct = (m.fraction * 100).toFixed(1);
  const status =
    m.phase < 0.03 || m.phase > 0.97 ? "New Moon" :
    m.phase < 0.25 ? "Waxing Crescent" :
    m.phase === 0.25 ? "First Quarter" :
    m.phase < 0.5 ? "Waxing Gibbous" :
    m.phase === 0.5 ? "Full Moon" :
    m.phase < 0.75 ? "Waning Gibbous" :
    m.phase === 0.75 ? "Last Quarter" : "Waning Crescent";

  document.getElementById("moon-info").textContent =
    `${status} · ${pct}% illuminated`;
});

// === 底部编号 ===
const numbersContainer = document.getElementById("numbers");
const displayArea = document.getElementById("display-area");
const displayImg = document.getElementById("display-img");
const displayText = document.getElementById("display-text");
let currentScale = 2;

// 生成 1~13 编号
for (let i = 1; i <= 13; i++) {
  const span = document.createElement("span");
  span.textContent = i;
  span.addEventListener("click", e => {
    e.stopPropagation();
    showContent(i);
  });
  numbersContainer.appendChild(span);
}

// === 展示图片与文字 ===
function showContent(index) {
  displayArea.classList.remove("visible");
  displayText.classList.remove("visible");

  setTimeout(() => {
    displayImg.src = `img/${index}.png`;

    fetch(`txt/${index}.txt`)
      .then(res => res.text())
      .then(data => {
        const lines = data.split(/\r?\n/).filter(line => line.trim() !== "");
        displayText.innerHTML = ""; // 清空旧内容

        lines.forEach((line, i) => {
          const span = document.createElement("span");
          span.textContent = line;
          span.className = i === 0 ? "first-line" : "other-line";
          displayText.appendChild(span);

          // 保留换行
          if (i < lines.length - 1) displayText.appendChild(document.createElement("br"));
        });
      })
      .catch(() => {
        displayText.textContent = "(No text found)";
      });

    displayArea.classList.add("visible");
    displayText.classList.add("visible");
    updateImageScale(); // 确保首次显示时应用初始缩放

  }, 150);
  
}


// === 点击空白处关闭 ===
document.body.addEventListener("click", () => {
  displayArea.classList.remove("visible");
  displayText.classList.remove("visible"); // 同步关闭文字
});


// === 点击月亮放大倍数 ===
document.getElementById("moon1-block").addEventListener("click", e => {
  e.stopPropagation();
  currentScale = 2;
  updateImageScale();
});
document.getElementById("moon2-block").addEventListener("click", e => {
  e.stopPropagation();
  currentScale = 8;
  updateImageScale();
});
document.getElementById("moon3-block").addEventListener("click", e => {
  e.stopPropagation();
  currentScale = 40;
  updateImageScale();
});

function updateImageScale() {
  displayImg.style.position = "absolute";
  displayImg.style.top = "50%";
  displayImg.style.left = "50%";

  let originX = "center";
  let originY = "center";

  // ✅ 当点击的是线框 3（即 8 倍放大）时，随机选一个缩放中心
  if (currentScale === 40) {
    const randomX = Math.random() * 100; // 0% ~ 100%
    const randomY = Math.random() * 100; // 0% ~ 100%
    originX = `${randomX}%`;
    originY = `${randomY}%`;
  }

  displayImg.style.transformOrigin = `${originX} ${originY}`;
  displayImg.style.transform = `translate(-50%, -50%) scale(${currentScale})`;
}


// 点击空白区域关闭图片
document.body.addEventListener("click", () => {
  displayArea.classList.remove("visible");
});
