const STORAGE_KEY = "awesomeDelvelmentStaffTime:v1";

const icons = {
  mic: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path></svg>',
  micOff: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="m2 2 20 20"></path><path d="M9 9v3a3 3 0 0 0 5.12 2.12"></path><path d="M15 9.34V5a3 3 0 0 0-5.94-.6"></path><path d="M19 10v2a7 7 0 0 1-.77 3.2"></path><path d="M5 10v2a7 7 0 0 0 11.75 5.15"></path></svg>',
  camera: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="m22 8-6 4 6 4V8Z"></path><rect x="2" y="6" width="14" height="12" rx="2"></rect></svg>',
  cameraOff: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="m2 2 20 20"></path><path d="M10.5 6H14a2 2 0 0 1 2 2v3.5"></path><path d="M16 16.5V18a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h1.5"></path><path d="m22 8-6 4 6 4V8Z"></path></svg>',
  share: '<svg aria-hidden="true" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="13" rx="2"></rect><path d="M8 21h8"></path><path d="M12 17v4"></path></svg>',
  record: '<svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"></circle><circle cx="12" cy="12" r="3"></circle></svg>',
  hand: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M18 11V7a2 2 0 1 0-4 0v4"></path><path d="M14 10V5a2 2 0 1 0-4 0v8"></path><path d="M10 12V8a2 2 0 1 0-4 0v7a6 6 0 0 0 12 0v-4"></path></svg>',
  check: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="m20 6-11 11-5-5"></path></svg>'
};

const profiles = [
  {
    id: "james",
    name: "James",
    initials: "JS",
    role: "Creator",
    status: "Hosting",
    color: "#0f9f68",
    micOn: true,
    cameraOn: true,
    speaking: true,
    asset: "../../AWESOMECRAFT/icon-512.png"
  },
  {
    id: "maya",
    name: "Maya",
    initials: "MY",
    role: "Design",
    status: "Reviewing UI",
    color: "#d94f3d",
    micOn: false,
    cameraOn: true,
    speaking: false,
    asset: "../../Viders/viders-icon-512.png"
  },
  {
    id: "riley",
    name: "Riley",
    initials: "RY",
    role: "Video",
    status: "Trailer notes",
    color: "#2563eb",
    micOn: true,
    cameraOn: false,
    speaking: false,
    asset: "../../Viders/viders-logo-1024x576-v-wordmark.svg"
  },
  {
    id: "max",
    name: "Max",
    initials: "MX",
    role: "Games",
    status: "Testing builds",
    color: "#7c3aed",
    micOn: true,
    cameraOn: true,
    speaking: false,
    asset: "../../AWESOMECRAFT/icon-512.png"
  },
  {
    id: "sam",
    name: "Sam",
    initials: "SM",
    role: "Support",
    status: "Checking reports",
    color: "#b7791f",
    micOn: false,
    cameraOn: false,
    speaking: false,
    asset: "../../New%20project/icon-512.png"
  }
];

const chatSeed = [
  {
    id: "chat-1",
    authorId: "maya",
    text: "Launcher link check is clean on my side.",
    createdAt: Date.now() - 10 * 60000
  },
  {
    id: "chat-2",
    authorId: "max",
    text: "I am ready to test the StaffTime controls on mobile.",
    createdAt: Date.now() - 6 * 60000
  },
  {
    id: "chat-3",
    authorId: "james",
    text: "Keep this call open for build review and staff updates.",
    createdAt: Date.now() - 3 * 60000
  }
];

const agendaSeed = [
  {
    id: "links",
    title: "Launcher links",
    detail: "Confirm Staff Messages, StaffTime, games, and video apps open cleanly."
  },
  {
    id: "videos",
    title: "Viders review",
    detail: "Check trailer, parent controls, and main video app entry points."
  },
  {
    id: "games",
    title: "Game pass",
    detail: "Test AwesomeCraft, Snake Progect, Starfall Jester, and Bank Rupt Street."
  },
  {
    id: "publish",
    title: "Publish notes",
    detail: "Collect final staff notes before the next public upload."
  }
];

