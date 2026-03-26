(function () {
  var canvas = document.getElementById("gameCanvas");
  if (!canvas || !canvas.getContext) {
    return;
  }

  var ctx = canvas.getContext("2d");

  var ui = {
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
    modeMenu: document.getElementById("modeMenu"),
    singlePlayerBtn: document.getElementById("singlePlayerBtn"),
    multiPlayerBtn: document.getElementById("multiPlayerBtn"),
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
  var HOTBAR_SIZE = 6;
  var SAVE_KEY = "awesomecraft.lite.v4";
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

  var input = { up: false, down: false, left: false, right: false };

  var state = {
    playerName: "BuilderOne",
    realmCode: "",
    connected: false,
    friends: 1,
    dimension: "overworld",
    dayClock: 0.3,
    night: false,
    inventoryOpen: false,
    modeMenuOpen: false,
    pauseMenuOpen: false,
    worlds: { overworld: null, nether: null, end: null },
    player: { x: 0, y: 0, hp: 20, maxHp: 20, facing: "down", attackCooldown: 0 },
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
      html += '<button type="button" class="hotbar-slot' + (state.selectedHotbarIndex === i ? " selected" : "") + '" data-hotbar="' + i + '">';
      html += '<div class="swatch" style="background:' + (slot ? itemColor(slot.id) : "rgba(255,255,255,0.08)") + '"></div>';
      html += '<div class="slot-name">' + (slot ? itemLabel(slot.id) + " x" + slot.count : "Empty") + "</div>";
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
      ui.friendsList.innerHTML = '<div class="friend-card"><h4>' + state.playerName + '</h4><p>Realm host ready</p></div>';
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
    var code = ui.realmCodeInput.value || state.realmCode || "COOL";
    if (state.connected) {
      ui.modeStatus.textContent = "Multiplayer starts in realm " + code + ".";
    } else {
      ui.modeStatus.textContent = "Single player starts offline. Multiplayer starts local realm " + code + ".";
    }
  }

  function openModeMenu() {
    state.modeMenuOpen = true;
    if (ui.modeMenu) {
      ui.modeMenu.style.display = "flex";
    }
    updateModeStatus();
  }

  function closeModeMenu() {
    state.modeMenuOpen = false;
    if (ui.modeMenu) {
      ui.modeMenu.style.display = "none";
    }
  }

  function chooseSinglePlayer() {
    setRealm(false);
    closeModeMenu();
    addLog("Single-player mode selected.");
    notify("Single-player world ready.");
  }

  function chooseMultiplayer() {
    if (!ui.realmCodeInput.value) {
      ui.realmCodeInput.value = "COOL";
    }
    setRealm(true);
    closeModeMenu();
    addLog("Multiplayer mode selected.");
    notify("Multiplayer realm ready.");
  }

  function updateHUD() {
    var hotbarItem = selectedHotbarItem();
    var targetTile = state.targetTile ? tileAt(state.dimension, state.targetTile.x, state.targetTile.y) : null;
    ui.healthValue.textContent = Math.ceil(state.player.hp) + " / " + state.player.maxHp;
    ui.realmValue.textContent = state.connected ? state.realmCode : "Solo";
    ui.connectionBadge.textContent = state.connected ? "Realm Host" : "Offline";
    ui.voiceStatus.textContent = "Friends only";
    ui.recordStatus.textContent = "Ready";
    ui.timeValue.textContent = state.dimension === "end" ? "Void" : (state.dimension === "nether" ? "Inferno" : (state.night ? "Night" : "Day"));
    ui.dimensionValue.textContent = dimensionLabel(state.dimension);
    ui.timeBadge.textContent = state.dimension === "end" ? "Dragon sky" : (state.dimension === "nether" ? "Nether fire" : (state.night ? "Night monsters rising" : "Day"));
    ui.toolInfo.textContent = hotbarItem ? itemLabel(hotbarItem.id) + " x" + hotbarItem.count : "Empty Slot";
    ui.activePackSummary.textContent = "Everything unlocked";
    ui.buildTubeHint.textContent = nearestObject("computer") ? "Computer in reach" : "Find a computer";
    ui.targetInfo.textContent = targetTile ? state.targetTile.x + "," + state.targetTile.y + " " + (targetTile.object || targetTile.floor) : "Select a tile";
    ui.bossTitle.textContent = "Final Boss: " + state.boss.name;
    ui.bossHealthFill.style.width = ((state.boss.hp / state.boss.maxHp) * 100) + "%";
    ui.bossHealthText.textContent = Math.max(0, Math.ceil(state.boss.hp)) + " / " + state.boss.maxHp;
    ui.bossBanner.className = "boss-banner" + (state.boss.kind === "dragon" ? " dragon" : "") + (bossIsVisible() ? "" : " hidden");
  }

  function isNight() {
    return state.dayClock < 0.18 || state.dayClock > 0.72;
  }

  function tileBlocked(worldName, x, y) {
    var tile = tileAt(worldName, x, y);
    if (!tile) {
      return true;
    }
    if (tile.floor === "water" || tile.floor === "lava" || tile.floor === "void") {
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

  function isoPoint(gridX, gridY, height) {
    var dx = gridX - state.camera.x;
    var dy = gridY - state.camera.y;
    return {
      x: canvas.width / 2 + (dx - dy) * ISO_W * 0.5,
      y: canvas.height / 2 + (dx + dy) * ISO_H * 0.5 - height
    };
  }

  function floorHeight(tile) {
    if (!tile) {
      return 0;
    }
    if (tile.floor === "water" || tile.floor === "lava") {
      return 2;
    }
    return 0;
  }

  function objectHeight(name) {
    if (!name) {
      return 0;
    }
    if (name === "crystal") {
      return BLOCK_H + 10;
    }
    if (name === "portal" || name === "endportal") {
      return BLOCK_H + 12;
    }
    if (name === "altar" || name === "dragonaltar") {
      return BLOCK_H + 6;
    }
    return BLOCK_H;
  }

  function drawDiamond(cx, cy, width, height, fill) {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.moveTo(cx, cy - height * 0.5);
    ctx.lineTo(cx + width * 0.5, cy);
    ctx.lineTo(cx, cy + height * 0.5);
    ctx.lineTo(cx - width * 0.5, cy);
    ctx.closePath();
    ctx.fill();
  }

  function drawCube(gridX, gridY, baseColor, height) {
    var top = isoPoint(gridX, gridY, height);
    var base = isoPoint(gridX, gridY, 0);
    ctx.fillStyle = tint(baseColor, 22);
    ctx.beginPath();
    ctx.moveTo(top.x, top.y - ISO_H * 0.5);
    ctx.lineTo(top.x + ISO_W * 0.5, top.y);
    ctx.lineTo(top.x, top.y + ISO_H * 0.5);
    ctx.lineTo(top.x - ISO_W * 0.5, top.y);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = tint(baseColor, -18);
    ctx.beginPath();
    ctx.moveTo(top.x - ISO_W * 0.5, top.y);
    ctx.lineTo(top.x, top.y + ISO_H * 0.5);
    ctx.lineTo(base.x, base.y + ISO_H * 0.5);
    ctx.lineTo(base.x - ISO_W * 0.5, base.y);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = tint(baseColor, -38);
    ctx.beginPath();
    ctx.moveTo(top.x + ISO_W * 0.5, top.y);
    ctx.lineTo(top.x, top.y + ISO_H * 0.5);
    ctx.lineTo(base.x, base.y + ISO_H * 0.5);
    ctx.lineTo(base.x + ISO_W * 0.5, base.y);
    ctx.closePath();
    ctx.fill();
  }

  function drawTile(gridX, gridY, tile) {
    var base = isoPoint(gridX, gridY, 0);
    drawDiamond(base.x, base.y, ISO_W, ISO_H, colors[tile.floor] || colors.grass);
    if (tile.floor === "water" || tile.floor === "lava") {
      drawDiamond(base.x, base.y + 2, ISO_W - 8, ISO_H - 4, tint(colors[tile.floor], 18));
    }
    if (tile.object) {
      drawCube(gridX, gridY, colors[tile.object] || colors.stone, objectHeight(tile.object));
      if (tile.object === "computer") {
        var screen = isoPoint(gridX, gridY, objectHeight(tile.object));
        ctx.fillStyle = "#091822";
        ctx.fillRect(screen.x - 7, screen.y - 8, 14, 10);
        ctx.fillStyle = "#78f6d1";
        ctx.fillRect(screen.x - 5, screen.y - 6, 10, 6);
      }
      if (tile.object === "portal" || tile.object === "endportal") {
        var portal = isoPoint(gridX, gridY, objectHeight(tile.object));
        ctx.fillStyle = tile.object === "endportal" ? "rgba(140, 222, 255, 0.34)" : "rgba(255,255,255,0.3)";
        ctx.fillRect(portal.x - 5, portal.y - 16, 10, 16);
      }
    }
    if (state.targetTile && state.targetTile.x === gridX && state.targetTile.y === gridY) {
      ctx.strokeStyle = "#ffe799";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(base.x, base.y - ISO_H * 0.5);
      ctx.lineTo(base.x + ISO_W * 0.5, base.y);
      ctx.lineTo(base.x, base.y + ISO_H * 0.5);
      ctx.lineTo(base.x - ISO_W * 0.5, base.y);
      ctx.closePath();
      ctx.stroke();
      ctx.lineWidth = 1;
    }
  }

  function drawPlayer() {
    var screen = isoPoint(pixelToGrid(state.player.x), pixelToGrid(state.player.y), BLOCK_H + 10);
    drawCube(pixelToGrid(state.player.x), pixelToGrid(state.player.y), "#f7f39a", BLOCK_H + 10);
    ctx.fillStyle = "#13232f";
    ctx.fillRect(screen.x - 6, screen.y - 7, 4, 4);
    ctx.fillRect(screen.x + 2, screen.y - 7, 4, 4);
  }

  function drawBoss() {
    var bossX;
    var bossY;
    if (state.dimension !== state.boss.dimension || state.boss.defeated || !state.boss.awake) {
      return;
    }
    bossX = pixelToGrid(state.boss.x);
    bossY = pixelToGrid(state.boss.y);
    if (state.boss.kind === "dragon") {
      drawCube(bossX, bossY, state.boss.color, BLOCK_H * 1.9);
      drawCube(bossX - 1, bossY, state.boss.color, BLOCK_H * 1.45);
      drawCube(bossX + 1, bossY, state.boss.color, BLOCK_H * 1.45);
      drawCube(bossX, bossY - 1, colors.obsidian, BLOCK_H * 1.2);
      return;
    }
    drawCube(bossX, bossY, state.boss.color, BLOCK_H * 2.2);
  }

  function drawMonsters() {
    var monsters = state.monsters[state.dimension];
    var i;
    for (i = 0; i < monsters.length; i += 1) {
      drawCube(pixelToGrid(monsters[i].x), pixelToGrid(monsters[i].y), monsters[i].color, BLOCK_H);
    }
  }

  function renderWorld() {
    var world = currentWorld();
    var startX = Math.max(0, state.camera.x - 12);
    var startY = Math.max(0, state.camera.y - 12);
    var endX = Math.min(WORLD_W, state.camera.x + 13);
    var endY = Math.min(WORLD_H, state.camera.y + 13);
    var x;
    var y;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = state.dimension === "nether" ? "#402016" : (state.dimension === "end" ? "#170d27" : "#84d1e0");
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (y = startY; y < endY; y += 1) {
      for (x = startX; x < endX; x += 1) {
        drawTile(x, y, world[y][x]);
      }
    }
    drawBoss();
    drawMonsters();
    drawPlayer();
    if (state.dimension === "nether") {
      ctx.fillStyle = "rgba(70,18,12,0.18)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (state.dimension === "end") {
      ctx.fillStyle = "rgba(110,64,156,0.16)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (state.night) {
      ctx.fillStyle = "rgba(8,18,39,0.32)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
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
      if (distance < 96) {
        state.player.hp = clamp(state.player.hp - state.boss.damage * dt, 0, state.player.maxHp);
      }
      if (Math.random() < 0.01 && state.monsters.end.length < 6) {
        spawnMonster("enderling");
      }
      return;
    }
    state.boss.x += (dx / distance) * state.boss.speed * TILE * dt;
    state.boss.y += (dy / distance) * state.boss.speed * TILE * dt;
    if (distance < 60) {
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
    var moveX = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    var moveY = (input.down ? 1 : 0) - (input.up ? 1 : 0);
    var magnitude = Math.sqrt(moveX * moveX + moveY * moveY) || 1;
    var nextX = state.player.x + (moveX / magnitude) * PLAYER_SPEED * TILE * dt;
    var nextY = state.player.y + (moveY / magnitude) * PLAYER_SPEED * TILE * dt;
    if (moveX || moveY) {
      if (Math.abs(moveX) > Math.abs(moveY)) {
        state.player.facing = moveX > 0 ? "right" : "left";
      } else {
        state.player.facing = moveY > 0 ? "down" : "up";
      }
    }
    if (!tileBlocked(state.dimension, pixelToGrid(nextX), pixelToGrid(state.player.y))) {
      state.player.x = nextX;
    }
    if (!tileBlocked(state.dimension, pixelToGrid(state.player.x), pixelToGrid(nextY))) {
      state.player.y = nextY;
    }
    updateCamera();
  }

  function selectedTile() {
    if (state.targetTile) {
      return state.targetTile;
    }
    var px = pixelToGrid(state.player.x);
    var py = pixelToGrid(state.player.y);
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
    addItem(tile.object === "leaves" ? "wood" : tile.object, 1);
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
    takeItem(state.selectedHotbarIndex, 1);
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

  function saveGame() {
    var payload = {
      playerName: state.playerName,
      dimension: state.dimension,
      dayClock: state.dayClock,
      worlds: state.worlds,
      monsters: state.monsters,
      boss: state.boss,
      player: state.player,
      inventory: state.inventory
    };
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
      notify("World saved.");
    } catch (error) {
      notify("Save failed on this browser.");
    }
  }

  function loadGame() {
    var raw;
    var payload;
    seedInventory();
    resetWorlds();
    try {
      raw = localStorage.getItem(SAVE_KEY);
      if (!raw) {
        return;
      }
      payload = JSON.parse(raw);
      state.playerName = payload.playerName || state.playerName;
      state.dimension = payload.dimension || state.dimension;
      state.dayClock = typeof payload.dayClock === "number" ? payload.dayClock : state.dayClock;
      state.worlds = payload.worlds || state.worlds;
      state.monsters = payload.monsters || state.monsters;
      state.boss = payload.boss || state.boss;
      state.player = payload.player || state.player;
      state.inventory = payload.inventory || state.inventory;
    } catch (error2) {
      seedInventory();
      resetWorlds();
    }
  }

  function setRealm(active) {
    state.connected = active;
    state.realmCode = active ? (ui.realmCodeInput.value || "cool") : "";
    renderFriends();
    updateHUD();
    updateModeStatus();
  }

  function handlePointer(clientX, clientY) {
    var rect = canvas.getBoundingClientRect();
    var cx = clientX - rect.left - canvas.width / 2;
    var cy = clientY - rect.top - canvas.height / 2;
    var rx = cx / (ISO_W * 0.5);
    var ry = cy / (ISO_H * 0.5);
    var gx = Math.round((rx + ry) * 0.5 + state.camera.x);
    var gy = Math.round((ry - rx) * 0.5 + state.camera.y);
    state.targetTile = {
      x: clamp(gx, 0, WORLD_W - 1),
      y: clamp(gy, 0, WORLD_H - 1)
    };
  }

  function resizeCanvas() {
    canvas.width = canvas.clientWidth || 900;
    canvas.height = canvas.clientHeight || 620;
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
    ui.singlePlayerBtn.onclick = chooseSinglePlayer;
    ui.multiPlayerBtn.onclick = chooseMultiplayer;
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
    ui.recordBtn.onclick = function () {
      notify("Recording is browser-dependent in this compatibility build.");
    };
    ui.summonBossBtn.onclick = summonBoss;
    ui.healBtn.onclick = function () {
      state.player.hp = state.player.maxHp;
      notify("Health restored.");
    };
    ui.openInventoryBtn.onclick = openInventory;
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
      handlePointer(event.clientX, event.clientY);
    });
    canvas.addEventListener("pointermove", function (event) {
      if (event.buttons) {
        handlePointer(event.clientX, event.clientY);
      }
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
    closeInventory();
    closeComputer();
    closePauseMenu();
    renderLibrary();
    renderBuildTube();
    renderHotbar();
    renderInventory();
    renderFriends();
    renderLogs();
    addLog("Gameplay loaded. Press E for inventory and F to use portals or computers.");
    addLog("Press P to open the pause menu.");
    addLog("Night brings monsters, and the Nether plus End portals are active.");
    bindEvents();
    resizeCanvas();
    updateHUD();
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
}());
