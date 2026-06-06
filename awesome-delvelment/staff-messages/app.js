const STORAGE_KEY = "awesomeDelvelmentStaffMessages:v2";
const STAFF_CODE = "2017";

const rooms = [
  {
    id: "general",
    name: "General",
    icon: "G",
    color: "#0f766e",
    subtitle: "Daily check-ins",
    brief: "Daily planning, site decisions, launch timing, and staff updates for Awesome Delvelment.",
    notice: "Sign in with the staff code before reading or sending messages."
  },
  {
    id: "builds",
    name: "Builds",
    icon: "B",
    color: "#315efb",
    subtitle: "Bugs, releases, updates",
    brief: "Build notes for websites, games, uploads, packaging, and release checks.",
    notice: "Use this room for release checks, bugs, and app update notes."
  },
  {
    id: "announcements",
    name: "Announcements",
    icon: "A",
    color: "#b7791f",
    subtitle: "Important posts",
    brief: "Official staff updates, channel announcements, and launch notes.",
    notice: "Pin messages here when they should stay easy to find."
  },
  {
    id: "support",
    name: "Support",
    icon: "S",
    color: "#d94f3d",
    subtitle: "Reports and requests",
    brief: "Staff requests, app problems, user notes, and quick fixes that need a reply.",
    notice: "Mark messages Needs reply when someone should answer before the next publish."
  }
];

const accessItems = [
  { title: "Code protected", text: "Staff code required before messages open.", color: "#0f766e" },
  { title: "No staff roster", text: "Names appear only after someone signs in.", color: "#315efb" },
  { title: "Local inbox", text: "Messages save in this browser on this device.", color: "#b7791f" }
];

const colors = ["#0f766e", "#315efb", "#d94f3d", "#7c3aed", "#b7791f", "#25834a"];

const icons = {
  pin: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 17v5M5 17h14M7 3h10l-2 6 3 4v4H6v-4l3-4-2-6Z"></path></svg>',
  check: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="m20 6-11 11-5-5"></path></svg>',
  eye: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"></path><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"></path></svg>',
  trash: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M3 6h18"></path><path d="M8 6V4h8v2"></path><path d="m19 6-1 14H6L5 6"></path></svg>'
};

const signinScreen = document.querySelector("#signin-screen");
const signinForm = document.querySelector("#signin-form");
const signinName = document.querySelector("#signin-name");
const signinCode = document.querySelector("#signin-code");
const signinError = document.querySelector("#signin-error");
const appShell = document.querySelector("#app-shell");
const currentAvatar = document.querySelector("#current-avatar");
const currentName = document.querySelector("#current-name");
const signOutButton = document.querySelector("#sign-out-button");
const roomSearch = document.querySelector("#room-search");
const roomList = document.querySelector("#room-list");
const roomBadge = document.querySelector("#room-badge");
const roomKicker = document.querySelector("#room-kicker");
const roomTitle = document.querySelector("#room-title");
const roomMeta = document.querySelector("#room-meta");
const pinRoomButton = document.querySelector("#pin-room");
const copyRoomButton = document.querySelector("#copy-room");
const noticeStrip = document.querySelector("#notice-strip");
const messageSearch = document.querySelector("#message-search");
const viewButtons = [...document.querySelectorAll("[data-view]")];
const messageList = document.querySelector("#message-list");
const composeForm = document.querySelector("#compose-form");
const messageInput = document.querySelector("#message-input");
const prioritySelect = document.querySelector("#priority-select");
const needsReply = document.querySelector("#needs-reply");
const attachButton = document.querySelector("#attach-button");
const fileInput = document.querySelector("#file-input");
const quickReplyButtons = [...document.querySelectorAll("[data-insert]")];
const roomBrief = document.querySelector("#room-brief");
const accessList = document.querySelector("#access-list");
const pinnedList = document.querySelector("#pinned-list");
const exportButton = document.querySelector("#export-button");
const resetButton = document.querySelector("#reset-button");
const toast = document.querySelector("#toast");

