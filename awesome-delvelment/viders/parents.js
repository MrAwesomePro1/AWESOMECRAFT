const storageKey = "viders.state";

const defaultParentControls = {
  enabled: false,
  childMode: false,
  pinHash: "",
  blockedCategories: [],
  blockedTerms: ["violence", "gore", "hate", "drug", "gambling", "explicit"],
  dailyLimitMinutes: 45,
  bedtimeStart: "21:00",
  bedtimeEnd: "06:00",
  enforceBedtime: true,
  lockStudio: true,
  lockAccount: true,
  blockAds: true,
  allowCreatorUploads: false,
  childAccounts: [],
  childAccount: null
};

const elements = {
  parentHeroStatus: document.querySelector("#parentHeroStatus"),
  parentHeroBlocked: document.querySelector("#parentHeroBlocked"),
  parentHeroLimit: document.querySelector("#parentHeroLimit"),
  parentControlsSummary: document.querySelector("#parentControlsSummary"),
  parentSecurityTitle: document.querySelector("#parentSecurityTitle"),
  parentSecurityBadge: document.querySelector("#parentSecurityBadge"),
  parentWatchTime: document.querySelector("#parentWatchTime"),
  parentBlockedCount: document.querySelector("#parentBlockedCount"),
  parentBedtimeStatus: document.querySelector("#parentBedtimeStatus"),
  parentPinForm: document.querySelector("#parentPinForm"),
  parentPinInput: document.querySelector("#parentPinInput"),
  parentPinLabel: document.querySelector("#parentPinLabel"),
  parentPinButton: document.querySelector("#parentPinButton"),
  parentLockButton: document.querySelector("#parentLockButton"),
  clearParentControlsButton: document.querySelector("#clearParentControlsButton"),
  parentPinMessage: document.querySelector("#parentPinMessage"),
  childAccountTitle: document.querySelector("#childAccountTitle"),
  childAccountBadge: document.querySelector("#childAccountBadge"),
  childAccountCopy: document.querySelector("#childAccountCopy"),
  childAccountForm: document.querySelector("#childAccountForm"),
  childAccountNameInput: document.querySelector("#childAccountNameInput"),
  childAccountEmailInput: document.querySelector("#childAccountEmailInput"),
  connectCurrentAccountButton: document.querySelector("#connectCurrentAccountButton"),
  removeChildAccountButton: document.querySelector("#removeChildAccountButton"),
  childAccountList: document.querySelector("#childAccountList"),
  parentControlStack: document.querySelector("#parentControlStack"),
  parentChildModeToggle: document.querySelector("#parentChildModeToggle"),
  parentLockStudioToggle: document.querySelector("#parentLockStudioToggle"),
  parentLockAccountToggle: document.querySelector("#parentLockAccountToggle"),
  parentBlockAdsToggle: document.querySelector("#parentBlockAdsToggle"),
  parentCreatorUploadToggle: document.querySelector("#parentCreatorUploadToggle"),
  parentCategoryToggles: [...document.querySelectorAll("[data-parent-category]")],
  parentTermsForm: document.querySelector("#parentTermsForm"),
  parentBlockedTermInput: document.querySelector("#parentBlockedTermInput"),
  parentBlockedTermsList: document.querySelector("#parentBlockedTermsList"),
  parentDailyLimitInput: document.querySelector("#parentDailyLimitInput"),
  parentBedtimeStartInput: document.querySelector("#parentBedtimeStartInput"),
  parentBedtimeEndInput: document.querySelector("#parentBedtimeEndInput"),
  parentBedtimeToggle: document.querySelector("#parentBedtimeToggle"),
  resetChildUsageButton: document.querySelector("#resetChildUsageButton"),
  parentActivityList: document.querySelector("#parentActivityList"),
  toast: document.querySelector("#toast")
};

const parentRuntime = {
  unlocked: false
};

let state = loadState();

function getTodayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function clampNumber(value, min, max, fallback) {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, numberValue));
}

