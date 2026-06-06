import * as THREE from "./vendor/three.module.js";

const root = document.getElementById("sceneRoot");
const loadScreen = document.getElementById("loadScreen");
const errorPanel = document.getElementById("errorPanel");
const errorText = document.getElementById("errorText");
const placeLabel = document.getElementById("placeLabel");
const timeLabel = document.getElementById("timeLabel");
const deviceLabel = document.getElementById("deviceLabel");
const momentText = document.getElementById("momentText");
const vrBtn = document.getElementById("vrBtn");
const soundBtn = document.getElementById("soundBtn");
const timeBtn = document.getElementById("timeBtn");
const resetBtn = document.getElementById("resetBtn");
const fullBtn = document.getElementById("fullBtn");
const moveStick = document.getElementById("moveStick");
const moveKnob = document.getElementById("moveKnob");
const lookPad = document.getElementById("lookPad");
const placeButtons = [...document.querySelectorAll("[data-place]")];

const isTouch = matchMedia("(pointer: coarse)").matches || "ontouchstart" in window;
const placements = {
  home: {
    label: "Home",
    pos: new THREE.Vector3(0, 0, 7.4),
    yaw: 0,
    pitch: -0.06,
    text: "Fresh coffee, city light, open air."
  },
  street: {
    label: "Street",
    pos: new THREE.Vector3(-4.8, 0, -14),
    yaw: -0.14,
    pitch: -0.02,
    text: "Crosswalk glow, moving windows, warm storefronts."
  },
  park: {
    label: "Park",
    pos: new THREE.Vector3(1.8, 0, -42),
    yaw: 0.08,
    pitch: -0.04,
    text: "Grass underfoot, water ahead, skyline behind you."
  }
};
const times = [
  {
    name: "Morning",
    bg: 0xaad7ee,
    fog: 0xc4e2ee,
    hemiSky: 0xdff7ff,
    hemiGround: 0x8e735d,
    sun: 0xfff0ba,
    exposure: 0.98,
    rain: false,
    text: "Fresh coffee, city light, open air."
  },
  {
    name: "Noon",
    bg: 0x8fc9e9,
    fog: 0xb6d8e8,
    hemiSky: 0xf4fbff,
    hemiGround: 0x8a8f6d,
    sun: 0xffffff,
    exposure: 1.08,
    rain: false,
    text: "Bright pavement, clear glass, steady afternoon air."
  },
  {
    name: "Evening",
    bg: 0x345069,
    fog: 0x65727b,
    hemiSky: 0xf4b375,
    hemiGround: 0x30403a,
    sun: 0xff9e5e,
    exposure: 0.86,
    rain: false,
    text: "Soft lamps, long shadows, the city settling down."
  },
  {
    name: "Rain",
    bg: 0x627887,
    fog: 0x7f8c8d,
    hemiSky: 0xc9d6dc,
    hemiGround: 0x42514a,
    sun: 0xd7e4ee,
    exposure: 0.82,
    rain: true,
    text: "Wet street shine, quiet glass, close air."
  }
];

const state = {
  place: "home",
  timeIndex: 0,
  yaw: 0,
  pitch: -0.06,
  keys: new Set(),
  moveVector: new THREE.Vector2(),
  lookVector: new THREE.Vector2(),
  dragging: false,
  pointerLocked: false,
  soundOn: false,
  lastTouchLook: null,
  xrSupported: false,
  mixerTime: 0
};

const scene = new THREE.Scene();
scene.background = new THREE.Color(times[0].bg);
scene.fog = new THREE.FogExp2(times[0].fog, 0.023);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isTouch ? 1.7 : 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = isTouch ? THREE.PCFShadowMap : THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = times[0].exposure;
renderer.xr.enabled = true;
root.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(68, window.innerWidth / window.innerHeight, 0.05, 260);
const player = new THREE.Group();
player.position.copy(placements.home.pos);
camera.position.set(0, 1.62, 0);
player.add(camera);
scene.add(player);

const clock = new THREE.Clock();
const raycaster = new THREE.Raycaster();
const center = new THREE.Vector2(0, 0);
const pointer = new THREE.Vector2();
const tempVec = new THREE.Vector3();
const moveDir = new THREE.Vector3();
const rightDir = new THREE.Vector3();
const interactive = [];
const cars = [];
const walkers = [];
const steam = [];
const rainDrops = [];
const puddles = [];
const waterRipples = [];
const clockHands = [];
let audio = null;
let activeLamp = null;
let rainGroup = null;
let worldExpanded = false;

const mats = makeMaterials();
const hemi = new THREE.HemisphereLight(times[0].hemiSky, times[0].hemiGround, 1.45);
scene.add(hemi);

const sun = new THREE.DirectionalLight(times[0].sun, 4.5);
sun.position.set(-11, 18, 8);
sun.castShadow = true;
sun.shadow.mapSize.set(isTouch ? 1024 : 1536, isTouch ? 1024 : 1536);
sun.shadow.camera.left = -38;
sun.shadow.camera.right = 38;
sun.shadow.camera.top = 34;
sun.shadow.camera.bottom = -44;
sun.shadow.camera.near = 1;
sun.shadow.camera.far = 80;
scene.add(sun);

const ambientFill = new THREE.PointLight(0xffcf8e, 1.25, 16, 1.7);
ambientFill.position.set(-3.8, 2.4, 5.5);
scene.add(ambientFill);

buildWorld();
setupControls();
setupXR();
updatePlaceUI();
setTime(0);
setDeviceLabel();
hideLoadSoon();

renderer.setAnimationLoop(render);

