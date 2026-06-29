const sampleSource = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";
const mediaDbName = "viders-media";
const mediaStoreName = "video-files";
const appRemovalRequestKey = "viders.removeRequestedAt";
const appRecoveryLoginKey = "viders.recoveryLoginRequestedAt";

const seededVideos = [
  {
    id: "skyline-sprint",
    title: "Skyline Sprint Build Montage",
    channel: "Viders",
    category: "Gaming",
    length: "12:41",
    views: 0,
    subscribers: 512000,
    uploadedAt: "2 days ago",
    description:
      "Fast city parkour, layered edits, and a clean creator breakdown make this one of the most replayed gaming clips on Viders.",
    src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    gradient: "linear-gradient(145deg, #243b73, #0f6da6 52%, #2bc4c9)",
    comments: [
      { author: "PixelDash", text: "The transitions are so clean. I would watch the full breakdown next." },
      { author: "NeonMaps", text: "This channel always makes movement edits feel huge." }
    ]
  },
  {
    id: "midnight-beats",
    title: "Midnight Beats Rooftop Session",
    channel: "Viders",
    category: "Music",
    length: "08:32",
    views: 0,
    subscribers: 341000,
    uploadedAt: "5 days ago",
    description:
      "A late-night rooftop performance with glowing city lights and a locked-in live mix for headphone listeners.",
    src: "https://www.w3schools.com/html/mov_bbb.mp4",
    gradient: "linear-gradient(145deg, #5b2245, #a93d64 54%, #ff9f4d)",
    comments: [
      { author: "Riven", text: "The bass drop at the halfway mark is absurdly good." },
      { author: "Theo", text: "This feels like a real featured music premiere." }
    ]
  },
  {
    id: "studio-tour",
    title: "Inside My Tiny Design Studio",
    channel: "Viders",
    category: "Design",
    length: "10:09",
    views: 0,
    subscribers: 218000,
    uploadedAt: "1 week ago",
    description:
      "Desk setup, lighting tips, sketch walls, and a fast walkthrough of the workflow behind a compact creative room.",
    src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    gradient: "linear-gradient(145deg, #135c53, #1f8a70 54%, #f2c94c)",
    comments: [
      { author: "Aster", text: "The lighting section alone is worth saving." },
      { author: "Lu", text: "This made me want to reorganize my whole room." }
    ]
  },
  {
    id: "smart-home-hacks",
    title: "Smart Home Tricks That Actually Help",
    channel: "Viders",
    category: "Tech",
    length: "14:25",
    views: 0,
    subscribers: 660000,
    uploadedAt: "3 days ago",
    description:
      "No gimmicks here. Just practical automations, cable-clean setups, and tech that improves a daily routine.",
    src: "https://www.w3schools.com/html/mov_bbb.mp4",
    gradient: "linear-gradient(145deg, #1b2449, #2f4cc7 54%, #43d2d1)",
    comments: [
      { author: "Dez", text: "The lighting automation was the first smart-home tip I actually copied." },
      { author: "Ivo", text: "This channel's view count makes sense. Every upload is useful." }
    ]
  },
  {
    id: "weekend-reset",
    title: "Weekend Reset Routine",
    channel: "Viders",
    category: "Lifestyle",
    length: "09:18",
    views: 0,
    subscribers: 193000,
    uploadedAt: "6 days ago",
    description:
      "A calm reset routine that moves through planning, meal prep, and a simple Sunday edit session.",
    src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    gradient: "linear-gradient(145deg, #5f3b17, #b36a2e 54%, #ffd370)",
    comments: [
      { author: "Mae", text: "This is exactly the kind of lifestyle video I leave on while planning my week." },
      { author: "Jules", text: "Love the balance between cozy and practical." }
    ]
  },
  {
    id: "math-energy",
    title: "Math Tricks With Real Energy",
    channel: "Viders",
    category: "Education",
    length: "11:56",
    views: 0,
    subscribers: 278000,
    uploadedAt: "4 days ago",
    description:
      "A high-energy lesson that turns quick pattern recognition into something visual, memorable, and fun.",
    src: "https://www.w3schools.com/html/mov_bbb.mp4",
    gradient: "linear-gradient(145deg, #16394f, #1b5f7b 54%, #ff8c42)",
    comments: [
      { author: "Milo", text: "Finally, a lesson video that feels alive." },
      { author: "Rae", text: "Would absolutely subscribe after one watch." }
    ]
  }
];

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

const seasonalThemeCatalog = {
  auto: {
    label: "Auto seasons",
    shortLabel: "Auto seasons",
    summary: "Viders will switch the background automatically through the year.",
    themeColor: "#ff8c42"
  },
  winter: {
    label: "Winter Frost",
    shortLabel: "Winter Frost",
    summary: "Cool blue winter lights and icy glass tones are active on Viders.",
    themeColor: "#86d8ff"
  },
  spring: {
    label: "Spring Bloom",
    shortLabel: "Spring Bloom",
    summary: "Fresh spring colors and soft bloom lights are active on Viders.",
    themeColor: "#ff8a70"
  },
  summer: {
    label: "Summer Glow",
    shortLabel: "Summer Glow",
    summary: "Warm sunset tones and bright summer glows are active on Viders.",
    themeColor: "#ffb347"
  },
  autumn: {
    label: "Autumn Ember",
    shortLabel: "Autumn Ember",
    summary: "Autumn ember colors and copper night lights are active on Viders.",
    themeColor: "#ff8c42"
  },
  holiday: {
    label: "Holiday Lights",
    shortLabel: "Holiday Lights",
    summary: "Holiday lights, evergreen glow, and cozy gold highlights are active on Viders.",
    themeColor: "#ff6d5e"
  },
  "halloween-saja": {
    label: "Halloween - Saja Night",
    shortLabel: "Halloween - Saja Night",
    summary: "Halloween mode is active with a Saja-style idol night backdrop, ember fog, and moonlit stage glow.",
    themeColor: "#ff7a33"
  }
};

const defaultState = {
  currentVideoId: seededVideos[0].id,
  selectedCategory: "All",
  searchQuery: "",
  activeChannel: "All",
  user: null,
  plan: "Viewer",
  seasonTheme: "auto",
  subscriptionsByUser: {},
  historyByUser: {},
  uploads: [],
  ads: [],
  viewBoosts: {},
  parentControls: { ...defaultParentControls },
  childUsage: {
    dateKey: "",
    seconds: 0
  },
  parentActivity: []
};

const planCatalog = {
  Viewer: {
    canUpload: false,
    canCreateAds: false,
    adFree: false
  },
  Viders: {
    canUpload: true,
    canCreateAds: false,
    adFree: false
  },
  Creator: {
    canUpload: true,
    canCreateAds: true,
    adFree: false
  },
  Pro: {
    canUpload: false,
    canCreateAds: false,
    adFree: true
  },
  Premium: {
    canUpload: true,
    canCreateAds: false,
    adFree: true
  },
  Ultimate: {
    canUpload: true,
    canCreateAds: true,
    adFree: true
  }
};

const promoCodeCatalog = {
  AWESOMEVIDERSFREE: {
    plan: "Viders",
    message: "Viders unlocked with your private Viders discount code."
  },
  AWESOMECREATORFREE: {
    plan: "Creator",
    message: "Creator unlocked with your private Viders discount code."
  },
  AWESOMEPROFREE: {
    plan: "Pro",
    message: "Pro unlocked with your private Viders discount code."
  },
  AWESOMEPREMIUMFREE: {
    plan: "Premium",
    message: "Premium unlocked with your private Viders discount code."
  },
  AWESOMEULTIMATEFREE: {
    plan: "Ultimate",
    message: "Ultimate unlocked with your private Viders discount code."
  }
};

const adLibrary = [
  {
    sponsor: "Viders Pro",
    copy: "Featured placement, creator analytics, and channel growth tools built right into your studio."
  },
  {
    sponsor: "Nova Mic",
    copy: "Capture cleaner voiceovers and sharper live sessions with studio-ready sound in one compact setup."
  },
  {
    sponsor: "FrameForge",
    copy: "Design thumbnails, social banners, and fast channel art packs without slowing down your workflow."
  }
];

const adConfig = {
  durationSeconds: 5,
  skipAfterSeconds: 3
};

const adSession = {
  videoId: null,
  active: false,
  finished: false,
  remainingSeconds: 0,
  totalSeconds: adConfig.durationSeconds,
  ad: adLibrary[0],
  timer: null
};

const deployConfig = {
  siteId: "awesomeviders",
  deleteToken: "dlt_4048b754013c183385afa2b709866e7773e50e1621ddddf1",
  manifestPath: "videos-manifest.json",
  uploadDir: "uploads",
  maxZipBytes: 10 * 1024 * 1024
};

const elements = {
  authButton: document.querySelector("#authButton"),
  installButton: document.querySelector("#installButton"),
  removeButton: document.querySelector("#removeButton"),
  vaultButton: document.querySelector("#vaultButton"),
  plansButton: document.querySelector("#plansButton"),
  planBadge: document.querySelector("#planBadge"),
  userStatus: document.querySelector("#userStatus"),
  themeColorMeta: document.querySelector("#themeColorMeta"),
  seasonThemeSelect: document.querySelector("#seasonThemeSelect"),
  seasonModeBadge: document.querySelector("#seasonModeBadge"),
  seasonModeSummary: document.querySelector("#seasonModeSummary"),
  heroPlanName: document.querySelector("#heroPlanName"),
  heroVideoCount: document.querySelector("#heroVideoCount"),
  heroChannelCount: document.querySelector("#heroChannelCount"),
  vaultSection: document.querySelector("#vaultSection"),
  vaultSummary: document.querySelector("#vaultSummary"),
  watchHistoryCount: document.querySelector("#watchHistoryCount"),
  watchHistoryList: document.querySelector("#watchHistoryList"),
  madeVideosCount: document.querySelector("#madeVideosCount"),
  madeVideosList: document.querySelector("#madeVideosList"),
  videoPlayer: document.querySelector("#videoPlayer"),
  playerShell: document.querySelector("#playerShell"),
  adOverlay: document.querySelector("#adOverlay"),
  adTitle: document.querySelector("#adTitle"),
  adCopy: document.querySelector("#adCopy"),
  adCountdownLabel: document.querySelector("#adCountdownLabel"),
  adHelperText: document.querySelector("#adHelperText"),
  adProgressFill: document.querySelector("#adProgressFill"),
  skipAdButton: document.querySelector("#skipAdButton"),
  childGuardOverlay: document.querySelector("#childGuardOverlay"),
  childGuardLabel: document.querySelector("#childGuardLabel"),
  childGuardTitle: document.querySelector("#childGuardTitle"),
  childGuardCopy: document.querySelector("#childGuardCopy"),
  childGuardParentButton: document.querySelector("#childGuardParentButton"),
  watchTitle: document.querySelector("#watchTitle"),
  watchCategory: document.querySelector("#watchCategory"),
  watchMeta: document.querySelector("#watchMeta"),
  watchLength: document.querySelector("#watchLength"),
  watchDescription: document.querySelector("#watchDescription"),
  channelHighlight: document.querySelector("#channelHighlight"),
  commentCount: document.querySelector("#commentCount"),
  commentList: document.querySelector("#commentList"),
  channelList: document.querySelector("#channelList"),
  videoGrid: document.querySelector("#videoGrid"),
  librarySummary: document.querySelector("#librarySummary"),
  searchInput: document.querySelector("#searchInput"),
  categoryChips: [...document.querySelectorAll(".chip")],
  navButtons: [...document.querySelectorAll(".nav-button")],
  heroWatchButton: document.querySelector("#heroWatchButton"),
  heroStudioButton: document.querySelector("#heroStudioButton"),
  watchChannelButton: document.querySelector("#watchChannelButton"),
  authModal: document.querySelector("#authModal"),
  closeAuthModal: document.querySelector("#closeAuthModal"),
  installModal: document.querySelector("#installModal"),
  closeInstallModal: document.querySelector("#closeInstallModal"),
  closeInstallAction: document.querySelector("#closeInstallAction"),
  installTitle: document.querySelector("#installTitle"),
  installCopy: document.querySelector("#installCopy"),
  installSteps: document.querySelector("#installSteps"),
  installNote: document.querySelector("#installNote"),
  copyInstallLinkButton: document.querySelector("#copyInstallLinkButton"),
  removeModal: document.querySelector("#removeModal"),
  closeRemoveModal: document.querySelector("#closeRemoveModal"),
  closeRemoveAction: document.querySelector("#closeRemoveAction"),
  removeTitle: document.querySelector("#removeTitle"),
  removeCopy: document.querySelector("#removeCopy"),
  removeSteps: document.querySelector("#removeSteps"),
  removeNote: document.querySelector("#removeNote"),
  logBackInButton: document.querySelector("#logBackInButton"),
  authForm: document.querySelector("#authForm"),
  planButtons: [...document.querySelectorAll("[data-plan]")],
  promoCodeInput: document.querySelector("#promoCodeInput"),
  applyPromoButton: document.querySelector("#applyPromoButton"),
  planMessage: document.querySelector("#planMessage"),
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
  parentPinMessage: document.querySelector("#parentPinMessage"),
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
  uploadForm: document.querySelector("#uploadForm"),
  videoFileInput: document.querySelector("#videoFileInput"),
  publishButton: document.querySelector("#publishButton"),
  studioMessage: document.querySelector("#studioMessage"),
  adForm: document.querySelector("#adForm"),
  createAdButton: document.querySelector("#createAdButton"),
  adMessage: document.querySelector("#adMessage"),
  creatorAdList: document.querySelector("#creatorAdList"),
  creatorVideoList: document.querySelector("#creatorVideoList"),
  summaryAccount: document.querySelector("#summaryAccount"),
  summaryPlan: document.querySelector("#summaryPlan"),
  summaryUploads: document.querySelector("#summaryUploads"),
  summaryViews: document.querySelector("#summaryViews"),
  summaryAds: document.querySelector("#summaryAds"),
  toast: document.querySelector("#toast")
};