const elements = {
  callStatus: document.querySelector("#call-status"),
  callClock: document.querySelector("#call-clock"),
  inviteButton: document.querySelector("#invite-button"),
  stage: document.querySelector(".stage"),
  stageHeading: document.querySelector("#stage-heading"),
  videoGrid: document.querySelector("#video-grid"),
  layoutButtons: [...document.querySelectorAll("[data-layout]")],
  panelButtons: [...document.querySelectorAll("[data-panel]")],
  panelViews: [...document.querySelectorAll(".panel-view")],
  staffCount: document.querySelector("#staff-count"),
  mutedCount: document.querySelector("#muted-count"),
  durationCount: document.querySelector("#duration-count"),
  staffList: document.querySelector("#staff-list"),
  chatList: document.querySelector("#chat-list"),
  chatForm: document.querySelector("#chat-form"),
  chatInput: document.querySelector("#chat-input"),
  agendaList: document.querySelector("#agenda-list"),
  micButton: document.querySelector("#mic-button"),
  cameraButton: document.querySelector("#camera-button"),
  shareButton: document.querySelector("#share-button"),
  recordButton: document.querySelector("#record-button"),
  handButton: document.querySelector("#hand-button"),
  reactionButton: document.querySelector("#reaction-button"),
  leaveButton: document.querySelector("#leave-button"),
  endedOverlay: document.querySelector("#ended-overlay"),
  endedSummary: document.querySelector("#ended-summary"),
  rejoinButton: document.querySelector("#rejoin-button"),
  reactionPop: document.querySelector("#reaction-pop"),
  toast: document.querySelector("#toast")
};

let state = loadState();
let toastTimer = 0;
let reactionTimer = 0;
let speakerIndex = 0;

function defaultState() {
  return {
    activePanel: "staff",
    layout: "grid",
    focusedId: "james",
    micOn: true,
    cameraOn: true,
    screenShare: false,
    recording: false,
    handRaised: false,
    agendaDone: ["links"],
    messages: chatSeed,
    startedAt: Date.now() - 12 * 60000,
    inCall: true
  };
}

function loadState() {
  const fallback = defaultState();

  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if (!stored || typeof stored !== "object") {
      return fallback;
    }

    return {
      ...fallback,
      ...stored,
      messages: Array.isArray(stored.messages) ? stored.messages : fallback.messages,
      agendaDone: Array.isArray(stored.agendaDone) ? stored.agendaDone : fallback.agendaDone,
      startedAt: Date.now() - 12 * 60000,
      inCall: true
    };
  } catch {
    return fallback;
  }
}

function saveState() {
  const { inCall, startedAt, ...persisted } = state;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
}

function createElement(tag, className, text) {
  const element = document.createElement(tag);

  if (className) {
    element.className = className;
  }

  if (text !== undefined) {
    element.textContent = text;
  }

  return element;
}

function profileById(profileId) {
  return profiles.find((profile) => profile.id === profileId) || profiles[0];
}

function callProfile(profile) {
  if (profile.id !== "james") {
    return profile;
  }

  return {
    ...profile,
    micOn: state.micOn,
    cameraOn: state.cameraOn,
    speaking: state.micOn,
    sharing: state.screenShare,
    raisedHand: state.handRaised
  };
}

function allCallProfiles() {
  return profiles.map(callProfile);
}

function renderVideoGrid() {
  const callProfiles = allCallProfiles();
  elements.videoGrid.replaceChildren();
  elements.videoGrid.classList.toggle("focus-mode", state.layout === "focus");

  callProfiles.forEach((profile) => {
    const tile = createElement("article", "video-tile");
    tile.style.setProperty("--tile-color", profile.color);
    tile.classList.toggle("is-focused", state.layout === "focus" && profile.id === state.focusedId);
    tile.classList.toggle("is-speaking", Boolean(profile.speaking && profile.micOn && state.inCall));
    tile.classList.toggle("is-camera-off", !profile.cameraOn);
    tile.tabIndex = 0;
    tile.setAttribute("aria-label", `${profile.name}, ${profile.role}`);

    if (profile.sharing) {
      tile.append(renderShareFeed(profile));
    } else if (profile.cameraOn) {
      tile.append(renderCameraFeed(profile));
    } else {
      tile.append(renderCameraOff(profile));
    }

    tile.append(renderAudioBars(), renderTileFooter(profile), createElement("span", "speaking-ring"));

    tile.addEventListener("click", () => focusProfile(profile.id));
    tile.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        focusProfile(profile.id);
      }
    });

    elements.videoGrid.append(tile);
  });
}

