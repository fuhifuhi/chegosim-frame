
let video = document.getElementById('camera');
let canvas = document.getElementById('overlay');
let context = canvas.getContext('2d');
let drawMode = false;
let currentStream = null;

navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } }).then(stream => {
  currentStream = stream;
  video.srcObject = stream;
});

function switchCamera() {
  if (currentStream) {
    currentStream.getTracks().forEach(track => track.stop());
  }
  let facing = video.dataset.facing === 'user' ? 'environment' : 'user';
  video.dataset.facing = facing;
  navigator.mediaDevices.getUserMedia({ video: { facingMode: facing } }).then(stream => {
    currentStream = stream;
    video.srcObject = stream;
  });
}

function takePhoto() {
  let capture = document.createElement('canvas');
  capture.width = video.videoWidth;
  capture.height = video.videoHeight;
  let ctx = capture.getContext('2d');
  ctx.drawImage(video, 0, 0, capture.width, capture.height);
  ctx.drawImage(canvas, 0, 0);
  let frame = document.getElementById('frameImage');
  ctx.drawImage(frame, 0, 0, capture.width, capture.height);
  let textEl = document.getElementById('textOverlay');
  if (textEl.innerText) {
    ctx.font = window.getComputedStyle(textEl).font;
    ctx.fillStyle = textEl.style.color;
    ctx.textAlign = 'center';
    ctx.fillText(textEl.innerText, capture.width / 2, capture.height / 2);
  }
  let a = document.createElement('a');
  a.href = capture.toDataURL('image/png');
  a.download = 'chegosim_photo.png';
  a.click();
}

function toggleDraw() {
  drawMode = !drawMode;
  canvas.style.pointerEvents = drawMode ? 'auto' : 'none';
  document.querySelector('button[onclick="toggleDraw()"]').innerText = drawMode ? '✏️ 手書きON' : '✏️ 手書きOFF';
}

canvas.addEventListener('mousedown', e => {
  if (!drawMode) return;
  context.beginPath();
  context.moveTo(e.offsetX, e.offsetY);
  canvas.addEventListener('mousemove', draw);
});

canvas.addEventListener('mouseup', e => {
  if (!drawMode) return;
  canvas.removeEventListener('mousemove', draw);
});

function draw(e) {
  context.lineTo(e.offsetX, e.offsetY);
  context.strokeStyle = document.getElementById('penColor').value;
  context.lineWidth = 3;
  context.stroke();
}

function placeText() {
  let text = document.getElementById('textInput').value;
  let overlay = document.getElementById('textOverlay');
  overlay.innerText = text;
  overlay.style.pointerEvents = 'auto';
  overlay.setAttribute('draggable', true);
}

document.getElementById('textOverlay').addEventListener('touchmove', function (e) {
  let touch = e.touches[0];
  this.style.left = touch.pageX + 'px';
  this.style.top = touch.pageY + 'px';
  this.style.transform = 'translate(-50%, -50%)';
});

function adjustFontSize(size) {
  document.getElementById('textOverlay').style.fontSize = size + 'px';
}

document.getElementById('frameSelect').addEventListener('change', function () {
  document.getElementById('frameImage').src = this.value;
});