let state = loadState();
const mediaRuntime = {
  dbPromise: null,
  fileUrls: new Map(),
  pendingKeys: new Set()
};
const sharedRuntime = {
  manifestPromise: null,
  deploying: false
};
const pwaRuntime = {
  installPromptEvent: null,
  installGuide: null,
  serviceWorkerReady: false
};
const playbackRuntime = {
  shouldAutoplay: false
};

const parentRuntime = {
  unlocked: false,
  usageTimer: null,
  lastUsageTick: 0
};

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
    const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
    const nextState = {
      ...defaultState,
      ...saved,
      subscriptionsByUser:
        saved?.subscriptionsByUser && typeof saved.subscriptionsByUser === "object" ? saved.subscriptionsByUser : {},
      historyByUser: saved?.historyByUser && typeof saved.historyByUser === "object" ? saved.historyByUser : {},
      uploads: Array.isArray(saved?.uploads) ? saved.uploads : [],
      ads: Array.isArray(saved?.ads) ? saved.ads : [],
      viewBoosts: saved?.viewBoosts || {},
      parentControls: normalizeParentControls(saved?.parentControls),
      childUsage:
        saved?.childUsage && typeof saved.childUsage === "object"
          ? {
              dateKey: typeof saved.childUsage.dateKey === "string" ? saved.childUsage.dateKey : "",
              seconds: clampNumber(saved.childUsage.seconds, 0, 86400, 0)
            }
          : { ...defaultState.childUsage },
      parentActivity: Array.isArray(saved?.parentActivity) ? saved.parentActivity.slice(0, 16) : []
    };

    if (!nextState.user) {
      nextState.plan = "Viewer";
    }

    if (!planCatalog[nextState.plan]) {
      nextState.plan = nextState.user ? "Creator" : "Viewer";
    }

    if (!seasonalThemeCatalog[nextState.seasonTheme]) {
      nextState.seasonTheme = "auto";
    }

    delete nextState.promoCode;

    return nextState;
  } catch {
    return { ...defaultState };
  }
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function clampNumber(value, min, max, fallback) {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, numberValue));
}

function normalizeTimeValue(value, fallback) {
  const text = String(value || "");
  return /^\d{2}:\d{2}$/.test(text) ? text : fallback;
}

function getAutoSeasonThemeKey(date = new Date()) {
  const month = date.getMonth();

  if (month === 9) {
    return "halloween-saja";
  }

  if (month === 11) {
    return "holiday";
  }

  if (month === 0 || month === 1) {
    return "winter";
  }

  if (month >= 2 && month <= 4) {
    return "spring";
  }

  if (month >= 5 && month <= 7) {
    return "summer";
  }

  return "autumn";
}

function getResolvedSeasonThemeKey(themeKey = state.seasonTheme) {
  if (!seasonalThemeCatalog[themeKey] || themeKey === "auto") {
    return getAutoSeasonThemeKey();
  }

  return themeKey;
}

function getResolvedSeasonThemeDetails(themeKey = state.seasonTheme) {
  const resolvedKey = getResolvedSeasonThemeKey(themeKey);
  return seasonalThemeCatalog[resolvedKey] || seasonalThemeCatalog.autumn;
}

function renderSeasonTheme() {
  const requestedTheme = seasonalThemeCatalog[state.seasonTheme] ? state.seasonTheme : "auto";
  const resolvedTheme = getResolvedSeasonThemeKey(requestedTheme);
  const details = getResolvedSeasonThemeDetails(requestedTheme);
  const badgeLabel = requestedTheme === "auto" ? `Auto: ${details.shortLabel}` : details.shortLabel;
  const summary =
    requestedTheme === "auto"
      ? `Season mode is automatic. Right now Viders is using ${details.label}.`
      : details.summary;

  document.body.dataset.seasonTheme = resolvedTheme;

  if (elements.seasonThemeSelect) {
    elements.seasonThemeSelect.value = requestedTheme;
  }

  if (elements.seasonModeBadge) {
    elements.seasonModeBadge.textContent = badgeLabel;
  }

  if (elements.seasonModeSummary) {
    elements.seasonModeSummary.textContent = summary;
  }

  if (elements.themeColorMeta) {
    elements.themeColorMeta.setAttribute("content", details.themeColor);
  }
}

function hasLiveDeployAccess() {
  return (
    Boolean(deployConfig.siteId && deployConfig.deleteToken) &&
    typeof window !== "undefined" &&
    window.location.protocol.startsWith("http")
  );
}

function getCacheBustedPath(path) {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}t=${Date.now()}`;
}

async function fetchSiteText(path) {
  const response = await fetch(getCacheBustedPath(path), { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Could not load ${path}.`);
  }
  return response.text();
}

async function fetchSiteBlob(path) {
  const response = await fetch(getCacheBustedPath(path), { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Could not load ${path}.`);
  }
  return response.blob();
}

function sanitizeFilePart(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 42);
}

function makeHostedAssetPath(fileName) {
  const dotIndex = fileName.lastIndexOf(".");
  const baseName = dotIndex > 0 ? fileName.slice(0, dotIndex) : fileName;
  const extension = dotIndex > 0 ? fileName.slice(dotIndex + 1).replace(/[^a-z0-9]/gi, "") : "mp4";
  const safeBase = sanitizeFilePart(baseName) || "video";
  const safeExt = extension.toLowerCase() || "mp4";
  return `${deployConfig.uploadDir}/${safeBase}-${Date.now()}.${safeExt}`;
}

function getHostedManifestPayload(videos) {
  return JSON.stringify({ videos }, null, 2);
}

function normalizeHostedUploads(videos) {
  return Array.isArray(videos) ? videos.filter((video) => video && typeof video === "object") : [];
}

function getUploadIdentity(video) {
  if (!video || typeof video !== "object") {
    return "";
  }

  return String(video.id || video.assetPath || video.fileKey || video.src || "");
}

function mergeHostedUploads(...collections) {
  const merged = [];
  const seen = new Set();

  collections.forEach((collection) => {
    normalizeHostedUploads(collection).forEach((video) => {
      const key = getUploadIdentity(video);
      if (!key || seen.has(key)) {
        return;
      }

      seen.add(key);
      merged.push(video);
    });
  });

  return merged;
}

async function fetchLiveHostedUploads({ useStateFallback = true } = {}) {
  if (!hasLiveDeployAccess()) {
    return normalizeHostedUploads(state.uploads);
  }

  try {
    const response = await fetch(getCacheBustedPath(deployConfig.manifestPath), { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Could not refresh the live Viders uploads.");
    }

    const payload = await response.json();
    return normalizeHostedUploads(payload?.videos);
  } catch (error) {
    if (useStateFallback) {
      return normalizeHostedUploads(state.uploads);
    }

    throw error;
  }
}

async function loadHostedManifest() {
  if (!hasLiveDeployAccess()) {
    return;
  }

  if (!sharedRuntime.manifestPromise) {
    const manifestPromise = (async () => {
      const liveUploads = await fetchLiveHostedUploads();
      state.uploads = liveUploads;
      saveState();
      render();
      return liveUploads;
    })();

    sharedRuntime.manifestPromise = manifestPromise;
    manifestPromise.finally(() => {
      if (sharedRuntime.manifestPromise === manifestPromise) {
        sharedRuntime.manifestPromise = null;
      }
    });
  }

  return sharedRuntime.manifestPromise;
}

async function buildHostedSiteZip(videos, newHostedAsset = null) {
  if (!window.JSZip) {
    throw new Error("The upload packager is still loading. Try again in a moment.");
  }

  const zip = new window.JSZip();
  const [
    indexHtml,
    parentsHtml,
    trailerHtml,
    merchHtml,
    stylesCss,
    merchCss,
    appJs,
    vidersBotJs,
    parentsJs,
    trailerJs,
    merchJs,
    logoSvg,
    angledLogoSvg,
    merchHero,
    icon192,
    icon512,
    angledIcon192,
    angledIcon512,
    appleTouch120,
    appleTouch152,
    appleTouch167,
    appleTouch180,
    angledAppleTouch120,
    angledAppleTouch152,
    angledAppleTouch167,
    angledAppleTouch180,
    webManifest,
    serviceWorkerJs
  ] = await Promise.all([
    fetchSiteText("index.html"),
    fetchSiteText("parents.html"),
    fetchSiteText("trailer.html"),
    fetchSiteText("merch.html"),
    fetchSiteText("styles.css"),
    fetchSiteText("merch.css"),
    fetchSiteText("app.js"),
    fetchSiteText("viders-bot.js"),
    fetchSiteText("parents.js"),
    fetchSiteText("trailer.js"),
    fetchSiteText("merch.js"),
    fetchSiteText("viders-logo.svg"),
    fetchSiteText("viders-logo-angled.svg"),
    fetchSiteBlob("viders-merch-hero.png"),
    fetchSiteBlob("viders-icon-192.png"),
    fetchSiteBlob("viders-icon-512.png"),
    fetchSiteBlob("viders-icon-angled-192.png"),
    fetchSiteBlob("viders-icon-angled-512.png"),
    fetchSiteBlob("viders-apple-touch-120.png"),
    fetchSiteBlob("viders-apple-touch-152.png"),
    fetchSiteBlob("viders-apple-touch-167.png"),
    fetchSiteBlob("viders-apple-touch-180.png"),
    fetchSiteBlob("viders-apple-touch-angled-120.png"),
    fetchSiteBlob("viders-apple-touch-angled-152.png"),
    fetchSiteBlob("viders-apple-touch-angled-167.png"),
    fetchSiteBlob("viders-apple-touch-angled-180.png"),
    fetchSiteText("manifest.webmanifest"),
    fetchSiteText("service-worker.js")
  ]);

  zip.file("index.html", indexHtml);
  zip.file("parents.html", parentsHtml);
  zip.file("trailer.html", trailerHtml);
  zip.file("merch.html", merchHtml);
  zip.file("styles.css", stylesCss);
  zip.file("merch.css", merchCss);
  zip.file("app.js", appJs);
  zip.file("viders-bot.js", vidersBotJs);
  zip.file("parents.js", parentsJs);
  zip.file("trailer.js", trailerJs);
  zip.file("merch.js", merchJs);
  zip.file("viders-logo.svg", logoSvg);
  zip.file("viders-logo-angled.svg", angledLogoSvg);
  zip.file("viders-merch-hero.png", merchHero);
  zip.file("viders-icon-192.png", icon192);
  zip.file("viders-icon-512.png", icon512);
  zip.file("viders-icon-angled-192.png", angledIcon192);
  zip.file("viders-icon-angled-512.png", angledIcon512);
  zip.file("viders-apple-touch-120.png", appleTouch120);
  zip.file("viders-apple-touch-152.png", appleTouch152);
  zip.file("viders-apple-touch-167.png", appleTouch167);
  zip.file("viders-apple-touch-180.png", appleTouch180);
  zip.file("viders-apple-touch-angled-120.png", angledAppleTouch120);
  zip.file("viders-apple-touch-angled-152.png", angledAppleTouch152);
  zip.file("viders-apple-touch-angled-167.png", angledAppleTouch167);
  zip.file("viders-apple-touch-angled-180.png", angledAppleTouch180);
  zip.file("manifest.webmanifest", webManifest);
  zip.file("service-worker.js", serviceWorkerJs);
  zip.file(deployConfig.manifestPath, getHostedManifestPayload(videos));

  const hostedAssets = videos.filter((video) => video.sourceType === "hosted" && video.assetPath);
  for (const video of hostedAssets) {
    if (newHostedAsset && newHostedAsset.assetPath === video.assetPath) {
      zip.file(video.assetPath, newHostedAsset.fileBlob);
      continue;
    }

    const blob = await fetchSiteBlob(video.assetPath);
    zip.file(video.assetPath, blob);
  }

  return zip.generateAsync({ type: "blob" });
}

async function deployHostedSite(zipBlob) {
  const formData = new FormData();
  formData.append("file", zipBlob, "viders-site.zip");

  const response = await fetch(`https://pagedrop.dev/api/v1/sites/${deployConfig.siteId}`, {
    method: "PUT",
    headers: {
      "X-Delete-Token": deployConfig.deleteToken
    },
    body: formData
  });

  if (!response.ok) {
    throw new Error("The live Viders site could not be updated.");
  }

  return response.json();
}

