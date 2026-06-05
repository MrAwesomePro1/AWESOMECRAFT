const groupInfo = {
  rust: { label: "Rust", color: "#8f5a3c", upgradeCost: 50, rent: [2, 12, 36, 100, 260] },
  aqua: { label: "Aqua", color: "#1499a3", upgradeCost: 50, rent: [6, 32, 95, 280, 560] },
  orchid: { label: "Orchid", color: "#b24b8f", upgradeCost: 100, rent: [10, 52, 160, 470, 780] },
  ember: { label: "Ember", color: "#d56b2a", upgradeCost: 100, rent: [14, 72, 210, 590, 980] },
  ruby: { label: "Ruby", color: "#c43e42", upgradeCost: 150, rent: [18, 92, 270, 730, 1120] },
  amber: { label: "Amber", color: "#d6a527", upgradeCost: 150, rent: [22, 112, 340, 860, 1240] },
  garden: { label: "Garden", color: "#3e884f", upgradeCost: 200, rent: [26, 132, 410, 980, 1380] },
  crown: { label: "Crown", color: "#3b66a7", upgradeCost: 200, rent: [35, 180, 520, 1180, 1600] }
};

const boardTemplate = [
  { type: "start", name: "Payday Plaza" },
  { type: "property", name: "Crumb Alley", group: "rust", cost: 60 },
  { type: "draw", name: "Side Hustle", deck: "hustle" },
  { type: "property", name: "Button Factory", group: "rust", cost: 60 },
  { type: "tax", name: "Sidewalk Permit", amount: 100 },
  { type: "transit", name: "Loop Limo Stop", cost: 200 },
  { type: "property", name: "Pickle Pier", group: "aqua", cost: 100 },
  { type: "draw", name: "Street Spark", deck: "spark" },
  { type: "property", name: "Pixel Arcade", group: "aqua", cost: 100 },
  { type: "property", name: "Moon Donut Diner", group: "aqua", cost: 120 },
  { type: "audit", name: "Audit Lobby" },
  { type: "property", name: "Bubblegum Blvd", group: "orchid", cost: 140 },
  { type: "utility", name: "Coin Laundry", cost: 150 },
  { type: "property", name: "Velvet Vet Clinic", group: "orchid", cost: 140 },
  { type: "property", name: "Laser Mall", group: "orchid", cost: 160 },
  { type: "transit", name: "Sky Bus Depot", cost: 200 },
  { type: "property", name: "Taco Tower", group: "ember", cost: 180 },
  { type: "draw", name: "Side Hustle", deck: "hustle" },
  { type: "property", name: "Battery Parklet", group: "ember", cost: 180 },
  { type: "property", name: "Skateboard Square", group: "ember", cost: 200 },
  { type: "free", name: "Civic Fountain" },
  { type: "property", name: "Dragon Theater", group: "ruby", cost: 220 },
  { type: "draw", name: "Street Spark", deck: "spark" },
  { type: "property", name: "Rocket Records", group: "ruby", cost: 220 },
  { type: "property", name: "Neon Noodle Row", group: "ruby", cost: 240 },
  { type: "transit", name: "Crosstown Rocket", cost: 200 },
  { type: "property", name: "Solar Salon", group: "amber", cost: 260 },
  { type: "property", name: "Crystal Court", group: "amber", cost: 260 },
  { type: "utility", name: "Water Widget Works", cost: 150 },
  { type: "property", name: "Comet Kitchen", group: "amber", cost: 280 },
  { type: "goToAudit", name: "Audit Van" },
  { type: "property", name: "Jade Jetty", group: "garden", cost: 300 },
  { type: "property", name: "Prism Plaza", group: "garden", cost: 300 },
  { type: "draw", name: "Side Hustle", deck: "hustle" },
  { type: "property", name: "Emerald Emporium", group: "garden", cost: 320 },
  { type: "transit", name: "Night Rail Terminal", cost: 200 },
  { type: "draw", name: "Street Spark", deck: "spark" },
  { type: "property", name: "Crown Canal", group: "crown", cost: 350 },
  { type: "tax", name: "Mansion Tax", amount: 125 },
  { type: "property", name: "Vault View Avenue", group: "crown", cost: 400 }
];

