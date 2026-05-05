const STORAGE_KEY = "money-calc-settings";
const APP_VERSION = "v1.0.5";
const INTRO_DURATION_MS = 1100;

const introSplash = document.getElementById("introSplash");
const settingsModal = document.getElementById("settingsModal");
const settingsToggleBtn = document.getElementById("settingsToggleBtn");
const closeSettingsBtn = document.getElementById("closeSettingsBtn");
const versionIndicator = document.getElementById("versionIndicator");
const hourlyRateInput = document.getElementById("hourlyRate");
const shiftHoursInput = document.getElementById("shiftHours");
const inputSection = document.getElementById("inputSection");
const animationSection = document.getElementById("animationSection");
const targetAmountInput = document.getElementById("targetAmount");
const saveSettingsBtn = document.getElementById("saveSettingsBtn");
const calculateBtn = document.getElementById("calculateBtn");
const resetBtn = document.getElementById("resetBtn");
const settingsStatus = document.getElementById("settingsStatus");
const hoursValue = document.getElementById("hoursValue");
const shiftsResult = document.getElementById("shiftsResult");
const shiftsValue = document.getElementById("shiftsValue");

let activeAnimationFrame = null;

function playIntroSplash() {
  if (!introSplash) {
    return;
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) {
    introSplash.classList.add("hide");
    window.setTimeout(() => {
      introSplash.remove();
    }, 430);
    return;
  }

  window.setTimeout(() => {
    introSplash.classList.add("hide");
    window.setTimeout(() => {
      introSplash.remove();
    }, 430);
  }, INTRO_DURATION_MS);
}

function triggerHaptic(strength = 12) {
  if (typeof navigator.vibrate === "function") {
    navigator.vibrate(strength);
  }
}

function addButtonFeedback(button) {
  button.addEventListener("click", () => {
    triggerHaptic(10);
    button.classList.remove("btn-pop");
    void button.offsetWidth;
    button.classList.add("btn-pop");
  });
}

function animateViewIn(element) {
  element.classList.remove("view-enter");
  void element.offsetWidth;
  element.classList.add("view-enter");
}

function formatNumber(value) {
  return new Intl.NumberFormat("it-IT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function readSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    if (
      typeof parsed.hourlyRate !== "number" ||
      typeof parsed.shiftHours !== "number"
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function saveSettings() {
  const hourlyRate = Number(hourlyRateInput.value);
  const shiftHours = Number(shiftHoursInput.value);

  if (hourlyRate <= 0 || shiftHours <= 0) {
    settingsStatus.textContent = "Inserisci valori validi maggiori di 0.";
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify({ hourlyRate, shiftHours }));
  settingsStatus.textContent = "Impostazioni salvate.";
  closeSettingsModal();
}

function loadSettingsIntoInputs() {
  const settings = readSettings();
  if (!settings) {
    settingsStatus.textContent = "Nessuna impostazione salvata. Inserisci i valori.";
    return;
  }
  hourlyRateInput.value = settings.hourlyRate;
  shiftHoursInput.value = settings.shiftHours;
  settingsStatus.textContent = "Impostazioni caricate automaticamente.";
}

function openSettingsModal() {
  settingsModal.classList.remove("hidden");
  animateViewIn(settingsModal.querySelector(".modal-card"));
}

function closeSettingsModal() {
  settingsModal.classList.add("hidden");
}

function animateHours(targetHours, onDone) {
  if (activeAnimationFrame) {
    cancelAnimationFrame(activeAnimationFrame);
    activeAnimationFrame = null;
  }

  const duration = 2000;
  const start = performance.now();

  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = targetHours * eased;

    hoursValue.textContent = formatNumber(current);

    if (progress < 1) {
      activeAnimationFrame = requestAnimationFrame(tick);
      return;
    }

    activeAnimationFrame = null;
    onDone();
  }

  activeAnimationFrame = requestAnimationFrame(tick);
}

function calculateAndAnimate() {
  const settings = readSettings();
  if (!settings) {
    settingsStatus.textContent = "Apri la rotellina e salva prima le impostazioni.";
    openSettingsModal();
    return;
  }

  const targetAmount = Number(targetAmountInput.value);
  if (targetAmount <= 0) {
    targetAmountInput.focus();
    return;
  }

  const hoursNeeded = targetAmount / settings.hourlyRate;
  const shiftsNeeded = hoursNeeded / settings.shiftHours;
  const roundedUpShifts = Math.ceil(shiftsNeeded);

  inputSection.classList.add("hidden");
  animationSection.classList.remove("hidden");
  animateViewIn(animationSection);
  shiftsResult.classList.remove("show");
  hoursValue.textContent = "0,00";
  shiftsValue.textContent = roundedUpShifts;

  animateHours(hoursNeeded, () => {
    shiftsResult.classList.add("show");
  });
}

function resetView() {
  if (activeAnimationFrame) {
    cancelAnimationFrame(activeAnimationFrame);
    activeAnimationFrame = null;
  }

  animationSection.classList.add("hidden");
  inputSection.classList.remove("hidden");
  animateViewIn(inputSection);
  shiftsResult.classList.remove("show");
  targetAmountInput.value = "";
  targetAmountInput.focus();
}

settingsToggleBtn.addEventListener("click", openSettingsModal);
closeSettingsBtn.addEventListener("click", closeSettingsModal);
settingsModal.addEventListener("click", (event) => {
  if (event.target === settingsModal) {
    closeSettingsModal();
  }
});
saveSettingsBtn.addEventListener("click", saveSettings);
calculateBtn.addEventListener("click", calculateAndAnimate);
resetBtn.addEventListener("click", resetView);
targetAmountInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    calculateAndAnimate();
  }
});

[
  settingsToggleBtn,
  closeSettingsBtn,
  saveSettingsBtn,
  calculateBtn,
  resetBtn,
].forEach(addButtonFeedback);

loadSettingsIntoInputs();
versionIndicator.textContent = APP_VERSION;
playIntroSplash();