function openMediaDb() {
  if (!("indexedDB" in window)) {
    return Promise.reject(new Error("IndexedDB is not available."));
  }

  if (!mediaRuntime.dbPromise) {
    mediaRuntime.dbPromise = new Promise((resolve, reject) => {
      const request = window.indexedDB.open(mediaDbName, 1);

      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(mediaStoreName)) {
          database.createObjectStore(mediaStoreName, { keyPath: "key" });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("Failed to open media database."));
    });
  }

  return mediaRuntime.dbPromise;
}

async function putStoredVideoFile(fileKey, fileBlob) {
  const database = await openMediaDb();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(mediaStoreName, "readwrite");
    const store = transaction.objectStore(mediaStoreName);
    const request = store.put({
      key: fileKey,
      blob: fileBlob,
      updatedAt: Date.now()
    });

    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error || new Error("Failed to store the uploaded video file."));
  });
}

async function getStoredVideoFile(fileKey) {
  const database = await openMediaDb();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(mediaStoreName, "readonly");
    const store = transaction.objectStore(mediaStoreName);
    const request = store.get(fileKey);

    request.onsuccess = () => resolve(request.result?.blob || null);
    request.onerror = () => reject(request.error || new Error("Failed to read the uploaded video file."));
  });
}

async function deleteStoredVideoFile(fileKey) {
  const database = await openMediaDb();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(mediaStoreName, "readwrite");
    const store = transaction.objectStore(mediaStoreName);
    const request = store.delete(fileKey);

    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error || new Error("Failed to delete the uploaded video file."));
  });
}

function revokeStoredVideoUrl(fileKey) {
  const existingUrl = mediaRuntime.fileUrls.get(fileKey);
  if (existingUrl) {
    URL.revokeObjectURL(existingUrl);
    mediaRuntime.fileUrls.delete(fileKey);
  }
}

function formatDurationLabel(totalSeconds) {
  const safeSeconds = Math.max(1, Math.round(totalSeconds || 0));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US", {
    notation: value >= 1000 ? "compact" : "standard",
    maximumFractionDigits: 1
  }).format(value);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function getVideoFileDurationLabel(fileBlob) {
  const tempUrl = URL.createObjectURL(fileBlob);

  return new Promise((resolve) => {
    const probe = document.createElement("video");
    probe.preload = "metadata";
    probe.onloadedmetadata = () => {
      const duration = Number.isFinite(probe.duration) ? probe.duration : 360;
      URL.revokeObjectURL(tempUrl);
      resolve(formatDurationLabel(duration));
    };
    probe.onerror = () => {
      URL.revokeObjectURL(tempUrl);
      resolve("06:00");
    };
    probe.src = tempUrl;
  });
}

function getTodayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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
  return false;
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

function sanitizeBlockedTerm(term) {
  return String(term || "")
    .trim()
    .toLowerCase()
    .replace(/[<>]/g, "")
    .slice(0, 32);
}

function parseTimeMinutes(value) {
  const normalized = normalizeTimeValue(value, "00:00");
  const [hours, minutes] = normalized.split(":").map(Number);
  return hours * 60 + minutes;
}

function isNowInBedtimeWindow(date = new Date()) {
  const controls = getParentControls();

  if (!controls.enforceBedtime) {
    return false;
  }

  const start = parseTimeMinutes(controls.bedtimeStart);
  const end = parseTimeMinutes(controls.bedtimeEnd);
  const current = date.getHours() * 60 + date.getMinutes();

  if (start === end) {
    return false;
  }

  if (start < end) {
    return current >= start && current < end;
  }

  return current >= start || current < end;
}

function getChildSessionBlockReason() {
  return null;
}

function requiresParentUnlockForStudio() {
  return false;
}

function requiresParentUnlockForAccount() {
  return false;
}

function guardParentLockedAction(message = "Enter the parent PIN to change this.") {
  showToast(message);
  if (elements.parentPinMessage) {
    elements.parentPinMessage.textContent = message;
  }
  scrollToSection("parentControlsSection");
  return true;
}

function isVideoAllowedForChild(video) {
  return true;
}

function getBrowsableVideos() {
  return getAllVideos();
}

function getBlockedVideoCount() {
  return Math.max(0, getAllVideos().length - getBrowsableVideos().length);
}

function syncCurrentVideoForChildMode() {
  return;
}

function stopChildUsageTimer({ save = true } = {}) {
  if (parentRuntime.usageTimer) {
    clearInterval(parentRuntime.usageTimer);
    parentRuntime.usageTimer = null;
  }

  parentRuntime.lastUsageTick = 0;

  if (save) {
    saveState();
  }
}

function addChildUsageSeconds(seconds) {
  const usage = ensureChildUsageForToday();
  usage.seconds = clampNumber(usage.seconds + seconds, 0, 86400, usage.seconds);
}

function trackChildUsage() {
  if (!isChildModeActive() || elements.videoPlayer.paused || elements.videoPlayer.ended) {
    stopChildUsageTimer();
    return;
  }

  const now = Date.now();
  const deltaSeconds = parentRuntime.lastUsageTick
    ? Math.max(1, Math.round((now - parentRuntime.lastUsageTick) / 1000))
    : 1;

  addChildUsageSeconds(deltaSeconds);
  parentRuntime.lastUsageTick = now;

  const blockReason = getChildSessionBlockReason();
  if (blockReason) {
    elements.videoPlayer.pause();
    stopChildUsageTimer();
    render();
    showToast(blockReason.title);
    return;
  }

  renderParentControls();
  saveState();
}

function startChildUsageTimer() {
  if (!isChildModeActive()) {
    return;
  }

  const blockReason = getChildSessionBlockReason();
  if (blockReason) {
    elements.videoPlayer.pause();
    render();
    showToast(blockReason.title);
    return;
  }

  clearInterval(parentRuntime.usageTimer);
  parentRuntime.lastUsageTick = Date.now();
  parentRuntime.usageTimer = setInterval(trackChildUsage, 1000);
}

function getPlanDetails(plan = state.plan) {
  return planCatalog[plan] || planCatalog.Viewer;
}

function canCreate() {
  return Boolean(state.user) && getPlanDetails().canUpload && !requiresParentUnlockForStudio();
}

function canCreateAds() {
  return Boolean(state.user) && getPlanDetails().canCreateAds && !requiresParentUnlockForStudio();
}

function hasAdFreePlayback() {
  return getPlanDetails().adFree;
}

function canAccessVault() {
  return Boolean(state.user) && state.plan !== "Viewer" && !requiresParentUnlockForStudio();
}

function isVideoOwnedByUser(video, user = state.user) {
  if (!video || !user) {
    return false;
  }

  return (video.owner || video.channel) === user.name;
}

function getUserUploads() {
  if (!state.user) {
    return [];
  }

  return state.uploads.filter((video) => isVideoOwnedByUser(video));
}

function getUserAds() {
  if (!state.user) {
    return [];
  }

  return state.ads.filter((ad) => ad.owner === state.user.name);
}

function getUserKey(user = state.user) {
  const emailKey = user?.email?.toString().trim().toLowerCase();
  const nameKey = user?.name?.toString().trim().toLowerCase();
  return emailKey || nameKey || "";
}

function getUserSubscriptions(user = state.user) {
  const userKey = getUserKey(user);
  if (!userKey) {
    return [];
  }

  const savedChannels = state.subscriptionsByUser?.[userKey];
  return Array.isArray(savedChannels) ? [...new Set(savedChannels.filter(Boolean))] : [];
}

function setUserSubscriptions(channels, user = state.user) {
  const userKey = getUserKey(user);
  if (!userKey) {
    return;
  }

  const uniqueChannels = [...new Set(channels.filter(Boolean))];
  state.subscriptionsByUser = { ...(state.subscriptionsByUser || {}) };

  if (uniqueChannels.length) {
    state.subscriptionsByUser[userKey] = uniqueChannels;
    return;
  }

  delete state.subscriptionsByUser[userKey];
}

function isSubscribed(channelName, user = state.user) {
  return getUserSubscriptions(user).includes(channelName);
}

function getSubscriptionBoosts() {
  const boosts = new Map();

  Object.values(state.subscriptionsByUser || {}).forEach((channels) => {
    if (!Array.isArray(channels)) {
      return;
    }

    [...new Set(channels.filter(Boolean))].forEach((channelName) => {
      boosts.set(channelName, (boosts.get(channelName) || 0) + 1);
    });
  });

  return boosts;
}

function getUserWatchHistory(user = state.user) {
  const userKey = getUserKey(user);
  if (!userKey) {
    return [];
  }

  const history = Array.isArray(state.historyByUser?.[userKey]) ? state.historyByUser[userKey] : [];
  const videos = getAllVideos();
  return history
    .map((videoId) => videos.find((video) => video.id === videoId))
    .filter(Boolean);
}

function saveWatchHistory(videoId, user = state.user) {
  const userKey = getUserKey(user);
  if (!userKey || !videoId) {
    return;
  }

  const currentHistory = Array.isArray(state.historyByUser?.[userKey]) ? state.historyByUser[userKey] : [];
  const nextHistory = [videoId, ...currentHistory.filter((currentId) => currentId !== videoId)].slice(0, 36);

  state.historyByUser = {
    ...(state.historyByUser || {}),
    [userKey]: nextHistory
  };
}

function resolveVideoSrc(video) {
  if (video?.sourceType === "hosted" && video.assetPath) {
    return getCacheBustedPath(video.assetPath);
  }

  if (video?.sourceType === "file") {
    return mediaRuntime.fileUrls.get(video.fileKey) || "";
  }

  return video?.src || "";
}

