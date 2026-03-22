const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const ui = {
  playerNameInput: document.getElementById("playerNameInput"),
  realmCodeInput: document.getElementById("realmCodeInput"),
  createRealmBtn: document.getElementById("createRealmBtn"),
  joinRealmBtn: document.getElementById("joinRealmBtn"),
  leaveRealmBtn: document.getElementById("leaveRealmBtn"),
  voiceBtn: document.getElementById("voiceBtn"),
  recordBtn: document.getElementById("recordBtn"),
  summonBossBtn: document.getElementById("summonBossBtn"),
  healBtn: document.getElementById("healBtn"),
  openInventoryBtn: document.getElementById("openInventoryBtn"),
  saveWorldBtn: document.getElementById("saveWorldBtn"),
  breakBtn: document.getElementById("breakBtn"),
  placeBtn: document.getElementById("placeBtn"),
  attackBtn: document.getElementById("attackBtn"),
  interactBtn: document.getElementById("interactBtn"),
  inventoryBtn: document.getElementById("inventoryBtn"),
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
  timeValue: document.getElementById("timeValue"),
  dimensionValue: document.getElementById("dimensionValue"),
  targetInfo: document.getElementById("targetInfo"),
  toolInfo: document.getElementById("toolInfo"),
  timeBadge: document.getElementById("timeBadge"),
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
  inventoryModal: document.getElementById("inventoryModal"),
  closeInventoryBtn: document.getElementById("closeInventoryBtn"),
  inventoryGrid: document.getElementById("inventoryGrid"),
  craftingGrid: document.getElementById("craftingGrid"),
  craftOutputBtn: document.getElementById("craftOutputBtn"),
  clearCraftingBtn: document.getElementById("clearCraftingBtn"),
  selectedInventoryHint: document.getElementById("selectedInventoryHint"),
  recipeHint: document.getElementById("recipeHint"),
};

const WORLD_WIDTH = 96;
const WORLD_HEIGHT = 72;
const TILE_SIZE = 48;
const PLAYER_RADIUS = 16;
const BASE_SPEED = 4.2;
const HOTBAR_SIZE = 6;
const INVENTORY_SIZE = 24;
const SAVE_KEY = "awesomecraft.save.v2";
const REALM_PREFIX = "awesomecraft.realm.";
const PLAYER_PREFIX = "awesomecraft.players.";
const PRESENCE_INTERVAL_MS = 300;
const SNAPSHOT_INTERVAL_MS = 1400;
const OVERWORLD_PORTAL = { x: 18, y: 18, target: "nether", spawn: { x: 12, y: 12 } };
const NETHER_PORTAL = { x: 12, y: 12, target: "overworld", spawn: { x: 19, y: 19 } };
const BOSS_SPAWN = { x: 78, y: 20 };

const paletteLibrary = {
  classic: {
    sky: "#84d1e0",
    grass: "#58a85c",
    dirt: "#8b5c3f",
    stone: "#6f7882",
    water: "#347fd4",
    slime: "#89d94e",
    wood: "#8b5733",
    leaves: "#2f8445",
    glass: "#b8ebff",
    computer: "#8e96bf",
    crystal: "#88c6ff",
    netherrack: "#7a3426",
    ash: "#5f5650",
    lava: "#ff7a38",
    portal: "#9c5bff",
    shadow: "rgba(0, 0, 0, 0.24)",
  },
  sunset: {
    sky: "#f3b06f",
    grass: "#8cbc58",
    dirt: "#8f5939",
    stone: "#877266",
    water: "#597de0",
    slime: "#d5d342",
    wood: "#9b6137",
    leaves: "#587d35",
    glass: "#ffe8b5",
    computer: "#b497d6",
    crystal: "#ffddb6",
    netherrack: "#934437",
    ash: "#755f59",
    lava: "#ff9c52",
    portal: "#f5a0ff",
    shadow: "rgba(0, 0, 0, 0.26)",
  },
  blueprint: {
    sky: "#66abd9",
    grass: "#51d3c5",
    dirt: "#10405a",
    stone: "#45637c",
    water: "#276fff",
    slime: "#8affb2",
    wood: "#4c8f91",
    leaves: "#44b594",
    glass: "#d5fbff",
    computer: "#e7f0ff",
    crystal: "#75d8ff",
    netherrack: "#5f3252",
    ash: "#566572",
    lava: "#ff745a",
    portal: "#83a3ff",
    shadow: "rgba(2, 14, 26, 0.3)",
  },
};

const placeableItems = [
  { id: "stone", label: "Stone Block", colorKey: "stone" },
  { id: "wood", label: "Wood Block", colorKey: "wood" },
  { id: "glass", label: "Glass Block", colorKey: "glass" },
  { id: "computer", label: "Computer", colorKey: "computer" },
  { id: "slime", label: "Slime Brick", colorKey: "slime" },
  { id: "portal", label: "Portal Core", colorKey: "portal" },
];

const itemInfo = {
  stone: { label: "Stone Block", placeable: true, colorKey: "stone" },
  wood: { label: "Wood Block", placeable: true, colorKey: "wood" },
  glass: { label: "Glass Block", placeable: true, colorKey: "glass" },
  computer: { label: "Computer", placeable: true, colorKey: "computer" },
  slime: { label: "Slime Brick", placeable: true, colorKey: "slime" },
  portal: { label: "Portal Core", placeable: true, colorKey: "portal" },
  crystal: { label: "Crystal", placeable: false, colorKey: "crystal" },
};

const texturePacks = [
  { id: "classic", name: "Classic Crisp", description: "Chunky bright colors with clean blocks." },
  { id: "sunset", name: "Golden Sunset", description: "Warm skies, soft stone, glow-water." },
  { id: "blueprint", name: "BuildGrid XT", description: "Technical blueprints for megaprojects." },
];