function makeMaterials() {
  const grassTexture = makeCanvasTexture(256, 256, (ctx, w, h) => {
    ctx.fillStyle = "#5d8a52";
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) {
      const hue = 88 + Math.random() * 36;
      const light = 30 + Math.random() * 18;
      ctx.fillStyle = `hsl(${hue}, ${38 + Math.random() * 28}%, ${light}%)`;
      ctx.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 3, 1 + Math.random() * 5);
    }
  }, 14, 14);

  const asphaltTexture = makeCanvasTexture(256, 256, (ctx, w, h) => {
    ctx.fillStyle = "#313638";
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 1200; i++) {
      const v = 42 + Math.random() * 44;
      ctx.fillStyle = `rgb(${v}, ${v + 2}, ${v + 4})`;
      ctx.fillRect(Math.random() * w, Math.random() * h, 1, 1);
    }
    ctx.fillStyle = "rgba(255,255,255,.06)";
    for (let y = 0; y < h; y += 38) ctx.fillRect(0, y, w, 1);
  }, 3, 12);

  const woodTexture = makeCanvasTexture(256, 256, (ctx, w, h) => {
    ctx.fillStyle = "#9f7046";
    ctx.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 20) {
      ctx.fillStyle = y % 40 === 0 ? "#b98555" : "#7f5638";
      ctx.fillRect(0, y, w, 3);
    }
    for (let i = 0; i < 80; i++) {
      ctx.strokeStyle = "rgba(65,39,22,.18)";
      ctx.beginPath();
      const y = Math.random() * h;
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(w * 0.35, y + Math.random() * 20 - 10, w * 0.7, y + Math.random() * 24 - 12, w, y + Math.random() * 16 - 8);
      ctx.stroke();
    }
  }, 4, 4);

  const tileTexture = makeCanvasTexture(256, 256, (ctx, w, h) => {
    ctx.fillStyle = "#d8d1c2";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#b8ad9b";
    ctx.lineWidth = 2;
    for (let x = 0; x <= w; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y <= h; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
  }, 3, 3);

  const brickTexture = makeCanvasTexture(256, 256, (ctx, w, h) => {
    ctx.fillStyle = "#9e6f5d";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(54,33,25,.42)";
    ctx.lineWidth = 3;
    for (let y = 0; y < h; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
      const offset = y % 64 === 0 ? 0 : 32;
      for (let x = -offset; x < w; x += 64) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + 32);
        ctx.stroke();
      }
    }
    for (let i = 0; i < 520; i++) {
      const red = 110 + Math.random() * 45;
      ctx.fillStyle = `rgba(${red}, ${Math.max(60, red - 35)}, ${Math.max(45, red - 50)}, .23)`;
      ctx.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 3, 1 + Math.random() * 3);
    }
  }, 2, 5);

  const fabricTexture = makeCanvasTexture(256, 256, (ctx, w, h) => {
    ctx.fillStyle = "#2f7379";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(255,255,255,.08)";
    for (let i = 0; i < w; i += 5) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 30, h);
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(0,0,0,.12)";
    for (let y = 0; y < h; y += 6) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y + Math.sin(y) * 4);
      ctx.stroke();
    }
  }, 2, 2);

  return {
    grass: new THREE.MeshStandardMaterial({ map: grassTexture, roughness: 0.95, color: 0xc9f0a8 }),
    asphalt: new THREE.MeshStandardMaterial({ map: asphaltTexture, roughness: 0.92, color: 0x707a7b }),
    sidewalk: new THREE.MeshStandardMaterial({ color: 0xc7c0af, roughness: 0.87 }),
    wood: new THREE.MeshStandardMaterial({ map: woodTexture, roughness: 0.72, color: 0xffdec0 }),
    tile: new THREE.MeshStandardMaterial({ map: tileTexture, roughness: 0.78, color: 0xffffff }),
    brick: new THREE.MeshStandardMaterial({ map: brickTexture, roughness: 0.84, color: 0xffffff }),
    wall: new THREE.MeshStandardMaterial({ color: 0xf2e7d2, roughness: 0.83 }),
    warmWall: new THREE.MeshStandardMaterial({ color: 0xd8a976, roughness: 0.72 }),
    glass: new THREE.MeshPhysicalMaterial({
      color: 0xc9f4ff,
      transparent: true,
      opacity: 0.34,
      roughness: 0.04,
      metalness: 0,
      transmission: 0.2
    }),
    frame: new THREE.MeshStandardMaterial({ color: 0x293031, roughness: 0.55, metalness: 0.25 }),
    dark: new THREE.MeshStandardMaterial({ color: 0x202626, roughness: 0.78 }),
    cloth: new THREE.MeshStandardMaterial({ map: fabricTexture, color: 0x346e74, roughness: 0.9 }),
    counter: new THREE.MeshStandardMaterial({ color: 0x45585b, roughness: 0.45, metalness: 0.1 }),
    ceramic: new THREE.MeshStandardMaterial({ color: 0xf8f3e8, roughness: 0.45 }),
    steam: new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.34, depthWrite: false }),
    leaf: new THREE.MeshStandardMaterial({ color: 0x5d9c5d, roughness: 0.88 }),
    trunk: new THREE.MeshStandardMaterial({ color: 0x6b4936, roughness: 0.9 }),
    water: new THREE.MeshPhysicalMaterial({
      color: 0x5ea8b2,
      transparent: true,
      opacity: 0.82,
      roughness: 0.2,
      metalness: 0.02,
      transmission: 0.12
    }),
    white: new THREE.MeshStandardMaterial({ color: 0xf4efe4, roughness: 0.58 }),
    yellow: new THREE.MeshStandardMaterial({ color: 0xffcf5d, roughness: 0.45 }),
    red: new THREE.MeshStandardMaterial({ color: 0xdd5a4f, roughness: 0.54 }),
    teal: new THREE.MeshStandardMaterial({ color: 0x2baaa2, roughness: 0.58 }),
    metal: new THREE.MeshStandardMaterial({ color: 0x8f9a9c, roughness: 0.38, metalness: 0.55 }),
    chrome: new THREE.MeshStandardMaterial({ color: 0xd8e3e5, roughness: 0.18, metalness: 0.85 }),
    screen: new THREE.MeshStandardMaterial({ color: 0x111827, emissive: 0x2fd1bf, emissiveIntensity: 0.18, roughness: 0.28 }),
    matteBlack: new THREE.MeshStandardMaterial({ color: 0x111516, roughness: 0.64 }),
    bookRed: new THREE.MeshStandardMaterial({ color: 0xb5463f, roughness: 0.78 }),
    bookBlue: new THREE.MeshStandardMaterial({ color: 0x315f8f, roughness: 0.78 }),
    puddle: new THREE.MeshPhysicalMaterial({ color: 0x9fc7d7, transparent: true, opacity: 0.42, roughness: 0.05, metalness: 0.02, transmission: 0.18 })
  };
}

function makeCanvasTexture(width, height, draw, repeatX = 1, repeatY = 1) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  draw(ctx, width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeatX, repeatY);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function buildWorld() {
  addGround();
  addApartment();
  scheduleWorldExpansion();
}

function scheduleWorldExpansion() {
  if (worldExpanded) return;
  worldExpanded = true;
  const tasks = [addStreet, addPark, addMovingLife, buildRain];
  const runNext = () => {
    const task = tasks.shift();
    if (task) task();
    if (tasks.length) {
      scheduleIdle(runNext);
      return;
    }
    setTime(state.timeIndex);
  };
  setTimeout(() => scheduleIdle(runNext), 260);
}

function scheduleIdle(callback) {
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(callback, { timeout: 700 });
    return;
  }
  setTimeout(callback, 60);
}

function addGround() {
  const grass = plane(80, 94, mats.grass);
  grass.position.set(0, -0.03, -31);
  grass.receiveShadow = true;
  scene.add(grass);

  const path = plane(5.5, 58, mats.sidewalk);
  path.position.set(-4.8, -0.012, -27);
  path.receiveShadow = true;
  scene.add(path);

  for (let i = 0; i < 26; i++) {
    const tile = box(2.25, 0.025, 1.6, mats.sidewalk);
    tile.position.set(-4.8, 0.006, -1 - i * 2.05);
    tile.receiveShadow = true;
    scene.add(tile);
  }
}