function ensureUploadSources() {
  state.uploads
    .filter((video) => video.sourceType === "file" && video.fileKey)
    .forEach(async (video) => {
      if (mediaRuntime.fileUrls.has(video.fileKey) || mediaRuntime.pendingKeys.has(video.fileKey)) {
        return;
      }

      mediaRuntime.pendingKeys.add(video.fileKey);

      try {
        const storedBlob = await getStoredVideoFile(video.fileKey);
        if (storedBlob) {
          revokeStoredVideoUrl(video.fileKey);
          mediaRuntime.fileUrls.set(video.fileKey, URL.createObjectURL(storedBlob));
          render();
        }
      } catch {
        // Keep the upload metadata visible even if the file blob cannot be restored.
      } finally {
        mediaRuntime.pendingKeys.delete(video.fileKey);
      }
    });
}

function getAllAds() {
  return [...adLibrary, ...state.ads].map((ad) => ({
    ...ad,
    headline: ad.headline || ad.sponsor
  }));
}

function parseDurationSeconds(lengthText) {
  const parts = String(lengthText || "")
    .split(":")
    .map((part) => Number(part));

  if (!parts.length || parts.some((part) => Number.isNaN(part))) {
    return 0;
  }

  return parts.reduce((total, part) => total * 60 + part, 0);
}

function getAdForVideo(video) {
  const ads = getAllAds();
  const key = String(video?.id || "")
    .split("")
    .reduce((sum, character) => sum + character.charCodeAt(0), 0);

  return ads[key % ads.length];
}

function videoNeedsAd(video) {
  return parseDurationSeconds(video?.length) > 60 && !hasAdFreePlayback();
}

function clearAdTimer() {
  if (adSession.timer) {
    clearInterval(adSession.timer);
    adSession.timer = null;
  }
}

function tryPlayVideo() {
  const playAttempt = elements.videoPlayer.play();
  if (playAttempt && typeof playAttempt.catch === "function") {
    playAttempt.catch(() => {
      // Browsers can still block autoplay in some cases. Leave controls visible so people can start playback.
    });
  }
}

function finishAdSession() {
  clearAdTimer();
  adSession.active = false;
  adSession.finished = true;
  adSession.remainingSeconds = 0;
  renderAdOverlay(getCurrentVideo());

  if (playbackRuntime.shouldAutoplay) {
    tryPlayVideo();
    playbackRuntime.shouldAutoplay = false;
  }
}

function tickAdSession() {
  adSession.remainingSeconds = Math.max(0, adSession.remainingSeconds - 1);

  if (adSession.remainingSeconds <= 0) {
    finishAdSession();
    return;
  }

  renderAdOverlay(getCurrentVideo());
}

function startAdSession(video) {
  clearAdTimer();
  adSession.videoId = video.id;
  adSession.active = true;
  adSession.finished = false;
  adSession.totalSeconds = adConfig.durationSeconds;
  adSession.remainingSeconds = adConfig.durationSeconds;
  adSession.ad = getAdForVideo(video);
  adSession.timer = setInterval(tickAdSession, 1000);
}

function syncAdSession(video) {
  if (!videoNeedsAd(video)) {
    clearAdTimer();
    adSession.videoId = video.id;
    adSession.active = false;
    adSession.finished = true;
    adSession.remainingSeconds = 0;
    adSession.ad = getAdForVideo(video);
    return;
  }

  if (adSession.videoId !== video.id) {
    startAdSession(video);
    return;
  }

  if (!adSession.active && !adSession.finished) {
    startAdSession(video);
  }
}

function renderAdOverlay(video) {
  const needsAd = videoNeedsAd(video);
  const isVisible = Boolean(video && needsAd && adSession.active && adSession.videoId === video.id);
  const progress = adSession.totalSeconds
    ? ((adSession.totalSeconds - adSession.remainingSeconds) / adSession.totalSeconds) * 100
    : 100;
  const canSkip = adSession.remainingSeconds <= adConfig.skipAfterSeconds;

  elements.videoPlayer.controls = !isVisible;

  if (isVisible) {
    elements.videoPlayer.pause();
    elements.adOverlay.classList.remove("hidden");
    elements.adTitle.textContent = adSession.ad.headline || adSession.ad.sponsor;
    elements.adCopy.textContent =
      adSession.ad.headline && adSession.ad.sponsor !== adSession.ad.headline
        ? `${adSession.ad.copy} Sponsored by ${adSession.ad.sponsor}.`
        : adSession.ad.copy;
    elements.adCountdownLabel.textContent = `${adSession.remainingSeconds}s`;
    elements.adHelperText.textContent = canSkip
      ? "You can skip this ad now."
      : `Skip available in ${Math.max(1, adSession.remainingSeconds - adConfig.skipAfterSeconds)}s`;
    elements.adProgressFill.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    elements.skipAdButton.disabled = !canSkip;
    return;
  }

  elements.adOverlay.classList.add("hidden");
  elements.adProgressFill.style.width = "100%";
  elements.skipAdButton.disabled = false;
  elements.adCountdownLabel.textContent = "0s";
  elements.adHelperText.textContent = hasAdFreePlayback()
    ? "Your plan removes ads on playback."
    : needsAd
      ? "Ad complete. Your video is ready."
      : "This video is short enough to play without ads.";
}

function renderChildGuardOverlay(reason = getChildSessionBlockReason()) {
  if (!elements.childGuardOverlay) {
    return;
  }

  const isVisible = Boolean(reason);
  elements.childGuardOverlay.classList.toggle("hidden", !isVisible);

  if (!isVisible) {
    return;
  }

  clearAdTimer();
  adSession.active = false;
  elements.videoPlayer.pause();
  elements.videoPlayer.controls = false;
  elements.adOverlay.classList.add("hidden");
  elements.childGuardLabel.textContent = reason.label;
  elements.childGuardTitle.textContent = reason.title;
  elements.childGuardCopy.textContent = reason.copy;
}

function getAllVideos() {
  return [...seededVideos, ...state.uploads].map((video) => {
    const bonusViews = Number(state.viewBoosts[video.id] || 0);
    return {
      ...video,
      resolvedSrc: resolveVideoSrc(video),
      views: Number(video.views || 0) + bonusViews,
      comments: Array.isArray(video.comments) ? video.comments : []
    };
  });
}

function getCurrentVideo() {
  const videos = getBrowsableVideos();
  return videos.find((video) => video.id === state.currentVideoId) || videos[0] || null;
}

function getChannelStats() {
  const stats = new Map();
  const subscriptionBoosts = getSubscriptionBoosts();

  getBrowsableVideos().forEach((video) => {
    if (!stats.has(video.channel)) {
      stats.set(video.channel, {
        name: video.channel,
        views: 0,
        videos: 0,
        subscribers: Number(video.subscribers || 0)
      });
    }

    const channel = stats.get(video.channel);
    channel.views += Number(video.views || 0);
    channel.videos += 1;
    channel.subscribers = Math.max(channel.subscribers, Number(video.subscribers || 0));
  });

  stats.forEach((channel) => {
    channel.subscribers += subscriptionBoosts.get(channel.name) || 0;
  });

  return [...stats.values()].sort((left, right) => right.views - left.views);
}

function getChannelStat(channelName) {
  return getChannelStats().find((channel) => channel.name === channelName) || null;
}

function getUserChannel() {
  if (!state.user) {
    return null;
  }

  return getChannelStats().find((channel) => channel.name === state.user.name) || null;
}

function getUserOwnedViews() {
  return getUserUploads().reduce(
    (total, video) => total + Number(video.views || 0) + Number(state.viewBoosts[video.id] || 0),
    0
  );
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.remove("hidden");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    elements.toast.classList.add("hidden");
  }, 2600);
}

function openAuthModal() {
  elements.authModal.classList.remove("hidden");
}

function closeAuthModal() {
  elements.authModal.classList.add("hidden");
}

function openInstallModal() {
  const guide = getInstallGuide();
  pwaRuntime.installGuide = guide;
  elements.installTitle.textContent = guide.title;
  elements.installCopy.textContent = guide.copy;
  elements.installSteps.innerHTML = guide.steps.map((step) => `<li>${step}</li>`).join("");
  elements.installNote.textContent = guide.note;
  elements.installModal.classList.remove("hidden");
}

function closeInstallModal() {
  elements.installModal.classList.add("hidden");
}

function openRemoveModal(guide = getRemoveGuide()) {
  elements.removeTitle.textContent = guide.title;
  elements.removeCopy.textContent = guide.copy;
  elements.removeSteps.innerHTML = guide.steps.map((step) => `<li>${step}</li>`).join("");
  elements.removeNote.textContent = guide.note;
  elements.removeModal.classList.remove("hidden");
}

function closeRemoveModal() {
  elements.removeModal.classList.add("hidden");
}

async function copyInstallLink() {
  if (typeof window === "undefined") {
    return;
  }

  const installUrl = window.location.href;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(installUrl);
      showToast("Viders link copied.");
      return;
    }
  } catch {
    // Fall back to the manual copy flow below.
  }

  window.prompt("Copy this Viders link", installUrl);
}

function getAppSource() {
  if (typeof window === "undefined") {
    return "";
  }

  return new URLSearchParams(window.location.search).get("source") || "";
}

