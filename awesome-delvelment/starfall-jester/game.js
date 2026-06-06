const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const ui = {
  playerNameInput: document.getElementById("playerNameInput"),
  roleSelect: document.getElementById("roleSelect"),
  startBtn: document.getElementById("startBtn"),
  roleBadge: document.getElementById("roleBadge"),
  objectiveText: document.getElementById("objectiveText"),
  taskCounter: document.getElementById("taskCounter"),
  taskList: document.getElementById("taskList"),
  log: document.getElementById("log"),
  aliveCount: document.getElementById("aliveCount"),
  roleValue: document.getElementById("roleValue"),
  roomValue: document.getElementById("roomValue"),
  taskValue: document.getElementById("taskValue"),
  heatValue: document.getElementById("heatValue"),
  meetingValue: document.getElementById("meetingValue"),
  cooldownValue: document.getElementById("cooldownValue"),
  hintText: document.getElementById("hintText"),
  progressFill: document.getElementById("progressFill"),
  taskBtn: document.getElementById("taskBtn"),
  reportBtn: document.getElementById("reportBtn"),
  emergencyBtn: document.getElementById("emergencyBtn"),
  killBtn: document.getElementById("killBtn"),
  reviveBtn: document.getElementById("reviveBtn"),
  susBtn: document.getElementById("susBtn"),
  restartBtn: document.getElementById("restartBtn"),
  meetingOverlay: document.getElementById("meetingOverlay"),
  meetingTitle: document.getElementById("meetingTitle"),
  meetingReason: document.getElementById("meetingReason"),
  meetingCandidates: document.getElementById("meetingCandidates"),
  meetingSummary: document.getElementById("meetingSummary"),
  skipVoteBtn: document.getElementById("skipVoteBtn"),
  continueBtn: document.getElementById("continueBtn"),
  endOverlay: document.getElementById("endOverlay"),
  endTitle: document.getElementById("endTitle"),
  endReason: document.getElementById("endReason"),
  roleReveal: document.getElementById("roleReveal"),
  playAgainBtn: document.getElementById("playAgainBtn"),
};

const WORLD = {
  width: canvas.width,
  height: canvas.height,
  playerSpeed: 235,
  botSpeed: 152,
  killRange: 34,
  reviveRange: 50,
  reportRange: 48,
  taskRange: 50,
  visionRange: 155,
  meetingCooldown: 300,
  actorRadius: 18,
  hallwayHalfWidth: 40,
};

const ROLE_INFO = {
  crewmate: {
    name: "Crewmate",
    badge: "Crewmate",
    objective: "Finish all real tasks or vote out the imposter before the ship falls apart.",
  },
  imposter: {
    name: "Imposter",
    badge: "Imposter",
    objective: "Kill every non-jester player and avoid getting voted out in a meeting.",
  },
  reviver: {
    name: "Reviver",
    badge: "Reviver",
    objective: "Keep the crew alive by reviving fallen teammates before their bodies are reported.",
  },
  jester: {
    name: "Jester",
    badge: "Jester",
    objective: "Get voted out. You cannot be killed, but if the crew finishes tasks or ejects the imposter first, the crew wins instead.",
  },
};

const COLORS = [
  "#4ab8ff",
  "#ff6f7e",
  "#ffc664",
  "#95f0c5",
  "#cab8ff",
  "#ff9fd6",
  "#7ef3ff",
  "#e8f28c",
];

const NAMES = [
  "Nova",
  "Drift",
  "Kite",
  "Mira",
  "Sable",
  "Quill",
  "Rook",
];

const rooms = [
  { id: "medbay", name: "Medbay", x: 86, y: 74, w: 240, h: 132, color: "#16304a" },
  { id: "cafeteria", name: "Cafeteria", x: 438, y: 42, w: 404, h: 168, color: "#1d3656" },
  { id: "navigation", name: "Navigation", x: 1066, y: 58, w: 164, h: 162, color: "#17314b" },
  { id: "reactor", name: "Reactor", x: 76, y: 254, w: 232, h: 146, color: "#142a42" },
  { id: "security", name: "Security", x: 334, y: 262, w: 182, h: 120, color: "#16283a" },
  { id: "weapons", name: "Weapons", x: 880, y: 244, w: 246, h: 150, color: "#173150" },
  { id: "electrical", name: "Electrical", x: 118, y: 500, w: 244, h: 150, color: "#1b253f" },
  { id: "storage", name: "Storage", x: 470, y: 466, w: 290, h: 188, color: "#17304a" },
  { id: "admin", name: "Admin", x: 788, y: 510, w: 218, h: 140, color: "#21334f" },
  { id: "shields", name: "Shields", x: 1032, y: 514, w: 172, h: 148, color: "#193654" },
];

rooms.forEach((room) => {
  room.cx = room.x + room.w / 2;
  room.cy = room.y + room.h / 2;
});

const hallwayLines = [
  ["medbay", "cafeteria"],
  ["cafeteria", "navigation"],
  ["reactor", "security"],
  ["security", "weapons"],
  ["electrical", "storage"],
  ["storage", "admin"],
  ["admin", "shields"],
  ["cafeteria", "security"],
  ["security", "storage"],
  ["weapons", "admin"],
];

const roomGraph = buildRoomGraph();

const stations = [
  { id: "starchart", label: "Chart Course", roomId: "navigation", x: 1148, y: 134 },
  { id: "uplink", label: "Calibrate Uplink", roomId: "cafeteria", x: 516, y: 120 },
  { id: "scan", label: "Run Bio Scan", roomId: "medbay", x: 176, y: 142 },
  { id: "reactor", label: "Prime Reactor", roomId: "reactor", x: 174, y: 332 },
  { id: "logs", label: "Review Logs", roomId: "security", x: 422, y: 322 },
  { id: "cannons", label: "Align Cannons", roomId: "weapons", x: 992, y: 320 },
  { id: "wires", label: "Rewire Junction", roomId: "electrical", x: 246, y: 572 },
  { id: "fuel", label: "Balance Fuel Lines", roomId: "storage", x: 596, y: 578 },
  { id: "ledger", label: "Route Nav Ledger", roomId: "admin", x: 884, y: 582 },
  { id: "shields", label: "Tune Shields", roomId: "shields", x: 1116, y: 596 },
];

const stationById = new Map(stations.map((station) => [station.id, station]));
const roomById = new Map(rooms.map((room) => [room.id, room]));
const emergencyButton = { x: 640, y: 124, radius: 26 };

const spawnPoints = [
  { x: 580, y: 108 },
  { x: 628, y: 92 },
  { x: 685, y: 110 },
  { x: 730, y: 138 },
  { x: 685, y: 170 },
  { x: 620, y: 172 },
  { x: 562, y: 150 },
  { x: 742, y: 98 },
];

const stars = Array.from({ length: 80 }, () => ({
  x: Math.random() * WORLD.width,
  y: Math.random() * WORLD.height,
  r: 0.8 + Math.random() * 1.8,
  alpha: 0.16 + Math.random() * 0.48,
}));

let rafId = 0;
const pressed = new Set();
let game = createEmptyGame();

