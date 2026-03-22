const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const ui = {
  playerNameInput: document.getElementById("playerNameInput"),
  realmCodeInput: document.getElementById("realmCodeInput"),
  createRealmBtn: document.getElementById("createRealmBtn"),
  joinRealmBtn: document.getElementById("joinRealmBtn"),
  leaveRealmBtn: document.getElementById("leaveRealmBtn"),
  togglePassBtn: document.getElementById("togglePassBtn"),
  voiceBtn: document.getElementById("voiceBtn"),
  recordBtn: document.getElementById("recordBtn"),
  summonBossBtn: document.getElementById("summonBossBtn"),
  healBtn: document.getElementById("healBtn"),
  saveWorldBtn: document.getElementById("saveWorldBtn"),
  breakBtn: document.getElementById("breakBtn"),
  placeBtn: document.getElementById("placeBtn"),
  attackBtn: document.getElementById("attackBtn"),
  interactBtn: document.getElementById("interactBtn"),
  hotbar: document.getElementById("hotbar"),
  texturePackList: document.getElementById("texturePackList"),
  mashupList: document.getElementById("mashupList"),
  modsList: document.getElementById("modsList"),
  addonsList: document.getElementById("addonsList"),
  activePackSummary: document.getElementById("activePackSummary"),
  connectionBadge: document.getElementById("connectionBadge"),
  realmValue: document.getElementById("realmValue"),
  playerCount: document.getElementById("playerCount"),
  friendsList: document.getElementById("friendsList"),
  healthValue: document.getElementById("healthValue"),
  voiceStatus: document.getElementById("voiceStatus"),
  recordStatus: document.getElementById("recordStatus"),
  targetInfo: document.getElementById("targetInfo"),
  toolInfo: document.getElementById("toolInfo"),
  buildTubeHint: document.getElementById("buildTubeHint"),
  eventLog: document.getElementById("eventLog"),
  bossBanner: document.getElementById("bossBanner"),
  bossHealthFill: document.getElementById("bossHealthFill"),
  bossHealthText: document.getElementById("bossHealthText"),
  notificationStack: document.getElementById("notificationStack"),
  tutorialPreview: document.getElementById("tutorialPreview"),
  computerModal: document.getElementById("computerModal"),
  closeComputerBtn: document.getElementById("closeComputerBtn"),
  buildTubeList: document.getElementById("buildTubeList"),
  videoTitle: document.getElementById("videoTitle"),
  videoCreator: document.getElementById("videoCreator"),
  videoDescription: document.getElementById("videoDescription"),
  videoSteps: document.getElementById("videoSteps"),
};

const WORLD_WIDTH = 56;
const WORLD_HEIGHT = 40;
const TILE_SIZE = 48;
const PLAYER_RADIUS = 16;
const SPEED = 4.2;
const SAVE_KEY = "awesomecraft.save.v1";
const REALM_PREFIX = "awesomecraft.realm.";
const PLAYER_PREFIX = "awesomecraft.players.";

const paletteLibrary = {
  classic: {
    sky: "#7fd4d4",
    grass: "#57a65f",
    dirt: "#8a5a3c",
    stone: "#6d7682",
    water: "#3b8bd5",
    slime: "#89d94e",
    wood: "#8b5733",
    leaves: "#2f8445",
    glass: "#b8ebff",
    computer: "#8e96bf",
    crystal: "#88c6ff",
    shadow: "rgba(0, 0, 0, 0.22)",
  },
  sunset: {
    sky: "#f0a85f",
    grass: "#8cbc58",
    dirt: "#8f5939",
    stone: "#80726e",
    water: "#5475d9",
    slime: "#d5d342",
    wood: "#9b6137",
    leaves: "#587d35",
    glass: "#ffe8b5",
    computer: "#b497d6",
    crystal: "#ffddb6",
    shadow: "rgba(0, 0, 0, 0.25)",
  },
  blueprint: {
    sky: "#5ea0d8",
    grass: "#5dd8c3",
    dirt: "#0f3d56",
    stone: "#3f5f7a",
    water: "#1d6cff",
    slime: "#8affb2",
    wood: "#4c8f91",
    leaves: "#44b594",
    glass: "#d5fbff",
    computer: "#e7f0ff",
    crystal: "#75d8ff",
    shadow: "rgba(2, 14, 26, 0.3)",
  },
};

const blockLibrary = [
  { id: "stone", label: "Stone Block", colorKey: "stone", solid: true },
  { id: "wood", label: "Wood Block", colorKey: "wood", solid: true },
  { id: "glass", label: "Glass Block", colorKey: "glass", solid: true },
  { id: "computer", label: "Computer", colorKey: "computer", solid: true },
  { id: "slime", label: "Slime Brick", colorKey: "slime", solid: true },
];

const texturePacks = [
  { id: "classic", name: "Classic Crisp", description: "Chunky bright colors with clean blocks.", premium: false },
  { id: "sunset", name: "Golden Sunset", description: "Warm skies, soft stone, glow-water.", premium: false },
  { id: "blueprint", name: "BuildGrid XT", description: "Technical blueprints for megaprojects.", premium: true },
];

const mashupPacks = [
  {
    id: "frontier",
    name: "Slime Frontier",
    description: "Marshland ruins and a boss arena in the east.",
    premium: false,
    videos: [
      {
        id: "tower",
        title: "Slime-proof Tower",
        creator: "Builder Bran",
        description: "A tall survival tower that keeps bouncing mobs off your walls.",
        steps: ["Lay a 6x6 stone base.", "Alternate wood and glass every second layer.", "Cap the roof with slime bricks for bounce defense."],
      },
      {
        id: "hub",
        title: "Pocket Realm Hub",
        creator: "RealmRider",
        description: "A quick spawn hub that shows off multiplayer realm arrivals.",
        steps: ["Place two computers by the door.", "Build a glass ring around the plaza.", "Use slime blocks to frame your realm portal."],
      },
      {
        id: "farm",
        title: "Floating Marsh Farm",
        creator: "CropPilot",
        description: "A small platform farm that clears the waterline.",
        steps: ["Stack stone pillars four blocks high.", "Bridge them with wood planks.", "Fence the edge with glass and keep one ladder side."],
      },
    ],
  },
  {
    id: "candy",
    name: "Candy Crash",
    description: "Sugary colors, glossy blocks, and playful tutorials.",
    premium: true,
    videos: [
      {
        id: "candy-castle",
        title: "Candy Castle Gate",
        creator: "Marzipan Mia",
        description: "Bright starter walls with striped towers.",
        steps: ["Use alternating glass and slime blocks.", "Create wide front stairs.", "Finish with a twin-tower roofline."],
      },
      {
        id: "gumdrop",
        title: "Gumdrop Garden",
        creator: "Sweet Architect",
        description: "Decorate your spawn with rounded mini domes.",
        steps: ["Circle stone blocks into a flower bed.", "Add glass on top like candy glaze.", "Drop a computer inside as your media kiosk."],
      },
    ],
  },
  {
    id: "retro",
    name: "Retro Neon",
    description: "Arcade colors, glowing stone, and synth arena vibes.",
    premium: true,
    videos: [
      {
        id: "arena",
        title: "Neon Boss Arena",
        creator: "Grid Pulse",
        description: "An open platform tuned for boss fights and streaming.",
        steps: ["Flatten the ground with stone.", "Ring the edge with glass.", "Place computers in each corner for BuildTube replays."],
      },
    ],
  },
];