function addApartment() {
  const floor = plane(13.5, 11.8, mats.wood);
  floor.position.set(0, 0, 5.9);
  floor.receiveShadow = true;
  scene.add(floor);

  const rug = plane(4.5, 3, new THREE.MeshStandardMaterial({ color: 0xe3b95e, roughness: 0.92 }));
  rug.position.set(2.2, 0.012, 6.8);
  rug.receiveShadow = true;
  scene.add(rug);

  addWall(0, 1.55, 11.7, 13.6, 3.1, 0.18, mats.wall);
  addWall(-6.9, 1.55, 5.9, 0.18, 3.1, 11.8, mats.wall);
  addWall(6.9, 1.55, 5.9, 0.18, 3.1, 11.8, mats.wall);
  addWall(0, 3.1, 5.9, 13.6, 0.16, 11.8, new THREE.MeshStandardMaterial({ color: 0xf5ecdc, roughness: 0.9 }));

  const glassL = box(2.9, 2.55, 0.05, mats.glass);
  glassL.position.set(-3.15, 1.45, 0.1);
  scene.add(glassL);
  const glassR = glassL.clone();
  glassR.position.x = 3.15;
  scene.add(glassR);

  for (const x of [-5.9, -1.55, 1.55, 5.9]) {
    const frame = box(0.08, 2.82, 0.12, mats.frame);
    frame.position.set(x, 1.43, 0.08);
    frame.castShadow = true;
    scene.add(frame);
  }
  const topFrame = box(11.9, 0.08, 0.12, mats.frame);
  topFrame.position.set(0, 2.83, 0.08);
  scene.add(topFrame);
  const bottomFrame = topFrame.clone();
  bottomFrame.position.y = 0.08;
  scene.add(bottomFrame);

  const counter = box(3.8, 0.92, 1.18, mats.counter);
  counter.position.set(-4.25, 0.46, 7.1);
  counter.castShadow = true;
  counter.receiveShadow = true;
  scene.add(counter);
  addCabinet(-4.25, 1.25, 7.05);

  const table = box(2.35, 0.13, 1.38, mats.wood);
  table.position.set(-0.9, 0.78, 6.35);
  table.castShadow = true;
  table.receiveShadow = true;
  scene.add(table);
  for (const x of [-1.88, 0.08]) {
    for (const z of [5.8, 6.9]) {
      const leg = box(0.13, 0.78, 0.13, mats.dark);
      leg.position.set(x, 0.39, z);
      leg.castShadow = true;
      scene.add(leg);
    }
  }

  addChair(-2.25, 5.65, Math.PI * 0.14);
  addChair(0.45, 6.95, Math.PI * 1.1);
  addCoffee(-0.55, 0.92, 6.35);
  addLamp(3.9, 0, 8.9);
  addCouch(3.2, 6.4, -Math.PI / 2);
  addPlant(5.25, 0.02, 2.4, 0.9);
  addClock(-5.35, 2.05, 11.58);
  addWallArt(1.8, 1.75, 11.57);
  addInteriorDetails();
}

function addInteriorDetails() {
  for (const [x, z, w, d] of [
    [0, 11.48, 13.3, 0.08],
    [-6.72, 5.9, 0.08, 11.35],
    [6.72, 5.9, 0.08, 11.35]
  ]) {
    const trim = box(w, 0.12, d, mats.warmWall);
    trim.position.set(x, 0.18, z);
    trim.castShadow = false;
    scene.add(trim);
  }

  const fridge = box(0.95, 1.85, 0.85, new THREE.MeshStandardMaterial({ color: 0xe6ecec, roughness: 0.34, metalness: 0.22 }));
  fridge.position.set(-5.7, 0.93, 8.65);
  fridge.castShadow = true;
  scene.add(fridge);
  const fridgeHandle = box(0.05, 0.92, 0.04, mats.chrome);
  fridgeHandle.position.set(-5.18, 1.05, 8.2);
  scene.add(fridgeHandle);

  const sink = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.08, 0.42), mats.chrome);
  sink.position.set(-4.6, 0.95, 6.62);
  sink.castShadow = true;
  scene.add(sink);
  const faucet = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.025, 10, 18, Math.PI), mats.chrome);
  faucet.position.set(-4.6, 1.16, 6.62);
  faucet.rotation.z = Math.PI;
  scene.add(faucet);

  const stove = box(0.92, 0.08, 0.58, mats.matteBlack);
  stove.position.set(-3.34, 0.95, 6.62);
  scene.add(stove);
  for (const x of [-3.55, -3.2]) {
    for (const z of [6.45, 6.75]) {
      const burner = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.012, 8, 22), mats.chrome);
      burner.position.set(x, 1.02, z);
      burner.rotation.x = -Math.PI / 2;
      scene.add(burner);
    }
  }

  const laptopBase = box(0.68, 0.035, 0.46, mats.matteBlack);
  laptopBase.position.set(-0.1, 0.88, 6.2);
  scene.add(laptopBase);
  const laptopScreen = box(0.68, 0.42, 0.035, mats.screen);
  laptopScreen.position.set(-0.1, 1.1, 5.95);
  laptopScreen.rotation.x = -0.18;
  laptopScreen.userData.onActivate = () => moment("A quiet glow reflects across the table.");
  interactive.push(laptopScreen);
  scene.add(laptopScreen);

  for (let i = 0; i < 4; i++) {
    const book = box(0.36, 0.045, 0.5, i % 2 ? mats.bookBlue : mats.bookRed);
    book.position.set(0.35 + i * 0.03, 0.88 + i * 0.05, 6.05 + i * 0.08);
    book.rotation.y = 0.18;
    scene.add(book);
  }

  addCurtain(-4.55, 0.02);
  addCurtain(4.55, 0.02);
}

function addCurtain(x, z) {
  const curtainMat = new THREE.MeshStandardMaterial({ color: 0xded2bd, roughness: 0.92, transparent: true, opacity: 0.86 });
  for (let i = 0; i < 5; i++) {
    const fold = box(0.13, 2.4, 0.06, curtainMat);
    fold.position.set(x + i * 0.18 * Math.sign(x), 1.42, z + 0.02);
    fold.rotation.y = Math.sign(x) * 0.1;
    fold.castShadow = true;
    scene.add(fold);
  }
}

function addWall(x, y, z, w, h, d, material) {
  const wall = box(w, h, d, material);
  wall.position.set(x, y, z);
  wall.receiveShadow = true;
  scene.add(wall);
}

function addCabinet(x, y, z) {
  const shelf = box(3.6, 0.6, 0.32, mats.warmWall);
  shelf.position.set(x, y, z + 0.78);
  shelf.castShadow = true;
  shelf.receiveShadow = true;
  scene.add(shelf);
  for (let i = 0; i < 4; i++) {
    const handle = box(0.08, 0.32, 0.03, mats.metal);
    handle.position.set(x - 1.35 + i * 0.9, y - 0.02, z + 0.96);
    scene.add(handle);
  }
}

function addCoffee(x, y, z) {
  const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.26, 32), mats.ceramic);
  mug.position.set(x, y + 0.13, z);
  mug.castShadow = true;
  mug.userData.onActivate = () => {
    moment("Steam lifts from the cup.");
    burstSteam();
  };
  interactive.push(mug);
  scene.add(mug);

  const coffee = new THREE.Mesh(new THREE.CircleGeometry(0.155, 32), new THREE.MeshBasicMaterial({ color: 0x4d2e1e }));
  coffee.rotation.x = -Math.PI / 2;
  coffee.position.set(x, y + 0.265, z);
  scene.add(coffee);

  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.022, 12, 24, Math.PI * 1.25), mats.ceramic);
  handle.rotation.y = Math.PI / 2;
  handle.position.set(x + 0.18, y + 0.14, z);
  handle.castShadow = true;
  scene.add(handle);

  for (let i = 0; i < 18; i++) {
    const puff = new THREE.Mesh(new THREE.SphereGeometry(0.045 + Math.random() * 0.03, 12, 8), mats.steam.clone());
    puff.position.set(x + rand(-0.09, 0.09), y + 0.34 + Math.random() * 0.45, z + rand(-0.09, 0.09));
    puff.userData.base = new THREE.Vector3(x, y + 0.34, z);
    puff.userData.offset = Math.random() * 10;
    puff.userData.speed = 0.24 + Math.random() * 0.2;
    steam.push(puff);
    scene.add(puff);
  }
}

