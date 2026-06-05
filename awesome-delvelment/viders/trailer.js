const trailerScenes = [
  {
    badge: "Breaking",
    title: "Viders Parents just got bigger",
    copy: "Tonight on Viders News: parents can connect more than one child account from the same controls website.",
    lowerTitle: "Multiple child accounts",
    lowerCopy: "Every kid gets a spot in the protected parent hub.",
    ticker: "Viders Parents update adds multi-child account support across the family dashboard.",
    narration: "Breaking update from Viders News. Parent Controls now supports multiple child accounts."
  },
  {
    badge: "Live desk",
    title: "Every child gets a spot",
    copy: "Families can add names and emails one by one, or connect the current Viders account on this device.",
    lowerTitle: "Connected children list",
    lowerCopy: "Add, review, and manage each child account separately.",
    ticker: "New child account list lets parents add multiple Viders profiles without leaving the Parents page.",
    narration: "Every child can now be added to the parent controls list one by one."
  },
  {
    badge: "Security alert",
    title: "Change the list anytime",
    copy: "Parents can remove one child, clear all children, and keep the parent PIN protecting changes.",
    lowerTitle: "PIN-protected edits",
    lowerCopy: "Changes stay guarded behind the parent PIN.",
    ticker: "Security desk: parent PIN protects child account edits and family settings.",
    narration: "Parents can remove one child or clear all children while the PIN keeps changes protected."
  },
  {
    badge: "Back to you",
    title: "Viders stays ready to watch",
    copy: "Parent Controls lives on a separate page, so the main Viders app stays simple, open, and ready to watch.",
    lowerTitle: "Main app stays clean",
    lowerCopy: "Viewers can keep watching while parents manage settings separately.",
    ticker: "Viders remains open for watching, uploads, plans, ads, and creator rankings.",
    narration: "The main Viders app stays open for watching while parent settings live separately."
  }
];

const elements = {
  screen: document.querySelector("#trailerScreen"),
  badge: document.querySelector("#trailerSceneBadge"),
  title: document.querySelector("#trailerSceneTitle"),
  copy: document.querySelector("#trailerSceneCopy"),
  timeLabel: document.querySelector("#newsTimeLabel"),
  lowerTitle: document.querySelector("#newsLowerTitle"),
  lowerCopy: document.querySelector("#newsLowerCopy"),
  ticker: document.querySelector("#newsTickerText"),
  progressFill: document.querySelector("#trailerProgressFill"),
  playButton: document.querySelector("#playTrailerButton"),
  restartButton: document.querySelector("#restartTrailerButton"),
  muteButton: document.querySelector("#muteTrailerButton"),
  exportButton: document.querySelector("#exportTrailerButton"),
  exportStatus: document.querySelector("#trailerExportStatus"),
  downloadLink: document.querySelector("#downloadTrailerLink"),
  canvas: document.querySelector("#youtubeTrailerCanvas"),
  sceneCards: [...document.querySelectorAll("[data-scene]")]
};

let currentScene = 0;
let trailerTimer = null;
let audioContext = null;
let isSoundMuted = false;
let activeSpeech = null;

function getAudioContext() {
  if (isSoundMuted) {
    return null;
  }

  if (!audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      return null;
    }

    audioContext = new AudioContextClass();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  return audioContext;
}

function scheduleTone(context, outputNode, frequency, startTime, duration, gain = 0.06, type = "sine") {
  const oscillator = context.createOscillator();
  const volume = context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startTime);
  volume.gain.setValueAtTime(0.0001, startTime);
  volume.gain.exponentialRampToValueAtTime(gain, startTime + 0.03);
  volume.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  oscillator.connect(volume);
  volume.connect(outputNode);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.03);
}

function playTone(frequency, startTime, duration, gain = 0.06, type = "sine") {
  const context = getAudioContext();
  if (!context) {
    return;
  }

  scheduleTone(context, context.destination, frequency, startTime, duration, gain, type);
}

function playNewsSting() {
  const context = getAudioContext();
  if (!context) {
    return;
  }

  const now = context.currentTime;
  playTone(196, now, 0.18, 0.07, "sawtooth");
  playTone(392, now + 0.12, 0.18, 0.065, "sawtooth");
  playTone(523.25, now + 0.25, 0.24, 0.06, "triangle");
  playTone(784, now + 0.42, 0.34, 0.045, "triangle");
}