const mods = [
  { id: "slime-splitter", name: "Slime Splitter", description: "Sword attacks deal bonus damage.", premium: false },
  { id: "builder-boots", name: "Builder Boots", description: "Move faster around the world.", premium: false },
  { id: "bounce-core", name: "Bounce Core", description: "Slime blocks launch you a little farther.", premium: true },
];

const addons = [
  { id: "computer-labs", name: "Computer Labs", description: "More computers spawn across the map.", premium: false },
  { id: "crystal-caves", name: "Crystal Caves", description: "Crystal nodes appear in stone regions.", premium: true },
  { id: "mashup-posters", name: "Mash-Up Posters", description: "BuildTube gets themed creator picks.", premium: true },
];

const input = {
  up: false,
  down: false,
  left: false,
  right: false,
};

const state = {
  playerId: crypto.randomUUID(),
  playerName: "BuilderOne",
  marketplacePass: true,
  activeTexturePack: "classic",
  activeMashup: "frontier",
  activeMods: new Set(["slime-splitter"]),
  activeAddons: new Set(["computer-labs"]),
  selectedSlot: 0,
  world: [],
  spawnPoint: { x: 6, y: 6 },
  player: {
    x: 6 * TILE_SIZE + TILE_SIZE / 2,
    y: 6 * TILE_SIZE + TILE_SIZE / 2,
    hp: 20,
    maxHp: 20,
    color: "#f7f39a",
    facing: "down",
    attackCooldown: 0,
  },
  players: {},
  realm: {
    code: "",
    isHost: false,
    channel: null,
    connected: false,
    friends: {},
  },
  boss: {
    x: 45 * TILE_SIZE + TILE_SIZE / 2,
    y: 12 * TILE_SIZE + TILE_SIZE / 2,
    hp: 100,
    maxHp: 100,
    awake: false,
    defeated: false,
    bounceTimer: 0,
    velocityX: 0,
    velocityY: 0,
  },
  camera: { x: 0, y: 0 },
  targetTile: null,
  logs: [],
  notifications: [],
  recording: {
    active: false,
    recorder: null,
    chunks: [],
  },
  voice: {
    enabled: false,
    stream: null,
    recorder: null,
  },
  buildTubeSelection: null,
  lastTick: 0,
};

function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function gridToPixel(value) {
  return value * TILE_SIZE + TILE_SIZE / 2;
}

function pixelToGrid(value) {
  return Math.floor(value / TILE_SIZE);
}

function worldAtFrom(world, x, y) {
  if (x < 0 || y < 0 || x >= WORLD_WIDTH || y >= WORLD_HEIGHT) {
    return null;
  }
  return world[y][x];
}

function worldAt(x, y) {
  return worldAtFrom(state.world, x, y);
}

function createTile(floor = "grass", object = null) {
  return { floor, object };
}

function placeComputers(world, count) {
  let placed = 0;
  while (placed < count) {
    const x = Math.floor(randomRange(5, WORLD_WIDTH - 5));
    const y = Math.floor(randomRange(5, WORLD_HEIGHT - 5));
    const tile = worldAtFrom(world, x, y);
    if (tile && tile.floor !== "water" && !tile.object) {
      tile.object = "computer";
      placed += 1;
    }
  }
}

function placeCrystals(world, count) {
  let placed = 0;
  while (placed < count) {
    const x = Math.floor(randomRange(5, WORLD_WIDTH - 5));
    const y = Math.floor(randomRange(5, WORLD_HEIGHT - 5));
    const tile = worldAtFrom(world, x, y);
    if (tile && tile.object === "stone") {
      tile.object = "crystal";
      placed += 1;
    }
  }
}

function createWorld() {
  const world = [];

  for (let y = 0; y < WORLD_HEIGHT; y += 1) {
    const row = [];
    for (let x = 0; x < WORLD_WIDTH; x += 1) {
      const edge = x < 3 || y < 3 || x > WORLD_WIDTH - 4 || y > WORLD_HEIGHT - 4;
      row.push(createTile(edge ? "stone" : "grass"));
    }
    world.push(row);
  }

  for (let i = 0; i < 8; i += 1) {
    const pondX = Math.floor(randomRange(6, WORLD_WIDTH - 8));
    const pondY = Math.floor(randomRange(6, WORLD_HEIGHT - 8));
    for (let y = pondY; y < pondY + 3; y += 1) {
      for (let x = pondX; x < pondX + 4; x += 1) {
        if (worldAtFrom(world, x, y)) {
          world[y][x].floor = "water";
        }
      }
    }
  }

  for (let i = 0; i < 14; i += 1) {
    const stoneX = Math.floor(randomRange(4, WORLD_WIDTH - 4));
    const stoneY = Math.floor(randomRange(4, WORLD_HEIGHT - 4));
    const tile = worldAtFrom(world, stoneX, stoneY);
    if (tile && tile.floor !== "water") {
      tile.object = "stone";
    }
  }

  for (let i = 0; i < 10; i += 1) {
    const treeX = Math.floor(randomRange(4, WORLD_WIDTH - 4));
    const treeY = Math.floor(randomRange(4, WORLD_HEIGHT - 4));
    const tile = worldAtFrom(world, treeX, treeY);
    if (tile && tile.floor === "grass") {
      tile.object = Math.random() > 0.4 ? "wood" : "leaves";
    }
  }

  for (let y = 8; y < 17; y += 1) {
    for (let x = 38; x < 52; x += 1) {
      const tile = world[y][x];
      tile.floor = (x + y) % 2 === 0 ? "slime" : "stone";
    }
  }

  world[12][44].object = "altar";
  world[12][45].object = "slime";
  world[11][44].object = "stone";
  world[11][45].object = "stone";
  world[13][44].object = "stone";
  world[13][45].object = "stone";

  placeComputers(world, state.activeAddons.has("computer-labs") ? 6 : 3);
  if (state.activeAddons.has("crystal-caves")) {
    placeCrystals(world, 10);
  }

  return world;
}