const playerColors = ["#cf3f3f", "#167c80", "#7353a3", "#377a44"];
const defaultNames = ["Maven", "Cash", "Nova", "Ledger"];
const upgradeNames = ["Lot", "Shop", "Suite", "Tower", "Mansion"];
const startingCash = 1500;
const payday = 200;
const loanAmount = 300;
const loanRepay = 350;
const maxLoans = 3;

const iconPaths = {
  start: '<path d="M4 16h16"></path><path d="M6 16V8l6-4 6 4v8"></path><path d="M10 16v-4h4v4"></path>',
  property: '<path d="M4 11 12 4l8 7"></path><path d="M6 10v10h12V10"></path><path d="M10 20v-5h4v5"></path>',
  draw: '<rect x="6" y="4" width="12" height="16" rx="2"></rect><path d="M9 8h6M9 12h4"></path>',
  tax: '<rect x="5" y="4" width="14" height="16" rx="2"></rect><path d="M8 9h8M8 13h8M8 17h5"></path>',
  transit: '<path d="M7 5h10a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3Z"></path><path d="M7 17 5 20M17 17l2 3M8 9h8M8 13h8"></path>',
  utility: '<path d="m13 2-8 12h6l-1 8 9-13h-6z"></path>',
  audit: '<path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6z"></path><path d="M9 12h6"></path>',
  goToAudit: '<path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6z"></path><path d="M12 8v5"></path><path d="M12 17h.01"></path>',
  free: '<path d="M4 18h16"></path><path d="M7 18V9l5-4 5 4v9"></path><path d="M9 13h6"></path>'
};

const elements = {
  board: document.getElementById("board"),
  status: document.getElementById("gameStatus"),
  dice: document.getElementById("diceReadout"),
  turnBadge: document.getElementById("turnBadge"),
  rollBtn: document.getElementById("rollBtn"),
  buyBtn: document.getElementById("buyBtn"),
  upgradeBtn: document.getElementById("upgradeBtn"),
  loanBtn: document.getElementById("loanBtn"),
  repayBtn: document.getElementById("repayBtn"),
  endBtn: document.getElementById("endBtn"),
  resetBtn: document.getElementById("resetBtn"),
  startBtn: document.getElementById("startBtn"),
  playerCount: document.getElementById("playerCount"),
  nameFields: document.getElementById("nameFields"),
  playersList: document.getElementById("playersList"),
  deedsList: document.getElementById("deedsList"),
  logList: document.getElementById("logList"),
  modal: document.getElementById("cardModal"),
  cardType: document.getElementById("cardType"),
  cardTitle: document.getElementById("cardTitle"),
  cardText: document.getElementById("cardText"),
  cardOkBtn: document.getElementById("cardOkBtn")
};

let state = createEmptyState();

function createEmptyState() {
  return {
    board: createBoard(),
    players: [],
    current: 0,
    phase: "setup",
    dice: [0, 0],
    doubles: 0,
    log: ["Set the table and start."],
    decks: createDecks()
  };
}

function createBoard() {
  return boardTemplate.map((space) => ({
    ...space,
    owner: null,
    level: 0
  }));
}

