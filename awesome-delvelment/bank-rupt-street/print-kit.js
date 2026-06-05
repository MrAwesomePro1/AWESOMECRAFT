const groups = {
  rust: { label: "Rust District", color: "#8f5a3c", upgradeCost: 50, rent: [2, 12, 36, 100, 260] },
  aqua: { label: "Aqua District", color: "#1499a3", upgradeCost: 50, rent: [6, 32, 95, 280, 560] },
  orchid: { label: "Orchid District", color: "#b24b8f", upgradeCost: 100, rent: [10, 52, 160, 470, 780] },
  ember: { label: "Ember District", color: "#d56b2a", upgradeCost: 100, rent: [14, 72, 210, 590, 980] },
  ruby: { label: "Ruby District", color: "#c43e42", upgradeCost: 150, rent: [18, 92, 270, 730, 1120] },
  amber: { label: "Amber District", color: "#d6a527", upgradeCost: 150, rent: [22, 112, 340, 860, 1240] },
  garden: { label: "Garden District", color: "#3e884f", upgradeCost: 200, rent: [26, 132, 410, 980, 1380] },
  crown: { label: "Crown District", color: "#3b66a7", upgradeCost: 200, rent: [35, 180, 520, 1180, 1600] }
};

const board = [
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

const streetCards = [
  { deck: "Side Hustle", title: "Pop-Up Payday", text: "Your weekend stand sells out. Collect $120." },
  { deck: "Side Hustle", title: "Renovation Surprise", text: "A contractor finds three extra problems. Pay $80." },
  { deck: "Side Hustle", title: "Fast Lane Favor", text: "Move to the nearest transit stop. Buy it or pay rent." },
  { deck: "Side Hustle", title: "Street Festival", text: "Every rival visits your booth. Collect $40 from each player." },
  { deck: "Side Hustle", title: "Permit Mix-Up", text: "Go directly to the Audit Lobby." },
  { deck: "Side Hustle", title: "Tiny Windfall", text: "An old envelope had cash inside. Collect $75." },
  { deck: "Side Hustle", title: "Move to Payday Plaza", text: "Advance to Payday Plaza and collect $200." },
  { deck: "Side Hustle", title: "Mansion Appraisal", text: "Collect $90 for each mansion you own." },
  { deck: "Street Spark", title: "Foundation Crack", text: "Pay $25 per upgrade and $100 per mansion." },
  { deck: "Street Spark", title: "Bank Error", text: "The bank misfiles in your favor. Collect $150." },
  { deck: "Street Spark", title: "Rent Rebate", text: "Collect $50 from the bank." },
  { deck: "Street Spark", title: "Advance to Crown Canal", text: "Move to Crown Canal. Buy it or pay rent." },
  { deck: "Street Spark", title: "Auntie's Ledger", text: "Pay every rival $25." },
  { deck: "Street Spark", title: "Upgrade Coupon", text: "Collect $100 toward your next build." },
  { deck: "Street Spark", title: "Laundry Leak", text: "Move to the nearest utility. Buy it or pay rent." },
  { deck: "Street Spark", title: "Luxury Inspection", text: "Pay $60 for each mansion." }
];

const upgradeNames = ["Lot", "Shop", "Suite", "Tower", "Mansion"];
const playerPieces = [
  { label: "Maven", color: "#cf3f3f" },
  { label: "Cash", color: "#167c80" },
  { label: "Nova", color: "#7353a3" },
  { label: "Ledger", color: "#377a44" }
];

function sheet(title, note, content, className = "") {
  return `<section class="sheet ${className}">
    <header class="sheet-header">
      <h2>${title}</h2>
      <p>${note}</p>
    </header>
    ${content}
  </section>`;
}

function boardPosition(index) {
  if (index <= 10) return { row: 11, column: 11 - index };
  if (index <= 20) return { row: 21 - index, column: 1 };
  if (index <= 30) return { row: 1, column: index - 19 };
  return { row: index - 29, column: 11 };
}

function renderBoard() {
  const spaces = board
    .map((space, index) => {
      const position = boardPosition(index);
      const group = groups[space.group];
      const price = space.cost ? `$${space.cost}` : space.amount ? `$${space.amount}` : labelForSpace(space);
      return `<div class="print-space ${space.type} ${[0, 10, 20, 30].includes(index) ? "corner" : ""}"
        style="grid-column:${position.column};grid-row:${position.row};">
        ${group ? `<div class="space-strip" style="background:${group.color}"></div>` : "<div></div>"}
        <div class="space-name">${escapeHtml(space.name)}</div>
        <div class="space-cost">${escapeHtml(price)}</div>
      </div>`;
    })
    .join("");

  return sheet(
    "Board",
    "Print landscape. Use two regular dice.",
    `<div class="board-body">
      <div class="print-board">
        <div class="board-center">
          <div>
            <div class="center-logo">
              <h3>Bank Rupt Street</h3>
              <p>Buy blocks, build towers, flex mansions, dodge the Audit Van.</p>
            </div>
            <div class="center-notes">
              <div class="center-note">Start cash: $1500</div>
              <div class="center-note">Pass Payday: +$200</div>
              <div class="center-note">Loan: +$300, repay $350</div>
            </div>
          </div>
        </div>
        ${spaces}
      </div>
      <aside class="board-sidebar">
        <div class="rules-box">
          <h3>Quick Setup</h3>
          <ol>
            <li>Give each player $1500 and one player token.</li>
            <li>Shuffle Side Hustle and Street Spark cards separately.</li>
            <li>Place all deed cards, bills, loans, and build pieces near the board.</li>
            <li>Everyone starts on Payday Plaza. Highest roll goes first.</li>
          </ol>
        </div>
        <div class="rules-box">
          <h3>Build Ladder</h3>
          <ul>
            <li>Own every property in a district before building.</li>
            <li>Levels go Shop, Suite, Tower, Mansion.</li>
            <li>Pay the district build cost shown on each deed card.</li>
          </ul>
        </div>
        <div class="rules-box">
          <h3>Printing</h3>
          <ul>
            <li>Print in landscape with backgrounds turned on.</li>
            <li>Cut cards and money on the dashed lines.</li>
            <li>Print the money pages twice for a longer game.</li>
          </ul>
        </div>
      </aside>
    </div>`,
    "board-sheet"
  );
}

function labelForSpace(space) {
  if (space.type === "draw") return space.deck === "hustle" ? "Card" : "Card";
  if (space.type === "start") return "+$200";
  if (space.type === "audit") return "Visit";
  if (space.type === "goToAudit") return "Go";
  if (space.type === "free") return "Rest";
  return "";
}

function renderDeedCard(space) {
  if (space.type === "property") {
    const group = groups[space.group];
    const fullGroupRent = group.rent[0] * 2;
    return `<article class="deed-card">
      <div class="deed-strip" style="background:${group.color}"></div>
      <div class="card-title">
        <strong>${escapeHtml(space.name)}</strong>
        <span>${group.label} | Cost $${space.cost} | Build $${group.upgradeCost}</span>
      </div>
      <div class="card-lines">
        <div class="line-item"><span>Rent</span><strong>$${group.rent[0]}</strong></div>
        <div class="line-item"><span>Rent with full district</span><strong>$${fullGroupRent}</strong></div>
        <div class="line-item"><span>With Shop</span><strong>$${group.rent[1]}</strong></div>
        <div class="line-item"><span>With Suite</span><strong>$${group.rent[2]}</strong></div>
        <div class="line-item"><span>With Tower</span><strong>$${group.rent[3]}</strong></div>
        <div class="line-item"><span>With Mansion</span><strong>$${group.rent[4]}</strong></div>
      </div>
    </article>`;
  }

  if (space.type === "transit") {
    return `<article class="deed-card">
      <div class="deed-strip" style="background:#8c98d8"></div>
      <div class="card-title">
        <strong>${escapeHtml(space.name)}</strong>
        <span>Transit | Cost $${space.cost}</span>
      </div>
      <div class="card-lines">
        <div class="line-item"><span>Own 1 stop</span><strong>$25</strong></div>
        <div class="line-item"><span>Own 2 stops</span><strong>$50</strong></div>
        <div class="line-item"><span>Own 3 stops</span><strong>$100</strong></div>
        <div class="line-item"><span>Own 4 stops</span><strong>$200</strong></div>
      </div>
    </article>`;
  }

  return `<article class="deed-card">
    <div class="deed-strip" style="background:#a2c66e"></div>
    <div class="card-title">
      <strong>${escapeHtml(space.name)}</strong>
      <span>Utility | Cost $${space.cost}</span>
    </div>
    <div class="card-lines">
      <div class="line-item"><span>Own 1 utility</span><strong>4x dice</strong></div>
      <div class="line-item"><span>Own 2 utilities</span><strong>10x dice</strong></div>
      <div class="line-item"><span>Example: roll 8, own both</span><strong>$80</strong></div>
    </div>
  </article>`;
}

function renderDeedSheets() {
  const deeds = board.filter((space) => ["property", "transit", "utility"].includes(space.type));
  return chunk(deeds, 12)
    .map((cards, index) =>
      sheet(
        `Deed Cards ${index + 1}`,
        "Cut on dashed lines.",
        `<div class="card-grid deeds">${cards.map(renderDeedCard).join("")}</div>`
      )
    )
    .join("");
}

function renderStreetCard(card) {
  const className = card.deck === "Side Hustle" ? "side-hustle" : "street-spark";
  return `<article class="street-card ${className}">
    <div class="deck-name">${escapeHtml(card.deck)}</div>
    <h3>${escapeHtml(card.title)}</h3>
    <p>${escapeHtml(card.text)}</p>
  </article>`;
}

function renderStreetSheets() {
  return chunk(streetCards, 12)
    .map((cards, index) =>
      sheet(
        `Street Cards ${index + 1}`,
        "Shuffle each deck separately.",
        `<div class="card-grid street">${cards.map(renderStreetCard).join("")}</div>`
      )
    )
    .join("");
}

function renderMoneySheets() {
  const bills = [
    ...repeatBill(500, 12),
    ...repeatBill(100, 16),
    ...repeatBill(50, 12),
    ...repeatBill(20, 16),
    ...repeatBill(10, 16),
    ...repeatBill(5, 16),
    ...repeatBill(1, 16)
  ];

  return chunk(bills, 25)
    .map((pageBills, index) =>
      sheet(
        `Bank Notes ${index + 1}`,
        "Print twice if you want a bigger bank.",
        `<div class="card-grid money-grid">${pageBills.map(renderBill).join("")}</div>`
      )
    )
    .join("");
}

function repeatBill(denom, count) {
  return Array.from({ length: count }, () => denom);
}

function renderBill(denom) {
  return `<article class="bill" data-denom="${denom}">
    <div class="bill-value">$${denom}</div>
    <div class="bill-name">Bank Rupt Street<span>Officially unofficial cash</span></div>
    <div class="bill-value">$${denom}</div>
  </article>`;
}

function renderPiecesSheets() {
  const playerTokens = playerPieces
    .flatMap((piece) => Array.from({ length: 4 }, () => piece))
    .map((piece) => `<div class="piece-card player-piece" style="background:${piece.color}">${escapeHtml(piece.label)}</div>`);

  const buildPieces = [
    ...Array.from({ length: 16 }, () => '<div class="piece-card build-piece">Shop</div>'),
    ...Array.from({ length: 16 }, () => '<div class="piece-card build-piece">Suite</div>'),
    ...Array.from({ length: 16 }, () => '<div class="piece-card build-piece">Tower</div>'),
    ...Array.from({ length: 16 }, () => '<div class="piece-card mansion-piece">Mansion</div>')
  ];

  const loans = Array.from(
    { length: 12 },
    () => '<article class="loan-card"><strong>Street Loan</strong><span>Take $300 now. Repay $350 later. Max 3 loans per player.</span></article>'
  );

  return [
    sheet(
      "Tokens and Build Pieces",
      "Cut on dashed lines. Use coins as extra markers if needed.",
      `<div class="card-grid pieces-grid">${playerTokens.join("")}${buildPieces.join("")}</div>`
    ),
    sheet(
      "Loan Slips",
      "Cut on dashed lines. Each player can hold up to 3 loans.",
      `<div class="card-grid loan-grid">${loans.join("")}</div>`
    )
  ].join("");
}

function renderRulesSheet() {
  return sheet(
    "Rules",
    "Fast tabletop rules for 2 to 4 players.",
    `<div class="rules-columns">
      <div class="rules-box">
        <h3>Turn</h3>
        <ol>
          <li>Roll two dice and move clockwise.</li>
          <li>If you pass Payday Plaza, collect $200 and pay $30 interest for each loan.</li>
          <li>Resolve the space you land on.</li>
          <li>Buy open deeds, build on your current deed, take or repay loans, then end your turn.</li>
        </ol>
      </div>
      <div class="rules-box">
        <h3>Buying and Rent</h3>
        <ul>
          <li>If a deed is open, you may buy it for the printed price.</li>
          <li>If another player owns it, pay rent shown on its deed.</li>
          <li>Owning every property in a district doubles empty-lot rent.</li>
          <li>Transit rent rises with each transit stop owned. Utilities charge dice roll times 4 or 10.</li>
        </ul>
      </div>
      <div class="rules-box">
        <h3>Building</h3>
        <ul>
          <li>You must own a whole district to build on that district.</li>
          <li>Each build moves a property up one level: Shop, Suite, Tower, Mansion.</li>
          <li>You can build on the property where your token is standing, or agree to build between turns.</li>
        </ul>
      </div>
      <div class="rules-box">
        <h3>Audit Lobby</h3>
        <ul>
          <li>Landing on Audit Lobby is just visiting.</li>
          <li>Audit Van sends you there. On your next turn, pay $50 before rolling.</li>
          <li>If you cannot pay, take a loan if you have fewer than 3 loans.</li>
        </ul>
      </div>
      <div class="rules-box">
        <h3>Loans and Bankruptcy</h3>
        <ul>
          <li>A loan gives $300 immediately and costs $350 to repay.</li>
          <li>You may hold up to 3 loans.</li>
          <li>If you owe money and cannot cover it after 3 loans, you are bank rupt.</li>
          <li>When bank rupt, return your deeds and buildings to the street.</li>
        </ul>
      </div>
      <div class="rules-box">
        <h3>Winning</h3>
        <ul>
          <li>Last player standing wins.</li>
          <li>Short game: stop after 45 minutes. Add cash, deed prices, and building value. Highest total wins.</li>
          <li>Use the web version for automatic bookkeeping if you want the computer to run the bank.</li>
        </ul>
      </div>
    </div>`,
    "rules-sheet"
  );
}

function chunk(items, size) {
  const pages = [];
  for (let i = 0; i < items.length; i += size) {
    pages.push(items.slice(i, i + size));
  }
  return pages;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

document.getElementById("printKit").innerHTML = [
  renderBoard(),
  renderRulesSheet(),
  renderDeedSheets(),
  renderStreetSheets(),
  renderMoneySheets(),
  renderPiecesSheets()
].join("");
