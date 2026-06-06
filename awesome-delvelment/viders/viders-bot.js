const VIDERS_BOT_PUBLISHER = "Awesome Delvelement";

const vidersBotAnswers = [
  {
    keys: ["publisher", "published by", "who made", "who owns", "developer", "development", "delvelement", "delvelment", "awesome", "connect", "contact"],
    answer: `The Viders Bot update publisher is ${VIDERS_BOT_PUBLISHER}.`
  },
  {
    keys: ["upload", "post", "video", "file"],
    answer:
      "To post a video, sign in, unlock Viders, Creator, Premium, or Ultimate, then open Studio. You can paste a video link or choose a video file from your device."
  },
  {
    keys: ["delete", "remove video", "own video"],
    answer:
      "You can delete videos you made from Creator Studio. Viders only lets you delete your own uploads, not other people's videos."
  },
  {
    keys: ["parent", "child", "children", "pin", "kid"],
    answer:
      "Parent Controls live on the separate Parents page. You can make a PIN, connect multiple child accounts, set bedtime, add blocked words, and remove children from the list."
  },
  {
    keys: ["multiple", "multi", "more than one"],
    answer:
      "Parent Controls can connect multiple child accounts now. Add each child one at a time, or use the current Viders account shortcut."
  },
  {
    keys: ["plan", "pro", "premium", "creator", "ultimate", "viders plan"],
    answer:
      "Viewer watches free. Viders posts videos. Creator posts and creates ads. Pro removes ads but does not create. Premium posts and watches ad-free. Ultimate does everything."
  },
  {
    keys: ["discount", "code", "free"],
    answer:
      "Discount codes stay private, so Viders Bot will not reveal them publicly. Use the Discount Center if you already have a private code."
  },
  {
    keys: ["ad", "ads", "commercial"],
    answer:
      "Long videos can show ads for viewers and creators. Pro, Premium, and Ultimate watch without ads. Creator and Ultimate can make creator ads."
  },
  {
    keys: ["sign", "login", "account"],
    answer:
      "Viewers can watch without signing in. Sign in only when you want plans, subscriptions, uploads, ads, or your My Viders history."
  },
  {
    keys: ["subscribe", "subscription"],
    answer:
      "Sign in first, then press Subscribe on a channel. Your subscriptions stay saved on this device."
  },
  {
    keys: ["install", "app", "phone", "tablet", "home screen"],
    answer:
      "Use the Install app button on Viders, or use your browser menu to add Viders to your home screen. It will open like a regular app."
  },
  {
    keys: ["watch", "play", "not playing"],
    answer:
      "Open Videos, pick a video, then press play in the player. If the browser blocks autoplay, tap the video once to start it."
  },
  {
    keys: ["trailer", "update"],
    answer: `The Viders Bot update is published by ${VIDERS_BOT_PUBLISHER}. The update trailer shows off the separate Parent Controls site and the new multiple-child account feature.`
  }
];

const vidersBotQuickPrompts = [
  "How do I upload?",
  "Latest creator uploads",
  "Top creator rankings",
  "What do plans do?",
  "Parent controls",
  "Install app"
];

const vidersBotFeaturedUploads = [
  {
    id: "skyline-sprint",
    title: "Skyline Sprint Build Montage",
    channel: "Viders",
    category: "Gaming",
    uploadedAt: "2 days ago",
    views: 0,
    length: "12:41"
  },
  {
    id: "midnight-beats",
    title: "Midnight Beats Rooftop Session",
    channel: "Viders",
    category: "Music",
    uploadedAt: "5 days ago",
    views: 0,
    length: "08:32"
  },
  {
    id: "studio-tour",
    title: "Inside My Tiny Design Studio",
    channel: "Viders",
    category: "Design",
    uploadedAt: "1 week ago",
    views: 0,
    length: "10:09"
  },
  {
    id: "smart-home-hacks",
    title: "Smart Home Tricks That Actually Help",
    channel: "Viders",
    category: "Tech",
    uploadedAt: "3 days ago",
    views: 0,
    length: "14:25"
  },
  {
    id: "weekend-reset",
    title: "Weekend Reset Routine",
    channel: "Viders",
    category: "Lifestyle",
    uploadedAt: "6 days ago",
    views: 0,
    length: "09:18"
  },
  {
    id: "math-energy",
    title: "Math Tricks With Real Energy",
    channel: "Viders",
    category: "Education",
    uploadedAt: "4 days ago",
    views: 0,
    length: "11:56"
  }
];

function escapeBotHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function normalizeBotText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getSavedVidersState() {
  try {
    return JSON.parse(localStorage.getItem("viders.state") || "null") || {};
  } catch {
    return {};
  }
}

function formatBotNumber(value) {
  const numberValue = Number(value || 0);
  return new Intl.NumberFormat("en-US", {
    notation: numberValue >= 1000 ? "compact" : "standard",
    maximumFractionDigits: 1
  }).format(numberValue);
}

function normalizeBotUpload(video, source = "Viders") {
  if (!video || typeof video !== "object") {
    return null;
  }

  const title = String(video.title || "").trim();
  const channel = String(video.channel || video.owner || "Viders").trim();

  if (!title && !channel) {
    return null;
  }

  return {
    id: String(video.id || `${channel}-${title}`).trim(),
    title: title || "Untitled upload",
    channel: channel || "Viders",
    owner: String(video.owner || channel || "Viders").trim(),
    category: String(video.category || "Video").trim(),
    uploadedAt: String(video.uploadedAt || "recently").trim(),
    views: Number(video.views || 0),
    subscribers: Number(video.subscribers || 0),
    length: String(video.length || "00:00").trim(),
    description: String(video.description || "").trim(),
    source
  };
}

function mergeBotUploads(...collections) {
  const merged = [];
  const seen = new Set();

  collections.flat().forEach((video) => {
    const upload = normalizeBotUpload(video, video?.source || "Viders");
    if (!upload) {
      return;
    }

    const key = `${normalizeBotText(upload.channel)}:${normalizeBotText(upload.title)}`;
    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    merged.push(upload);
  });

  return merged;
}

async function getHostedBotUploads() {
  try {
    const response = await fetch(`videos-manifest.json?bot=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) {
      return [];
    }

    const payload = await response.json();
    return Array.isArray(payload?.videos) ? payload.videos : [];
  } catch {
    return [];
  }
}

async function getKnownBotUploads() {
  const savedState = getSavedVidersState();
  const localUploads = Array.isArray(savedState.uploads) ? savedState.uploads : [];
  const hostedUploads = await getHostedBotUploads();
  const viewBoosts = savedState.viewBoosts && typeof savedState.viewBoosts === "object" ? savedState.viewBoosts : {};
  const withCurrentViews = (video) => ({
    ...video,
    views: Number(video.views || 0) + Number(viewBoosts[video.id] || 0)
  });

  return mergeBotUploads(
    localUploads.map((video) => ({ ...withCurrentViews(video), source: "Saved on this device" })),
    hostedUploads.map((video) => ({ ...withCurrentViews(video), source: "Live Viders site" })),
    vidersBotFeaturedUploads.map((video) => ({ ...withCurrentViews(video), source: "Featured Viders video" }))
  );
}

function isCreatorUploadQuestion(question) {
  const normalizedQuestion = normalizeBotText(question);
  const asksHowToUpload =
    /\b(how|where|can i|how do i|help me|put|make|create)\b/.test(normalizedQuestion) &&
    /\b(upload|post|file)\b/.test(normalizedQuestion) &&
    !/\b(youtuber|creator|channel|latest|new|who|what|their|uploads)\b/.test(normalizedQuestion);

  if (asksHowToUpload) {
    return false;
  }

  return /\b(youtuber|youtube|creator|channel|uploads|uploaded|posted|latest uploads|new videos|who uploaded|what did|top|rank|ranking|number 1|place)\b/.test(
    normalizedQuestion
  );
}

function findRequestedBotChannel(question, uploads) {
  const normalizedQuestion = normalizeBotText(question);
  const channels = [...new Set(uploads.map((video) => video.channel).filter(Boolean))].sort(
    (left, right) => right.length - left.length
  );

  return channels.find((channel) => normalizedQuestion.includes(normalizeBotText(channel))) || "";
}

function formatBotUploadList(uploads) {
  return uploads
    .slice(0, 6)
    .map((video, index) => {
      const rankLabel = video.rank ? `#${video.rank}` : `${index + 1}.`;
      const detailParts = [
        video.category,
        video.length,
        video.uploadedAt,
        `${formatBotNumber(video.views)} views`
      ]
        .filter(Boolean)
        .join(" - ");
      return `${rankLabel} "${video.title}" by ${video.channel}${detailParts ? ` (${detailParts})` : ""}`;
    })
    .join("\n");
}

