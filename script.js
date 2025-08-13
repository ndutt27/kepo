// script.js
const video = document.getElementById("video");
const captureBtn = document.getElementById("capture");
const finalizeBtn = document.getElementById("finalize");
const photosDiv = document.getElementById("photos");
const layoutSelect = document.getElementById("layout");
const filterSelect = document.getElementById("filter");
const canvas = document.getElementById("finalCanvas");
const downloadLink = document.getElementById("download");
const ctx = canvas.getContext("2d");

let capturedPhotos = [];

navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
  video.srcObject = stream;
});

captureBtn.addEventListener("click", () => {
  if (capturedPhotos.length >= 4) return;

  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");
  tempCanvas.width = video.videoWidth;
  tempCanvas.height = video.videoHeight;
  tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);

  const img = new Image();
  img.src = tempCanvas.toDataURL("image/png");
  img.onload = () => {
    capturedPhotos.push(img);
    photosDiv.appendChild(img);
  };
});

finalizeBtn.addEventListener("click", () => {
  const layout = layoutSelect.value;
  const filter = filterSelect.value;

  let w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  ctx.filter = filter !== "none" ? filter : "none";

  const gap = 10;
  let cols = 1, rows = 4;
  if (layout === "4x1") { cols = 4; rows = 1; }
  else if (layout === "2x2") { cols = 2; rows = 2; }

  let imgW = (w - (cols + 1) * gap) / cols;
  let imgH = (h - (rows + 1) * gap) / rows;

  capturedPhotos.forEach((img, index) => {
    if (index >= cols * rows) return;
    let x = gap + (index % cols) * (imgW + gap);
    let y = gap + Math.floor(index / cols) * (imgH + gap);
    ctx.drawImage(img, x, y, imgW, imgH);
  });

  downloadLink.href = canvas.toDataURL("image/png");
});