function resetWorld() {
  state.world = createWorld();
  state.spawnPoint = { x: 6, y: 6 };
  state.player.x = gridToPixel(state.spawnPoint.x);
  state.player.y = gridToPixel(state.spawnPoint.y);
  state.boss = {
    x: gridToPixel(45),
    y: gridToPixel(12),
    hp: 100,
    maxHp: 100,
    awake: false,
    defeated: false,
    bounceTimer: 0,
    velocityX: 0,
    velocityY: 0,
  };
}

function getPalette() {
  return paletteLibrary[state.activeTexturePack] || paletteLibrary.classic;
}

function getCurrentVideos() {
  const mashup = mashupPacks.find((entry) => entry.id === state.activeMashup) || mashupPacks[0];
  return mashup.videos;
}

function getModifiers() {
  return {
    damage: state.activeMods.has("slime-splitter") ? 8 : 5,
    speed: SPEED + (state.activeMods.has("builder-boots") ? 1.1 : 0),
    bounce: state.activeMods.has("bounce-core") ? 1.5 : 1,
  };
}

function isSolidObject(objectId) {
  return ["stone", "wood", "glass", "computer", "slime", "altar", "crystal"].includes(objectId);
}

function tileBlocked(gridX, gridY) {
  const tile = worldAt(gridX, gridY);
  if (!tile) {
    return true;
  }
  if (tile.floor === "water") {
    return true;
  }
  if (tile.object && isSolidObject(tile.object)) {
    return true;
  }
  return false;
}

function playerCanMove(nextX, nextY) {
  const gridX = pixelToGrid(nextX);
  const gridY = pixelToGrid(nextY);
  return !tileBlocked(gridX, gridY);
}

function addLog(message) {
  const entry = {
    id: crypto.randomUUID(),
    message,
  };
  state.logs.unshift(entry);
  state.logs = state.logs.slice(0, 18);
  renderEventLog();
}

function pushNotification(message) {
  const note = {
    id: crypto.randomUUID(),
    message,
  };
  state.notifications.push(note);
  renderNotifications();
  setTimeout(() => {
    state.notifications = state.notifications.filter((item) => item.id !== note.id);
    renderNotifications();
  }, 2400);
}

function renderNotifications() {
  ui.notificationStack.innerHTML = "";
  state.notifications.forEach((item) => {
    const node = document.createElement("div");
    node.className = "toast";
    node.textContent = item.message;
    ui.notificationStack.appendChild(node);
  });
}

function renderEventLog() {
  ui.eventLog.innerHTML = "";
  state.logs.forEach((entry) => {
    const node = document.createElement("div");
    node.className = "log-entry";
    node.textContent = entry.message;
    ui.eventLog.appendChild(node);
  });
}

function activeBlock() {
  return blockLibrary[state.selectedSlot];
}

function renderHotbar() {
  ui.hotbar.innerHTML = "";
  blockLibrary.forEach((block, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `hotbar-slot ${state.selectedSlot === index ? "selected" : ""}`;
    button.addEventListener("click", () => {
      state.selectedSlot = index;
      updateHud();
      renderHotbar();
    });
    const swatch = document.createElement("div");
    swatch.className = "swatch";
    swatch.style.background = getPalette()[block.colorKey];
    const label = document.createElement("div");
    label.className = "slot-name";
    label.textContent = block.label;
    button.appendChild(swatch);
    button.appendChild(label);
    ui.hotbar.appendChild(button);
  });
}

function renderPackList(root, items, activeId, handler) {
  root.innerHTML = "";
  items.forEach((pack) => {
    const locked = pack.premium && !state.marketplacePass;
    const card = document.createElement("button");
    card.type = "button";
    card.className = `pack-card ${pack.id === activeId ? "active" : ""} ${locked ? "locked" : ""}`;
    card.disabled = locked;
    card.innerHTML = `<h4>${pack.name}</h4><p>${pack.description}</p>`;
    card.addEventListener("click", () => {
      handler(pack);
      syncRealmSnapshot();
      renderContentLibrary();
    });
    root.appendChild(card);
  });
}

function renderTogglePackList(root, items, targetSet, resetsWorld = false) {
  root.innerHTML = "";
  items.forEach((pack) => {
    const locked = pack.premium && !state.marketplacePass;
    const card = document.createElement("button");
    card.type = "button";
    card.className = `pack-card ${targetSet.has(pack.id) ? "active" : ""} ${locked ? "locked" : ""}`;
    card.disabled = locked;
    card.innerHTML = `<h4>${pack.name}</h4><p>${pack.description}</p>`;
    card.addEventListener("click", () => {
      if (targetSet.has(pack.id)) {
        targetSet.delete(pack.id);
        pushNotification(`${pack.name} disabled.`);
      } else {
        targetSet.add(pack.id);
        pushNotification(`${pack.name} enabled.`);
      }
      if (resetsWorld) {
        resetWorld();
      }
      syncRealmSnapshot();
      renderContentLibrary();
      renderHotbar();
      updateHud();
    });
    root.appendChild(card);
  });
}

function renderContentLibrary() {
  renderPackList(ui.texturePackList, texturePacks, state.activeTexturePack, (pack) => {
    state.activeTexturePack = pack.id;
    renderHotbar();
    updateHud();
    pushNotification(`${pack.name} enabled.`);
  });

  renderPackList(ui.mashupList, mashupPacks, state.activeMashup, (pack) => {
    state.activeMashup = pack.id;
    ui.tutorialPreview.textContent = `Featured: ${pack.videos.map((item) => item.title).join(", ")}.`;
    renderBuildTube();
    updateHud();
    pushNotification(`${pack.name} mash-up loaded.`);
  });

  renderTogglePackList(ui.modsList, mods, state.activeMods);
  renderTogglePackList(ui.addonsList, addons, state.activeAddons, true);
}

function getRemotePlayers() {
  return Object.values(state.players).filter((player) => player.id !== state.playerId);
}

