const models = window.AI_COUNCIL_MODELS || [];

const state = {
  messages: [],
  attachedImage: null,
  imagineImage: null,
  imagineDuration: 60
};

const modelList = document.querySelector("#modelList");
const messages = document.querySelector("#messages");
const composer = document.querySelector("#composer");
const promptInput = document.querySelector("#promptInput");
const pictureInput = document.querySelector("#pictureInput");
const pictureButton = document.querySelector("#pictureButton");
const attachedPicture = document.querySelector("#attachedPicture");
const attachedPicturePreview = document.querySelector("#attachedPicturePreview");
const removePicture = document.querySelector("#removePicture");
const imagineComposer = document.querySelector("#imagineComposer");
const imagineInput = document.querySelector("#imagineInput");
const imaginePictureInput = document.querySelector("#imaginePictureInput");
const imaginePictureButton = document.querySelector("#imaginePictureButton");
const imagineReference = document.querySelector("#imagineReference");
const imaginePicturePreview = document.querySelector("#imaginePicturePreview");
const removeImaginePicture = document.querySelector("#removeImaginePicture");
const imagineDurationButtons = document.querySelectorAll("[data-duration]");
const installApp = document.querySelector("#installApp");
const clearChat = document.querySelector("#clearChat");
const researchToggle = document.querySelector("#researchToggle");
const codeToggle = document.querySelector("#codeToggle");
const depthRange = document.querySelector("#depthRange");
const activeKicker = document.querySelector("#activeKicker");
const activeTitle = document.querySelector("#activeTitle");
const sessionLabel = document.querySelector("#sessionLabel");
const logicScore = document.querySelector("#logicScore");
const creativeScore = document.querySelector("#creativeScore");
const speedScore = document.querySelector("#speedScore");
const canvas = document.querySelector("#signalCanvas");
const ctx = canvas.getContext("2d");
let installPromptEvent = null;

function renderModels() {
  modelList.innerHTML = "";
  models.forEach((model) => {
    const item = document.createElement("div");
    item.className = "model-button";
    item.innerHTML = `
      <span class="model-icon" style="background:${model.color}">${model.icon}</span>
      <span>
        <span class="model-name">${model.name}</span>
        <span class="model-trait">${model.trait}</span>
      </span>
    `;
    modelList.appendChild(item);
  });
}

function renderStatus() {
  activeKicker.textContent = "One chat";
  activeTitle.textContent = "Every AI answers together";
  sessionLabel.textContent = "AI Council unified chat";
  logicScore.textContent = "100";
  creativeScore.textContent = "100";
  speedScore.textContent = "100";
  document.documentElement.style.setProperty("--accent", "#3fc8b4");
}

function renderMessages() {
  messages.innerHTML = "";
  state.messages.forEach((entry) => {
    const item = document.createElement("article");
    item.className = `message ${entry.role}`;
    item.innerHTML = entry.html;
    messages.appendChild(item);
  });
  messages.scrollTop = messages.scrollHeight;
}

function render() {
  renderModels();
  renderStatus();
  renderDurationButtons();
  renderMessages();
}

function renderDurationButtons() {
  imagineDurationButtons.forEach((button) => {
    const duration = Number(button.dataset.duration);
    button.classList.toggle("active", duration === state.imagineDuration);
  });
}

function formatDuration(seconds) {
  if (seconds < 60) return `${seconds} sec`;
  if (seconds < 3600) {
    const minutes = seconds / 60;
    return `${minutes} min`;
  }
  const hours = seconds / 3600;
  return `${hours} ${hours === 1 ? "hour" : "hours"}`;
}

function durationFromPrompt(prompt) {
  const text = prompt.toLowerCase();
  const wordNumbers = {
    one: 1,
    two: 2,
    five: 5,
    six: 6,
    ten: 10,
    twenty: 20,
    thirty: 30
  };
  const numeric = text.match(/\b(\d+)\s*(seconds?|secs?|sec|s|minutes?|minites?|mins?|min|m|hours?|hrs?|hr|h)\b/);
  const worded = text.match(/\b(one|two|five|six|ten|twenty|thirty)\s*(seconds?|secs?|sec|minutes?|minites?|mins?|min|hours?|hrs?|hr)\b/);
  const match = numeric || worded;
  if (!match) return null;
  const amount = Number(match[1]) || wordNumbers[match[1]];
  const unit = match[2];
  const seconds = /hour|hr|h/.test(unit) ? amount * 3600 : /min|minute|minite|m/.test(unit) ? amount * 60 : amount;
  return [6, 10, 20, 60, 300, 1800, 3600, 7200].includes(seconds) ? seconds : null;
}