const mashupPacks = [
  {
    id: "frontier",
    name: "Slime Frontier",
    description: "Wide marshlands, ruins, and a final boss arena in the far east.",
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
  { id: "slime-splitter", name: "Slime Splitter", description: "Sword attacks deal bonus damage." },
  { id: "builder-boots", name: "Builder Boots", description: "Move faster around the world." },
  { id: "bounce-core", name: "Bounce Core", description: "Slime surfaces launch you faster." },
];

const addons = [
  { id: "computer-labs", name: "Computer Labs", description: "More computers spawn across the map." },
  { id: "crystal-caves", name: "Crystal Caves", description: "Crystal nodes appear in stone and nether regions." },
  { id: "mashup-posters", name: "Mash-Up Posters", description: "BuildTube gets extra themed creator picks." },
];

const recipes = [
  {
    id: "glass",
    label: "Glass Block x4",
    pattern: ["stone", "stone", null, "stone", "stone", null, null, null, null],
    output: { id: "glass", count: 4 },
  },
  {
    id: "computer",
    label: "Computer x1",
    pattern: ["glass", "glass", "glass", "glass", "crystal", "glass", "stone", "stone", "stone"],
    output: { id: "computer", count: 1 },
  },
  {
    id: "portal",
    label: "Portal Core x1",
    pattern: ["stone", "crystal", "stone", "crystal", "slime", "crystal", "stone", "crystal", "stone"],
    output: { id: "portal", count: 1 },
  },
];

const monsterTypes = {
  zombie: { label: "Night Zombie", color: "#a6d28a", hp: 16, speed: 1.7, damage: 4, drop: { id: "stone", count: 1 } },
  slimelet: { label: "Slimelet", color: "#92ef64", hp: 12, speed: 2.1, damage: 3, drop: { id: "slime", count: 1 } },
  ember: { label: "Emberling", color: "#ffa267", hp: 18, speed: 2.2, damage: 5, drop: { id: "crystal", count: 1 } },
};

const input = {
  up: false,
  down: false,
  left: false,
  right: false,
};

function makeId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function createStartingInventory() {
  return [
    { id: "stone", count: 64 },
    { id: "wood", count: 48 },
    { id: "glass", count: 24 },
    { id: "computer", count: 2 },
    { id: "slime", count: 20 },
    { id: "portal", count: 2 },
    { id: "crystal", count: 12 },
    { id: "stone", count: 24 },
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
  ];
}

const state = {
  playerId: makeId(),
  playerName: "BuilderOne",
  activeTexturePack: "classic",
  activeMashup: "frontier",
  activeMods: new Set(["slime-splitter"]),
  activeAddons: new Set(["computer-labs"]),
  selectedHotbarIndex: 0,
  dimension: "overworld",
  dimensions: {
    overworld: { tiles: [], monsters: [] },
    nether: { tiles: [], monsters: [] },
  },
  player: {
    x: 0,
    y: 0,
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
    lastSnapshotAt: 0,
  },
  boss: {
    dimension: "overworld",
    x: 0,
    y: 0,
    hp: 100,
    maxHp: 100,
    awake: false,
    defeated: false,
    bounceTimer: 0,
    velocityX: 0,
    velocityY: 0,
  },
  inventory: {
    slots: createStartingInventory(),
    crafting: new Array(9).fill(null),
    sourceIndex: null,
    open: false,
  },
  camera: { x: 0, y: 0 },
  targetTile: null,
  dayClock: 0.26,
  wasNight: false,
  monsterSpawnTimer: 0,
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

function getPalette() {
  return paletteLibrary[state.activeTexturePack] || paletteLibrary.classic;
}

function activeWorld() {
  return state.dimensions[state.dimension];
}

function otherDimension() {
  return state.dimension === "overworld" ? "nether" : "overworld";
}

function worldAtFrom(tiles, x, y) {
  if (x < 0 || y < 0 || x >= WORLD_WIDTH || y >= WORLD_HEIGHT) {
    return null;
  }
  return tiles[y][x];
}

function worldAt(x, y, dimension = state.dimension) {
  return worldAtFrom(state.dimensions[dimension].tiles, x, y);
}

function createTile(floor = "grass", object = null) {
  return { floor, object };
}

function createBlankWorld(defaultFloor) {
  const world = [];
  for (let y = 0; y < WORLD_HEIGHT; y += 1) {
    const row = [];
    for (let x = 0; x < WORLD_WIDTH; x += 1) {
      row.push(createTile(defaultFloor));
    }
    world.push(row);
  }
  return world;
}

function placeRandomObjects(tiles, floorTarget, objectId, count) {
  let placed = 0;
  while (placed < count) {
    const x = Math.floor(randomRange(4, WORLD_WIDTH - 4));
    const y = Math.floor(randomRange(4, WORLD_HEIGHT - 4));
    const tile = worldAtFrom(tiles, x, y);
    if (tile && tile.floor === floorTarget && !tile.object) {
      tile.object = objectId;
      placed += 1;
    }
  }
}

function paintPatch(tiles, centerX, centerY, radius, floor) {
  for (let y = centerY - radius; y <= centerY + radius; y += 1) {
    for (let x = centerX - radius; x <= centerX + radius; x += 1) {
      const tile = worldAtFrom(tiles, x, y);
      if (!tile) {
        continue;
      }
      const distance = Math.hypot(x - centerX, y - centerY);
      if (distance <= radius + Math.random() * 0.8) {
        tile.floor = floor;
        if (floor === "water" || floor === "lava") {
          tile.object = null;
        }
      }
    }
  }
}

function buildOverworld() {
  const tiles = createBlankWorld("grass");

  for (let y = 0; y < WORLD_HEIGHT; y += 1) {
    for (let x = 0; x < WORLD_WIDTH; x += 1) {
      const tile = tiles[y][x];
      if (x < 3 || y < 3 || x > WORLD_WIDTH - 4 || y > WORLD_HEIGHT - 4) {
        tile.floor = "stone";
      } else if ((x + y) % 17 === 0) {
        tile.floor = "dirt";
      }
    }
  }

  for (let i = 0; i < 12; i += 1) {
    paintPatch(tiles, Math.floor(randomRange(8, WORLD_WIDTH - 8)), Math.floor(randomRange(8, WORLD_HEIGHT - 8)), Math.floor(randomRange(2, 4)), "water");
  }

  for (let i = 0; i < 18; i += 1) {
    paintPatch(tiles, Math.floor(randomRange(10, WORLD_WIDTH - 10)), Math.floor(randomRange(10, WORLD_HEIGHT - 10)), 2, "dirt");
  }

  placeRandomObjects(tiles, "grass", "wood", 28);
  placeRandomObjects(tiles, "grass", "leaves", 18);
  placeRandomObjects(tiles, "stone", "stone", 34);
  placeRandomObjects(tiles, "stone", "crystal", state.activeAddons.has("crystal-caves") ? 18 : 10);
  placeRandomObjects(tiles, "grass", "computer", state.activeAddons.has("computer-labs") ? 10 : 5);

  for (let y = 12; y < 30; y += 1) {
    for (let x = 66; x < 90; x += 1) {
      const tile = tiles[y][x];
      tile.floor = (x + y) % 2 === 0 ? "slime" : "stone";
    }
  }

  tiles[BOSS_SPAWN.y][BOSS_SPAWN.x].object = "altar";
  tiles[BOSS_SPAWN.y][BOSS_SPAWN.x + 1].object = "slime";
  tiles[BOSS_SPAWN.y - 1][BOSS_SPAWN.x].object = "stone";
  tiles[BOSS_SPAWN.y + 1][BOSS_SPAWN.x].object = "stone";

  tiles[OVERWORLD_PORTAL.y][OVERWORLD_PORTAL.x].object = "portal";
  tiles[OVERWORLD_PORTAL.y][OVERWORLD_PORTAL.x - 1].object = "stone";
  tiles[OVERWORLD_PORTAL.y][OVERWORLD_PORTAL.x + 1].object = "stone";
  tiles[OVERWORLD_PORTAL.y - 1][OVERWORLD_PORTAL.x].object = "stone";
  tiles[OVERWORLD_PORTAL.y + 1][OVERWORLD_PORTAL.x].object = "stone";

  return tiles;
}

function buildNether() {
  const tiles = createBlankWorld("netherrack");

  for (let y = 0; y < WORLD_HEIGHT; y += 1) {
    for (let x = 0; x < WORLD_WIDTH; x += 1) {
      const tile = tiles[y][x];
      if (x < 3 || y < 3 || x > WORLD_WIDTH - 4 || y > WORLD_HEIGHT - 4) {
        tile.floor = "ash";
      } else if ((x + y) % 13 === 0) {
        tile.floor = "ash";
      }
    }
  }

  for (let i = 0; i < 16; i += 1) {
    paintPatch(tiles, Math.floor(randomRange(6, WORLD_WIDTH - 6)), Math.floor(randomRange(6, WORLD_HEIGHT - 6)), Math.floor(randomRange(2, 5)), "lava");
  }

  placeRandomObjects(tiles, "ash", "stone", 24);
  placeRandomObjects(tiles, "netherrack", "slime", 18);
  placeRandomObjects(tiles, "ash", "crystal", state.activeAddons.has("crystal-caves") ? 12 : 6);
  placeRandomObjects(tiles, "ash", "computer", 2);

  tiles[NETHER_PORTAL.y][NETHER_PORTAL.x].object = "portal";
  tiles[NETHER_PORTAL.y][NETHER_PORTAL.x - 1].object = "stone";
  tiles[NETHER_PORTAL.y][NETHER_PORTAL.x + 1].object = "stone";
  tiles[NETHER_PORTAL.y - 1][NETHER_PORTAL.x].object = "stone";
  tiles[NETHER_PORTAL.y + 1][NETHER_PORTAL.x].object = "stone";

  return tiles;
}

function resetWorlds() {
  state.dimensions.overworld.tiles = buildOverworld();
  state.dimensions.overworld.monsters = [];
  state.dimensions.nether.tiles = buildNether();
  state.dimensions.nether.monsters = [];
  state.dimension = "overworld";
  state.player.x = gridToPixel(8);
  state.player.y = gridToPixel(8);
  state.boss = {
    dimension: "overworld",
    x: gridToPixel(BOSS_SPAWN.x + 1),
    y: gridToPixel(BOSS_SPAWN.y),
    hp: 100,
    maxHp: 100,
    awake: false,
    defeated: false,
    bounceTimer: 0,
    velocityX: 0,
    velocityY: 0,
  };
}

function addLog(message) {
  state.logs.unshift({ id: makeId(), message });
  state.logs = state.logs.slice(0, 24);
  renderEventLog();
}

function pushNotification(message) {
  const note = { id: makeId(), message };
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

function itemLabel(itemId) {
  const info = itemInfo[itemId];
  return info ? info.label : "Unknown Item";
}

function itemColor(itemId) {
  const info = itemInfo[itemId];
  const colorKey = info ? info.colorKey : null;
  const palette = getPalette();
  return palette[colorKey] || palette.stone;
}

function hotbarSlot(index) {
  return state.inventory.slots[index] || null;
}

function selectedHotbarItem() {
  return hotbarSlot(state.selectedHotbarIndex);
}

function firstInventorySlotFor(itemId) {
  return state.inventory.slots.findIndex((slot) => slot && slot.id === itemId && slot.count > 0);
}

function addItem(itemId, count) {
  let remaining = count;
  state.inventory.slots.forEach((slot) => {
    if (remaining > 0 && slot && slot.id === itemId) {
      const room = 64 - slot.count;
      const move = Math.min(room, remaining);
      slot.count += move;
      remaining -= move;
    }
  });

  for (let i = 0; i < state.inventory.slots.length && remaining > 0; i += 1) {
    if (!state.inventory.slots[i]) {
      const move = Math.min(64, remaining);
      state.inventory.slots[i] = { id: itemId, count: move };
      remaining -= move;
    }
  }

  renderHotbar();
  renderInventory();
  return remaining === 0;
}

function removeFromInventorySlot(index, count) {
  const slot = state.inventory.slots[index];
  if (!slot || slot.count < count) {
    return false;
  }
  slot.count -= count;
  if (slot.count <= 0) {
    state.inventory.slots[index] = null;
  }
  renderHotbar();
  renderInventory();
  return true;
}

function currentRecipe() {
  return recipes.find((recipe) => recipe.pattern.every((value, index) => value === state.inventory.crafting[index]));
}

function clearCraftingGrid(returnItems = true) {
  if (returnItems) {
    state.inventory.crafting.forEach((itemId) => {
      if (itemId) {
        addItem(itemId, 1);
      }
    });
  }
  state.inventory.crafting = new Array(9).fill(null);
  renderCrafting();
}

function renderHotbar() {
  ui.hotbar.innerHTML = "";
  for (let index = 0; index < HOTBAR_SIZE; index += 1) {
    const slot = hotbarSlot(index);
    const button = document.createElement("button");
    button.type = "button";
    button.className = `hotbar-slot ${state.selectedHotbarIndex === index ? "selected" : ""}`;
    button.addEventListener("click", () => {
      state.selectedHotbarIndex = index;
      updateHud();
      renderHotbar();
    });

    const swatch = document.createElement("div");
    swatch.className = "swatch";
    swatch.style.background = slot ? itemColor(slot.id) : "rgba(255,255,255,0.08)";

    const label = document.createElement("div");
    label.className = "slot-name";
    label.textContent = slot ? `${itemLabel(slot.id)} x${slot.count}` : "Empty";
    button.appendChild(swatch);
    button.appendChild(label);
    ui.hotbar.appendChild(button);
  }
}

function renderInventory() {
  ui.inventoryGrid.innerHTML = "";
  state.inventory.slots.forEach((slot, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `inventory-slot ${state.inventory.sourceIndex === index ? "selected" : ""}`;
    button.addEventListener("click", () => {
      state.inventory.sourceIndex = state.inventory.sourceIndex === index ? null : index;
      renderInventory();
      updateHud();
    });

    if (slot) {
      const swatch = document.createElement("div");
      swatch.className = "swatch";
      swatch.style.background = itemColor(slot.id);
      const label = document.createElement("strong");
      label.textContent = itemLabel(slot.id);
      const count = document.createElement("span");
      count.className = "slot-count";
      count.textContent = `x${slot.count}`;
      button.appendChild(swatch);
      button.appendChild(label);
      button.appendChild(count);
    } else {
      const empty = document.createElement("span");
      empty.className = "slot-empty";
      empty.textContent = "Empty";
      button.appendChild(empty);
    }
    ui.inventoryGrid.appendChild(button);
  });

  ui.selectedInventoryHint.textContent = state.inventory.sourceIndex === null
    ? "Select a stack"
    : `Selected: ${itemLabel(state.inventory.slots[state.inventory.sourceIndex] ? state.inventory.slots[state.inventory.sourceIndex].id : "stone")}`;
}

function renderCrafting() {
  ui.craftingGrid.innerHTML = "";
  state.inventory.crafting.forEach((itemId, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `craft-slot ${itemId ? "selected" : ""}`;
    button.addEventListener("click", () => handleCraftSlot(index));
    if (itemId) {
      const swatch = document.createElement("div");
      swatch.className = "swatch";
      swatch.style.background = itemColor(itemId);
      const label = document.createElement("strong");
      label.textContent = itemLabel(itemId);
      button.appendChild(swatch);
      button.appendChild(label);
    } else {
      const empty = document.createElement("span");
      empty.className = "slot-empty";
      empty.textContent = "Place";
      button.appendChild(empty);
    }
    ui.craftingGrid.appendChild(button);
  });

  const recipe = currentRecipe();
  ui.craftOutputBtn.className = `craft-output-button ${recipe ? "ready" : ""}`;
  ui.craftOutputBtn.textContent = recipe ? recipe.label : "Nothing Crafted";
  ui.recipeHint.textContent = recipe
    ? `Ready to craft ${recipe.label}. Tap the output button to collect it.`
    : "Recipes: 2x2 stone = glass, glass shell + crystal core = computer, crystal frame + slime core = portal.";
}

function handleCraftSlot(index) {
  const current = state.inventory.crafting[index];
  if (current) {
    addItem(current, 1);
    state.inventory.crafting[index] = null;
    renderCrafting();
    renderInventory();
    return;
  }

  if (state.inventory.sourceIndex === null) {
    pushNotification("Select an inventory stack first.");
    return;
  }

  const slot = state.inventory.slots[state.inventory.sourceIndex];
  if (!slot) {
    state.inventory.sourceIndex = null;
    renderInventory();
    return;
  }

  state.inventory.crafting[index] = slot.id;
  removeFromInventorySlot(state.inventory.sourceIndex, 1);
  if (!state.inventory.slots[state.inventory.sourceIndex]) {
    state.inventory.sourceIndex = null;
  }
  renderCrafting();
  renderInventory();
}

function craftRecipe() {
  const recipe = currentRecipe();
  if (!recipe) {
    pushNotification("That crafting pattern does not make anything yet.");
    return;
  }

  addItem(recipe.output.id, recipe.output.count);
  clearCraftingGrid(false);
  pushNotification(`Crafted ${recipe.label}.`);
  addLog(`Crafted ${recipe.label}.`);
}

function openDialog(dialog) {
  if (typeof dialog.showModal === "function") {
    dialog.showModal();
  } else {
    dialog.setAttribute("open", "open");
  }
}

function closeDialog(dialog) {
  if (typeof dialog.close === "function") {
    dialog.close();
  } else {
    dialog.removeAttribute("open");
  }
}

function toggleInventory(forceOpen = null) {
  const shouldOpen = forceOpen === null ? !state.inventory.open : forceOpen;
  state.inventory.open = shouldOpen;
  if (shouldOpen) {
    input.up = false;
    input.down = false;
    input.left = false;
    input.right = false;
    renderInventory();
    renderCrafting();
    openDialog(ui.inventoryModal);
  } else {
    closeDialog(ui.inventoryModal);
  }
}

function getCurrentVideos() {
  const mashup = mashupPacks.find((entry) => entry.id === state.activeMashup) || mashupPacks[0];
  return mashup.videos;
}

function renderBuildTube() {
  ui.buildTubeList.innerHTML = "";
  const videos = getCurrentVideos();
  const activeId = state.buildTubeSelection || (videos[0] ? videos[0].id : null);
  state.buildTubeSelection = activeId;

  videos.forEach((video) => {
    const node = document.createElement("button");
    node.type = "button";
    node.className = `buildtube-item ${video.id === activeId ? "active" : ""}`;
    node.innerHTML = `<h4>${video.title}</h4><p>${video.creator}</p>`;
    node.addEventListener("click", () => {
      state.buildTubeSelection = video.id;
      renderBuildTube();
    });
    ui.buildTubeList.appendChild(node);
  });

  const video = videos.find((entry) => entry.id === state.buildTubeSelection) || videos[0];
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

function renderPackCards(root, items, selectedSet, singleSelect = false, onSelect) {
  root.innerHTML = "";
  items.forEach((pack) => {
    const active = singleSelect ? selectedSet === pack.id : selectedSet.has(pack.id);
    const button = document.createElement("button");
    button.type = "button";
    button.className = `pack-card ${active ? "active" : ""}`;
    button.innerHTML = `<h4>${pack.name}</h4><p>${pack.description}</p>`;
    button.addEventListener("click", () => onSelect(pack));
    root.appendChild(button);
  });
}

function renderContentLibrary() {
  renderPackCards(ui.texturePackList, texturePacks, state.activeTexturePack, true, (pack) => {
    state.activeTexturePack = pack.id;
    renderHotbar();
    updateHud();
  });
  renderPackCards(ui.mashupList, mashupPacks, state.activeMashup, true, (pack) => {
    state.activeMashup = pack.id;
    ui.tutorialPreview.textContent = `Featured: ${pack.videos.map((item) => item.title).join(", ")}.`;
    renderBuildTube();
    updateHud();
  });
  renderPackCards(ui.modsList, mods, state.activeMods, false, (pack) => {
    if (state.activeMods.has(pack.id)) {
      state.activeMods.delete(pack.id);
    } else {
      state.activeMods.add(pack.id);
    }
    updateHud();
    renderContentLibrary();
  });
  renderPackCards(ui.addonsList, addons, state.activeAddons, false, (pack) => {
    if (state.activeAddons.has(pack.id)) {
      state.activeAddons.delete(pack.id);
    } else {
      state.activeAddons.add(pack.id);
    }
    resetWorlds();
    renderContentLibrary();
    renderHotbar();
    updateHud();
  });
}

function getModifiers() {
  return {
    damage: state.activeMods.has("slime-splitter") ? 8 : 5,
    speed: BASE_SPEED + (state.activeMods.has("builder-boots") ? 1.1 : 0),
    bounce: state.activeMods.has("bounce-core") ? 1.45 : 1,
  };
}

function currentDimensionLabel() {
  return state.dimension === "overworld" ? "Overworld" : "Nether";
}

function isNight() {
  return state.dayClock < 0.18 || state.dayClock > 0.72;
}

function isSolidObject(objectId) {
  return ["stone", "wood", "glass", "computer", "slime", "altar", "crystal"].includes(objectId);
}

function tileBlocked(gridX, gridY, dimension = state.dimension) {
  const tile = worldAt(gridX, gridY, dimension);
  if (!tile) {
    return true;
  }
  if (tile.floor === "water" || tile.floor === "lava") {
    return true;
  }
  if (tile.object && isSolidObject(tile.object)) {
    return true;
  }
  return false;
}

function updateHud() {
  const hotbarItem = selectedHotbarItem();
  const activeTexture = texturePacks.find((pack) => pack.id === state.activeTexturePack);
  const activeMashup = mashupPacks.find((pack) => pack.id === state.activeMashup);
  ui.healthValue.textContent = `${Math.ceil(state.player.hp)} / ${state.player.maxHp}`;
  ui.realmValue.textContent = state.realm.connected ? state.realm.code : "Solo";
  ui.connectionBadge.textContent = state.realm.connected ? (state.realm.isHost ? "Realm Host" : "Realm Guest") : "Offline";
  ui.playerCount.textContent = `${Object.values(state.players).filter((player) => player.id !== state.playerId).length + 1} online`;
  ui.voiceStatus.textContent = state.voice.enabled ? "Friends only active" : "Friends only";
  ui.recordStatus.textContent = state.recording.active ? "Recording" : "Ready";
  ui.timeValue.textContent = isNight() ? "Night" : "Day";
  ui.dimensionValue.textContent = currentDimensionLabel();
  ui.timeBadge.textContent = isNight() ? "Night monsters rising" : "Day";
  ui.toolInfo.textContent = hotbarItem ? `${itemLabel(hotbarItem.id)} x${hotbarItem.count}` : "Empty Slot";
  ui.activePackSummary.textContent = `${activeTexture ? activeTexture.name : "Classic"} + ${activeMashup ? activeMashup.name : "Frontier"} unlocked`;
  ui.buildTubeHint.textContent = nearestObject("computer") ? "Computer in reach" : "Find a computer";

  if (state.targetTile) {
    const tile = worldAt(state.targetTile.x, state.targetTile.y);
    const label = tile ? (tile.object || tile.floor || "Unknown") : "Unknown";
    ui.targetInfo.textContent = `${state.targetTile.x},${state.targetTile.y} ${label}`;
  } else {
    ui.targetInfo.textContent = "Select a tile";
  }

  ui.bossHealthFill.style.width = `${(state.boss.hp / state.boss.maxHp) * 100}%`;
  ui.bossHealthText.textContent = `${Math.max(0, Math.ceil(state.boss.hp))} / ${state.boss.maxHp}`;
  ui.bossBanner.classList.toggle("hidden", state.dimension !== state.boss.dimension || !state.boss.awake || state.boss.defeated);
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

function drawObject(tile, screenX, screenY, palette) {
  const objectId = tile.object;
  if (!objectId) {
    return;
  }

  const colorMap = {
    stone: palette.stone,
    wood: palette.wood,
    glass: palette.glass,
    computer: palette.computer,
    slime: palette.slime,
    altar: "#ffcb77",
    leaves: palette.leaves,
    crystal: palette.crystal,
    portal: palette.portal,
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
    ctx.fillStyle = "#efffff";
    ctx.beginPath();
    ctx.moveTo(screenX + TILE_SIZE / 2, screenY + 8);
    ctx.lineTo(screenX + TILE_SIZE - 12, screenY + TILE_SIZE / 2);
    ctx.lineTo(screenX + TILE_SIZE / 2, screenY + TILE_SIZE - 8);
    ctx.lineTo(screenX + 12, screenY + TILE_SIZE / 2);
    ctx.closePath();
    ctx.fill();
  }

  if (objectId === "portal") {
    ctx.fillStyle = "rgba(255,255,255,0.26)";
    ctx.fillRect(screenX + 14, screenY + 10, TILE_SIZE - 28, TILE_SIZE - 20);
  }

  if (objectId === "altar") {
    ctx.fillStyle = "#8c2f39";
    ctx.fillRect(screenX + 12, screenY + 18, TILE_SIZE - 24, TILE_SIZE - 26);
  }
}

function drawTile(tile, screenX, screenY, palette, gridX, gridY) {
  ctx.fillStyle = palette[tile.floor] || palette.grass;
  ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);

  if (tile.floor === "water" || tile.floor === "lava") {
    ctx.fillStyle = "rgba(255, 255, 255, 0.16)";
    ctx.fillRect(screenX + 6, screenY + 10, TILE_SIZE - 12, 6);
  }

  ctx.strokeStyle = "rgba(255,255,255,0.05)";
  ctx.strokeRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
  drawObject(tile, screenX, screenY, palette);

  if (state.targetTile && state.targetTile.x === gridX && state.targetTile.y === gridY) {
    ctx.strokeStyle = "#ffe799";
    ctx.lineWidth = 3;
    ctx.strokeRect(screenX + 2, screenY + 2, TILE_SIZE - 4, TILE_SIZE - 4);
    ctx.lineWidth = 1;
  }
}

function getVisibleWindow() {
  const visibleTilesX = Math.ceil(canvas.width / TILE_SIZE) + 2;
  const visibleTilesY = Math.ceil(canvas.height / TILE_SIZE) + 2;
  const startX = clamp(Math.floor(state.camera.x / TILE_SIZE), 0, WORLD_WIDTH - visibleTilesX);
  const startY = clamp(Math.floor(state.camera.y / TILE_SIZE), 0, WORLD_HEIGHT - visibleTilesY);
  return { startX, startY, visibleTilesX, visibleTilesY };
}

function drawPlayers() {
  const remotePlayers = Object.values(state.players).filter((player) => player.id !== state.playerId && player.dimension === state.dimension);
  const allPlayers = [
    { id: state.playerId, x: state.player.x, y: state.player.y, name: state.playerName, color: state.player.color },
    ...remotePlayers,
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

function drawBoss() {
  if (state.boss.defeated || state.dimension !== state.boss.dimension) {
    return;
  }
  const palette = getPalette();
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

function drawMonsters() {
  activeWorld().monsters.forEach((monster) => {
    const screenX = monster.x - state.camera.x;
    const screenY = monster.y - state.camera.y;
    ctx.fillStyle = monster.color;
    ctx.beginPath();
    ctx.arc(screenX, screenY, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fillRect(screenX - 10, screenY + 16, 20, 4);
  });
}

function drawNightOverlay() {
  if (state.dimension === "nether") {
    ctx.fillStyle = "rgba(70, 18, 12, 0.18)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    return;
  }
  const alpha = isNight() ? 0.32 : Math.abs(0.5 - state.dayClock) * 0.16;
  ctx.fillStyle = `rgba(8, 18, 39, ${alpha})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function renderWorld() {
  const palette = getPalette();
  const world = activeWorld().tiles;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = state.dimension === "nether" ? "#402016" : palette.sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const { startX, startY, visibleTilesX, visibleTilesY } = getVisibleWindow();
  for (let y = startY; y < startY + visibleTilesY; y += 1) {
    for (let x = startX; x < startX + visibleTilesX; x += 1) {
      const tile = worldAtFrom(world, x, y);
      if (!tile) {
        continue;
      }
      const screenX = x * TILE_SIZE - state.camera.x;
      const screenY = y * TILE_SIZE - state.camera.y;
      drawTile(tile, screenX, screenY, palette, x, y);
    }
  }

  drawBoss();
  drawMonsters();
  drawPlayers();
  drawNightOverlay();
}

function updateCamera() {
  state.camera.x = clamp(state.player.x - canvas.width / 2, 0, WORLD_WIDTH * TILE_SIZE - canvas.width);
  state.camera.y = clamp(state.player.y - canvas.height / 2, 0, WORLD_HEIGHT * TILE_SIZE - canvas.height);
}

function nearestObject(objectId) {
  const originX = pixelToGrid(state.player.x);
  const originY = pixelToGrid(state.player.y);
  for (let y = originY - 1; y <= originY + 1; y += 1) {
    for (let x = originX - 1; x <= originX + 1; x += 1) {
      const tile = worldAt(x, y);
      if (tile && tile.object === objectId) {
        return { x, y };
      }
    }
  }
  return null;
}

function updateDayNight(dt) {
  if (state.dimension === "overworld") {
    state.dayClock = (state.dayClock + dt / 150) % 1;
  }
  const nowNight = isNight();
  if (nowNight !== state.wasNight) {
    state.wasNight = nowNight;
    if (!nowNight) {
      state.dimensions.overworld.monsters = [];
    }
    addLog(nowNight ? "Night falls. Monsters are crawling out." : "Sunrise breaks and the surface calms down.");
  }
}

function spawnMonster(typeId) {
  const type = monsterTypes[typeId];
  if (!type) {
    return;
  }
  for (let attempt = 0; attempt < 24; attempt += 1) {
    const spawnX = clamp(pixelToGrid(state.player.x) + Math.floor(randomRange(-10, 11)), 2, WORLD_WIDTH - 3);
    const spawnY = clamp(pixelToGrid(state.player.y) + Math.floor(randomRange(-8, 9)), 2, WORLD_HEIGHT - 3);
    if (Math.abs(spawnX - pixelToGrid(state.player.x)) < 4 && Math.abs(spawnY - pixelToGrid(state.player.y)) < 4) {
      continue;
    }
    if (!tileBlocked(spawnX, spawnY)) {
      activeWorld().monsters.push({
        id: makeId(),
        type: typeId,
        label: type.label,
        color: type.color,
        hp: type.hp,
        speed: type.speed,
        damage: type.damage,
        drop: type.drop,
        x: gridToPixel(spawnX),
        y: gridToPixel(spawnY),
      });
      return;
    }
  }
}

function updateMonsters(dt) {
  const monsters = activeWorld().monsters;
  state.monsterSpawnTimer += dt;
  const shouldSpawn = state.dimension === "nether" || isNight();
  const cap = state.dimension === "nether" ? 7 : 9;
  if (shouldSpawn && monsters.length < cap && state.monsterSpawnTimer > 2.4) {
    state.monsterSpawnTimer = 0;
    spawnMonster(state.dimension === "nether" ? "ember" : Math.random() > 0.45 ? "zombie" : "slimelet");
  }

  activeWorld().monsters = monsters.filter((monster) => monster.hp > 0);
  activeWorld().monsters.forEach((monster) => {
    const dx = state.player.x - monster.x;
    const dy = state.player.y - monster.y;
    const distance = Math.hypot(dx, dy) || 1;
    monster.x += (dx / distance) * monster.speed * TILE_SIZE * dt;
    monster.y += (dy / distance) * monster.speed * TILE_SIZE * dt;
    if (distance < 40) {
      state.player.hp = clamp(state.player.hp - monster.damage * dt, 0, state.player.maxHp);
      if (state.player.hp <= 0) {
        respawnPlayer();
      }
    }
  });
}

function respawnPlayer() {
  state.player.hp = state.player.maxHp;
  if (state.dimension === "nether") {
    state.player.x = gridToPixel(OVERWORLD_PORTAL.spawn.x);
    state.player.y = gridToPixel(OVERWORLD_PORTAL.spawn.y);
  } else {
    state.player.x = gridToPixel(8);
    state.player.y = gridToPixel(8);
  }
  pushNotification("Respawned at a safe camp.");
}

function updatePlayer(dt) {
  if (state.inventory.open) {
    state.player.attackCooldown = Math.max(0, state.player.attackCooldown - dt);
    return;
  }

  const modifiers = getModifiers();
  const standingTile = worldAt(pixelToGrid(state.player.x), pixelToGrid(state.player.y));
  const slimeBoost = standingTile && (standingTile.floor === "slime" || standingTile.object === "slime") ? modifiers.bounce : 1;
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

  if (!tileBlocked(pixelToGrid(nextX), pixelToGrid(state.player.y))) {
    state.player.x = nextX;
  }
  if (!tileBlocked(pixelToGrid(state.player.x), pixelToGrid(nextY))) {
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
}

function updateBoss(dt) {
  if (state.dimension !== state.boss.dimension || state.boss.defeated) {
    return;
  }

  const dx = state.player.x - state.boss.x;
  const dy = state.player.y - state.boss.y;
  const distance = Math.hypot(dx, dy);
  if (distance < TILE_SIZE * 8 && !state.boss.awake) {
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
    state.boss.velocityX = dirX * TILE_SIZE * 2.4;
    state.boss.velocityY = dirY * TILE_SIZE * 2.4;
  }

  const nextX = state.boss.x + state.boss.velocityX * dt;
  const nextY = state.boss.y + state.boss.velocityY * dt;
  if (!tileBlocked(pixelToGrid(nextX), pixelToGrid(nextY), state.boss.dimension)) {
    state.boss.x = nextX;
    state.boss.y = nextY;
  } else {
    state.boss.velocityX *= -0.4;
    state.boss.velocityY *= -0.4;
  }

  if (distance < 54) {
    state.player.hp = clamp(state.player.hp - 6 * dt, 0, state.player.maxHp);
    if (state.player.hp <= 0) {
      respawnPlayer();
    }
  }
}

function nearestMonsterInRange(range) {
  let target = null;
  let distance = Infinity;
  activeWorld().monsters.forEach((monster) => {
    const monsterDistance = Math.hypot(monster.x - state.player.x, monster.y - state.player.y);
    if (monsterDistance < range && monsterDistance < distance) {
      target = monster;
      distance = monsterDistance;
    }
  });
  return target;
}

function attack() {
  if (state.player.attackCooldown > 0 || state.inventory.open) {
    return;
  }
  state.player.attackCooldown = 0.28;

  const monster = nearestMonsterInRange(72);
  if (monster) {
    monster.hp -= getModifiers().damage;
    addLog(`You hit ${monster.label} for ${getModifiers().damage} damage.`);
    if (monster.hp <= 0) {
      addItem(monster.drop.id, monster.drop.count);
      pushNotification(`${monster.label} defeated.`);
      addLog(`${monster.label} dropped ${itemLabel(monster.drop.id)}.`);
      activeWorld().monsters = activeWorld().monsters.filter((entry) => entry.id !== monster.id);
    }
    return;
  }

  const bossDistance = Math.hypot(state.player.x - state.boss.x, state.player.y - state.boss.y);
  if (state.dimension === state.boss.dimension && state.boss.awake && !state.boss.defeated && bossDistance < 78) {
    state.boss.hp = clamp(state.boss.hp - getModifiers().damage, 0, state.boss.maxHp);
    addLog(`You hit the Giga Slime for ${getModifiers().damage} damage.`);
    if (state.boss.hp <= 0) {
      state.boss.defeated = true;
      state.boss.awake = false;
      pushNotification("Giga Slime defeated.");
      addLog("Victory! The final slime boss is down.");
    }
    return;
  }

  pushNotification("Swing! Nothing is in range.");
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
  if (state.inventory.open) {
    return;
  }
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
  const itemDrop = removed === "leaves" ? "wood" : removed;
  addItem(itemDrop, 1);
  renderHotbar();
  renderInventory();
  pushNotification(`Collected ${itemLabel(itemDrop)}.`);
}

function placeTile() {
  if (state.inventory.open) {
    return;
  }
  const target = selectedGrid();
  const tile = worldAt(target.x, target.y);
  const hotbarItem = selectedHotbarItem();
  if (!tile || !hotbarItem) {
    pushNotification("No placeable item selected.");
    return;
  }
  if (!itemInfo[hotbarItem.id] || !itemInfo[hotbarItem.id].placeable) {
    pushNotification("That item cannot be placed.");
    return;
  }
  if (tile.floor === "water" || tile.floor === "lava") {
    pushNotification("That space is unsafe for building.");
    return;
  }
  if (tile.object) {
    pushNotification("That tile is already occupied.");
    return;
  }
  if (pixelToGrid(state.player.x) === target.x && pixelToGrid(state.player.y) === target.y) {
    pushNotification("Move first, then place the block.");
    return;
  }

  tile.object = hotbarItem.id;
  removeFromInventorySlot(state.selectedHotbarIndex, 1);
}

function findPortalNearPlayer() {
  const portal = nearestObject("portal");
  if (!portal) {
    return null;
  }
  if (state.dimension === "overworld") {
    return { target: "nether", spawn: NETHER_PORTAL.spawn };
  }
  return { target: "overworld", spawn: OVERWORLD_PORTAL.spawn };
}

function usePortal() {
  const portal = findPortalNearPlayer();
  if (!portal) {
    return false;
  }
  state.dimension = portal.target;
  state.player.x = gridToPixel(portal.spawn.x);
  state.player.y = gridToPixel(portal.spawn.y);
  updateCamera();
  addLog(`Stepped through a portal into the ${currentDimensionLabel()}.`);
  pushNotification(`Entered the ${currentDimensionLabel()}.`);
  return true;
}

function interact() {
  if (state.inventory.open) {
    return;
  }
  if (usePortal()) {
    return;
  }
  if (nearestObject("computer")) {
    renderBuildTube();
    openDialog(ui.computerModal);
    addLog("Opened BuildTube on a computer block.");
    return;
  }
  if (nearestObject("altar")) {
    awakenBoss();
    return;
  }
  pushNotification("Nothing special to use here.");
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
    activeTexturePack: state.activeTexturePack,
    activeMashup: state.activeMashup,
    activeMods: [...state.activeMods],
    activeAddons: [...state.activeAddons],
    dimension: state.dimension,
    dimensions: state.dimensions,
    player: state.player,
    boss: state.boss,
    inventory: state.inventory,
    dayClock: state.dayClock,
  };
  localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
  addLog("World saved locally.");
  pushNotification("World saved.");
}

function loadWorld() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) {
    resetWorlds();
    return;
  }

  try {
    const payload = JSON.parse(raw);
    state.playerName = payload.playerName || state.playerName;
    state.activeTexturePack = payload.activeTexturePack || "classic";
    state.activeMashup = payload.activeMashup || "frontier";
    state.activeMods = new Set(payload.activeMods || ["slime-splitter"]);
    state.activeAddons = new Set(payload.activeAddons || ["computer-labs"]);
    state.dimension = payload.dimension || "overworld";
    state.dimensions = payload.dimensions || state.dimensions;
    state.player = { ...state.player, ...(payload.player || {}) };
    state.boss = { ...state.boss, ...(payload.boss || {}) };
    const inventoryPayload = payload.inventory || {};
    state.inventory = {
      slots: inventoryPayload.slots || createStartingInventory(),
      crafting: inventoryPayload.crafting || new Array(9).fill(null),
      sourceIndex: null,
      open: false,
    };
    state.dayClock = payload.dayClock !== undefined ? payload.dayClock : 0.26;
  } catch (error) {
    resetWorlds();
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
  if (state.realm.code) {
    localStorage.setItem(`${REALM_PREFIX}${state.realm.code}`, JSON.stringify(snapshot));
  }
}

function playerStoreKey() {
  return `${PLAYER_PREFIX}${state.realm.code}`;
}

function readRealmPlayers() {
  if (!state.realm.code) {
    return {};
  }
  const raw = localStorage.getItem(playerStoreKey());
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
  if (state.realm.code) {
    localStorage.setItem(playerStoreKey(), JSON.stringify(players));
  }
}

function renderFriends() {
  ui.friendsList.innerHTML = "";
  const players = Object.values(state.players).filter((player) => player.id !== state.playerId);
  if (!players.length) {
    const empty = document.createElement("div");
    empty.className = "friend-card";
    empty.innerHTML = "<h4>No realm friends yet</h4><p>Create or join a realm, then mark friends for voice chat.</p>";
    ui.friendsList.appendChild(empty);
    return;
  }

  players.forEach((player) => {
    const card = document.createElement("div");
    card.className = "friend-card";
    const isFriend = Boolean(state.realm.friends[player.id]);
    card.innerHTML = `<h4>${player.name}</h4><p>${player.dimension === "nether" ? "In the Nether" : "In the Overworld"}${isFriend ? " • friend voice enabled" : ""}</p>`;
    const button = document.createElement("button");
    button.type = "button";
    button.className = isFriend ? "ghost" : "primary";
    button.textContent = isFriend ? "Remove Friend" : "Add Friend";
    button.addEventListener("click", () => {
      if (isFriend) {
        delete state.realm.friends[player.id];
      } else {
        state.realm.friends[player.id] = true;
      }
      renderFriends();
      syncSelfPresence();
    });
    card.appendChild(button);
    ui.friendsList.appendChild(card);
  });
}

function setupRealmChannel() {
  if (!("BroadcastChannel" in window) || !state.realm.code) {
    return;
  }
  if (state.realm.channel) {
    state.realm.channel.close();
  }
  state.realm.channel = new BroadcastChannel(`awesomecraft-${state.realm.code}`);
  state.realm.channel.onmessage = (event) => handleRealmMessage(event.data);
}

function applyRealmSnapshot(snapshot) {
  if (!snapshot) {
    return;
  }
  state.dimensions = snapshot.dimensions || state.dimensions;
  state.boss = snapshot.boss || state.boss;
  state.dayClock = snapshot.dayClock !== undefined ? snapshot.dayClock : state.dayClock;
  state.activeTexturePack = snapshot.activeTexturePack || state.activeTexturePack;
  state.activeMashup = snapshot.activeMashup || state.activeMashup;
  state.activeMods = new Set(snapshot.activeMods || [...state.activeMods]);
  state.activeAddons = new Set(snapshot.activeAddons || [...state.activeAddons]);
  renderContentLibrary();
  renderHotbar();
  renderInventory();
  renderCrafting();
}

function refreshRealmPlayers() {
  state.players = readRealmPlayers();
  renderFriends();
  updateHud();
}

function syncRealmSnapshot(force = false) {
  if (!state.realm.connected || !state.realm.isHost) {
    return;
  }
  if (!force && Date.now() - state.realm.lastSnapshotAt < SNAPSHOT_INTERVAL_MS) {
    return;
  }
  state.realm.lastSnapshotAt = Date.now();
  const snapshot = {
    dimensions: state.dimensions,
    boss: state.boss,
    dayClock: state.dayClock,
    activeTexturePack: state.activeTexturePack,
    activeMashup: state.activeMashup,
    activeMods: [...state.activeMods],
    activeAddons: [...state.activeAddons],
  };
  writeRealmSnapshot(snapshot);
  if (state.realm.channel) {
    state.realm.channel.postMessage({ type: "snapshot", from: state.playerId, payload: snapshot });
  }
}

function syncSelfPresence() {
  if (!state.realm.connected) {
    return;
  }
  const players = readRealmPlayers();
  players[state.playerId] = {
    id: state.playerId,
    name: state.playerName,
    x: state.player.x,
    y: state.player.y,
    color: state.player.color,
    dimension: state.dimension,
    hp: state.player.hp,
    updatedAt: Date.now(),
  };
  writeRealmPlayers(players);
  if (state.realm.channel) {
    state.realm.channel.postMessage({ type: "ping", from: state.playerId });
  }
  refreshRealmPlayers();
}

function playVoiceMessage(message) {
  if (!state.realm.friends[message.from]) {
    return;
  }
  const audio = document.createElement("audio");
  audio.src = URL.createObjectURL(message.blob);
  audio.play().catch(() => {});
  audio.addEventListener("ended", () => URL.revokeObjectURL(audio.src));
}

function handleRealmMessage(message) {
  if (!message || message.from === state.playerId) {
    return;
  }
  if (message.type === "snapshot" && !state.realm.isHost) {
    applyRealmSnapshot(message.payload);
  }
  if (message.type === "ping") {
    refreshRealmPlayers();
  }
  if (message.type === "voice" && state.voice.enabled) {
    playVoiceMessage(message);
  }
}

function createRealm() {
  const code = (ui.realmCodeInput.value.trim() || "NETHER01").toUpperCase();
  state.realm.code = code;
  state.realm.connected = true;
  state.realm.isHost = true;
  setupRealmChannel();
  syncRealmSnapshot(true);
  syncSelfPresence();
  addLog(`Realm ${code} created.`);
  pushNotification(`Realm ${code} online.`);
  renderFriends();
  updateHud();
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
  }
  syncSelfPresence();
  addLog(`Joined realm ${code}.`);
  renderFriends();
  updateHud();
}

function leaveRealm() {
  if (!state.realm.connected) {
    return;
  }
  const players = readRealmPlayers();
  delete players[state.playerId];
  writeRealmPlayers(players);
  if (state.realm.channel) {
    state.realm.channel.close();
  }
  state.realm.channel = null;
  state.players = {};
  state.realm.connected = false;
  state.realm.isHost = false;
  state.realm.code = "";
  state.realm.friends = {};
  renderFriends();
  updateHud();
}

function enableVoiceChat() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.MediaRecorder) {
    pushNotification("Voice chat is not supported on this browser.");
    return;
  }
  if (state.voice.enabled) {
    if (state.voice.recorder) {
      state.voice.recorder.stop();
    }
    if (state.voice.stream) {
      state.voice.stream.getTracks().forEach((track) => track.stop());
    }
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
      if (event.data && event.data.size && state.realm.connected) {
        if (state.realm.channel) {
          state.realm.channel.postMessage({ type: "voice", from: state.playerId, blob: event.data });
        }
      }
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
    if (state.recording.recorder) {
      state.recording.recorder.stop();
    }
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
    if (event.data && event.data.size) {
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

function pollRealm() {
  if (!state.realm.connected) {
    return;
  }
  syncSelfPresence();
  if (!state.realm.isHost) {
    applyRealmSnapshot(readRealmSnapshot());
  } else {
    syncRealmSnapshot();
  }
}

function handleStorage(event) {
  if (!state.realm.connected) {
    return;
  }
  if (event.key === `${REALM_PREFIX}${state.realm.code}` && !state.realm.isHost) {
    applyRealmSnapshot(readRealmSnapshot());
  }
  if (event.key === playerStoreKey()) {
    refreshRealmPlayers();
  }
}

function summonBoss() {
  state.dimension = "overworld";
  state.player.x = gridToPixel(BOSS_SPAWN.x - 4);
  state.player.y = gridToPixel(BOSS_SPAWN.y);
  awakenBoss();
  updateCamera();
}

function quickHeal() {
  state.player.hp = state.player.maxHp;
  pushNotification("Health restored.");
  updateHud();
}

function handleKeyDown(event) {
  const key = event.key.toLowerCase();
  if (key === "w" || event.key === "ArrowUp") {
    input.up = true;
  }
  if (key === "s" || event.key === "ArrowDown") {
    input.down = true;
  }
  if (key === "a" || event.key === "ArrowLeft") {
    input.left = true;
  }
  if (key === "d" || event.key === "ArrowRight") {
    input.right = true;
  }
  if (event.key === " ") {
    event.preventDefault();
    attack();
  }
  if (key === "e") {
    event.preventDefault();
    toggleInventory();
  }
  if (key === "f") {
    interact();
  }
  if (key === "q") {
    breakTile();
  }
  if (key === "r") {
    placeTile();
  }
  if (key === "escape" && state.inventory.open) {
    toggleInventory(false);
  }
}

function handleKeyUp(event) {
  const key = event.key.toLowerCase();
  if (key === "w" || event.key === "ArrowUp") {
    input.up = false;
  }
  if (key === "s" || event.key === "ArrowDown") {
    input.down = false;
  }
  if (key === "a" || event.key === "ArrowLeft") {
    input.left = false;
  }
  if (key === "d" || event.key === "ArrowRight") {
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
  ui.voiceBtn.addEventListener("click", enableVoiceChat);
  ui.recordBtn.addEventListener("click", toggleRecording);
  ui.summonBossBtn.addEventListener("click", summonBoss);
  ui.healBtn.addEventListener("click", quickHeal);
  ui.openInventoryBtn.addEventListener("click", () => toggleInventory(true));
  ui.saveWorldBtn.addEventListener("click", saveWorld);
  ui.breakBtn.addEventListener("click", breakTile);
  ui.placeBtn.addEventListener("click", placeTile);
  ui.attackBtn.addEventListener("click", attack);
  ui.interactBtn.addEventListener("click", interact);
  ui.inventoryBtn.addEventListener("click", () => toggleInventory(true));
  ui.closeComputerBtn.addEventListener("click", () => closeDialog(ui.computerModal));
  ui.closeInventoryBtn.addEventListener("click", () => toggleInventory(false));
  ui.clearCraftingBtn.addEventListener("click", () => clearCraftingGrid(true));
  ui.craftOutputBtn.addEventListener("click", craftRecipe);
  ui.inventoryModal.addEventListener("close", () => {
    state.inventory.open = false;
  });
  ui.inventoryModal.addEventListener("cancel", (event) => {
    event.preventDefault();
    toggleInventory(false);
  });

  canvas.addEventListener("pointerdown", (event) => handleCanvasPointer(event.clientX, event.clientY));
  canvas.addEventListener("pointermove", (event) => {
    if (event.buttons === 1) {
      handleCanvasPointer(event.clientX, event.clientY);
    }
  });
  canvas.addEventListener("click", (event) => handleCanvasPointer(event.clientX, event.clientY));

  bindTouchMoveButtons();
}

function gameLoop(timestamp) {
  const dt = clamp((timestamp - state.lastTick) / 1000, 0, 0.034);
  state.lastTick = timestamp;

  updateDayNight(dt);
  updatePlayer(dt);
  if (!state.realm.connected || state.realm.isHost) {
    updateBoss(dt);
    updateMonsters(dt);
  }
  renderWorld();
  updateHud();
  requestAnimationFrame(gameLoop);
}

function initializeGame() {
  loadWorld();
  if (!state.dimensions.overworld.tiles.length) {
    resetWorlds();
  }
  state.playerName = ui.playerNameInput.value = state.playerName;
  bindEvents();
  resizeCanvas();
  renderHotbar();
  renderInventory();
  renderCrafting();
  renderContentLibrary();
  renderBuildTube();
  renderFriends();
  addLog("AWESOMECRAFT expanded: press E for inventory and F to use portals or computers.");
  addLog("Night now brings monsters, and the Nether portal can take you below.");
  updateCamera();
  updateHud();
  setInterval(pollRealm, PRESENCE_INTERVAL_MS);
  requestAnimationFrame((timestamp) => {
    state.lastTick = timestamp;
    gameLoop(timestamp);
  });
  window.__awesomeBooted = true;
}

initializeGame();