function createDecks() {
  return {
    hustle: shuffle([
      {
        title: "Pop-Up Payday",
        text: "Your weekend stand sells out. Collect $120.",
        action: () => changeCash(currentPlayer(), 120)
      },
      {
        title: "Renovation Surprise",
        text: "A contractor finds three extra problems. Pay $80.",
        action: () => charge(currentPlayer(), 80, "renovation surprise")
      },
      {
        title: "Fast Lane Favor",
        text: "Move to the nearest transit stop.",
        action: () => moveToNearest("transit")
      },
      {
        title: "Street Festival",
        text: "Every rival visits your booth. Collect $40 from each player.",
        action: () => collectFromEveryRival(40)
      },
      {
        title: "Permit Mix-Up",
        text: "The Audit Van notices you. Go to the Audit Lobby.",
        action: () => sendToAudit(currentPlayer())
      },
      {
        title: "Tiny Windfall",
        text: "An old envelope had cash inside. Collect $75.",
        action: () => changeCash(currentPlayer(), 75)
      },
      {
        title: "Move to Payday Plaza",
        text: "Advance to Payday Plaza and collect $200.",
        action: () => moveTo(0, true)
      },
      {
        title: "Mansion Appraisal",
        text: "Collect $90 for each mansion you own.",
        action: () => {
          const count = state.board.filter((space) => space.owner === state.current && space.level === 4).length;
          changeCash(currentPlayer(), count * 90);
          if (count === 0) addLog(`${currentPlayer().name} has no mansions to appraise.`);
        }
      }
    ]),
    spark: shuffle([
      {
        title: "Foundation Crack",
        text: "Pay $25 per upgrade and $100 per mansion.",
        action: () => {
          const player = currentPlayer();
          const total = state.board
            .filter((space) => space.owner === state.current)
            .reduce((sum, space) => sum + (space.level === 4 ? 100 : space.level * 25), 0);
          charge(player, total, "foundation repairs");
        }
      },
      {
        title: "Bank Error",
        text: "The bank misfiles in your favor. Collect $150.",
        action: () => changeCash(currentPlayer(), 150)
      },
      {
        title: "Rent Rebate",
        text: "Collect $50 from the bank.",
        action: () => changeCash(currentPlayer(), 50)
      },
      {
        title: "Advance to Crown Canal",
        text: "Move to Crown Canal. Buy it or pay rent.",
        action: () => moveTo(37, true)
      },
      {
        title: "Auntie's Ledger",
        text: "Pay every rival $25.",
        action: () => payEveryRival(25)
      },
      {
        title: "Upgrade Coupon",
        text: "Collect $100 toward your next build.",
        action: () => changeCash(currentPlayer(), 100)
      },
      {
        title: "Laundry Leak",
        text: "Move to the nearest utility.",
        action: () => moveToNearest("utility")
      },
      {
        title: "Luxury Inspection",
        text: "Pay $60 for each mansion.",
        action: () => {
          const mansions = state.board.filter((space) => space.owner === state.current && space.level === 4).length;
          charge(currentPlayer(), mansions * 60, "luxury inspection");
        }
      }
    ])
  };
}

function setupNameFields() {
  const count = Number(elements.playerCount.value);
  elements.nameFields.innerHTML = "";
  for (let i = 0; i < count; i += 1) {
    const label = document.createElement("label");
    label.className = "field";
    label.innerHTML = `<span>Player ${i + 1}</span>`;
    const input = document.createElement("input");
    input.type = "text";
    input.maxLength = 16;
    input.value = defaultNames[i];
    input.dataset.playerName = String(i);
    label.appendChild(input);
    elements.nameFields.appendChild(label);
  }
}

function startGame() {
  const inputs = [...elements.nameFields.querySelectorAll("input")];
  const players = inputs.map((input, index) => ({
    name: input.value.trim() || defaultNames[index],
    cash: startingCash,
    position: 0,
    color: playerColors[index],
    loans: 0,
    inAudit: false,
    missedTurns: 0,
    bankrupt: false
  }));

  state = {
    board: createBoard(),
    players,
    current: 0,
    phase: "roll",
    dice: [0, 0],
    doubles: 0,
    log: [`${players[0].name} opens Bank Rupt Street.`],
    decks: createDecks()
  };
  elements.modal.hidden = true;
  render();
}

function rollDice() {
  const player = currentPlayer();
  if (!player || state.phase !== "roll") return;

  if (player.inAudit) {
    if (player.cash >= 50) {
      charge(player, 50, "audit exit fee", false);
      player.inAudit = false;
      addLog(`${player.name} pays $50 to leave the Audit Lobby.`);
    } else {
      addLog(`${player.name} needs cash to leave the Audit Lobby.`);
      state.phase = "debt";
      render();
      return;
    }
  }

  const dice = [randomDie(), randomDie()];
  state.dice = dice;
  const total = dice[0] + dice[1];
  moveBy(total);
  addLog(`${player.name} rolls ${dice[0]} + ${dice[1]} and lands on ${state.board[player.position].name}.`);
  resolveLanding();
  if (player.cash < 0) handleDebt(player);
  if (state.phase !== "debt" && state.phase !== "gameover") state.phase = "landed";
  render();
}