function normalizeTimeValue(value, fallback = "00:00") {
  const text = String(value || "").trim();
  return /^\d{2}:\d{2}$/.test(text) ? text : fallback;
}

function normalizeChildAccount(account) {
  if (!account || typeof account !== "object") {
    return null;
  }

  const name = String(account.name || "").trim().slice(0, 40);
  const email = String(account.email || "").trim().toLowerCase().slice(0, 80);
  const savedId = String(account.id || "").trim().slice(0, 80);

  if (!name && !email) {
    return null;
  }

  const accountKey = (email || name || "child")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);

  return {
    id: savedId || `child-${accountKey || Date.now()}`,
    name: name || "Connected child",
    email,
    connectedAt: typeof account.connectedAt === "string" ? account.connectedAt : new Date().toISOString()
  };
}

function getChildAccountSignature(account) {
  return account.email || account.name.toLowerCase() || account.id;
}

function normalizeChildAccounts(savedControls = {}) {
  const savedAccounts = Array.isArray(savedControls.childAccounts) ? savedControls.childAccounts : [];
  const legacyAccount = savedControls.childAccount ? [savedControls.childAccount] : [];
  const accounts = [...legacyAccount, ...savedAccounts].map(normalizeChildAccount).filter(Boolean);
  const seen = new Set();

  return accounts.filter((account) => {
    const signature = getChildAccountSignature(account);
    if (seen.has(signature)) {
      return false;
    }

    seen.add(signature);
    return true;
  });
}

function normalizeParentControls(savedControls = {}) {
  const blockedCategories = Array.isArray(savedControls.blockedCategories)
    ? savedControls.blockedCategories.filter(Boolean)
    : defaultParentControls.blockedCategories;
  const blockedTerms = Array.isArray(savedControls.blockedTerms)
    ? savedControls.blockedTerms.map((term) => String(term).trim().toLowerCase()).filter(Boolean)
    : defaultParentControls.blockedTerms;

  const childAccounts = normalizeChildAccounts(savedControls);

  return {
    ...defaultParentControls,
    ...savedControls,
    blockedCategories: [...new Set(blockedCategories)],
    blockedTerms: [...new Set(blockedTerms)].slice(0, 24),
    dailyLimitMinutes: clampNumber(savedControls.dailyLimitMinutes, 0, 480, defaultParentControls.dailyLimitMinutes),
    bedtimeStart: normalizeTimeValue(savedControls.bedtimeStart, defaultParentControls.bedtimeStart),
    bedtimeEnd: normalizeTimeValue(savedControls.bedtimeEnd, defaultParentControls.bedtimeEnd),
    enabled: Boolean(savedControls.enabled),
    childMode: Boolean(savedControls.childMode),
    enforceBedtime: savedControls.enforceBedtime !== false,
    lockStudio: savedControls.lockStudio !== false,
    lockAccount: savedControls.lockAccount !== false,
    blockAds: savedControls.blockAds !== false,
    allowCreatorUploads: Boolean(savedControls.allowCreatorUploads),
    childAccounts,
    childAccount: childAccounts[0] || null,
    pinHash: typeof savedControls.pinHash === "string" ? savedControls.pinHash : ""
  };
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "null") || {};

    return {
      ...saved,
      parentControls: normalizeParentControls(saved.parentControls),
      childUsage:
        saved.childUsage && typeof saved.childUsage === "object"
          ? {
              dateKey: typeof saved.childUsage.dateKey === "string" ? saved.childUsage.dateKey : getTodayKey(),
              seconds: clampNumber(saved.childUsage.seconds, 0, 86400, 0)
            }
          : { dateKey: getTodayKey(), seconds: 0 },
      parentActivity: Array.isArray(saved.parentActivity) ? saved.parentActivity.slice(0, 16) : []
    };
  } catch {
    return {
      parentControls: normalizeParentControls(),
      childUsage: { dateKey: getTodayKey(), seconds: 0 },
      parentActivity: []
    };
  }
}