function renderFriends() {
  ui.friendsList.innerHTML = "";
  const players = getRemotePlayers();
  if (!players.length) {
    const empty = document.createElement("div");
    empty.className = "friend-card";
    empty.innerHTML = "<h4>No realm friends yet</h4><p>Create or join a realm, then mark friends for voice chat.</p>";
    ui.friendsList.appendChild(empty);
  }

  players.forEach((player) => {
    const card = document.createElement("div");
    card.className = "friend-card";
    const isFriend = Boolean(state.realm.friends[player.id]);
    card.innerHTML = `<h4>${player.name}</h4><p>${isFriend ? "Friend voice enabled" : "Muted until friended"}</p>`;
    const action = document.createElement("button");
    action.type = "button";
    action.textContent = isFriend ? "Remove Friend" : "Add Friend";
    action.className = isFriend ? "ghost" : "primary";
    action.addEventListener("click", () => {
      if (isFriend) {
        delete state.realm.friends[player.id];
      } else {
        state.realm.friends[player.id] = true;
      }
      updateHud();
      renderFriends();
      syncSelfPresence();
    });
    card.appendChild(action);
    ui.friendsList.appendChild(card);
  });
}

function renderBuildTube() {
  ui.buildTubeList.innerHTML = "";
  const videos = getCurrentVideos();
  const activeId = state.buildTubeSelection || videos[0]?.id;
  state.buildTubeSelection = activeId;

  videos.forEach((video) => {
    const node = document.createElement("button");
    node.type = "button";
    node.className = `buildtube-item ${video.id === activeId ? "active" : ""}`;
    node.innerHTML = `<h4>${video.title}</h4><p>${video.creator}</p>`;
    node.addEventListener("click", () => {
      state.buildTubeSelection = video.id;
      showVideo(video.id);
      renderBuildTube();
    });
    ui.buildTubeList.appendChild(node);
  });

  showVideo(activeId);
}

function showVideo(videoId) {
  const video = getCurrentVideos().find((item) => item.id === videoId) || getCurrentVideos()[0];
  if (!video) {
    return;
  }

  ui.videoTitle.textContent = video.title;
  ui.videoCreator.textContent = `by ${video.creator}`;
  ui.videoDescription.textContent = video.description;
  ui.videoSteps.innerHTML = "";
  video.steps.forEach((step, index) => {
    const node = document.createElement("div");
    node.className = "step-card";
    node.textContent = `${index + 1}. ${step}`;
    ui.videoSteps.appendChild(node);
  });
}

function nearestComputerTile() {
  const originX = pixelToGrid(state.player.x);
  const originY = pixelToGrid(state.player.y);
  for (let y = originY - 1; y <= originY + 1; y += 1) {
    for (let x = originX - 1; x <= originX + 1; x += 1) {
      const tile = worldAt(x, y);
      if (tile?.object === "computer") {
        return { x, y };
      }
    }
  }
  return null;
}

function openComputerModal() {
  if (typeof ui.computerModal.showModal === "function") {
    ui.computerModal.showModal();
  } else {
    ui.computerModal.setAttribute("open", "open");
  }
}

function closeComputerModal() {
  if (typeof ui.computerModal.close === "function") {
    ui.computerModal.close();
  } else {
    ui.computerModal.removeAttribute("open");
  }
}

function updateHud() {
  ui.healthValue.textContent = `${Math.ceil(state.player.hp)} / ${state.player.maxHp}`;
  ui.realmValue.textContent = state.realm.connected ? state.realm.code : "Solo";
  ui.connectionBadge.textContent = state.realm.connected ? (state.realm.isHost ? "Realm Host" : "Realm Guest") : "Offline";
  ui.playerCount.textContent = `${getRemotePlayers().length + 1} online`;
  ui.voiceStatus.textContent = state.voice.enabled ? "Friends only active" : "Friends only";
  ui.recordStatus.textContent = state.recording.active ? "Recording" : "Ready";
  ui.toolInfo.textContent = activeBlock().label;
  ui.activePackSummary.textContent = `${texturePacks.find((pack) => pack.id === state.activeTexturePack)?.name || "Classic"} + ${mashupPacks.find((pack) => pack.id === state.activeMashup)?.name || "Frontier"}`;
  ui.buildTubeHint.textContent = nearestComputerTile() ? "Computer in reach" : "Find a computer";
  if (state.targetTile) {
    const tile = worldAt(state.targetTile.x, state.targetTile.y);
    const label = tile?.object || tile?.floor || "Unknown";
    ui.targetInfo.textContent = `${state.targetTile.x},${state.targetTile.y} ${label}`;
  } else {
    ui.targetInfo.textContent = "Select a tile";
  }
  ui.bossHealthFill.style.width = `${(state.boss.hp / state.boss.maxHp) * 100}%`;
  ui.bossHealthText.textContent = `${Math.max(0, Math.ceil(state.boss.hp))} / ${state.boss.maxHp}`;
  ui.bossBanner.classList.toggle("hidden", !state.boss.awake || state.boss.defeated);
}

function drawRoundedRect(x, y, width, height, radius, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
  ctx.fill();
}

function drawObject(objectId, screenX, screenY, palette) {
  const colorMap = {
    stone: palette.stone,
    wood: palette.wood,
    glass: palette.glass,
    computer: palette.computer,
    slime: palette.slime,
    altar: "#ffcb77",
    leaves: palette.leaves,
    crystal: palette.crystal,
  };

  drawRoundedRect(screenX + 7, screenY + 7, TILE_SIZE - 14, TILE_SIZE - 14, 10, colorMap[objectId] || palette.stone);
  ctx.fillStyle = palette.shadow;
  ctx.fillRect(screenX + 10, screenY + TILE_SIZE - 12, TILE_SIZE - 20, 6);

  if (objectId === "computer") {
    ctx.fillStyle = "#091822";
    ctx.fillRect(screenX + 13, screenY + 13, TILE_SIZE - 26, TILE_SIZE - 23);
    ctx.fillStyle = "#78f6d1";
    ctx.fillRect(screenX + 16, screenY + 16, TILE_SIZE - 32, TILE_SIZE - 29);
  }

  if (objectId === "crystal") {
    ctx.fillStyle = "#e8fbff";
    ctx.beginPath();
    ctx.moveTo(screenX + TILE_SIZE / 2, screenY + 8);
    ctx.lineTo(screenX + TILE_SIZE - 12, screenY + TILE_SIZE / 2);
    ctx.lineTo(screenX + TILE_SIZE / 2, screenY + TILE_SIZE - 8);
    ctx.lineTo(screenX + 12, screenY + TILE_SIZE / 2);
    ctx.closePath();
    ctx.fill();
  }

  if (objectId === "altar") {
    ctx.fillStyle = "#8c2f39";
    ctx.fillRect(screenX + 12, screenY + 18, TILE_SIZE - 24, TILE_SIZE - 26);
  }
}

