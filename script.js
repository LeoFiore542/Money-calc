const STORAGE_KEY = "money-calc-settings";

const hourlyRateInput = document.getElementById("hourlyRate");
const shiftHoursInput = document.getElementById("shiftHours");
const targetAmountInput = document.getElementById("targetAmount");
const saveSettingsBtn = document.getElementById("saveSettingsBtn");
const calculateBtn = document.getElementById("calculateBtn");
const settingsStatus = document.getElementById("settingsStatus");
const resultBox = document.getElementById("result");

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

function calculate() {
  const settings = readSettings();
  if (!settings) {
    resultBox.innerHTML = "<p>Salva prima le impostazioni di salario e turno.</p>";
    return;
  }

  const targetAmount = Number(targetAmountInput.value);
  if (targetAmount <= 0) {
    resultBox.innerHTML = "<p>Inserisci un importo valido maggiore di 0.</p>";
    return;
  }

  const hoursNeeded = targetAmount / settings.hourlyRate;
  const shiftsNeeded = hoursNeeded / settings.shiftHours;
  const fullShifts = Math.floor(shiftsNeeded);
  const remainingHours = hoursNeeded - fullShifts * settings.shiftHours;

  resultBox.innerHTML = `
    <p><strong>${formatNumber(targetAmount)} €</strong> richiedono:</p>
    <p>- <strong>${formatNumber(hoursNeeded)}</strong> ore di lavoro</p>
    <p>- <strong>${formatNumber(shiftsNeeded)}</strong> turni (da ${settings.shiftHours} ore)</p>
    <p class="small">
      Equivalente pratico: ${fullShifts} turni completi + ${formatNumber(remainingHours)} ore.
    </p>
  `;
}

saveSettingsBtn.addEventListener("click", saveSettings);
calculateBtn.addEventListener("click", calculate);
loadSettingsIntoInputs();