function addLamp(x, y, z) {
  const stand = box(0.08, 1.35, 0.08, mats.metal);
  stand.position.set(x, y + 0.68, z);
  stand.castShadow = true;
  scene.add(stand);
  const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.5, 0.48, 32), new THREE.MeshStandardMaterial({ color: 0xffd78e, roughness: 0.7 }));
  shade.position.set(x, y + 1.45, z);
  shade.castShadow = true;
  shade.userData.onActivate = () => toggleLamp();
  interactive.push(shade);
  scene.add(shade);

  activeLamp = new THREE.PointLight(0xffbd68, 0.8, 8, 1.8);
  activeLamp.position.set(x, y + 1.36, z);
  scene.add(activeLamp);
}

function toggleLamp() {
  activeLamp.intensity = activeLamp.intensity > 0.1 ? 0 : 1.35;
  moment(activeLamp.intensity > 0.1 ? "Warm light fills the room." : "The room settles into softer daylight.");
}

function addCouch(x, z, rotation) {
  const group = new THREE.Group();
  const base = box(2.7, 0.58, 0.92, mats.cloth);
  base.position.y = 0.34;
  base.castShadow = true;
  group.add(base);
  const back = box(2.8, 0.88, 0.26, mats.cloth);
  back.position.set(0, 0.78, 0.46);
  back.castShadow = true;
  group.add(back);
  for (const px of [-0.95, 0, 0.95]) {
    const cushion = box(0.86, 0.11, 0.82, new THREE.MeshStandardMaterial({ color: 0x45878c, roughness: 0.92 }));
    cushion.position.set(px, 0.65, -0.08);
    cushion.castShadow = true;
    group.add(cushion);
  }
  group.position.set(x, 0, z);
  group.rotation.y = rotation;
  scene.add(group);
}

function addChair(x, z, rotation) {
  const group = new THREE.Group();
  const seat = box(0.62, 0.11, 0.62, mats.wood);
  seat.position.y = 0.55;
  seat.castShadow = true;
  group.add(seat);
  const back = box(0.62, 0.72, 0.1, mats.wood);
  back.position.set(0, 0.94, 0.31);
  back.castShadow = true;
  group.add(back);
  for (const px of [-0.24, 0.24]) {
    for (const pz of [-0.24, 0.24]) {
      const leg = box(0.08, 0.55, 0.08, mats.dark);
      leg.position.set(px, 0.27, pz);
      leg.castShadow = true;
      group.add(leg);
    }
  }
  group.position.set(x, 0, z);
  group.rotation.y = rotation;
  scene.add(group);
}

function addPlant(x, y, z, scale = 1) {
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.36 * scale, 0.46 * scale, 0.55 * scale, 24), new THREE.MeshStandardMaterial({ color: 0xbd6a4a, roughness: 0.86 }));
  pot.position.set(x, y + 0.28 * scale, z);
  pot.castShadow = true;
  scene.add(pot);
  for (let i = 0; i < 12; i++) {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.2 * scale, 10, 8), mats.leaf);
    const angle = (i / 12) * Math.PI * 2;
    leaf.scale.set(0.55, 1.25 + Math.random() * 0.55, 0.24);
    leaf.rotation.set(rand(-0.7, 0.7), angle, rand(-0.35, 0.35));
    leaf.position.set(
      x + Math.cos(angle) * rand(0.06, 0.24) * scale,
      y + rand(0.7, 1.18) * scale,
      z + Math.sin(angle) * rand(0.06, 0.24) * scale
    );
    leaf.castShadow = true;
    scene.add(leaf);
  }
}

function addClock(x, y, z) {
  const face = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.05, 36), mats.white);
  face.rotation.x = Math.PI / 2;
  face.position.set(x, y, z);
  face.castShadow = true;
  scene.add(face);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.47, 0.025, 12, 42), mats.dark);
  rim.position.set(x, y, z - 0.03);
  scene.add(rim);
  const hour = box(0.035, 0.28, 0.018, mats.dark);
  hour.position.set(x, y, z - 0.07);
  const minute = box(0.025, 0.38, 0.018, mats.dark);
  minute.position.set(x, y, z - 0.08);
  scene.add(hour, minute);
  clockHands.push({ hour, minute });
}

function addWallArt(x, y, z) {
  const frame = box(2.2, 1.2, 0.05, mats.frame);
  frame.position.set(x, y, z);
  frame.castShadow = true;
  scene.add(frame);
  const art = box(2, 1, 0.04, new THREE.MeshStandardMaterial({ color: 0x78b3c9, roughness: 0.62 }));
  art.position.set(x, y, z - 0.04);
  art.userData.onActivate = () => {
    teleport("park");
    moment("The picture opens into the park air.");
  };
  interactive.push(art);
  scene.add(art);
  const sunDot = new THREE.Mesh(new THREE.CircleGeometry(0.18, 24), new THREE.MeshBasicMaterial({ color: 0xffcf5d }));
  sunDot.position.set(x - 0.52, y + 0.23, z - 0.075);
  scene.add(sunDot);
}

function addStreet() {
  const road = plane(10.5, 48, mats.asphalt);
  road.position.set(0, 0.002, -23);
  road.receiveShadow = true;
  scene.add(road);

  for (const x of [-7.5, 7.5]) {
    const sidewalk = plane(3.4, 50, mats.sidewalk);
    sidewalk.position.set(x, 0.018, -23);
    sidewalk.receiveShadow = true;
    scene.add(sidewalk);
  }

  for (let i = 0; i < 14; i++) {
    const lane = box(0.16, 0.025, 1.5, mats.yellow);
    lane.position.set(0, 0.045, -2 - i * 3.5);
    scene.add(lane);
  }

  for (let i = 0; i < 8; i++) {
    const stripe = box(6.2, 0.03, 0.22, mats.white);
    stripe.position.set(0, 0.055, -6.8 - i * 0.55);
    stripe.receiveShadow = true;
    scene.add(stripe);
  }

  for (let i = 0; i < 9; i++) {
    addBuilding(-13.4, -4 - i * 5.2, rand(4.1, 6.3), rand(3.8, 5.8), rand(4.5, 11), i);
    addBuilding(13.4, -5.8 - i * 5.4, rand(4.1, 6.5), rand(3.8, 5.6), rand(4, 10.5), i + 10);
  }

  for (const z of [-4, -13, -23, -33]) {
    addStreetLamp(-6.35, z);
    addStreetLamp(6.35, z + 2.8);
  }

  addBusStop(-8.65, -18.5);
  addNewsBox(7.1, -11);
  addTrafficLight(5.65, -7.2);
  addTrafficLight(-5.65, -8.5);
  addStreetDetails();
}

function addBuilding(x, z, w, d, h, seed) {
  const palette = [0xa66e55, 0x87939b, 0xb69b79, 0x6d858b, 0xc0b19c, 0x8a6f73];
  const bodyMat = seed % 3 === 0
    ? mats.brick.clone()
    : new THREE.MeshStandardMaterial({ color: palette[seed % palette.length], roughness: 0.78 });
  bodyMat.color.setHex(palette[seed % palette.length]);
  const body = box(w, h, d, bodyMat);
  body.position.set(x, h / 2, z);
  body.castShadow = true;
  body.receiveShadow = true;
  scene.add(body);
  const rows = Math.max(2, Math.floor(h / 1.35));
  const cols = Math.max(2, Math.floor(w / 1.1));
  const frontZ = z + (x < 0 ? d / 2 + 0.03 : -d / 2 - 0.03);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if ((r + c + seed) % 5 === 0) continue;
      const windowMat = new THREE.MeshStandardMaterial({
        color: (r + seed) % 3 === 0 ? 0xffd37a : 0xb5e7f0,
        emissive: (r + seed) % 3 === 0 ? 0xffa347 : 0x345766,
        emissiveIntensity: (r + seed) % 3 === 0 ? 0.45 : 0.12,
        roughness: 0.2
      });
      const win = box(0.48, 0.5, 0.04, windowMat);
      win.position.set(x + (c - (cols - 1) / 2) * 0.82, 1.1 + r * 1.18, frontZ);
      if (x > 0) win.rotation.y = Math.PI;
      scene.add(win);
    }
  }
}