function playSceneBeep() {
  const context = getAudioContext();
  if (!context) {
    return;
  }

  const now = context.currentTime;
  playTone(880, now, 0.08, 0.035, "square");
  playTone(660, now + 0.08, 0.1, 0.025, "square");
}

function scheduleExportAudio(durationMs) {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass || !window.MediaStream) {
    return null;
  }

  if (!audioContext) {
    audioContext = new AudioContextClass();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  const destination = audioContext.createMediaStreamDestination();
  const start = audioContext.currentTime + 0.08;
  const durationSeconds = durationMs / 1000;
  const pad = audioContext.createOscillator();
  const padVolume = audioContext.createGain();

  pad.type = "sawtooth";
  pad.frequency.setValueAtTime(92, start);
  pad.frequency.exponentialRampToValueAtTime(138, start + durationSeconds);
  padVolume.gain.setValueAtTime(0.0001, start);
  padVolume.gain.exponentialRampToValueAtTime(0.014, start + 0.24);
  padVolume.gain.setValueAtTime(0.014, start + durationSeconds - 0.6);
  padVolume.gain.exponentialRampToValueAtTime(0.0001, start + durationSeconds);
  pad.connect(padVolume);
  padVolume.connect(destination);
  pad.start(start);
  pad.stop(start + durationSeconds + 0.04);

  [0, 4, 8, 12].forEach((offset) => {
    scheduleTone(audioContext, destination, 196, start + offset, 0.16, 0.07, "sawtooth");
    scheduleTone(audioContext, destination, 392, start + offset + 0.12, 0.16, 0.06, "sawtooth");
    scheduleTone(audioContext, destination, 784, start + offset + 0.28, 0.22, 0.045, "triangle");
  });

  for (let offset = 1.3; offset < durationSeconds - 0.6; offset += 1.35) {
    scheduleTone(audioContext, destination, 880, start + offset, 0.06, 0.022, "square");
  }

  return destination;
}

function speakScene(scene) {
  if (isSoundMuted || !window.speechSynthesis || !window.SpeechSynthesisUtterance) {
    return;
  }

  window.speechSynthesis.cancel();
  activeSpeech = new SpeechSynthesisUtterance(scene.narration);
  activeSpeech.rate = 0.95;
  activeSpeech.pitch = 0.92;
  activeSpeech.volume = 0.82;
  window.speechSynthesis.speak(activeSpeech);
}

function setScene(sceneIndex, options = {}) {
  currentScene = (sceneIndex + trailerScenes.length) % trailerScenes.length;
  const scene = trailerScenes[currentScene];

  elements.screen.classList.remove("is-pulsing");
  requestAnimationFrame(() => {
    elements.screen.classList.add("is-pulsing");
  });

  elements.badge.textContent = scene.badge;
  elements.title.textContent = scene.title;
  elements.copy.textContent = scene.copy;
  elements.timeLabel.textContent = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  elements.lowerTitle.textContent = scene.lowerTitle;
  elements.lowerCopy.textContent = scene.lowerCopy;
  elements.ticker.textContent = scene.ticker;
  elements.progressFill.style.width = `${((currentScene + 1) / trailerScenes.length) * 100}%`;

  elements.sceneCards.forEach((card) => {
    card.classList.toggle("is-active", Number(card.dataset.scene) === currentScene);
  });

  if (options.sound) {
    playSceneBeep();
    speakScene(scene);
  }
}

function stopTrailer() {
  window.clearInterval(trailerTimer);
  trailerTimer = null;
  elements.playButton.textContent = "Play news trailer with sound";
  window.speechSynthesis?.cancel();
}

function playTrailer() {
  if (trailerTimer) {
    stopTrailer();
    return;
  }

  playNewsSting();
  speakScene(trailerScenes[currentScene]);
  elements.playButton.textContent = "Pause trailer";
  trailerTimer = window.setInterval(() => {
    if (currentScene >= trailerScenes.length - 1) {
      stopTrailer();
      return;
    }

    const nextScene = currentScene + 1;
    setScene(nextScene, { sound: true });
  }, 2600);
}

elements.playButton?.addEventListener("click", playTrailer);
elements.restartButton?.addEventListener("click", () => {
  stopTrailer();
  setScene(0);
  playNewsSting();
});

elements.muteButton?.addEventListener("click", () => {
  isSoundMuted = !isSoundMuted;
  elements.muteButton.textContent = isSoundMuted ? "Sound off" : "Sound on";
  if (isSoundMuted) {
    window.speechSynthesis?.cancel();
  } else {
    playNewsSting();
  }
});