function randomDie() {
  return Math.floor(Math.random() * 6) + 1;
}

function moveBy(steps) {
  const player = currentPlayer();
  const oldPosition = player.position;
  player.position = (player.position + steps) % state.board.length;
  if (player.position < oldPosition) collectPayday(player);
}

function moveTo(index, collectIfPassed) {
  const player = currentPlayer();
  const oldPosition = player.position;
  player.position = index;
  if (collectIfPassed && index <= oldPosition) collectPayday(player);
  addLog(`${player.name} moves to ${state.board[index].name}.`);
  resolveLanding();
}

function moveToNearest(type) {
  const player = currentPlayer();
  let index = player.position;
  do {
    index = (index + 1) % state.board.length;
    if (index === 0) collectPayday(player);
  } while (state.board[index].type !== type);
  player.position = index;
  addLog(`${player.name} heads to ${state.board[index].name}.`);
  resolveLanding();
}

function collectPayday(player) {
  changeCash(player, payday);
  if (player.loans > 0) {
    const interest = player.loans * 30;
    charge(player, interest, "loan interest", false);
  }
  addLog(`${player.name} collects $${payday} at Payday Plaza.`);
}

function resolveLanding() {
  const player = currentPlayer();
  const space = state.board[player.position];

  if (space.type === "start" || space.type === "free" || space.type === "audit") return;

  if (space.type === "tax") {
    charge(player, space.amount, space.name.toLowerCase());
    return;
  }

  if (space.type === "goToAudit") {
    sendToAudit(player);
    return;
  }

  if (space.type === "draw") {
    drawCard(space.deck, space.name);
    return;
  }

  if (isBuyable(space)) {
    if (space.owner === null) {
      addLog(`${space.name} is open for $${space.cost}.`);
      return;
    }
    if (space.owner !== state.current) payRent(space);
  }
}

function isBuyable(space) {
  return space.type === "property" || space.type === "utility" || space.type === "transit";
}

function buyCurrentSpace() {
  const player = currentPlayer();
  const space = state.board[player.position];
  if (!canBuy(space, player)) return;
  charge(player, space.cost, `buying ${space.name}`, false);
  space.owner = state.current;
  addLog(`${player.name} buys ${space.name} for $${space.cost}.`);
  if (player.cash < 0) handleDebt(player);
  render();
}

function canBuy(space, player) {
  return Boolean(player && isBuyable(space) && space.owner === null && player.cash >= space.cost && state.phase !== "setup");
}

function upgradeCurrentSpace() {
  const player = currentPlayer();
  const space = state.board[player.position];
  if (!canUpgrade(space, player)) return;
  buildOn(space);
}

function buildOn(space) {
  const player = currentPlayer();
  const info = groupInfo[space.group];
  charge(player, info.upgradeCost, `building on ${space.name}`, false);
  space.level += 1;
  addLog(`${player.name} upgrades ${space.name} to ${upgradeNames[space.level]}.`);
  if (player.cash < 0) handleDebt(player);
  render();
}

function canUpgrade(space, player) {
  if (!player || !space || space.type !== "property") return false;
  if (space.owner !== state.current || space.level >= 4) return false;
  const info = groupInfo[space.group];
  return ownsFullGroup(space.group, state.current) && player.cash >= info.upgradeCost && state.phase !== "setup";
}

function ownsFullGroup(group, ownerIndex) {
  const groupSpaces = state.board.filter((space) => space.type === "property" && space.group === group);
  return groupSpaces.every((space) => space.owner === ownerIndex);
}