function addStreetDetails() {
  for (const x of [-5.3, 5.3]) {
    const curb = box(0.18, 0.16, 49, new THREE.MeshStandardMaterial({ color: 0xb3ab9a, roughness: 0.86 }));
    curb.position.set(x, 0.09, -23);
    curb.castShadow = false;
    scene.add(curb);
  }

  addStorefront(-10.2, -8.4, 1);
  addStorefront(10.2, -15.5, -1);
  addStorefront(-10.2, -27.5, 1);
  addStorefront(10.2, -34.2, -1);

  for (const [x, z, sx, sz] of [
    [-2.6, -12.4, 1.2, 0.54],
    [2.9, -24.8, 0.9, 0.42],
    [-1.4, -36.7, 1.55, 0.52],
    [3.2, -7.8, 0.72, 0.36]
  ]) addPuddle(x, z, sx, sz);

  for (const [x, z] of [[-1.2, -16.5], [1.4, -32]]) {
    const manhole = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.035, 36), mats.metal);
    manhole.position.set(x, 0.075, z);
    manhole.rotation.x = Math.PI / 2;
    scene.add(manhole);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.012, 8, 34), mats.dark);
    ring.position.set(x, 0.099, z);
    ring.rotation.x = -Math.PI / 2;
    scene.add(ring);
  }

  addHydrant(-6.7, -10.2);
  addHydrant(6.65, -26.4);
  addTrashBins(-8.4, -5.2);
  addTrashBins(8.6, -31.6);
}

function addStorefront(x, z, facing) {
  const sign = box(3.1, 0.38, 0.12, new THREE.MeshStandardMaterial({ color: 0xe3b95e, roughness: 0.55, emissive: 0x6b3f10, emissiveIntensity: 0.12 }));
  sign.position.set(x, 1.95, z);
  sign.rotation.y = facing > 0 ? Math.PI / 2 : -Math.PI / 2;
  scene.add(sign);

  const glass = box(2.8, 1.25, 0.08, mats.glass);
  glass.position.set(x, 0.94, z);
  glass.rotation.y = sign.rotation.y;
  scene.add(glass);

  const awningMat = new THREE.MeshStandardMaterial({ color: 0xb94646, roughness: 0.66 });
  for (let i = 0; i < 5; i++) {
    const strip = box(0.5, 0.12, 0.55, i % 2 ? mats.white : awningMat);
    strip.position.set(x + facing * 0.1, 1.58, z - 1.08 + i * 0.54);
    strip.rotation.y = sign.rotation.y;
    scene.add(strip);
  }
}

function addPuddle(x, z, sx, sz) {
  const mat = mats.puddle.clone();
  const puddle = new THREE.Mesh(new THREE.CircleGeometry(0.62, 32), mat);
  puddle.rotation.x = -Math.PI / 2;
  puddle.scale.set(sx, sz, 1);
  puddle.position.set(x, 0.072, z);
  puddle.visible = false;
  puddles.push(puddle);
  scene.add(puddle);
}

function addHydrant(x, z) {
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.55, 18), mats.red);
  body.position.set(x, 0.31, z);
  body.castShadow = true;
  scene.add(body);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.16, 18, 10), mats.red);
  cap.position.set(x, 0.62, z);
  cap.castShadow = true;
  scene.add(cap);
  const side = box(0.42, 0.09, 0.09, mats.chrome);
  side.position.set(x, 0.43, z);
  scene.add(side);
}

function addTrashBins(x, z) {
  for (let i = 0; i < 2; i++) {
    const bin = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.29, 0.78, 18), new THREE.MeshStandardMaterial({ color: i ? 0x315f55 : 0x42515a, roughness: 0.82 }));
    bin.position.set(x + i * 0.58, 0.39, z);
    bin.castShadow = true;
    scene.add(bin);
    const lid = box(0.62, 0.08, 0.46, mats.dark);
    lid.position.set(x + i * 0.58, 0.82, z);
    scene.add(lid);
  }
}

function addStreetLamp(x, z) {
  const pole = box(0.12, 2.5, 0.12, mats.metal);
  pole.position.set(x, 1.25, z);
  pole.castShadow = true;
  scene.add(pole);
  const head = box(0.75, 0.14, 0.28, mats.dark);
  head.position.set(x + (x < 0 ? 0.35 : -0.35), 2.55, z);
  head.castShadow = true;
  scene.add(head);
  const glow = new THREE.PointLight(0xffc875, 0.65, 6, 1.7);
  glow.position.set(head.position.x, 2.42, z);
  scene.add(glow);
}

function addBusStop(x, z) {
  const roof = box(2.4, 0.16, 1.15, mats.frame);
  roof.position.set(x, 2.0, z);
  roof.castShadow = true;
  scene.add(roof);
  const back = box(2.35, 1.5, 0.08, mats.glass);
  back.position.set(x, 1.12, z + 0.58);
  scene.add(back);
  for (const px of [-1.05, 1.05]) {
    const post = box(0.1, 2, 0.1, mats.frame);
    post.position.set(x + px, 1, z);
    scene.add(post);
  }
  const bench = box(1.55, 0.18, 0.42, mats.wood);
  bench.position.set(x, 0.55, z + 0.16);
  bench.castShadow = true;
  bench.userData.onActivate = () => moment("The city pauses here for a minute.");
  interactive.push(bench);
  scene.add(bench);
}

function addNewsBox(x, z) {
  const boxMesh = box(0.72, 1.05, 0.48, mats.red);
  boxMesh.position.set(x, 0.53, z);
  boxMesh.castShadow = true;
  boxMesh.userData.onActivate = () => moment("A small headline flickers behind the glass.");
  interactive.push(boxMesh);
  scene.add(boxMesh);
  const paper = box(0.58, 0.32, 0.03, mats.white);
  paper.position.set(x, 0.72, z - 0.25);
  scene.add(paper);
}

function addTrafficLight(x, z) {
  const pole = box(0.12, 2.5, 0.12, mats.dark);
  pole.position.set(x, 1.25, z);
  scene.add(pole);
  const head = box(0.38, 0.9, 0.25, mats.dark);
  head.position.set(x, 2.35, z);
  head.userData.onActivate = () => moment("The light changes and the street breathes.");
  interactive.push(head);
  scene.add(head);
  for (const [i, color] of [0xdd3f38, 0xffc15b, 0x4cc477].entries()) {
    const bulb = new THREE.Mesh(new THREE.CircleGeometry(0.095, 18), new THREE.MeshBasicMaterial({ color }));
    bulb.position.set(x, 2.62 - i * 0.28, z - 0.135);
    scene.add(bulb);
  }
}

