const backgroundImage = document.getElementById("background-image");
const questionIcon = document.getElementById("question-icon");
const eyebrow = document.getElementById("eyebrow");
const mainQuestion = document.getElementById("main-question");
const supportText = document.getElementById("support-text");
const yesButton = document.getElementById("yes-button");
const noButton = document.getElementById("no-button");
const buttonStage = document.getElementById("button-stage");
const successModal = document.getElementById("success-modal");
const successTitle = document.getElementById("success-title");
const successMessage = document.getElementById("success-message");
const closeModal = document.getElementById("close-modal");
const musicToggle = document.getElementById("music-toggle");
const backgroundMusic = document.getElementById("background-music");

const state = {
  pointerX: 0,
  pointerY: 0,
  targetX: 0,
  targetY: 0,
  currentX: 0,
  currentY: 0,
  initialized: false,
  musicPlaying: false,
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

function applyConfig() {
  document.title = APP_CONFIG.pageTitle;
  document.documentElement.style.setProperty("--overlay-opacity", APP_CONFIG.overlayOpacity);
  document.documentElement.style.setProperty("--card-blur", `${APP_CONFIG.cardBlur}px`);
  document.documentElement.style.setProperty("--card-roundness", `${APP_CONFIG.cardRoundness}px`);

  eyebrow.textContent = APP_CONFIG.eyebrow;
  mainQuestion.textContent = APP_CONFIG.question;
  supportText.textContent = APP_CONFIG.supportText;
  yesButton.textContent = APP_CONFIG.yesText;
  noButton.textContent = APP_CONFIG.noText;
  successTitle.textContent = APP_CONFIG.successTitle;
  successMessage.textContent = APP_CONFIG.successMessage;
  musicToggle.textContent = APP_CONFIG.musicButtonPlay;

  backgroundImage.src = APP_CONFIG.backgroundImage;
  questionIcon.src = APP_CONFIG.iconImage;
  backgroundMusic.src = APP_CONFIG.musicFile;

  backgroundImage.addEventListener("error", () => {
    backgroundImage.style.display = "none";
  });

  questionIcon.addEventListener("error", () => {
    questionIcon.style.display = "none";
  });

  backgroundMusic.addEventListener("error", () => {
    musicToggle.style.display = "none";
  });
}

function getStageMetrics() {
  const stageRect = buttonStage.getBoundingClientRect();
  const noRect = noButton.getBoundingClientRect();

  return {
    width: stageRect.width,
    height: stageRect.height,
    buttonWidth: noRect.width,
    buttonHeight: noRect.height,
    padding: APP_CONFIG.noButtonPadding,
  };
}

function setNoButtonPosition(x, y, immediate = false) {
  state.targetX = x;
  state.targetY = y;

  if (immediate || !state.initialized) {
    state.currentX = x;
    state.currentY = y;
    noButton.style.left = `${x}px`;
    noButton.style.top = `${y}px`;
  }
}

function placeButtons() {
  const { width, height, buttonWidth, buttonHeight, padding } = getStageMetrics();
  const baseY = clamp(height * 0.58, padding, height - buttonHeight - padding);
  const yesX = clamp(width * 0.24, padding, width - buttonWidth - padding);
  const noX = clamp(width * 0.66, padding, width - buttonWidth - padding);

  yesButton.style.left = `${yesX}px`;
  yesButton.style.top = `${baseY}px`;

  setNoButtonPosition(noX, baseY, true);
  state.initialized = true;
}

function moveNoRandom() {
  const { width, height, buttonWidth, buttonHeight, padding } = getStageMetrics();
  const yesRect = yesButton.getBoundingClientRect();
  const stageRect = buttonStage.getBoundingClientRect();
  const yesCenterX = yesRect.left - stageRect.left + yesRect.width / 2;
  const yesCenterY = yesRect.top - stageRect.top + yesRect.height / 2;

  for (let attempt = 0; attempt < 60; attempt += 1) {
    const x = randomInRange(padding, width - buttonWidth - padding);
    const y = randomInRange(padding, height - buttonHeight - padding);
    const centerX = x + buttonWidth / 2;
    const centerY = y + buttonHeight / 2;
    const distance = Math.hypot(centerX - yesCenterX, centerY - yesCenterY);

    if (distance > 150) {
      setNoButtonPosition(x, y);
      return;
    }
  }
}

function updatePointer(clientX, clientY) {
  const stageRect = buttonStage.getBoundingClientRect();
  state.pointerX = clientX - stageRect.left;
  state.pointerY = clientY - stageRect.top;
}

function reactToPointer() {
  const { width, height, buttonWidth, buttonHeight, padding } = getStageMetrics();
  const centerX = state.currentX + buttonWidth / 2;
  const centerY = state.currentY + buttonHeight / 2;
  const dx = centerX - state.pointerX;
  const dy = centerY - state.pointerY;
  const distance = Math.hypot(dx, dy);
  const dangerZone = APP_CONFIG.noButtonDangerZone;

  if (distance > dangerZone) {
    return;
  }

  const force = (dangerZone - distance) / dangerZone;
  const safeDx = dx || (Math.random() > 0.5 ? 1 : -1);
  const safeDy = dy || (Math.random() > 0.5 ? 1 : -1);
  const length = Math.hypot(safeDx, safeDy) || 1;
  const escapeDistance = 105 + force * 165;

  let nextX = state.currentX + (safeDx / length) * escapeDistance;
  let nextY = state.currentY + (safeDy / length) * escapeDistance;

  nextX = clamp(nextX, padding, width - buttonWidth - padding);
  nextY = clamp(nextY, padding, height - buttonHeight - padding);

  setNoButtonPosition(nextX, nextY);
}

function animateNoButton() {
  const easing = 0.14;
  state.currentX += (state.targetX - state.currentX) * easing;
  state.currentY += (state.targetY - state.currentY) * easing;
  noButton.style.left = `${state.currentX}px`;
  noButton.style.top = `${state.currentY}px`;
  requestAnimationFrame(animateNoButton);
}

function openModal() {
  successModal.classList.remove("hidden");
  successModal.setAttribute("aria-hidden", "false");
}

function closeModalFn() {
  successModal.classList.add("hidden");
  successModal.setAttribute("aria-hidden", "true");
}

async function toggleMusic() {
  if (!backgroundMusic.src) {
    return;
  }

  if (state.musicPlaying) {
    backgroundMusic.pause();
    musicToggle.textContent = APP_CONFIG.musicButtonPlay;
    state.musicPlaying = false;
    return;
  }

  try {
    await backgroundMusic.play();
    musicToggle.textContent = APP_CONFIG.musicButtonPause;
    state.musicPlaying = true;
  } catch (_error) {
    musicToggle.textContent = APP_CONFIG.musicButtonPlay;
  }
}

window.addEventListener("load", async () => {
  applyConfig();
  placeButtons();
  animateNoButton();

  if (APP_CONFIG.autoPlayMusic) {
    await toggleMusic();
  }
});

window.addEventListener("resize", placeButtons);

document.addEventListener("mousemove", (event) => {
  updatePointer(event.clientX, event.clientY);
  reactToPointer();
});

document.addEventListener(
  "touchstart",
  (event) => {
    const touch = event.touches[0];
    if (!touch) {
      return;
    }

    updatePointer(touch.clientX, touch.clientY);
    reactToPointer();
  },
  { passive: true }
);

document.addEventListener(
  "touchmove",
  (event) => {
    const touch = event.touches[0];
    if (!touch) {
      return;
    }

    updatePointer(touch.clientX, touch.clientY);
    reactToPointer();
  },
  { passive: true }
);

noButton.addEventListener("mouseenter", moveNoRandom);
noButton.addEventListener("click", moveNoRandom);
yesButton.addEventListener("click", openModal);
closeModal.addEventListener("click", closeModalFn);
musicToggle.addEventListener("click", toggleMusic);
successModal.addEventListener("click", (event) => {
  if (event.target === successModal) {
    closeModalFn();
  }
});