function cleanImagineSubject(prompt) {
  return prompt
    .replace(/\b(\d+|one|two|five|six|ten|twenty|thirty)\s*(seconds?|secs?|sec|s|minutes?|minites?|mins?|min|m|hours?|hrs?|hr|h)\b/gi, " ")
    .replace(/\b(can you|could you|please|make|create|generate|imagine|turn|animate|video|clip|of|a|an|the)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function describeMotion(prompt) {
  const text = prompt.toLowerCase();
  if (/fly|flying|soar/.test(text)) return "flying camera move";
  if (/dance|dancing/.test(text)) return "dance motion";
  if (/run|running|chase/.test(text)) return "fast chase movement";
  if (/rain|storm|lightning/.test(text)) return "rain, storm, and light flashes";
  if (/spin|rotate|turn/.test(text)) return "spinning camera orbit";
  if (/zoom|close up|close-up/.test(text)) return "slow zoom-in";
  if (/explode|explosion|fire/.test(text)) return "impact burst and heat shimmer";
  return "slow cinematic camera push";
}

function describeStyle(prompt) {
  const text = prompt.toLowerCase();
  if (/anime/.test(text)) return "anime";
  if (/realistic|real life|photo/.test(text)) return "realistic";
  if (/cartoon/.test(text)) return "cartoon";
  if (/pixel/.test(text)) return "pixel art";
  if (/horror|scary/.test(text)) return "dark horror";
  if (/neon|cyber/.test(text)) return "neon cyber";
  if (/fantasy|magic/.test(text)) return "fantasy";
  return "cinematic";
}

function parseImagineRequest(prompt) {
  const duration = durationFromPrompt(prompt) || state.imagineDuration;
  const subject = cleanImagineSubject(prompt) || prompt || "animate this reference picture";
  return {
    duration,
    motion: describeMotion(prompt),
    style: describeStyle(prompt),
    subject
  };
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function sentenceFromPrompt(prompt) {
  const clean = prompt.trim().replace(/\s+/g, " ");
  return clean.length > 110 ? `${clean.slice(0, 110)}...` : clean;
}

function detectIntent(prompt) {
  const text = prompt.toLowerCase();
  if (/(code|app|website|html|css|javascript|python|bug|error|build|fix)/.test(text)) return "build";
  if (/(explain|why|how|teach|learn|understand)/.test(text)) return "explain";
  if (/(idea|story|name|brand|design|creative|write)/.test(text)) return "create";
  if (/(research|source|latest|news|compare|facts)/.test(text)) return "research";
  return "general";
}

function depthLines() {
  const depth = Number(depthRange.value);
  if (depth <= 2) return ["Keep it short.", "Give the next best action."];
  if (depth === 3) return ["Answer first.", "Then give a compact plan.", "Call out the biggest risk."];
  return ["Answer first.", "Break it into steps.", "Add tradeoffs.", "Include a concrete example.", "End with a next action."];
}

function modeAdvice(modelId, prompt) {
  const intent = detectIntent(prompt);
  const topic = sentenceFromPrompt(prompt);
  const research = researchToggle.checked;
  const code = codeToggle.checked || intent === "build";
  const depth = Number(depthRange.value);
  const short = depth <= 2;
  const deep = depth >= 4;

  const responses = {
    chatgpt: [
      `Here is the clean answer: ${topic}`,
      intent === "build"
        ? "I would define the goal, make the smallest working version, then improve it step by step."
        : "I would explain it plainly, give you the useful next step, and avoid making it messier than it needs to be.",
      short ? "Short version: decide the goal, do the next obvious step, then check if it worked." : "I can also break it into options, pros and cons, and a practical plan if you want to go deeper."
    ],
    claude: [
      `I would frame it carefully: ${topic}`,
      "Before rushing, I want to preserve what you mean, because small wording changes can change the whole answer.",
      deep ? "My cautious read is to separate the goal, the possible misunderstanding, and the most respectful way to move forward." : "My short take: be clear, be fair, and do the version that causes the least confusion."
    ],
    grok: [
      `Blunt answer: ${topic}`,
      "Do the useful version first. Skip the fancy fog machine until there is something that actually works.",
      deep ? "Then poke holes in it, because a plan that survives criticism is way better than a pretty plan that folds immediately." : "Fast move: build it, test it, fix the obvious bad parts."
    ],
    codex: [
      `Implementation view: ${topic}`,
      code
        ? "I would identify the files, change the smallest surface area, wire the behavior, and run a real check."
        : "I would turn the idea into inputs, outputs, states, and a concrete thing someone can use.",
      deep ? "I care about edge cases, empty states, broken inputs, mobile layout, and whether the feature still works after refresh." : "Ship the smallest working version, then verify it."
    ],
    gemini: [
      `I am seeing the shape of it: ${topic}`,
      "I would think about the visual feel, the flow, and how the idea works across text, images, and interaction.",
      deep ? "The best version should have a strong first impression, clear controls, and enough creative range to feel alive." : "Make it visual, simple, and flexible."
    ],
    perplexity: [
      `Evidence angle: ${topic}`,
      research
        ? "I would look for current sources, compare them, and avoid treating one random result as truth."
        : "I would separate known facts from guesses, then say what would need sources before we trust it.",
      "If this depends on news, prices, releases, or real-world claims, it needs live verification instead of confident guessing."
    ],
    viders: [
      `Viders shot idea: ${topic}`,
      "I would think in scenes first: opening frame, motion, camera move, lighting, then final beat.",
      deep ? "For Imagine, I would use a clear subject, one action, one style, a duration, and a reference pic if you want the video to match something." : "Best prompt move: say the subject, action, style, and length."
    ]
  };

  return responses[modelId] || responses.chatgpt;
}

function renderVoiceLines(lines) {
  return lines.map((line) => `<p>${escapeHtml(line)}</p>`).join("");
}

function makeHtmlResponse(prompt) {
  const voices = models.map((model) => {
    const advice = renderVoiceLines(modeAdvice(model.id, prompt).slice(0, 3));
    return `
      <section class="speaker-turn" style="--voice:${model.color}">
        <div class="speaker-name">
          <span class="model-icon" style="background:${model.color}">${model.icon}</span>
          <span>${escapeHtml(model.name)}</span>
        </div>
        ${advice}
      </section>
    `;
  }).join("");
  const finalPlan = renderVoiceLines(depthLines().concat("My honest take: use the council like a room of specialists, not six copies of the same bot.").slice(0, 6));

  return `
    <strong>AI Council</strong>
    <p>We are here. You talk to us like people, and each of us answers in our own way.</p>
    <div class="council-thread">${voices}</div>
    <section class="speaker-turn final-answer">
      <div class="speaker-name">
        <span class="model-icon">AC</span>
        <span>AI Council</span>
      </div>
      ${finalPlan}
    </section>
  `;
}

function makeImageResponse(prompt) {
  const topic = sentenceFromPrompt(prompt || "the uploaded picture");
  const voices = [
    ["ChatGPT", "I see the image and your message together. I will treat them like one conversation, not two separate things."],
    ["Claude", "I would look closely first, describe what is really there, and avoid jumping to weird conclusions."],
    ["Grok", "Picture received. Tell me if you want a caption, an edit idea, a rating, or a no-fluff explanation."],
    ["Codex", "If this is for a project, I can translate the picture into layout, colors, objects, and concrete edits."],
    ["Gemini", "I am thinking visually here: mood, composition, color, and what the picture seems to be trying to say."],
    ["Perplexity", "If the image needs facts from the outside world, I will separate visual guesses from verified info."],
    ["Viders Bot", "I would turn this picture into a video prompt: subject, motion, camera path, style, and duration."]
  ].map(([name, text]) => {
    const model = models.find((item) => item.name === name);
    return `
      <section class="speaker-turn" style="--voice:${model.color}">
        <div class="speaker-name">
          <span class="model-icon" style="background:${model.color}">${model.icon}</span>
          <span>${name}</span>
        </div>
        <p>${escapeHtml(text)}</p>
      </section>
    `;
  }).join("");

  return `
    <strong>AI Council</strong>
    <p>I got the picture. You said: ${escapeHtml(topic)}</p>
    <div class="council-thread">${voices}</div>
  `;
}

function hashPrompt(prompt) {
  let hash = 0;
  for (let i = 0; i < prompt.length; i += 1) {
    hash = (hash << 5) - hash + prompt.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function makeImagineSvg(prompt, duration = state.imagineDuration, referenceImage = null) {
  const caption = sentenceFromPrompt(prompt);
  const seed = hashPrompt(prompt.toLowerCase());
  const uid = `${seed}${state.messages.length}`;
  const allowedDurations = [6, 10, 20, 60, 300, 1800, 3600, 7200];
  const videoDuration = allowedDurations.includes(Number(duration)) ? Number(duration) : 60;
  const durationLabel = formatDuration(videoDuration);
  const hasReference = Boolean(referenceImage);
  const palettes = [
    ["#080b11", "#3fc8b4", "#f1b84b", "#70a7ff", "#ffffff"],
    ["#100b16", "#ef6b7b", "#8bd5ff", "#f7f3d2", "#ffffff"],
    ["#07120e", "#a7d36f", "#6ee7c7", "#d8e9ff", "#ffffff"],
    ["#151016", "#f1b84b", "#ef6b7b", "#ffffff", "#8bd5ff"],
    ["#070b1a", "#7c5cff", "#3fc8b4", "#f1b84b", "#ffffff"]
  ];
  const palette = palettes[seed % palettes.length];
  const lower = prompt.toLowerCase();
  const isSpace = /space|star|planet|galaxy|moon|cosmic|alien/.test(lower);
  const isCity = /city|street|building|neon|cyber|tower/.test(lower);
  const isNature = /forest|tree|mountain|lake|ocean|flower|garden|sunset/.test(lower);
  const isCreature = /dragon|monster|robot|character|creature|animal/.test(lower);
  const isLogo = /logo|brand|icon|symbol|mark/.test(lower);

  const captionLines = caption.split(" ").reduce((lines, word) => {
    const last = lines[lines.length - 1] || "";
    if ((last + " " + word).trim().length > 34 && lines.length < 2) {
      lines.push(word);
    } else {
      lines[lines.length - 1] = (last + " " + word).trim();
    }
    return lines;
  }, [""]).map((line, index) => {
    return `<tspan x="64" dy="${index === 0 ? 0 : 38}">${escapeHtml(line)}</tspan>`;
  }).join("");

  const particles = Array.from({ length: 42 }, (_, index) => {
    const x = (seed * (index + 13)) % 920;
    const y = (seed * (index + 29)) % 500;
    const size = 2 + ((seed + index * 7) % 9);
    return `<circle cx="${x}" cy="${y}" r="${size}" fill="${palette[(index % 4) + 1]}" opacity="${0.12 + (index % 5) * 0.08}"/>`;
  }).join("");

  const lightRays = Array.from({ length: 10 }, (_, index) => {
    const x1 = 80 + index * 95;
    const y1 = 40 + ((seed + index * 23) % 180);
    const x2 = x1 + 120 + ((seed + index * 17) % 90);
    const y2 = 520 - ((seed + index * 31) % 170);
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${palette[(index % 3) + 1]}" stroke-width="2" opacity=".18"/>`;
  }).join("");

  const skyline = Array.from({ length: 14 }, (_, index) => {
    const width = 42 + ((seed + index * 19) % 38);
    const height = 80 + ((seed + index * 31) % 210);
    const x = index * 70 - 24;
    const y = 500 - height;
    const windows = Array.from({ length: 5 }, (_, win) => {
      const wx = x + 10 + (win % 2) * 18;
      const wy = y + 18 + win * 28;
      return wy < 492 ? `<rect x="${wx}" y="${wy}" width="8" height="13" rx="2" fill="${palette[4]}" opacity=".52"/>` : "";
    }).join("");
    return `<g><rect x="${x}" y="${y}" width="${width}" height="${height}" rx="6" fill="${palette[index % 4]}" opacity=".64"/>${windows}</g>`;
  }).join("");

  const nature = `
    <circle cx="760" cy="132" r="78" fill="${palette[2]}" opacity=".78"/>
    <path d="M0 370 C130 275 225 320 330 235 C445 142 530 265 625 190 C735 96 810 190 960 105 L960 540 L0 540 Z" fill="${palette[3]}" opacity=".36"/>
    <path d="M0 430 C180 350 270 405 400 315 C520 235 650 355 790 265 C865 220 910 245 960 212 L960 540 L0 540 Z" fill="${palette[1]}" opacity=".52"/>
    <path d="M0 472 C120 425 260 462 390 420 C535 373 690 432 830 390 C900 368 930 380 960 366 L960 540 L0 540 Z" fill="${palette[0]}" opacity=".58"/>
    <g opacity=".8">
      <path d="M160 438 l36 -90 l36 90 Z" fill="${palette[2]}"/>
      <path d="M235 448 l46 -124 l46 124 Z" fill="${palette[1]}"/>
      <path d="M720 448 l42 -116 l42 116 Z" fill="${palette[2]}"/>
    </g>
  `;

  const creature = `
    <path d="M285 294 C188 222 160 138 228 90 C310 132 368 196 405 275 Z" fill="${palette[2]}" opacity=".62"/>
    <path d="M610 292 C710 215 782 150 850 116 C850 214 780 302 650 334 Z" fill="${palette[3]}" opacity=".52"/>
    <ellipse cx="488" cy="315" rx="155" ry="94" fill="${palette[1]}" opacity=".9"/>
    <circle cx="620" cy="262" r="66" fill="${palette[2]}" opacity=".95"/>
    <path d="M570 185 L620 78 L680 190 Z" fill="${palette[3]}" opacity=".88"/>
    <path d="M395 252 L285 192 L340 332 Z" fill="${palette[3]}" opacity=".76"/>
    <circle cx="642" cy="246" r="11" fill="${palette[0]}"/>
    <path d="M660 282 C725 294 780 322 835 382" fill="none" stroke="${palette[4]}" stroke-width="8" stroke-linecap="round" opacity=".42"/>
  `;

  const space = `
    <circle cx="710" cy="178" r="88" fill="${palette[2]}" opacity=".9"/>
    <circle cx="745" cy="146" r="88" fill="${palette[0]}" opacity=".58"/>
    <ellipse cx="710" cy="185" rx="165" ry="31" fill="none" stroke="${palette[3]}" stroke-width="6" opacity=".64"/>
    <path d="M120 385 C245 305 300 310 420 230 C540 150 635 205 780 95" fill="none" stroke="${palette[1]}" stroke-width="5" opacity=".32"/>
    <path d="M155 92 l22 45 l50 8 l-36 35 l9 50 l-45 -24 l-45 24 l9 -50 l-36 -35 l50 -8 Z" fill="${palette[4]}" opacity=".58"/>
  `;

  const logo = `
    <circle cx="480" cy="260" r="148" fill="${palette[1]}" opacity=".24"/>
    <circle cx="480" cy="260" r="112" fill="none" stroke="${palette[2]}" stroke-width="12" opacity=".88"/>
    <path d="M480 138 L585 320 H375 Z" fill="${palette[3]}" opacity=".84"/>
    <circle cx="480" cy="260" r="34" fill="${palette[4]}" opacity=".92"/>
    <path d="M230 260 H730 M480 82 V438" stroke="${palette[1]}" stroke-width="4" opacity=".42"/>
  `;

  const abstract = `
    <circle cx="480" cy="260" r="172" fill="none" stroke="${palette[1]}" stroke-width="18" opacity=".52"/>
    <circle cx="480" cy="260" r="112" fill="none" stroke="${palette[2]}" stroke-width="8" opacity=".76"/>
    <path d="M218 378 C332 158 520 112 742 186 C630 230 593 375 692 470 C518 424 378 452 218 378 Z" fill="${palette[3]}" opacity=".46"/>
    <path d="M302 154 L712 385" stroke="${palette[4]}" stroke-width="5" opacity=".5"/>
  `;

  const scene = isLogo ? logo : isCreature ? creature : isNature ? nature : isSpace ? space : isCity ? skyline : `${abstract}${skyline}`;
  const referenceClip = hasReference
    ? `<clipPath id="refClip${uid}"><rect x="276" y="102" width="408" height="262" rx="22"/></clipPath>`
    : "";
  const referenceLayer = hasReference
    ? `
      <g class="reference-frame">
        <rect x="256" y="82" width="448" height="302" rx="28" fill="rgba(255,255,255,.12)" stroke="${palette[4]}" stroke-width="3" opacity=".7"/>
        <image href="${referenceImage}" x="276" y="102" width="408" height="262" preserveAspectRatio="xMidYMid slice" clip-path="url(#refClip${uid})" opacity=".82"/>
        <rect x="276" y="102" width="408" height="262" rx="22" fill="none" stroke="${palette[2]}" stroke-width="3" opacity=".72"/>
      </g>
    `
    : "";

  return `
    <svg class="imagine-art imagine-video" viewBox="0 0 960 540" role="img" aria-label="Generated video preview">
      <defs>
        <linearGradient id="imagineBg${uid}" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="${palette[0]}"/>
          <stop offset="45%" stop-color="${palette[1]}" stop-opacity=".38"/>
          <stop offset="100%" stop-color="${palette[2]}" stop-opacity=".82"/>
        </linearGradient>
        <radialGradient id="hotspot${uid}" cx="50%" cy="42%" r="60%">
          <stop offset="0%" stop-color="${palette[4]}" stop-opacity=".32"/>
          <stop offset="45%" stop-color="${palette[1]}" stop-opacity=".16"/>
          <stop offset="100%" stop-color="${palette[0]}" stop-opacity="0"/>
        </radialGradient>
        <filter id="glow${uid}">
          <feGaussianBlur stdDeviation="9" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <filter id="softShadow${uid}">
          <feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#000000" flood-opacity=".55"/>
        </filter>
        ${referenceClip}
      </defs>
      <style>
        #videoScene${uid} .bg-pan {
          animation: bgPan${uid} ${videoDuration}s ease-in-out infinite alternate;
          transform-origin: 480px 270px;
        }
        #videoScene${uid} .spark-layer {
          animation: sparkle${uid} ${Math.max(3, videoDuration / 2)}s ease-in-out infinite alternate;
          transform-origin: 480px 270px;
        }
        #videoScene${uid} .ray-layer {
          animation: rayDrift${uid} ${videoDuration}s linear infinite;
        }
        #videoScene${uid} .main-scene {
          animation: cameraMove${uid} ${videoDuration}s ease-in-out infinite alternate;
          transform-origin: 480px 270px;
        }
        #videoScene${uid} .reference-frame {
          animation: refFloat${uid} ${Math.max(5, videoDuration / 3)}s ease-in-out infinite alternate;
          transform-origin: 480px 244px;
        }
        #videoScene${uid} .title-card {
          animation: titlePulse${uid} ${Math.max(4, videoDuration / 2)}s ease-in-out infinite alternate;
        }
        @keyframes bgPan${uid} {
          from { transform: scale(1) translate(-8px, -4px); opacity: .92; }
          to { transform: scale(1.08) translate(10px, 8px); opacity: 1; }
        }
        @keyframes sparkle${uid} {
          from { transform: translateX(-12px) translateY(8px); opacity: .45; }
          to { transform: translateX(16px) translateY(-10px); opacity: 1; }
        }
        @keyframes rayDrift${uid} {
          from { transform: translateX(-140px); opacity: .25; }
          50% { opacity: .7; }
          to { transform: translateX(140px); opacity: .25; }
        }
        @keyframes cameraMove${uid} {
          from { transform: scale(1) translateX(-10px); }
          to { transform: scale(1.06) translateX(12px); }
        }
        @keyframes refFloat${uid} {
          from { transform: scale(.98) rotate(-1deg); opacity: .72; }
          to { transform: scale(1.03) rotate(1deg); opacity: .95; }
        }
        @keyframes titlePulse${uid} {
          from { opacity: .82; }
          to { opacity: 1; }
        }
      </style>
      <g id="videoScene${uid}">
      <rect width="960" height="540" fill="url(#imagineBg${uid})"/>
      <rect class="bg-pan" width="960" height="540" fill="url(#hotspot${uid})"/>
      <g class="spark-layer" opacity=".9">${particles}</g>
      <g class="ray-layer">${lightRays}</g>
      <g class="main-scene" filter="url(#softShadow${uid})">
        <g filter="url(#glow${uid})">${scene}</g>
      </g>
      ${referenceLayer}
      <path d="M34 58 C222 26 382 50 520 32 C690 10 786 42 926 28" fill="none" stroke="${palette[4]}" stroke-width="2" opacity=".26"/>
      <rect x="34" y="34" width="892" height="472" rx="20" fill="none" stroke="rgba(255,255,255,.32)" stroke-width="2"/>
      <g class="title-card">
        <rect x="50" y="394" width="860" height="92" rx="16" fill="rgba(0,0,0,.42)"/>
        <text x="64" y="430" fill="${palette[4]}" font-size="18" font-weight="800" font-family="Arial, sans-serif" opacity=".8">AI COUNCIL IMAGINE VIDEO${hasReference ? " - REF PIC" : ""}</text>
        <text x="64" y="462" fill="#ffffff" font-size="30" font-weight="900" font-family="Arial, sans-serif">${captionLines}</text>
      </g>
      <rect x="64" y="512" width="832" height="8" rx="4" fill="rgba(255,255,255,.18)"/>
      <rect x="64" y="512" width="0" height="8" rx="4" fill="${palette[2]}">
        <animate attributeName="width" from="0" to="832" dur="${videoDuration}s" repeatCount="indefinite"/>
      </rect>
      <circle cx="70" cy="72" r="13" fill="${palette[2]}">
        <animate attributeName="opacity" values=".45;1;.45" dur="1.2s" repeatCount="indefinite"/>
      </circle>
      <text x="92" y="80" fill="#ffffff" font-size="22" font-weight="900" font-family="Arial, sans-serif">${durationLabel.toUpperCase()}</text>
      </g>
    </svg>
  `;
}

function submitImagine(prompt) {
  const request = parseImagineRequest(prompt);
  const safePrompt = escapeHtml(prompt);
  const safeSubject = escapeHtml(request.subject);
  const duration = request.duration;
  const durationLabel = formatDuration(duration);
  state.imagineDuration = duration;
  renderDurationButtons();
  const referenceImage = state.imagineImage;
  const referenceHtml = referenceImage
    ? `<img class="uploaded-picture imagine-ref-display" src="${referenceImage}" alt="Imagine reference picture">`
    : "";
  state.messages.push({
    role: "user",
    html: `<strong>You</strong>${referenceHtml}<p>${safePrompt}</p>`
  });
  clearImagineImage();
  renderMessages();

  window.setTimeout(() => {
    state.messages.push({
      role: "ai",
      html: `
        <strong>AI Council Imagine</strong>
        ${referenceImage ? `<div class="reference-strip"><img src="${referenceImage}" alt="Reference picture"><span>Reference picture used for the video mood, subject, and colors.</span></div>` : ""}
        <div class="imagine-brief">
          <div><span>Duration</span><strong>${durationLabel}</strong></div>
          <div><span>Subject</span><strong>${safeSubject}</strong></div>
          <div><span>Motion</span><strong>${escapeHtml(request.motion)}</strong></div>
          <div><span>Style</span><strong>${escapeHtml(request.style)}</strong></div>
        </div>
        <p>I read your prompt like a video request, then built the preview from that.</p>
        ${makeImagineSvg(request.subject, duration, referenceImage)}
      `
    });
    renderMessages();
  }, 320);
}

function clearAttachedImage() {
  state.attachedImage = null;
  pictureInput.value = "";
  attachedPicturePreview.removeAttribute("src");
  attachedPicture.hidden = true;
}

function clearImagineImage() {
  state.imagineImage = null;
  imaginePictureInput.value = "";
  imaginePicturePreview.removeAttribute("src");
  imagineReference.hidden = true;
}

function submitPrompt(prompt) {
  const safePrompt = escapeHtml(prompt);
  const imageHtml = state.attachedImage
    ? `<img class="uploaded-picture" src="${state.attachedImage}" alt="Uploaded picture">`
    : "";
  state.messages.push({
    role: "user",
    html: `<strong>You</strong>${imageHtml}<p>${safePrompt || "Picture only"}</p>`
  });
  const hadImage = Boolean(state.attachedImage);
  clearAttachedImage();
  renderMessages();

  window.setTimeout(() => {
    state.messages.push({
      role: "ai",
      html: hadImage ? makeImageResponse(prompt) : makeHtmlResponse(prompt)
    });
    renderMessages();
  }, 260);
}

composer.addEventListener("submit", (event) => {
  event.preventDefault();
  const prompt = promptInput.value.trim();
  if (!prompt && !state.attachedImage) return;
  promptInput.value = "";
  promptInput.style.height = "auto";
  submitPrompt(prompt);
});

pictureButton.addEventListener("click", () => {
  pictureInput.click();
});

pictureInput.addEventListener("change", () => {
  const file = pictureInput.files && pictureInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    state.attachedImage = reader.result;
    attachedPicturePreview.src = reader.result;
    attachedPicture.hidden = false;
  });
  reader.readAsDataURL(file);
});

removePicture.addEventListener("click", () => {
  clearAttachedImage();
});

imaginePictureButton.addEventListener("click", () => {
  imaginePictureInput.click();
});

imaginePictureInput.addEventListener("change", () => {
  const file = imaginePictureInput.files && imaginePictureInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    if (typeof reader.result !== "string" || !reader.result.startsWith("data:image/")) return;
    state.imagineImage = reader.result;
    imaginePicturePreview.src = reader.result;
    imagineReference.hidden = false;
  });
  reader.readAsDataURL(file);
});

removeImaginePicture.addEventListener("click", () => {
  clearImagineImage();
});

imagineDurationButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.imagineDuration = Number(button.dataset.duration);
    renderDurationButtons();
  });
});