function renderCameraFeed(profile) {
  const feed = createElement("div", "video-feed");
  const portrait = createElement("div", "portrait");
  feed.append(portrait);
  return feed;
}

function renderCameraOff(profile) {
  const feed = createElement("div", "camera-off");
  const initials = createElement("span", "initials", profile.initials);
  feed.append(initials);
  return feed;
}

function renderShareFeed(profile) {
  const feed = createElement("div", "share-feed");
  const windowEl = createElement("div", "share-window");
  const image = document.createElement("img");
  const lines = createElement("div", "share-lines");

  image.src = profile.asset;
  image.alt = "";
  lines.append(createElement("span"), createElement("span"), createElement("span"));
  windowEl.append(image, lines);
  feed.append(windowEl);
  return feed;
}

function renderAudioBars() {
  const bars = createElement("div", "audio-bars");
  bars.append(createElement("span"), createElement("span"), createElement("span"));
  return bars;
}

function renderTileFooter(profile) {
  const footer = createElement("footer", "tile-footer");
  const name = createElement("div", "tile-name");
  const title = createElement("strong", "", profile.name);
  const status = createElement("span", "", `${profile.role} - ${profile.status}`);
  const badges = createElement("div", "tile-badges");

  name.append(title, status);
  badges.append(
    renderBadge(profile.micOn ? icons.mic : icons.micOff, !profile.micOn, profile.micOn ? "Microphone on" : "Muted"),
    renderBadge(profile.cameraOn ? icons.camera : icons.cameraOff, !profile.cameraOn, profile.cameraOn ? "Camera on" : "Camera off")
  );

  if (profile.sharing) {
    badges.append(renderBadge(icons.share, false, "Sharing screen"));
  }

  if (profile.raisedHand) {
    badges.append(renderBadge(icons.hand, false, "Hand raised"));
  }

  footer.append(name, badges);
  return footer;
}

function renderBadge(svg, muted, label) {
  const badge = createElement("span", `mini-badge${muted ? " is-muted" : ""}`);
  badge.innerHTML = svg;
  badge.setAttribute("title", label);
  return badge;
}

function renderStaffPanel() {
  const callProfiles = allCallProfiles();
  const mutedCount = callProfiles.filter((profile) => !profile.micOn).length;

  elements.staffCount.textContent = String(callProfiles.length);
  elements.mutedCount.textContent = String(mutedCount);
  elements.staffList.replaceChildren();

  callProfiles.forEach((profile) => {
    const row = createElement("article", "staff-row");
    const avatar = createElement("span", "staff-avatar", profile.initials);
    const copy = createElement("span", "staff-copy");
    const name = createElement("strong", "", profile.name);
    const detail = createElement("span", "", `${profile.role} - ${profile.status}`);
    const stateIcons = createElement("span", "staff-state");

    avatar.style.setProperty("--avatar-color", profile.color);
    copy.append(name, detail);
    stateIcons.append(
      renderStateIcon(profile.micOn ? icons.mic : icons.micOff),
      renderStateIcon(profile.cameraOn ? icons.camera : icons.cameraOff)
    );

    if (profile.sharing) {
      stateIcons.append(renderStateIcon(icons.share));
    }

    row.append(avatar, copy, stateIcons);
    elements.staffList.append(row);
  });
}

function renderStateIcon(svg) {
  const span = createElement("span");
  span.innerHTML = svg;
  return span;
}