elements.sceneCards.forEach((card) => {
  card.addEventListener("click", () => {
    stopTrailer();
    setScene(Number(card.dataset.scene), { sound: true });
  });
});

function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  let currentY = y;

  words.forEach((word, index) => {
    const testLine = `${line}${word} `;
    if (ctx.measureText(testLine).width > maxWidth && index > 0) {
      ctx.fillText(line.trim(), x, currentY);
      line = `${word} `;
      currentY += lineHeight;
      return;
    }

    line = testLine;
  });

  ctx.fillText(line.trim(), x, currentY);
  return currentY;
}

function roundedRect(ctx, x, y, width, height, radius) {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + safeRadius, y);
  ctx.arcTo(x + width, y, x + width, y + height, safeRadius);
  ctx.arcTo(x + width, y + height, x, y + height, safeRadius);
  ctx.arcTo(x, y + height, x, y, safeRadius);
  ctx.arcTo(x, y, x + width, y, safeRadius);
  ctx.closePath();
}

function renderExportFrame(progressMs) {
  const canvas = elements.canvas;
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const sceneLength = 4000;
  const sceneIndex = Math.min(trailerScenes.length - 1, Math.floor(progressMs / sceneLength));
  const scene = trailerScenes[sceneIndex];
  const localProgress = (progressMs % sceneLength) / sceneLength;

  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, "#080c1c");
  bg.addColorStop(0.45, "#171f42");
  bg.addColorStop(1, "#361827");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  ctx.globalAlpha = 0.82;
  ctx.fillStyle = "#ff9f4d";
  ctx.beginPath();
  ctx.arc(width * 0.78, height * 0.2, 260 + Math.sin(progressMs / 520) * 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#43d2d1";
  ctx.beginPath();
  ctx.arc(width * 0.16, height * 0.78, 210 + Math.cos(progressMs / 620) * 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  for (let index = 0; index < 20; index += 1) {
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(index * 120 - ((progressMs / 20) % 120), 0, 2, height);
  }
  ctx.globalAlpha = 1;

  roundedRect(ctx, 210, 78, 360, 68, 34);
  ctx.fillStyle = "#d51f2a";
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.font = "900 34px Arial";
  ctx.fillText("LIVE", 252, 124);
  ctx.fillStyle = "#f7f5ef";
  ctx.font = "900 30px Arial";
  ctx.fillText("VIDERS NEWS NETWORK", 604, 123);
  ctx.fillStyle = "#b7bfd9";
  ctx.font = "700 24px Arial";
  ctx.fillText("Family Tech Desk", 1010, 123);

  const cardX = 210;
  const cardY = 176;
  const cardWidth = 1500;
  const cardHeight = 720;
  roundedRect(ctx, cardX, cardY, cardWidth, cardHeight, 58);
  const cardGradient = ctx.createLinearGradient(cardX, cardY, cardX + cardWidth, cardY + cardHeight);
  cardGradient.addColorStop(0, "rgba(255,255,255,0.16)");
  cardGradient.addColorStop(1, "rgba(255,255,255,0.05)");
  ctx.fillStyle = cardGradient;
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.24)";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.save();
  ctx.translate(cardX + 1140, cardY + 480);
  ctx.rotate(-0.14 + localProgress * 0.08);
  const logoGradient = ctx.createLinearGradient(-90, -90, 90, 90);
  logoGradient.addColorStop(0, "#ff6b3d");
  logoGradient.addColorStop(1, "#ffcb61");
  ctx.fillStyle = logoGradient;
  roundedRect(ctx, -110, -110, 220, 220, 46);
  ctx.fill();
  ctx.fillStyle = "#11131f";
  ctx.font = "900 142px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("V", 0, 8);
  ctx.restore();

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#11131f";
  roundedRect(ctx, cardX + 70, cardY + 74, 210, 58, 29);
  ctx.fillStyle = "#ffcb61";
  ctx.fill();
  ctx.fillStyle = "#11131f";
  ctx.font = "900 28px Arial";
  ctx.fillText(scene.badge.toUpperCase(), cardX + 100, cardY + 113);

  ctx.fillStyle = "#f7f5ef";
  ctx.font = "900 92px Arial";
  drawWrappedText(ctx, scene.title, cardX + 70, cardY + 250, 950, 100);

  ctx.fillStyle = "#d8deef";
  ctx.font = "500 42px Arial";
  drawWrappedText(ctx, scene.copy, cardX + 74, cardY + 550, 860, 58);

  ctx.fillStyle = "#ff9f4d";
  for (let index = 0; index < 4; index += 1) {
    const barHeight = 88 + Math.sin(progressMs / 260 + index) * 30 + index * 22;
    roundedRect(ctx, cardX + 1160 + index * 72, cardY + 620 - barHeight, 46, barHeight, 23);
    ctx.fill();
  }

  const lowerThirdY = cardY + cardHeight - 142;
  ctx.fillStyle = "#d51f2a";
  ctx.fillRect(cardX, lowerThirdY, 470, 142);
  ctx.fillStyle = "rgba(8, 12, 28, 0.96)";
  ctx.fillRect(cardX + 470, lowerThirdY, cardWidth - 470, 142);
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 38px Arial";
  ctx.fillText(scene.lowerTitle, cardX + 58, lowerThirdY + 58);
  ctx.fillStyle = "#ffe7df";
  ctx.font = "700 30px Arial";
  drawWrappedText(ctx, scene.lowerCopy, cardX + 520, lowerThirdY + 52, 780, 38);

  ctx.fillStyle = "rgba(7, 10, 22, 0.94)";
  ctx.fillRect(0, height - 86, width, 86);
  ctx.fillStyle = "#ffcb61";
  ctx.fillRect(0, height - 86, 260, 86);
  ctx.fillStyle = "#11131f";
  ctx.font = "900 30px Arial";
  ctx.fillText("BREAKING", 54, height - 32);
  ctx.fillStyle = "#f7f5ef";
  ctx.font = "800 30px Arial";
  ctx.fillText(scene.ticker, 306, height - 32);

  ctx.fillStyle = "rgba(255,255,255,0.22)";
  roundedRect(ctx, 210, 942, 1500, 18, 9);
  ctx.fill();
  const progressGradient = ctx.createLinearGradient(210, 942, 1710, 942);
  progressGradient.addColorStop(0, "#ff6b3d");
  progressGradient.addColorStop(1, "#43d2d1");
  ctx.fillStyle = progressGradient;
  roundedRect(ctx, 210, 942, 1500 * Math.min(progressMs / 16000, 1), 18, 9);
  ctx.fill();
}