function isStandaloneApp() {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

function isNativeShell() {
  if (typeof window === "undefined") {
    return false;
  }

  const source = getAppSource();
  const capacitorPlatform = window.Capacitor?.getPlatform?.();
  return (
    source === "ios-app" ||
    source === "native-app" ||
    window.Capacitor?.isNativePlatform?.() === true ||
    (typeof capacitorPlatform === "string" && capacitorPlatform !== "web")
  );
}

function hasInstalledShell() {
  return isStandaloneApp() || isNativeShell();
}

function getUserAgent() {
  return typeof navigator === "undefined" ? "" : navigator.userAgent || "";
}

function isIOSDevice() {
  return /iphone|ipad|ipod/i.test(getUserAgent());
}

function isAndroidDevice() {
  return /android/i.test(getUserAgent());
}

function isWindowsDevice() {
  return /windows/i.test(getUserAgent());
}

function isMacDesktop() {
  return /macintosh|mac os x/i.test(getUserAgent()) && !isIOSDevice();
}

function isEdgeBrowser() {
  return /edg\//i.test(getUserAgent());
}

function isChromeBrowser() {
  const userAgent = getUserAgent();
  return /chrome|crios/i.test(userAgent) && !/edg\/|opr\//i.test(userAgent);
}

function isTabletDevice() {
  const userAgent = getUserAgent();
  return (
    /ipad|tablet|playbook|silk/i.test(userAgent) ||
    (/android/i.test(userAgent) && !/mobile/i.test(userAgent))
  );
}

function getInstallDeviceLabel() {
  return isTabletDevice() ? "tablet" : isIOSDevice() || isAndroidDevice() ? "phone" : "device";
}

function isSafariBrowser() {
  const userAgent = getUserAgent();
  return /safari/i.test(userAgent) && !/crios|fxios|edgios|opr\//i.test(userAgent);
}

function getInstallGuide() {
  const deviceLabel = getInstallDeviceLabel();
  const isTablet = isTabletDevice();

  if (isIOSDevice() && isSafariBrowser()) {
    return {
      buttonLabel: isTablet ? "Add to iPad" : "Add to Home Screen",
      title: isTablet ? "Add Viders to your iPad home screen" : "Add Viders to your iPhone home screen",
      copy: "Safari installs Viders from the Share menu instead of a popup prompt, but it will still save like a regular app.",
      steps: [
        "Tap the Share button in Safari.",
        "Scroll down and tap Add to Home Screen.",
        "Tap Add in the top-right corner."
      ],
      note: "Keep Safari open until the icon appears on your home screen."
    };
  }

  if (isIOSDevice()) {
    return {
      buttonLabel: isTablet ? "Open in iPad Safari" : "Open in Safari",
      title: isTablet ? "Open Viders in Safari on your iPad" : "Open Viders in Safari on your iPhone",
      copy: "Apple only allows home-screen installs from Safari on iPhone and iPad.",
      steps: [
        "Open this Viders link in Safari.",
        "Tap the Share button.",
        "Choose Add to Home Screen."
      ],
      note: "Use the Copy link button below if you need to paste this page into Safari."
    };
  }

  if (isAndroidDevice()) {
    return {
      buttonLabel: pwaRuntime.installPromptEvent ? "Install app" : isTablet ? "Install on tablet" : "Install on phone",
      title: isTablet ? "Install Viders on your Android tablet" : "Install Viders on your Android phone",
      copy: pwaRuntime.installPromptEvent
        ? "This browser is ready to install Viders like an app."
        : "If Android does not show the install prompt automatically, you can still install Viders from the browser menu.",
      steps: [
        "Tap the browser menu in Chrome or your Android browser.",
        "Choose Install app or Add to Home screen.",
        "Confirm the install when Android asks."
      ],
      note: "Chrome usually gives the smoothest install flow for Android phones and tablets."
    };
  }

  return {
    buttonLabel: pwaRuntime.installPromptEvent ? "Install app" : `Save on ${deviceLabel}`,
    title: `Save Viders on your ${deviceLabel}`,
    copy: "Use your browser's install or add-to-home-screen option to keep Viders on this device like an app.",
    steps: [
      "Open the browser menu.",
      "Choose Install app, Save app, or Add to Home Screen.",
      "Confirm when your browser asks."
    ],
    note: "If the option is missing, try Chrome on Android or Safari on iPhone."
  };
}

function getBrowserAppManagerHint() {
  if (isEdgeBrowser()) {
    return "Microsoft Edge keeps installed web apps under edge://apps.";
  }

  if (isChromeBrowser()) {
    return "Chrome keeps installed web apps under chrome://apps.";
  }

  return "If your browser has an Apps or Installed apps page, remove Viders there after you unpin it.";
}

function getRemoveGuide() {
  if (isNativeShell()) {
    return {
      title: "Remove Viders from this app shell",
      copy: "The app shell cannot uninstall itself from inside Viders, but these steps remove it from your device.",
      steps: [
        "Close Viders on this device.",
        "Touch and hold the Viders icon.",
        "Choose Remove App or Delete App.",
        "Confirm the removal."
      ],
      note: "If you only want the shortcut gone, remove it from the home screen instead of deleting the app."
    };
  }

  if (isIOSDevice()) {
    return {
      title: "Remove Viders from your home screen",
      copy: "Installed iPhone and iPad web apps are removed the same way as other home screen apps.",
      steps: [
        "Close Viders.",
        "Touch and hold the Viders icon on your home screen.",
        "Tap Remove App.",
        "Confirm the removal."
      ],
      note: "Removing the home screen app removes the installed Viders shortcut from this device."
    };
  }

  if (isAndroidDevice()) {
    return {
      title: "Remove Viders from this Android device",
      copy: "Android lets you remove the icon or uninstall the installed Viders app from the launcher.",
      steps: [
        "Close Viders.",
        "Touch and hold the Viders icon.",
        "Choose Remove for the shortcut or Uninstall for the installed app.",
        "Confirm the action."
      ],
      note: "If you installed Viders from Chrome or another browser, Android handles the uninstall like any other app."
    };
  }

  if (isWindowsDevice()) {
    return {
      title: "Remove Viders from your taskbar or this PC",
      copy: "Windows taskbar shortcuts and installed browser apps are removed in two quick steps.",
      steps: [
        "If you only want it off the taskbar, right-click the Viders taskbar icon and choose Unpin from taskbar.",
        "If you want the installed app gone too, open your browser's Apps page and uninstall Viders there.",
        "Confirm whether you also want to clear the app's site data."
      ],
      note: getBrowserAppManagerHint()
    };
  }

  if (isMacDesktop()) {
    return {
      title: "Remove Viders from this Mac",
      copy: "Installed browser apps are removed from the browser that installed them.",
      steps: [
        "Quit Viders.",
        "If you pinned it in the Dock, remove it from the Dock.",
        "Open your browser's Apps page and uninstall Viders there.",
        "Confirm whether you also want to clear the app's site data."
      ],
      note: getBrowserAppManagerHint()
    };
  }

  return {
    title: "Remove Viders from this device",
    copy: "Browsers do not let websites uninstall themselves directly, so Viders shows the fastest manual removal steps here.",
    steps: [
      "Close Viders.",
      "Remove the taskbar, Dock, or home-screen shortcut if you only want the shortcut gone.",
      "If Viders was installed as an app, remove it from your browser's installed apps page or your device's app manager."
    ],
    note: getBrowserAppManagerHint()
  };
}

async function unregisterVidersServiceWorkers() {
  if (!("serviceWorker" in navigator)) {
    return 0;
  }

  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(registrations.map((registration) => registration.unregister()));
  return registrations.length;
}

async function clearVidersAppCaches() {
  if (!("caches" in window)) {
    return 0;
  }

  const cacheNames = await caches.keys();
  const vidersCaches = cacheNames.filter((cacheName) => cacheName.toLowerCase().includes("viders"));
  await Promise.all(vidersCaches.map((cacheName) => caches.delete(cacheName)));
  return vidersCaches.length;
}

async function runAutomaticAppRemoval() {
  const cleanup = {
    cacheCount: 0,
    serviceWorkerCount: 0
  };

  cleanup.serviceWorkerCount = await unregisterVidersServiceWorkers();
  cleanup.cacheCount = await clearVidersAppCaches();
  localStorage.setItem(appRemovalRequestKey, new Date().toISOString());
  return cleanup;
}

function getAutomaticRemovalGuide(cleanup) {
  const guide = getRemoveGuide();
  const cleanupParts = [
    `${cleanup.serviceWorkerCount} app worker${cleanup.serviceWorkerCount === 1 ? "" : "s"} stopped`,
    `${cleanup.cacheCount} cache${cleanup.cacheCount === 1 ? "" : "s"} cleared`
  ];

  return {
    title: "Viders cleaned itself up",
    copy:
      "Viders removed the offline app files it is allowed to control. Windows and the browser still control the taskbar shortcut and final uninstall.",
    steps: guide.steps,
    note: `${cleanupParts.join(" and ")}. ${guide.note}`
  };
}

async function removeAppOnPress() {
  elements.removeButton.disabled = true;
  elements.removeButton.querySelector("span").textContent = "Removing...";
  showToast("Removing Viders app files on this device.");

  try {
    const cleanup = await runAutomaticAppRemoval();
    openRemoveModal(getAutomaticRemovalGuide(cleanup));
    showToast("Viders app files were removed.");
  } catch {
    openRemoveModal({
      title: "Viders could not remove everything automatically",
      copy:
        "The browser blocked part of the automatic cleanup. You can still remove the taskbar shortcut and installed app with these steps.",
      steps: getRemoveGuide().steps,
      note: getRemoveGuide().note
    });
  } finally {
    elements.removeButton.disabled = false;
    elements.removeButton.querySelector("span").textContent = isWindowsDevice() ? "Remove from taskbar" : "Remove app";
  }
}

async function registerVidersServiceWorker() {
  if (!("serviceWorker" in navigator) || !window.location.protocol.startsWith("http")) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.register("service-worker.js?v=20260509d");
    await registration.update().catch(() => null);
    await navigator.serviceWorker.ready;
    pwaRuntime.serviceWorkerReady = true;
    return true;
  } catch {
    return false;
  }
}

async function logBackInAfterRemoval() {
  localStorage.removeItem(appRemovalRequestKey);
  localStorage.setItem(appRecoveryLoginKey, new Date().toISOString());
  state.user = null;
  state.plan = "Viewer";
  saveState();
  closeRemoveModal();
  await registerVidersServiceWorker();
  render();
  refreshInstallButton();
  openAuthModal();
  showToast("Viders is ready for you to log back in.");
}

function hasRecoveryLoginPass() {
  const requestedAt = Date.parse(localStorage.getItem(appRecoveryLoginKey) || "");
  const passIsFresh = Number.isFinite(requestedAt) && Date.now() - requestedAt < 10 * 60 * 1000;

  if (!passIsFresh) {
    localStorage.removeItem(appRecoveryLoginKey);
  }

  return passIsFresh;
}

function isMobileShell() {
  return typeof window !== "undefined" && window.matchMedia?.("(max-width: 760px)").matches;
}

function isTabletShell() {
  return typeof window !== "undefined" && window.matchMedia?.("(min-width: 761px) and (max-width: 1368px)").matches;
}

function syncAppShellMode() {
  if (typeof document === "undefined") {
    return;
  }

  const nativeShell = isNativeShell();
  const installedShell = isStandaloneApp() || nativeShell;
  const standalone = isStandaloneApp();
  const mobileShell = isMobileShell();
  const tabletShell = !mobileShell && isTabletShell();
  const source = getAppSource();
  document.body.classList.toggle("is-standalone", standalone);
  document.body.classList.toggle("is-installed-shell", installedShell);
  document.body.classList.toggle("is-native-shell", nativeShell);
  document.body.classList.toggle("is-ios-shell", source === "ios-app");
  document.body.classList.toggle("is-mobile-shell", mobileShell);
  document.body.classList.toggle("is-tablet-shell", tabletShell);
  document.body.classList.toggle("is-handheld-app", installedShell && mobileShell);
  document.body.classList.toggle("is-tablet-app", installedShell && tabletShell);
}

function refreshInstallButton() {
  syncAppShellMode();
  const canShowInstallButton =
    typeof window !== "undefined" && window.location.protocol.startsWith("http") && !hasInstalledShell();
  const canShowRemoveButton =
    typeof window !== "undefined" &&
    window.location.protocol.startsWith("http") &&
    (hasInstalledShell() || isWindowsDevice() || isMacDesktop());

  elements.installButton.classList.toggle("hidden", !canShowInstallButton);
  elements.removeButton.classList.toggle("hidden", !canShowRemoveButton);

  if (canShowInstallButton) {
    const guide = getInstallGuide();
    pwaRuntime.installGuide = guide;
    elements.installButton.querySelector("span").textContent = guide.buttonLabel;
  }

  if (canShowRemoveButton) {
    elements.removeButton.querySelector("span").textContent = isWindowsDevice() ? "Remove from taskbar" : "Remove app";
  }
}

function registerAppInstall() {
  if (typeof window === "undefined") {
    return;
  }

  const shouldRegisterServiceWorker =
    "serviceWorker" in navigator &&
    window.location.protocol.startsWith("http") &&
    !localStorage.getItem(appRemovalRequestKey);

  if (shouldRegisterServiceWorker) {
    registerVidersServiceWorker().then(() => {
      refreshInstallButton();
    });
  }

  window.addEventListener("resize", syncAppShellMode);
  window.addEventListener("orientationchange", syncAppShellMode);
  window.addEventListener("pageshow", refreshInstallButton);

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    pwaRuntime.installPromptEvent = event;
    refreshInstallButton();
  });

  window.addEventListener("appinstalled", () => {
    pwaRuntime.installPromptEvent = null;
    closeInstallModal();
    refreshInstallButton();
    syncAppShellMode();
    showToast("Viders installed on this device.");
  });

  refreshInstallButton();
  syncAppShellMode();
}

async function installApp() {
  localStorage.removeItem(appRemovalRequestKey);

  if (isNativeShell()) {
    showToast("Viders is already running inside the app shell.");
    return;
  }

  if (isStandaloneApp()) {
    showToast("Viders is already installed on this device.");
    return;
  }

  if (pwaRuntime.installPromptEvent) {
    const installPrompt = pwaRuntime.installPromptEvent;
    pwaRuntime.installPromptEvent = null;
    refreshInstallButton();
    await installPrompt.prompt();
    await installPrompt.userChoice.catch(() => null);
    refreshInstallButton();
    return;
  }

  openInstallModal();
}

function scrollToSection(targetId) {
  document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  elements.navButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.target === targetId);
  });
}

function resetLibraryFilters() {
  state.selectedCategory = "All";
  state.activeChannel = "All";
  state.searchQuery = "";
  render();
}