imagineComposer.addEventListener("submit", (event) => {
  event.preventDefault();
  const prompt = imagineInput.value.trim();
  if (!prompt && !state.imagineImage) return;
  imagineInput.value = "";
  submitImagine(prompt || "animate this reference picture");
});

promptInput.addEventListener("input", () => {
  promptInput.style.height = "auto";
  promptInput.style.height = `${promptInput.scrollHeight}px`;
});

promptInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    composer.requestSubmit();
  }
});

clearChat.addEventListener("click", () => {
  state.messages = [];
  seedGreeting();
  renderMessages();
});

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  installPromptEvent = event;
  installApp.hidden = false;
});

installApp.addEventListener("click", async () => {
  if (!installPromptEvent) return;
  installPromptEvent.prompt();
  await installPromptEvent.userChoice;
  installPromptEvent = null;
  installApp.hidden = true;
});

window.addEventListener("appinstalled", () => {
  installPromptEvent = null;
  installApp.hidden = true;
});

if ("serviceWorker" in navigator && ["http:", "https:"].includes(window.location.protocol)) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}

function seedGreeting() {
  state.messages.push({
    role: "ai",
    html: `
      <strong>AI Council</strong>
      <p>Hey, I am here. Talk to me normally. The council will answer like different people in one room: clear, careful, funny, technical, visual, and research-minded. You can insert a picture, type with it, or use Imagine with a reference pic to make animated previews from 6 seconds up to 2 hours.</p>
    `
  });
}

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const scale = window.devicePixelRatio || 1;
  canvas.width = Math.floor(rect.width * scale);
  canvas.height = Math.floor(rect.height * scale);
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
}