function payRent(space) {
  const player = currentPlayer();
  const owner = state.players[space.owner];
  let rent = 0;

  if (space.type === "property") {
    rent = groupInfo[space.group].rent[space.level];
    if (space.level === 0 && ownsFullGroup(space.group, space.owner)) rent *= 2;
  } else if (space.type === "transit") {
    const count = state.board.filter((item) => item.type === "transit" && item.owner === space.owner).length;
    rent = 25 * 2 ** (count - 1);
  } else if (space.type === "utility") {
    const count = state.board.filter((item) => item.type === "utility" && item.owner === space.owner).length;
    rent = (state.dice[0] + state.dice[1]) * (count === 2 ? 10 : 4);
  }

  player.cash -= rent;
  owner.cash += rent;
  addLog(`${player.name} pays ${owner.name} $${rent} rent for ${space.name}.`);
}

function drawCard(deckName, label) {
  const deck = state.decks[deckName];
  const card = deck.shift();
  deck.push(card);
  elements.cardType.textContent = label;
  elements.cardTitle.textContent = card.title;
  elements.cardText.textContent = card.text;
  elements.modal.hidden = false;
  card.action();
}

function sendToAudit(player) {
  player.position = 10;
  player.inAudit = true;
  addLog(`${player.name} is sent to the Audit Lobby.`);
}

function takeLoan() {
  const player = currentPlayer();
  if (!player || player.loans >= maxLoans || state.phase === "setup" || state.phase === "gameover") return;
  player.cash += loanAmount;
  player.loans += 1;
  addLog(`${player.name} takes a $${loanAmount} street loan.`);
  if (player.cash >= 0 && state.phase === "debt") state.phase = "landed";
  render();
}

function repayLoan() {
  const player = currentPlayer();
  if (!player || player.loans <= 0 || player.cash < loanRepay || state.phase === "setup" || state.phase === "gameover") return;
  player.cash -= loanRepay;
  player.loans -= 1;
  addLog(`${player.name} repays a street loan for $${loanRepay}.`);
  render();
}

function charge(player, amount, reason, canBankrupt = true) {
  if (amount <= 0) return;
  player.cash -= amount;
  addLog(`${player.name} pays $${amount} for ${reason}.`);
  if (canBankrupt && player.cash < 0) handleDebt(player);
}

function changeCash(player, amount) {
  player.cash += amount;
  addLog(`${player.name} collects $${amount}.`);
}

function collectFromEveryRival(amount) {
  const player = currentPlayer();
  activePlayers().forEach((rival) => {
    if (rival === player) return;
    rival.cash -= amount;
    player.cash += amount;
    if (rival.cash < 0) handleDebt(rival);
  });
}

function payEveryRival(amount) {
  const player = currentPlayer();
  activePlayers().forEach((rival) => {
    if (rival === player) return;
    player.cash -= amount;
    rival.cash += amount;
  });
  if (player.cash < 0) handleDebt(player);
}

function handleDebt(player) {
  if (player.bankrupt) return;
  if (state.players.indexOf(player) !== state.current) {
    while (player.cash < 0 && player.loans < maxLoans) {
      player.cash += loanAmount;
      player.loans += 1;
      addLog(`${player.name} takes an emergency $${loanAmount} street loan.`);
    }
    if (player.cash < 0) bankruptPlayer(player);
    return;
  }
  if (player.loans < maxLoans) {
    state.phase = "debt";
    addLog(`${player.name} is below zero and needs a loan before ending the turn.`);
    return;
  }
  bankruptPlayer(player);
}

function bankruptPlayer(player) {
  const index = state.players.indexOf(player);
  player.bankrupt = true;
  player.cash = 0;
  player.inAudit = false;
  state.board.forEach((space) => {
    if (space.owner === index) {
      space.owner = null;
      space.level = 0;
    }
  });
  addLog(`${player.name} is bank rupt. Their deeds return to the street.`);
  const remaining = activePlayers();
  if (remaining.length <= 1) {
    state.phase = "gameover";
    addLog(`${remaining[0]?.name || "Nobody"} wins Bank Rupt Street.`);
  }
}

function endTurn() {
  const player = currentPlayer();
  if (!player || state.phase === "setup" || state.phase === "gameover") return;
  if (player.cash < 0) {
    handleDebt(player);
    render();
    return;
  }
  state.current = nextActiveIndex(state.current);
  state.phase = "roll";
  addLog(`${currentPlayer().name} takes the dice.`);
  render();
}