function getRankedBotUploads(uploads) {
  return [...uploads]
    .sort((left, right) => {
      const viewDifference = Number(right.views || 0) - Number(left.views || 0);
      if (viewDifference) {
        return viewDifference;
      }

      return normalizeBotText(left.title).localeCompare(normalizeBotText(right.title));
    })
    .map((video, index) => ({ ...video, rank: index + 1 }));
}

function getRankedBotChannels(uploads) {
  const channels = new Map();

  uploads.forEach((video) => {
    const channelName = video.channel || "Viders";
    if (!channels.has(channelName)) {
      channels.set(channelName, {
        name: channelName,
        views: 0,
        videos: 0,
        subscribers: 0,
        topUpload: video
      });
    }

    const channel = channels.get(channelName);
    channel.views += Number(video.views || 0);
    channel.videos += 1;
    channel.subscribers = Math.max(channel.subscribers, Number(video.subscribers || 0));
    if (Number(video.views || 0) >= Number(channel.topUpload.views || 0)) {
      channel.topUpload = video;
    }
  });

  return [...channels.values()]
    .sort((left, right) => {
      const viewDifference = Number(right.views || 0) - Number(left.views || 0);
      if (viewDifference) {
        return viewDifference;
      }

      const subscriberDifference = Number(right.subscribers || 0) - Number(left.subscribers || 0);
      if (subscriberDifference) {
        return subscriberDifference;
      }

      return left.name.localeCompare(right.name);
    })
    .map((channel, index) => ({ ...channel, rank: index + 1 }));
}