function renderChatPanel() {
  elements.chatList.replaceChildren();

  state.messages.forEach((message) => {
    const profile = profileById(message.authorId);
    const item = createElement("article", "chat-message");
    const avatar = createElement("span", "chat-avatar", profile.initials);
    const bubble = createElement("div", "chat-bubble");
    const header = document.createElement("header");
    const author = createElement("strong", "", profile.name);
    const time = document.createElement("time");
    const text = createElement("p", "", message.text);

    avatar.style.setProperty("--avatar-color", profile.color);
    time.dateTime = new Date(message.createdAt).toISOString();
    time.textContent = formatTime(message.createdAt);
    header.append(author, time);
    bubble.append(header, text);
    item.append(avatar, bubble);
    elements.chatList.append(item);
  });

  requestAnimationFrame(() => {
    elements.chatList.scrollTop = elements.chatList.scrollHeight;
  });
}

function renderAgendaPanel() {
  elements.agendaList.replaceChildren();

  agendaSeed.forEach((item) => {
    const row = createElement("label", "agenda-item");
    const checkbox = document.createElement("input");
    const copy = createElement("span");
    const title = createElement("strong", "", item.title);
    const detail = createElement("span", "", item.detail);
    const checked = state.agendaDone.includes(item.id);

    checkbox.type = "checkbox";
    checkbox.checked = checked;
    row.classList.toggle("is-done", checked);
    checkbox.addEventListener("change", () => toggleAgenda(item.id, checkbox.checked));
    copy.append(title, detail);
    row.append(checkbox, copy);
    elements.agendaList.append(row);
  });
}

function renderTabs() {
  elements.panelButtons.forEach((button) => {
    const isActive = button.dataset.panel === state.activePanel;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", isActive ? "true" : "false");
  });

  elements.panelViews.forEach((view) => {
    const isActive = view.id === `${state.activePanel}-panel`;
    view.classList.toggle("is-active", isActive);
    view.hidden = !isActive;
  });
}