function addPark() {
  const park = plane(44, 32, mats.grass);
  park.position.set(0, 0.018, -48);
  park.receiveShadow = true;
  scene.add(park);

  const path = new THREE.Mesh(new THREE.RingGeometry(4.7, 6.2, 72), mats.sidewalk);
  path.rotation.x = -Math.PI / 2;
  path.scale.set(1.35, 0.72, 1);
  path.position.set(0, 0.035, -49);
  path.receiveShadow = true;
  scene.add(path);

  const water = new THREE.Mesh(new THREE.CircleGeometry(4.1, 64), mats.water);
  water.rotation.x = -Math.PI / 2;
  water.scale.set(1.35, 0.65, 1);
  water.position.set(0, 0.052, -49);
  water.receiveShadow = true;
  water.userData.onActivate = () => moment("The water catches the sky in broken light.");
  interactive.push(water);
  scene.add(water);

  for (let i = 0; i < 26; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = rand(8.2, 20);
    const x = Math.cos(angle) * radius;
    const z = -49 + Math.sin(angle) * radius * 0.72;
    if (Math.abs(x) < 4.8 && Math.abs(z + 49) < 4) continue;
    addTree(x, z, rand(0.75, 1.55));
  }
  addBench(-5.6, -45.6, 0.34);
  addBench(6.2, -51.8, -0.45);
  addGazebo(10, -45);
  addParkDetails();
}

function addParkDetails() {
  for (const [x, z] of [[-7.2, -50.5], [-3.4, -55.8], [5.1, -43.2], [8.4, -55.2]]) {
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(rand(0.18, 0.38), 0), new THREE.MeshStandardMaterial({ color: 0x777d78, roughness: 0.92 }));
    rock.position.set(x, 0.16, z);
    rock.scale.y = rand(0.45, 0.72);
    rock.rotation.set(rand(0, 1), rand(0, 1), rand(0, 1));
    rock.castShadow = true;
    scene.add(rock);
  }

  const flowerColors = [0xe96d70, 0xf7c35f, 0x8fcf7a, 0x75a7dd];
  for (let i = 0; i < 46; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = rand(6.8, 13.5);
    const x = Math.cos(angle) * radius;
    const z = -49 + Math.sin(angle) * radius * 0.62;
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.012, 0.18, 5), mats.leaf);
    stem.position.set(x, 0.11, z);
    scene.add(stem);
    const bloom = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), new THREE.MeshStandardMaterial({ color: flowerColors[i % flowerColors.length], roughness: 0.74 }));
    bloom.position.set(x, 0.23, z);
    scene.add(bloom);
  }

  for (const [x, z] of [[-4.8, -44.2], [4.9, -44.6], [-5.3, -53.4], [5.6, -53.2]]) {
    const post = box(0.08, 0.62, 0.08, mats.dark);
    post.position.set(x, 0.31, z);
    scene.add(post);
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.12, 14, 8), new THREE.MeshStandardMaterial({ color: 0xffe0a1, emissive: 0xffb24c, emissiveIntensity: 0.45, roughness: 0.28 }));
    lamp.position.set(x, 0.72, z);
    scene.add(lamp);
    const glow = new THREE.PointLight(0xffbf66, 0.22, 3.8, 1.8);
    glow.position.copy(lamp.position);
    scene.add(glow);
  }

  for (let i = 0; i < 4; i++) {
    const ripple = new THREE.Mesh(new THREE.TorusGeometry(0.7 + i * 0.45, 0.01, 6, 72), new THREE.MeshBasicMaterial({ color: 0xd9fbff, transparent: true, opacity: 0.28 - i * 0.045 }));
    ripple.position.set(rand(-1.4, 1.5), 0.072 + i * 0.002, -49 + rand(-0.8, 0.8));
    ripple.rotation.x = -Math.PI / 2;
    ripple.scale.z = 0.52;
    waterRipples.push(ripple);
    scene.add(ripple);
  }
}

function addTree(x, z, scale = 1) {
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18 * scale, 0.28 * scale, 1.7 * scale, 12), mats.trunk);
  trunk.position.set(x, 0.85 * scale, z);
  trunk.castShadow = true;
  scene.add(trunk);
  const crownMat = new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(rand(0.25, 0.34), rand(0.38, 0.62), rand(0.3, 0.47)), roughness: 0.92 });
  for (let i = 0; i < 4; i++) {
    const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(rand(0.85, 1.18) * scale, 1), crownMat);
    crown.position.set(x + rand(-0.42, 0.42) * scale, rand(1.65, 2.65) * scale, z + rand(-0.42, 0.42) * scale);
    crown.castShadow = true;
    crown.receiveShadow = true;
    scene.add(crown);
  }
}

function addBench(x, z, rotation = 0) {
  const group = new THREE.Group();
  const seat = box(1.8, 0.18, 0.42, mats.wood);
  seat.position.y = 0.58;
  seat.castShadow = true;
  group.add(seat);
  const back = box(1.8, 0.58, 0.14, mats.wood);
  back.position.set(0, 0.92, 0.28);
  back.castShadow = true;
  group.add(back);
  for (const px of [-0.7, 0.7]) {
    const leg = box(0.12, 0.58, 0.12, mats.dark);
    leg.position.set(px, 0.29, -0.08);
    group.add(leg);
  }
  group.position.set(x, 0, z);
  group.rotation.y = rotation;
  group.userData.onActivate = () => moment("A quiet place to sit and watch the path.");
  interactive.push(group);
  scene.add(group);
}

function addGazebo(x, z) {
  const base = plane(4.2, 4.2, mats.wood);
  base.position.set(x, 0.06, z);
  scene.add(base);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(3.1, 1.1, 6), new THREE.MeshStandardMaterial({ color: 0x8a3d35, roughness: 0.68 }));
  roof.position.set(x, 2.8, z);
  roof.rotation.y = Math.PI / 6;
  roof.castShadow = true;
  scene.add(roof);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const post = box(0.16, 2.35, 0.16, mats.dark);
    post.position.set(x + Math.cos(a) * 1.85, 1.18, z + Math.sin(a) * 1.85);
    scene.add(post);
  }
}

function addMovingLife() {
  addCar(-1.8, -6, 0.8, 0xef6f6c);
  addCar(1.8, -18, -0.62, 0x3da5d9);
  addCar(-1.8, -30, 0.68, 0xffc15b);
  addWalker(-7.4, -8, 0.42);
  addWalker(7.4, -28, -0.36);
  addWalker(-5.1, -40, 0.28);
}

function addCar(x, z, speed, color) {
  const group = new THREE.Group();
  const body = box(1.35, 0.48, 2.25, new THREE.MeshStandardMaterial({ color, roughness: 0.42, metalness: 0.12 }));
  body.position.y = 0.42;
  body.castShadow = true;
  group.add(body);
  const cabin = box(0.92, 0.42, 0.9, new THREE.MeshStandardMaterial({ color: 0x26343a, roughness: 0.18, metalness: 0.05 }));
  cabin.position.set(0, 0.82, -0.12);
  cabin.castShadow = true;
  group.add(cabin);
  for (const px of [-0.58, 0.58]) {
    for (const pz of [-0.78, 0.78]) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.11, 16), mats.dark);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(px, 0.2, pz);
      wheel.castShadow = true;
      group.add(wheel);
    }
  }
  group.position.set(x, 0, z);
  group.userData.speed = speed;
  if (speed < 0) group.rotation.y = Math.PI;
  cars.push(group);
  scene.add(group);
}

function addWalker(x, z, speed) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.82, 6, 12), new THREE.MeshStandardMaterial({ color: 0x31383a, roughness: 0.8 }));
  body.position.y = 0.98;
  body.castShadow = true;
  group.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 10), new THREE.MeshStandardMaterial({ color: 0xc58f67, roughness: 0.64 }));
  head.position.y = 1.54;
  head.castShadow = true;
  group.add(head);
  group.position.set(x, 0, z);
  group.userData.speed = speed;
  walkers.push(group);
  scene.add(group);
}

