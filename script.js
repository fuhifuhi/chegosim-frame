
let video = document.getElementById('camera');
let canvas = document.getElementById('overlay');
let context = canvas.getContext('2d');
let drawMode = false;
let currentStream = null;

function initCamera(facing = 'user') {
  navigator.mediaDevices.getUserMedia({ video: { facingMode: facing } }).then(stream => {
    currentStream = stream;
    video.srcObject = stream;
    video.dataset.facing = facing;
  });
}

function switchCamera() {
  if (currentStream) {
    currentStream.getTracks().forEach(track => track.stop());
  }
  let newFacing = video.dataset.facing === 'user' ? 'environment' : 'user';
  initCamera(newFacing);
}

function toggleDraw() {
  drawMode = !drawMode;
  canvas.style.pointerEvents = drawMode ? 'auto' : 'none';
  event.target.innerText = drawMode ? '✏️ 手書きON' : '✏️ 手書きOFF';
}

function placeText() {
  let text = document.getElementById('textInput').value;
  let el = document.getElementById('textOverlay');
  el.innerText = text || '';
  el.style.color = document.getElementById('penColor').value;
}

function adjustFontSize(size) {
  document.getElementById('textOverlay').style.fontSize = size + 'px';
}

document.getElementById('frameSelect').addEventListener('change', function () {
  document.getElementById('frameImage').src = this.value;
});

let moving = false;
document.getElementById('textOverlay').addEventListener('touchstart', function (e) {
  moving = true;
});
document.getElementById('textOverlay').addEventListener('touchmove', function (e) {
  if (!moving) return;
  let t = e.touches[0];
  this.style.left = t.pageX + 'px';
  this.style.top = t.pageY + 'px';
  this.style.transform = 'translate(-50%, -50%)';
});
document.getElementById('textOverlay').addEventListener('touchend', () => moving = false);

canvas.addEventListener('touchstart', e => {
  if (!drawMode) return;
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  context.beginPath();
  context.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
});
canvas.addEventListener('touchmove', e => {
  if (!drawMode) return;
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  context.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
  context.strokeStyle = document.getElementById('penColor').value;
  context.lineWidth = 3;
  context.stroke();
});

function takePhoto() {
  let capture = document.createElement('canvas');
  capture.width = video.videoWidth;
  capture.height = video.videoHeight;
  let ctx = capture.getContext('2d');
  ctx.drawImage(video, 0, 0, capture.width, capture.height);
  ctx.drawImage(canvas, 0, 0, capture.width, capture.height);
  let frame = document.getElementById('frameImage');
  ctx.drawImage(frame, 0, 0, capture.width, capture.height);

  let textEl = document.getElementById('textOverlay');
  if (textEl.innerText) {
    ctx.font = window.getComputedStyle(textEl).font;
    ctx.fillStyle = textEl.style.color;
    ctx.textAlign = 'center';
    let rect = textEl.getBoundingClientRect();
    let x = rect.left + rect.width / 2;
    let y = rect.top + rect.height / 2;
    x *= capture.width / window.innerWidth;
    y *= capture.height / window.innerHeight;
    ctx.fillText(textEl.innerText, x, y);
  }

  let a = document.createElement('a');
  a.href = capture.toDataURL('image/png');
  a.download = 'chegosim_photo.png';
  a.click();
}

initCamera();