function saveState() {
  let latestState = {};

  try {
    latestState = JSON.parse(localStorage.getItem(storageKey) || "null") || {};
  } catch {
    latestState = {};
  }

  localStorage.setItem(
    storageKey,
    JSON.stringify({
      ...latestState,
      parentControls: state.parentControls,
      childUsage: state.childUsage,
      parentActivity: state.parentActivity
    })
  );
}

function getParentControls() {
  state.parentControls = normalizeParentControls(state.parentControls);
  return state.parentControls;
}

function hasParentPin() {
  return Boolean(getParentControls().pinHash);
}

function canManageParentControls() {
  return hasParentPin() && parentRuntime.unlocked;
}

function isChildModeActive() {
  const controls = getParentControls();
  return Boolean(controls.enabled && controls.childMode && controls.pinHash);
}

function normalizePin(pin) {
  return String(pin || "").replace(/\D/g, "").slice(0, 8);
}

function fallbackPinDigest(pin) {
  let hash = 2166136261;
  const source = `${pin}:viders-parent-controls`;

  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }

  return `pin-v1-${(hash >>> 0).toString(36)}`;
}

async function getPinDigest(pin) {
  const normalizedPin = normalizePin(pin);
  const source = `${normalizedPin}:viders-parent-controls`;

  if (window.crypto?.subtle && window.TextEncoder) {
    const digest = await window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(source));
    const bytes = [...new Uint8Array(digest)];
    return `sha256-${bytes.map((byte) => byte.toString(16).padStart(2, "0")).join("")}`;
  }

  return fallbackPinDigest(normalizedPin);
}

async function verifyParentPin(pin) {
  const normalizedPin = normalizePin(pin);
  const savedHash = getParentControls().pinHash;

  if (!normalizedPin || !savedHash) {
    return false;
  }

  if (savedHash.startsWith("sha256-")) {
    return (await getPinDigest(normalizedPin)) === savedHash;
  }

  if (savedHash.startsWith("pin-v1-")) {
    return fallbackPinDigest(normalizedPin) === savedHash;
  }

  return normalizedPin === savedHash;
}

function ensureChildUsageForToday() {
  const todayKey = getTodayKey();

  if (!state.childUsage || state.childUsage.dateKey !== todayKey) {
    state.childUsage = {
      dateKey: todayKey,
      seconds: 0
    };
  }

  return state.childUsage;
}

function formatWatchTime(totalSeconds) {
  const safeSeconds = Math.max(0, Math.round(totalSeconds || 0));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}

function formatSavedDate(value) {
  const timestamp = Date.parse(value || "");
  return Number.isFinite(timestamp) ? new Date(timestamp).toLocaleDateString("en-US") : "today";
}

function sanitizeBlockedTerm(term) {
  return String(term || "")
    .trim()
    .toLowerCase()
    .replace(/[<>]/g, "")
    .slice(0, 32);
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getBlockedItemCount() {
  const controls = getParentControls();
  return controls.blockedCategories.length + controls.blockedTerms.length;
}

function getCurrentVidersAccount() {
  const user = state.user && typeof state.user === "object" ? state.user : null;
  if (!user) {
    return null;
  }

  return normalizeChildAccount({
    id: user.email ? `child-${String(user.email).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")}` : "",
    name: user.name,
    email: user.email,
    connectedAt: new Date().toISOString()
  });
}

function canEditChildAccount() {
  return !hasParentPin() || canManageParentControls();
}

function ensureCanEditChildAccount() {
  if (canEditChildAccount()) {
    return true;
  }

  elements.parentPinMessage.textContent = "Enter the parent PIN before changing the connected child.";
  showToast(elements.parentPinMessage.textContent);
  return false;
}

function connectChildAccount(account, activityMessage = "Child account connected.") {
  if (!ensureCanEditChildAccount()) {
    render();
    return;
  }

  const childAccount = normalizeChildAccount(account);
  if (!childAccount) {
    elements.parentPinMessage.textContent = "Add a child display name or email first.";
    showToast(elements.parentPinMessage.textContent);
    return;
  }

  const controls = getParentControls();
  const childAccounts = controls.childAccounts || [];
  const signature = getChildAccountSignature(childAccount);
  const alreadyConnected = childAccounts.some((savedAccount) => getChildAccountSignature(savedAccount) === signature);

  if (alreadyConnected) {
    elements.parentPinMessage.textContent = `${childAccount.name} is already connected.`;
    showToast(elements.parentPinMessage.textContent);
    return;
  }

  state.parentControls = normalizeParentControls({
    ...controls,
    childAccounts: [childAccount, ...childAccounts],
    childAccount
  });
  recordParentActivity(activityMessage.replace("Child account", `${childAccount.name}`));
  elements.childAccountForm?.reset();
  saveState();
  render();
  showToast(`Connected ${childAccount.name}.`);
}

function recordParentActivity(message) {
  state.parentActivity = [
    {
      id: `activity-${Date.now()}`,
      message,
      time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    },
    ...(Array.isArray(state.parentActivity) ? state.parentActivity : [])
  ].slice(0, 8);
}

function showToast(message) {
  if (!elements.toast) {
    return;
  }

  elements.toast.textContent = message;
  elements.toast.classList.remove("hidden");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    elements.toast.classList.add("hidden");
  }, 2400);
}

