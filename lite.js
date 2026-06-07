(function () {
  var canvas = document.getElementById("gameCanvas");
  if (!canvas || !canvas.getContext) {
    return;
  }

  var ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  var ui = {
    installAppBtn: document.getElementById("installAppBtn"),
    installHint: document.getElementById("installHint"),
    playerNameInput: document.getElementById("playerNameInput"),
    playerLookLabel: document.getElementById("playerLookLabel"),
    playerPreviewCard: document.getElementById("playerPreviewCard"),
    playerSkinOptions: document.getElementById("playerSkinOptions"),
    playerShirtOptions: document.getElementById("playerShirtOptions"),
    playerHairOptions: document.getElementById("playerHairOptions"),
    playerGearOptions: document.getElementById("playerGearOptions"),
    realmCodeInput: document.getElementById("realmCodeInput"),
    createRealmBtn: document.getElementById("createRealmBtn"),
    joinRealmBtn: document.getElementById("joinRealmBtn"),
    leaveRealmBtn: document.getElementById("leaveRealmBtn"),
    voiceBtn: document.getElementById("voiceBtn"),
    recordBtn: document.getElementById("recordBtn"),
    summonBossBtn: document.getElementById("summonBossBtn"),
    healBtn: document.getElementById("healBtn"),
    openInventoryBtn: document.getElementById("openInventoryBtn"),
    toggleViewBtn: document.getElementById("toggleViewBtn"),
    saveWorldBtn: document.getElementById("saveWorldBtn"),
    breakBtn: document.getElementById("breakBtn"),
    placeBtn: document.getElementById("placeBtn"),
    attackBtn: document.getElementById("attackBtn"),
    interactBtn: document.getElementById("interactBtn"),
    inventoryBtn: document.getElementById("inventoryBtn"),
    modeMenu: document.getElementById("modeMenu"),
    newWorldTabBtn: document.getElementById("newWorldTabBtn"),
    loadWorldTabBtn: document.getElementById("loadWorldTabBtn"),
    newWorldPanel: document.getElementById("newWorldPanel"),
    loadWorldPanel: document.getElementById("loadWorldPanel"),
    singlePlayerBtn: document.getElementById("singlePlayerBtn"),
    multiPlayerBtn: document.getElementById("multiPlayerBtn"),
    worldNameInput: document.getElementById("worldNameInput"),
    survivalModeBtn: document.getElementById("survivalModeBtn"),
    creativeModeBtn: document.getElementById("creativeModeBtn"),
    playNewWorldBtn: document.getElementById("playNewWorldBtn"),
    secretWorldBtn: document.getElementById("secretWorldBtn"),
    savedWorldList: document.getElementById("savedWorldList"),
    modeStatus: document.getElementById("modeStatus"),
    pauseMenu: document.getElementById("pauseMenu"),
    resumeGameBtn: document.getElementById("resumeGameBtn"),
    pauseSaveBtn: document.getElementById("pauseSaveBtn"),
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
    viewModeBadge: document.getElementById("viewModeBadge"),
    buildTubeHint: document.getElementById("buildTubeHint"),
    eventLog: document.getElementById("eventLog"),
    bossBanner: document.getElementById("bossBanner"),
    bossTitle: document.getElementById("bossTitleText"),
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
    recipeHint: document.getElementById("recipeHint")
  };

  var WORLD_W = 160;
  var WORLD_H = 120;
  var TILE = 44;
  var ISO_W = 42;
  var ISO_H = 21;
  var BLOCK_H = 18;
  var PLAYER_SPEED = 4;
  var TURN_SPEED = 2.9;
  var HOTBAR_SIZE = 9;
  var VIEW_DISTANCE = 18;
  var CAMERA_EYE_HEIGHT = 1.7;
  var NEAR_CLIP = 0.18;
  var SAVE_KEY = "awesomecraft.lite.v4";
  var WORLD_INDEX_KEY = "awesomecraft.worldIndex.v1";
  var WORLD_SAVE_PREFIX = "awesomecraft.world.";
  var portalPoints = {
    overworld: { x: 36, y: 28, target: "nether", spawnX: 24, spawnY: 24 },
    nether: { x: 24, y: 24, target: "overworld", spawnX: 37, spawnY: 29 },
    netherEnd: { x: 122, y: 22, target: "end", spawnX: 74, spawnY: 56 },
    end: { x: 76, y: 56, target: "overworld", spawnX: 16, spawnY: 16 }
  };
  var slimeBossPoint = { x: 136, y: 46 };
  var dragonBossPoint = { x: 88, y: 52 };

  var colors = {
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
    endstone: "#d6cf93",
    obsidian: "#34294f",
    void: "#11091d",
    endportal: "#63d5ff",
    dragonaltar: "#4b3e68",
    dragon: "#26292f"
  };

  var texturePacks = ["Classic Crisp", "Golden Sunset", "BuildGrid XT"];
  var mashups = ["Slime Frontier", "Candy Crash", "Retro Neon"];
  var mods = ["Slime Splitter", "Builder Boots", "Bounce Core"];
  var addons = ["Computer Labs", "Crystal Caves", "Mash-Up Posters"];
  var videos = [
    {
      title: "Slime-proof Tower",
      creator: "Builder Bran",
      description: "A tall tower for survival nights and boss defense.",
      steps: ["Lay a 6x6 stone base.", "Alternate wood and glass every second layer.", "Top it with slime bricks."]
    },
    {
      title: "Pocket Realm Hub",
      creator: "RealmRider",
      description: "A quick portal hub with a BuildTube desk.",
      steps: ["Frame a glass plaza.", "Place two computers by the door.", "Use slime blocks to mark the portal lane."]
    }
  ];

  var itemDefs = {
    stone: { label: "Stone Block", color: colors.stone, placeable: true },
    wood: { label: "Wood Block", color: colors.wood, placeable: true },
    glass: { label: "Glass Block", color: colors.glass, placeable: true },
    computer: { label: "Computer", color: colors.computer, placeable: true },
    slime: { label: "Slime Brick", color: colors.slime, placeable: true },
    portal: { label: "Portal Core", color: colors.portal, placeable: true },
    crystal: { label: "Crystal", color: colors.crystal, placeable: false }
  };

  var recipes = [
    { key: "stone,stone,,stone,stone,,,,", item: "glass", count: 4, label: "Glass Block x4" },
    { key: "glass,glass,glass,glass,crystal,glass,stone,stone,stone", item: "computer", count: 1, label: "Computer x1" },
    { key: "stone,crystal,stone,crystal,slime,crystal,stone,crystal,stone", item: "portal", count: 1, label: "Portal Core x1" }
  ];

  var playerLookOptions = {
    skin: [
      { id: "sand", label: "Sand", color: "#f2d4ad" },
      { id: "honey", label: "Honey", color: "#d4a87e" },
      { id: "cocoa", label: "Cocoa", color: "#9c6a4f" },
      { id: "ember", label: "Ember", color: "#71483c" }
    ],
    shirt: [
      { id: "mint", label: "Mint", color: "#5fd3ad" },
      { id: "ocean", label: "Ocean", color: "#4fa1ff" },
      { id: "sunset", label: "Sunset", color: "#ff9d5c" },
      { id: "violet", label: "Violet", color: "#9b74ff" }
    ],
    hair: [
      { id: "night", label: "Night", color: "#1c2433" },
      { id: "walnut", label: "Walnut", color: "#5b3929" },
      { id: "flame", label: "Flame", color: "#b85b2e" },
      { id: "frost", label: "Frost", color: "#d8ebff" }
    ],
    gear: [
      { id: "none", label: "None", color: "#5d6872", detail: "#263039" },
      { id: "cap", label: "Cap", color: "#39c398", detail: "#13634d" },
      { id: "crown", label: "Crown", color: "#ffd76a", detail: "#b87d04" },
      { id: "visor", label: "Visor", color: "#78c8ff", detail: "#1e5c86" }
    ]
  };

  var defaultPlayerStyle = {
    skin: "sand",
    shirt: "mint",
    hair: "night",
    gear: "cap"
  };

  var input = { up: false, down: false, left: false, right: false };
  var lookDrag = { active: false, lastX: 0 };
  var deferredInstallPrompt = null;

  var state = {
    playerName: "BuilderOne",
    playerStyle: {
      skin: "sand",
      shirt: "mint",
      hair: "night",
      gear: "cap"
    },
    worldName: "My World",
    currentWorldId: "",
    gameMode: "survival",
    realmCode: "",
    connected: false,
    friends: 1,
    startMenuTab: "new",
    pendingWorldMode: "survival",
    pendingConnection: false,
    viewMode: "classic",
    dimension: "overworld",
    dayClock: 0.3,
    night: false,
    inventoryOpen: false,
    modeMenuOpen: false,
    pauseMenuOpen: false,
    worlds: { overworld: null, nether: null, end: null },
    player: { x: 0, y: 0, hp: 20, maxHp: 20, facing: "down", yaw: 0, attackCooldown: 0 },
    boss: { kind: "slime", name: "Giga Slime", dimension: "overworld", x: 0, y: 0, hp: 100, maxHp: 100, awake: false, defeated: false, color: colors.slime, speed: 2.1, damage: 6, orbit: 0 },
    monsters: { overworld: [], nether: [], end: [] },
    inventory: [],
    crafting: ["", "", "", "", "", "", "", "", ""],
    selectedInventoryIndex: null,
    selectedHotbarIndex: 0,
    targetTile: null,
    logs: [],
    notes: [],
    camera: { x: 0, y: 0 },
    videoIndex: 0,
    lastTick: 0
  };

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function clearInput() {
    input.up = false;
    input.down = false;
    input.left = false;
    input.right = false;
    lookDrag.active = false;
  }

  function isFirstPersonView() {
    return state.viewMode === "firstperson";
  }

  function normalizeAngle(angle) {
    while (angle <= -Math.PI) {
      angle += Math.PI * 2;
    }
    while (angle > Math.PI) {
      angle -= Math.PI * 2;
    }
    return angle;
  }

  function yawFromFacing(facing) {
    if (facing === "right") {
      return Math.PI * 0.5;
    }
    if (facing === "up") {
      return Math.PI;
    }
    if (facing === "left") {
      return Math.PI * -0.5;
    }
    return 0;
  }

  function facingFromYaw(yaw) {
    var angle = normalizeAngle(yaw);
    if (angle > Math.PI * 0.25 && angle <= Math.PI * 0.75) {
      return "right";
    }
    if (angle < -Math.PI * 0.25 && angle >= -Math.PI * 0.75) {
      return "left";
    }
    if (Math.abs(angle) > Math.PI * 0.75) {
      return "up";
    }
    return "down";
  }

  function normalizePlayerDirection() {
    if (typeof state.player.yaw !== "number") {
      state.player.yaw = yawFromFacing(state.player.facing);
    }
    state.player.yaw = normalizeAngle(state.player.yaw);
    state.player.facing = facingFromYaw(state.player.yaw);
  }

  function turnPlayer(amount) {
    state.player.yaw = normalizeAngle(state.player.yaw + amount);
    state.player.facing = facingFromYaw(state.player.yaw);
    state.targetTile = null;
  }

  function viewModeLabel(mode) {
    return mode === "firstperson" ? "First Person" : "Classic";
  }

  function updateViewModeUI() {
    if (ui.viewModeBadge) {
      ui.viewModeBadge.textContent = viewModeLabel(state.viewMode);
    }
    if (ui.toggleViewBtn) {
      ui.toggleViewBtn.textContent = isFirstPersonView() ? "Turn Off First Person" : "Turn On First Person";
    }
    updateMoveButtonLabels();
  }

  function updateMoveButtonLabels() {
    var labels = isFirstPersonView() ? {
      up: "Forward",
      down: "Back",
      left: "Turn Left",
      right: "Turn Right"
    } : {
      up: "Up",
      down: "Down",
      left: "Left",
      right: "Right"
    };
    var key;
    var button;
    for (key in labels) {
      if (Object.prototype.hasOwnProperty.call(labels, key)) {
        button = document.querySelector('[data-move="' + key + '"]');
        if (button) {
          button.textContent = labels[key];
        }
      }
    }
  }

  function setViewMode(mode, silent) {
    state.viewMode = mode === "firstperson" ? "firstperson" : "classic";
    normalizePlayerDirection();
    state.targetTile = null;
    updateViewModeUI();
    if (state.currentWorldId) {
      saveGame(true);
    }
    if (!silent) {
      notify(isFirstPersonView() ? "First Person mode is on." : "First Person mode is off.");
    }
  }

  function toggleViewMode(silent) {
    setViewMode(isFirstPersonView() ? "classic" : "firstperson", silent);
  }

  function isStandaloneMode() {
    return !!((window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) || window.navigator.standalone);
  }

  function isAppleMobileBrowser() {
    var ua = (window.navigator.userAgent || "").toLowerCase();
    return ua.indexOf("iphone") !== -1 || ua.indexOf("ipad") !== -1 || ua.indexOf("ipod") !== -1;
  }

  function updateInstallUI() {
    if (!ui.installAppBtn || !ui.installHint) {
      return;
    }
    if (isStandaloneMode()) {
      ui.installAppBtn.textContent = "Installed";
      ui.installAppBtn.disabled = true;
      ui.installHint.textContent = "AWESOMECRAFT is ready from your home screen.";
      return;
    }
    ui.installAppBtn.disabled = false;
    if (deferredInstallPrompt) {
      ui.installAppBtn.textContent = "Install App";
      ui.installHint.textContent = "Add AWESOMECRAFT to your home screen for quick play.";
      return;
    }
    if (isAppleMobileBrowser()) {
      ui.installAppBtn.textContent = "Add to Home Screen";
      ui.installHint.textContent = "On iPad, tap Share and then Add to Home Screen.";
      return;
    }
    if (window.location.protocol.indexOf("http") !== 0) {
      ui.installAppBtn.textContent = "Use Live Link";
      ui.installHint.textContent = "Open the hosted version to install AWESOMECRAFT like an app.";
      return;
    }
    ui.installAppBtn.textContent = "Install Tips";
    ui.installHint.textContent = "Use your browser menu to install AWESOMECRAFT like an app.";
  }

  function handleInstallApp() {
    if (isStandaloneMode()) {
      notify("AWESOMECRAFT is already on your home screen.");
      return;
    }
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      deferredInstallPrompt.userChoice.then(function (choiceResult) {
        deferredInstallPrompt = null;
        updateInstallUI();
        if (choiceResult && choiceResult.outcome === "accepted") {
          notify("Install started.");
        } else {
          notify("Install cancelled.");
        }
      }).catch(function () {
        deferredInstallPrompt = null;
        updateInstallUI();
      });
      return;
    }
    if (isAppleMobileBrowser()) {
      notify("On iPad, tap Share and then choose Add to Home Screen.");
      return;
    }
    if (window.location.protocol.indexOf("http") !== 0) {
      notify("Open the hosted AWESOMECRAFT link to add it to your home screen.");
      return;
    }
    notify("Open your browser menu and choose Install App or Add to Home Screen.");
  }

  function registerInstallSupport() {
    updateInstallUI();
    if (window.addEventListener) {
      window.addEventListener("beforeinstallprompt", function (event) {
        event.preventDefault();
        deferredInstallPrompt = event;
        updateInstallUI();
      });
      window.addEventListener("appinstalled", function () {
        deferredInstallPrompt = null;
        updateInstallUI();
        notify("AWESOMECRAFT installed.");
      });
    }
    if ("serviceWorker" in navigator && window.location.protocol.indexOf("http") === 0) {
      navigator.serviceWorker.register("./service-worker.js").then(function () {
        updateInstallUI();
      }).catch(function () {
        updateInstallUI();
      });
    }
  }

  function playerLookOption(groupName, id) {
    var options = playerLookOptions[groupName] || [];
    var i;
    for (i = 0; i < options.length; i += 1) {
      if (options[i].id === id) {
        return options[i];
      }
    }
    return options[0];
  }

  function normalizePlayerStyle(style) {
    style = style || defaultPlayerStyle;
    return {
      skin: playerLookOption("skin", style.skin).id,
      shirt: playerLookOption("shirt", style.shirt).id,
      hair: playerLookOption("hair", style.hair).id,
      gear: playerLookOption("gear", style.gear).id
    };
  }

  function playerStyleSummary() {
    var shirt = playerLookOption("shirt", state.playerStyle.shirt);
    var gear = playerLookOption("gear", state.playerStyle.gear);
    return shirt.label + " " + (gear.id === "none" ? "Builder" : gear.label);
  }

  function playerOptionSwatch(groupName, option) {
    if (groupName === "gear") {
      return "linear-gradient(135deg, " + option.color + ", " + option.detail + ")";
    }
    return option.color;
  }

  function renderPlayerOptionGroup(container, groupName) {
    var options = playerLookOptions[groupName] || [];
    var selected = state.playerStyle[groupName];
    var html = "";
    var i;
    if (!container) {
      return;
    }
    for (i = 0; i < options.length; i += 1) {
      html += '<button type="button" class="player-style-chip' + (selected === options[i].id ? ' selected' : '') + '" data-player-style-group="' + groupName + '" data-player-style-id="' + options[i].id + '">';
      html += '<span class="player-style-swatch" style="background:' + playerOptionSwatch(groupName, options[i]) + '"></span>';
      html += options[i].label + '</button>';
    }
    container.innerHTML = html;
  }

  function renderPlayerMaker() {
    var skin;
    var shirt;
    var hair;
    var gear;
    state.playerStyle = normalizePlayerStyle(state.playerStyle);
    skin = playerLookOption("skin", state.playerStyle.skin);
    shirt = playerLookOption("shirt", state.playerStyle.shirt);
    hair = playerLookOption("hair", state.playerStyle.hair);
    gear = playerLookOption("gear", state.playerStyle.gear);
    if (ui.playerLookLabel) {
      ui.playerLookLabel.textContent = playerStyleSummary();
    }
    if (ui.playerPreviewCard) {
      ui.playerPreviewCard.style.setProperty("--skin-color", skin.color);
      ui.playerPreviewCard.style.setProperty("--shirt-color", shirt.color);
      ui.playerPreviewCard.style.setProperty("--hair-color", hair.color);
      ui.playerPreviewCard.style.setProperty("--gear-color", gear.color);
      ui.playerPreviewCard.style.setProperty("--gear-detail", gear.detail || gear.color);
      ui.playerPreviewCard.setAttribute("data-gear", gear.id);
    }
    renderPlayerOptionGroup(ui.playerSkinOptions, "skin");
    renderPlayerOptionGroup(ui.playerShirtOptions, "shirt");
    renderPlayerOptionGroup(ui.playerHairOptions, "hair");
    renderPlayerOptionGroup(ui.playerGearOptions, "gear");
  }

  function setPlayerStyle(groupName, styleId) {
    state.playerStyle = normalizePlayerStyle(state.playerStyle);
    state.playerStyle[groupName] = playerLookOption(groupName, styleId).id;
    renderPlayerMaker();
    renderFriends();
    if (state.currentWorldId) {
      saveGame(true);
    }
  }

  function dimensionLabel(name) {
    if (name === "nether") {
      return "Nether";
    }
    if (name === "end") {
      return "The End";
    }
    return "Overworld";
  }

  function setupBoss(kind) {
    if (kind === "dragon") {
      state.boss.kind = "dragon";
      state.boss.name = "Ender Dragon";
      state.boss.dimension = "end";
      state.boss.x = gridToPixel(dragonBossPoint.x);
      state.boss.y = gridToPixel(dragonBossPoint.y);
      state.boss.maxHp = 160;
      state.boss.hp = state.boss.maxHp;
      state.boss.color = colors.dragon;
      state.boss.speed = 2.8;
      state.boss.damage = 9;
      state.boss.orbit = 0;
      return;
    }
    state.boss.kind = "slime";
    state.boss.name = "Giga Slime";
    state.boss.dimension = "overworld";
    state.boss.x = gridToPixel(slimeBossPoint.x + 1);
    state.boss.y = gridToPixel(slimeBossPoint.y);
    state.boss.maxHp = 100;
    state.boss.hp = state.boss.maxHp;
    state.boss.color = colors.slime;
    state.boss.speed = 2.1;
    state.boss.damage = 6;
    state.boss.orbit = 0;
  }

  function bossIsVisible() {
    return state.dimension === state.boss.dimension && state.boss.awake && !state.boss.defeated;
  }

  function isCreativeMode() {
    return state.gameMode === "creative";
  }

  function applyCreativeLoadout() {
    state.inventory = [
      { id: "stone", count: 999 },
      { id: "wood", count: 999 },
      { id: "glass", count: 999 },
      { id: "computer", count: 16 },
      { id: "slime", count: 999 },
      { id: "portal", count: 16 },
      { id: "crystal", count: 64 },
      { id: "stone", count: 999 },
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null
    ];
  }

  function worldSnapshotKey(id) {
    return WORLD_SAVE_PREFIX + id;
  }

  function loadWorldIndex() {
    try {
      return JSON.parse(localStorage.getItem(WORLD_INDEX_KEY) || "[]");
    } catch (error) {
      return [];
    }
  }

  function saveWorldIndex(list) {
    localStorage.setItem(WORLD_INDEX_KEY, JSON.stringify(list));
  }

  function formatWorldDate(value) {
    var stamp = new Date(value);
    if (isNaN(stamp.getTime())) {
      return "Unknown save";
    }
    return stamp.toLocaleString();
  }

  function renderSavedWorlds() {
    var worlds = loadWorldIndex();
    var html = "";
    var i;
    if (!worlds.length) {
      ui.savedWorldList.innerHTML = '<div class="saved-world-card"><h3>No saved worlds yet</h3><p class="small-copy">Create a new world, then use Save World to keep it here.</p></div>';
      return;
    }
    worlds.sort(function (left, right) {
      return String(right.updatedAt || "").localeCompare(String(left.updatedAt || ""));
    });
    for (i = 0; i < worlds.length; i += 1) {
      html += '<div class="saved-world-card">';
      html += '<h3>' + worlds[i].name + '</h3>';
      html += '<div class="saved-world-meta">';
      html += '<span class="badge">' + (worlds[i].mode === "creative" ? "Creative" : "Survival") + '</span>';
      html += '<span class="badge accent">' + (worlds[i].playType === "multiplayer" ? "Multiplayer" : "Single Player") + '</span>';
      html += '</div>';
      html += '<p class="small-copy">Saved ' + formatWorldDate(worlds[i].updatedAt) + '</p>';
      html += '<button type="button" class="primary" data-load-world="' + worlds[i].id + '">Play ' + worlds[i].name + '</button>';
      html += '</div>';
    }
    ui.savedWorldList.innerHTML = html;
  }

  function renderStartMenu() {
    ui.newWorldTabBtn.className = state.startMenuTab === "new" ? "primary" : "";
    ui.loadWorldTabBtn.className = state.startMenuTab === "load" ? "primary" : "";
    ui.newWorldPanel.className = "start-panel" + (state.startMenuTab === "new" ? "" : " hidden-panel");
    ui.loadWorldPanel.className = "start-panel" + (state.startMenuTab === "load" ? "" : " hidden-panel");
    ui.singlePlayerBtn.className = state.pendingConnection ? "" : "primary";
    ui.multiPlayerBtn.className = state.pendingConnection ? "primary" : "";
    ui.survivalModeBtn.className = state.pendingWorldMode === "survival" ? "primary" : "";
    ui.creativeModeBtn.className = state.pendingWorldMode === "creative" ? "primary" : "";
    renderSavedWorlds();
  }

  function buildWorldSnapshot() {
    return {
      playerName: state.playerName,
      playerStyle: state.playerStyle,
      worldName: state.worldName,
      gameMode: state.gameMode,
      connected: state.connected,
      realmCode: state.realmCode,
      viewMode: state.viewMode,
      dimension: state.dimension,
      dayClock: state.dayClock,
      worlds: state.worlds,
      monsters: state.monsters,
      boss: state.boss,
      player: state.player,
      inventory: state.inventory
    };
  }

  function applyWorldSnapshot(payload, worldId) {
    seedInventory();
    resetWorlds();
    state.currentWorldId = worldId || "";
    state.playerName = payload.playerName || state.playerName;
    state.playerStyle = normalizePlayerStyle(payload.playerStyle);
    state.worldName = payload.worldName || state.worldName;
    state.gameMode = payload.gameMode || "survival";
    state.connected = !!payload.connected;
    state.realmCode = payload.realmCode || "";
    state.viewMode = payload.viewMode === "firstperson" ? "firstperson" : "classic";
    state.dimension = payload.dimension || state.dimension;
    state.dayClock = typeof payload.dayClock === "number" ? payload.dayClock : state.dayClock;
    state.worlds = payload.worlds || state.worlds;
    state.monsters = payload.monsters || state.monsters;
    state.boss = payload.boss || state.boss;
    state.player = payload.player || state.player;
    normalizePlayerDirection();
    state.inventory = payload.inventory || state.inventory;
    if (!state.boss.kind) {
      setupBoss("slime");
      state.boss.awake = false;
      state.boss.defeated = false;
    }
    if (!state.worlds.end) {
      buildEnd();
    }
    if (!state.monsters.end) {
      state.monsters.end = [];
    }
    updateViewModeUI();
    updateCamera();
  }

  function createWorldId() {
    return "world-" + new Date().getTime();
  }

  function gridToPixel(value) {
    return value * TILE + TILE / 2;
  }

  function pixelToGrid(value) {
    return Math.floor(value / TILE);
  }

  function currentWorld() {
    return state.worlds[state.dimension];
  }

  function tileAt(worldName, x, y) {
    var tiles = state.worlds[worldName];
    if (!tiles || y < 0 || x < 0 || y >= WORLD_H || x >= WORLD_W) {
      return null;
    }
    return tiles[y][x];
  }

  function makeGrid(defaultFloor) {
    var rows = [];
    var y;
    var x;
    for (y = 0; y < WORLD_H; y += 1) {
      rows[y] = [];
      for (x = 0; x < WORLD_W; x += 1) {
        rows[y][x] = { floor: defaultFloor, object: "" };
      }
    }
    return rows;
  }

  function placeRandom(worldName, floorName, objectName, count) {
    var placed = 0;
    var tries = 0;
    while (placed < count && tries < count * 40) {
      var x = Math.floor(rand(4, WORLD_W - 4));
      var y = Math.floor(rand(4, WORLD_H - 4));
      var tile = tileAt(worldName, x, y);
      tries += 1;
      if (tile && tile.floor === floorName && !tile.object) {
        tile.object = objectName;
        placed += 1;
      }
    }
  }

  function paintPatch(worldName, centerX, centerY, radius, floorName) {
    var x;
    var y;
    var tile;
    for (y = centerY - radius; y <= centerY + radius; y += 1) {
      for (x = centerX - radius; x <= centerX + radius; x += 1) {
        tile = tileAt(worldName, x, y);
        if (tile && Math.hypot(x - centerX, y - centerY) <= radius + rand(0, 1)) {
          tile.floor = floorName;
          if (floorName === "water" || floorName === "lava") {
            tile.object = "";
          }
        }
      }
    }
  }

  function buildOverworld() {
    var world = makeGrid("grass");
    var x;
    var y;
    for (y = 0; y < WORLD_H; y += 1) {
      for (x = 0; x < WORLD_W; x += 1) {
        if (x < 3 || y < 3 || x > WORLD_W - 4 || y > WORLD_H - 4) {
          world[y][x].floor = "stone";
        } else if ((x + y) % 13 === 0) {
          world[y][x].floor = "dirt";
        }
      }
    }
    state.worlds.overworld = world;
    for (x = 0; x < 36; x += 1) {
      paintPatch("overworld", Math.floor(rand(6, WORLD_W - 6)), Math.floor(rand(6, WORLD_H - 6)), Math.floor(rand(2, 6)), "water");
    }
    placeRandom("overworld", "grass", "wood", 72);
    placeRandom("overworld", "grass", "leaves", 50);
    placeRandom("overworld", "stone", "stone", 70);
    placeRandom("overworld", "stone", "crystal", 34);
    placeRandom("overworld", "grass", "computer", 24);
    for (y = 30; y < 60; y += 1) {
      for (x = 120; x < 150; x += 1) {
        world[y][x].floor = (x + y) % 2 === 0 ? "slime" : "stone";
      }
    }
    world[slimeBossPoint.y][slimeBossPoint.x].object = "altar";
    world[slimeBossPoint.y][slimeBossPoint.x + 1].object = "slime";
    world[portalPoints.overworld.y][portalPoints.overworld.x].object = "portal";
  }

  function buildNether() {
    var world = makeGrid("netherrack");
    var x;
    var y;
    for (y = 0; y < WORLD_H; y += 1) {
      for (x = 0; x < WORLD_W; x += 1) {
        if (x < 3 || y < 3 || x > WORLD_W - 4 || y > WORLD_H - 4) {
          world[y][x].floor = "ash";
        } else if ((x + y) % 11 === 0) {
          world[y][x].floor = "ash";
        }
      }
    }
    state.worlds.nether = world;
    for (x = 0; x < 40; x += 1) {
      paintPatch("nether", Math.floor(rand(5, WORLD_W - 5)), Math.floor(rand(5, WORLD_H - 5)), Math.floor(rand(2, 6)), "lava");
    }
    placeRandom("nether", "ash", "stone", 64);
    placeRandom("nether", "netherrack", "slime", 44);
    placeRandom("nether", "ash", "crystal", 28);
    world[portalPoints.nether.y][portalPoints.nether.x].object = "portal";
    world[portalPoints.netherEnd.y][portalPoints.netherEnd.x].object = "endportal";
  }

  function buildEnd() {
    var world = makeGrid("void");
    var x;
    var y;
    state.worlds.end = world;
    paintPatch("end", dragonBossPoint.x, dragonBossPoint.y, 18, "endstone");
    paintPatch("end", dragonBossPoint.x - 16, dragonBossPoint.y + 8, 9, "endstone");
    paintPatch("end", portalPoints.end.x, portalPoints.end.y, 11, "endstone");
    for (y = dragonBossPoint.y - 5; y <= dragonBossPoint.y + 5; y += 1) {
      for (x = dragonBossPoint.x - 5; x <= dragonBossPoint.x + 5; x += 1) {
        if (tileAt("end", x, y) && Math.abs(x - dragonBossPoint.x) + Math.abs(y - dragonBossPoint.y) < 7) {
          tileAt("end", x, y).floor = (x + y) % 2 === 0 ? "obsidian" : "endstone";
        }
      }
    }
    placeRandom("end", "endstone", "crystal", 30);
    placeRandom("end", "obsidian", "crystal", 10);
    world[dragonBossPoint.y][dragonBossPoint.x].object = "dragonaltar";
    world[dragonBossPoint.y][dragonBossPoint.x + 2].object = "crystal";
    world[portalPoints.end.y][portalPoints.end.x].object = "endportal";
  }

  function resetWorlds() {
    buildOverworld();
    buildNether();
    buildEnd();
    state.dimension = "overworld";
    state.player.x = gridToPixel(12);
    state.player.y = gridToPixel(12);
    state.player.hp = state.player.maxHp;
    state.player.facing = "down";
    state.player.yaw = 0;
    setupBoss("slime");
    state.boss.awake = false;
    state.boss.defeated = false;
    state.monsters.overworld = [];
    state.monsters.nether = [];
    state.monsters.end = [];
  }

  function seedInventory() {
    state.inventory = [
      { id: "stone", count: 64 },
      { id: "wood", count: 48 },
      { id: "glass", count: 24 },
      { id: "computer", count: 2 },
      { id: "slime", count: 18 },
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
      null
    ];
  }

  function addLog(message) {
    state.logs.unshift(message);
    if (state.logs.length > 12) {
      state.logs.length = 12;
    }
    renderLogs();
  }

  function notify(message) {
    state.notes.unshift(message);
    if (state.notes.length > 3) {
      state.notes.length = 3;
    }
    renderNotes();
  }

  function renderNotes() {
    var html = "";
    var i;
    for (i = 0; i < state.notes.length; i += 1) {
      html += '<div class="toast">' + state.notes[i] + "</div>";
    }
    ui.notificationStack.innerHTML = html;
  }

  function renderLogs() {
    var html = "";
    var i;
    for (i = 0; i < state.logs.length; i += 1) {
      html += '<div class="log-entry">' + state.logs[i] + "</div>";
    }
    ui.eventLog.innerHTML = html;
  }

  function itemLabel(itemId) {
    return itemDefs[itemId] ? itemDefs[itemId].label : "Unknown";
  }

  function itemColor(itemId) {
    return itemDefs[itemId] ? itemDefs[itemId].color : "#6f7882";
  }

  function selectedHotbarItem() {
    return state.inventory[state.selectedHotbarIndex] || null;
  }

  function addItem(itemId, count) {
    var i;
    for (i = 0; i < state.inventory.length; i += 1) {
      if (state.inventory[i] && state.inventory[i].id === itemId && state.inventory[i].count < 64) {
        state.inventory[i].count += count;
        renderHotbar();
        renderInventory();
        return true;
      }
    }
    for (i = 0; i < state.inventory.length; i += 1) {
      if (!state.inventory[i]) {
        state.inventory[i] = { id: itemId, count: count };
        renderHotbar();
        renderInventory();
        return true;
      }
    }
    return false;
  }

  function takeItem(index, count) {
    if (!state.inventory[index] || state.inventory[index].count < count) {
      return false;
    }
    state.inventory[index].count -= count;
    if (state.inventory[index].count <= 0) {
      state.inventory[index] = null;
    }
    renderHotbar();
    renderInventory();
    return true;
  }

  function craftingKey() {
    return state.crafting.join(",");
  }

  function findRecipe() {
    var key = craftingKey();
    var i;
    for (i = 0; i < recipes.length; i += 1) {
      if (recipes[i].key === key) {
        return recipes[i];
      }
    }
    return null;
  }

  function renderHotbar() {
    var html = "";
    var i;
    var slot;
    for (i = 0; i < HOTBAR_SIZE; i += 1) {
      slot = state.inventory[i];
      html += '<button type="button" title="' + (slot ? itemLabel(slot.id) + " x" + slot.count : "Empty slot") + '" class="hotbar-slot' + (state.selectedHotbarIndex === i ? " selected" : "") + '" data-hotbar="' + i + '">';
      html += '<div class="slot-art">';
      html += '<div class="swatch" style="background:' + (slot ? itemColor(slot.id) : "rgba(255,255,255,0.08)") + '"></div>';
      if (slot) {
        html += '<span class="slot-count-badge">' + slot.count + "</span>";
      }
      html += "</div>";
      html += '<div class="slot-name">' + (slot ? itemLabel(slot.id) : "") + "</div>";
      html += "</button>";
    }
    ui.hotbar.innerHTML = html;
  }

  function renderContentList(root, items) {
    var html = "";
    var i;
    for (i = 0; i < items.length; i += 1) {
      html += '<div class="pack-card active"><h4>' + items[i] + "</h4><p>Ready to use.</p></div>";
    }
    root.innerHTML = html;
  }

  function renderLibrary() {
    renderContentList(ui.texturePackList, texturePacks);
    renderContentList(ui.mashupList, mashups);
    renderContentList(ui.modsList, mods);
    renderContentList(ui.addonsList, addons);
    ui.tutorialPreview.textContent = "Featured: " + videos[0].title + ", " + videos[1].title + ".";
  }

  function renderBuildTube() {
    var html = "";
    var i;
    for (i = 0; i < videos.length; i += 1) {
      html += '<div class="buildtube-item' + (state.videoIndex === i ? " active" : "") + '" data-video="' + i + '"><h4>' + videos[i].title + "</h4><p>" + videos[i].creator + "</p></div>";
    }
    ui.buildTubeList.innerHTML = html;
    ui.videoTitle.textContent = videos[state.videoIndex].title;
    ui.videoCreator.textContent = "by " + videos[state.videoIndex].creator;
    ui.videoDescription.textContent = videos[state.videoIndex].description;
    html = "";
    for (i = 0; i < videos[state.videoIndex].steps.length; i += 1) {
      html += '<div class="step-card">' + (i + 1) + ". " + videos[state.videoIndex].steps[i] + "</div>";
    }
    ui.videoSteps.innerHTML = html;
  }

  function renderFriends() {
    if (state.connected) {
      ui.friendsList.innerHTML = '<div class="friend-card"><h4>' + state.playerName + '</h4><p>' + playerStyleSummary() + ' realm host ready</p></div>';
      ui.playerCount.textContent = "1 online";
    } else {
      ui.friendsList.innerHTML = '<div class="friend-card"><h4>No realm friends yet</h4><p>Create or join a realm, then invite a friend.</p></div>';
      ui.playerCount.textContent = "1 online";
    }
  }

  function renderInventory() {
    var html = "";
    var i;
    var slot;
    for (i = 0; i < state.inventory.length; i += 1) {
      slot = state.inventory[i];
      html += '<button type="button" class="inventory-slot' + (state.selectedInventoryIndex === i ? " selected" : "") + '" data-inventory="' + i + '">';
      if (slot) {
        html += '<div class="swatch" style="background:' + itemColor(slot.id) + '"></div><strong>' + itemLabel(slot.id) + '</strong><span class="slot-count">x' + slot.count + "</span>";
      } else {
        html += '<span class="slot-empty">Empty</span>';
      }
      html += "</button>";
    }
    ui.inventoryGrid.innerHTML = html;
    ui.selectedInventoryHint.textContent = state.selectedInventoryIndex === null ? "Select a stack" : "Selected: " + itemLabel(state.inventory[state.selectedInventoryIndex].id);
    renderCrafting();
  }

  function renderCrafting() {
    var html = "";
    var i;
    for (i = 0; i < 9; i += 1) {
      html += '<button type="button" class="craft-slot' + (state.crafting[i] ? " selected" : "") + '" data-craft="' + i + '">';
      if (state.crafting[i]) {
        html += '<div class="swatch" style="background:' + itemColor(state.crafting[i]) + '"></div><strong>' + itemLabel(state.crafting[i]) + "</strong>";
      } else {
        html += '<span class="slot-empty">Place</span>';
      }
      html += "</button>";
    }
    ui.craftingGrid.innerHTML = html;
    var recipe = findRecipe();
    ui.craftOutputBtn.className = "craft-output-button" + (recipe ? " ready" : "");
    ui.craftOutputBtn.textContent = recipe ? recipe.label : "Nothing Crafted";
    ui.recipeHint.textContent = recipe ? "Ready to craft " + recipe.label + "." : "Recipes: 2x2 stone = glass, glass shell + crystal core = computer, crystal frame + slime core = portal.";
  }

  function openInventory() {
    if (state.modeMenuOpen) {
      return;
    }
    state.inventoryOpen = true;
    ui.inventoryModal.style.display = "block";
    ui.inventoryModal.setAttribute("open", "open");
    renderInventory();
  }

  function closeInventory() {
    state.inventoryOpen = false;
    ui.inventoryModal.style.display = "none";
    ui.inventoryModal.removeAttribute("open");
  }

  function openComputer() {
    ui.computerModal.style.display = "block";
    ui.computerModal.setAttribute("open", "open");
  }

  function closeComputer() {
    ui.computerModal.style.display = "none";
    ui.computerModal.removeAttribute("open");
  }

  function openPauseMenu() {
    if (state.modeMenuOpen || state.pauseMenuOpen) {
      return;
    }
    closeInventory();
    closeComputer();
    clearInput();
    state.pauseMenuOpen = true;
    if (ui.pauseMenu) {
      ui.pauseMenu.style.display = "flex";
    }
  }

  function closePauseMenu() {
    state.pauseMenuOpen = false;
    if (ui.pauseMenu) {
      ui.pauseMenu.style.display = "none";
    }
  }

  function togglePauseMenu() {
    if (state.pauseMenuOpen) {
      closePauseMenu();
    } else {
      openPauseMenu();
    }
  }

  function updateModeStatus() {
    var code = ui.realmCodeInput.value || "COOL";
    var worldName = (ui.worldNameInput.value || "My World").replace(/^\s+|\s+$/g, "") || "My World";
    if (state.startMenuTab === "load") {
      ui.modeStatus.textContent = "Load one of your saved worlds and jump back in.";
      return;
    }
    ui.modeStatus.textContent = worldName + " will start in " + (state.pendingWorldMode === "creative" ? "Creative" : "Survival") + " as " + (state.pendingConnection ? ("Multiplayer (" + code + ")") : "Single Player") + ".";
  }

  function showStartMenuTab(tab) {
    state.startMenuTab = tab;
    renderStartMenu();
    updateModeStatus();
  }

  function openModeMenu() {
    state.modeMenuOpen = true;
    if (ui.modeMenu) {
      ui.modeMenu.style.display = "flex";
    }
    state.pendingWorldMode = state.gameMode || state.pendingWorldMode;
    state.pendingConnection = state.connected;
    ui.worldNameInput.value = state.worldName || "My World";
    renderStartMenu();
    updateModeStatus();
  }

  function closeModeMenu() {
    state.modeMenuOpen = false;
    if (ui.modeMenu) {
      ui.modeMenu.style.display = "none";
    }
  }

  function chooseSinglePlayer() {
    state.pendingConnection = false;
    renderStartMenu();
    updateModeStatus();
  }

  function chooseMultiplayer() {
    if (!ui.realmCodeInput.value) {
      ui.realmCodeInput.value = "COOL";
    }
    state.pendingConnection = true;
    renderStartMenu();
    updateModeStatus();
  }

  function chooseSurvivalMode() {
    state.pendingWorldMode = "survival";
    renderStartMenu();
    updateModeStatus();
  }

  function chooseCreativeMode() {
    state.pendingWorldMode = "creative";
    renderStartMenu();
    updateModeStatus();
  }

  function prepareFreshWorld() {
    seedInventory();
    resetWorlds();
    if (isCreativeMode()) {
      applyCreativeLoadout();
    }
    state.logs = [];
    state.notes = [];
    state.targetTile = null;
    state.selectedInventoryIndex = null;
    state.selectedHotbarIndex = 0;
    state.crafting = ["", "", "", "", "", "", "", "", ""];
    updateCamera();
  }

  function startWorld(name, mode, connected, realmCode, logMessage, readyMessage) {
    state.playerName = (ui.playerNameInput.value || state.playerName).replace(/^\s+|\s+$/g, "") || "BuilderOne";
    state.currentWorldId = createWorldId();
    state.worldName = name;
    state.gameMode = mode;
    state.connected = !!connected;
    state.realmCode = state.connected ? (realmCode || "COOL") : "";
    state.pendingWorldMode = mode;
    state.pendingConnection = !!connected;
    ui.worldNameInput.value = state.worldName;
    ui.realmCodeInput.value = state.realmCode;
    prepareFreshWorld();
    renderHotbar();
    renderInventory();
    renderPlayerMaker();
    renderFriends();
    renderLogs();
    updateHUD();
    saveGame();
    closeModeMenu();
    addLog(logMessage || ('Started ' + (state.gameMode === "creative" ? "Creative" : "Survival") + ' world "' + state.worldName + '".'));
    notify(readyMessage || (state.worldName + " is ready."));
  }

  function createNewWorld() {
    var name = (ui.worldNameInput.value || "My World").replace(/^\s+|\s+$/g, "") || "My World";
    startWorld(name, state.pendingWorldMode, !!state.pendingConnection, ui.realmCodeInput.value || "COOL");
  }

  function createSecretWorld() {
    startWorld("Secret World", "creative", false, "", 'The Secret World opened in Creative mode.', "Secret World unlocked.");
  }

  function loadWorldById(id) {
    var raw;
    var payload;
    try {
      raw = localStorage.getItem(worldSnapshotKey(id));
      if (!raw) {
        notify("That world save is missing.");
        return;
      }
      payload = JSON.parse(raw);
      applyWorldSnapshot(payload, id);
      state.pendingWorldMode = state.gameMode;
      state.pendingConnection = state.connected;
      ui.worldNameInput.value = state.worldName;
      ui.realmCodeInput.value = state.realmCode;
      ui.playerNameInput.value = state.playerName;
      state.logs = [];
      state.notes = [];
      renderHotbar();
      renderInventory();
      renderPlayerMaker();
      renderFriends();
      renderLogs();
      updateHUD();
      closeModeMenu();
      addLog('Loaded world "' + state.worldName + '".');
      notify(state.worldName + " loaded.");
    } catch (error) {
      notify("That world could not be loaded.");
    }
  }

  function updateHUD() {
    var hotbarItem = selectedHotbarItem();
    var focusSpot = selectedTile();
    var targetTile = focusSpot ? tileAt(state.dimension, focusSpot.x, focusSpot.y) : null;
    ui.healthValue.textContent = Math.ceil(state.player.hp) + " / " + state.player.maxHp;
    ui.realmValue.textContent = state.connected ? state.realmCode : "Solo";
    ui.connectionBadge.textContent = state.connected ? "Realm Host" : "Offline";
    ui.voiceStatus.textContent = "Friends only";
    ui.recordStatus.textContent = "Ready";
    ui.timeValue.textContent = state.dimension === "end" ? "Void" : (state.dimension === "nether" ? "Inferno" : (state.night ? "Night" : "Day"));
    ui.dimensionValue.textContent = dimensionLabel(state.dimension);
    ui.timeBadge.textContent = state.dimension === "end" ? "Dragon sky" : (state.dimension === "nether" ? "Nether fire" : (state.night ? "Night monsters rising" : "Day"));
    ui.viewModeBadge.textContent = viewModeLabel(state.viewMode);
    ui.toolInfo.textContent = hotbarItem ? itemLabel(hotbarItem.id) + " x" + hotbarItem.count : "Empty Slot";
    ui.activePackSummary.textContent = "Everything unlocked";
    ui.buildTubeHint.textContent = nearestObject("computer") ? "Computer in reach" : "Find a computer";
    ui.targetInfo.textContent = targetTile ? focusSpot.x + "," + focusSpot.y + " " + (targetTile.object || targetTile.floor) : "Look ahead";
    ui.bossTitle.textContent = "Final Boss: " + state.boss.name;
    ui.bossHealthFill.style.width = ((state.boss.hp / state.boss.maxHp) * 100) + "%";
    ui.bossHealthText.textContent = Math.max(0, Math.ceil(state.boss.hp)) + " / " + state.boss.maxHp;
    ui.bossBanner.className = "boss-banner" + (state.boss.kind === "dragon" ? " dragon" : "") + (bossIsVisible() ? "" : " hidden");
    if (ui.toggleViewBtn) {
      ui.toggleViewBtn.textContent = isFirstPersonView() ? "Turn Off First Person" : "Turn On First Person";
    }
  }

  function isNight() {
    return state.dayClock < 0.18 || state.dayClock > 0.72;
  }

  function tileBlocked(worldName, x, y) {
    var tile = tileAt(worldName, x, y);
    if (!tile) {
      return true;
    }
    if (tile.floor === "water" || tile.floor === "lava") {
      return true;
    }
    if (tile.floor === "void" && !tile.object) {
      return true;
    }
    if (tile.object && tile.object !== "portal" && tile.object !== "endportal") {
      return true;
    }
    return false;
  }

  function nearestObject(name) {
    var px = pixelToGrid(state.player.x);
    var py = pixelToGrid(state.player.y);
    var x;
    var y;
    var tile;
    for (y = py - 1; y <= py + 1; y += 1) {
      for (x = px - 1; x <= px + 1; x += 1) {
        tile = tileAt(state.dimension, x, y);
        if (tile && tile.object === name) {
          return { x: x, y: y };
        }
      }
    }
    return null;
  }

  function updateCamera() {
    state.camera.x = pixelToGrid(state.player.x);
    state.camera.y = pixelToGrid(state.player.y);
  }

  function tint(hex, amount) {
    var color = hex.replace("#", "");
    var value = parseInt(color, 16);
    var r = (value >> 16) & 255;
    var g = (value >> 8) & 255;
    var b = value & 255;
    r = clamp(Math.round(r + amount), 0, 255);
    g = clamp(Math.round(g + amount), 0, 255);
    b = clamp(Math.round(b + amount), 0, 255);
    return "rgb(" + r + "," + g + "," + b + ")";
  }

  function facingBasis() {
    if (isFirstPersonView()) {
      var yaw = typeof state.player.yaw === "number" ? state.player.yaw : yawFromFacing(state.player.facing);
      return {
        fx: Math.sin(yaw),
        fy: Math.cos(yaw),
        rx: -Math.cos(yaw),
        ry: Math.sin(yaw)
      };
    }
    if (state.player.facing === "up") {
      return { fx: 0, fy: -1, rx: 1, ry: 0 };
    }
    if (state.player.facing === "left") {
      return { fx: -1, fy: 0, rx: 0, ry: -1 };
    }
    if (state.player.facing === "right") {
      return { fx: 1, fy: 0, rx: 0, ry: 1 };
    }
    return { fx: 0, fy: 1, rx: -1, ry: 0 };
  }

  function playerTilePosition() {
    return {
      x: state.player.x / TILE,
      y: state.player.y / TILE
    };
  }

  function viewFocalLength() {
    return Math.min(canvas.width * 0.95, canvas.height * 1.55);
  }

  function viewHorizon() {
    if (state.dimension === "nether") {
      return canvas.height * 0.43;
    }
    if (state.dimension === "end") {
      return canvas.height * 0.39;
    }
    return canvas.height * 0.37;
  }

  function worldToView(wx, wy) {
    var basis = facingBasis();
    var playerPos = playerTilePosition();
    var dx = wx - playerPos.x;
    var dy = wy - playerPos.y;
    return {
      side: dx * basis.rx + dy * basis.ry,
      forward: dx * basis.fx + dy * basis.fy
    };
  }

  function projectScenePoint(side, forward, height) {
    var focal = viewFocalLength();
    var horizon = viewHorizon();
    if (forward <= NEAR_CLIP) {
      return null;
    }
    return {
      x: Math.round(canvas.width * 0.5 + (side / forward) * focal),
      y: Math.round(horizon - ((height - CAMERA_EYE_HEIGHT) / forward) * focal)
    };
  }

  function viewIsVisible(view) {
    return view.forward > NEAR_CLIP && view.forward < VIEW_DISTANCE && Math.abs(view.side) < view.forward * 1.58 + 2.2;
  }

  function tileNoise(x, y, offset) {
    var seed = Math.sin((x + offset * 11) * 12.9898 + (y + offset * 17) * 78.233) * 43758.5453;
    return seed - Math.floor(seed);
  }

  function fillPolygon(points, fillStyle, strokeStyle) {
    var i;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (i = 1; i < points.length; i += 1) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.closePath();
    ctx.fillStyle = fillStyle;
    ctx.fill();
    if (strokeStyle) {
      ctx.strokeStyle = strokeStyle;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  function spriteRect(side, forward, baseHeight, topHeight, width) {
    var base = projectScenePoint(side, forward, baseHeight);
    var top = projectScenePoint(side, forward, topHeight);
    var left = projectScenePoint(side - width * 0.5, forward, baseHeight);
    var right = projectScenePoint(side + width * 0.5, forward, baseHeight);
    var rectWidth;
    if (!base || !top || !left || !right) {
      return null;
    }
    rectWidth = Math.max(1, Math.abs(right.x - left.x));
    return {
      x: Math.round((left.x + right.x) * 0.5 - rectWidth * 0.5),
      y: top.y,
      w: rectWidth,
      h: Math.max(1, base.y - top.y)
    };
  }

  function drawSpriteRect(rect, baseColor, topColor, accentColor) {
    if (!rect) {
      return;
    }
    ctx.fillStyle = baseColor;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.strokeStyle = tint(baseColor, -42);
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    if (topColor) {
      ctx.fillStyle = topColor;
      ctx.fillRect(rect.x, rect.y, rect.w, Math.max(2, Math.round(rect.h * 0.2)));
    }
    if (accentColor) {
      ctx.fillStyle = accentColor;
      ctx.fillRect(rect.x + Math.max(1, Math.round(rect.w * 0.14)), rect.y + Math.max(2, Math.round(rect.h * 0.24)), Math.max(2, Math.round(rect.w * 0.24)), Math.max(2, Math.round(rect.h * 0.18)));
    }
  }

  function drawCloudCluster(x, y, scale, alpha) {
    var blocks = [
      { x: 0, y: 10, w: 68, h: 18 },
      { x: 18, y: 0, w: 52, h: 14 },
      { x: 58, y: 12, w: 26, h: 12 },
      { x: 78, y: 18, w: 36, h: 14 }
    ];
    var i;
    ctx.fillStyle = "rgba(236,242,255," + alpha + ")";
    for (i = 0; i < blocks.length; i += 1) {
      ctx.fillRect(Math.round(x + blocks[i].x * scale), Math.round(y + blocks[i].y * scale), Math.round(blocks[i].w * scale), Math.round(blocks[i].h * scale));
    }
    ctx.fillStyle = "rgba(190,206,236," + (alpha * 0.9) + ")";
    for (i = 0; i < blocks.length; i += 1) {
      ctx.fillRect(Math.round(x + blocks[i].x * scale), Math.round(y + (blocks[i].y + blocks[i].h - 3) * scale), Math.round(blocks[i].w * scale), Math.max(2, Math.round(4 * scale)));
    }
  }

  function drawHorizonBand(baseColor, shadowColor, lift, bias) {
    var horizon = viewHorizon();
    var i;
    var x;
    var y;
    ctx.fillStyle = baseColor;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(0, horizon + lift + 38);
    for (i = 0; i <= 12; i += 1) {
      x = canvas.width * i / 12;
      y = horizon + lift + 34 + Math.sin(bias + i * 0.78) * 16 + Math.cos(bias * 0.7 + i * 1.23) * 10;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(canvas.width, canvas.height);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = shadowColor;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(0, horizon + lift + 54);
    for (i = 0; i <= 10; i += 1) {
      x = canvas.width * i / 10;
      y = horizon + lift + 48 + Math.sin(bias * 1.2 + i * 0.92) * 12;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(canvas.width, canvas.height);
    ctx.closePath();
    ctx.fill();
  }

  function drawSkyBackdrop() {
    var playerPos = playerTilePosition();
    var sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
    var i;
    var cloudX;
    var cloudY;
    if (state.dimension === "nether") {
      sky.addColorStop(0, "#8f4d26");
      sky.addColorStop(1, "#2b0d07");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawHorizonBand("#6b2f1b", "#4c1c10", 30, playerPos.x * 0.08 + playerPos.y * 0.04);
      drawHorizonBand("#4b2011", "#2a0e08", 66, playerPos.x * 0.12 + playerPos.y * 0.06);
      return;
    }
    if (state.dimension === "end") {
      sky.addColorStop(0, "#36224e");
      sky.addColorStop(1, "#0d0918");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawHorizonBand("#4d416d", "#2f244a", 20, playerPos.x * 0.08);
      ctx.fillStyle = "rgba(214,203,255,0.8)";
      for (i = 0; i < 26; i += 1) {
        ctx.fillRect(Math.round((tileNoise(i, playerPos.x, 9) * canvas.width)), Math.round(tileNoise(i, playerPos.y, 11) * viewHorizon()), 2, 2);
      }
      return;
    }

    if (state.night) {
      sky.addColorStop(0, "#143261");
      sky.addColorStop(1, "#16233a");
    } else {
      sky.addColorStop(0, "#83a8ee");
      sky.addColorStop(1, "#9fbeff");
    }
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawHorizonBand(state.night ? "#314d59" : "#7da267", state.night ? "#203742" : "#5f814a", 24, playerPos.x * 0.08 + playerPos.y * 0.05);
    drawHorizonBand(state.night ? "#253f3a" : "#4b7a33", state.night ? "#172d29" : "#365721", 58, playerPos.x * 0.12 + playerPos.y * 0.07);
    if (!state.night) {
      for (i = 0; i < 5; i += 1) {
        cloudX = ((i * 220) - (playerPos.x * 48) + canvas.width * 1.3) % (canvas.width + 240) - 120;
        cloudY = 36 + (i % 3) * 44 + Math.sin(playerPos.y * 0.18 + i) * 6;
        drawCloudCluster(cloudX, cloudY, 0.72 + (i % 2) * 0.14, 0.84);
      }
    }
  }

  function drawGrassSprite(side, forward, seed) {
    var base = projectScenePoint(side, forward, 0);
    var top = projectScenePoint(side, forward, 0.58 + seed * 0.18);
    var width = Math.max(2, Math.round(7 / forward));
    if (!base || !top || forward > 8.5) {
      return;
    }
    ctx.fillStyle = seed > 0.5 ? "#2d8e26" : "#4aa534";
    ctx.fillRect(base.x - width, top.y, width, Math.max(2, base.y - top.y));
    ctx.fillRect(base.x + 1, top.y + Math.max(0, Math.round((base.y - top.y) * 0.18)), width, Math.max(2, base.y - top.y - 2));
  }

  function drawFlowerSprite(side, forward, color) {
    var base = projectScenePoint(side, forward, 0);
    var top = projectScenePoint(side, forward, 0.85);
    var petal = Math.max(2, Math.round(8 / forward));
    if (!base || !top || forward > 10.2) {
      return;
    }
    ctx.fillStyle = "#37a62c";
    ctx.fillRect(base.x - 1, top.y, 3, Math.max(4, base.y - top.y));
    ctx.fillStyle = color;
    ctx.fillRect(top.x - petal, top.y - petal, petal, petal);
    ctx.fillRect(top.x, top.y - petal, petal, petal);
    ctx.fillRect(top.x - petal * 0.5, top.y - petal * 1.45, petal, petal);
    ctx.fillStyle = "#ffeeb1";
    ctx.fillRect(top.x - 1, top.y - 1, 3, 3);
  }

  function hasNearbyObject(gridX, gridY, objectName, radius) {
    var x;
    var y;
    for (y = gridY - radius; y <= gridY + radius; y += 1) {
      for (x = gridX - radius; x <= gridX + radius; x += 1) {
        if (x === gridX && y === gridY) {
          continue;
        }
        if (tileAt(state.dimension, x, y) && tileAt(state.dimension, x, y).object === objectName) {
          return true;
        }
      }
    }
    return false;
  }

  function drawWoodFeature(gridX, gridY, side, forward) {
    var trunk;
    var canopy;
    if (hasNearbyObject(gridX, gridY, "leaves", 2)) {
      trunk = spriteRect(side, forward, 0, 2.25, 0.28);
      canopy = spriteRect(side, forward, 1.2, 3.25, 1.5);
      drawSpriteRect(trunk, "#75502d", "#9f7652");
      drawSpriteRect(canopy, "#2f7c22", "#4c9a36");
      drawSpriteRect(spriteRect(side - 0.28, forward + 0.12, 1.5, 2.85, 0.95), "#2f7c22", "#4c9a36");
      drawSpriteRect(spriteRect(side + 0.28, forward + 0.1, 1.55, 2.8, 0.95), "#316f24", "#4c9a36");
      return;
    }
    drawSpriteRect(spriteRect(side, forward, 0, 1.15, 0.62), "#76502f", "#a97d50");
  }

  function drawLeavesFeature(side, forward) {
    drawSpriteRect(spriteRect(side, forward, 0.4, 1.75, 0.92), "#2d7422", "#4f9a3c");
  }

  function drawStoneFeature(side, forward) {
    drawSpriteRect(spriteRect(side, forward, 0, 0.95, 0.82), "#6f7882", "#98a1ab");
  }

  function drawCrystalFeature(side, forward) {
    drawSpriteRect(spriteRect(side, forward, 0, 1.2, 0.42), "#6cc5ff", "#baf0ff", "#effcff");
    drawSpriteRect(spriteRect(side - 0.12, forward + 0.06, 0, 0.8, 0.18), "#5ba3ff", "#baf0ff");
  }

  function drawComputerFeature(side, forward) {
    var shell = spriteRect(side, forward, 0, 1.05, 0.78);
    var screen;
    drawSpriteRect(shell, "#6a6f83", "#98a2bf");
    screen = spriteRect(side, forward, 0.34, 0.82, 0.48);
    if (screen) {
      ctx.fillStyle = "#08131a";
      ctx.fillRect(screen.x, screen.y, screen.w, screen.h);
      ctx.fillStyle = "#78f6d1";
      ctx.fillRect(screen.x + Math.max(2, Math.round(screen.w * 0.12)), screen.y + Math.max(2, Math.round(screen.h * 0.18)), Math.max(4, Math.round(screen.w * 0.76)), Math.max(4, Math.round(screen.h * 0.42)));
    }
  }

  function drawPortalFeature(side, forward, isEndPortal) {
    var outer = spriteRect(side, forward, 0, 2.45, 1.15);
    var inner = spriteRect(side, forward, 0.15, 2.25, 0.82);
    if (outer) {
      drawSpriteRect(outer, isEndPortal ? "#2d415e" : "#3a2359", isEndPortal ? "#516f9f" : "#7145b5");
    }
    if (inner) {
      ctx.fillStyle = isEndPortal ? "rgba(148,228,255,0.78)" : "rgba(185,126,255,0.76)";
      ctx.fillRect(inner.x, inner.y, inner.w, inner.h);
      ctx.fillStyle = isEndPortal ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.22)";
      ctx.fillRect(inner.x + Math.max(1, Math.round(inner.w * 0.12)), inner.y + Math.max(2, Math.round(inner.h * 0.08)), Math.max(2, Math.round(inner.w * 0.76)), Math.max(2, Math.round(inner.h * 0.16)));
    }
  }

  function drawSlimeFeature(side, forward, scale) {
    var body = spriteRect(side, forward, 0, 1.08 * scale, 0.92 * scale);
    if (body) {
      drawSpriteRect(body, "#74d84f", "#9ef56f");
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.fillRect(body.x + Math.max(2, Math.round(body.w * 0.16)), body.y + Math.max(2, Math.round(body.h * 0.16)), Math.max(3, Math.round(body.w * 0.22)), Math.max(3, Math.round(body.h * 0.18)));
    }
  }

  function drawPedestalFeature(side, forward, dragonStyle) {
    var base = spriteRect(side, forward, 0, 1.25, 0.86);
    var orb = spriteRect(side, forward, 0.95, 1.75, 0.34);
    drawSpriteRect(base, dragonStyle ? "#3c3455" : "#555e68", dragonStyle ? "#625882" : "#76818c");
    if (orb) {
      drawSpriteRect(orb, dragonStyle ? "#7fdcff" : "#9df567", dragonStyle ? "#d0f6ff" : "#d9ff95");
    }
  }

  function drawTileFeature(gridX, gridY, tile, view) {
    var seed = tileNoise(gridX, gridY, 3);
    var side = view.side;
    var forward = view.forward;
    if (!tile.object && state.dimension === "overworld" && tile.floor === "grass") {
      if (seed > 0.68) {
        drawFlowerSprite(side + (tileNoise(gridX, gridY, 4) - 0.5) * 0.28, forward + (tileNoise(gridX, gridY, 5) - 0.5) * 0.22, seed > 0.9 ? "#ffd36e" : "#f3d2ff");
      } else if (seed > 0.26) {
        drawGrassSprite(side + (tileNoise(gridX, gridY, 6) - 0.5) * 0.26, forward, seed);
      }
    }
    if (!tile.object) {
      return;
    }
    if (tile.object === "wood") {
      drawWoodFeature(gridX, gridY, side, forward);
      return;
    }
    if (tile.object === "leaves") {
      drawLeavesFeature(side, forward);
      return;
    }
    if (tile.object === "stone") {
      drawStoneFeature(side, forward);
      return;
    }
    if (tile.object === "crystal") {
      drawCrystalFeature(side, forward);
      return;
    }
    if (tile.object === "computer") {
      drawComputerFeature(side, forward);
      return;
    }
    if (tile.object === "portal") {
      drawPortalFeature(side, forward, false);
      return;
    }
    if (tile.object === "endportal") {
      drawPortalFeature(side, forward, true);
      return;
    }
    if (tile.object === "slime") {
      drawSlimeFeature(side, forward, 1);
      return;
    }
    if (tile.object === "altar") {
      drawPedestalFeature(side, forward, false);
      return;
    }
    if (tile.object === "dragonaltar") {
      drawPedestalFeature(side, forward, true);
    }
  }

  function drawGroundTile(entry) {
    var corners = [
      worldToView(entry.x, entry.y),
      worldToView(entry.x + 1, entry.y),
      worldToView(entry.x + 1, entry.y + 1),
      worldToView(entry.x, entry.y + 1)
    ];
    var points = [];
    var center = projectScenePoint(entry.side, entry.forward, 0);
    var i;
    var baseColor;
    var fillColor;
    var insetPoints;
    if (!center) {
      return;
    }
    for (i = 0; i < corners.length; i += 1) {
      if (corners[i].forward <= NEAR_CLIP) {
        return;
      }
      points.push(projectScenePoint(corners[i].side, corners[i].forward, 0));
    }
    baseColor = colors[entry.tile.floor] || colors.grass;
    fillColor = tint(baseColor, (state.dimension === "overworld" && !state.night ? 10 : 0) - Math.round(entry.forward * 6));
    fillPolygon(points, fillColor, tint(baseColor, -34));
    if (entry.tile.floor === "water" || entry.tile.floor === "lava") {
      insetPoints = [];
      for (i = 0; i < points.length; i += 1) {
        insetPoints.push({
          x: Math.round(center.x + (points[i].x - center.x) * 0.78),
          y: Math.round(center.y + (points[i].y - center.y) * 0.78)
        });
      }
      fillPolygon(insetPoints, tint(colors[entry.tile.floor], 18), "rgba(255,255,255,0.16)");
    }
    drawTileFeature(entry.x, entry.y, entry.tile, entry);
  }

  function drawMonsterEntity(monster, view) {
    var body;
    var head;
    if (monster.type === "slimelet") {
      drawSlimeFeature(view.side, view.forward, 0.72);
      return;
    }
    if (monster.type === "ember") {
      body = spriteRect(view.side, view.forward, 0, 1.15, 0.52);
      drawSpriteRect(body, "#ff7f48", "#ffc062");
      drawSpriteRect(spriteRect(view.side - 0.08, view.forward + 0.04, 0.75, 1.55, 0.18), "#ffdc86", "#fff4bf");
      return;
    }
    if (monster.type === "enderling") {
      body = spriteRect(view.side, view.forward, 0, 2.4, 0.4);
      drawSpriteRect(body, "#3b244c", "#704ea2");
      head = spriteRect(view.side, view.forward, 1.72, 2.35, 0.5);
      if (head) {
        ctx.fillStyle = "#f1c3ff";
        ctx.fillRect(head.x + Math.max(1, Math.round(head.w * 0.16)), head.y + Math.max(2, Math.round(head.h * 0.22)), Math.max(2, Math.round(head.w * 0.22)), 2);
        ctx.fillRect(head.x + Math.max(2, Math.round(head.w * 0.6)), head.y + Math.max(2, Math.round(head.h * 0.22)), Math.max(2, Math.round(head.w * 0.22)), 2);
      }
      return;
    }
    body = spriteRect(view.side, view.forward, 0, 1.7, 0.56);
    head = spriteRect(view.side, view.forward, 1.2, 2, 0.48);
    drawSpriteRect(body, "#537451", "#769a69");
    drawSpriteRect(head, "#7aa36b", "#acd68c");
  }

  function drawBossEntity(view) {
    var body;
    if (state.boss.kind === "dragon") {
      drawSpriteRect(spriteRect(view.side - 0.95, view.forward + 0.18, 1.15, 2.55, 1.1), "#28242f", "#514867");
      drawSpriteRect(spriteRect(view.side + 0.95, view.forward + 0.18, 1.15, 2.55, 1.1), "#28242f", "#514867");
      body = spriteRect(view.side, view.forward, 0.5, 3.1, 0.82);
      drawSpriteRect(body, "#26292f", "#4c4f59");
      drawSpriteRect(spriteRect(view.side, view.forward - 0.1, 2.4, 3.45, 0.46), "#181a21", "#60598d");
      return;
    }
    body = spriteRect(view.side, view.forward, 0, 2.45, 1.95);
    drawSpriteRect(body, "#74d84f", "#a9ff78");
    if (body) {
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.fillRect(body.x + Math.max(3, Math.round(body.w * 0.18)), body.y + Math.max(3, Math.round(body.h * 0.14)), Math.max(6, Math.round(body.w * 0.24)), Math.max(4, Math.round(body.h * 0.14)));
    }
  }

  function drawEntityList() {
    var drawList = [];
    var monsters = state.monsters[state.dimension];
    var i;
    var view;
    for (i = 0; i < monsters.length; i += 1) {
      view = worldToView(monsters[i].x / TILE, monsters[i].y / TILE);
      if (viewIsVisible(view)) {
        drawList.push({ kind: "monster", ref: monsters[i], view: view });
      }
    }
    if (state.dimension === state.boss.dimension && state.boss.awake && !state.boss.defeated) {
      view = worldToView(state.boss.x / TILE, state.boss.y / TILE);
      if (viewIsVisible(view)) {
        drawList.push({ kind: "boss", ref: state.boss, view: view });
      }
    }
    drawList.sort(function (left, right) {
      return right.view.forward - left.view.forward;
    });
    for (i = 0; i < drawList.length; i += 1) {
      if (drawList[i].kind === "boss") {
        drawBossEntity(drawList[i].view);
      } else {
        drawMonsterEntity(drawList[i].ref, drawList[i].view);
      }
    }
  }

  function drawPixelPattern(pattern, x, y, cell, palette) {
    var row;
    var col;
    var key;
    for (row = 0; row < pattern.length; row += 1) {
      for (col = 0; col < pattern[row].length; col += 1) {
        key = pattern[row].charAt(col);
        if (key !== "0") {
          ctx.fillStyle = palette[key] || palette["1"];
          ctx.fillRect(x + col * cell, y + row * cell, cell, cell);
        }
      }
    }
  }

  function drawInstructionCard() {
    var cardWidth = Math.min(Math.round(canvas.width * 0.34), 460);
    var cardHeight = Math.max(72, Math.round(canvas.height * 0.1));
    var x = canvas.width - cardWidth - 18;
    var y = 18;
    var fontSize = Math.max(12, Math.round(cardHeight * 0.28));
    var viewHint = isFirstPersonView() ? "Press V for Classic View" : "Press V for First Person";
    var moveHint = isFirstPersonView() ? "W/S walk, A/D turn" : "Move with W, A, S and D";
    ctx.fillStyle = "rgba(242,242,242,0.97)";
    ctx.fillRect(x, y, cardWidth, cardHeight);
    ctx.fillStyle = "#252525";
    ctx.fillRect(x, y, cardWidth, 7);
    ctx.fillRect(x, y + cardHeight - 7, cardWidth, 7);
    ctx.fillRect(x, y, 7, cardHeight);
    ctx.fillRect(x + cardWidth - 7, y, 7, cardHeight);

    ctx.fillStyle = "#d6d6d6";
    ctx.fillRect(x + 22, y + 22, 18, 18);
    ctx.fillRect(x + 44, y + 22, 18, 18);
    ctx.fillRect(x + 33, y + 2, 18, 18);
    ctx.fillRect(x + 33, y + 42, 18, 18);
    ctx.strokeStyle = "#171717";
    ctx.lineWidth = 4;
    ctx.strokeRect(x + 22, y + 22, 18, 18);
    ctx.strokeRect(x + 44, y + 22, 18, 18);
    ctx.strokeRect(x + 33, y + 2, 18, 18);
    ctx.strokeRect(x + 33, y + 42, 18, 18);

    ctx.font = "700 " + fontSize + "px Courier New";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#4f0a65";
    ctx.fillText(moveHint, x + 88, y + cardHeight * 0.33);
    ctx.fillStyle = "#111111";
    ctx.fillText(viewHint, x + 88, y + cardHeight * 0.7);
  }

  function drawStatusHud() {
    var heartPattern = [
      "01100110",
      "11111111",
      "11111111",
      "11111111",
      "01111110",
      "00111100",
      "00011000"
    ];
    var drumstickPattern = [
      "00111100",
      "01111110",
      "11111110",
      "11111120",
      "01112122",
      "00011220",
      "00110000"
    ];
    var cell = canvas.width < 900 ? 2 : 3;
    var filledHearts = Math.max(0, Math.round(state.player.hp / 2));
    var baseY = canvas.height - (canvas.width < 900 ? 128 : 138);
    var heartsX = Math.round(canvas.width * 0.5 - 182);
    var hungerX = Math.round(canvas.width * 0.5 + 30);
    var i;
    for (i = 0; i < 10; i += 1) {
      drawPixelPattern(heartPattern, heartsX + i * cell * 10, baseY, cell, i < filledHearts ? { "1": "#ff4747" } : { "1": "rgba(84,26,26,0.6)" });
      drawPixelPattern(drumstickPattern, hungerX + i * cell * 10, baseY, cell, {
        "1": "#8c4d2f",
        "2": i < 10 ? "#f1d6c0" : "#7a6a64"
      });
    }
  }

  function drawCrosshair() {
    var midX = Math.round(canvas.width * 0.5);
    var midY = Math.round(canvas.height * 0.5);
    ctx.fillStyle = "rgba(20,24,25,0.7)";
    ctx.fillRect(midX - 1, midY - 11, 2, 7);
    ctx.fillRect(midX - 1, midY + 4, 2, 7);
    ctx.fillRect(midX - 11, midY - 1, 7, 2);
    ctx.fillRect(midX + 4, midY - 1, 7, 2);
    ctx.fillStyle = "#f1f4f6";
    ctx.fillRect(midX, midY - 10, 1, 6);
    ctx.fillRect(midX, midY + 4, 1, 6);
    ctx.fillRect(midX - 10, midY, 6, 1);
    ctx.fillRect(midX + 4, midY, 6, 1);
  }

  function drawHandOverlay() {
    var skin = playerLookOption("skin", state.playerStyle.skin).color;
    var shirt = playerLookOption("shirt", state.playerStyle.shirt).color;
    var sleeve = [
      { x: canvas.width - 164, y: canvas.height - 154 },
      { x: canvas.width - 86, y: canvas.height - 122 },
      { x: canvas.width - 62, y: canvas.height - 28 },
      { x: canvas.width - 138, y: canvas.height - 26 },
      { x: canvas.width - 176, y: canvas.height - 102 }
    ];
    var hand = [
      { x: canvas.width - 138, y: canvas.height - 170 },
      { x: canvas.width - 54, y: canvas.height - 128 },
      { x: canvas.width - 20, y: canvas.height - 18 },
      { x: canvas.width - 112, y: canvas.height - 14 },
      { x: canvas.width - 162, y: canvas.height - 96 }
    ];
    fillPolygon(sleeve, tint(shirt, -18), tint(shirt, -42));
    fillPolygon(hand, skin, tint(skin, -36));
    ctx.fillStyle = tint(skin, -14);
    ctx.fillRect(canvas.width - 114, canvas.height - 120, 18, 26);
    ctx.fillRect(canvas.width - 80, canvas.height - 94, 22, 20);
  }

  function renderFirstPersonWorld() {
    var world = currentWorld();
    var playerPos = playerTilePosition();
    var startX = Math.max(0, Math.floor(playerPos.x) - VIEW_DISTANCE - 3);
    var startY = Math.max(0, Math.floor(playerPos.y) - VIEW_DISTANCE - 3);
    var endX = Math.min(WORLD_W, Math.ceil(playerPos.x) + VIEW_DISTANCE + 3);
    var endY = Math.min(WORLD_H, Math.ceil(playerPos.y) + VIEW_DISTANCE + 3);
    var visibleTiles = [];
    var x;
    var y;
    var centerView;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawSkyBackdrop();
    for (y = startY; y < endY; y += 1) {
      for (x = startX; x < endX; x += 1) {
        centerView = worldToView(x + 0.5, y + 0.5);
        if (viewIsVisible(centerView)) {
          visibleTiles.push({
            x: x,
            y: y,
            tile: world[y][x],
            side: centerView.side,
            forward: centerView.forward
          });
        }
      }
    }
    visibleTiles.sort(function (left, right) {
      return right.forward - left.forward;
    });
    for (x = 0; x < visibleTiles.length; x += 1) {
      drawGroundTile(visibleTiles[x]);
    }
    drawEntityList();
    if (state.dimension === "nether") {
      ctx.fillStyle = "rgba(90,24,8,0.18)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (state.dimension === "end") {
      ctx.fillStyle = "rgba(112,70,156,0.18)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (state.night) {
      ctx.fillStyle = "rgba(12,22,44,0.34)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    drawCrosshair();
    drawInstructionCard();
    drawStatusHud();
    drawHandOverlay();
  }

  function classicViewMetrics() {
    var playerPos = playerTilePosition();
    var tileSize = Math.max(24, Math.min(58, Math.floor(Math.min(canvas.width / 15.5, canvas.height / 11.5))));
    return {
      tileSize: tileSize,
      offsetX: canvas.width * 0.5 - playerPos.x * tileSize,
      offsetY: canvas.height * 0.54 - playerPos.y * tileSize,
      startX: Math.max(0, Math.floor(playerPos.x - canvas.width / tileSize / 2) - 2),
      startY: Math.max(0, Math.floor(playerPos.y - canvas.height / tileSize / 2) - 2),
      endX: Math.min(WORLD_W, Math.ceil(playerPos.x + canvas.width / tileSize / 2) + 3),
      endY: Math.min(WORLD_H, Math.ceil(playerPos.y + canvas.height / tileSize / 2) + 3)
    };
  }

  function classicScreenPoint(metrics, worldX, worldY) {
    return {
      x: Math.round(metrics.offsetX + worldX * metrics.tileSize),
      y: Math.round(metrics.offsetY + worldY * metrics.tileSize)
    };
  }

  function drawClassicBackdrop() {
    var gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    var bottomColor = "#1c2d1f";
    if (state.dimension === "nether") {
      gradient.addColorStop(0, "#431814");
      gradient.addColorStop(1, "#220a08");
      bottomColor = "#3d1d16";
    } else if (state.dimension === "end") {
      gradient.addColorStop(0, "#25153d");
      gradient.addColorStop(1, "#120a1f");
      bottomColor = "#2a2236";
    } else if (state.night) {
      gradient.addColorStop(0, "#1c2950");
      gradient.addColorStop(1, "#09121f");
      bottomColor = "#1a2618";
    } else {
      gradient.addColorStop(0, "#8db1f7");
      gradient.addColorStop(1, "#b7d3ff");
      bottomColor = "#385d30";
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = bottomColor;
    ctx.fillRect(0, Math.round(canvas.height * 0.63), canvas.width, Math.round(canvas.height * 0.37));
  }

  function drawClassicObject(rect, tile) {
    var inset = Math.max(3, Math.round(rect.size * 0.16));
    var innerSize = Math.max(8, rect.size - inset * 2);
    var x = rect.x + inset;
    var y = rect.y + inset;
    if (!tile.object) {
      return;
    }
    if (tile.object === "wood") {
      ctx.fillStyle = "#77502f";
      ctx.fillRect(x + Math.round(innerSize * 0.3), y + Math.round(innerSize * 0.18), Math.max(4, Math.round(innerSize * 0.4)), Math.max(8, Math.round(innerSize * 0.72)));
      ctx.fillStyle = "#3f8d38";
      ctx.fillRect(x, y, innerSize, Math.max(8, Math.round(innerSize * 0.5)));
      return;
    }
    if (tile.object === "leaves") {
      ctx.fillStyle = "#317f32";
      ctx.fillRect(x, y, innerSize, innerSize);
      return;
    }
    if (tile.object === "stone") {
      ctx.fillStyle = "#7e8793";
      ctx.fillRect(x, y, innerSize, innerSize);
      ctx.strokeStyle = "#aab3be";
      ctx.strokeRect(x, y, innerSize, innerSize);
      return;
    }
    if (tile.object === "crystal") {
      fillPolygon([
        { x: x + Math.round(innerSize * 0.5), y: y },
        { x: x + innerSize, y: y + Math.round(innerSize * 0.45) },
        { x: x + Math.round(innerSize * 0.5), y: y + innerSize },
        { x: x, y: y + Math.round(innerSize * 0.45) }
      ], "#7ed6ff", "#dff8ff");
      return;
    }
    if (tile.object === "computer") {
      ctx.fillStyle = "#6a7392";
      ctx.fillRect(x, y, innerSize, innerSize);
      ctx.fillStyle = "#d8f7ff";
      ctx.fillRect(x + Math.round(innerSize * 0.18), y + Math.round(innerSize * 0.18), Math.max(6, Math.round(innerSize * 0.64)), Math.max(6, Math.round(innerSize * 0.46)));
      ctx.fillStyle = "#1a2930";
      ctx.fillRect(x + Math.round(innerSize * 0.38), y + Math.round(innerSize * 0.74), Math.max(5, Math.round(innerSize * 0.24)), Math.max(3, Math.round(innerSize * 0.1)));
      return;
    }
    if (tile.object === "portal" || tile.object === "endportal") {
      ctx.fillStyle = tile.object === "portal" ? "#5b2f92" : "#1d7592";
      ctx.fillRect(x, y, innerSize, innerSize);
      ctx.fillStyle = tile.object === "portal" ? "#c48bff" : "#9cf2ff";
      ctx.fillRect(x + Math.max(3, Math.round(innerSize * 0.16)), y + Math.max(3, Math.round(innerSize * 0.16)), Math.max(6, Math.round(innerSize * 0.68)), Math.max(6, Math.round(innerSize * 0.68)));
      return;
    }
    if (tile.object === "slime") {
      ctx.fillStyle = "#8ae652";
      ctx.fillRect(x, y, innerSize, innerSize);
      ctx.fillStyle = "#3c7b2e";
      ctx.fillRect(x + Math.round(innerSize * 0.2), y + Math.round(innerSize * 0.26), Math.max(3, Math.round(innerSize * 0.14)), Math.max(3, Math.round(innerSize * 0.14)));
      ctx.fillRect(x + Math.round(innerSize * 0.66), y + Math.round(innerSize * 0.26), Math.max(3, Math.round(innerSize * 0.14)), Math.max(3, Math.round(innerSize * 0.14)));
      return;
    }
    if (tile.object === "altar" || tile.object === "dragonaltar") {
      ctx.fillStyle = tile.object === "dragonaltar" ? "#4c3b69" : "#7e8e95";
      ctx.fillRect(x, y + Math.round(innerSize * 0.2), innerSize, Math.max(6, Math.round(innerSize * 0.56)));
      ctx.fillStyle = tile.object === "dragonaltar" ? "#d5b1ff" : "#9cffea";
      ctx.fillRect(x + Math.round(innerSize * 0.28), y, Math.max(5, Math.round(innerSize * 0.44)), Math.max(5, Math.round(innerSize * 0.3)));
      return;
    }
    ctx.fillStyle = colors[tile.object] || "#e6f0f3";
    ctx.fillRect(x, y, innerSize, innerSize);
  }

  function drawClassicEntity(metrics, entityX, entityY, fillColor, outlineColor, scale) {
    var center = classicScreenPoint(metrics, entityX / TILE, entityY / TILE);
    var size = Math.max(8, Math.round(metrics.tileSize * (scale || 0.44)));
    ctx.fillStyle = fillColor;
    ctx.fillRect(center.x - Math.round(size * 0.5), center.y - Math.round(size * 0.5), size, size);
    ctx.strokeStyle = outlineColor || tint(fillColor, -48);
    ctx.lineWidth = Math.max(1, Math.round(size * 0.08));
    ctx.strokeRect(center.x - Math.round(size * 0.5), center.y - Math.round(size * 0.5), size, size);
  }

  function drawClassicPlayer(metrics) {
    var center = classicScreenPoint(metrics, state.player.x / TILE, state.player.y / TILE);
    var bodySize = Math.max(12, Math.round(metrics.tileSize * 0.52));
    var arrow = Math.max(10, Math.round(metrics.tileSize * 0.26));
    var arrowPoints;
    ctx.fillStyle = playerLookOption("shirt", state.playerStyle.shirt).color;
    ctx.fillRect(center.x - Math.round(bodySize * 0.5), center.y - Math.round(bodySize * 0.5), bodySize, bodySize);
    ctx.strokeStyle = tint(playerLookOption("shirt", state.playerStyle.shirt).color, -42);
    ctx.lineWidth = 2;
    ctx.strokeRect(center.x - Math.round(bodySize * 0.5), center.y - Math.round(bodySize * 0.5), bodySize, bodySize);
    if (state.player.facing === "up") {
      arrowPoints = [
        { x: center.x, y: center.y - bodySize },
        { x: center.x - arrow, y: center.y - Math.round(bodySize * 0.4) },
        { x: center.x + arrow, y: center.y - Math.round(bodySize * 0.4) }
      ];
    } else if (state.player.facing === "down") {
      arrowPoints = [
        { x: center.x, y: center.y + bodySize },
        { x: center.x - arrow, y: center.y + Math.round(bodySize * 0.4) },
        { x: center.x + arrow, y: center.y + Math.round(bodySize * 0.4) }
      ];
    } else if (state.player.facing === "left") {
      arrowPoints = [
        { x: center.x - bodySize, y: center.y },
        { x: center.x - Math.round(bodySize * 0.4), y: center.y - arrow },
        { x: center.x - Math.round(bodySize * 0.4), y: center.y + arrow }
      ];
    } else {
      arrowPoints = [
        { x: center.x + bodySize, y: center.y },
        { x: center.x + Math.round(bodySize * 0.4), y: center.y - arrow },
        { x: center.x + Math.round(bodySize * 0.4), y: center.y + arrow }
      ];
    }
    fillPolygon(arrowPoints, "#f7fbff", "#1c2531");
  }

  function renderClassicWorld() {
    var world = currentWorld();
    var metrics = classicViewMetrics();
    var target = selectedTile();
    var x;
    var y;
    var tile;
    var rect;
    var shade;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawClassicBackdrop();
    for (y = metrics.startY; y < metrics.endY; y += 1) {
      for (x = metrics.startX; x < metrics.endX; x += 1) {
        tile = world[y][x];
        rect = classicScreenPoint(metrics, x, y);
        shade = ((x + y) % 2 === 0 ? 8 : -10) + ((state.dimension === "overworld" && state.night) ? -16 : 0);
        ctx.fillStyle = tint(colors[tile.floor] || "#66757f", shade);
        ctx.fillRect(rect.x, rect.y, Math.ceil(metrics.tileSize) + 1, Math.ceil(metrics.tileSize) + 1);
        ctx.strokeStyle = "rgba(10,16,20,0.18)";
        ctx.lineWidth = 1;
        ctx.strokeRect(rect.x, rect.y, Math.ceil(metrics.tileSize) + 1, Math.ceil(metrics.tileSize) + 1);
      }
    }
    for (y = metrics.startY; y < metrics.endY; y += 1) {
      for (x = metrics.startX; x < metrics.endX; x += 1) {
        tile = world[y][x];
        rect = classicScreenPoint(metrics, x, y);
        drawClassicObject({ x: rect.x, y: rect.y, size: Math.ceil(metrics.tileSize) }, tile);
      }
    }
    for (x = 0; x < state.monsters[state.dimension].length; x += 1) {
      drawClassicEntity(metrics, state.monsters[state.dimension][x].x, state.monsters[state.dimension][x].y, state.monsters[state.dimension][x].color, "#1a1f22", 0.42);
    }
    if (bossIsVisible()) {
      drawClassicEntity(metrics, state.boss.x, state.boss.y, state.boss.color, "#0f1717", state.boss.kind === "dragon" ? 0.8 : 0.62);
    }
    if (target) {
      rect = classicScreenPoint(metrics, target.x, target.y);
      ctx.strokeStyle = "rgba(255,255,255,0.96)";
      ctx.lineWidth = Math.max(2, Math.round(metrics.tileSize * 0.08));
      ctx.strokeRect(rect.x + 2, rect.y + 2, Math.max(8, Math.ceil(metrics.tileSize) - 4), Math.max(8, Math.ceil(metrics.tileSize) - 4));
    }
    drawClassicPlayer(metrics);
    drawInstructionCard();
    drawStatusHud();
  }

  function renderWorld() {
    if (isFirstPersonView()) {
      renderFirstPersonWorld();
      return;
    }
    renderClassicWorld();
  }

  function spawnMonster(type) {
    var colorsByType = { zombie: "#a6d28a", slimelet: "#92ef64", ember: "#ffa267", enderling: "#b597ff" };
    var px = pixelToGrid(state.player.x);
    var py = pixelToGrid(state.player.y);
    var tries = 0;
    while (tries < 18) {
      var gx = clamp(px + Math.floor(rand(-8, 9)), 2, WORLD_W - 3);
      var gy = clamp(py + Math.floor(rand(-6, 7)), 2, WORLD_H - 3);
      tries += 1;
      if (!tileBlocked(state.dimension, gx, gy)) {
        state.monsters[state.dimension].push({
          type: type,
          x: gridToPixel(gx),
          y: gridToPixel(gy),
          hp: type === "ember" ? 18 : (type === "enderling" ? 22 : 14),
          damage: type === "ember" ? 5 : (type === "enderling" ? 6 : 3),
          color: colorsByType[type]
        });
        return;
      }
    }
  }

  function updateTime(dt) {
    if (state.dimension === "overworld") {
      state.dayClock += dt / 150;
      if (state.dayClock > 1) {
        state.dayClock = state.dayClock - 1;
      }
    }
    var oldNight = state.night;
    state.night = isNight();
    if (state.night !== oldNight) {
      if (state.night) {
        addLog("Night falls. Monsters are crawling out.");
      } else {
        state.monsters.overworld = [];
        addLog("Sunrise breaks and the surface calms down.");
      }
    }
  }

  function updateMonsters(dt) {
    var monsters = state.monsters[state.dimension];
    var i;
    if (isCreativeMode()) {
      state.monsters[state.dimension] = [];
      return;
    }
    if ((state.dimension === "nether" || state.dimension === "end" || state.night) && monsters.length < 6 && Math.random() < 0.03) {
      if (state.dimension === "nether") {
        spawnMonster("ember");
      } else if (state.dimension === "end") {
        spawnMonster("enderling");
      } else {
        spawnMonster(Math.random() > 0.5 ? "zombie" : "slimelet");
      }
    }
    for (i = monsters.length - 1; i >= 0; i -= 1) {
      var dx = state.player.x - monsters[i].x;
      var dy = state.player.y - monsters[i].y;
      var distance = Math.sqrt(dx * dx + dy * dy) || 1;
      monsters[i].x += (dx / distance) * 1.8 * TILE * dt;
      monsters[i].y += (dy / distance) * 1.8 * TILE * dt;
      if (distance < 42) {
        state.player.hp = clamp(state.player.hp - monsters[i].damage * dt, 0, state.player.maxHp);
      }
      if (monsters[i].hp <= 0) {
        addItem(monsters[i].type === "ember" || monsters[i].type === "enderling" ? "crystal" : "slime", 1);
        monsters.splice(i, 1);
      }
    }
    if (state.player.hp <= 0) {
      respawn();
    }
  }

  function awakenBoss(kind) {
    setupBoss(kind || "slime");
    state.boss.awake = true;
    state.boss.defeated = false;
    state.boss.hp = state.boss.maxHp;
    notify(state.boss.name + " awakened.");
    addLog("The " + state.boss.name + " enters the fight with " + state.boss.maxHp + " health.");
  }

  function updateBoss(dt) {
    var dx;
    var dy;
    var distance;
    if (state.dimension !== state.boss.dimension || state.boss.defeated || !state.boss.awake) {
      return;
    }
    dx = state.player.x - state.boss.x;
    dy = state.player.y - state.boss.y;
    distance = Math.sqrt(dx * dx + dy * dy) || 1;
    if (state.boss.kind === "dragon") {
      state.boss.orbit += dt * 1.7;
      state.boss.x += ((state.player.x + Math.cos(state.boss.orbit) * TILE * 4.5) - state.boss.x) * dt * 2.3;
      state.boss.y += ((state.player.y + Math.sin(state.boss.orbit * 0.85) * TILE * 3.8) - state.boss.y) * dt * 2.3;
      if (distance < 96 && !isCreativeMode()) {
        state.player.hp = clamp(state.player.hp - state.boss.damage * dt, 0, state.player.maxHp);
      }
      if (Math.random() < 0.01 && state.monsters.end.length < 6) {
        spawnMonster("enderling");
      }
      return;
    }
    state.boss.x += (dx / distance) * state.boss.speed * TILE * dt;
    state.boss.y += (dy / distance) * state.boss.speed * TILE * dt;
    if (distance < 60 && !isCreativeMode()) {
      state.player.hp = clamp(state.player.hp - state.boss.damage * dt, 0, state.player.maxHp);
    }
  }

  function respawn() {
    state.player.hp = state.player.maxHp;
    state.dimension = "overworld";
    state.player.x = gridToPixel(12);
    state.player.y = gridToPixel(12);
    updateCamera();
    notify("Respawned at base camp.");
  }

  function attack() {
    var monsters = state.monsters[state.dimension];
    var i;
    for (i = 0; i < monsters.length; i += 1) {
      var mdx = monsters[i].x - state.player.x;
      var mdy = monsters[i].y - state.player.y;
      if (Math.sqrt(mdx * mdx + mdy * mdy) < 70) {
        monsters[i].hp -= 8;
        notify("Hit " + monsters[i].type + ".");
        return;
      }
    }
    if (state.dimension === state.boss.dimension && state.boss.awake && !state.boss.defeated) {
      var dx = state.boss.x - state.player.x;
      var dy = state.boss.y - state.player.y;
      if (Math.sqrt(dx * dx + dy * dy) < 90) {
        state.boss.hp -= 8;
        if (state.boss.hp <= 0) {
          state.boss.defeated = true;
          state.boss.awake = false;
          state.boss.hp = 0;
          if (state.boss.kind === "dragon") {
            notify("Ender Dragon defeated.");
            addLog("Victory! The Ender Dragon is down and the exit portal glows.");
          } else {
            notify("Giga Slime defeated.");
            addLog("Victory! The Giga Slime is down.");
          }
        }
        return;
      }
    }
    notify("Nothing is in range.");
  }

  function updatePlayer(dt) {
    if (state.inventoryOpen || state.modeMenuOpen || state.pauseMenuOpen) {
      return;
    }
    var moveX;
    var moveY;
    var magnitude;
    var nextX;
    var nextY;
    if (isFirstPersonView()) {
      var basis = facingBasis();
      var turnInput = (input.right ? 1 : 0) - (input.left ? 1 : 0);
      var walkInput = (input.up ? 1 : 0) - (input.down ? 1 : 0);
      if (turnInput) {
        turnPlayer(turnInput * TURN_SPEED * dt);
        basis = facingBasis();
      }
      nextX = state.player.x + basis.fx * PLAYER_SPEED * TILE * dt * walkInput;
      nextY = state.player.y + basis.fy * PLAYER_SPEED * TILE * dt * walkInput;
      if (walkInput && !tileBlocked(state.dimension, pixelToGrid(nextX), pixelToGrid(state.player.y))) {
        state.player.x = nextX;
      }
      if (walkInput && !tileBlocked(state.dimension, pixelToGrid(state.player.x), pixelToGrid(nextY))) {
        state.player.y = nextY;
      }
      updateCamera();
      return;
    }
    moveX = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    moveY = (input.down ? 1 : 0) - (input.up ? 1 : 0);
    magnitude = Math.sqrt(moveX * moveX + moveY * moveY) || 1;
    nextX = state.player.x + (moveX / magnitude) * PLAYER_SPEED * TILE * dt;
    nextY = state.player.y + (moveY / magnitude) * PLAYER_SPEED * TILE * dt;
    if (moveX || moveY) {
      if (Math.abs(moveX) > Math.abs(moveY)) {
        state.player.facing = moveX > 0 ? "right" : "left";
      } else {
        state.player.facing = moveY > 0 ? "down" : "up";
      }
      state.player.yaw = yawFromFacing(state.player.facing);
    }
    if (!tileBlocked(state.dimension, pixelToGrid(nextX), pixelToGrid(state.player.y))) {
      state.player.x = nextX;
    }
    if (!tileBlocked(state.dimension, pixelToGrid(state.player.x), pixelToGrid(nextY))) {
      state.player.y = nextY;
    }
    updateCamera();
  }

  function facingTile() {
    var px = pixelToGrid(state.player.x);
    var py = pixelToGrid(state.player.y);
    if (isFirstPersonView()) {
      state.player.facing = facingFromYaw(state.player.yaw);
    }
    if (state.player.facing === "up") {
      return { x: px, y: py - 1 };
    }
    if (state.player.facing === "down") {
      return { x: px, y: py + 1 };
    }
    if (state.player.facing === "left") {
      return { x: px - 1, y: py };
    }
    return { x: px + 1, y: py };
  }

  function selectedTile() {
    if (isFirstPersonView()) {
      return facingTile();
    }
    if (state.targetTile) {
      return state.targetTile;
    }
    return facingTile();
  }

  function breakTile() {
    var spot = selectedTile();
    var tile = tileAt(state.dimension, spot.x, spot.y);
    if (!tile || !tile.object) {
      notify("Nothing to break.");
      return;
    }
    if (tile.object === "altar" || tile.object === "dragonaltar" || tile.object === "endportal") {
      notify("The altar is locked in place.");
      return;
    }
    if (!isCreativeMode()) {
      addItem(tile.object === "leaves" ? "wood" : tile.object, 1);
    }
    tile.object = "";
  }

  function placeTile() {
    var spot = selectedTile();
    var tile = tileAt(state.dimension, spot.x, spot.y);
    var item = selectedHotbarItem();
    if (!tile || !item || !itemDefs[item.id] || !itemDefs[item.id].placeable) {
      notify("No placeable item selected.");
      return;
    }
    if (tile.object || tile.floor === "water" || tile.floor === "lava") {
      notify("That spot is blocked.");
      return;
    }
    tile.object = item.id;
    if (!isCreativeMode()) {
      takeItem(state.selectedHotbarIndex, 1);
    }
  }

  function interact() {
    if (nearestObject("endportal")) {
      if (state.dimension === "nether") {
        state.dimension = "end";
        state.player.x = gridToPixel(portalPoints.netherEnd.spawnX);
        state.player.y = gridToPixel(portalPoints.netherEnd.spawnY);
      } else {
        state.dimension = "overworld";
        state.player.x = gridToPixel(portalPoints.end.spawnX);
        state.player.y = gridToPixel(portalPoints.end.spawnY);
      }
      updateCamera();
      addLog("Stepped through an End gate into the " + dimensionLabel(state.dimension) + ".");
      return;
    }
    if (nearestObject("portal")) {
      if (state.dimension === "overworld") {
        state.dimension = "nether";
        state.player.x = gridToPixel(portalPoints.overworld.spawnX);
        state.player.y = gridToPixel(portalPoints.overworld.spawnY);
      } else {
        state.dimension = "overworld";
        state.player.x = gridToPixel(portalPoints.nether.spawnX);
        state.player.y = gridToPixel(portalPoints.nether.spawnY);
      }
      updateCamera();
      addLog("Stepped through a portal into the " + dimensionLabel(state.dimension) + ".");
      return;
    }
    if (nearestObject("computer")) {
      openComputer();
      return;
    }
    if (nearestObject("dragonaltar")) {
      awakenBoss("dragon");
      return;
    }
    if (nearestObject("altar")) {
      awakenBoss("slime");
      return;
    }
    notify("Nothing special to use here.");
  }

  function craftItem() {
    var recipe = findRecipe();
    var i;
    if (!recipe) {
      notify("That recipe does not make anything.");
      return;
    }
    addItem(recipe.item, recipe.count);
    for (i = 0; i < 9; i += 1) {
      state.crafting[i] = "";
    }
    renderCrafting();
    notify("Crafted " + recipe.label + ".");
  }

  function handleCraftSlot(index) {
    if (state.crafting[index]) {
      addItem(state.crafting[index], 1);
      state.crafting[index] = "";
      renderCrafting();
      return;
    }
    if (state.selectedInventoryIndex === null || !state.inventory[state.selectedInventoryIndex]) {
      notify("Select an inventory stack first.");
      return;
    }
    state.crafting[index] = state.inventory[state.selectedInventoryIndex].id;
    takeItem(state.selectedInventoryIndex, 1);
    if (!state.inventory[state.selectedInventoryIndex]) {
      state.selectedInventoryIndex = null;
    }
    renderInventory();
  }

  function summonBoss() {
    state.dimension = "end";
    state.player.x = gridToPixel(dragonBossPoint.x - 5);
    state.player.y = gridToPixel(dragonBossPoint.y + 2);
    awakenBoss("dragon");
    updateCamera();
  }

  function saveGame(silent) {
    var payload;
    var worlds;
    var i;
    var found = false;
    if (!state.currentWorldId) {
      state.currentWorldId = createWorldId();
    }
    payload = buildWorldSnapshot();
    try {
      worlds = loadWorldIndex();
      localStorage.setItem(worldSnapshotKey(state.currentWorldId), JSON.stringify(payload));
      for (i = 0; i < worlds.length; i += 1) {
        if (worlds[i].id === state.currentWorldId) {
          worlds[i].name = state.worldName;
          worlds[i].mode = state.gameMode;
          worlds[i].playType = state.connected ? "multiplayer" : "single";
          worlds[i].updatedAt = new Date().toISOString();
          found = true;
          break;
        }
      }
      if (!found) {
        worlds.push({
          id: state.currentWorldId,
          name: state.worldName,
          mode: state.gameMode,
          playType: state.connected ? "multiplayer" : "single",
          updatedAt: new Date().toISOString()
        });
      }
      saveWorldIndex(worlds);
      renderSavedWorlds();
      if (!silent) {
        notify("World saved.");
      }
    } catch (error) {
      notify("Save failed on this browser.");
    }
  }

  function loadGame() {
    state.currentWorldId = "";
    state.playerStyle = normalizePlayerStyle(defaultPlayerStyle);
    state.worldName = "My World";
    state.gameMode = "survival";
    state.pendingWorldMode = "survival";
    state.pendingConnection = false;
    state.viewMode = "classic";
    state.startMenuTab = "new";
    seedInventory();
    resetWorlds();
    updateViewModeUI();
  }

  function setRealm(active) {
    state.connected = active;
    state.realmCode = active ? (ui.realmCodeInput.value || "cool") : "";
    renderFriends();
    updateHUD();
    updateModeStatus();
  }

  function handlePointer(clientX, clientY) {
    if (isFirstPersonView()) {
      state.targetTile = null;
      return;
    }
    state.targetTile = facingTile();
  }

  function beginLookDrag(clientX) {
    if (!isFirstPersonView()) {
      return false;
    }
    lookDrag.active = true;
    lookDrag.lastX = clientX;
    state.targetTile = null;
    return true;
  }

  function moveLookDrag(clientX) {
    var deltaX;
    if (!lookDrag.active || !isFirstPersonView()) {
      return false;
    }
    deltaX = clientX - lookDrag.lastX;
    lookDrag.lastX = clientX;
    if (deltaX) {
      turnPlayer(deltaX * 0.006);
    }
    return true;
  }

  function endLookDrag() {
    lookDrag.active = false;
  }

  function resizeCanvas() {
    canvas.width = canvas.clientWidth || 900;
    canvas.height = canvas.clientHeight || 620;
    ctx.imageSmoothingEnabled = false;
    updateCamera();
  }

  function bindTouchButtons() {
    var buttons = document.querySelectorAll("[data-move]");
    var i;
    for (i = 0; i < buttons.length; i += 1) {
      (function (button) {
        var dir = button.getAttribute("data-move");
        button.addEventListener("pointerdown", function () {
          input[dir] = true;
        });
        button.addEventListener("pointerup", function () {
          input[dir] = false;
        });
        button.addEventListener("pointerleave", function () {
          input[dir] = false;
        });
      }(buttons[i]));
    }
  }

  function wireClicks() {
    document.addEventListener("click", function (event) {
      var target = event.target;
      while (target && target !== document.body) {
        if (target.getAttribute("data-hotbar") !== null) {
          state.selectedHotbarIndex = parseInt(target.getAttribute("data-hotbar"), 10);
          renderHotbar();
          return;
        }
        if (target.getAttribute("data-inventory") !== null) {
          state.selectedInventoryIndex = parseInt(target.getAttribute("data-inventory"), 10);
          renderInventory();
          return;
        }
        if (target.getAttribute("data-craft") !== null) {
          handleCraftSlot(parseInt(target.getAttribute("data-craft"), 10));
          return;
        }
        if (target.getAttribute("data-video") !== null) {
          state.videoIndex = parseInt(target.getAttribute("data-video"), 10);
          renderBuildTube();
          return;
        }
        if (target.getAttribute("data-player-style-group") !== null) {
          setPlayerStyle(target.getAttribute("data-player-style-group"), target.getAttribute("data-player-style-id"));
          return;
        }
        if (target.getAttribute("data-load-world") !== null) {
          loadWorldById(target.getAttribute("data-load-world"));
          return;
        }
        target = target.parentNode;
      }
    });
  }

  function bindEvents() {
    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("keydown", function (event) {
      var key = (event.key || "").toLowerCase();
      if (state.modeMenuOpen) {
        if (key === "escape") {
          event.preventDefault();
        }
        return;
      }
      if (state.pauseMenuOpen) {
        if (key === "p" || key === "escape") {
          event.preventDefault();
          closePauseMenu();
        }
        return;
      }
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
      if (key === " ") {
        event.preventDefault();
        attack();
      }
      if (key === "e") {
        event.preventDefault();
        if (state.inventoryOpen) {
          closeInventory();
        } else {
          openInventory();
        }
      }
      if (key === "f") {
        interact();
      }
      if (key === "v") {
        event.preventDefault();
        toggleViewMode();
      }
      if (key === "q") {
        breakTile();
      }
      if (key === "r") {
        placeTile();
      }
      if (key === "p") {
        event.preventDefault();
        togglePauseMenu();
      }
      if (key === "escape") {
        closeInventory();
        closeComputer();
      }
    });
    window.addEventListener("keyup", function (event) {
      var key = (event.key || "").toLowerCase();
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
    });

    ui.realmCodeInput.oninput = updateModeStatus;
    ui.worldNameInput.oninput = updateModeStatus;
    ui.playerNameInput.oninput = function () {
      state.playerName = (ui.playerNameInput.value || "BuilderOne").replace(/^\s+|\s+$/g, "") || "BuilderOne";
      renderFriends();
      if (state.currentWorldId) {
        saveGame(true);
      }
    };
    ui.newWorldTabBtn.onclick = function () {
      showStartMenuTab("new");
    };
    ui.loadWorldTabBtn.onclick = function () {
      showStartMenuTab("load");
    };
    ui.singlePlayerBtn.onclick = chooseSinglePlayer;
    ui.multiPlayerBtn.onclick = chooseMultiplayer;
    ui.survivalModeBtn.onclick = chooseSurvivalMode;
    ui.creativeModeBtn.onclick = chooseCreativeMode;
    ui.playNewWorldBtn.onclick = createNewWorld;
    ui.secretWorldBtn.onclick = createSecretWorld;
    ui.resumeGameBtn.onclick = closePauseMenu;
    ui.pauseSaveBtn.onclick = function () {
      saveGame();
      closePauseMenu();
    };
    ui.createRealmBtn.onclick = function () {
      setRealm(true);
      addLog("Realm " + state.realmCode + " created.");
    };
    ui.joinRealmBtn.onclick = function () {
      setRealm(true);
      addLog("Joined realm " + state.realmCode + ".");
    };
    ui.leaveRealmBtn.onclick = function () {
      setRealm(false);
      addLog("Returned to solo mode.");
    };
    ui.voiceBtn.onclick = function () {
      notify("Voice chat is browser-dependent in this compatibility build.");
    };
    ui.installAppBtn.onclick = handleInstallApp;
    ui.recordBtn.onclick = function () {
      notify("Recording is browser-dependent in this compatibility build.");
    };
    ui.summonBossBtn.onclick = summonBoss;
    ui.healBtn.onclick = function () {
      state.player.hp = state.player.maxHp;
      notify("Health restored.");
    };
    ui.openInventoryBtn.onclick = openInventory;
    ui.toggleViewBtn.onclick = function () {
      toggleViewMode();
    };
    ui.inventoryBtn.onclick = openInventory;
    ui.saveWorldBtn.onclick = saveGame;
    ui.breakBtn.onclick = breakTile;
    ui.placeBtn.onclick = placeTile;
    ui.attackBtn.onclick = attack;
    ui.interactBtn.onclick = interact;
    ui.closeComputerBtn.onclick = closeComputer;
    ui.closeInventoryBtn.onclick = closeInventory;
    ui.clearCraftingBtn.onclick = function () {
      var i;
      for (i = 0; i < 9; i += 1) {
        if (state.crafting[i]) {
          addItem(state.crafting[i], 1);
          state.crafting[i] = "";
        }
      }
      renderCrafting();
    };
    ui.craftOutputBtn.onclick = craftItem;

    canvas.addEventListener("pointerdown", function (event) {
      if (beginLookDrag(event.clientX)) {
        if (canvas.setPointerCapture) {
          canvas.setPointerCapture(event.pointerId);
        }
        return;
      }
      handlePointer(event.clientX, event.clientY);
    });
    canvas.addEventListener("pointermove", function (event) {
      if (event.buttons) {
        if (moveLookDrag(event.clientX)) {
          return;
        }
        handlePointer(event.clientX, event.clientY);
      }
    });
    canvas.addEventListener("pointerup", function () {
      endLookDrag();
    });
    canvas.addEventListener("pointerleave", function () {
      endLookDrag();
    });

    bindTouchButtons();
    wireClicks();
  }

  function step(timestamp) {
    var dt = Math.min(0.034, (timestamp - state.lastTick) / 1000 || 0.016);
    state.lastTick = timestamp;
    if (state.modeMenuOpen || state.pauseMenuOpen) {
      renderWorld();
      updateHUD();
      window.requestAnimationFrame(step);
      return;
    }
    updateTime(dt);
    updatePlayer(dt);
    updateMonsters(dt);
    updateBoss(dt);
    renderWorld();
    updateHUD();
    window.requestAnimationFrame(step);
  }

  function init() {
    loadGame();
    ui.playerNameInput.value = state.playerName;
    ui.worldNameInput.value = state.worldName;
    ui.realmCodeInput.value = state.realmCode;
    closeInventory();
    closeComputer();
    closePauseMenu();
    renderLibrary();
    renderBuildTube();
    renderHotbar();
    renderInventory();
    renderPlayerMaker();
    renderFriends();
    renderLogs();
    addLog("Gameplay loaded. Press E for inventory and F to use portals or computers.");
    addLog("Press V to switch between Classic view and First Person mode.");
    addLog("Press P to open the pause menu.");
    addLog("Night brings monsters, and the Nether plus End portals are active.");
    bindEvents();
    resizeCanvas();
    updateViewModeUI();
    updateHUD();
    registerInstallSupport();
    openModeMenu();
    if (window.requestAnimationFrame) {
      window.requestAnimationFrame(function (ts) {
        state.lastTick = ts;
        step(ts);
      });
    } else {
      setInterval(function () {
        step(new Date().getTime());
      }, 33);
    }
  }

  init();
  window.__awesomeBooted = true;
}());