function isRankingQuestion(question) {
  return /\b(top|rank|ranking|number 1|#1|place|leaderboard|where)\b/.test(normalizeBotText(question));
}

async function getCreatorUploadAnswer(question) {
  const uploads = await getKnownBotUploads();
  if (!uploads.length) {
    return "I do not see any Viders uploads yet. Once creators post videos, I can list their titles, channels, categories, and upload dates.";
  }

  const requestedChannel = findRequestedBotChannel(question, uploads);
  const rankedUploads = getRankedBotUploads(uploads);
  const rankedChannels = getRankedBotChannels(uploads);
  const requestedChannelRank = requestedChannel
    ? rankedChannels.find((channel) => normalizeBotText(channel.name) === normalizeBotText(requestedChannel))
    : null;
  const filteredUploads = requestedChannel
    ? rankedUploads.filter((video) => normalizeBotText(video.channel) === normalizeBotText(requestedChannel))
    : rankedUploads;
  const uploadedCount = filteredUploads.length;
  const channelLabel = requestedChannel ? `${requestedChannel}'s uploads` : "creator uploads I know about";

  if (!uploadedCount) {
    return `I know about ${uploads.length} Viders upload${uploads.length === 1 ? "" : "s"}, but I could not find that creator name. Try asking for "latest creator uploads" or type the exact channel name.`;
  }

  if (isRankingQuestion(question)) {
    const topChannels = rankedChannels
      .slice(0, 5)
      .map(
        (channel) =>
          `#${channel.rank} ${channel.name}: ${channel.videos} video${channel.videos === 1 ? "" : "s"}, ${formatBotNumber(channel.views)} views, top upload "${channel.topUpload.title}"`
      )
      .join("\n");
    const channelRankLine = requestedChannelRank
      ? `\n\n${requestedChannel} is #${requestedChannelRank.rank} in top channels by current Viders views.`
      : "";

    return `Top Viders content creators by current views:\n${topChannels}${channelRankLine}\n\nTop uploads:\n${formatBotUploadList(filteredUploads)}\n\nRankings use Viders' current saved views and feed data. I do not make up YouTube numbers.`;
  }

  return `I found ${uploadedCount} ${channelLabel} on Viders:\n${formatBotUploadList(filteredUploads)}\n\nFor top positions, ask "top creator rankings" or "where is [creator] in the top." I can track uploads saved on this device, live uploads in the Viders manifest, and featured Viders videos. Real YouTube channel uploads would need a YouTube connection later.`;
}

async function getVidersBotAnswer(question) {
  const normalizedQuestion = String(question || "").toLowerCase();

  if (isCreatorUploadQuestion(question)) {
    return getCreatorUploadAnswer(question);
  }

  const matchedAnswer = vidersBotAnswers.find((item) =>
    item.keys.some((key) => normalizedQuestion.includes(key))
  );

  if (matchedAnswer) {
    return matchedAnswer.answer;
  }

  return "I can help with Viders videos, uploads, creator rankings, plans, ads, discounts, installing the app, watching videos, and Parent Controls. Try asking: Top creator rankings.";
}

function createBotMessage(message, speaker) {
  const item = document.createElement("article");
  item.className = `viders-bot-message ${speaker === "user" ? "is-user" : "is-bot"}`;
  item.innerHTML = `<span>${speaker === "user" ? "You" : "Viders Bot"}</span><p>${escapeBotHtml(message)}</p>`;
  return item;
}

function addBotMessage(messages, message, speaker = "bot") {
  messages.append(createBotMessage(message, speaker));
  messages.scrollTop = messages.scrollHeight;
}

function initVidersBot() {
  if (document.querySelector("#vidersBot")) {
    return;
  }

  const bot = document.createElement("section");
  bot.className = "viders-bot";
  bot.id = "vidersBot";
  bot.innerHTML = `
    <button class="viders-bot-toggle" id="vidersBotToggle" type="button" aria-label="Open Viders Bot">
      <span>V</span>
      <strong>Bot</strong>
    </button>
    <div class="viders-bot-panel hidden" id="vidersBotPanel">
      <div class="viders-bot-header">
        <div>
          <p class="eyebrow">Viders helper</p>
          <h3>Viders Bot</h3>
          <p class="viders-bot-publisher">Publisher: ${VIDERS_BOT_PUBLISHER}</p>
        </div>
        <button class="modal-close" id="vidersBotClose" type="button" aria-label="Close Viders Bot">x</button>
      </div>
      <button class="ghost-button small-button viders-bot-connect" id="vidersBotPublisherConnect" type="button">
        Connect to ${VIDERS_BOT_PUBLISHER}
      </button>
      <div class="viders-bot-messages" id="vidersBotMessages"></div>
      <div class="viders-bot-prompts">
        ${vidersBotQuickPrompts
          .map((prompt) => `<button class="ghost-button small-button" type="button" data-bot-prompt="${escapeBotHtml(prompt)}">${escapeBotHtml(prompt)}</button>`)
          .join("")}
      </div>
      <form class="viders-bot-form" id="vidersBotForm">
        <input id="vidersBotInput" type="text" placeholder="Ask Viders Bot..." autocomplete="off" />
        <button class="primary-button small-button" type="submit">Send</button>
      </form>
    </div>
  `;

  document.body.append(bot);

  const panel = bot.querySelector("#vidersBotPanel");
  const messages = bot.querySelector("#vidersBotMessages");
  const form = bot.querySelector("#vidersBotForm");
  const input = bot.querySelector("#vidersBotInput");

  const openBot = () => {
    panel.classList.remove("hidden");
    bot.classList.add("is-open");
    input.focus();
  };

  const closeBot = () => {
    panel.classList.add("hidden");
    bot.classList.remove("is-open");
  };

  bot.querySelector("#vidersBotToggle").addEventListener("click", () => {
    if (panel.classList.contains("hidden")) {
      openBot();
    } else {
      closeBot();
    }
  });

  bot.querySelector("#vidersBotClose").addEventListener("click", closeBot);

  bot.querySelector("#vidersBotPublisherConnect").addEventListener("click", () => {
    openBot();
    addBotMessage(messages, `Connected to ${VIDERS_BOT_PUBLISHER}. Tell me what you need: app help, publisher info, uploads, plans, ads, or Parent Controls.`);
  });

  bot.querySelectorAll("[data-bot-prompt]").forEach((button) => {
    button.addEventListener("click", () => {
      input.value = button.dataset.botPrompt;
      form.requestSubmit();
    });
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const question = input.value.trim();
    if (!question) {
      return;
    }

    addBotMessage(messages, question, "user");
    input.value = "";
    const thinkingMessage = createBotMessage("Checking Viders uploads...", "bot");
    messages.append(thinkingMessage);
    messages.scrollTop = messages.scrollHeight;

    const answer = await getVidersBotAnswer(question);
    window.setTimeout(() => {
      thinkingMessage.remove();
      addBotMessage(messages, answer);
    }, 180);
  });

  addBotMessage(messages, `Hi, I am Viders Bot. This update is published by ${VIDERS_BOT_PUBLISHER}. I know about uploads, plans, ads, discounts, installing the app, watching videos, Parent Controls, and Viders creator upload rankings.`);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initVidersBot);
} else {
  initVidersBot();
}