function drawTile(tile, screenX, screenY, palette, gridX, gridY) {
  ctx.fillStyle = palette[tile.floor] || palette.grass;
  ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
  ctx.strokeRect(screenX, screenY, TILE_SIZE, TILE_SIZE);

  if (tile.floor === "water") {
    ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
    ctx.fillRect(screenX + 6, screenY + 10, TILE_SIZE - 12, 6);
  }

  if (tile.object) {
    drawObject(tile.object, screenX, screenY, palette);
  }

  if (state.targetTile && state.targetTile.x === gridX && state.targetTile.y === gridY) {
    ctx.strokeStyle = "#ffe799";
    ctx.lineWidth = 3;
    ctx.strokeRect(screenX + 2, screenY + 2, TILE_SIZE - 4, TILE_SIZE - 4);
    ctx.lineWidth = 1;
  }
}

function drawPlayers() {
  const allPlayers = [
    { id: state.playerId, x: state.player.x, y: state.player.y, color: state.player.color, name: state.playerName },
    ...getRemotePlayers(),
  ];

  allPlayers.forEach((player) => {
    const screenX = player.x - state.camera.x;
    const screenY = player.y - state.camera.y;
    ctx.fillStyle = player.color || "#f7f39a";
    ctx.beginPath();
    ctx.arc(screenX, screenY, PLAYER_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#13232f";
    ctx.beginPath();
    ctx.arc(screenX, screenY - 5, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = "12px Trebuchet MS";
    ctx.textAlign = "center";
    ctx.fillStyle = "#f8ffef";
    ctx.fillText(player.name, screenX, screenY - 22);
  });
}

function drawBoss(palette) {
  if (state.boss.defeated) {
    return;
  }

  const screenX = state.boss.x - state.camera.x;
  const screenY = state.boss.y - state.camera.y;
  const radius = state.boss.awake ? 38 : 30;
  ctx.fillStyle = palette.slime;
  ctx.beginPath();
  ctx.arc(screenX, screenY, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.22)";
  ctx.beginPath();
  ctx.arc(screenX - 10, screenY - 8, 12, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#18381e";
  ctx.beginPath();
  ctx.arc(screenX - 12, screenY - 4, 5, 0, Math.PI * 2);
  ctx.arc(screenX + 12, screenY - 4, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(screenX - 16, screenY + 10, 32, 6);
}

function drawCrosshair() {
  const palette = getPalette();
  const playerScreenX = state.player.x - state.camera.x;
  const playerScreenY = state.player.y - state.camera.y;
  ctx.strokeStyle = palette.shadow;
  ctx.strokeRect(playerScreenX - 22, playerScreenY - 22, 44, 44);
}

function renderWorld() {
  const palette = getPalette();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = palette.sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const visibleTilesX = Math.ceil(canvas.width / TILE_SIZE) + 2;
  const visibleTilesY = Math.ceil(canvas.height / TILE_SIZE) + 2;
  const startX = clamp(Math.floor(state.camera.x / TILE_SIZE), 0, WORLD_WIDTH - visibleTilesX);
  const startY = clamp(Math.floor(state.camera.y / TILE_SIZE), 0, WORLD_HEIGHT - visibleTilesY);

  for (let y = startY; y < startY + visibleTilesY; y += 1) {
    for (let x = startX; x < startX + visibleTilesX; x += 1) {
      const tile = worldAt(x, y);
      if (!tile) {
        continue;
      }
      const screenX = x * TILE_SIZE - state.camera.x;
      const screenY = y * TILE_SIZE - state.camera.y;
      drawTile(tile, screenX, screenY, palette, x, y);
    }
  }

  drawBoss(palette);
  drawPlayers();
  drawCrosshair();
}

function updateCamera() {
  state.camera.x = clamp(state.player.x - canvas.width / 2, 0, WORLD_WIDTH * TILE_SIZE - canvas.width);
  state.camera.y = clamp(state.player.y - canvas.height / 2, 0, WORLD_HEIGHT * TILE_SIZE - canvas.height);
}

function updatePlayer(dt) {
  const modifiers = getModifiers();
  const standingTile = worldAt(pixelToGrid(state.player.x), pixelToGrid(state.player.y));
  const slimeBoost = standingTile?.floor === "slime" || standingTile?.object === "slime" ? modifiers.bounce : 1;
  const moveX = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  const moveY = (input.down ? 1 : 0) - (input.up ? 1 : 0);
  const magnitude = Math.hypot(moveX, moveY) || 1;
  const velocityX = (moveX / magnitude) * modifiers.speed * slimeBoost * TILE_SIZE * dt;
  const velocityY = (moveY / magnitude) * modifiers.speed * slimeBoost * TILE_SIZE * dt;

  const nextX = state.player.x + velocityX;
  const nextY = state.player.y + velocityY;

  if (moveX || moveY) {
    if (Math.abs(moveX) > Math.abs(moveY)) {
      state.player.facing = moveX > 0 ? "right" : "left";
    } else {
      state.player.facing = moveY > 0 ? "down" : "up";
    }
  }

  if (playerCanMove(nextX, state.player.y)) {
    state.player.x = nextX;
  }
  if (playerCanMove(state.player.x, nextY)) {
    state.player.y = nextY;
  }

  state.player.attackCooldown = Math.max(0, state.player.attackCooldown - dt);
  updateCamera();
}

function awakenBoss() {
  if (state.boss.awake || state.boss.defeated) {
    return;
  }
  state.boss.awake = true;
  addLog("The Giga Slime wakes with 100 health.");
  pushNotification("Giga Slime awakened.");
  updateHud();
  syncRealmSnapshot();
}

function respawnPlayer() {
  state.player.hp = state.player.maxHp;
  state.player.x = gridToPixel(state.spawnPoint.x);
  state.player.y = gridToPixel(state.spawnPoint.y);
  addLog("You were slimed. Respawning at the camp.");
  pushNotification("Respawned at base camp.");
}

function updateBoss(dt) {
  if (state.boss.defeated) {
    return;
  }

  const dx = state.player.x - state.boss.x;
  const dy = state.player.y - state.boss.y;
  const distance = Math.hypot(dx, dy);
  if (distance < TILE_SIZE * 7 && !state.boss.awake) {
    awakenBoss();
  }

  if (!state.boss.awake) {
    return;
  }

  state.boss.bounceTimer += dt;
  if (state.boss.bounceTimer > 0.85) {
    state.boss.bounceTimer = 0;
    const dirX = distance ? dx / distance : 0;
    const dirY = distance ? dy / distance : 0;
    state.boss.velocityX = dirX * TILE_SIZE * 2.2;
    state.boss.velocityY = dirY * TILE_SIZE * 2.2;
  }

  const nextX = state.boss.x + state.boss.velocityX * dt;
  const nextY = state.boss.y + state.boss.velocityY * dt;
  const nextGridX = pixelToGrid(nextX);
  const nextGridY = pixelToGrid(nextY);

  if (!tileBlocked(nextGridX, nextGridY)) {
    state.boss.x = nextX;
    state.boss.y = nextY;
  } else {
    state.boss.velocityX *= -0.45;
    state.boss.velocityY *= -0.45;
  }

  if (distance < 52) {
    state.player.hp = clamp(state.player.hp - 6 * dt, 0, state.player.maxHp);
    if (state.player.hp <= 0) {
      respawnPlayer();
    }
  }
}

function attack() {
  if (state.player.attackCooldown > 0) {
    return;
  }
  state.player.attackCooldown = 0.28;

  const distance = Math.hypot(state.player.x - state.boss.x, state.player.y - state.boss.y);
  if (state.boss.awake && !state.boss.defeated && distance < 70) {
    state.boss.hp = clamp(state.boss.hp - getModifiers().damage, 0, state.boss.maxHp);
    addLog(`You hit the Giga Slime for ${getModifiers().damage} damage.`);
    if (state.boss.hp <= 0) {
      state.boss.defeated = true;
      state.boss.awake = false;
      pushNotification("Giga Slime defeated.");
      addLog("Victory! The final slime boss is down.");
    }
    syncRealmSnapshot();
  } else {
    pushNotification("Swing! No boss in range.");
  }
  updateHud();
}

function facingGrid() {
  const originX = pixelToGrid(state.player.x);
  const originY = pixelToGrid(state.player.y);
  if (state.player.facing === "up") {
    return { x: originX, y: originY - 1 };
  }
  if (state.player.facing === "down") {
    return { x: originX, y: originY + 1 };
  }
  if (state.player.facing === "left") {
    return { x: originX - 1, y: originY };
  }
  return { x: originX + 1, y: originY };
}

function selectedGrid() {
  return state.targetTile || facingGrid();
}

function breakTile() {
  const target = selectedGrid();
  const tile = worldAt(target.x, target.y);
  if (!tile) {
    return;
  }
  if (!tile.object) {
    pushNotification("Nothing to break.");
    return;
  }
  if (tile.object === "altar") {
    pushNotification("The altar is locked in place.");
    return;
  }

  const removed = tile.object;
  tile.object = null;
  addLog(`${removed} block broken.`);
  pushNotification(`Removed ${removed}.`);
  syncRealmSnapshot();
}

function placeTile() {
  const target = selectedGrid();
  const tile = worldAt(target.x, target.y);
  if (!tile) {
    return;
  }
  const playerTileX = pixelToGrid(state.player.x);
  const playerTileY = pixelToGrid(state.player.y);
  if (playerTileX === target.x && playerTileY === target.y) {
    pushNotification("Step aside before placing a block.");
    return;
  }
  if (tile.floor === "water") {
    pushNotification("This spot is too watery.");
    return;
  }
  if (tile.object) {
    pushNotification("Target tile already occupied.");
    return;
  }

  const block = activeBlock();
  tile.object = block.id;
  addLog(`${block.label} placed.`);
  pushNotification(`Placed ${block.label}.`);
  syncRealmSnapshot();
}

function interact() {
  const computer = nearestComputerTile();
  if (computer) {
    openComputerModal();
    renderBuildTube();
    addLog("Opened BuildTube on a computer block.");
    return;
  }

  const target = selectedGrid();
  const tile = worldAt(target.x, target.y);
  if (tile?.object === "altar") {
    awakenBoss();
    return;
  }

  pushNotification("Nothing special to interact with here.");
}

function handleCanvasPointer(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const canvasX = (clientX - rect.left) * scaleX;
  const canvasY = (clientY - rect.top) * scaleY;
  const worldX = canvasX + state.camera.x;
  const worldY = canvasY + state.camera.y;
  state.targetTile = { x: pixelToGrid(worldX), y: pixelToGrid(worldY) };
  updateHud();
}

function resizeCanvas() {
  const bounds = canvas.getBoundingClientRect();
  canvas.width = Math.floor(bounds.width);
  canvas.height = Math.floor(bounds.height);
  updateCamera();
}

function saveWorld() {
  const payload = {
    playerName: state.playerName,
    marketplacePass: state.marketplacePass,
    activeTexturePack: state.activeTexturePack,
    activeMashup: state.activeMashup,
    activeMods: [...state.activeMods],
    activeAddons: [...state.activeAddons],
    world: state.world,
    player: state.player,
    boss: state.boss,
  };
  localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
  addLog("World saved locally.");
  pushNotification("World saved.");
}

function loadWorld() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) {
    resetWorld();
    return;
  }

  try {
    const payload = JSON.parse(raw);
    state.playerName = payload.playerName || state.playerName;
    state.marketplacePass = payload.marketplacePass ?? true;
    state.activeTexturePack = payload.activeTexturePack || "classic";
    state.activeMashup = payload.activeMashup || "frontier";
    state.activeMods = new Set(payload.activeMods || ["slime-splitter"]);
    state.activeAddons = new Set(payload.activeAddons || ["computer-labs"]);
    state.world = payload.world || createWorld();
    state.player = {
      ...state.player,
      ...(payload.player || {}),
    };
    state.boss = {
      ...state.boss,
      ...(payload.boss || {}),
    };
  } catch (error) {
    resetWorld();
    addLog("Saved world could not be loaded, so a new map was created.");
  }
}

function readRealmSnapshot() {
  if (!state.realm.code) {
    return null;
  }
  const raw = localStorage.getItem(`${REALM_PREFIX}${state.realm.code}`);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

function writeRealmSnapshot(snapshot) {
  if (!state.realm.code) {
    return;
  }
  localStorage.setItem(`${REALM_PREFIX}${state.realm.code}`, JSON.stringify(snapshot));
}

function getPlayerStoreKey() {
  return `${PLAYER_PREFIX}${state.realm.code}`;
}

function readRealmPlayers() {
  if (!state.realm.code) {
    return {};
  }
  const raw = localStorage.getItem(getPlayerStoreKey());
  if (!raw) {
    return {};
  }
  try {
    return JSON.parse(raw);
  } catch (error) {
    return {};
  }
}

function writeRealmPlayers(players) {
  if (!state.realm.code) {
    return;
  }
  localStorage.setItem(getPlayerStoreKey(), JSON.stringify(players));
}

function setupRealmChannel() {
  if (!("BroadcastChannel" in window) || !state.realm.code) {
    return;
  }
  state.realm.channel?.close();
  state.realm.channel = new BroadcastChannel(`awesomecraft-${state.realm.code}`);
  state.realm.channel.onmessage = (event) => handleRealmMessage(event.data);
}

function applyRealmSnapshot(snapshot) {
  if (!snapshot) {
    return;
  }
  state.world = snapshot.world || state.world;
  state.boss = snapshot.boss || state.boss;
  state.activeTexturePack = snapshot.activeTexturePack || state.activeTexturePack;
  state.activeMashup = snapshot.activeMashup || state.activeMashup;
  state.activeMods = new Set(snapshot.activeMods || [...state.activeMods]);
  state.activeAddons = new Set(snapshot.activeAddons || [...state.activeAddons]);
  renderContentLibrary();
  renderHotbar();
  renderBuildTube();
  updateHud();
}

function refreshRealmPlayers() {
  state.players = readRealmPlayers();
  updateHud();
  renderFriends();
}

function syncRealmSnapshot() {
  if (!state.realm.connected || !state.realm.isHost) {
    return;
  }
  const snapshot = {
    world: state.world,
    boss: state.boss,
    activeTexturePack: state.activeTexturePack,
    activeMashup: state.activeMashup,
    activeMods: [...state.activeMods],
    activeAddons: [...state.activeAddons],
    hostId: state.playerId,
    updatedAt: Date.now(),
  };
  writeRealmSnapshot(snapshot);
  state.realm.channel?.postMessage({ type: "snapshot", from: state.playerId, payload: snapshot });
}

function syncSelfPresence() {
  if (!state.realm.connected) {
    return;
  }
  const players = readRealmPlayers();
  players[state.playerId] = {
    id: state.playerId,
    x: state.player.x,
    y: state.player.y,
    name: state.playerName,
    color: state.player.color,
    friends: state.realm.friends,
    hp: state.player.hp,
    updatedAt: Date.now(),
  };
  writeRealmPlayers(players);
  state.realm.channel?.postMessage({ type: "ping", from: state.playerId });
  refreshRealmPlayers();
}

function handleRealmMessage(message) {
  if (!message || message.from === state.playerId) {
    return;
  }

  if (message.type === "snapshot" && !state.realm.isHost) {
    applyRealmSnapshot(message.payload);
  }

  if (message.type === "voice" && state.voice.enabled) {
    playVoiceMessage(message);
  }

  if (message.type === "ping") {
    refreshRealmPlayers();
  }
}

function createRealm() {
  const code = (ui.realmCodeInput.value.trim() || "SLIME01").toUpperCase();
  state.realm.code = code;
  state.realm.connected = true;
  state.realm.isHost = true;
  setupRealmChannel();
  syncRealmSnapshot();
  syncSelfPresence();
  addLog(`Realm ${code} created.`);
  pushNotification(`Realm ${code} online.`);
  updateHud();
  renderFriends();
}

function joinRealm() {
  const code = ui.realmCodeInput.value.trim().toUpperCase();
  if (!code) {
    pushNotification("Enter a realm code first.");
    return;
  }

  state.realm.code = code;
  state.realm.connected = true;
  state.realm.isHost = false;
  setupRealmChannel();
  const snapshot = readRealmSnapshot();
  if (snapshot) {
    applyRealmSnapshot(snapshot);
  } else {
    pushNotification("No realm found yet. Ask the host to create it first.");
  }
  syncSelfPresence();
  state.realm.channel?.postMessage({ type: "ping", from: state.playerId });
  addLog(`Joined realm ${code}.`);
  updateHud();
  renderFriends();
}

function leaveRealm() {
  if (!state.realm.connected) {
    return;
  }
  const players = readRealmPlayers();
  delete players[state.playerId];
  writeRealmPlayers(players);
  state.realm.channel?.close();
  state.realm.channel = null;
  state.players = {};
  state.realm.connected = false;
  state.realm.isHost = false;
  state.realm.code = "";
  state.realm.friends = {};
  addLog("Left the realm.");
  pushNotification("Returned to solo mode.");
  updateHud();
  renderFriends();
}

function playVoiceMessage(message) {
  const player = state.players[message.from];
  if (!player || !state.realm.friends[message.from]) {
    return;
  }
  const audio = document.createElement("audio");
  audio.src = URL.createObjectURL(message.blob);
  audio.play().catch(() => {});
  audio.addEventListener("ended", () => URL.revokeObjectURL(audio.src));
}

function enableVoiceChat() {
  if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
    pushNotification("Voice chat is not supported on this browser.");
    return;
  }

  if (state.voice.enabled) {
    state.voice.recorder?.stop();
    state.voice.stream?.getTracks().forEach((track) => track.stop());
    state.voice.stream = null;
    state.voice.recorder = null;
    state.voice.enabled = false;
    ui.voiceBtn.textContent = "Enable Voice";
    updateHud();
    return;
  }

  navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
    state.voice.stream = stream;
    state.voice.enabled = true;
    ui.voiceBtn.textContent = "Disable Voice";

    const recorder = new MediaRecorder(stream);
    recorder.ondataavailable = (event) => {
      if (!event.data || !event.data.size || !state.realm.connected) {
        return;
      }
      state.realm.channel?.postMessage({
        type: "voice",
        from: state.playerId,
        name: state.playerName,
        blob: event.data,
      });
    };
    recorder.start(700);
    state.voice.recorder = recorder;
    addLog("Friend-only voice chat enabled.");
    updateHud();
  }).catch(() => {
    pushNotification("Microphone permission is required for voice chat.");
  });
}