let state = loadState();
let toastTimer = 0;

function seedState() {
  return {
    activeRoomId: "general",
    currentUserId: "",
    view: "all",
    pinnedRooms: [],
    users: {},
    messages: Object.fromEntries(rooms.map((room) => [room.id, []]))
  };
}

function loadState() {
  const fallback = seedState();

  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if (!stored || typeof stored !== "object") {
      return fallback;
    }

    return normalizeState({
      ...fallback,
      ...stored,
      users: {
        ...fallback.users,
        ...stored.users
      },
      messages: {
        ...fallback.messages,
        ...stored.messages
      },
      pinnedRooms: Array.isArray(stored.pinnedRooms) ? stored.pinnedRooms : fallback.pinnedRooms
    });
  } catch {
    return fallback;
  }
}

function normalizeState(nextState) {
  rooms.forEach((room) => {
    if (!Array.isArray(nextState.messages[room.id])) {
      nextState.messages[room.id] = [];
    }
  });

  if (!rooms.some((room) => room.id === nextState.activeRoomId)) {
    nextState.activeRoomId = rooms[0].id;
  }

  if (!nextState.currentUserId || !nextState.users[nextState.currentUserId]) {
    nextState.currentUserId = "";
  }

  return nextState;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function slugify(value) {
  return normalize(value).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function initialsFromName(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] || "S";
  const second = parts.length > 1 ? parts[parts.length - 1][0] : parts[0]?.[1] || "T";
  return `${first}${second}`.toUpperCase();
}

function colorFromName(name) {
  const total = [...name].reduce((sum, character) => sum + character.charCodeAt(0), 0);
  return colors[total % colors.length];
}

function createUser(name) {
  const cleanName = name.trim().replace(/\s+/g, " ");
  const idBase = slugify(cleanName) || "staff";
  const user = {
    id: `staff-${idBase}`,
    name: cleanName,
    initials: initialsFromName(cleanName),
    color: colorFromName(cleanName)
  };

  state.users[user.id] = user;
  state.currentUserId = user.id;

  return user;
}

function currentUser() {
  return state.users[state.currentUserId] || null;
}

function findUser(userId) {
  return state.users[userId] || {
    id: "unknown",
    name: "Signed-out staff",
    initials: "ST",
    color: "#647184"
  };
}

function activeRoom() {
  return rooms.find((room) => room.id === state.activeRoomId) || rooms[0];
}

function activeMessages() {
  const room = activeRoom();
  state.messages[room.id] ||= [];
  return state.messages[room.id];
}

function formatTime(value) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function makeId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return `msg-${Date.now()}-${Math.random().toString(16).slice(2)}`;
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

function setAvatar(element, label, color) {
  element.textContent = label;
  element.style.background = color;
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");

  toastTimer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2400);
}

function setTextareaSize() {
  messageInput.style.height = "auto";
  messageInput.style.height = `${Math.min(messageInput.scrollHeight, 150)}px`;
  messageInput.style.overflowY = messageInput.scrollHeight > 150 ? "auto" : "hidden";
}

function renderAuth() {
  const user = currentUser();
  const isSignedIn = Boolean(user);

  signinScreen.hidden = isSignedIn;
  appShell.hidden = !isSignedIn;

  if (!isSignedIn) {
    signinName.focus();
    return;
  }

  setAvatar(currentAvatar, user.initials, user.color);
  currentName.textContent = user.name;
  renderApp();
}