function createEmptyGame() {
  return {
    running: false,
    characters: [],
    bodies: [],
    logs: [],
    winner: null,
    pendingWinner: null,
    meeting: null,
    meetingCount: 0,
    bodyCounter: 0,
    emergencyCooldown: 0,
    lastFrame: 0,
    uiDirty: true,
  };
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function formatSeconds(seconds) {
  const safe = Math.max(0, Math.ceil(seconds));
  const minutes = Math.floor(safe / 60);
  const remainder = String(safe % 60).padStart(2, "0");
  return `${minutes}:${remainder}`;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function shuffle(list) {
  const copy = [...list];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function markUIDirty() {
  game.uiDirty = true;
}

function getCharacter(id) {
  return game.characters.find((character) => character.id === id) || null;
}

function getPlayer() {
  return game.characters.find((character) => character.isPlayer) || null;
}

function aliveCharacters() {
  return game.characters.filter((character) => character.alive);
}

function aliveNonImposters() {
  return aliveCharacters().filter((character) => character.role !== "imposter");
}

function isCrewTaskRole(role) {
  return role === "crewmate" || role === "reviver";
}

function buildRoomGraph() {
  const graph = new Map(rooms.map((room) => [room.id, []]));
  for (const [left, right] of hallwayLines) {
    graph.get(left).push(right);
    graph.get(right).push(left);
  }
  return graph;
}

function distanceToSegment(pointX, pointY, startX, startY, endX, endY) {
  const dx = endX - startX;
  const dy = endY - startY;
  if (dx === 0 && dy === 0) {
    return Math.hypot(pointX - startX, pointY - startY);
  }
  const t = clamp(((pointX - startX) * dx + (pointY - startY) * dy) / (dx * dx + dy * dy), 0, 1);
  const projectionX = startX + dx * t;
  const projectionY = startY + dy * t;
  return Math.hypot(pointX - projectionX, pointY - projectionY);
}

function isPointInsideRoom(room, x, y, padding = 0) {
  return (
    x >= room.x + padding &&
    x <= room.x + room.w - padding &&
    y >= room.y + padding &&
    y <= room.y + room.h - padding
  );
}

function isPointInHallway(x, y, padding = 0) {
  const allowance = Math.max(10, WORLD.hallwayHalfWidth - padding);
  return hallwayLines.some(([fromId, toId]) => {
    const from = roomById.get(fromId);
    const to = roomById.get(toId);
    return distanceToSegment(x, y, from.cx, from.cy, to.cx, to.cy) <= allowance;
  });
}

function isWalkablePoint(x, y, padding = WORLD.actorRadius) {
  if (
    x < padding ||
    y < padding ||
    x > WORLD.width - padding ||
    y > WORLD.height - padding
  ) {
    return false;
  }
  return rooms.some((room) => isPointInsideRoom(room, x, y, padding)) || isPointInHallway(x, y, padding);
}

function moveCharacterBy(character, deltaX, deltaY) {
  const nextX = clamp(character.x + deltaX, WORLD.actorRadius, WORLD.width - WORLD.actorRadius);
  const nextY = clamp(character.y + deltaY, WORLD.actorRadius, WORLD.height - WORLD.actorRadius);

  if (isWalkablePoint(nextX, nextY)) {
    character.x = nextX;
    character.y = nextY;
    return;
  }
  if (isWalkablePoint(nextX, character.y)) {
    character.x = nextX;
  }
  if (isWalkablePoint(character.x, nextY)) {
    character.y = nextY;
  }
}

function buildRoomPath(startRoomId, endRoomId) {
  if (!startRoomId || !endRoomId) {
    return [];
  }
  if (startRoomId === endRoomId) {
    return [startRoomId];
  }

  const queue = [[startRoomId]];
  const seen = new Set([startRoomId]);
  while (queue.length > 0) {
    const path = queue.shift();
    const roomId = path[path.length - 1];
    for (const nextId of roomGraph.get(roomId) || []) {
      if (seen.has(nextId)) {
        continue;
      }
      const nextPath = [...path, nextId];
      if (nextId === endRoomId) {
        return nextPath;
      }
      seen.add(nextId);
      queue.push(nextPath);
    }
  }
  return [startRoomId, endRoomId];
}

function createBotTarget(x, y, kind, extra = {}) {
  return {
    x,
    y,
    kind,
    roomId: extra.roomId ?? findRoomAt(x, y)?.id ?? null,
    path: [],
    pathIndex: 0,
    ...extra,
  };
}

function setBotTarget(bot, target) {
  const startRoomId = findRoomAt(bot.x, bot.y)?.id ?? null;
  const endRoomId = target.roomId ?? findRoomAt(target.x, target.y)?.id ?? null;
  const roomPath = buildRoomPath(startRoomId, endRoomId);
  const path = [];

  if (roomPath.length > 1) {
    for (const roomId of roomPath.slice(1)) {
      const room = roomById.get(roomId);
      path.push({ x: room.cx, y: room.cy });
    }
  }

  const lastPoint = path[path.length - 1];
  if (!lastPoint || Math.hypot(lastPoint.x - target.x, lastPoint.y - target.y) > 12) {
    path.push({ x: target.x, y: target.y });
  }

  target.path = path;
  target.pathIndex = 0;
  bot.target = target;
}

function currentBotWaypoint(target) {
  return target?.path?.[target.pathIndex] ?? target;
}

function getCrewTaskTotals() {
  let completed = 0;
  let total = 0;
  for (const character of game.characters) {
    if (!isCrewTaskRole(character.role)) {
      continue;
    }
    completed += character.completedTasks.length;
    total += character.completedTasks.length;
    if (character.alive) {
      total += character.tasks.length - character.completedTasks.length;
    }
  }
  return { completed, total };
}

function findRoomAt(x, y) {
  const containing = rooms.find(
    (room) => x >= room.x && x <= room.x + room.w && y >= room.y && y <= room.y + room.h,
  );
  if (containing) {
    return containing;
  }
  return rooms.reduce((nearest, room) => {
    if (!nearest) {
      return room;
    }
    return Math.hypot(room.cx - x, room.cy - y) < Math.hypot(nearest.cx - x, nearest.cy - y) ? room : nearest;
  }, null);
}

function formatRole(role) {
  return ROLE_INFO[role]?.name ?? role;
}

function roleTint(role) {
  if (role === "imposter") {
    return "#ff7b8c";
  }
  if (role === "reviver") {
    return "#95f0c5";
  }
  if (role === "jester") {
    return "#ffd56f";
  }
  return "#8be1ff";
}

function logEvent(text, alert = false) {
  game.logs.unshift({ id: `${Date.now()}-${Math.random()}`, text, alert });
  game.logs = game.logs.slice(0, 12);
  markUIDirty();
}

function buildRoleAssignment(selection) {
  const basePool = ["imposter", "jester", "reviver", "crewmate", "crewmate", "crewmate", "crewmate", "crewmate"];
  if (selection === "random") {
    const shuffled = shuffle(basePool);
    return {
      playerRole: shuffled[0],
      botRoles: shuffled.slice(1),
    };
  }

  const pool = [...basePool];
  const ownIndex = pool.indexOf(selection);
  pool.splice(ownIndex, 1);
  return {
    playerRole: selection,
    botRoles: shuffle(pool),
  };
}

function buildTaskSet(count) {
  return shuffle(stations.map((station) => station.id)).slice(0, count);
}

function createCharacter({ id, name, role, isPlayer, color, spawn }) {
  return {
    id,
    name,
    role,
    isPlayer,
    color,
    x: spawn.x,
    y: spawn.y,
    alive: true,
    ejected: false,
    suspicion: role === "jester" ? 8 : 0,
    meetingsCalled: 0,
    tasks: isCrewTaskRole(role) ? buildTaskSet(3) : [],
    completedTasks: [],
    fakeTasks: role === "jester" ? buildTaskSet(3) : [],
    completedFakeTasks: [],
    target: null,
    tasking: null,
    decisionCooldown: randomBetween(0.1, 0.7),
    waitTimer: 0,
    speedScale: randomBetween(0.94, 1.08),
    killCooldown: 0,
    emergencyUses: role === "imposter" ? 0 : 1,
    chaosCooldown: role === "jester" ? 7 : 0,
  };
}

function nextTaskId(character) {
  if (isCrewTaskRole(character.role)) {
    return character.tasks.find((taskId) => !character.completedTasks.includes(taskId)) || null;
  }
  if (character.role === "jester") {
    return character.fakeTasks.find((taskId) => !character.completedFakeTasks.includes(taskId)) || null;
  }
  return null;
}

function taskProgressFor(character) {
  if (isCrewTaskRole(character.role)) {
    return [character.completedTasks.length, character.tasks.length];
  }
  if (character.role === "jester") {
    return [character.completedFakeTasks.length, character.fakeTasks.length];
  }
  return [0, 0];
}

function remainingCrewTasks(character) {
  if (!isCrewTaskRole(character.role)) {
    return 0;
  }
  return character.tasks.length - character.completedTasks.length;
}

function removeOutstandingTasks(character) {
  character.tasking = null;
  character.target = null;
  markUIDirty();
}

function createMatch() {
  if (rafId) {
    cancelAnimationFrame(rafId);
  }

  document.activeElement?.blur?.();
  pressed.clear();
  game = createEmptyGame();

  const chosenRole = ui.roleSelect.value;
  const playerName = (ui.playerNameInput.value || "Captain Blue").trim().slice(0, 18) || "Captain Blue";
  const roles = buildRoleAssignment(chosenRole);

  const characters = [];
  characters.push(
    createCharacter({
      id: "player",
      name: playerName,
      role: roles.playerRole,
      isPlayer: true,
      color: COLORS[0],
      spawn: spawnPoints[0],
    }),
  );

  const botNames = shuffle(NAMES);
  roles.botRoles.forEach((role, index) => {
    characters.push(
      createCharacter({
        id: `bot-${index + 1}`,
        name: botNames[index],
        role,
        isPlayer: false,
        color: COLORS[index + 1],
        spawn: spawnPoints[index + 1],
      }),
    );
  });

  game.characters = characters;
  game.running = true;
  game.lastFrame = performance.now();
  game.uiDirty = true;

  hideMeeting();
  hideWinner();
  logEvent("The Starfall opens for departure.");
  logEvent(`You are the ${formatRole(getPlayer().role)}. ${ROLE_INFO[getPlayer().role].objective}`);
  logEvent("One imposter, one jester, and one reviver are hidden among the crew.");

  renderPanels();
  draw();
  rafId = requestAnimationFrame(loop);
}

function loop(timestamp) {
  const dt = Math.min((timestamp - game.lastFrame) / 1000, 0.05);
  game.lastFrame = timestamp;

  if (game.running && !game.winner) {
    if (!game.meeting) {
      updateWorld(dt);
    }
    draw();
    renderLiveStats();
    syncButtons();
    if (game.uiDirty) {
      renderPanels();
    }
  } else {
    draw();
    renderLiveStats();
    syncButtons();
    if (game.uiDirty) {
      renderPanels();
    }
  }

  rafId = requestAnimationFrame(loop);
}

function updateWorld(dt) {
  game.emergencyCooldown = Math.max(0, game.emergencyCooldown - dt);
  updatePlayer(dt);
  updateBots(dt);
  checkVictory();
}

function updatePlayer(dt) {
  const player = getPlayer();
  if (!player) {
    return;
  }

  player.killCooldown = Math.max(0, player.killCooldown - dt);
  player.chaosCooldown = Math.max(0, player.chaosCooldown - dt);

  if (!player.alive) {
    return;
  }

  if (player.tasking) {
    player.tasking.timeLeft -= dt;
    if (player.tasking.timeLeft <= 0) {
      finishTask(player, player.tasking.stationId, player.tasking.fake);
      player.tasking = null;
    }
    return;
  }

  let dx = 0;
  let dy = 0;
  if (pressed.has("left")) {
    dx -= 1;
  }
  if (pressed.has("right")) {
    dx += 1;
  }
  if (pressed.has("up")) {
    dy -= 1;
  }
  if (pressed.has("down")) {
    dy += 1;
  }

  if (dx !== 0 || dy !== 0) {
    const length = Math.hypot(dx, dy);
    const stepX = (dx / length) * WORLD.playerSpeed * dt;
    const stepY = (dy / length) * WORLD.playerSpeed * dt;
    moveCharacterBy(player, stepX, stepY);
  }
}

function updateBots(dt) {
  for (const bot of game.characters) {
    if (bot.isPlayer || !bot.alive) {
      continue;
    }

    bot.killCooldown = Math.max(0, bot.killCooldown - dt);
    bot.chaosCooldown = Math.max(0, bot.chaosCooldown - dt);
    bot.decisionCooldown -= dt;
    bot.waitTimer = Math.max(0, bot.waitTimer - dt);

    if (bot.tasking) {
      bot.tasking.timeLeft -= dt;
      if (bot.tasking.timeLeft <= 0) {
        finishTask(bot, bot.tasking.stationId, bot.tasking.fake);
        bot.tasking = null;
      }
      continue;
    }

    if (bot.role === "reviver") {
      const revivable = getNearestBody(bot, WORLD.reviveRange + 6);
      if (revivable) {
        reviveBody(bot, revivable);
        continue;
      }
    }

    const reportable = getNearestBody(bot, WORLD.reportRange + 6);
    if (reportable && bot.role !== "imposter") {
      if (bot.role === "jester" && Math.random() < 0.35) {
        bot.suspicion = clamp(bot.suspicion + 2, 0, 100);
      } else {
        startMeeting(bot.id, `${bot.name} reported ${getCharacter(reportable.victimId).name}'s body in ${roomById.get(reportable.roomId).name}.`, reportable.id);
        break;
      }
    }

    if (bot.waitTimer > 0) {
      continue;
    }

    if (bot.role === "imposter" && bot.killCooldown <= 0) {
      const victim = getNearestVictim(bot, WORLD.killRange + 5);
      if (victim) {
        executeKill(bot, victim);
        if (game.meeting) {
          break;
        }
        continue;
      }
    }

    const waypoint = currentBotWaypoint(bot.target);
    const arrived = waypoint && distance(bot, waypoint) < 10;
    if (!bot.target || arrived || bot.decisionCooldown <= 0) {
      chooseBotAction(bot);
    }

    if (bot.target) {
      moveBotToward(bot, bot.target, dt);
      const currentPoint = currentBotWaypoint(bot.target);
      if (currentPoint && distance(bot, currentPoint) < 10) {
        handleBotArrival(bot);
      }
    }
  }
}

function chooseBotAction(bot) {
  bot.decisionCooldown = randomBetween(0.5, 1.1);

  if (bot.role === "crewmate") {
    const suspect = getMostSuspiciousAlive(bot.id);
    if (
      suspect &&
      suspect.suspicion > 62 &&
      bot.emergencyUses > 0 &&
      game.emergencyCooldown <= 0 &&
      Math.random() < 0.32
    ) {
      setBotTarget(bot, createBotTarget(emergencyButton.x, emergencyButton.y, "emergency", { roomId: "cafeteria" }));
      return;
    }

    const taskId = nextTaskId(bot);
    if (taskId) {
      const station = stationById.get(taskId);
      setBotTarget(
        bot,
        createBotTarget(station.x + randomBetween(-8, 8), station.y + randomBetween(-8, 8), "task", {
          stationId: taskId,
          roomId: station.roomId,
        }),
      );
      return;
    }

    setBotTarget(bot, makeRoamTarget(pickRandom(rooms)));
    return;
  }

  if (bot.role === "reviver") {
    const body = getNearestBody(bot, 9999);
    if (body) {
      setBotTarget(bot, createBotTarget(body.x, body.y, "revive", { bodyId: body.id, roomId: body.roomId }));
      return;
    }

    const suspect = getMostSuspiciousAlive(bot.id);
    if (
      suspect &&
      suspect.suspicion > 68 &&
      bot.emergencyUses > 0 &&
      game.emergencyCooldown <= 0 &&
      Math.random() < 0.25
    ) {
      setBotTarget(bot, createBotTarget(emergencyButton.x, emergencyButton.y, "emergency", { roomId: "cafeteria" }));
      return;
    }

    const taskId = nextTaskId(bot);
    if (taskId) {
      const station = stationById.get(taskId);
      setBotTarget(
        bot,
        createBotTarget(station.x + randomBetween(-8, 8), station.y + randomBetween(-8, 8), "task", {
          stationId: taskId,
          roomId: station.roomId,
        }),
      );
      return;
    }

    setBotTarget(bot, makeRoamTarget(getCrowdedRoom() || pickRandom(rooms)));
    return;
  }

  if (bot.role === "jester") {
    if (Math.random() < 0.28) {
      bot.suspicion = clamp(bot.suspicion + randomBetween(3, 7), 0, 100);
    }

    if (
      bot.emergencyUses > 0 &&
      game.emergencyCooldown <= 0 &&
      bot.chaosCooldown <= 0 &&
      Math.random() < 0.24
    ) {
      setBotTarget(bot, createBotTarget(emergencyButton.x, emergencyButton.y, "emergency", { roomId: "cafeteria" }));
      return;
    }

    const taskId = nextTaskId(bot);
    if (taskId && Math.random() < 0.72) {
      const station = stationById.get(taskId);
      setBotTarget(
        bot,
        createBotTarget(station.x + randomBetween(-8, 8), station.y + randomBetween(-8, 8), "task", {
          stationId: taskId,
          roomId: station.roomId,
        }),
      );
      return;
    }

    const crowded = getCrowdedRoom() || pickRandom(rooms);
    setBotTarget(bot, makeRoamTarget(crowded));
    return;
  }

  const victim = getNearestVictim(bot, 9999);
  if (victim) {
    const targetRoom = findRoomAt(victim.x, victim.y)?.id ?? null;
    setBotTarget(
      bot,
      createBotTarget(victim.x + randomBetween(-12, 12), victim.y + randomBetween(-12, 12), "hunt", {
        victimId: victim.id,
        roomId: targetRoom,
      }),
    );
    return;
  }

  setBotTarget(bot, makeRoamTarget(pickRandom(rooms)));
}

function makeRoamTarget(room) {
  return createBotTarget(
    room.cx + randomBetween(-room.w * 0.18, room.w * 0.18),
    room.cy + randomBetween(-room.h * 0.18, room.h * 0.18),
    "roam",
    { roomId: room.id },
  );
}

function getCrowdedRoom() {
  let bestRoom = null;
  let bestCount = -1;
  for (const room of rooms) {
    const count = aliveCharacters().filter((character) => findRoomAt(character.x, character.y)?.id === room.id).length;
    if (count > bestCount) {
      bestCount = count;
      bestRoom = room;
    }
  }
  return bestRoom;
}

function moveBotToward(bot, target, dt) {
  if (target.kind === "hunt") {
    const victim = getCharacter(target.victimId);
    if (!victim || !victim.alive) {
      bot.target = null;
      return;
    }
    const roomId = findRoomAt(victim.x, victim.y)?.id ?? null;
    if (roomId !== target.roomId || Math.hypot(victim.x - target.x, victim.y - target.y) > 24) {
      setBotTarget(
        bot,
        createBotTarget(victim.x + randomBetween(-12, 12), victim.y + randomBetween(-12, 12), "hunt", {
          victimId: victim.id,
          roomId,
        }),
      );
      target = bot.target;
    }
  }

  const waypoint = currentBotWaypoint(target);
  const dx = waypoint.x - bot.x;
  const dy = waypoint.y - bot.y;
  const length = Math.hypot(dx, dy);
  if (!length) {
    return;
  }
  const speedBoost = bot.role === "imposter" && bot.killCooldown <= 0 ? 1.06 : 1;
  const speed = WORLD.botSpeed * bot.speedScale * speedBoost;
  const step = Math.min(length, speed * dt);
  moveCharacterBy(bot, (dx / length) * step, (dy / length) * step);
}

function handleBotArrival(bot) {
  if (!bot.target) {
    return;
  }

  if (bot.target.pathIndex < bot.target.path.length - 1) {
    bot.target.pathIndex += 1;
    return;
  }

  if (bot.target.kind === "task") {
    const fake = bot.role === "jester";
    const duration = fake ? randomBetween(1.0, 1.6) : randomBetween(1.3, 2.0);
    bot.tasking = {
      stationId: bot.target.stationId,
      fake,
      duration,
      timeLeft: duration,
    };
    bot.target = null;
    return;
  }

  if (bot.target.kind === "revive") {
    const body = game.bodies.find((entry) => entry.id === bot.target.bodyId) || getNearestBody(bot, WORLD.reviveRange + 6);
    if (body) {
      reviveBody(bot, body);
    }
    bot.target = null;
    return;
  }

  if (bot.target.kind === "emergency" && bot.emergencyUses > 0 && game.emergencyCooldown <= 0) {
    bot.emergencyUses -= 1;
    bot.meetingsCalled += 1;
    bot.suspicion = clamp(bot.suspicion + (bot.role === "jester" ? 18 : 8), 0, 100);
    if (bot.role === "jester") {
      bot.chaosCooldown = 12;
      startMeeting(bot.id, `${bot.name} slammed the emergency button and launched into a chaotic speech.`, null);
    } else {
      startMeeting(bot.id, `${bot.name} called an emergency meeting in Cafeteria.`, null);
    }
    bot.target = null;
    return;
  }

  bot.waitTimer = randomBetween(0.2, 0.9);
  bot.target = null;
}

function finishTask(character, stationId, fake) {
  const station = stationById.get(stationId);
  if (!station) {
    return;
  }

  if (fake) {
    if (!character.completedFakeTasks.includes(stationId)) {
      character.completedFakeTasks.push(stationId);
      character.suspicion = clamp(character.suspicion - 1, 0, 100);
      if (character.isPlayer) {
        logEvent(`You faked the task "${station.label}".`);
      }
    }
  } else if (!character.completedTasks.includes(stationId)) {
    character.completedTasks.push(stationId);
    character.suspicion = clamp(character.suspicion - 4, 0, 100);
    if (character.isPlayer) {
      logEvent(`You completed "${station.label}".`);
    }
  }

  markUIDirty();
}

function getNearestVictim(source, range) {
  let best = null;
  let bestDistance = range;
  for (const target of aliveCharacters()) {
    if (target.id === source.id || target.role === "imposter" || target.role === "jester") {
      continue;
    }
    const gap = distance(source, target);
    if (gap < bestDistance) {
      bestDistance = gap;
      best = target;
    }
  }
  return best;
}

function getNearestBody(source, range) {
  let best = null;
  let bestDistance = range;
  for (const body of game.bodies) {
    if (body.reported) {
      continue;
    }
    const gap = distance(source, body);
    if (gap < bestDistance) {
      bestDistance = gap;
      best = body;
    }
  }
  return best;
}

function reviveBody(reviver, body) {
  if (!reviver.alive || !body || body.reported) {
    return false;
  }

  const target = getCharacter(body.victimId);
  if (!target || target.alive || target.ejected) {
    return false;
  }

  target.alive = true;
  target.tasking = null;
  target.target = null;
  target.x = body.x;
  target.y = body.y;
  target.suspicion = clamp(target.suspicion - 10, 0, 100);
  game.bodies = game.bodies.filter((entry) => entry.id !== body.id);

  if (reviver.isPlayer) {
    logEvent(`You revived ${target.name} before the body was reported.`, true);
  } else if (target.isPlayer) {
    logEvent(`${reviver.name} revived you in ${roomById.get(body.roomId).name}.`, true);
  } else {
    logEvent(`${reviver.name} revived ${target.name} in ${roomById.get(body.roomId).name}.`, true);
  }

  markUIDirty();
  return true;
}

function executeKill(killer, victim) {
  if (!killer.alive || !victim.alive || victim.role === "jester") {
    return;
  }

  victim.alive = false;
  victim.tasking = null;
  victim.target = null;
  removeOutstandingTasks(victim);

  const room = findRoomAt(victim.x, victim.y) || findRoomAt(killer.x, killer.y) || rooms[0];
  const body = {
    id: `body-${game.bodyCounter += 1}`,
    victimId: victim.id,
    killerId: killer.id,
    x: victim.x,
    y: victim.y,
    roomId: room.id,
    reported: false,
  };
  game.bodies.push(body);
  killer.killCooldown = 0;

  const witnesses = aliveCharacters().filter(
    (character) =>
      character.id !== killer.id &&
      character.id !== victim.id &&
      distance(character, victim) <= WORLD.visionRange,
  );
  if (witnesses.length > 0) {
    killer.suspicion = clamp(killer.suspicion + 58, 0, 100);
  }

  const player = getPlayer();
  if (player?.id === killer.id) {
    logEvent(`You eliminated ${victim.name} in ${room.name}.`, true);
  } else if (player?.id === victim.id) {
    logEvent(`${killer.name} took you out in ${room.name}.`, true);
  } else if (player?.alive && distance(player, victim) <= WORLD.visionRange) {
    logEvent(`You saw ${killer.name} eliminate ${victim.name} in ${room.name}.`, true);
    killer.suspicion = clamp(killer.suspicion + 18, 0, 100);
  }

  markUIDirty();
}

function startMeeting(callerId, reason, bodyId) {
  if (game.meeting || game.winner) {
    return;
  }

  game.meetingCount += 1;
  game.meeting = {
    callerId,
    reason,
    bodyId,
    phase: "vote",
    result: null,
  };
  game.emergencyCooldown = WORLD.meetingCooldown;

  for (const character of game.characters) {
    character.target = null;
    character.tasking = null;
  }

  if (bodyId) {
    const body = game.bodies.find((entry) => entry.id === bodyId);
    if (body) {
      body.reported = true;
      for (const character of aliveCharacters()) {
        if (character.id !== callerId && distance(character, body) < 112) {
          character.suspicion = clamp(character.suspicion + 8, 0, 100);
        }
      }
    }
  }

  logEvent(reason, true);
  markUIDirty();
  renderMeeting();

  if (!getPlayer().alive) {
    window.setTimeout(() => {
      if (game.meeting?.phase === "vote") {
        resolveMeeting(null);
      }
    }, 700);
  }
}

function computeAIVote(voter) {
  const choices = aliveCharacters().filter((target) => target.id !== voter.id);
  if (choices.length === 0) {
    return null;
  }

  let best = null;
  let runnerUp = -Infinity;
  for (const target of choices) {
    let score = target.suspicion + randomBetween(-9, 9);
    if (target.meetingsCalled > 0) {
      score += target.meetingsCalled * 2;
    }
    if (voter.role === "imposter" && target.role === "imposter") {
      score = -Infinity;
    }
    if (score > (best?.score ?? -Infinity)) {
      runnerUp = best?.score ?? runnerUp;
      best = { targetId: target.id, score };
    } else if (score > runnerUp) {
      runnerUp = score;
    }
  }

  if (!best || best.score < 17) {
    return null;
  }

  if (best.score - runnerUp < 4 && Math.random() < 0.42) {
    return null;
  }

  return best.targetId;
}

function resolveMeeting(playerVoteId) {
  if (!game.meeting || game.meeting.phase !== "vote") {
    return;
  }

  const votes = [];
  const tally = new Map();
  const addVote = (targetId) => {
    const key = targetId || "skip";
    tally.set(key, (tally.get(key) || 0) + 1);
  };

  for (const character of aliveCharacters()) {
    let vote = null;
    if (character.isPlayer) {
      vote = playerVoteId;
    } else {
      vote = computeAIVote(character);
    }
    votes.push({ voterId: character.id, targetId: vote });
    addVote(vote);
  }

  const sorted = [...tally.entries()].sort((a, b) => b[1] - a[1]);
  let ejectedId = null;
  if (sorted.length > 0) {
    const [topKey, topVotes] = sorted[0];
    const secondVotes = sorted[1]?.[1] ?? -1;
    if (topKey !== "skip" && topVotes > secondVotes) {
      ejectedId = topKey;
    }
  }

  let resolutionText = "The vote was tied or skipped. Nobody was ejected.";
  if (ejectedId) {
    const target = getCharacter(ejectedId);
    target.alive = false;
    target.ejected = true;
    target.tasking = null;
    target.target = null;
    removeOutstandingTasks(target);
    resolutionText = `${target.name} was ejected. Role revealed: ${formatRole(target.role)}.`;
    if (target.role === "jester") {
      game.pendingWinner = {
        team: "jester",
        reason: `${target.name} was voted out. That was exactly what the jester wanted.`,
      };
    } else if (target.role === "imposter") {
      game.pendingWinner = {
        team: "crew",
        reason: `${target.name} was the imposter. The crew has secured the ship.`,
      };
    }
  }

  game.meeting.phase = "result";
  game.meeting.result = { votes, tally, ejectedId, resolutionText };

  markUIDirty();
  renderMeeting();
}

function finishMeeting() {
  if (!game.meeting || game.meeting.phase !== "result") {
    return;
  }

  game.bodies = [];
  for (const [index, character] of aliveCharacters().entries()) {
    const spawn = spawnPoints[index % spawnPoints.length];
    character.x = spawn.x;
    character.y = spawn.y;
    character.target = null;
    character.tasking = null;
    character.waitTimer = 0;
    character.suspicion = clamp(character.suspicion * 0.84, 0, 100);
  }

  hideMeeting();
  game.meeting = null;
  markUIDirty();

  if (game.pendingWinner) {
    setWinner(game.pendingWinner.team, game.pendingWinner.reason);
    game.pendingWinner = null;
    return;
  }

  checkVictory();
}

function checkVictory() {
  if (game.winner || game.pendingWinner) {
    return;
  }

  const imposter = game.characters.find((character) => character.role === "imposter");
  if (!imposter?.alive) {
    setWinner("crew", "The imposter is gone. The crew wins the round.");
    return;
  }

  const taskTotals = getCrewTaskTotals();
  const aliveCrew = aliveCharacters().some((character) => isCrewTaskRole(character.role));
  if (aliveCrew && taskTotals.total > 0 && taskTotals.completed >= taskTotals.total) {
    setWinner("crew", "Every real task has been completed. The crew wins.");
    return;
  }

  if (aliveNonImposters().length === 0) {
    setWinner("imposter", "The imposter killed everyone else on the ship.");
  }
}

function setWinner(team, reason) {
  game.running = false;
  game.winner = { team, reason };
  logEvent(reason, true);
  showWinner(team, reason);
  markUIDirty();
}

function getMostSuspiciousAlive(exceptId) {
  return aliveCharacters()
    .filter((character) => character.id !== exceptId)
    .sort((left, right) => right.suspicion - left.suspicion)[0] || null;
}

function canPlayerDoTask() {
  const player = getPlayer();
  if (!player || !player.alive || player.tasking || game.meeting || game.winner) {
    return null;
  }
  const taskId = nextTaskId(player);
  if (!taskId) {
    return null;
  }
  const station = stationById.get(taskId);
  if (distance(player, station) <= WORLD.taskRange) {
    return { station, fake: player.role === "jester" };
  }
  return null;
}

function canPlayerRevive() {
  const player = getPlayer();
  if (!player || player.role !== "reviver" || !player.alive || game.meeting || game.winner) {
    return null;
  }
  return getNearestBody(player, WORLD.reviveRange);
}

function canPlayerReport() {
  const player = getPlayer();
  if (!player || !player.alive || game.meeting || game.winner) {
    return null;
  }
  return getNearestBody(player, WORLD.reportRange);
}

function canPlayerEmergency() {
  const player = getPlayer();
  if (!player || !player.alive || game.meeting || game.winner) {
    return false;
  }
  return player.emergencyUses > 0 && game.emergencyCooldown <= 0 && distance(player, emergencyButton) <= 58;
}

function canPlayerKill() {
  const player = getPlayer();
  if (!player || player.role !== "imposter" || !player.alive || player.killCooldown > 0 || game.meeting || game.winner) {
    return null;
  }
  return getNearestVictim(player, WORLD.killRange);
}

function canPlayerActSuspicious() {
  const player = getPlayer();
  return Boolean(player && player.role === "jester" && player.alive && !game.meeting && !game.winner && player.chaosCooldown <= 0);
}

function startPlayerTask() {
  const context = canPlayerDoTask();
  const player = getPlayer();
  if (!context || !player) {
    return;
  }
  const duration = context.fake ? 1.2 : 1.55;
  player.tasking = {
    stationId: context.station.id,
    fake: context.fake,
    duration,
    timeLeft: duration,
  };
}

function reportNearestBody() {
  const player = getPlayer();
  const body = canPlayerReport();
  if (!player || !body) {
    return;
  }
  startMeeting(player.id, `You reported ${getCharacter(body.victimId).name}'s body in ${roomById.get(body.roomId).name}.`, body.id);
}

function callEmergency() {
  const player = getPlayer();
  if (!player || !canPlayerEmergency()) {
    return;
  }
  player.emergencyUses -= 1;
  player.meetingsCalled += 1;
  player.suspicion = clamp(player.suspicion + 7, 0, 100);
  startMeeting(player.id, "You called an emergency meeting in Cafeteria.", null);
}

function killNearestVictim() {
  const player = getPlayer();
  const victim = canPlayerKill();
  if (!player || !victim) {
    return;
  }
  executeKill(player, victim);
}

function reviveNearestBody() {
  const player = getPlayer();
  const body = canPlayerRevive();
  if (!player || !body) {
    return;
  }
  reviveBody(player, body);
}

function actSuspicious() {
  const player = getPlayer();
  if (!player || !canPlayerActSuspicious()) {
    return;
  }
  player.suspicion = clamp(player.suspicion + 18, 0, 100);
  player.chaosCooldown = 12;
  logEvent("You loudly contradicted yourself and drew attention to your movements.", true);
  markUIDirty();
}

function renderPanels() {
  game.uiDirty = false;
  const player = getPlayer();

  ui.roleBadge.textContent = player ? ROLE_INFO[player.role].badge : "No Match";
  ui.roleBadge.style.color = roleTint(player?.role);
  ui.objectiveText.textContent = player ? ROLE_INFO[player.role].objective : "Pick a role and start a match.";

  const [ownDone, ownTotal] = player ? taskProgressFor(player) : [0, 0];
  ui.taskCounter.textContent = ownTotal ? `${ownDone} / ${ownTotal}` : "0 / 0";

  const taskItems = [];
  if (!player) {
    taskItems.push("<li>Start a match to receive tasks.</li>");
  } else if (player.role === "imposter") {
    taskItems.push("<li>No real tasks. Hunt carefully and avoid suspicion.</li>");
  } else {
    const list = isCrewTaskRole(player.role) ? player.tasks : player.fakeTasks;
    const doneList = isCrewTaskRole(player.role) ? player.completedTasks : player.completedFakeTasks;
    if (list.length === 0) {
      taskItems.push("<li>No tasks assigned.</li>");
    } else {
      for (const taskId of list) {
        const station = stationById.get(taskId);
        const done = doneList.includes(taskId);
        taskItems.push(
          `<li class="${done ? "done" : ""}">${escapeHtml(station.label)} <small>(${escapeHtml(roomById.get(station.roomId).name)})</small></li>`,
        );
      }
    }
  }
  ui.taskList.innerHTML = taskItems.join("");

  ui.log.innerHTML = game.logs
    .map(
      (entry) =>
        `<div class="log-entry${entry.alert ? " alert" : ""}">${escapeHtml(entry.text)}</div>`,
    )
    .join("");
}

function renderLiveStats() {
  const player = getPlayer();
  const aliveCount = aliveCharacters().length;
  const room = player ? findRoomAt(player.x, player.y) : null;
  const taskTotals = getCrewTaskTotals();
  const crewPercent = taskTotals.total > 0 ? Math.round((taskTotals.completed / taskTotals.total) * 100) : 0;

  ui.aliveCount.textContent = `${aliveCount} alive`;
  ui.roleValue.textContent = player ? formatRole(player.role) : "None";
  ui.roomValue.textContent = room?.name ?? "Dock";
  ui.taskValue.textContent = `${crewPercent}%`;
  ui.heatValue.textContent = player ? String(Math.round(player.suspicion)) : "0";
  ui.meetingValue.textContent = String(game.meetingCount);
  if (!player) {
    ui.cooldownValue.textContent = "n/a";
  } else if (player.role === "imposter") {
    ui.cooldownValue.textContent = "Instant";
  } else if (game.emergencyCooldown > 0 && player.emergencyUses > 0) {
    ui.cooldownValue.textContent = formatSeconds(game.emergencyCooldown);
  } else if (player.role === "reviver") {
    ui.cooldownValue.textContent = canPlayerRevive() ? "Ready" : "Seek Body";
  } else if (player.role === "jester") {
    ui.cooldownValue.textContent = canPlayerActSuspicious() ? "Chaos Ready" : "Waiting";
  } else {
    ui.cooldownValue.textContent = "n/a";
  }

  const progress = player?.tasking
    ? 1 - player.tasking.timeLeft / player.tasking.duration
    : taskTotals.total > 0
      ? taskTotals.completed / taskTotals.total
      : 0;
  ui.progressFill.style.width = `${Math.round(progress * 100)}%`;
  ui.hintText.textContent = buildHint(player, room);
}

function buildHint(player, room) {
  if (game.winner) {
    return game.winner.reason;
  }
  if (!player || !game.running) {
    return "Start a match to enter the ship.";
  }
  if (game.meeting) {
    return "A meeting is in progress. Vote or wait for the result.";
  }
  if (!player.alive) {
    return "You are out. The rest of the round will play out without you.";
  }
  if (player.tasking) {
    const station = stationById.get(player.tasking.stationId);
    return `${player.tasking.fake ? "Faking" : "Completing"} ${station.label} in ${roomById.get(station.roomId).name}.`;
  }

  const revive = canPlayerRevive();
  if (revive) {
    return `Press G to revive ${getCharacter(revive.victimId).name}.`;
  }

  const body = canPlayerReport();
  if (body) {
    return `Press R to report ${getCharacter(body.victimId).name}'s body.`;
  }

  const task = canPlayerDoTask();
  if (task) {
    return `Press F to ${task.fake ? "fake" : "complete"} ${task.station.label}.`;
  }

  const target = canPlayerKill();
  if (target) {
    return `Press E to eliminate ${target.name}.`;
  }

  if (canPlayerEmergency()) {
    return "Press Q to call an emergency meeting.";
  }

  if (player.emergencyUses > 0 && game.emergencyCooldown > 0 && distance(player, emergencyButton) <= 58) {
    return `Emergency button cooling down for ${formatSeconds(game.emergencyCooldown)}.`;
  }

  if (canPlayerActSuspicious()) {
    return "Press T to look suspicious and bait a vote.";
  }

  if (player.role === "crewmate") {
    return `Move to your next task. Current room: ${room?.name ?? "Unknown"}.`;
  }
  if (player.role === "reviver") {
    return "Stay near the crew. If a body appears, get there before somebody reports it.";
  }
  if (player.role === "imposter") {
    return "Blend in, isolate killable targets, and avoid getting voted out.";
  }
  return "You cannot be killed, so your win condition is getting voted out.";
}

function syncButtons() {
  const player = getPlayer();
  const task = canPlayerDoTask();
  const body = canPlayerReport();
  const emergency = canPlayerEmergency();
  const victim = canPlayerKill();
  const revive = canPlayerRevive();
  const sus = canPlayerActSuspicious();

  ui.taskBtn.disabled = !task;
  ui.reportBtn.disabled = !body;
  ui.emergencyBtn.disabled = !emergency;
  ui.killBtn.disabled = !victim;
  ui.reviveBtn.disabled = !revive;
  ui.susBtn.disabled = !sus;

  ui.taskBtn.textContent = player?.role === "jester" ? "Fake Task" : "Do Task";
  ui.killBtn.textContent = "Kill";
  ui.reviveBtn.textContent = "Revive";
}

function renderMeeting() {
  if (!game.meeting) {
    hideMeeting();
    return;
  }

  const caller = getCharacter(game.meeting.callerId);
  ui.meetingOverlay.classList.remove("hidden");
  ui.meetingTitle.textContent = caller ? `${caller.name} Called a Meeting` : "Meeting Called";
  ui.meetingReason.textContent = game.meeting.reason;

  if (game.meeting.phase === "vote") {
    const player = getPlayer();
    const canVote = player?.alive;
    const candidates = aliveCharacters();
    ui.meetingSummary.textContent = canVote
      ? "Pick who should be ejected, or skip the vote."
      : "You are spectating. The AI crew is deciding the vote.";
    ui.meetingCandidates.innerHTML = candidates
      .map(
        (candidate) => `
          <button class="candidate-card" data-vote="${escapeHtml(candidate.id)}" ${canVote ? "" : "disabled"}>
            <strong>${escapeHtml(candidate.name)}</strong>
            <small>Public heat: ${Math.round(candidate.suspicion)}</small>
          </button>
        `,
      )
      .join("");
    ui.skipVoteBtn.classList.toggle("hidden", !canVote);
    ui.skipVoteBtn.disabled = !canVote;
    ui.continueBtn.classList.add("hidden");
    ui.continueBtn.disabled = true;
    ui.meetingCandidates.querySelectorAll("[data-vote]").forEach((button) => {
      button.addEventListener("click", () => resolveMeeting(button.dataset.vote));
    });
    return;
  }

  const result = game.meeting.result;
  const voteLines = result.votes
    .map((vote) => {
      const voter = getCharacter(vote.voterId);
      const target = vote.targetId ? getCharacter(vote.targetId) : null;
      return `<div class="role-item"><strong>${escapeHtml(voter.name)}</strong><small>${target ? `Voted ${escapeHtml(target.name)}` : "Skipped"}</small></div>`;
    })
    .join("");

  ui.meetingCandidates.innerHTML = voteLines;
  ui.meetingSummary.textContent = result.resolutionText;
  ui.skipVoteBtn.classList.add("hidden");
  ui.skipVoteBtn.disabled = true;
  ui.continueBtn.classList.remove("hidden");
  ui.continueBtn.disabled = false;
}

function hideMeeting() {
  ui.meetingOverlay.classList.add("hidden");
  ui.meetingSummary.textContent = "";
  ui.meetingCandidates.innerHTML = "";
  ui.continueBtn.classList.add("hidden");
  ui.skipVoteBtn.classList.remove("hidden");
}

function showWinner(team, reason) {
  const labels = {
    crew: "Crew Wins",
    imposter: "Imposter Wins",
    jester: "Jester Wins",
  };

  ui.endTitle.textContent = labels[team] || "Round Over";
  ui.endReason.textContent = reason;
  ui.roleReveal.innerHTML = game.characters
    .map(
      (character) => `
        <div class="role-item">
          <strong>${escapeHtml(character.name)}</strong>
          <small>${escapeHtml(formatRole(character.role))} • ${character.alive ? "Survived" : character.ejected ? "Ejected" : "Killed"}</small>
        </div>
      `,
    )
    .join("");
  ui.endOverlay.classList.remove("hidden");
}

function hideWinner() {
  ui.endOverlay.classList.add("hidden");
  ui.roleReveal.innerHTML = "";
}

function roundedRectPath(x, y, width, height, radius) {
  const safe = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + safe, y);
  ctx.lineTo(x + width - safe, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + safe);
  ctx.lineTo(x + width, y + height - safe);
  ctx.quadraticCurveTo(x + width, y + height, x + width - safe, y + height);
  ctx.lineTo(x + safe, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - safe);
  ctx.lineTo(x, y + safe);
  ctx.quadraticCurveTo(x, y, x + safe, y);
}

function draw() {
  ctx.clearRect(0, 0, WORLD.width, WORLD.height);

  const bg = ctx.createLinearGradient(0, 0, 0, WORLD.height);
  bg.addColorStop(0, "#07121d");
  bg.addColorStop(1, "#0b1e30");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);

  for (const star of stars) {
    ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
    ctx.fill();
  }

  drawHallways();
  drawRooms();
  drawStations();
  drawEmergencyButton();
  drawBodies();
  drawCharacters();

  if (game.meeting) {
    ctx.fillStyle = "rgba(255, 226, 124, 0.14)";
    ctx.fillRect(0, 0, WORLD.width, WORLD.height);
  }
}

function drawHallways() {
  ctx.lineWidth = WORLD.hallwayHalfWidth * 1.55;
  ctx.strokeStyle = "rgba(81, 128, 185, 0.24)";
  ctx.lineCap = "round";
  for (const [fromId, toId] of hallwayLines) {
    const from = roomById.get(fromId);
    const to = roomById.get(toId);
    ctx.beginPath();
    ctx.moveTo(from.cx, from.cy);
    ctx.lineTo(to.cx, to.cy);
    ctx.stroke();
  }
}

function drawRooms() {
  for (const room of rooms) {
    roundedRectPath(room.x, room.y, room.w, room.h, 24);
    ctx.fillStyle = room.color;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(155, 207, 255, 0.18)";
    ctx.stroke();

    ctx.fillStyle = "rgba(238, 245, 255, 0.84)";
    ctx.font = "700 18px Rockwell, Georgia, serif";
    ctx.fillText(room.name, room.x + 18, room.y + 28);
  }
}

function drawStations() {
  const player = getPlayer();
  const activeTaskId = player ? nextTaskId(player) : null;

  for (const station of stations) {
    const active = activeTaskId === station.id && player?.alive && player.role !== "imposter";
    const pulse = 0.5 + 0.5 * Math.sin(performance.now() / 210);
    ctx.fillStyle = active ? `rgba(149, 240, 197, ${0.55 + pulse * 0.2})` : "rgba(121, 178, 255, 0.45)";
    ctx.beginPath();
    ctx.arc(station.x, station.y, active ? 12 + pulse * 3 : 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = active ? "rgba(149, 240, 197, 0.95)" : "rgba(190, 225, 255, 0.38)";
    ctx.stroke();
  }
}

function drawEmergencyButton() {
  ctx.beginPath();
  ctx.arc(emergencyButton.x, emergencyButton.y, emergencyButton.radius, 0, Math.PI * 2);
  ctx.fillStyle = game.emergencyCooldown > 0 ? "rgba(138, 151, 173, 0.8)" : "rgba(255, 99, 99, 0.92)";
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(255, 241, 241, 0.75)";
  ctx.stroke();
  ctx.fillStyle = "#fff4f4";
  ctx.font = "700 12px Trebuchet MS";
  ctx.textAlign = "center";
  ctx.fillText("MEET", emergencyButton.x, emergencyButton.y + 4);
  ctx.textAlign = "left";
}

function drawBodies() {
  for (const body of game.bodies) {
    if (body.reported) {
      continue;
    }
    const victim = getCharacter(body.victimId);
    ctx.fillStyle = victim?.color || "#cfd8ea";
    ctx.beginPath();
    ctx.ellipse(body.x, body.y + 3, 18, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#e9f3ff";
    ctx.fillRect(body.x + 7, body.y - 2, 16, 4);
    ctx.fillStyle = "#07141f";
    ctx.font = "12px Trebuchet MS";
    ctx.fillText(victim?.name || "Body", body.x - 18, body.y - 14);
  }
}

function drawCharacters() {
  const sorted = [...aliveCharacters()].sort((left, right) => left.y - right.y);
  for (const character of sorted) {
    drawCharacter(character);
  }
}

function drawCharacter(character) {
  ctx.save();
  ctx.translate(character.x, character.y);

  if (character.isPlayer) {
    ctx.strokeStyle = "rgba(255, 239, 169, 0.95)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 24, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
  ctx.beginPath();
  ctx.ellipse(0, 18, 18, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = character.color;
  ctx.beginPath();
  ctx.moveTo(-14, 18);
  ctx.lineTo(-14, -6);
  ctx.quadraticCurveTo(-14, -22, 0, -22);
  ctx.quadraticCurveTo(16, -22, 16, -4);
  ctx.lineTo(16, 18);
  ctx.lineTo(7, 18);
  ctx.lineTo(7, 4);
  ctx.lineTo(-3, 4);
  ctx.lineTo(-3, 18);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#daf5ff";
  ctx.beginPath();
  ctx.ellipse(4, -9, 11, 8, -0.25, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
  ctx.fillRect(-8, -18, 8, 14);
  ctx.restore();

  ctx.fillStyle = character.isPlayer ? "#fff4b2" : "#eaf4ff";
  ctx.font = "700 12px Trebuchet MS";
  ctx.textAlign = "center";
  ctx.fillText(character.name, character.x, character.y - 30);
  ctx.textAlign = "left";
}

function handleKeyDown(event) {
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement) {
    return;
  }

  const handled = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "KeyA", "KeyD", "KeyW", "KeyS", "KeyF", "KeyR", "KeyQ", "KeyE", "KeyG", "KeyT"];
  if (handled.includes(event.code)) {
    event.preventDefault();
  }

  if (event.code === "KeyA" || event.code === "ArrowLeft") {
    pressed.add("left");
  } else if (event.code === "KeyD" || event.code === "ArrowRight") {
    pressed.add("right");
  } else if (event.code === "KeyW" || event.code === "ArrowUp") {
    pressed.add("up");
  } else if (event.code === "KeyS" || event.code === "ArrowDown") {
    pressed.add("down");
  } else if (!event.repeat && event.code === "KeyF") {
    startPlayerTask();
  } else if (!event.repeat && event.code === "KeyR") {
    reportNearestBody();
  } else if (!event.repeat && event.code === "KeyQ") {
    callEmergency();
  } else if (!event.repeat && event.code === "KeyE") {
    killNearestVictim();
  } else if (!event.repeat && event.code === "KeyG") {
    reviveNearestBody();
  } else if (!event.repeat && event.code === "KeyT") {
    actSuspicious();
  }
}

function handleKeyUp(event) {
  if (event.code === "KeyA" || event.code === "ArrowLeft") {
    pressed.delete("left");
  } else if (event.code === "KeyD" || event.code === "ArrowRight") {
    pressed.delete("right");
  } else if (event.code === "KeyW" || event.code === "ArrowUp") {
    pressed.delete("up");
  } else if (event.code === "KeyS" || event.code === "ArrowDown") {
    pressed.delete("down");
  }
}

ui.startBtn.addEventListener("click", createMatch);
ui.restartBtn.addEventListener("click", createMatch);
ui.playAgainBtn.addEventListener("click", createMatch);
ui.taskBtn.addEventListener("click", startPlayerTask);
ui.reportBtn.addEventListener("click", reportNearestBody);
ui.emergencyBtn.addEventListener("click", callEmergency);
ui.killBtn.addEventListener("click", killNearestVictim);
ui.reviveBtn.addEventListener("click", reviveNearestBody);
ui.susBtn.addEventListener("click", actSuspicious);
ui.skipVoteBtn.addEventListener("click", () => resolveMeeting(null));
ui.continueBtn.addEventListener("click", finishMeeting);
window.addEventListener("keydown", handleKeyDown);
window.addEventListener("keyup", handleKeyUp);

renderPanels();
renderLiveStats();
syncButtons();
draw();