function ensureCanManageParentControls() {
  if (canManageParentControls()) {
    return true;
  }

  elements.parentPinMessage.textContent = hasParentPin()
    ? "Enter the parent PIN first."
    : "Create a parent PIN first.";
  showToast(elements.parentPinMessage.textContent);
  return false;
}

function updateParentControls(patch, activityMessage) {
  if (!ensureCanManageParentControls()) {
    render();
    return;
  }

  state.parentControls = normalizeParentControls({
    ...getParentControls(),
    ...patch
  });

  if (activityMessage) {
    recordParentActivity(activityMessage);
  }

  saveState();
  render();
}

function render() {
  const controls = getParentControls();
  const usage = ensureChildUsageForToday();
  const pinReady = hasParentPin();
  const unlocked = canManageParentControls();
  const childModeActive = isChildModeActive();
  const blockedCount = getBlockedItemCount();
  const controlsDisabled = !unlocked;
  const childAccounts = controls.childAccounts || [];
  const childAccount = childAccounts[0] || null;
  const currentVidersAccount = getCurrentVidersAccount();
  const childAccountDisabled = !canEditChildAccount();
  const limitLabel = controls.dailyLimitMinutes > 0 ? `${controls.dailyLimitMinutes}m` : "None";

  elements.parentHeroStatus.textContent = childModeActive ? "Protected" : pinReady ? "PIN ready" : "Open";
  elements.parentHeroBlocked.textContent = blockedCount;
  elements.parentHeroLimit.textContent = limitLabel;
  elements.parentControlsSummary.textContent = childModeActive
    ? `${limitLabel} daily limit, ${blockedCount} blocked items, account lock ${controls.lockAccount ? "on" : "off"}.`
    : pinReady
      ? "Parent PIN is ready. Unlock this page to change the settings."
      : "Create a parent PIN to manage child mode settings.";

  elements.parentSecurityTitle.textContent = childModeActive ? "Child mode ready" : pinReady ? "Ready" : "Not set up";
  elements.parentSecurityBadge.textContent = childModeActive ? "Protected" : pinReady ? "PIN ready" : "Open";
  elements.parentSecurityBadge.classList.toggle("is-protected", childModeActive);
  elements.parentWatchTime.textContent = formatWatchTime(usage.seconds);
  elements.parentBlockedCount.textContent = blockedCount;
  elements.parentBedtimeStatus.textContent = controls.enforceBedtime
    ? `${controls.bedtimeStart}-${controls.bedtimeEnd}`
    : "Off";

  elements.parentPinLabel.textContent = pinReady
    ? unlocked
      ? "Change parent PIN"
      : "Enter parent PIN"
    : "Create parent PIN";
  elements.parentPinButton.textContent = pinReady ? (unlocked ? "Change PIN" : "Unlock") : "Save PIN";
  elements.parentLockButton.classList.toggle("hidden", !unlocked);
  elements.parentControlStack.classList.toggle("is-locked", controlsDisabled);

  elements.childAccountTitle.textContent = childAccounts.length
    ? `${childAccounts.length} child account${childAccounts.length === 1 ? "" : "s"} connected`
    : "No child accounts connected";
  elements.childAccountBadge.textContent = childAccounts.length ? `${childAccounts.length} connected` : "Not connected";
  elements.childAccountBadge.classList.toggle("is-protected", Boolean(childAccounts.length));
  elements.childAccountCopy.textContent = childAccounts.length
    ? `Latest child: ${childAccount.name} - ${childAccount.email || "no email saved"}. Add another child below.`
    : currentVidersAccount
      ? `Current Viders account on this device: ${currentVidersAccount.name}. You can connect it below.`
      : "Connect your children's Viders display names and emails, or sign in on Viders first and use the current account shortcut.";
  elements.childAccountNameInput.value = "";
  elements.childAccountEmailInput.value = "";
  elements.childAccountNameInput.disabled = childAccountDisabled;
  elements.childAccountEmailInput.disabled = childAccountDisabled;
  elements.connectCurrentAccountButton.disabled = childAccountDisabled || !currentVidersAccount;
  elements.removeChildAccountButton.disabled = childAccountDisabled || !childAccounts.length;
  elements.childAccountList.innerHTML = childAccounts.length
    ? childAccounts
        .map(
          (account) => `
            <article class="child-account-row">
              <div>
                <strong>${escapeHtml(account.name)}</strong>
                <span>${escapeHtml(account.email || "No email saved")} - connected ${formatSavedDate(account.connectedAt)}</span>
              </div>
              <button class="ghost-button small-button" type="button" data-remove-child-id="${escapeHtml(account.id)}" ${childAccountDisabled ? "disabled" : ""}>
                Remove
              </button>
            </article>
          `
        )
        .join("")
    : '<article class="child-account-row empty-child-account"><span>No child accounts connected yet.</span></article>';

  [
    elements.parentChildModeToggle,
    elements.parentLockStudioToggle,
    elements.parentLockAccountToggle,
    elements.parentBlockAdsToggle,
    elements.parentCreatorUploadToggle,
    elements.parentBlockedTermInput,
    elements.parentDailyLimitInput,
    elements.parentBedtimeStartInput,
    elements.parentBedtimeEndInput,
    elements.parentBedtimeToggle,
    elements.resetChildUsageButton
  ].forEach((control) => {
    if (control) {
      control.disabled = controlsDisabled;
    }
  });

  elements.parentCategoryToggles.forEach((checkbox) => {
    checkbox.disabled = controlsDisabled;
    checkbox.checked = controls.blockedCategories.includes(checkbox.dataset.parentCategory);
  });

  elements.parentChildModeToggle.checked = controls.childMode;
  elements.parentLockStudioToggle.checked = controls.lockStudio;
  elements.parentLockAccountToggle.checked = controls.lockAccount;
  elements.parentBlockAdsToggle.checked = controls.blockAds;
  elements.parentCreatorUploadToggle.checked = controls.allowCreatorUploads;
  elements.parentDailyLimitInput.value = controls.dailyLimitMinutes;
  elements.parentBedtimeStartInput.value = controls.bedtimeStart;
  elements.parentBedtimeEndInput.value = controls.bedtimeEnd;
  elements.parentBedtimeToggle.checked = controls.enforceBedtime;

  elements.parentBlockedTermsList.innerHTML = controls.blockedTerms.length
    ? controls.blockedTerms
        .map(
          (term) => `
            <button class="blocked-term-chip" type="button" data-remove-term="${escapeHtml(term)}" ${controlsDisabled ? "disabled" : ""}>
              ${escapeHtml(term)}
            </button>
          `
        )
        .join("")
    : '<span class="empty-inline">No blocked words</span>';

  elements.parentActivityList.innerHTML = state.parentActivity.length
    ? state.parentActivity
        .map(
          (activity) => `
            <article class="parent-activity-item">
              <strong>${escapeHtml(activity.message)}</strong>
              <span>${escapeHtml(activity.time)}</span>
            </article>
          `
        )
        .join("")
    : '<article class="parent-activity-item"><strong>No security events yet</strong><span>Ready</span></article>';
}