function watchVideo(videoId, options = {}) {
  const video = getAllVideos().find((item) => item.id === videoId);
  if (!video) {
    return;
  }

  if (isChildModeActive()) {
    const blockReason = getChildSessionBlockReason();
    if (blockReason) {
      renderChildGuardOverlay(blockReason);
      showToast(blockReason.title);
      return;
    }

    if (!isVideoAllowedForChild(video)) {
      recordParentActivity(`Blocked "${video.title}" from playback.`);
      saveState();
      render();
      showToast("That video is blocked by parent controls.");
      return;
    }
  }

  playbackRuntime.shouldAutoplay = options.autoplay !== false;

  if (!options.skipViewBoost) {
    state.viewBoosts[video.id] = Number(state.viewBoosts[video.id] || 0) + 1;
  }

  if (state.user) {
    saveWatchHistory(video.id);
  }

  if (videoNeedsAd(video)) {
    startAdSession(video);
  } else {
    syncAdSession(video);
  }
  state.currentVideoId = video.id;
  saveState();
  render();

  if (!videoNeedsAd(video) && playbackRuntime.shouldAutoplay) {
    tryPlayVideo();
    playbackRuntime.shouldAutoplay = false;
  }

  if (options.scrollIntoView) {
    elements.playerShell.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

function renderEmptyWatchPanel() {
  elements.videoPlayer.pause();
  elements.videoPlayer.removeAttribute("src");
  elements.videoPlayer.load();
  elements.playerShell.style.setProperty("--player-gradient", "linear-gradient(145deg, #183369, #0d5f71)");
  elements.watchTitle.textContent = "No videos available";
  elements.watchCategory.textContent = "Videos";
  elements.watchMeta.textContent = "0 views";
  elements.watchLength.textContent = "00:00";
  elements.watchDescription.textContent = "No Viders uploads are available yet.";
  elements.watchChannelButton.textContent = "Browse videos";
  elements.channelHighlight.innerHTML = "";
  elements.commentCount.textContent = "0 comments";
  elements.commentList.innerHTML = "";
  renderAdOverlay(null);
  renderChildGuardOverlay(getChildSessionBlockReason());
}

function renderWatchPanel() {
  const video = getCurrentVideo();
  if (!video) {
    renderEmptyWatchPanel();
    return;
  }

  const channelStats = getChannelStat(video.channel) || {
    name: video.channel,
    views: Number(video.views || 0),
    videos: 1,
    subscribers: Number(video.subscribers || 0)
  };
  const ownChannel = Boolean(state.user && state.user.name === video.channel);
  const subscribed = isSubscribed(video.channel);
  const subscribeButtonLabel = !state.user ? "Sign in to subscribe" : ownChannel ? "Your channel" : subscribed ? "Subscribed" : "Subscribe";
  const subscribeButtonClass = !state.user || subscribed ? "ghost-button" : "primary-button";
  const subscribeHelperText = !state.user
    ? "Sign in to subscribe and keep up with this channel on this device."
    : ownChannel
      ? "This is your own channel. Publish videos here and grow your audience."
      : subscribed
        ? "Subscribed on this device. This creator will stay easy to jump back to."
        : "Subscribe to save this channel to your account on this device.";
  const safeChannel = escapeHtml(video.channel);
  const safeSubscribeChannel = escapeHtml(video.channel);
  const safeSubscribeHelperText = escapeHtml(subscribeHelperText);

  syncAdSession(video);
  elements.videoPlayer.src = video.resolvedSrc || video.src || sampleSource;
  elements.videoPlayer.load();
  elements.playerShell.style.setProperty("--player-gradient", video.gradient);
  elements.watchTitle.textContent = video.title;
  elements.watchCategory.textContent = `${video.category} feature`;
  elements.watchMeta.textContent = `${formatNumber(video.views)} views - ${video.uploadedAt}`;
  elements.watchLength.textContent = video.length;
  elements.watchDescription.textContent = video.description;
  elements.watchChannelButton.textContent = `Open ${video.channel}`;
  elements.channelHighlight.innerHTML = `
    <div class="channel-highlight-top">
      <div>
        <p class="eyebrow">Channel spotlight</p>
        <h3>${safeChannel}</h3>
        <p>${formatNumber(channelStats.subscribers)} subscribers - ${formatNumber(channelStats.views)} channel views - ${channelStats.videos} videos</p>
      </div>
      <button class="${subscribeButtonClass} small-button" type="button" data-subscribe-channel="${safeSubscribeChannel}" ${ownChannel ? "disabled" : ""}>
        ${subscribeButtonLabel}
      </button>
    </div>
    <p class="subscription-note">${safeSubscribeHelperText}</p>
  `;

  elements.commentCount.textContent = `${video.comments.length} comments`;
  elements.commentList.innerHTML = video.comments
    .map(
      (comment) => `
        <article class="comment-card">
          <strong>${escapeHtml(comment.author)}</strong>
          <p>${escapeHtml(comment.text)}</p>
        </article>
      `
    )
    .join("");

  renderAdOverlay(video);
  renderChildGuardOverlay();
}

function renderChannels() {
  const channels = getChannelStats();
  elements.channelList.innerHTML = channels
    .map(
      (channel) => {
        const safeChannelName = escapeHtml(channel.name);
        return `
        <button class="channel-entry ${state.activeChannel === channel.name ? "active" : ""}" type="button" data-channel="${safeChannelName}">
          <div class="channel-entry-top">
            <strong>${safeChannelName}</strong>
            ${isSubscribed(channel.name) ? '<span class="subscription-pill">Subscribed</span>' : ""}
          </div>
          <p>${formatNumber(channel.views)} channel views</p>
          <p>${formatNumber(channel.subscribers)} subscribers - ${channel.videos} videos</p>
        </button>
      `;
      }
    )
    .join("");

  elements.heroChannelCount.textContent = channels.length;
}

function renderVaultList(videos, emptyTitle, emptyCopy) {
  if (!videos.length) {
    return `
      <article class="vault-card vault-empty">
        <strong>${emptyTitle}</strong>
        <p>${emptyCopy}</p>
      </article>
    `;
  }

  return videos
    .map(
      (video) => `
        <button class="vault-card" type="button" data-vault-video-id="${video.id}">
          <div class="vault-thumb" style="--thumb-gradient:${video.gradient}">
            <span>${escapeHtml(video.category)}</span>
            <span>${escapeHtml(video.length)}</span>
          </div>
          <div class="vault-copy">
            <strong>${escapeHtml(video.title)}</strong>
            <p>${escapeHtml(video.channel)}</p>
            <span>${formatNumber(video.views)} views</span>
          </div>
        </button>
      `
    )
    .join("");
}

function renderVault() {
  const canShowVault = canAccessVault();
  elements.vaultButton.classList.toggle("hidden", !canShowVault);
  elements.vaultSection.classList.toggle("hidden", !canShowVault);

  if (!canShowVault) {
    return;
  }

  const watchedVideos = getUserWatchHistory();
  const madeVideos = getUserUploads();

  elements.vaultSummary.textContent = `${state.plan} keeps ${watchedVideos.length} watched and ${madeVideos.length} made videos ready on this device.`;
  elements.watchHistoryCount.textContent = `${watchedVideos.length} watched`;
  elements.madeVideosCount.textContent = `${madeVideos.length} made`;
  elements.watchHistoryList.innerHTML = renderVaultList(
    watchedVideos,
    "No watched videos yet",
    "Start watching on Viders and your recent videos will show up here."
  );
  elements.madeVideosList.innerHTML = renderVaultList(
    madeVideos,
    "No made videos yet",
    state.plan === "Pro"
      ? "Pro is watch-only, so your made-videos library stays empty until you switch plans."
      : state.plan === "Creator" || state.plan === "Ultimate"
        ? "Publish a video in the studio and it will show up here. Your ad builder is ready too."
      : "Publish a video in the studio and it will show up here."
  );
}

function renderVideoGrid() {
  const query = state.searchQuery.trim().toLowerCase();
  const allVideos = getBrowsableVideos();
  const filteredVideos = allVideos.filter((video) => {
    const matchesCategory = state.selectedCategory === "All" || video.category === state.selectedCategory;
    const matchesChannel = state.activeChannel === "All" || video.channel === state.activeChannel;
    const haystack = `${video.title} ${video.channel} ${video.category} ${video.description}`.toLowerCase();
    const matchesQuery = !query || haystack.includes(query);
    return matchesCategory && matchesChannel && matchesQuery;
  });

  if (elements.librarySummary) {
    if (!filteredVideos.length) {
      elements.librarySummary.textContent =
        "No Viders videos match this filter right now. Tap Videos to reset back to the full feed.";
    } else if (state.selectedCategory === "All" && state.activeChannel === "All" && !query) {
      elements.librarySummary.textContent = `All ${allVideos.length} videos on Viders are showing here.`;
    } else {
      const detailParts = [];
      if (state.activeChannel !== "All") {
        detailParts.push(state.activeChannel);
      }
      if (state.selectedCategory !== "All") {
        detailParts.push(state.selectedCategory);
      }
      if (query) {
        detailParts.push(`"${state.searchQuery.trim()}"`);
      }

      elements.librarySummary.textContent = `Showing ${filteredVideos.length} of ${allVideos.length} Viders videos${
        detailParts.length ? ` for ${detailParts.join(" / ")}` : ""
      }.`;
    }
  }

  elements.videoGrid.innerHTML = filteredVideos
    .map(
      (video) => `
        <button class="video-card" type="button" data-video-id="${video.id}">
          <div class="thumbnail" style="--thumb-gradient:${video.gradient}">
            <span>${escapeHtml(video.category)}</span>
            <span>${escapeHtml(video.length)}</span>
          </div>
          <div class="video-copy">
            <h4>${escapeHtml(video.title)}</h4>
            <p>${escapeHtml(video.channel)}</p>
            <div class="video-meta">
              <span>${formatNumber(video.views)} views</span>
              <span>${escapeHtml(video.uploadedAt)}</span>
            </div>
          </div>
        </button>
      `
    )
    .join("");

  if (!filteredVideos.length) {
    elements.videoGrid.innerHTML = `
      <article class="video-card">
        <div class="video-copy">
          <h4>No videos match yet</h4>
          <p>Try a new search term, switch categories, or click a different channel.</p>
        </div>
      </article>
    `;
  }

  elements.heroVideoCount.textContent = allVideos.length;
}

function renderCreatorAds() {
  const userAds = getUserAds();

  if (!userAds.length) {
    elements.creatorAdList.innerHTML = `
      <article class="creator-ad-card">
        <strong>No ad campaigns yet</strong>
        <p>Create a campaign here and it will rotate before 1 minute+ videos for ad-supported viewers.</p>
      </article>
    `;
    return;
  }

  elements.creatorAdList.innerHTML = userAds
    .map(
      (ad) => `
        <article class="creator-ad-card">
          <strong>${escapeHtml(ad.headline)}</strong>
          <p>${escapeHtml(ad.copy)}</p>
          <p>Sponsored by ${escapeHtml(ad.sponsor)}</p>
        </article>
      `
    )
    .join("");
}

function renderCreatorVideos() {
  const userVideos = getUserUploads();

  if (!userVideos.length) {
    elements.creatorVideoList.innerHTML = `
      <article class="creator-video-card">
        <strong>No uploads yet</strong>
        <p>Publish a video from a URL or a local file, then manage it here.</p>
      </article>
    `;
    return;
  }

  elements.creatorVideoList.innerHTML = userVideos
    .map((video) => {
      const sourceLabel =
        video.sourceType === "hosted"
          ? "Public file upload"
          : video.sourceType === "file"
            ? "Local file upload"
            : "Video URL";
      return `
        <article class="creator-video-card">
          <strong>${escapeHtml(video.title)}</strong>
          <div class="creator-video-meta">
            <span>${escapeHtml(video.category)}</span>
            <span>${escapeHtml(video.length)}</span>
            <span>${sourceLabel}</span>
            <span>${formatNumber(Number(video.views || 0) + Number(state.viewBoosts[video.id] || 0))} views</span>
          </div>
          <p>${escapeHtml(video.description)}</p>
          <button class="ghost-button small-button danger-button" type="button" data-delete-video-id="${video.id}">
            Delete this video
          </button>
        </article>
      `;
    })
    .join("");
}

function renderPlanStatus() {
  const userName = state.user?.name || "Guest";
  const subscriptionCount = getUserSubscriptions().length;
  const signedInLabel = state.user
    ? `Signed in as ${userName}. ${subscriptionCount} subscription${subscriptionCount === 1 ? "" : "s"} saved on this device.`
    : "Watching as a guest viewer. No sign-in needed.";
  const userUploads = getUserUploads();
  const userAds = getUserAds();
  elements.planBadge.textContent = `${state.plan} mode`;
  elements.userStatus.textContent = signedInLabel;
  elements.heroPlanName.textContent = state.plan;
  elements.authButton.textContent = state.user ? `${userName}` : "Sign in to create";
  elements.summaryAccount.textContent = userName;
  elements.summaryPlan.textContent = state.plan;
  elements.summaryUploads.textContent = userUploads.length;
  elements.summaryAds.textContent = userAds.length;

  elements.summaryViews.textContent = formatNumber(getUserOwnedViews());

  if (!state.user) {
    elements.studioMessage.textContent = "Guest viewers can watch freely. Sign in if you want Viders, Creator, Pro, Premium, or Ultimate.";
    elements.adMessage.textContent = "Sign in to unlock creator ads and feature modes.";
  } else if (state.plan === "Viders") {
    elements.studioMessage.textContent = "Viders unlocked. You can publish videos to the shared Viders channel, but ad-free playback and the ad builder stay locked.";
    elements.adMessage.textContent = "Viders lets you post to the Viders channel, but only Creator or Ultimate can launch ads.";
  } else if (state.plan === "Creator") {
    elements.studioMessage.textContent = "Creator unlocked. You can publish videos and run ads, but long videos still show ads while you watch.";
    elements.adMessage.textContent = "Creator ad builder unlocked. Launch a campaign to join the ad rotation.";
  } else if (state.plan === "Pro") {
    elements.studioMessage.textContent = "Pro unlocked. You watch without ads, but publishing videos and ads stays locked.";
    elements.adMessage.textContent = "Pro is ad-free watch mode only. Switch to Creator or Ultimate to run ads.";
  } else if (state.plan === "Premium") {
    elements.studioMessage.textContent = "Premium unlocked. You can publish videos and watch everything ad-free, but ad campaigns stay locked.";
    elements.adMessage.textContent = "Premium keeps playback ad-free. Switch to Creator or Ultimate if you want to run ads.";
  } else if (state.plan === "Ultimate") {
    elements.studioMessage.textContent = "Ultimate unlocked. You can publish videos, launch ads, and watch everything on Viders ad-free.";
    elements.adMessage.textContent = "Ultimate ad builder unlocked. Your campaigns will run for ad-supported viewers.";
  } else {
    elements.studioMessage.textContent = "Viewer mode is active. Watching is open, and creator tools stay locked.";
    elements.adMessage.textContent = "Viewer mode does not create ads.";
  }

  if (requiresParentUnlockForStudio()) {
    elements.studioMessage.textContent = "Parent controls are locking studio uploads on this device.";
    elements.adMessage.textContent = "Parent controls are locking ad campaigns on this device.";
  }

  if (requiresParentUnlockForAccount()) {
    elements.authButton.textContent = "Parent locked";
  }

  elements.publishButton.disabled = !canCreate();
  elements.createAdButton.disabled = !canCreateAds();
}

function renderParentControls() {
  if (!elements.parentControlsSummary) {
    return;
  }

  const controls = getParentControls();
  const usage = ensureChildUsageForToday();
  const pinReady = hasParentPin();
  const unlocked = canManageParentControls();
  const childModeActive = isChildModeActive();
  const blockedCount = getBlockedVideoCount();
  const blockReason = getChildSessionBlockReason();
  const limitLabel = controls.dailyLimitMinutes > 0 ? `${controls.dailyLimitMinutes}m limit` : "No limit";

  elements.parentControlsSummary.textContent = childModeActive
    ? `${limitLabel}, ${blockedCount} blocked, studio ${controls.lockStudio ? "locked" : "open"}.`
    : pinReady
      ? "Parent PIN is ready. Turn on child mode when this device is for kids."
      : "Create a parent PIN to turn on child mode and safety locks.";

  elements.parentSecurityTitle.textContent = childModeActive
    ? blockReason
      ? blockReason.title
      : "Child mode protecting"
    : pinReady
      ? "Ready"
      : "Not set up";
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

  const controlsDisabled = !unlocked;
  elements.parentControlStack.classList.toggle("is-locked", controlsDisabled);
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

function render() {
  renderSeasonTheme();
  ensureUploadSources();
  syncCurrentVideoForChildMode();
  renderWatchPanel();
  renderChannels();
  renderVault();
  renderVideoGrid();
  renderCreatorAds();
  renderCreatorVideos();
  renderPlanStatus();
  renderParentControls();
  elements.searchInput.value = state.searchQuery;
  elements.categoryChips.forEach((chip) => {
    chip.classList.toggle("is-active", chip.dataset.category === state.selectedCategory);
  });
  saveState();
}

function updateSeasonTheme(themeKey) {
  state.seasonTheme = seasonalThemeCatalog[themeKey] ? themeKey : "auto";
  render();
  showToast(`${getResolvedSeasonThemeDetails().label} background activated.`);
}

function applyPlan(plan) {
  if (requiresParentUnlockForAccount()) {
    guardParentLockedAction("Parent controls are locking plan changes.");
    return;
  }

  if (plan === "Viewer") {
    state.plan = "Viewer";
    elements.planMessage.textContent = "Viewer mode is active. You can watch and explore without signing in.";
    saveState();
    render();
    return;
  }

  if (!state.user) {
    elements.planMessage.textContent = "Sign in to unlock Viders, Creator, Pro, Premium, or Ultimate.";
    openAuthModal();
    return;
  }

  state.plan = plan;
  if (plan === "Viders") {
    elements.planMessage.textContent = `Viders mode active for ${state.user.name}. You can publish videos to the shared Viders channel.`;
  } else if (plan === "Creator") {
    elements.planMessage.textContent = `Creator mode active for ${state.user.name}. You can publish videos and create ads.`;
  } else if (plan === "Pro") {
    elements.planMessage.textContent = `Pro mode active for ${state.user.name}. Watching is ad-free, but creation tools stay locked.`;
  } else if (plan === "Premium") {
    elements.planMessage.textContent = `Premium mode active for ${state.user.name}. You can publish videos and watch ad-free.`;
  } else if (plan === "Ultimate") {
    elements.planMessage.textContent = `Ultimate mode active for ${state.user.name}. You have every Viders plan feature together.`;
  }
  saveState();
  render();
  showToast(`${plan} mode activated.`);
}

function applyPromoCode() {
  const code = elements.promoCodeInput?.value.trim().toUpperCase() || "";

  if (requiresParentUnlockForAccount()) {
    guardParentLockedAction("Parent controls are locking plan changes.");
    return;
  }

  if (!state.user) {
    elements.planMessage.textContent = "Sign in first so your discount can unlock a mode on your account.";
    openAuthModal();
    return;
  }

  if (!promoCodeCatalog[code]) {
    elements.planMessage.textContent = "That discount code was not recognized.";
    return;
  }

  state.plan = promoCodeCatalog[code].plan;
  elements.planMessage.textContent = promoCodeCatalog[code].message;
  saveState();
  render();
  if (elements.promoCodeInput) {
    elements.promoCodeInput.value = "";
  }
  showToast(`${state.plan} unlocked with your discount.`);
}

function toggleSubscription(channelName) {
  if (!channelName) {
    return;
  }

  if (requiresParentUnlockForAccount()) {
    guardParentLockedAction("Parent controls are locking account changes.");
    return;
  }

  if (!state.user) {
    elements.planMessage.textContent = "Sign in to subscribe to channels.";
    openAuthModal();
    return;
  }

  if (state.user.name === channelName) {
    showToast("This is your own channel.");
    return;
  }

  const subscriptions = new Set(getUserSubscriptions());
  const wasSubscribed = subscriptions.has(channelName);

  if (wasSubscribed) {
    subscriptions.delete(channelName);
  } else {
    subscriptions.add(channelName);
  }

  setUserSubscriptions([...subscriptions]);
  saveState();
  render();
  showToast(wasSubscribed ? `Unsubscribed from ${channelName}.` : `Subscribed to ${channelName}.`);
}

async function publishHostedVideo(videoData, videoFile) {
  if (sharedRuntime.deploying) {
    elements.studioMessage.textContent = "A live site update is already running. Please wait a moment.";
    return;
  }

  sharedRuntime.deploying = true;

  try {
    const previousUploads = mergeHostedUploads(state.uploads);
    const liveUploads = await fetchLiveHostedUploads();
    const uploadsToPublish = mergeHostedUploads(previousUploads, liveUploads);
    const zipBlob = await buildHostedSiteZip(
      uploadsToPublish,
      videoFile ? { assetPath: videoData.assetPath, fileBlob: videoFile } : null
    );

    if (zipBlob.size > deployConfig.maxZipBytes) {
      state.uploads = mergeHostedUploads(
        previousUploads.filter((item) => item.id !== videoData.id),
        liveUploads
      );
      saveState();
      render();
      elements.studioMessage.textContent =
        "This live host only supports smaller sites. Try a shorter or smaller video file.";
      return;
    }

    await deployHostedSite(zipBlob);
    sharedRuntime.manifestPromise = null;
    state.uploads = uploadsToPublish;
    state.currentVideoId = videoData.id;
    elements.studioMessage.textContent = `Published "${videoData.title}" to the live Viders site.`;
    saveState();
    render();
    elements.uploadForm.reset();
    showToast("Video published live on Viders.");
    scrollToSection("heroSection");
  } catch (error) {
    const liveUploads = await fetchLiveHostedUploads();
    state.uploads = mergeHostedUploads(
      state.uploads.filter((item) => item.id !== videoData.id),
      liveUploads
    );
    saveState();
    render();
    elements.studioMessage.textContent =
      error instanceof Error ? error.message : "The live upload failed. Please try again.";
  } finally {
    sharedRuntime.deploying = false;
  }
}

async function publishVideo(formData) {
  if (requiresParentUnlockForStudio()) {
    guardParentLockedAction("Parent controls are locking uploads.");
    elements.studioMessage.textContent = "Enter the parent PIN before uploading.";
    return;
  }

  if (!state.user) {
    openAuthModal();
    elements.studioMessage.textContent = "Sign in first to publish.";
    return;
  }

  if (!canCreate()) {
    elements.studioMessage.textContent = "Choose Viders, Creator, Premium, or Ultimate before publishing.";
    scrollToSection("plansSection");
    return;
  }

  const now = new Date();
  const title = formData.get("title")?.toString().trim();
  const description = formData.get("description")?.toString().trim();
  const category = formData.get("category")?.toString().trim() || "Tech";
  const src = formData.get("src")?.toString().trim() || "";
  const videoFile = elements.videoFileInput.files?.[0] || null;

  const gradientMap = {
    Gaming: "linear-gradient(145deg, #2b3678, #0d73a7 55%, #38d2d1)",
    Music: "linear-gradient(145deg, #65254d, #c14d7c 56%, #ffbd59)",
    Design: "linear-gradient(145deg, #13665b, #24a385 54%, #ffd86c)",
    Lifestyle: "linear-gradient(145deg, #6e451a, #c47a35 54%, #ffe08f)",
    Education: "linear-gradient(145deg, #214c6a, #2a7da3 56%, #ff9548)",
    Tech: "linear-gradient(145deg, #1d2754, #3857d0 54%, #54dbd1)"
  };

  if (!videoFile && !src) {
    elements.studioMessage.textContent = "Add a video URL or pick a video file before publishing.";
    return;
  }

  let length = "06:00";
  let sourceType = "url";
  let finalSrc = src;
  let fileKey = "";
  let assetPath = "";
  let publishNote = "";

  if (videoFile && hasLiveDeployAccess()) {
    sourceType = "hosted";
    assetPath = makeHostedAssetPath(videoFile.name);
    length = await getVideoFileDurationLabel(videoFile);
  } else if (videoFile) {
    sourceType = "file";
    fileKey = `video-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    length = await getVideoFileDurationLabel(videoFile);
    revokeStoredVideoUrl(fileKey);
    mediaRuntime.fileUrls.set(fileKey, URL.createObjectURL(videoFile));

    try {
      await putStoredVideoFile(fileKey, videoFile);
      publishNote = `Published "${title}" from your local files.`;
    } catch {
      publishNote = `Published "${title}" from your local files, but this browser could not save the file for future reloads.`;
    }
  }

  const newVideo = {
    id: `upload-${Date.now()}`,
    title,
    owner: state.user.name,
    channel: state.plan === "Viders" ? "Viders" : state.user.name,
    category,
    length,
    views: 0,
    subscribers: 1200,
    uploadedAt: now.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    description,
    src: finalSrc,
    sourceType,
    fileKey,
    assetPath,
    gradient: gradientMap[category] || gradientMap.Tech,
    comments: [
      {
        author: "Viders Team",
        text:
          state.plan === "Viders"
            ? "Fresh upload to the shared Viders channel. Keep the momentum going."
            : "Fresh upload. Share your new channel link with your audience."
      },
      { author: "First Viewer", text: "Nice launch. Keep posting." }
    ]
  };

  state.uploads = [newVideo, ...state.uploads];
  saveState();

  if (hasLiveDeployAccess()) {
    await publishHostedVideo(newVideo, videoFile);
    return;
  }

  state.currentVideoId = newVideo.id;
  elements.studioMessage.textContent =
    publishNote ||
    (newVideo.channel === "Viders"
      ? `Published "${title}" to the shared Viders channel.`
      : `Published "${title}" to the Viders feed.`);
  render();
  elements.uploadForm.reset();
  showToast("Video published to Viders.");
  scrollToSection("heroSection");
}

async function deleteVideo(videoId) {
  if (requiresParentUnlockForStudio()) {
    guardParentLockedAction("Parent controls are locking video management.");
    return;
  }

  const video = state.uploads.find((item) => item.id === videoId);
  if (!video || !state.user || !isVideoOwnedByUser(video)) {
    return;
  }

  if (hasLiveDeployAccess()) {
    if (sharedRuntime.deploying) {
      elements.studioMessage.textContent = "A live site update is already running. Please wait a moment.";
      return;
    }

    sharedRuntime.deploying = true;

    try {
      const previousUploads = mergeHostedUploads(state.uploads);
      const previousViewBoost = state.viewBoosts[videoId];
      const liveUploads = await fetchLiveHostedUploads();
      const uploadsToPublish = mergeHostedUploads(liveUploads, previousUploads).filter(
        (item) => item.id !== videoId
      );
      const zipBlob = await buildHostedSiteZip(uploadsToPublish);

      if (zipBlob.size > deployConfig.maxZipBytes) {
        state.uploads = mergeHostedUploads(previousUploads, liveUploads);
        if (typeof previousViewBoost !== "undefined") {
          state.viewBoosts[videoId] = previousViewBoost;
        }
        saveState();
        render();
        elements.studioMessage.textContent = "The updated live site is too large to redeploy.";
        return;
      }

      await deployHostedSite(zipBlob);
      sharedRuntime.manifestPromise = null;
      state.uploads = uploadsToPublish;
      delete state.viewBoosts[videoId];
      if (state.currentVideoId === videoId) {
        state.currentVideoId = getAllVideos().find((item) => item.id !== videoId)?.id || seededVideos[0].id;
      }
      saveState();
      render();
      showToast(`Deleted "${video.title}" from the live site.`);
      return;
    } catch (error) {
      const liveUploads = await fetchLiveHostedUploads();
      state.uploads = mergeHostedUploads(state.uploads, liveUploads);
      elements.studioMessage.textContent =
        error instanceof Error ? error.message : "The live delete failed. Please try again.";
      saveState();
      render();
      return;
    } finally {
      sharedRuntime.deploying = false;
    }
  }

  if (video.fileKey) {
    try {
      await deleteStoredVideoFile(video.fileKey);
    } catch {
      // Remove the upload metadata even if the stored blob is already missing.
    }
    revokeStoredVideoUrl(video.fileKey);
  }

  state.uploads = state.uploads.filter((item) => item.id !== videoId);
  delete state.viewBoosts[videoId];

  if (state.currentVideoId === videoId) {
    state.currentVideoId = getAllVideos().find((item) => item.id !== videoId)?.id || seededVideos[0].id;
  }

  saveState();
  render();
  showToast(`Deleted "${video.title}".`);
}

function publishAd(formData) {
  if (requiresParentUnlockForStudio()) {
    guardParentLockedAction("Parent controls are locking ad campaigns.");
    elements.adMessage.textContent = "Enter the parent PIN before launching ads.";
    return;
  }

  if (!state.user) {
    openAuthModal();
    elements.adMessage.textContent = "Sign in first to launch an ad campaign.";
    return;
  }

  if (!canCreateAds()) {
    elements.adMessage.textContent = "Choose Creator or Ultimate before launching ads.";
    scrollToSection("plansSection");
    return;
  }

  const sponsor = formData.get("sponsor")?.toString().trim();
  const headline = formData.get("headline")?.toString().trim();
  const copy = formData.get("copy")?.toString().trim();

  const newAd = {
    id: `ad-${Date.now()}`,
    owner: state.user.name,
    sponsor,
    headline,
    copy
  };

  state.ads = [newAd, ...state.ads];
  elements.adMessage.textContent = `Launched "${headline}" into the Viders ad rotation.`;
  saveState();
  render();
  elements.adForm.reset();
  showToast("Creator ad campaign launched.");
}

function ensureCanManageParentControls() {
  if (canManageParentControls()) {
    return true;
  }

  guardParentLockedAction(hasParentPin() ? "Enter the parent PIN first." : "Create a parent PIN first.");
  return false;
}

function updateParentControls(patch, activityMessage) {
  if (!ensureCanManageParentControls()) {
    renderParentControls();
    return;
  }

  state.parentControls = normalizeParentControls({
    ...getParentControls(),
    ...patch
  });

  if (activityMessage) {
    recordParentActivity(activityMessage);
  }

  if (!isChildModeActive()) {
    stopChildUsageTimer({ save: false });
  }

  saveState();
  render();
}

elements.searchInput.addEventListener("input", (event) => {
  state.searchQuery = event.target.value;
  renderVideoGrid();
  saveState();
});

elements.categoryChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    state.selectedCategory = chip.dataset.category;
    renderVideoGrid();
    saveState();
  });
});

elements.navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.target === "librarySection") {
      resetLibraryFilters();
    }

    scrollToSection(button.dataset.target);
  });
});

elements.installButton.addEventListener("click", installApp);
elements.removeButton?.addEventListener("click", removeAppOnPress);
elements.vaultButton.addEventListener("click", () => scrollToSection("vaultSection"));
elements.heroWatchButton.addEventListener("click", () => watchVideo(seededVideos[0].id, { scrollIntoView: true }));
elements.heroStudioButton.addEventListener("click", () => scrollToSection("studioSection"));
elements.seasonThemeSelect?.addEventListener("change", (event) => updateSeasonTheme(event.target.value));
elements.watchChannelButton.addEventListener("click", () => {
  const currentVideo = getCurrentVideo();
  if (!currentVideo) {
    scrollToSection("librarySection");
    return;
  }

  state.activeChannel = currentVideo.channel;
  render();
  scrollToSection("channelsSection");
});
elements.channelHighlight.addEventListener("click", (event) => {
  const button = event.target.closest("[data-subscribe-channel]");
  if (!button) {
    return;
  }

  toggleSubscription(button.dataset.subscribeChannel);
});

elements.videoGrid.addEventListener("click", (event) => {
  const card = event.target.closest("[data-video-id]");
  if (!card) {
    return;
  }
  watchVideo(card.dataset.videoId, { scrollIntoView: true });
});

[elements.watchHistoryList, elements.madeVideosList].forEach((list) => {
  list.addEventListener("click", (event) => {
    const card = event.target.closest("[data-vault-video-id]");
    if (!card) {
      return;
    }

    watchVideo(card.dataset.vaultVideoId, { scrollIntoView: true });
  });
});

elements.channelList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-channel]");
  if (!button) {
    return;
  }

  state.activeChannel = state.activeChannel === button.dataset.channel ? "All" : button.dataset.channel;
  render();
  scrollToSection("librarySection");
});

elements.authButton.addEventListener("click", () => {
  if (requiresParentUnlockForAccount() && !hasRecoveryLoginPass()) {
    guardParentLockedAction("Parent controls are locking sign-in changes.");
    return;
  }

  if (!state.user) {
    openAuthModal();
    return;
  }

  state.user = null;
  state.plan = "Viewer";
  state.activeChannel = "All";
  saveState();
  render();
  showToast("Signed out. Guest viewer mode is still ready.");
});

elements.plansButton.addEventListener("click", () => scrollToSection("plansSection"));
elements.closeAuthModal.addEventListener("click", closeAuthModal);
elements.closeInstallModal?.addEventListener("click", closeInstallModal);
elements.closeInstallAction?.addEventListener("click", closeInstallModal);
elements.closeRemoveModal?.addEventListener("click", closeRemoveModal);
elements.closeRemoveAction?.addEventListener("click", closeRemoveModal);
elements.logBackInButton?.addEventListener("click", logBackInAfterRemoval);
elements.copyInstallLinkButton?.addEventListener("click", copyInstallLink);
elements.authModal.addEventListener("click", (event) => {
  if (event.target === elements.authModal) {
    closeAuthModal();
  }
});
elements.installModal?.addEventListener("click", (event) => {
  if (event.target === elements.installModal) {
    closeInstallModal();
  }
});
elements.removeModal?.addEventListener("click", (event) => {
  if (event.target === elements.removeModal) {
    closeRemoveModal();
  }
});

elements.authForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (requiresParentUnlockForAccount() && !hasRecoveryLoginPass()) {
    guardParentLockedAction("Parent controls are locking sign-in changes.");
    closeAuthModal();
    return;
  }

  const formData = new FormData(event.currentTarget);
  state.user = {
    name: formData.get("name")?.toString().trim() || "Viders Creator",
    email: formData.get("email")?.toString().trim() || ""
  };
  localStorage.removeItem(appRecoveryLoginKey);
  saveState();
  render();
  closeAuthModal();
  showToast(`Welcome to Viders, ${state.user.name}.`);
});

elements.planButtons.forEach((button) => {
  button.addEventListener("click", () => applyPlan(button.dataset.plan));
});

elements.applyPromoButton?.addEventListener("click", applyPromoCode);
elements.childGuardParentButton?.addEventListener("click", () => scrollToSection("parentControlsSection"));
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
    recordParentActivity("Parent PIN created and child mode turned on.");
    elements.parentPinMessage.textContent = "Parent controls are on.";
  } else if (!canManageParentControls()) {
    const isValidPin = await verifyParentPin(pin);
    if (!isValidPin) {
      elements.parentPinMessage.textContent = "That PIN did not match.";
      elements.parentPinInput.value = "";
      recordParentActivity("Incorrect parent PIN attempt.");
      saveState();
      renderParentControls();
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
});

elements.parentLockButton?.addEventListener("click", () => {
  parentRuntime.unlocked = false;
  elements.parentPinMessage.textContent = "Parent controls locked.";
  render();
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
      renderParentControls();
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
    renderParentControls();
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
    renderParentControls();
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
    renderParentControls();
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

elements.skipAdButton.addEventListener("click", () => {
  if (elements.skipAdButton.disabled) {
    return;
  }

  finishAdSession();
});

elements.videoPlayer.addEventListener("play", startChildUsageTimer);
elements.videoPlayer.addEventListener("pause", () => stopChildUsageTimer());
elements.videoPlayer.addEventListener("ended", () => stopChildUsageTimer());

elements.uploadForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  await publishVideo(new FormData(event.currentTarget));
});

elements.adForm.addEventListener("submit", (event) => {
  event.preventDefault();
  publishAd(new FormData(event.currentTarget));
});

elements.creatorVideoList.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-delete-video-id]");
  if (!button) {
    return;
  }

  await deleteVideo(button.dataset.deleteVideoId);
});

registerAppInstall();
render();
loadHostedManifest();