function buildRain() {
  rainGroup = new THREE.Group();
  const mat = new THREE.MeshBasicMaterial({ color: 0xcfe7ef, transparent: true, opacity: 0.56 });
  const geo = new THREE.CylinderGeometry(0.008, 0.008, 0.46, 6);
  for (let i = 0; i < 260; i++) {
    const drop = new THREE.Mesh(geo, mat);
    drop.position.set(rand(-26, 26), rand(2, 16), rand(-58, 5));
    drop.rotation.z = 0.12;
    drop.userData.speed = rand(9, 15);
    rainDrops.push(drop);
    rainGroup.add(drop);
  }
  rainGroup.visible = false;
  scene.add(rainGroup);
}

function box(w, h, d, material) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function plane(w, h, material) {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), material);
  mesh.rotation.x = -Math.PI / 2;
  return mesh;
}

function setupControls() {
  deviceLabel.textContent = isTouch ? "iPhone" : "Laptop";

  window.addEventListener("resize", onResize);
  window.addEventListener("keydown", (event) => {
    if (event.repeat) return;
    state.keys.add(event.code);
    if (event.code === "Space") activateCenter();
  });
  window.addEventListener("keyup", (event) => state.keys.delete(event.code));
  document.addEventListener("pointerlockchange", () => {
    state.pointerLocked = document.pointerLockElement === renderer.domElement;
  });
  document.addEventListener("mousemove", (event) => {
    if (!state.pointerLocked) return;
    look(event.movementX, event.movementY, 0.0022);
  });

  renderer.domElement.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button === 0) {
      state.dragging = true;
      renderer.domElement.setPointerCapture(event.pointerId);
      if (!state.pointerLocked) renderer.domElement.requestPointerLock?.();
    }
  });
  renderer.domElement.addEventListener("pointermove", (event) => {
    if (!state.dragging || state.pointerLocked || event.pointerType !== "mouse") return;
    look(event.movementX, event.movementY, 0.004);
  });
  renderer.domElement.addEventListener("pointerup", (event) => {
    if (event.pointerType === "mouse") {
      state.dragging = false;
      clickActivate(event);
    }
  });
  renderer.domElement.addEventListener("dblclick", activateCenter);

  placeButtons.forEach((button) => {
    button.addEventListener("click", () => teleport(button.dataset.place));
  });
  timeBtn.addEventListener("click", () => setTime((state.timeIndex + 1) % times.length));
  resetBtn.addEventListener("click", () => teleport("home"));
  soundBtn.addEventListener("click", toggleSound);
  fullBtn.addEventListener("click", toggleFullscreen);

  setupMoveStick();
  setupLookPad();
}

function setupMoveStick() {
  const max = 42;
  let activeId = null;
  const reset = () => {
    activeId = null;
    state.moveVector.set(0, 0);
    moveKnob.style.transform = "translate(0px, 0px)";
  };
  moveStick.addEventListener("pointerdown", (event) => {
    activeId = event.pointerId;
    moveStick.setPointerCapture(activeId);
    update(event);
  });
  moveStick.addEventListener("pointermove", (event) => {
    if (event.pointerId === activeId) update(event);
  });
  moveStick.addEventListener("pointerup", reset);
  moveStick.addEventListener("pointercancel", reset);

  function update(event) {
    const rect = moveStick.getBoundingClientRect();
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    const len = Math.hypot(dx, dy) || 1;
    const clamped = Math.min(len, max);
    const nx = (dx / len) * clamped;
    const ny = (dy / len) * clamped;
    moveKnob.style.transform = `translate(${nx}px, ${ny}px)`;
    state.moveVector.set(nx / max, -ny / max);
  }
}

function setupLookPad() {
  let activeId = null;
  lookPad.addEventListener("pointerdown", (event) => {
    activeId = event.pointerId;
    state.lastTouchLook = { x: event.clientX, y: event.clientY };
    lookPad.setPointerCapture(activeId);
  });
  lookPad.addEventListener("pointermove", (event) => {
    if (event.pointerId !== activeId || !state.lastTouchLook) return;
    const dx = event.clientX - state.lastTouchLook.x;
    const dy = event.clientY - state.lastTouchLook.y;
    state.lastTouchLook = { x: event.clientX, y: event.clientY };
    look(dx, dy, 0.006);
  });
  const reset = () => {
    activeId = null;
    state.lastTouchLook = null;
  };
  lookPad.addEventListener("pointerup", reset);
  lookPad.addEventListener("pointercancel", reset);
}

function setupXR() {
  vrBtn.disabled = true;
  if (!navigator.xr) {
    vrBtn.title = "VR unavailable";
    return;
  }
  navigator.xr.isSessionSupported("immersive-vr").then((supported) => {
    state.xrSupported = supported;
    vrBtn.disabled = !supported;
    vrBtn.title = supported ? "Enter VR" : "VR unavailable";
  }).catch(() => {
    vrBtn.disabled = true;
  });
  vrBtn.addEventListener("click", async () => {
    if (!state.xrSupported) return;
    if (renderer.xr.getSession()) {
      await renderer.xr.getSession().end();
      return;
    }
    try {
      const session = await navigator.xr.requestSession("immersive-vr", {
        optionalFeatures: ["local-floor", "bounded-floor", "hand-tracking"]
      });
      await renderer.xr.setSession(session);
      moment("VR mode");
    } catch (error) {
      moment("VR was not started.");
    }
  });
}

function onResize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isTouch ? 1.7 : 2));
  renderer.setSize(width, height);
  setDeviceLabel();
}

function setDeviceLabel() {
  const width = window.innerWidth;
  deviceLabel.textContent = isTouch ? "iPhone" : width > 900 ? "Laptop" : "Tablet";
}

function teleport(place) {
  const target = placements[place] || placements.home;
  state.place = place;
  player.position.copy(target.pos);
  state.yaw = target.yaw;
  state.pitch = target.pitch;
  updateCamera();
  updatePlaceUI();
  moment(target.text);
}

function updatePlaceUI() {
  const target = placements[state.place];
  placeLabel.textContent = target.label;
  placeButtons.forEach((button) => button.classList.toggle("active", button.dataset.place === state.place));
}

function setTime(index) {
  state.timeIndex = index;
  const next = times[index];
  scene.background.set(next.bg);
  scene.fog.color.set(next.fog);
  hemi.color.set(next.hemiSky);
  hemi.groundColor.set(next.hemiGround);
  sun.color.set(next.sun);
  renderer.toneMappingExposure = next.exposure;
  if (rainGroup) rainGroup.visible = next.rain;
  puddles.forEach((puddle) => {
    puddle.visible = next.rain || next.name === "Evening";
    puddle.material.opacity = next.rain ? 0.52 : 0.22;
  });
  timeLabel.textContent = next.name;
  moment(next.text);
  if (activeLamp) activeLamp.intensity = next.name === "Evening" || next.name === "Rain" ? 1.35 : 0.8;
}

function toggleSound() {
  if (!audio) audio = createAudio();
  state.soundOn = !state.soundOn;
  soundBtn.classList.toggle("active", state.soundOn);
  if (state.soundOn) {
    audio.context.resume();
    audio.master.gain.setTargetAtTime(0.32, audio.context.currentTime, 0.08);
    moment("Ambient sound on.");
  } else {
    audio.master.gain.setTargetAtTime(0, audio.context.currentTime, 0.08);
    moment("Ambient sound off.");
  }
}