function renderLayoutButtons() {
  elements.layoutButtons.forEach((button) => {
    const isActive = button.dataset.layout === state.layout;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
}

function renderControls() {
  setButtonState(elements.micButton, !state.micOn, state.micOn ? "Mute microphone" : "Unmute microphone");
  setButtonState(elements.cameraButton, !state.cameraOn, state.cameraOn ? "Turn camera off" : "Turn camera on");
  setButtonState(elements.shareButton, state.screenShare, state.screenShare ? "Stop sharing screen" : "Share screen");
  setButtonState(elements.recordButton, state.recording, state.recording ? "Stop recording" : "Record call");
  setButtonState(elements.handButton, state.handRaised, state.handRaised ? "Lower hand" : "Raise hand");
  elements.callStatus.textContent = state.recording ? "Recording" : "Live";
}

function setButtonState(button, active, label) {
  button.classList.toggle("is-active", active);
  button.classList.toggle("is-muted", active && (button === elements.micButton || button === elements.cameraButton));
  button.setAttribute("aria-pressed", active ? "true" : "false");
  button.setAttribute("aria-label", label);
}

function renderApp() {
  renderTabs();
  renderLayoutButtons();
  renderControls();
  renderVideoGrid();
  renderStaffPanel();
  renderChatPanel();
  renderAgendaPanel();
  updateClock();
}

function focusProfile(profileId) {
  state.focusedId = profileId;

  if (state.layout !== "focus") {
    state.layout = "focus";
  }

  saveState();
  renderApp();
}

function setLayout(layout) {
  state.layout = layout;
  saveState();
  renderApp();
}

function setPanel(panel) {
  state.activePanel = panel;
  saveState();
  renderApp();
}

function toggleAgenda(itemId, checked) {
  if (checked && !state.agendaDone.includes(itemId)) {
    state.agendaDone.push(itemId);
  }

  if (!checked) {
    state.agendaDone = state.agendaDone.filter((id) => id !== itemId);
  }

  saveState();
  renderAgendaPanel();
}

function sendChat(event) {
  event.preventDefault();
  const text = elements.chatInput.value.trim();

  if (!text) {
    showToast("Write a staff message first.");
    return;
  }

  state.messages.push({
    id: makeId(),
    authorId: "james",
    text,
    createdAt: Date.now()
  });

  elements.chatInput.value = "";
  state.activePanel = "chat";
  saveState();
  renderApp();
  showToast("Message sent.");
}

function makeId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return `staff-time-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatTime(value) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatDuration(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function updateClock() {
  const now = Date.now();
  elements.callClock.textContent = formatTime(now);
  elements.durationCount.textContent = formatDuration(now - state.startedAt);
}

async function copyInvite() {
  const text = [
    "Awesome StaffTime",
    "Room: Staff Standup",
    window.location.href
  ].join("\n");

  await copyText(text);
  showToast("Invite copied.");
}

async function copyText(text) {
  if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // The textarea fallback below works when clipboard permissions are unavailable.
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-999px";
  document.body.append(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

function toggleMic() {
  state.micOn = !state.micOn;
  saveState();
  renderApp();
  showToast(state.micOn ? "Microphone on." : "Microphone muted.");
}

function toggleCamera() {
  state.cameraOn = !state.cameraOn;

  if (!state.cameraOn) {
    state.screenShare = false;
  }

  saveState();
  renderApp();
  showToast(state.cameraOn ? "Camera on." : "Camera off.");
}

function toggleShare() {
  state.screenShare = !state.screenShare;

  if (state.screenShare) {
    state.cameraOn = true;
    state.layout = "focus";
    state.focusedId = "james";
  }

  saveState();
  renderApp();
  showToast(state.screenShare ? "Screen sharing on." : "Screen sharing off.");
}

function toggleRecord() {
  state.recording = !state.recording;
  saveState();
  renderApp();
  showToast(state.recording ? "Recording started." : "Recording stopped.");
}

function toggleHand() {
  state.handRaised = !state.handRaised;
  saveState();
  renderApp();
  showToast(state.handRaised ? "Hand raised." : "Hand lowered.");
}

function sendReaction() {
  const reactions = ["Nice", "Agree", "Ship it", "Review"];
  const label = reactions[Math.floor(Math.random() * reactions.length)];

  clearTimeout(reactionTimer);
  elements.reactionPop.textContent = label;
  elements.reactionPop.classList.add("is-visible");

  reactionTimer = window.setTimeout(() => {
    elements.reactionPop.classList.remove("is-visible");
  }, 1000);
}

function leaveCall() {
  state.inCall = false;
  elements.endedSummary.textContent = `You were in the staff call for ${formatDuration(Date.now() - state.startedAt)}.`;
  elements.endedOverlay.hidden = false;
  elements.callStatus.textContent = "Ended";
}

function rejoinCall() {
  state.inCall = true;
  state.startedAt = Date.now();
  elements.endedOverlay.hidden = true;
  renderApp();
  showToast("Rejoined Awesome StaffTime.");
}

function showToast(message) {
  clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");

  toastTimer = window.setTimeout(() => {
    elements.toast.classList.remove("is-visible");
  }, 2300);
}

function rotateSpeaker() {
  const remoteSpeakers = ["maya", "riley", "max", "sam"];
  const speakerId = remoteSpeakers[speakerIndex % remoteSpeakers.length];
  speakerIndex += 1;

  profiles.forEach((profile) => {
    if (profile.id !== "james") {
      profile.speaking = profile.id === speakerId && profile.micOn;
    }
  });

  if (state.inCall) {
    renderVideoGrid();
  }
}

elements.layoutButtons.forEach((button) => {
  button.addEventListener("click", () => setLayout(button.dataset.layout));
});

elements.panelButtons.forEach((button) => {
  button.addEventListener("click", () => setPanel(button.dataset.panel));
});

elements.inviteButton.addEventListener("click", copyInvite);
elements.chatForm.addEventListener("submit", sendChat);
elements.micButton.addEventListener("click", toggleMic);
elements.cameraButton.addEventListener("click", toggleCamera);
elements.shareButton.addEventListener("click", toggleShare);
elements.recordButton.addEventListener("click", toggleRecord);
elements.handButton.addEventListener("click", toggleHand);
elements.reactionButton.addEventListener("click", sendReaction);
elements.leaveButton.addEventListener("click", leaveCall);
elements.rejoinButton.addEventListener("click", rejoinCall);

renderApp();
window.setInterval(updateClock, 1000);
window.setInterval(rotateSpeaker, 4200);