function getRecorderMimeType() {
  const options = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm"
  ];

  return options.find((type) => window.MediaRecorder?.isTypeSupported(type)) || "";
}

function exportYouTubeTrailer() {
  if (!elements.canvas?.captureStream || !window.MediaRecorder) {
    elements.exportStatus.textContent = "This browser cannot export video. Open this page in Edge or Chrome.";
    return;
  }

  const fps = 30;
  const durationMs = 16000;
  const canvasStream = elements.canvas.captureStream(fps);
  const audioDestination = scheduleExportAudio(durationMs);
  const stream = audioDestination
    ? new MediaStream([...canvasStream.getVideoTracks(), ...audioDestination.stream.getAudioTracks()])
    : canvasStream;
  const mimeType = getRecorderMimeType();
  const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
  const chunks = [];
  const startedAt = performance.now();

  elements.exportButton.disabled = true;
  elements.downloadLink.classList.add("hidden");
  elements.exportStatus.textContent = "Recording YouTube trailer... keep this page open.";

  recorder.addEventListener("dataavailable", (event) => {
    if (event.data.size > 0) {
      chunks.push(event.data);
    }
  });

  recorder.addEventListener("stop", () => {
    const blob = new Blob(chunks, { type: mimeType || "video/webm" });
    const videoUrl = URL.createObjectURL(blob);
    elements.downloadLink.href = videoUrl;
    elements.downloadLink.classList.remove("hidden");
    elements.exportButton.disabled = false;
    elements.exportStatus.textContent = "YouTube video ready. Upload the WebM file to YouTube.";
    elements.downloadLink.click();
  });

  function drawLoop(now) {
    const elapsed = Math.min(now - startedAt, durationMs);
    renderExportFrame(elapsed);
    elements.exportStatus.textContent = `Recording YouTube trailer... ${Math.round((elapsed / durationMs) * 100)}%`;

    if (elapsed < durationMs && recorder.state === "recording") {
      requestAnimationFrame(drawLoop);
    } else if (recorder.state === "recording") {
      recorder.stop();
    }
  }

  recorder.start();
  requestAnimationFrame(drawLoop);
}

elements.exportButton?.addEventListener("click", exportYouTubeTrailer);

setScene(0);
renderExportFrame(0);