function renderRooms() {
  const query = normalize(roomSearch.value);
  const filteredRooms = rooms.filter((room) => {
    const text = `${room.name} ${room.subtitle} ${room.brief}`;
    return normalize(text).includes(query);
  });

  roomList.replaceChildren();

  if (!filteredRooms.length) {
    roomList.append(createElement("p", "empty-state", "No rooms match that search."));
    return;
  }

  filteredRooms.forEach((room) => {
    const messages = state.messages[room.id] || [];
    const button = createElement("button", "room-item");
    const avatar = createElement("span", "avatar");
    const copy = createElement("span", "room-copy");
    const title = createElement("strong", "", room.name);
    const subtitle = createElement("span", "", latestSnippet(messages, room.subtitle));
    const count = createElement("span", "room-count", String(messages.length));

    button.type = "button";
    button.dataset.roomId = room.id;
    button.classList.toggle("is-active", room.id === state.activeRoomId);
    button.setAttribute("aria-current", room.id === state.activeRoomId ? "page" : "false");
    setAvatar(avatar, room.icon, room.color);

    copy.append(title, subtitle);
    button.append(avatar, copy, count);

    if (state.pinnedRooms.includes(room.id)) {
      count.classList.add("room-pin");
      count.textContent = "PIN";
    }

    button.addEventListener("click", () => {
      state.activeRoomId = room.id;
      state.view = "all";
      messageSearch.value = "";
      saveState();
      renderApp();
    });

    roomList.append(button);
  });
}

function latestSnippet(messages, fallback) {
  const last = messages[messages.length - 1];

  if (!last) {
    return fallback;
  }

  const user = findUser(last.authorId);
  return `${user.name}: ${last.text}`;
}

function renderHeader() {
  const room = activeRoom();
  const messages = activeMessages();
  const pinned = state.pinnedRooms.includes(room.id);

  setAvatar(roomBadge, room.icon, room.color);
  roomKicker.textContent = "Channel";
  roomTitle.textContent = room.name;
  roomMeta.textContent = `${messages.length} message${messages.length === 1 ? "" : "s"}`;
  noticeStrip.textContent = room.notice;
  pinRoomButton.classList.toggle("is-active", pinned);
  pinRoomButton.setAttribute("aria-pressed", pinned ? "true" : "false");
}

function messageMatches(message) {
  const query = normalize(messageSearch.value);
  const user = findUser(message.authorId);

  if (state.view === "pinned" && !message.pinned) {
    return false;
  }

  if (state.view === "mine" && message.authorId !== state.currentUserId) {
    return false;
  }

  if (!query) {
    return true;
  }

  return normalize(`${user.name} ${message.text} ${message.priority}`).includes(query);
}

function renderMessages() {
  const messages = activeMessages().filter(messageMatches);

  messageList.replaceChildren();

  if (!messages.length) {
    const empty = createElement("div", "empty-state", "No messages yet.");
    messageList.append(empty);
    return;
  }

  messages.forEach((message) => {
    messageList.append(renderMessage(message));
  });

  window.requestAnimationFrame(() => {
    messageList.scrollTop = messageList.scrollHeight;
  });
}

function renderMessage(message) {
  const user = findUser(message.authorId);
  const isMine = message.authorId === state.currentUserId;
  const article = createElement("article", `message${isMine ? " is-mine" : ""}`);
  const avatar = createElement("span", "message-avatar");
  const body = createElement("div", "message-body");
  const head = createElement("div", "message-head");
  const author = createElement("strong", "", user.name);
  const time = createElement("span", "", formatTime(message.createdAt));
  const text = createElement("p", "message-text", message.text);
  const tags = createElement("div", "message-tags");
  const actions = createElement("div", "message-actions");

  message.seenBy ||= [];
  message.doneBy ||= [];

  setAvatar(avatar, user.initials, user.color);
  head.append(author, time);

  if (message.priority !== "normal") {
    tags.append(createElement("span", `tag ${message.priority}`, message.priority));
  }

  if (message.needsReply) {
    tags.append(createElement("span", "tag reply", "needs reply"));
  }

  if (message.pinned) {
    tags.append(createElement("span", "tag", "pinned"));
  }

  actions.append(
    renderMiniAction("pin", "Pin", Boolean(message.pinned), () => togglePinned(message.id)),
    renderMiniAction("eye", `Seen ${message.seenBy.length}`, message.seenBy.includes(state.currentUserId), () => toggleReaction(message.id, "seenBy")),
    renderMiniAction("check", `Done ${message.doneBy.length}`, message.doneBy.includes(state.currentUserId), () => toggleReaction(message.id, "doneBy"))
  );

  if (isMine) {
    actions.append(renderMiniAction("trash", "Delete", false, () => deleteMessage(message.id), true));
  }

  body.append(head, text);

  if (tags.childElementCount) {
    body.append(tags);
  }

  body.append(actions);
  article.append(avatar, body);

  return article;
}