function nextActiveIndex(fromIndex) {
  let index = fromIndex;
  do {
    index = (index + 1) % state.players.length;
  } while (state.players[index].bankrupt);
  return index;
}

function currentPlayer() {
  return state.players[state.current];
}

function activePlayers() {
  return state.players.filter((player) => !player.bankrupt);
}

function addLog(message) {
  state.log.unshift(message);
  state.log = state.log.slice(0, 16);
}

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function render() {
  renderBoard();
  renderPlayers();
  renderDeeds();
  renderLog();
  renderTurnState();
  renderButtons();
}

function renderBoard() {
  elements.board.querySelectorAll(".space").forEach((space) => space.remove());
  state.board.forEach((space, index) => {
    const tile = document.createElement("div");
    const position = boardPosition(index);
    const playersHere = state.players.filter((player) => !player.bankrupt && player.position === index);
    const owner = space.owner !== null ? state.players[space.owner] : null;
    const group = space.group ? groupInfo[space.group] : null;
    tile.className = `space ${spaceClass(space, index)}`;
    tile.style.gridColumn = String(position.column);
    tile.style.gridRow = String(position.row);
    tile.innerHTML = [
      group ? `<div class="color-strip" style="background:${group.color}"></div>` : "",
      `<div class="space-main">
        <span class="space-icon" aria-hidden="true">${spaceIcon(space.type)}</span>
        <span class="space-name">${escapeHtml(space.name)}</span>
        <span class="space-price">${spacePrice(space)}</span>
      </div>`,
      renderUpgradeTrack(space),
      owner ? `<span class="owner-pin" style="background:${owner.color}" title="${escapeHtml(owner.name)} owns this"></span>` : "",
      `<div class="token-stack">${playersHere.map(renderToken).join("")}</div>`
    ].join("");
    elements.board.appendChild(tile);
  });
}

function boardPosition(index) {
  if (index <= 10) return { row: 11, column: 11 - index };
  if (index <= 20) return { row: 21 - index, column: 1 };
  if (index <= 30) return { row: 1, column: index - 19 };
  return { row: index - 29, column: 11 };
}

function spaceClass(space, index) {
  const classes = [];
  if ([0, 10, 20, 30].includes(index)) classes.push("corner");
  classes.push(space.type);
  return classes.join(" ");
}

function spaceIcon(type) {
  return `<svg viewBox="0 0 24 24">${iconPaths[type] || iconPaths.property}</svg>`;
}

function spacePrice(space) {
  if (space.type === "property" || space.type === "utility" || space.type === "transit") {
    return space.owner === null ? `$${space.cost}` : upgradeNames[space.level] || "Owned";
  }
  if (space.type === "tax") return `$${space.amount}`;
  return "";
}

function renderUpgradeTrack(space) {
  if (space.type !== "property") return '<div class="upgrade-track"></div>';
  const dots = [1, 2, 3, 4]
    .map((level) => {
      const classes = ["upgrade-dot"];
      if (space.level >= level) classes.push("active");
      if (level === 4 && space.level >= 4) classes.push("mansion");
      return `<span class="${classes.join(" ")}"></span>`;
    })
    .join("");
  return `<div class="upgrade-track" title="${upgradeNames[space.level]}">${dots}</div>`;
}

function renderToken(player) {
  return `<span class="token" style="background:${player.color}" title="${escapeHtml(player.name)}">${escapeHtml(
    initials(player.name)
  )}</span>`;
}

function renderPlayers() {
  if (state.players.length === 0) {
    elements.playersList.innerHTML = '<div class="empty-state">No players yet.</div>';
    return;
  }
  elements.playersList.innerHTML = state.players
    .map((player, index) => {
      const classes = ["player-row"];
      if (index === state.current && state.phase !== "gameover") classes.push("current");
      if (player.bankrupt) classes.push("bankrupt");
      return `<div class="${classes.join(" ")}">
        ${renderToken(player)}
        <div>
          <div class="player-name">${escapeHtml(player.name)}</div>
          <div class="player-meta">${spaceLabel(player.position)} | ${player.loans} loan${player.loans === 1 ? "" : "s"}</div>
        </div>
        <div class="money">$${player.cash}</div>
      </div>`;
    })
    .join("");
}