function drawSignal(time = 0) {
  const rect = canvas.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;
  const pulseColor = "#3fc8b4";

  ctx.clearRect(0, 0, width, height);
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "rgba(255,255,255,0.08)");
  gradient.addColorStop(1, `${pulseColor}33`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  const nodes = 22;
  const points = [];
  for (let i = 0; i < nodes; i += 1) {
    const x = (width / (nodes - 1)) * i;
    const wave = Math.sin(time / 700 + i * 0.75) * 28;
    const y = height * 0.48 + wave + Math.cos(time / 980 + i) * 14;
    points.push({ x, y });
  }

  ctx.lineWidth = 1;
  for (let i = 0; i < points.length - 1; i += 1) {
    ctx.strokeStyle = i % 2 ? `${pulseColor}66` : "rgba(255,255,255,0.16)";
    ctx.beginPath();
    ctx.moveTo(points[i].x, points[i].y);
    ctx.lineTo(points[i + 1].x, points[i + 1].y);
    ctx.stroke();
  }

  points.forEach((point, index) => {
    ctx.beginPath();
    ctx.fillStyle = index % 3 === 0 ? pulseColor : "rgba(255,255,255,0.75)";
    ctx.arc(point.x, point.y, index % 3 === 0 ? 3.8 : 2.4, 0, Math.PI * 2);
    ctx.fill();
  });

  requestAnimationFrame(drawSignal);
}

window.addEventListener("resize", resizeCanvas);
seedGreeting();
render();
resizeCanvas();
drawSignal();