function renderMiniAction(iconName, label, active, onClick, danger = false) {
  const button = createElement("button", `mini-action${active ? " is-active" : ""}${danger ? " danger" : ""}`);
  const labelNode = createElement("span", "", label);

  button.type = "button";
  button.innerHTML = icons[iconName];
  button.append(labelNode);
  button.addEventListener("click", onClick);

  return button;
}

function updateMessage(messageId, updater) {
  const messages = activeMessages();
  const message = messages.find((item) => item.id === messageId);

  if (!message) {
    return;
  }

  updater(message);
  saveState();
  renderApp();
}

function togglePinned(messageId) {
  updateMessage(messageId, (message) => {
    message.pinned = !message.pinned;
  });
}

function toggleReaction(messageId, key) {
  updateMessage(messageId, (message) => {
    message[key] ||= [];
    const index = message[key].indexOf(state.currentUserId);

    if (index >= 0) {
      message[key].splice(index, 1);
    } else {
      message[key].push(state.currentUserId);
    }
  });
}

function deleteMessage(messageId) {
  const messages = activeMessages();
  const index = messages.findIndex((message) => message.id === messageId);

  if (index < 0) {
    return;
  }

  if (!window.confirm("Delete this local message?")) {
    return;
  }

  messages.splice(index, 1);
  saveState();
  renderApp();
  showToast("Message deleted.");
}

function renderDetails() {
  const pinnedMessages = activeMessages().filter((message) => message.pinned);

  roomBrief.textContent = activeRoom().brief;
  accessList.replaceChildren();
  pinnedList.replaceChildren();

  accessItems.forEach((item) => {
    const row = createElement("div", "access-item");
    const dot = createElement("span", "access-dot");
    const copy = createElement("span");
    const title = createElement("strong", "", item.title);
    const text = createElement("span", "", item.text);

    dot.style.background = item.color;
    copy.append(title, text);
    row.append(dot, copy);
    accessList.append(row);
  });

  if (!pinnedMessages.length) {
    pinnedList.append(createElement("p", "empty-copy", "Nothing pinned yet."));
    return;
  }

  pinnedMessages.forEach((message) => {
    const user = findUser(message.authorId);
    const button = createElement("button", "pin-card");
    const author = createElement("strong", "", `${user.name} at ${formatTime(message.createdAt)}`);
    const text = createElement("span", "", message.text);

    button.type = "button";
    button.append(author, text);
    button.addEventListener("click", () => {
      state.view = "pinned";
      messageSearch.value = "";
      saveState();
      renderApp();
    });

    pinnedList.append(button);
  });
}

function renderViewButtons() {
  viewButtons.forEach((button) => {
    const active = button.dataset.view === state.view;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });
}

function renderApp() {
  renderRooms();
  renderHeader();
  renderViewButtons();
  renderMessages();
  renderDetails();
}

function appendComposerText(text) {
  const current = messageInput.value.trim();
  messageInput.value = current ? `${current}\n${text}` : text;
  messageInput.focus();
  setTextareaSize();
}