function toggleRecording() {
  if (!window.MediaRecorder || !canvas.captureStream) {
    pushNotification("Recording is not supported on this browser.");
    return;
  }

  if (state.recording.active) {
    state.recording.recorder?.stop();
    return;
  }

  const stream = canvas.captureStream(30);
  if (state.voice.stream) {
    const audioTrack = state.voice.stream.getAudioTracks()[0];
    if (audioTrack) {
      stream.addTrack(audioTrack);
    }
  }

  state.recording.chunks = [];
  const recorder = new MediaRecorder(stream);
  recorder.ondataavailable = (event) => {
    if (event.data?.size) {
      state.recording.chunks.push(event.data);
    }
  };
  recorder.onstop = () => {
    const blob = new Blob(state.recording.chunks, { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `awesomecraft-recording-${Date.now()}.webm`;
    link.click();
    URL.revokeObjectURL(url);
    state.recording.active = false;
    ui.recordBtn.textContent = "Start Recording";
    updateHud();
  };
  recorder.start();
  state.recording.recorder = recorder;
  state.recording.active = true;
  ui.recordBtn.textContent = "Stop Recording";
  addLog("Recording started.");
  updateHud();
}

function handleStorage(event) {
  if (!state.realm.connected) {
    return;
  }
  if (event.key === `${REALM_PREFIX}${state.realm.code}` && !state.realm.isHost) {
    const snapshot = readRealmSnapshot();
    if (snapshot) {
      applyRealmSnapshot(snapshot);
    }
  }
  if (event.key === getPlayerStoreKey()) {
    refreshRealmPlayers();
  }
}

function pollRealm() {
  if (!state.realm.connected) {
    return;
  }

  syncSelfPresence();
  if (!state.realm.isHost) {
    const snapshot = readRealmSnapshot();
    if (snapshot) {
      applyRealmSnapshot(snapshot);
    }
  } else {
    syncRealmSnapshot();
  }
}

function summonBoss() {
  state.player.x = gridToPixel(41);
  state.player.y = gridToPixel(12);
  awakenBoss();
}

function quickHeal() {
  state.player.hp = state.player.maxHp;
  addLog("You patched yourself up.");
  pushNotification("Health restored.");
  updateHud();
}

function handleKeyDown(event) {
  if (event.key === "w" || event.key === "ArrowUp") {
    input.up = true;
  }
  if (event.key === "s" || event.key === "ArrowDown") {
    input.down = true;
  }
  if (event.key === "a" || event.key === "ArrowLeft") {
    input.left = true;
  }
  if (event.key === "d" || event.key === "ArrowRight") {
    input.right = true;
  }
  if (event.key === " ") {
    event.preventDefault();
    attack();
  }
  if (event.key.toLowerCase() === "e") {
    interact();
  }
  if (event.key.toLowerCase() === "q") {
    breakTile();
  }
  if (event.key.toLowerCase() === "r") {
    placeTile();
  }
}

function handleKeyUp(event) {
  if (event.key === "w" || event.key === "ArrowUp") {
    input.up = false;
  }
  if (event.key === "s" || event.key === "ArrowDown") {
    input.down = false;
  }
  if (event.key === "a" || event.key === "ArrowLeft") {
    input.left = false;
  }
  if (event.key === "d" || event.key === "ArrowRight") {
    input.right = false;
  }
}

function bindTouchMoveButtons() {
  document.querySelectorAll("[data-move]").forEach((button) => {
    const direction = button.getAttribute("data-move");
    const setValue = (value) => {
      input[direction] = value;
    };
    button.addEventListener("pointerdown", () => setValue(true));
    button.addEventListener("pointerup", () => setValue(false));
    button.addEventListener("pointerleave", () => setValue(false));
    button.addEventListener("pointercancel", () => setValue(false));
  });
}

function bindEvents() {
  window.addEventListener("resize", resizeCanvas);
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
  window.addEventListener("storage", handleStorage);
  window.addEventListener("beforeunload", leaveRealm);

  ui.playerNameInput.addEventListener("change", () => {
    state.playerName = ui.playerNameInput.value.trim() || "BuilderOne";
    syncSelfPresence();
    updateHud();
  });
  ui.createRealmBtn.addEventListener("click", createRealm);
  ui.joinRealmBtn.addEventListener("click", joinRealm);
  ui.leaveRealmBtn.addEventListener("click", leaveRealm);
  ui.togglePassBtn.addEventListener("click", () => {
    state.marketplacePass = !state.marketplacePass;
    ui.togglePassBtn.textContent = state.marketplacePass ? "Pass Active" : "Pass Paused";
    renderContentLibrary();
    updateHud();
  });
  ui.voiceBtn.addEventListener("click", enableVoiceChat);
  ui.recordBtn.addEventListener("click", toggleRecording);
  ui.summonBossBtn.addEventListener("click", summonBoss);
  ui.healBtn.addEventListener("click", quickHeal);
  ui.saveWorldBtn.addEventListener("click", saveWorld);
  ui.breakBtn.addEventListener("click", breakTile);
  ui.placeBtn.addEventListener("click", placeTile);
  ui.attackBtn.addEventListener("click", attack);
  ui.interactBtn.addEventListener("click", interact);
  ui.closeComputerBtn.addEventListener("click", closeComputerModal);

  canvas.addEventListener("pointerdown", (event) => {
    handleCanvasPointer(event.clientX, event.clientY);
  });
  canvas.addEventListener("pointermove", (event) => {
    if (event.buttons === 1) {
      handleCanvasPointer(event.clientX, event.clientY);
    }
  });
  canvas.addEventListener("click", (event) => {
    handleCanvasPointer(event.clientX, event.clientY);
  });

  bindTouchMoveButtons();
}

function gameLoop(timestamp) {
  const dt = clamp((timestamp - state.lastTick) / 1000, 0, 0.034);
  state.lastTick = timestamp;
  updatePlayer(dt);
  if (!state.realm.connected || state.realm.isHost) {
    updateBoss(dt);
  }
  renderWorld();
  updateHud();
  requestAnimationFrame(gameLoop);
}

function initializeGame() {
  loadWorld();
  state.playerName = ui.playerNameInput.value = state.playerName;
  ui.togglePassBtn.textContent = state.marketplacePass ? "Pass Active" : "Pass Paused";
  bindEvents();
  resizeCanvas();
  renderHotbar();
  renderContentLibrary();
  renderBuildTube();
  addLog("AWESOMECRAFT loaded. Move with WASD or touch buttons.");
  addLog("Break with Q, place with R, attack with Space, interact with E.");
  updateCamera();
  updateHud();
  renderFriends();
  setInterval(pollRealm, 250);
  requestAnimationFrame((timestamp) => {
    state.lastTick = timestamp;
    gameLoop(timestamp);
  });
}

initializeGame();