function createAudio() {
  const context = new AudioContext();
  const master = context.createGain();
  master.gain.value = 0;
  master.connect(context.destination);

  const hum = context.createOscillator();
  hum.type = "sine";
  hum.frequency.value = 92;
  const humGain = context.createGain();
  humGain.gain.value = 0.08;
  hum.connect(humGain).connect(master);
  hum.start();

  const city = context.createOscillator();
  city.type = "triangle";
  city.frequency.value = 148;
  const cityGain = context.createGain();
  cityGain.gain.value = 0.035;
  city.connect(cityGain).connect(master);
  city.start();

  const tick = () => {
    if (!state.soundOn) return;
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = "sine";
    osc.frequency.value = 620 + Math.random() * 220;
    gain.gain.value = 0;
    osc.connect(gain).connect(master);
    osc.start();
    gain.gain.setValueAtTime(0, context.currentTime);
    gain.gain.linearRampToValueAtTime(0.045, context.currentTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.45);
    osc.stop(context.currentTime + 0.48);
  };
  setInterval(tick, 2800);
  return { context, master };
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen?.();
    return;
  }
  document.exitFullscreen?.();
}

function clickActivate(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  activateAt(pointer);
}

function activateCenter() {
  activateAt(center);
}

function activateAt(coords) {
  raycaster.setFromCamera(coords, camera);
  const hits = raycaster.intersectObjects(interactive, true);
  const hit = hits.find((item) => findActivation(item.object));
  if (!hit) return;
  const active = findActivation(hit.object);
  active.userData.onActivate();
}

function findActivation(object) {
  let current = object;
  while (current) {
    if (current.userData?.onActivate) return current;
    current = current.parent;
  }
  return null;
}

function look(dx, dy, sensitivity) {
  state.yaw -= dx * sensitivity;
  state.pitch -= dy * sensitivity;
  state.pitch = THREE.MathUtils.clamp(state.pitch, -1.18, 1.08);
  updateCamera();
}

function updateCamera() {
  player.rotation.y = state.yaw;
  camera.rotation.x = state.pitch;
}

function render() {
  const dt = Math.min(clock.getDelta(), 0.05);
  state.mixerTime += dt;
  updateMovement(dt);
  updateAnimations(dt);
  renderer.render(scene, camera);
}

function updateMovement(dt) {
  const forwardInput = (state.keys.has("KeyW") || state.keys.has("ArrowUp") ? 1 : 0) - (state.keys.has("KeyS") || state.keys.has("ArrowDown") ? 1 : 0);
  const sideInput = (state.keys.has("KeyD") || state.keys.has("ArrowRight") ? 1 : 0) - (state.keys.has("KeyA") || state.keys.has("ArrowLeft") ? 1 : 0);
  const forward = forwardInput + state.moveVector.y;
  const side = sideInput + state.moveVector.x;
  if (Math.abs(forward) + Math.abs(side) < 0.02) return;

  moveDir.set(Math.sin(state.yaw), 0, Math.cos(state.yaw) * -1).normalize();
  rightDir.set(Math.cos(state.yaw), 0, Math.sin(state.yaw)).normalize();
  tempVec.set(0, 0, 0);
  tempVec.addScaledVector(moveDir, forward);
  tempVec.addScaledVector(rightDir, side);
  if (tempVec.lengthSq() > 1) tempVec.normalize();

  const speed = state.keys.has("ShiftLeft") || state.keys.has("ShiftRight") ? 4.2 : 2.45;
  player.position.addScaledVector(tempVec, speed * dt);
  player.position.x = THREE.MathUtils.clamp(player.position.x, -9.5, 9.5);
  player.position.z = THREE.MathUtils.clamp(player.position.z, -59, 10.3);
  updateNearestPlace();
}

function updateNearestPlace() {
  const z = player.position.z;
  const nextPlace = z > -2 ? "home" : z > -33 ? "street" : "park";
  if (nextPlace === state.place) return;
  state.place = nextPlace;
  updatePlaceUI();
}

function updateAnimations(dt) {
  const t = state.mixerTime;
  cars.forEach((car) => {
    car.position.z += car.userData.speed * dt * 6.5;
    if (car.userData.speed > 0 && car.position.z > 2) car.position.z = -48;
    if (car.userData.speed < 0 && car.position.z < -50) car.position.z = 3;
    car.children.forEach((part) => {
      if (part.geometry?.type === "CylinderGeometry") part.rotation.x += dt * 8 * Math.sign(car.userData.speed);
    });
  });

  walkers.forEach((walker, index) => {
    walker.position.z += walker.userData.speed * dt * 2.2;
    walker.position.y = Math.abs(Math.sin(t * 4 + index)) * 0.035;
    walker.rotation.y = walker.userData.speed > 0 ? 0 : Math.PI;
    if (walker.userData.speed > 0 && walker.position.z > -3) walker.position.z = -49;
    if (walker.userData.speed < 0 && walker.position.z < -49) walker.position.z = -3;
  });

  steam.forEach((puff, index) => {
    const phase = (t * puff.userData.speed + puff.userData.offset) % 1;
    const base = puff.userData.base;
    puff.position.set(
      base.x + Math.sin(t * 1.7 + index) * 0.09,
      base.y + 0.08 + phase * 0.74,
      base.z + Math.cos(t * 1.4 + index) * 0.08
    );
    puff.material.opacity = 0.34 * (1 - phase);
    const scale = 0.7 + phase * 1.7;
    puff.scale.setScalar(scale);
  });

  if (rainGroup?.visible) {
    rainDrops.forEach((drop) => {
      drop.position.y -= drop.userData.speed * dt;
      drop.position.z += 1.1 * dt;
      if (drop.position.y < 0.2) {
        drop.position.y = rand(8, 16);
        drop.position.x = rand(-26, 26);
        drop.position.z = rand(-58, 5);
      }
    });
  }

  waterRipples.forEach((ripple, index) => {
    const pulse = 1 + Math.sin(t * 0.9 + index * 0.8) * 0.035;
    ripple.scale.x = pulse;
    ripple.scale.y = pulse;
    ripple.material.opacity = 0.14 + Math.sin(t * 0.7 + index) * 0.05;
  });

  clockHands.forEach(({ hour, minute }) => {
    const now = new Date();
    const minutes = now.getMinutes() + now.getSeconds() / 60;
    const hours = (now.getHours() % 12) + minutes / 60;
    minute.rotation.z = -minutes / 60 * Math.PI * 2;
    hour.rotation.z = -hours / 12 * Math.PI * 2;
  });
}

function burstSteam() {
  steam.forEach((puff) => {
    puff.userData.offset = Math.random();
    puff.userData.speed = 0.45 + Math.random() * 0.3;
  });
}

function moment(text) {
  momentText.textContent = text;
}

function hideLoadSoon() {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      loadScreen.style.opacity = "0";
      loadScreen.style.pointerEvents = "none";
      setTimeout(() => loadScreen.remove(), 420);
    });
  });
}

function rand(min, max) {
  return min + Math.random() * (max - min);
}

window.addEventListener("error", (event) => showError(event.message));
window.addEventListener("unhandledrejection", (event) => showError(event.reason?.message || String(event.reason)));

function showError(message) {
  errorText.textContent = message || "The 3D engine did not load.";
  errorPanel.hidden = false;
}