elements.parentPinForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const pin = normalizePin(elements.parentPinInput.value);

  if (pin.length < 4) {
    elements.parentPinMessage.textContent = "Use a 4-8 digit parent PIN.";
    elements.parentPinInput.value = "";
    return;
  }

  if (!hasParentPin()) {
    state.parentControls = normalizeParentControls({
      ...getParentControls(),
      pinHash: await getPinDigest(pin),
      enabled: true,
      childMode: true
    });
    parentRuntime.unlocked = true;
    elements.parentPinMessage.textContent = "Parent controls are on.";
    recordParentActivity("Parent PIN created and child mode turned on.");
  } else if (!canManageParentControls()) {
    const isValidPin = await verifyParentPin(pin);
    if (!isValidPin) {
      elements.parentPinMessage.textContent = "That PIN did not match.";
      elements.parentPinInput.value = "";
      recordParentActivity("Incorrect parent PIN attempt.");
      saveState();
      render();
      return;
    }

    parentRuntime.unlocked = true;
    elements.parentPinMessage.textContent = "Parent controls unlocked.";
    recordParentActivity("Parent controls unlocked.");
  } else {
    state.parentControls = normalizeParentControls({
      ...getParentControls(),
      pinHash: await getPinDigest(pin)
    });
    elements.parentPinMessage.textContent = "Parent PIN changed.";
    recordParentActivity("Parent PIN changed.");
  }

  elements.parentPinInput.value = "";
  saveState();
  render();
  showToast(elements.parentPinMessage.textContent);
});