function renderDeeds() {
  const player = currentPlayer();
  if (!player) {
    elements.deedsList.innerHTML = '<div class="empty-state">Start a game.</div>';
    return;
  }
  const deeds = state.board
    .filter((space) => space.owner === state.current)
    .map((space) => {
      const group = space.group ? groupInfo[space.group] : null;
      const upgradeLabel = space.type === "property" ? upgradeNames[space.level] : "Asset";
      const canBuild = canUpgrade(space, player);
      const button = canBuild
        ? `<button type="button" data-build="${state.board.indexOf(space)}">Build</button>`
        : `<button type="button" disabled>Build</button>`;
      return `<div class="deed-row">
        <div class="deed-chip" style="background:${group ? group.color : "#d8dde8"}"></div>
        <div>
          <div class="deed-name">${escapeHtml(space.name)}</div>
          <div class="deed-meta">${escapeHtml(group ? group.label : space.type)} | ${upgradeLabel}</div>
        </div>
        ${space.type === "property" ? button : '<button type="button" disabled>Asset</button>'}
      </div>`;
    });
  elements.deedsList.innerHTML = deeds.length ? deeds.join("") : '<div class="empty-state">No deeds yet.</div>';
  elements.deedsList.querySelectorAll("[data-build]").forEach((button) => {
    button.addEventListener("click", () => buildOn(state.board[Number(button.dataset.build)]));
  });
}

function renderLog() {
  elements.logList.innerHTML = state.log.map((entry) => `<li>${escapeHtml(entry)}</li>`).join("");
}

function renderTurnState() {
  const player = currentPlayer();
  if (!player) {
    elements.status.textContent = "Ready";
    elements.turnBadge.textContent = "Start a game";
  } else if (state.phase === "gameover") {
    elements.status.textContent = "Game over";
    elements.turnBadge.textContent = `${activePlayers()[0]?.name || "Nobody"} wins`;
  } else {
    const debt = player.cash < 0 ? " | debt" : "";
    elements.status.textContent = `${player.name}'s turn${debt}`;
    elements.turnBadge.textContent = `${player.name} on ${spaceLabel(player.position)}`;
  }

  const dice = state.dice.map((value) => `<span class="die">${value || "-"}</span>`).join("");
  elements.dice.innerHTML = dice;
}

function renderButtons() {
  const player = currentPlayer();
  const space = player ? state.board[player.position] : null;
  elements.rollBtn.disabled = state.phase !== "roll";
  elements.buyBtn.disabled = !canBuy(space, player);
  elements.upgradeBtn.disabled = !canUpgrade(space, player);
  elements.loanBtn.disabled =
    !player || state.phase === "setup" || state.phase === "gameover" || player.loans >= maxLoans;
  elements.repayBtn.disabled =
    !player || state.phase === "setup" || state.phase === "gameover" || player.loans <= 0 || player.cash < loanRepay;
  elements.endBtn.disabled =
    !player || state.phase === "setup" || state.phase === "gameover" || state.phase === "roll" || player.cash < 0;
}

function spaceLabel(index) {
  return state.board[index]?.name || "Street";
}

function initials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

elements.playerCount.addEventListener("change", setupNameFields);
elements.startBtn.addEventListener("click", startGame);
elements.resetBtn.addEventListener("click", () => {
  state = createEmptyState();
  setupNameFields();
  elements.modal.hidden = true;
  render();
});
elements.rollBtn.addEventListener("click", rollDice);
elements.buyBtn.addEventListener("click", buyCurrentSpace);
elements.upgradeBtn.addEventListener("click", upgradeCurrentSpace);
elements.loanBtn.addEventListener("click", takeLoan);
elements.repayBtn.addEventListener("click", repayLoan);
elements.endBtn.addEventListener("click", endTurn);
elements.cardOkBtn.addEventListener("click", () => {
  elements.modal.hidden = true;
  render();
});

setupNameFields();
render();