function sendMessage(event) {
  event.preventDefault();

  const user = currentUser();
  const text = messageInput.value.trim();

  if (!user) {
    showToast("Sign in first.");
    renderAuth();
    return;
  }

  if (!text) {
    showToast("Write a message first.");
    return;
  }

  activeMessages().push({
    id: makeId(),
    authorId: user.id,
    text,
    createdAt: new Date().toISOString(),
    priority: prioritySelect.value,
    needsReply: needsReply.checked,
    pinned: false,
    seenBy: [user.id],
    doneBy: []
  });

  messageInput.value = "";
  prioritySelect.value = "normal";
  needsReply.checked = false;
  setTextareaSize();
  saveState();
  renderApp();
  showToast("Message sent.");
}

function toggleRoomPin() {
  const room = activeRoom();
  const index = state.pinnedRooms.indexOf(room.id);

  if (index >= 0) {
    state.pinnedRooms.splice(index, 1);
    showToast("Room unpinned.");
  } else {
    state.pinnedRooms.push(room.id);
    showToast("Room pinned.");
  }

  saveState();
  renderApp();
}

async function copyRoomSummary() {
  const room = activeRoom();
  const messages = activeMessages();
  const pinned = messages.filter((message) => message.pinned);
  const lines = [
    `${room.name} - ${messages.length} messages`,
    `Brief: ${room.brief}`,
    "",
    "Pinned:",
    pinned.length
      ? pinned.map((message) => `- ${findUser(message.authorId).name}: ${message.text}`).join("\n")
      : "- None"
  ];

  await copyText(lines.join("\n"));
  showToast("Room summary copied.");
}

async function copyText(text) {
  if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Fall back to the older copy command below.
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

function exportChat() {
  const room = activeRoom();
  const payload = {
    room: {
      id: room.id,
      name: room.name,
      brief: room.brief
    },
    exportedAt: new Date().toISOString(),
    messages: activeMessages().map((message) => ({
      ...message,
      author: findUser(message.authorId).name
    }))
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `awesome-delvelment-${room.id}-messages-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast("Chat exported.");
}

function resetData() {
  if (!window.confirm("Reset local messages and sign out?")) {
    return;
  }

  localStorage.removeItem(STORAGE_KEY);
  state = seedState();
  roomSearch.value = "";
  messageSearch.value = "";
  signinCode.value = "";
  saveState();
  renderAuth();
  showToast("Local data reset.");
}

function signIn(event) {
  event.preventDefault();

  const name = signinName.value.trim();
  const code = signinCode.value.trim();

  signinError.textContent = "";

  if (!name) {
    signinError.textContent = "Enter your name.";
    signinName.focus();
    return;
  }

  if (code !== STAFF_CODE) {
    signinError.textContent = "Wrong staff code.";
    signinCode.select();
    return;
  }

  createUser(name);
  signinCode.value = "";
  saveState();
  renderAuth();
  showToast("Signed in.");
}

function signOut() {
  state.currentUserId = "";
  saveState();
  messageInput.value = "";
  signinCode.value = "";
  renderAuth();
  showToast("Signed out.");
}

signinForm.addEventListener("submit", signIn);
signOutButton.addEventListener("click", signOut);
roomSearch.addEventListener("input", renderRooms);
messageSearch.addEventListener("input", renderMessages);

viewButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.view = button.dataset.view;
    saveState();
    renderApp();
  });
});

pinRoomButton.addEventListener("click", toggleRoomPin);
copyRoomButton.addEventListener("click", copyRoomSummary);
composeForm.addEventListener("submit", sendMessage);
messageInput.addEventListener("input", setTextareaSize);

messageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    composeForm.requestSubmit();
  }
});

attachButton.addEventListener("click", () => {
  fileInput.click();
});

fileInput.addEventListener("change", () => {
  const names = [...fileInput.files].map((file) => file.name);

  if (names.length) {
    appendComposerText(`Attached: ${names.join(", ")}`);
  }

  fileInput.value = "";
});

quickReplyButtons.forEach((button) => {
  button.addEventListener("click", () => appendComposerText(button.dataset.insert));
});

exportButton.addEventListener("click", exportChat);
resetButton.addEventListener("click", resetData);

renderAuth();
setTextareaSize();