elements.parentLockButton?.addEventListener("click", () => {
  parentRuntime.unlocked = false;
  elements.parentPinMessage.textContent = "Parent controls locked.";
  render();
  showToast("Parent controls locked.");
});

elements.childAccountForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  connectChildAccount({
    name: formData.get("childName"),
    email: formData.get("childEmail"),
    connectedAt: new Date().toISOString()
  });
});

elements.connectCurrentAccountButton?.addEventListener("click", () => {
  const currentVidersAccount = getCurrentVidersAccount();
  if (!currentVidersAccount) {
    showToast("Sign in on Viders first, then come back to connect that account.");
    return;
  }

  connectChildAccount(currentVidersAccount, "Current Viders account connected as child account.");
});

elements.childAccountList?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove-child-id]");
  if (!button) {
    return;
  }

  if (!ensureCanEditChildAccount()) {
    render();
    return;
  }

  const childId = button.dataset.removeChildId;
  const controls = getParentControls();
  const childAccounts = (controls.childAccounts || []).filter((account) => account.id !== childId);
  state.parentControls = normalizeParentControls({
    ...controls,
    childAccounts,
    childAccount: childAccounts[0] || null
  });
  recordParentActivity("Child account removed.");
  saveState();
  render();
  showToast("Child account removed.");
});

elements.removeChildAccountButton?.addEventListener("click", () => {
  if (!ensureCanEditChildAccount()) {
    render();
    return;
  }

  state.parentControls = normalizeParentControls({
    ...getParentControls(),
    childAccounts: [],
    childAccount: null
  });
  recordParentActivity("All child accounts removed.");
  saveState();
  render();
  showToast("All child accounts removed.");
});

elements.clearParentControlsButton?.addEventListener("click", () => {
  if (hasParentPin() && !canManageParentControls()) {
    elements.parentPinMessage.textContent = "Enter the parent PIN before clearing controls.";
    showToast(elements.parentPinMessage.textContent);
    return;
  }

  state.parentControls = normalizeParentControls();
  state.childUsage = { dateKey: getTodayKey(), seconds: 0 };
  state.parentActivity = [];
  parentRuntime.unlocked = false;
  saveState();
  render();
  showToast("Parent controls cleared.");
});

elements.parentChildModeToggle?.addEventListener("change", (event) => {
  const childMode = event.target.checked;
  updateParentControls(
    {
      enabled: childMode,
      childMode
    },
    childMode ? "Child mode turned on." : "Child mode turned off."
  );
});

elements.parentLockStudioToggle?.addEventListener("change", (event) => {
  updateParentControls(
    { lockStudio: event.target.checked },
    event.target.checked ? "Studio lock turned on." : "Studio lock turned off."
  );
});

elements.parentLockAccountToggle?.addEventListener("change", (event) => {
  updateParentControls(
    { lockAccount: event.target.checked },
    event.target.checked ? "Account lock turned on." : "Account lock turned off."
  );
});

elements.parentBlockAdsToggle?.addEventListener("change", (event) => {
  updateParentControls(
    { blockAds: event.target.checked },
    event.target.checked ? "Child ads blocked." : "Child ads allowed."
  );
});

elements.parentCreatorUploadToggle?.addEventListener("change", (event) => {
  updateParentControls(
    { allowCreatorUploads: event.target.checked },
    event.target.checked ? "Creator uploads allowed in child mode." : "Creator uploads hidden in child mode."
  );
});

elements.parentCategoryToggles.forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    if (!ensureCanManageParentControls()) {
      render();
      return;
    }

    const blockedCategories = new Set(getParentControls().blockedCategories);
    if (checkbox.checked) {
      blockedCategories.add(checkbox.dataset.parentCategory);
    } else {
      blockedCategories.delete(checkbox.dataset.parentCategory);
    }

    updateParentControls(
      { blockedCategories: [...blockedCategories] },
      `${checkbox.dataset.parentCategory} category ${checkbox.checked ? "blocked" : "allowed"}.`
    );
  });
});

elements.parentTermsForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!ensureCanManageParentControls()) {
    render();
    return;
  }

  const term = sanitizeBlockedTerm(elements.parentBlockedTermInput.value);
  if (!term) {
    return;
  }

  const blockedTerms = [...new Set([...getParentControls().blockedTerms, term])].slice(0, 24);
  elements.parentBlockedTermInput.value = "";
  updateParentControls({ blockedTerms }, `"${term}" added to blocked words.`);
});

elements.parentBlockedTermsList?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove-term]");
  if (!button) {
    return;
  }

  if (!ensureCanManageParentControls()) {
    render();
    return;
  }

  const term = button.dataset.removeTerm;
  const blockedTerms = getParentControls().blockedTerms.filter((item) => item !== term);
  updateParentControls({ blockedTerms }, `"${term}" removed from blocked words.`);
});

elements.parentDailyLimitInput?.addEventListener("change", (event) => {
  updateParentControls(
    { dailyLimitMinutes: clampNumber(event.target.value, 0, 480, defaultParentControls.dailyLimitMinutes) },
    "Daily watch limit changed."
  );
});

elements.parentBedtimeStartInput?.addEventListener("change", (event) => {
  updateParentControls({ bedtimeStart: normalizeTimeValue(event.target.value, "21:00") }, "Bedtime start changed.");
});

elements.parentBedtimeEndInput?.addEventListener("change", (event) => {
  updateParentControls({ bedtimeEnd: normalizeTimeValue(event.target.value, "06:00") }, "Bedtime end changed.");
});

elements.parentBedtimeToggle?.addEventListener("change", (event) => {
  updateParentControls(
    { enforceBedtime: event.target.checked },
    event.target.checked ? "Bedtime lock turned on." : "Bedtime lock turned off."
  );
});

elements.resetChildUsageButton?.addEventListener("click", () => {
  if (!ensureCanManageParentControls()) {
    render();
    return;
  }

  state.childUsage = {
    dateKey: getTodayKey(),
    seconds: 0
  };
  recordParentActivity("Watch time reset.");
  saveState();
  render();
  showToast("Child watch time reset.");
});

render();
