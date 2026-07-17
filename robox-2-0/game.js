(() => {
  'use strict';

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const escapeHTML = value => String(value).replace(/[&<>'"]/g, character => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' })[character]);
  const appConfig = window.ROBOX_CONFIG || {};
  let incomingSkinPayload = (() => {
    if (!window.location.hash.startsWith('#skin=')) return null;
    try {
      const encoded = window.location.hash.slice(6).replace(/-/g, '+').replace(/_/g, '/');
      const padded = encoded + '='.repeat((4 - encoded.length % 4) % 4);
      const bytes = Uint8Array.from(atob(padded), character => character.charCodeAt(0));
      return JSON.parse(new TextDecoder().decode(bytes));
    } catch (_) { return null; }
  })();
  const maintenancePreview = new URLSearchParams(window.location.search).get('maintenance') === '1';
  if (appConfig.maintenance || maintenancePreview) {
    $('#maintenanceMessage').textContent = appConfig.maintenanceMessage || "Robox 2.0 is temporarily unavailable while we're making an update. Please check back soon.";
    $('#maintenanceScreen').classList.add('show');
  }
  const worldThemes = {
    grass: { label:'Grasslands', icon:'🌿', sky:['#69c8f2','#d7f3ee'], ground:'#62a84d', side:'#386f31', accent:'#ffd052' },
    desert: { label:'Desert', icon:'☀', sky:['#ed8a60','#ffd39b'], ground:'#d59b4b', side:'#9c632f', accent:'#52dce5' },
    moon: { label:'Moon', icon:'☾', sky:['#111a3a','#4a4774'], ground:'#7b8394', side:'#4a5061', accent:'#e1b94c' },
    neon: { label:'Neon', icon:'◇', sky:['#27104d','#a5269c'], ground:'#343b57', side:'#171c32', accent:'#54edff' }
  };
  const petCatalog = [
    { id:'cube-pup', name:'Cube Pup', type:'pup', icon:'🐶', price:50, color:'#d99a55', accent:'#7a4928', description:'A loyal blocky pup who loves every world.' },
    { id:'neon-kitty', name:'Neon Kitty', type:'cat', icon:'🐱', price:100, color:'#a95cff', accent:'#54edff', description:'A glowing cat with a bright cyan tail.' },
    { id:'moon-bot', name:'Moon Bot', type:'bot', icon:'🤖', price:150, color:'#8e9aaa', accent:'#f0cf62', description:'A tiny robot built for lunar adventures.' },
    { id:'tiny-dragon', name:'Tiny Dragon', type:'dragon', icon:'🐉', price:250, color:'#31bd83', accent:'#ff7e91', description:'A rare little dragon with colorful wings.' }
  ];
  const robuxBundles = [
    { amount:250, name:'Starter Stack', note:'Enough for a pet or a boost toward your designer pet.' },
    { amount:1000, name:'Designer Pack', note:'Perfect for making one custom pet right away.' },
    { amount:5000, name:'Mega Builder Vault', note:'Stock up for pets, designs, and future Robox items.' }
  ];

  const defaultProfile = (name = 'Guest_Player') => ({
    name, coins: 100, xp: 0, level: 1,
    skin: '#f5b640', shirt: '#7557ff', accent: '#55e6ff', pants: '#28325e', hairColor: '#2b1b18', hair: 'spikes', outfit: 'classic', face: 'smile',
    customSkins: [], equippedSkin: null,
    dailyClaimed: false, streak: 1, friends: [], worlds: [], deletedWorldIds: [], pets: [], customPets: [], equippedPet: null, ageVerified: false, ageGroup: null
  });
  const readSavedAccount = () => {
    try { return JSON.parse(localStorage.getItem('robox-account') || 'null'); }
    catch (_) { return null; }
  };
  const readAccounts = () => {
    let accounts = {};
    try {
      const stored = JSON.parse(localStorage.getItem('robox-accounts') || '{}');
      if (stored && typeof stored === 'object' && !Array.isArray(stored)) accounts = stored;
    } catch (_) { accounts = {}; }
    const current = readSavedAccount();
    if (current?.username && current.profile) {
      const key = current.username.toLowerCase();
      accounts[key] = current;
      localStorage.setItem('robox-accounts', JSON.stringify(accounts));
    }
    return accounts;
  };
  const writeAccounts = accounts => localStorage.setItem('robox-accounts', JSON.stringify(accounts));
  const rememberAccount = account => {
    const accounts = readAccounts();
    accounts[account.username.toLowerCase()] = account;
    writeAccounts(accounts);
    localStorage.setItem('robox-account', JSON.stringify(account));
  };
  const savedAccountList = () => Object.values(readAccounts()).filter(account => account?.username && account.profile);
  const readPublishedGames = () => {
    try {
      const games = JSON.parse(localStorage.getItem('robox-published-games') || '[]');
      return Array.isArray(games) ? games : [];
    } catch (_) { return []; }
  };
  const writePublishedGames = games => localStorage.setItem('robox-published-games', JSON.stringify(games));
  const readWorldLibrary = () => {
    try {
      const library = JSON.parse(localStorage.getItem('robox-world-library') || '{}');
      return library && typeof library === 'object' ? library : {};
    } catch (_) { return {}; }
  };
  const writeWorldLibrary = library => localStorage.setItem('robox-world-library', JSON.stringify(library));
  let profile = defaultProfile();
  let sessionMode = 'signed-out';
  let skinDraft = null;

  const saveProfile = () => {
    if (sessionMode === 'account') {
      rememberAccount({ username: profile.name, profile });
      const library = readWorldLibrary();
      library[profile.name.toLowerCase()] = {
        worlds: profile.worlds.map(world => ({ ...world })),
        deletedWorldIds: [...profile.deletedWorldIds],
        updatedAt: new Date().toISOString()
      };
      writeWorldLibrary(library);
    }
    updateProfileUI();
  };

  function updateProfileUI() {
    ['walletCoins', 'avatarCoins', 'petCoins', 'designerCoins', 'gameCoins', 'storeCoins'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = profile.coins; });
    $('#profileLevel').textContent = profile.level;
    $('#profileName').textContent = profile.name;
    $('#welcomeName').textContent = profile.name;
    document.documentElement.style.setProperty('--skin', profile.skin);
    document.documentElement.style.setProperty('--shirt', profile.shirt);
    document.documentElement.style.setProperty('--accent', profile.accent || '#55e6ff');
    document.documentElement.style.setProperty('--pants', profile.pants || '#28325e');
    document.documentElement.style.setProperty('--hair', profile.hairColor || '#2b1b18');
    $('#xpText').textContent = `${profile.xp} / 500`;
    const dailyButton = $('#claimDaily');
    dailyButton.textContent = profile.dailyClaimed ? '✓ Claimed today' : 'Claim +25 R';
    dailyButton.disabled = profile.dailyClaimed;
    const streak = Math.max(1, Math.min(7, profile.streak || 1));
    $('#streakText').textContent = `Day ${streak} of 7 — ${streak === 1 ? 'welcome!' : 'keep it going!'}`;
    $('.streak-dots').setAttribute('aria-label', `Day ${streak} of 7`);
    $$('.streak-dots i').forEach((dot, index) => dot.classList.toggle('earned', index < streak));
    const friendTotal = Array.isArray(profile.friends) ? profile.friends.length : 0;
    $('#friendCount').textContent = friendTotal;
    $('#friendCount').hidden = friendTotal === 0;
    $('#friendSummary').textContent = friendTotal === 0 ? 'You have no friends yet. Find some players and start a crew!' : `${friendTotal} friend${friendTotal === 1 ? '' : 's'} in your crew.`;
    const petTotal = Array.isArray(profile.pets) ? profile.pets.length : 0;
    $('#petCount').textContent = petTotal;
    $('#petCount').hidden = petTotal === 0;
    renderFriends();
    renderPets();
    renderWorlds();
    renderPublishedGames();
  }

  setTimeout(() => $('#bootScreen').classList.add('done'), 1450);
  updateProfileUI();

  const accountScreen = $('#accountScreen');
  const authMessage = $('#authMessage');
  function showAuthMessage(message, success = false) {
    authMessage.textContent = message;
    authMessage.classList.toggle('success', success);
  }
  function verifyAge(birthdate, confirmed) {
    const born = birthdate ? new Date(`${birthdate}T12:00:00`) : null;
    const today = new Date();
    if (!born || Number.isNaN(born.getTime()) || born > today) return { error:'Enter a valid date of birth.' };
    let age = today.getFullYear() - born.getFullYear();
    if (today.getMonth() < born.getMonth() || (today.getMonth() === born.getMonth() && today.getDate() < born.getDate())) age--;
    if (age < 5 || age > 120) return { error:'This date of birth cannot be verified.' };
    if (!confirmed) return { error:'Please confirm that the date of birth is correct.' };
    return { ageGroup: age < 13 ? 'under-13' : '13-plus' };
  }
  function updateSignInAgeGate() {
    const typedUsername = $('#signInUsername')?.value.trim().toLowerCase();
    const saved = typedUsername ? readAccounts()[typedUsername] : readSavedAccount();
    const needsVerification = !!saved && !saved.profile?.ageVerified;
    $('#signInAgeVerification').classList.toggle('hidden', !needsVerification);
  }
  function updateSavedAccountHint() {
    const accounts = savedAccountList();
    const hint = $('#savedAccountHint');
    if (!accounts.length) { hint.textContent = 'No saved accounts on this device yet.'; return; }
    hint.textContent = accounts.length === 1 ? `Saved player found: ${accounts[0].username}` : `${accounts.length} saved accounts available. Enter a player name or use Switch Account.`;
  }
  function syncCustomizer() {
    $$('#skinSwatches button').forEach(button => button.classList.toggle('active', button.dataset.color === profile.skin));
    $$('#shirtSwatches button').forEach(button => button.classList.toggle('active', button.dataset.color === profile.shirt));
    $$('#hairStyles button').forEach(button => button.classList.toggle('active', button.dataset.hair === profile.hair));
    $('#studioAvatar .a-hair').className = `a-hair ${profile.hair}`;
    skinDraft = skinFromProfile();
    syncSkinLab();
  }
  function enterSession(nextProfile, mode) {
    profile = Object.assign(defaultProfile(nextProfile.name), nextProfile);
    let receivedSkin = null;
    if (!Array.isArray(profile.friends)) profile.friends = [];
    if (!Array.isArray(profile.worlds)) profile.worlds = [];
    if (!Array.isArray(profile.deletedWorldIds)) profile.deletedWorldIds = [];
    if (!Array.isArray(profile.pets)) profile.pets = [];
    if (!Array.isArray(profile.customPets)) profile.customPets = [];
    if (!Array.isArray(profile.customSkins)) profile.customSkins = [];
    if (incomingSkinPayload) {
      receivedSkin = cleanSkin(incomingSkinPayload);
      const uploaded = { ...receivedSkin, id:`skin-${Date.now()}`, updatedAt:new Date().toISOString() };
      profile.customSkins = [uploaded, ...profile.customSkins.filter(item => String(item.name || '').toLowerCase() !== uploaded.name.toLowerCase())].slice(0,12);
      profile.equippedSkin = uploaded.id;
      applySkinToProfile(uploaded);
      incomingSkinPayload = null;
      try { history.replaceState(null, '', `${location.pathname}${location.search}`); } catch (_) { location.hash = ''; }
    }
    if (profile.equippedPet && !profile.pets.includes(profile.equippedPet)) profile.equippedPet = null;
    if (mode === 'account') {
      const backup = readWorldLibrary()[profile.name.toLowerCase()] || {};
      const backupWorlds = Array.isArray(backup.worlds) ? backup.worlds : [];
      const backupDeleted = Array.isArray(backup.deletedWorldIds) ? backup.deletedWorldIds : [];
      const publishedWorlds = readPublishedGames().filter(world => String(world.owner || '').toLowerCase() === profile.name.toLowerCase());
      const deletedIds = new Set([...backupDeleted, ...profile.deletedWorldIds]);
      profile.worlds.forEach(world => { if (world?.id) deletedIds.delete(world.id); });
      const recoveredWorlds = new Map();
      [...publishedWorlds, ...backupWorlds, ...profile.worlds].forEach(world => {
        if (world?.id && !deletedIds.has(world.id)) recoveredWorlds.set(world.id, { ...world });
      });
      profile.worlds = [...recoveredWorlds.values()];
      profile.deletedWorldIds = [...deletedIds];
    } else {
      profile.worlds = profile.worlds.filter(world => !profile.deletedWorldIds.includes(world.id));
    }
    sessionMode = mode;
    if (mode === 'account') saveProfile();
    accountScreen.classList.add('hidden');
    $('#appShell').removeAttribute('inert');
    showAuthMessage('');
    updateProfileUI(); syncCustomizer();
    if (receivedSkin) showToast('Skin uploaded!', `${receivedSkin.name} is now equipped`);
    beep(760, .12);
  }
  function selectAuthTab(mode) {
    $$('[data-auth-tab]').forEach(tab => { const active = tab.dataset.authTab === mode; tab.classList.toggle('active', active); tab.setAttribute('aria-selected', active); });
    $('#createAccountForm').classList.toggle('hidden', mode !== 'create');
    $('#signInForm').classList.toggle('hidden', mode !== 'signin');
    updateSignInAgeGate();
    showAuthMessage('');
  }
  $$('[data-auth-tab]').forEach(button => button.addEventListener('click', () => selectAuthTab(button.dataset.authTab)));
  $('#signInUsername').addEventListener('input', updateSignInAgeGate);
  $('#createAccountForm').addEventListener('submit', event => {
    event.preventDefault();
    const username = $('#createUsername').value.trim();
    if (readAccounts()[username.toLowerCase()]) { showAuthMessage('That account already exists on this device. Choose Sign in instead.'); return; }
    if (!/^[A-Za-z0-9_]{3,16}$/.test(username)) { showAuthMessage('Use 3–16 letters, numbers, or underscores.'); return; }
    const ageCheck = verifyAge($('#createBirthdate').value, $('#confirmAge').checked);
    if (ageCheck.error) { showAuthMessage(ageCheck.error); return; }
    const next = defaultProfile(username);
    next.ageVerified = true;
    next.ageGroup = ageCheck.ageGroup;
    rememberAccount({ username, profile: next });
    enterSession(next, 'account');
  });
  $('#signInForm').addEventListener('submit', event => {
    event.preventDefault();
    const username = $('#signInUsername').value.trim();
    const saved = readAccounts()[username.toLowerCase()];
    if (!saved) { showAuthMessage('No saved account matches that player name.'); return; }
    if (!saved.profile?.ageVerified) {
      const ageCheck = verifyAge($('#signInBirthdate').value, $('#signInConfirmAge').checked);
      if (ageCheck.error) { showAuthMessage(ageCheck.error); return; }
      saved.profile.ageVerified = true;
      saved.profile.ageGroup = ageCheck.ageGroup;
    }
    rememberAccount(saved);
    enterSession(saved.profile, 'account');
  });
  $('#continueGuest').addEventListener('click', () => enterSession(defaultProfile(), 'guest'));
  const savedOnLoad = readSavedAccount();
  updateSavedAccountHint();
  if (savedOnLoad) { $('#signInUsername').value = savedOnLoad.username; selectAuthTab('signin'); }

  // Tiny synthesized UI sounds; no external audio assets required.
  let audioEnabled = true;
  let audioContext;
  function beep(frequency = 440, duration = .06, volume = .025) {
    if (!audioEnabled) return;
    try {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = 'sine'; oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(volume, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(.0001, audioContext.currentTime + duration);
      oscillator.connect(gain).connect(audioContext.destination);
      oscillator.start(); oscillator.stop(audioContext.currentTime + duration);
    } catch (_) { /* Audio is optional. */ }
  }

  function switchView(name) {
    $$('.view').forEach(view => view.classList.toggle('active', view.id === `${name}View`));
    $$('.nav-item').forEach(button => button.classList.toggle('active', button.dataset.view === name));
    window.scrollTo({ top: 0, behavior: 'smooth' });
    beep(520);
  }
  $$('[data-view]').forEach(button => button.addEventListener('click', () => switchView(button.dataset.view)));

  const updateNotes = [
    { version:'UPDATE 11 • LATEST', badge:'UPDATE 11', title:'Robux Store', summary:'Buy in-game Robux bundles for your Robox account without using real money.', features:['New Buy Robux buttons around the app','R 250, R 1,000, and R 5,000 demo bundles','Balances update instantly and save to signed-in accounts'] },
    { version:'UPDATE 10', badge:'UPDATE 10', title:'Standalone Skin Maker', summary:'Create custom player skins in a separate app, then hand a finished look into Robox 2.0.', features:['Separate full-screen skin creator','Saved 12-skin library with one-click upload','Portable .roboxskin and PNG exports'] },
    { version:'UPDATE 9', badge:'UPDATE 9', title:'Pet Designer', summary:'Design a one-of-a-kind pet with your own name, style, and colors for R 1,000 Robux.', features:['Live custom-pet preview','Choose four styles and two colors','Create and equip for R 1,000'] },
    { version:'UPDATE 8', badge:'UPDATE 8', title:'Pets & Robux Shop', summary:'Unlock pets with in-game Robux and equip a companion that follows you into worlds.', features:['Four pets in the Pet Shop','Pay with saved in-game R currency','Press E in a world to open the shop'] },
    { version:'UPDATE 7', badge:'UPDATE 7', title:'Stay Current & Download', summary:'Robox can detect an older copy, reload every missing feature, and download an offline package.', features:['Automatic latest-version checks','One-tap Reload Latest recovery','Downloadable offline ZIP package'] },
    { version:'UPDATE 6', badge:'UPDATE 6', title:'Control Switcher', summary:'Choose how you play before entering a world or switch controls during a game.', features:['Controls button on the home screen','Switch controls while a game is paused','Save Auto, Keyboard & Mouse, or Touch mode'] },
    { version:'UPDATE 5', badge:'UPDATE 5', title:'Multiple Accounts', summary:'Save several player accounts on one device and switch without losing progress.', features:['Switch accounts from Settings','Keep each profile\'s worlds and friends separate','Migrate existing accounts automatically'] },
    { version:'UPDATE 4', badge:'UPDATE 4', title:'Invites & Permissions', summary:'World owners can invite players by username and decide who gets build access.', features:['Invite exact player usernames','Choose play-only or Can Build','Change permissions or remove invites'] },
    { version:'UPDATE 3', badge:'UPDATE 3', title:'Expandable Worlds', summary:'Creators can grow their platform and share a finished game with everyone.', features:['Expand platforms up to 32 × 32','Publish and update live games','Right-click to place and left-click to wreck'] },
    { version:'UPDATE 2', badge:'UPDATE 2', title:'World Creator', summary:'Every experience begins with a world made by a player.', features:['Create named worlds with four environments','Save block changes automatically','Delete drafts and their published copy'] },
    { version:'UPDATE 1', badge:'UPDATE 1', title:'Accounts & Friends', summary:'Player profiles start clean and stay saved on the device.', features:['Age verification for accounts','Add and unfriend by username','Start daily rewards at Day 1'] }
  ];
  function rebuildUpdatesList() {
    const list = $('#updatesList');
    if (!list) return;
    list.innerHTML = updateNotes.map((note, index) => {
      const badge = index === 0 ? 'NEW' : note.badge.replace('UPDATE ', '');
      const summary = index === 0 ? 'Buy in-game Robux bundles.' : note.summary;
      return `<button class="${index === 0 ? 'active' : ''}" data-update-index="${index}"><span>${escapeHTML(badge)}</span><b>${escapeHTML(note.title)}</b><small>${escapeHTML(summary)}</small></button>`;
    }).join('');
  }
  rebuildUpdatesList();
  let activeUpdateIndex = 0;
  function renderUpdate(index) {
    activeUpdateIndex = Math.max(0, Math.min(updateNotes.length - 1, index));
    const note = updateNotes[activeUpdateIndex];
    $('#updateVersion').textContent = note.badge;
    $('#updateKicker').textContent = note.version;
    $('#updateTitle').textContent = note.title;
    $('#updateSummary').textContent = note.summary;
    $('#updateFeatures').innerHTML = note.features.map(feature => `<li>${escapeHTML(feature)}</li>`).join('');
    $('#updatePosition').textContent = `${activeUpdateIndex + 1} / ${updateNotes.length}`;
    $('#previousUpdate').disabled = activeUpdateIndex === 0;
    $('#nextUpdate').disabled = activeUpdateIndex === updateNotes.length - 1;
    $$('#updatesList [data-update-index]').forEach(button => button.classList.toggle('active', Number(button.dataset.updateIndex) === activeUpdateIndex));
  }
  $('#updatesList').addEventListener('click', event => {
    const button = event.target.closest('[data-update-index]');
    if (button) renderUpdate(Number(button.dataset.updateIndex));
  });
  $('#previousUpdate').addEventListener('click', () => renderUpdate(activeUpdateIndex - 1));
  $('#nextUpdate').addEventListener('click', () => renderUpdate(activeUpdateIndex + 1));
  renderUpdate(0);

  const currentAppVersion = Number(appConfig.version) || 0;
  const canonicalAppUrl = appConfig.canonicalUrl || 'https://mrawesomepro1.github.io/AWESOMECRAFT/robox-2-0/';
  let latestAppVersion = currentAppVersion;
  async function checkForUpdates(manual = false) {
    try {
      const response = await fetch(`${canonicalAppUrl}version.json?check=${Date.now()}`, { cache:'no-store' });
      if (!response.ok) throw new Error('Update server unavailable');
      const latest = await response.json();
      latestAppVersion = Number(latest.version) || currentAppVersion;
      const needsUpdate = latestAppVersion > currentAppVersion;
      $('#updateBanner').classList.toggle('show', needsUpdate);
      if (manual) showToast(needsUpdate ? 'New update found!' : 'Robox is up to date', needsUpdate ? `Update ${latestAppVersion} is ready to reload` : `You have Update ${currentAppVersion}`);
      return needsUpdate;
    } catch (_) {
      if (manual) showToast('Could not check updates', 'Check your internet connection and try again');
      return false;
    }
  }
  function reloadLatestVersion() {
    const target = new URL(canonicalAppUrl);
    target.searchParams.set('version', String(latestAppVersion || currentAppVersion));
    target.searchParams.set('reload', String(Date.now()));
    window.location.replace(target.href);
  }
  $('#checkUpdatesButton').addEventListener('click', () => checkForUpdates(true));
  $('#reloadLatestButton').addEventListener('click', reloadLatestVersion);
  setTimeout(() => checkForUpdates(false), 1800);

  const formatRobux = value => Number(value || 0).toLocaleString();
  function makeRobuxButton(id, className, label, detail = '') {
    const button = document.createElement('button');
    button.type = 'button';
    button.id = id;
    button.className = className;
    button.dataset.openRobuxStore = 'true';
    button.innerHTML = detail ? `<span>R+</span><div><b>${label}</b><small>${detail}</small></div>` : `<span>R+</span><b>${label}</b>`;
    return button;
  }
  function injectRobuxStoreUI() {
    const download = $('#downloadGameButton');
    if (download) download.href = appConfig.downloadFile || 'robox-2.0-update-11-download.zip';
    const walletPill = $('#walletCoins')?.closest('.coin-pill');
    if (walletPill && !$('#topRobuxButton')) walletPill.insertAdjacentElement('afterend', makeRobuxButton('topRobuxButton', 'robux-store-button top-robux-button', 'BUY'));
    if ($('#downloadGameButton') && !$('#homeRobuxButton')) $('#downloadGameButton').insertAdjacentElement('beforebegin', makeRobuxButton('homeRobuxButton', 'home-robux-button', 'BUY ROBUX'));
    const petActions = $('.pet-page-actions');
    if (petActions && !$('#petRobuxButton')) {
      const petCoins = $('#petCoins')?.closest('.coin-pill');
      const button = makeRobuxButton('petRobuxButton', 'mini-robux-button', 'BUY ROBUX');
      if (petCoins) petCoins.insertAdjacentElement('beforebegin', button); else petActions.appendChild(button);
    }
    const designerBalance = $('.designer-balance');
    if (designerBalance && !$('#designerRobuxButton')) designerBalance.insertAdjacentElement('afterend', makeRobuxButton('designerRobuxButton', 'designer-buy-robux', 'GET MORE ROBUX'));
    const gameShopCoins = $('#gamePetCoins')?.closest('.coin-pill');
    if (gameShopCoins && !$('#gameRobuxButton')) gameShopCoins.insertAdjacentElement('beforebegin', makeRobuxButton('gameRobuxButton', 'mini-robux-button game-robux-button', 'BUY ROBUX'));
    if (!$('#robuxStoreModal')) {
      document.body.insertAdjacentHTML('beforeend', `<div class="modal robux-store-modal" id="robuxStoreModal" role="dialog" aria-modal="true" aria-labelledby="robuxStoreTitle"><div class="modal-card robux-store-card"><button class="modal-close" id="closeRobuxStore" aria-label="Close Robux store">×</button><div class="robux-store-hero"><div><p class="eyebrow">ROBOX WALLET</p><h2 id="robuxStoreTitle">Buy Robux</h2><p>Pick a bundle and the in-game Robux is added to this Robox profile.</p></div><div class="robux-balance-card"><span>YOUR BALANCE</span><strong><i class="coin">R</i> <b id="storeCoins">100</b></strong></div></div><div class="robux-bundle-grid" id="robuxBundleGrid"></div><p class="robux-safe-note"><b>Robox-only store:</b> these are pretend in-game purchases. No real money, payment cards, or Roblox account is used.</p><p class="robux-store-message" id="robuxStoreMessage" aria-live="polite"></p></div></div>`);
    }
  }
  function renderRobuxStore() {
    const grid = $('#robuxBundleGrid');
    if (!grid) return;
    grid.innerHTML = robuxBundles.map((bundle, index) => `<button class="robux-bundle ${index === 1 ? 'featured' : ''}" type="button" data-robux-amount="${bundle.amount}"><span class="coin">R</span><strong>${formatRobux(bundle.amount)}</strong><b>${escapeHTML(bundle.name)}</b><small>${escapeHTML(bundle.note)}</small><em>DEMO BUY</em></button>`).join('');
    const storeCoins = $('#storeCoins');
    if (storeCoins) storeCoins.textContent = profile.coins;
  }
  function openRobuxStore() {
    renderRobuxStore();
    $('#robuxStoreMessage').textContent = '';
    $('#robuxStoreModal').classList.add('show');
    beep(720, .08);
  }
  function closeRobuxStore() {
    $('#robuxStoreModal').classList.remove('show');
  }
  injectRobuxStoreUI();
  document.addEventListener('click', event => {
    if (event.target.closest('[data-open-robux-store]')) openRobuxStore();
  });
  $('#closeRobuxStore').addEventListener('click', closeRobuxStore);
  $('#robuxStoreModal').addEventListener('click', event => { if (event.target === $('#robuxStoreModal')) closeRobuxStore(); });
  $('#robuxBundleGrid').addEventListener('click', event => {
    const button = event.target.closest('[data-robux-amount]');
    if (!button) return;
    const amount = Number(button.dataset.robuxAmount) || 0;
    if (amount <= 0) return;
    profile.coins += amount;
    saveProfile();
    renderRobuxStore();
    const saveNote = sessionMode === 'account' ? 'Saved to your account.' : 'Guest Robux may reset when the guest session ends.';
    $('#robuxStoreMessage').textContent = `Added R ${formatRobux(amount)} to ${profile.name}. ${saveNote}`;
    showToast('Robux added!', `+R ${formatRobux(amount)} demo purchase`);
    beep(1040, .18);
  });

  $('#soundToggle').addEventListener('click', event => {
    audioEnabled = !audioEnabled;
    event.currentTarget.classList.toggle('muted', !audioEnabled);
    event.currentTarget.querySelector('span').textContent = audioEnabled ? '♪' : '×';
    beep(640);
  });

  const controlsModal = $('#controlsModal');
  const validControlModes = ['auto','keyboard','touch'];
  const detectedStartControlMode = window.matchMedia && window.matchMedia('(pointer: coarse)').matches ? 'touch' : 'keyboard';
  let controlMode = localStorage.getItem('robox-control-mode') || detectedStartControlMode;
  let resumeAfterControls = false;
  if (!validControlModes.includes(controlMode)) controlMode = 'auto';
  function controlModeLabel(mode) {
    return mode === 'keyboard' ? 'Keyboard & Mouse' : mode === 'touch' ? 'Touch Controls' : 'Automatic';
  }
  function syncStartDeviceChoice(mode) {
    const choice = $('#startDeviceChoice');
    if (!choice) return;
    const startMode = mode === 'keyboard' ? 'keyboard' : mode === 'touch' ? 'touch' : detectedStartControlMode;
    $$('[data-start-device]', choice).forEach(button => button.classList.toggle('active', button.dataset.startDevice === startMode));
    const message = $('#startDeviceMessage');
    if (message) message.textContent = startMode === 'keyboard' ? 'Computer controls selected: keyboard, mouse, and E for shop.' : 'iPad/iPhone controls selected: big touch buttons for play.';
  }
  function applyControlMode(mode, announce = true) {
    controlMode = validControlModes.includes(mode) ? mode : 'auto';
    localStorage.setItem('robox-control-mode', controlMode);
    document.body.classList.toggle('force-keyboard', controlMode === 'keyboard');
    document.body.classList.toggle('force-touch', controlMode === 'touch');
    document.body.dataset.controlMode = controlMode;
    $$('#controlModeList [data-control-mode]').forEach(button => button.classList.toggle('active', button.dataset.controlMode === controlMode));
    syncStartDeviceChoice(controlMode);
    $('#controlCurrent').textContent = `${controlModeLabel(controlMode)} selected`;
    if (announce) {
      beep(760, .1);
      if (game.active) showToast('Controls changed', controlModeLabel(controlMode));
    }
  }
  function openControlsModal() {
    resumeAfterControls = !!game.active && !game.paused;
    if (resumeAfterControls) togglePause(true);
    controlsModal.classList.add('show');
  }
  function closeControlsModal() {
    controlsModal.classList.remove('show');
    if (resumeAfterControls && game.active) togglePause(false);
    resumeAfterControls = false;
  }
  $('#homeControlsButton').addEventListener('click', openControlsModal);
  $('#gameControlsButton').addEventListener('click', openControlsModal);
  $$('[data-close-controls]').forEach(button => button.addEventListener('click', closeControlsModal));
  controlsModal.addEventListener('click', event => { if (event.target === controlsModal) closeControlsModal(); });
  $('#controlModeList').addEventListener('click', event => {
    const button = event.target.closest('[data-control-mode]');
    if (button) applyControlMode(button.dataset.controlMode);
  });
  $('#startDeviceChoice')?.addEventListener('click', event => {
    const button = event.target.closest('[data-start-device]');
    if (button) applyControlMode(button.dataset.startDevice);
  });
  applyControlMode(controlMode, false);

  $('#claimDaily').addEventListener('click', event => {
    if (profile.dailyClaimed) return;
    profile.coins += 25; profile.dailyClaimed = true; saveProfile(); beep(880, .13);
    event.currentTarget.textContent = '✓ Claimed today'; event.currentTarget.disabled = true;
  });
  const search = $('#searchInput');
  search.addEventListener('input', () => {
    const query = search.value.trim().toLowerCase();
    const cards = $$('.game-card');
    if (!cards.length) { $('#emptySearch').classList.remove('show'); return; }
    let visible = 0;
    cards.forEach(card => { const show = card.dataset.title.includes(query); card.hidden = !show; visible += show; });
    $('#emptySearch').classList.toggle('show', visible === 0);
  });
  window.addEventListener('keydown', event => {
    if (event.key === '/' && !game.active && document.activeElement !== search) { event.preventDefault(); search.focus(); }
    if (event.key === 'Escape' && document.activeElement === search) search.blur();
  });
  $('#seeAllBtn')?.addEventListener('click', () => { search.value = ''; search.focus(); search.dispatchEvent(new Event('input')); });

  const skinKeys = ['skin', 'shirt', 'accent', 'pants', 'hairColor'];
  const skinPalettes = {
    neon: { shirt:'#7557ff', accent:'#55e6ff', pants:'#202858', hairColor:'#241b4d' },
    sunset: { shirt:'#ff5470', accent:'#ffc857', pants:'#532b52', hairColor:'#4b2430' },
    forest: { shirt:'#146b52', accent:'#70e000', pants:'#173d35', hairColor:'#27341f' },
    mono: { shirt:'#20263a', accent:'#f5f7ff', pants:'#111521', hairColor:'#0b0e16' }
  };
  const validHairStyles = ['spikes', 'cap', 'none'];
  const validOutfits = ['classic', 'stripe', 'hoodie', 'cyber'];
  const validFaces = ['smile', 'cool', 'wink', 'robot'];
  const isHexColor = value => /^#[0-9a-f]{6}$/i.test(String(value || ''));

  function skinFromProfile() {
    return {
      name: 'My First Skin', skin: profile.skin || '#f5b640', shirt: profile.shirt || '#7557ff',
      accent: profile.accent || '#55e6ff', pants: profile.pants || '#28325e', hairColor: profile.hairColor || '#2b1b18',
      hair: validHairStyles.includes(profile.hair) ? profile.hair : 'spikes',
      outfit: validOutfits.includes(profile.outfit) ? profile.outfit : 'classic',
      face: validFaces.includes(profile.face) ? profile.face : 'smile'
    };
  }

  function cleanSkin(candidate) {
    const fallback = skinFromProfile();
    const source = candidate && typeof candidate === 'object' ? candidate : {};
    return {
      name: String(source.name || fallback.name).trim().slice(0, 24) || fallback.name,
      ...Object.fromEntries(skinKeys.map(key => [key, isHexColor(source[key]) ? source[key].toLowerCase() : fallback[key]])),
      hair: validHairStyles.includes(source.hair) ? source.hair : fallback.hair,
      outfit: validOutfits.includes(source.outfit) ? source.outfit : fallback.outfit,
      face: validFaces.includes(source.face) ? source.face : fallback.face
    };
  }

  function applySkinPreview(skin) {
    const avatar = $('#skinStudioAvatar');
    if (!avatar || !skin) return;
    avatar.style.setProperty('--skin', skin.skin);
    avatar.style.setProperty('--shirt', skin.shirt);
    avatar.style.setProperty('--accent', skin.accent);
    avatar.style.setProperty('--pants', skin.pants);
    avatar.style.setProperty('--hair-color', skin.hairColor);
    avatar.dataset.hair = skin.hair;
    avatar.dataset.outfit = skin.outfit;
    avatar.dataset.face = skin.face;
  }

  function syncSkinLab() {
    if (!$('#skinStudioAvatar')) return;
    skinDraft = cleanSkin(skinDraft || skinFromProfile());
    $('#skinName').value = skinDraft.name;
    $$('[data-skin-color]').forEach(input => { input.value = skinDraft[input.dataset.skinColor]; });
    $$('#skinHairStyles button').forEach(button => button.classList.toggle('active', button.dataset.hair === skinDraft.hair));
    $$('#skinOutfitStyles button').forEach(button => button.classList.toggle('active', button.dataset.outfit === skinDraft.outfit));
    $$('#skinFaceStyles button').forEach(button => button.classList.toggle('active', button.dataset.face === skinDraft.face));
    applySkinPreview(skinDraft);
    renderSkinLibrary();
  }

  function setSkinMessage(message, error = false) {
    const element = $('#skinMessage');
    element.textContent = message;
    element.classList.toggle('error', error);
  }

  function renderSkinLibrary() {
    const library = $('#skinLibrary');
    if (!library) return;
    const skins = Array.isArray(profile.customSkins) ? profile.customSkins : [];
    $('#skinLibraryCount').textContent = `${skins.length} / 12`;
    if (!skins.length) {
      library.innerHTML = '<div class="skin-library-empty">Your uploaded skins will appear here. Make something unmistakably yours.</div>';
      return;
    }
    library.innerHTML = skins.map(skin => {
      const equipped = skin.id === profile.equippedSkin;
      return `<article class="skin-card ${equipped ? 'equipped' : ''}" data-skin-id="${escapeHTML(skin.id)}"><div class="skin-card-preview"><i style="--card-color:${skin.skin}"></i><i style="--card-color:${skin.shirt}"></i><i style="--card-color:${skin.accent}"></i><i style="--card-color:${skin.pants}"></i><i style="--card-color:${skin.hairColor}"></i></div><div class="skin-card-info"><b>${escapeHTML(skin.name)}</b><small>${escapeHTML(skin.outfit)} outfit • ${escapeHTML(skin.face)} face</small><div class="skin-card-actions"><button type="button" data-skin-equip>${equipped ? '✓ EQUIPPED' : 'EQUIP'}</button><button type="button" data-skin-delete aria-label="Delete skin">×</button></div></div></article>`;
    }).join('');
  }

  function applySkinToProfile(skin) {
    skinKeys.forEach(key => { profile[key] = skin[key]; });
    profile.hair = skin.hair;
    profile.outfit = skin.outfit;
    profile.face = skin.face;
  }

  function fileSafeName(name) {
    return String(name || 'robox-skin').trim().replace(/[^a-z0-9_-]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'robox-skin';
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = filename; document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function drawSkinPng(skin) {
    const canvas = document.createElement('canvas');
    canvas.width = 640; canvas.height = 640;
    const ctx = canvas.getContext('2d');
    const rounded = (x, y, w, h, r, color) => { ctx.fillStyle = color; ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill(); };
    const gradient = ctx.createLinearGradient(0, 0, 640, 640); gradient.addColorStop(0, '#202950'); gradient.addColorStop(1, '#090e1b'); ctx.fillStyle = gradient; ctx.fillRect(0, 0, 640, 640);
    ctx.strokeStyle = '#ffffff0d'; ctx.lineWidth = 1; for (let i = 0; i <= 640; i += 40) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,640); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(640,i); ctx.stroke(); }
    ctx.save(); ctx.shadowColor = skin.accent; ctx.shadowBlur = 55; rounded(233, 450, 174, 40, 20, '#343b66'); ctx.restore();
    rounded(245, 105, 150, 137, 22, skin.skin); rounded(220, 255, 200, 185, 18, skin.shirt); rounded(165, 264, 47, 194, 14, skin.skin); rounded(428, 264, 47, 194, 14, skin.skin); rounded(235, 424, 78, 153, 13, skin.pants); rounded(327, 424, 78, 153, 13, skin.pants);
    ctx.fillStyle = '#202332'; rounded(278, 164, 13, 18, 7, '#202332'); rounded(349, 164, 13, 18, 7, '#202332');
    ctx.strokeStyle = skin.face === 'robot' ? skin.accent : '#784936'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(320, 188, 24, .15, Math.PI - .15); ctx.stroke();
    if (skin.hair !== 'none') { ctx.fillStyle = skin.hairColor; ctx.beginPath(); ctx.moveTo(238,140); ctx.lineTo(250,91); ctx.lineTo(276,121); ctx.lineTo(301,82); ctx.lineTo(326,121); ctx.lineTo(356,88); ctx.lineTo(388,140); ctx.closePath(); ctx.fill(); if (skin.hair === 'cap') rounded(240, 91, 157, 52, 24, skin.hairColor); }
    if (skin.outfit === 'classic') { ctx.fillStyle = '#fff'; ctx.font = 'bold 80px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('R', 320, 375); }
    if (skin.outfit === 'stripe') rounded(305, 255, 30, 185, 0, skin.accent);
    if (skin.outfit === 'hoodie') { ctx.strokeStyle = skin.accent; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(320, 270, 65, 0, Math.PI); ctx.stroke(); }
    if (skin.outfit === 'cyber') { ctx.strokeStyle = skin.accent; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(260,340); ctx.lineTo(300,340); ctx.lineTo(320,300); ctx.lineTo(345,380); ctx.lineTo(385,380); ctx.stroke(); }
    ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.font = '700 18px sans-serif'; ctx.fillText('ROBOX 2.0 • SKIN LAB', 35, 45); ctx.font = '800 29px sans-serif'; ctx.fillText(skin.name, 35, 605);
    return canvas;
  }

  $$('[data-skin-tab]').forEach(button => button.addEventListener('click', () => {
    $$('[data-skin-tab]').forEach(item => item.classList.toggle('active', item === button));
    $$('[data-skin-panel]').forEach(panel => panel.classList.toggle('active', panel.dataset.skinPanel === button.dataset.skinTab));
  }));
  $$('[data-skin-color]').forEach(input => input.addEventListener('input', () => {
    skinDraft[input.dataset.skinColor] = input.value; applySkinPreview(skinDraft); setSkinMessage('Preview updated — upload when you are ready.');
  }));
  $('#skinName').addEventListener('input', event => { skinDraft.name = event.target.value.slice(0, 24); });
  $('#skinPalettes').addEventListener('click', event => {
    const button = event.target.closest('[data-palette]'); if (!button) return;
    Object.assign(skinDraft, skinPalettes[button.dataset.palette]); syncSkinLab(); beep(620);
  });
  $('#skinOutfitStyles').addEventListener('click', event => {
    const button = event.target.closest('[data-outfit]'); if (!button) return;
    skinDraft.outfit = button.dataset.outfit; syncSkinLab(); beep(620);
  });
  $('#skinFaceStyles').addEventListener('click', event => {
    const button = event.target.closest('[data-face]'); if (!button) return;
    skinDraft.face = button.dataset.face; syncSkinLab(); beep(650);
  });
  $('#skinHairStyles').addEventListener('click', event => {
    const button = event.target.closest('[data-hair]'); if (!button) return;
    skinDraft.hair = button.dataset.hair; syncSkinLab(); beep(600);
  });
  $('#resetSkinDraft').addEventListener('click', () => { skinDraft = skinFromProfile(); syncSkinLab(); setSkinMessage('Draft reset to your equipped look.'); });

  $('#publishSkin').addEventListener('click', event => {
    skinDraft.name = $('#skinName').value.trim().slice(0, 24);
    if (skinDraft.name.length < 2) { setSkinMessage('Give your skin a name with at least 2 characters.', true); return; }
    if (!Array.isArray(profile.customSkins)) profile.customSkins = [];
    const existing = profile.customSkins.find(item => item.name.toLowerCase() === skinDraft.name.toLowerCase());
    const record = { ...cleanSkin(skinDraft), id: existing?.id || `skin-${Date.now()}`, updatedAt: new Date().toISOString() };
    profile.customSkins = [record, ...profile.customSkins.filter(item => item.id !== record.id)].slice(0, 12);
    profile.equippedSkin = record.id; applySkinToProfile(record); skinDraft = { ...record }; saveProfile(); syncSkinLab();
    event.currentTarget.textContent = '✓ UPLOADED & EQUIPPED'; setSkinMessage(`${record.name} is live on your Robox 2.0 profile.`); showToast('Skin uploaded!', `${record.name} is now equipped`); beep(920, .16);
    setTimeout(() => { event.currentTarget.textContent = 'UPLOAD TO ROBOX 2.0'; }, 1500);
  });

  $('#exportSkin').addEventListener('click', () => {
    skinDraft.name = $('#skinName').value.trim().slice(0, 24) || 'My Skin';
    const packageData = { format:'robox-skin', version:1, createdBy:profile.name, exportedAt:new Date().toISOString(), skin:cleanSkin(skinDraft) };
    downloadBlob(new Blob([JSON.stringify(packageData, null, 2)], { type:'application/json' }), `${fileSafeName(skinDraft.name)}.roboxskin`);
    setSkinMessage('Skin file exported. Import it on another device anytime.');
  });
  $('#downloadSkinPng').addEventListener('click', () => {
    skinDraft.name = $('#skinName').value.trim().slice(0, 24) || 'My Skin';
    drawSkinPng(cleanSkin(skinDraft)).toBlob(blob => downloadBlob(blob, `${fileSafeName(skinDraft.name)}.png`), 'image/png'); setSkinMessage('PNG preview downloaded.');
  });
  $('#importSkin').addEventListener('click', () => $('#skinFileInput').click());
  $('#skinFileInput').addEventListener('change', event => {
    const file = event.target.files?.[0]; if (!file) return;
    if (file.size > 100000) { setSkinMessage('That skin file is too large.', true); event.target.value = ''; return; }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result); const incoming = parsed.format === 'robox-skin' ? parsed.skin : parsed;
        if (!incoming || !skinKeys.every(key => isHexColor(incoming[key]))) throw new Error('invalid');
        skinDraft = cleanSkin(incoming); syncSkinLab(); setSkinMessage(`${skinDraft.name} imported — preview it, then upload.`); beep(760);
      } catch (_) { setSkinMessage('This is not a valid .roboxskin file.', true); }
      event.target.value = '';
    };
    reader.onerror = () => { setSkinMessage('The skin file could not be read.', true); event.target.value = ''; };
    reader.readAsText(file);
  });

  $('#skinLibrary').addEventListener('click', event => {
    const card = event.target.closest('[data-skin-id]'); if (!card) return;
    const selected = (profile.customSkins || []).find(item => item.id === card.dataset.skinId); if (!selected) return;
    if (event.target.closest('[data-skin-delete]')) {
      profile.customSkins = profile.customSkins.filter(item => item.id !== selected.id);
      if (profile.equippedSkin === selected.id) profile.equippedSkin = null;
      saveProfile(); renderSkinLibrary(); setSkinMessage(`${selected.name} deleted.`); return;
    }
    if (event.target.closest('[data-skin-equip]')) {
      profile.equippedSkin = selected.id; applySkinToProfile(selected); skinDraft = { ...selected }; saveProfile(); syncSkinLab(); setSkinMessage(`${selected.name} equipped.`); showToast('Look equipped', selected.name); beep(860);
    }
  });

  let skinDragStart = null, skinAvatarAngle = 0;
  const skinStudioAvatar = $('#skinStudioAvatar');
  skinStudioAvatar.addEventListener('pointerdown', event => { skinDragStart = event.clientX; skinStudioAvatar.setPointerCapture(event.pointerId); });
  skinStudioAvatar.addEventListener('pointermove', event => { if (skinDragStart === null) return; skinAvatarAngle += (event.clientX - skinDragStart) * .7; skinDragStart = event.clientX; skinStudioAvatar.style.transform = `scale(1.08) rotateY(${skinAvatarAngle}deg)`; });
  skinStudioAvatar.addEventListener('pointerup', () => { skinDragStart = null; });
  $$('[data-preview-turn]').forEach(button => button.addEventListener('click', () => { skinAvatarAngle += Number(button.dataset.previewTurn); skinStudioAvatar.style.transform = `scale(1.08) rotateY(${skinAvatarAngle}deg)`; }));

  function setSwatch(group, value, key) {
    $$(group + ' button').forEach(button => button.classList.toggle('active', button.dataset.color === value));
    profile[key] = value; saveProfile(); beep(580);
  }
  $('#skinSwatches').addEventListener('click', event => { const button = event.target.closest('button'); if (button) setSwatch('#skinSwatches', button.dataset.color, 'skin'); });
  $('#shirtSwatches').addEventListener('click', event => { const button = event.target.closest('button'); if (button) setSwatch('#shirtSwatches', button.dataset.color, 'shirt'); });
  $('#hairStyles').addEventListener('click', event => {
    const button = event.target.closest('button'); if (!button) return;
    $$('#hairStyles button').forEach(item => item.classList.toggle('active', item === button));
    profile.hair = button.dataset.hair; $('#studioAvatar .a-hair').className = `a-hair ${profile.hair}`; saveProfile(); beep(600);
  });
  syncCustomizer();
  $('#saveLook').addEventListener('click', event => { event.currentTarget.textContent = '✓ SAVED!'; beep(920, .15); setTimeout(() => event.currentTarget.textContent = '✓ LOOK EQUIPPED', 1200); });

  let dragStart = null, avatarAngle = 0;
  const studioAvatar = $('#studioAvatar');
  studioAvatar.addEventListener('pointerdown', e => { dragStart = e.clientX; studioAvatar.setPointerCapture(e.pointerId); });
  studioAvatar.addEventListener('pointermove', e => { if (dragStart === null) return; avatarAngle += (e.clientX - dragStart) * .7; dragStart = e.clientX; studioAvatar.style.transform = `rotateY(${avatarAngle}deg)`; });
  studioAvatar.addEventListener('pointerup', () => dragStart = null);

  function emptyFriendsMarkup() {
    return `<div class="friends-empty"><div class="empty-crew-icon"><span>♙</span><span>♙</span><span>♙</span></div><p class="eyebrow">YOUR CREW AWAITS</p><h3>No friends yet</h3><p>Type a player's username to add them. Your friends will appear here so you can manage your crew.</p></div>`;
  }

  function renderFriends() {
    const list = $('#friendList');
    if (!list) return;
    const friends = Array.isArray(profile.friends) ? profile.friends : [];
    if (!friends.length) { list.innerHTML = emptyFriendsMarkup(); return; }
    list.innerHTML = friends.map(friend => {
      const name = friend.name || 'Player';
      const id = friend.id || name.toLowerCase();
      const color = friend.color || 'violet';
      return `<article class="offline" data-friend-id="${id}"><span class="friend-avatar ${color}">${name.charAt(0).toUpperCase()}</span><div><h3>${name}</h3><p>Friend • Offline</p></div><div class="friend-card-actions"><button class="unfriend-btn" data-friend-action="unfriend">UNFRIEND</button></div></article>`;
    }).join('');
  }

  function petCardsMarkup() {
    const ownedPets = Array.isArray(profile.pets) ? profile.pets : [];
    return [...petCatalog, ...(Array.isArray(profile.customPets) ? profile.customPets : [])].map(pet => {
      const owned = ownedPets.includes(pet.id);
      const equipped = profile.equippedPet === pet.id;
      const label = equipped ? 'EQUIPPED' : owned ? 'EQUIP' : `GET FOR R ${pet.price}`;
      return `<article class="pet-card ${equipped ? 'equipped' : ''}"><div class="pet-art ${pet.type}" style="--pet-color:${pet.color};--pet-accent:${pet.accent}"><span>${pet.icon}</span>${equipped ? '<b>FOLLOWING YOU</b>' : ''}</div><div class="pet-info"><p class="eyebrow">${owned ? 'OWNED PET' : `R ${pet.price} ROBUX`}</p><h3>${escapeHTML(pet.name)}</h3><p>${escapeHTML(pet.description)}</p><button data-pet-id="${pet.id}" data-pet-action="${owned ? 'equip' : 'buy'}" ${equipped ? 'disabled' : ''}>${label}</button></div></article>`;
    }).join('');
  }
  function renderPets() {
    const markup = petCardsMarkup();
    ['#petGrid', '#gamePetGrid'].forEach(selector => { const grid = $(selector); if (grid) grid.innerHTML = markup; });
    const gamePetCoins = $('#gamePetCoins');
    if (gamePetCoins) gamePetCoins.textContent = profile.coins;
  }
  function handlePetAction(event) {
    const button = event.target.closest('[data-pet-id]');
    if (!button) return;
    const pet = [...petCatalog, ...(profile.customPets || [])].find(item => item.id === button.dataset.petId);
    if (!pet) return;
    if (!Array.isArray(profile.pets)) profile.pets = [];
    if (button.dataset.petAction === 'buy') {
      if (profile.coins < pet.price) { showToast('Not enough Robux', `You need R ${pet.price - profile.coins} more for ${pet.name}`); beep(240, .12); return; }
      profile.coins -= pet.price;
      profile.pets.push(pet.id);
      profile.equippedPet = pet.id;
      saveProfile();
      showToast(`${pet.name} unlocked!`, `R ${pet.price} Robux paid • Pet equipped`);
      beep(980, .18);
      return;
    }
    if (profile.pets.includes(pet.id)) {
      profile.equippedPet = pet.id;
      saveProfile();
      showToast(`${pet.name} equipped`, 'Your pet will follow you into worlds');
      beep(820, .12);
    }
  }
  $('#petGrid').addEventListener('click', handlePetAction);
  $('#gamePetGrid').addEventListener('click', handlePetAction);

  const customPetIcons = { pup:'🐶', cat:'🐱', bot:'🤖', dragon:'🐉' };
  function updatePetDesignerPreview() {
    const type = $('input[name="customPetType"]:checked')?.value || 'pup';
    const name = $('#customPetName').value.trim() || 'MY PET';
    $('#designerPetIcon').textContent = customPetIcons[type];
    $('#designerPetName').textContent = name.toUpperCase();
    $('#designerStage').style.setProperty('--pet-color', $('#customPetColor').value);
    $('#designerStage').style.setProperty('--pet-accent', $('#customPetAccent').value);
  }
  $('#openPetDesigner').addEventListener('click', () => { $('#designerMessage').textContent = ''; updatePetDesignerPreview(); switchView('petDesign'); });
  $('#backToPets').addEventListener('click', () => switchView('pets'));
  $('#customPetName').addEventListener('input', updatePetDesignerPreview);
  $('#customPetColor').addEventListener('input', updatePetDesignerPreview);
  $('#customPetAccent').addEventListener('input', updatePetDesignerPreview);
  $$('input[name="customPetType"]').forEach(input => input.addEventListener('change', updatePetDesignerPreview));
  $('#petDesignerForm').addEventListener('submit', event => {
    event.preventDefault();
    const message = $('#designerMessage'), name = $('#customPetName').value.trim();
    if (sessionMode !== 'account') { message.textContent = 'Create or sign in to an account before designing a pet.'; beep(240, .12); return; }
    if (name.length < 2) { message.textContent = 'Give your pet a name with at least 2 characters.'; return; }
    if (profile.coins < 1000) { message.textContent = `You need R ${1000 - profile.coins} more Robux to create this pet.`; beep(240, .12); return; }
    const type = $('input[name="customPetType"]:checked')?.value || 'pup';
    const customPet = { id:`custom-${Date.now()}`, name, type, icon:customPetIcons[type], price:1000, color:$('#customPetColor').value, accent:$('#customPetAccent').value, description:`A one-of-a-kind ${type} designed by ${profile.name}.`, custom:true };
    profile.coins -= 1000;
    profile.customPets.push(customPet);
    profile.pets.push(customPet.id);
    profile.equippedPet = customPet.id;
    saveProfile();
    $('#customPetName').value = '';
    message.textContent = '';
    switchView('pets');
    showToast(`${customPet.name} created!`, 'R 1,000 Robux paid • Custom pet equipped');
    beep(1080, .2);
  });

  function worldConfigFromRecord(record) {
    const theme = worldThemes[record.theme] || worldThemes.grass;
    return {
      id: record.id, name: record.name.toUpperCase(), icon: theme.icon, sky: theme.sky,
      ground: theme.ground, side: theme.side, accent: theme.accent,
      quest: 'Your First Adventure', text: 'Collect 5 builder tokens'
    };
  }

  function emptyWorldsMarkup() {
    if (sessionMode === 'guest') {
      const saved = readSavedAccount();
      const savedName = saved?.username?.toLowerCase();
      const savedWorlds = saved?.profile?.worlds || [];
      const backupWorlds = savedName ? readWorldLibrary()[savedName]?.worlds || [] : [];
      if (savedWorlds.length || backupWorlds.length) return `<div class="worlds-empty"><div class="empty-world-visual" aria-hidden="true"><span></span><i>↪</i><b></b></div><p class="eyebrow">WORLDS FOUND</p><h3>Sign in to see your worlds</h3><p>Your saved creations belong to ${escapeHTML(saved.username)}. Sign out of guest mode and enter that account to restore them here.</p></div>`;
    }
    return `<div class="worlds-empty"><div class="empty-world-visual" aria-hidden="true"><span></span><i>＋</i><b></b></div><p class="eyebrow">CLEAN SLATE</p><h3>No worlds yet</h3><p>Create your first world, choose its environment, then jump in and build it your way.</p></div>`;
  }

  function renderWorlds() {
    const grid = $('#gameGrid');
    if (!grid) return;
    const createdWorlds = Array.isArray(profile.worlds) ? profile.worlds : [];
    if (!createdWorlds.length) { grid.innerHTML = emptyWorldsMarkup(); return; }
    grid.innerHTML = createdWorlds.map(world => {
      const theme = worldThemes[world.theme] || worldThemes.grass;
      const name = escapeHTML(world.name);
      const description = escapeHTML(world.description || 'A world ready to be shaped.');
      const status = world.published ? 'LIVE' : 'DRAFT';
      const publishLabel = world.published ? 'UPDATE LIVE' : 'PUBLISH GAME';
      return `<article class="game-card user-world-card" data-title="${name.toLowerCase()}"><div class="game-art user-world-art ${world.theme || 'grass'}"><span class="world-owner">CREATED BY YOU</span><span class="world-status ${world.published ? 'live' : 'draft'}">${status}</span></div><div class="game-info"><h4>${name}</h4><p>${description}</p><div><span>${theme.icon} ${theme.label}</span><span>◆ ${world.visits || 0} plays</span></div></div><button class="world-publish-btn" data-world-publish="${world.id}">${publishLabel}</button><button class="world-delete-btn" data-world-delete="${world.id}" aria-label="Delete ${name}">DELETE</button><button class="card-play" data-world-id="${world.id}" aria-label="Play ${name}">▶</button></article>`;
    }).join('');
    $$('.user-world-card', grid).forEach((card, index) => {
      const world = createdWorlds[index];
      const accessButton = document.createElement('button');
      accessButton.className = 'world-access-btn';
      accessButton.dataset.worldAccess = world.id;
      accessButton.textContent = 'INVITE PLAYERS';
      card.append(accessButton);
    });
  }

  function renderPublishedGames() {
    const grid = $('#publishedGamesGrid');
    if (!grid) return;
    const games = readPublishedGames();
    if (!games.length) {
      grid.innerHTML = `<div class="worlds-empty published-empty"><div class="empty-world-visual" aria-hidden="true"><span></span><i>▲</i><b></b></div><p class="eyebrow">NOTHING LIVE YET</p><h3>No published games</h3><p>Publish one of your draft worlds and it will appear here for players to discover.</p></div>`;
      return;
    }
    grid.innerHTML = games.map(world => {
      const theme = worldThemes[world.theme] || worldThemes.grass;
      const name = escapeHTML(world.name);
      const owner = escapeHTML(world.owner || 'Robox Creator');
      const description = escapeHTML(world.description || 'A player-created game.');
      return `<article class="game-card user-world-card published-game-card" data-title="${name.toLowerCase()} ${owner.toLowerCase()}"><div class="game-art user-world-art ${world.theme || 'grass'}"><span class="world-owner">BY ${owner}</span><span class="world-status live">LIVE</span></div><div class="game-info"><h4>${name}</h4><p>${description}</p><div><span>${theme.icon} ${theme.label}</span><span>◆ ${world.plays || 0} plays</span></div></div><button class="card-play" data-published-world-id="${world.id}" aria-label="Play published game ${name}">▶</button></article>`;
    }).join('');
    $$('.published-game-card', grid).forEach((card, index) => {
      const invites = Array.isArray(games[index].invites) ? games[index].invites : [];
      const invite = invites.find(item => String(item.username || '').toLowerCase() === profile.name.toLowerCase());
      if (!invite) return;
      const badge = document.createElement('span');
      badge.className = `invite-access-badge ${invite.canBuild ? 'builder' : 'player'}`;
      badge.textContent = invite.canBuild ? 'BUILD ACCESS' : 'INVITED';
      $('.game-art', card).append(badge);
    });
  }

  const createWorldModal = $('#createWorldModal');
  const deleteWorldModal = $('#deleteWorldModal');
  const publishWorldModal = $('#publishWorldModal');
  const worldAccessModal = $('#worldAccessModal');
  let pendingDeleteWorldId = null;
  let pendingPublishWorldId = null;
  let accessWorldId = null;
  function getAccessWorld() { return profile.worlds.find(world => world.id === accessWorldId); }
  function syncWorldInvites(world) {
    if (!world.published) return;
    const published = readPublishedGames();
    const liveWorld = published.find(item => item.id === world.id);
    if (liveWorld) {
      liveWorld.invites = world.invites.map(invite => ({ ...invite }));
      writePublishedGames(published);
      renderPublishedGames();
    }
  }
  function renderInvitedPlayers() {
    const world = getAccessWorld();
    const list = $('#invitedPlayersList');
    if (!world) { list.innerHTML = ''; return; }
    if (!Array.isArray(world.invites)) world.invites = [];
    if (!world.invites.length) {
      list.innerHTML = '<div class="access-empty"><b>No players invited yet</b><small>Invite someone by their exact username.</small></div>';
      return;
    }
    list.innerHTML = world.invites.map(invite => `<div class="access-player" data-invite-user="${invite.username.toLowerCase()}"><span class="access-avatar">${escapeHTML(invite.username.charAt(0).toUpperCase())}</span><div><b>${escapeHTML(invite.username)}</b><small>Invited player</small></div><label class="permission-toggle"><input type="checkbox" data-invite-build ${invite.canBuild ? 'checked' : ''}><span>Can build</span></label><button data-remove-invite>REMOVE</button></div>`).join('');
  }
  function openWorldAccess(worldId) {
    const world = profile.worlds.find(item => item.id === worldId);
    if (!world) return;
    accessWorldId = worldId;
    if (!Array.isArray(world.invites)) world.invites = [];
    $('#accessWorldName').textContent = world.name;
    $('#inviteUsernameInput').value = '';
    $('#inviteCanBuild').checked = false;
    $('#invitePlayerMessage').textContent = '';
    renderInvitedPlayers();
    worldAccessModal.classList.add('show');
    $('#inviteUsernameInput').focus();
  }
  function closeWorldAccess() {
    accessWorldId = null;
    worldAccessModal.classList.remove('show');
  }
  function closeWorldCreator() {
    createWorldModal.classList.remove('show');
    $('#createWorldForm').reset();
    $('#worldCreateMessage').textContent = '';
  }
  $('#createWorldBtn').addEventListener('click', () => {
    createWorldModal.classList.add('show');
    $('#worldNameInput').focus();
    beep(720);
  });
  $$('[data-close-world]').forEach(button => button.addEventListener('click', closeWorldCreator));
  createWorldModal.addEventListener('click', event => { if (event.target === createWorldModal) closeWorldCreator(); });
  $('#createWorldForm').addEventListener('submit', event => {
    event.preventDefault();
    const name = $('#worldNameInput').value.trim();
    const description = $('#worldDescriptionInput').value.trim();
    const theme = $('input[name="worldTheme"]:checked').value;
    if (name.length < 3) { $('#worldCreateMessage').textContent = 'World names need at least 3 characters.'; return; }
    profile.worlds.push({ id:`world-${Date.now().toString(36)}`, name, description, theme, visits:0, blocks:null, size:12, invites:[], published:false, createdAt:new Date().toISOString() });
    saveProfile(); closeWorldCreator(); switchView('discover'); beep(920, .15);
  });
  $('#gameGrid').addEventListener('click', event => {
    const accessButton = event.target.closest('[data-world-access]');
    if (accessButton) { openWorldAccess(accessButton.dataset.worldAccess); return; }
    const publishButton = event.target.closest('[data-world-publish]');
    if (publishButton) {
      pendingPublishWorldId = publishButton.dataset.worldPublish;
      const world = profile.worlds.find(item => item.id === pendingPublishWorldId);
      $('#publishWorldName').textContent = world ? world.name : 'This world';
      $('#publishWorldTitle').textContent = world && world.published ? 'Update this live game?' : 'Publish this game?';
      $('#confirmPublishWorld').textContent = world && world.published ? 'UPDATE LIVE' : 'PUBLISH GAME';
      publishWorldModal.classList.add('show');
      return;
    }
    const deleteButton = event.target.closest('[data-world-delete]');
    if (deleteButton) {
      pendingDeleteWorldId = deleteButton.dataset.worldDelete;
      const world = profile.worlds.find(item => item.id === pendingDeleteWorldId);
      $('#deleteWorldName').textContent = world ? world.name : 'This world';
      deleteWorldModal.classList.add('show');
      return;
    }
    const playButton = event.target.closest('[data-world-id]');
    if (playButton) launchGame(playButton.dataset.worldId);
  });
  $$('[data-close-world-access]').forEach(button => button.addEventListener('click', closeWorldAccess));
  worldAccessModal.addEventListener('click', event => { if (event.target === worldAccessModal) closeWorldAccess(); });
  $('#invitePlayerForm').addEventListener('submit', event => {
    event.preventDefault();
    const world = getAccessWorld();
    const username = $('#inviteUsernameInput').value.trim();
    const message = $('#invitePlayerMessage');
    message.classList.remove('success');
    if (!world) return;
    if (!/^[A-Za-z0-9_]{3,16}$/.test(username)) { message.textContent = 'Use 3-16 letters, numbers, or underscores.'; return; }
    if (username.toLowerCase() === profile.name.toLowerCase()) { message.textContent = 'You already own this world.'; return; }
    if (!Array.isArray(world.invites)) world.invites = [];
    const existing = world.invites.find(invite => invite.username.toLowerCase() === username.toLowerCase());
    if (existing) {
      existing.canBuild = $('#inviteCanBuild').checked;
      existing.username = username;
    } else {
      world.invites.push({ username, canBuild:$('#inviteCanBuild').checked, invitedAt:new Date().toISOString() });
    }
    saveProfile(); syncWorldInvites(world); renderInvitedPlayers();
    message.textContent = world.published ? `Invite sent to ${username}.` : `${username} is invited. Publish the game to deliver access.`;
    message.classList.add('success');
    $('#inviteUsernameInput').value = '';
    $('#inviteCanBuild').checked = false;
    beep(880, .12);
  });
  $('#invitedPlayersList').addEventListener('change', event => {
    const checkbox = event.target.closest('[data-invite-build]');
    if (!checkbox) return;
    const world = getAccessWorld();
    const row = checkbox.closest('[data-invite-user]');
    const invite = world?.invites.find(item => item.username.toLowerCase() === row.dataset.inviteUser);
    if (!invite) return;
    invite.canBuild = checkbox.checked;
    saveProfile(); syncWorldInvites(world);
    $('#invitePlayerMessage').textContent = checkbox.checked ? `${invite.username} can now build.` : `${invite.username} now has play-only access.`;
    $('#invitePlayerMessage').classList.add('success');
  });
  $('#invitedPlayersList').addEventListener('click', event => {
    const button = event.target.closest('[data-remove-invite]');
    if (!button) return;
    const world = getAccessWorld();
    const row = button.closest('[data-invite-user]');
    if (!world || !row) return;
    const removed = world.invites.find(item => item.username.toLowerCase() === row.dataset.inviteUser);
    world.invites = world.invites.filter(item => item.username.toLowerCase() !== row.dataset.inviteUser);
    saveProfile(); syncWorldInvites(world); renderInvitedPlayers();
    $('#invitePlayerMessage').textContent = `${removed?.username || 'Player'} was removed from this world.`;
  });
  $('#publishedGamesGrid').addEventListener('click', event => {
    const playButton = event.target.closest('[data-published-world-id]');
    if (playButton) launchGame(playButton.dataset.publishedWorldId, true);
  });
  function closePublishWorldPrompt() { pendingPublishWorldId = null; publishWorldModal.classList.remove('show'); }
  $$('[data-cancel-world-publish]').forEach(button => button.addEventListener('click', closePublishWorldPrompt));
  publishWorldModal.addEventListener('click', event => { if (event.target === publishWorldModal) closePublishWorldPrompt(); });
  $('#confirmPublishWorld').addEventListener('click', () => {
    if (!pendingPublishWorldId) return;
    const world = profile.worlds.find(item => item.id === pendingPublishWorldId);
    if (!world) { closePublishWorldPrompt(); return; }
    world.published = true;
    world.publishedAt = new Date().toISOString();
    world.publishVersion = (world.publishVersion || 0) + 1;
    const existingPublished = readPublishedGames().find(game => game.id === world.id);
    const published = readPublishedGames().filter(game => game.id !== world.id);
    published.unshift({ ...world, owner:profile.name, plays:existingPublished?.plays || 0 });
    writePublishedGames(published);
    saveProfile(); closePublishWorldPrompt(); beep(1040, .18);
  });
  function closeDeleteWorldPrompt() { pendingDeleteWorldId = null; deleteWorldModal.classList.remove('show'); }
  $$('[data-cancel-world-delete]').forEach(button => button.addEventListener('click', closeDeleteWorldPrompt));
  deleteWorldModal.addEventListener('click', event => { if (event.target === deleteWorldModal) closeDeleteWorldPrompt(); });
  $('#confirmDeleteWorld').addEventListener('click', () => {
    if (!pendingDeleteWorldId) return;
    if (!profile.deletedWorldIds.includes(pendingDeleteWorldId)) profile.deletedWorldIds.push(pendingDeleteWorldId);
    profile.worlds = profile.worlds.filter(world => world.id !== pendingDeleteWorldId);
    writePublishedGames(readPublishedGames().filter(world => world.id !== pendingDeleteWorldId));
    saveProfile(); closeDeleteWorldPrompt(); beep(320, .12);
  });

  const addFriendModal = $('#addFriendModal');
  const unfriendModal = $('#unfriendModal');
  let pendingUnfriendId = null;
  function closeFriendFinder() {
    addFriendModal.classList.remove('show');
    $('#friendUsernameInput').value = '';
    $('#friendAddMessage').textContent = '';
  }
  $('#addFriendBtn').addEventListener('click', () => {
    addFriendModal.classList.add('show');
    $('#friendUsernameInput').focus();
    beep(700);
  });
  $$('[data-close-friends]').forEach(button => button.addEventListener('click', closeFriendFinder));
  addFriendModal.addEventListener('click', event => { if (event.target === addFriendModal) closeFriendFinder(); });
  $('#addFriendForm').addEventListener('submit', event => {
    event.preventDefault();
    const input = $('#friendUsernameInput');
    const username = input.value.trim();
    const message = $('#friendAddMessage');
    message.classList.remove('success');
    if (!/^[A-Za-z0-9_]{3,16}$/.test(username)) { message.textContent = 'Enter a valid username with 3–16 characters.'; return; }
    if (username.toLowerCase() === profile.name.toLowerCase()) { message.textContent = 'You cannot add your own account.'; return; }
    if (profile.friends.some(friend => friend.name.toLowerCase() === username.toLowerCase())) { message.textContent = `${username} is already your friend.`; return; }
    const colors = ['pink','blue','green','amber','violet'];
    const colorIndex = [...username].reduce((total, letter) => total + letter.charCodeAt(0), 0) % colors.length;
    profile.friends.push({ id: username.toLowerCase(), name: username, color: colors[colorIndex] });
    saveProfile();
    message.textContent = `${username} was added to your friends!`;
    message.classList.add('success');
    input.value = '';
    beep(880, .12);
  });
  $('#friendList').addEventListener('click', event => {
    const button = event.target.closest('[data-friend-action="unfriend"]');
    if (!button) return;
    const card = button.closest('[data-friend-id]');
    pendingUnfriendId = card.dataset.friendId;
    const friend = profile.friends.find(item => (item.id || item.name.toLowerCase()) === pendingUnfriendId);
    $('#unfriendPlayerName').textContent = friend ? friend.name : 'This player';
    unfriendModal.classList.add('show');
  });
  function closeUnfriendPrompt() { pendingUnfriendId = null; unfriendModal.classList.remove('show'); }
  $$('[data-cancel-unfriend]').forEach(button => button.addEventListener('click', closeUnfriendPrompt));
  unfriendModal.addEventListener('click', event => { if (event.target === unfriendModal) closeUnfriendPrompt(); });
  $('#confirmUnfriend').addEventListener('click', () => {
    if (!pendingUnfriendId) return;
    profile.friends = profile.friends.filter(friend => (friend.id || friend.name.toLowerCase()) !== pendingUnfriendId);
    saveProfile(); closeUnfriendPrompt(); beep(360, .1);
  });

  const settingsModal = $('#settingsModal');
  const accountSwitcherModal = $('#accountSwitcherModal');
  function renderSavedAccounts() {
    const current = sessionMode === 'account' ? readSavedAccount()?.username?.toLowerCase() : null;
    const accounts = savedAccountList().sort((a, b) => (a.username.toLowerCase() === current ? -1 : b.username.toLowerCase() === current ? 1 : a.username.localeCompare(b.username)));
    const list = $('#savedAccountsList');
    if (!accounts.length) { list.innerHTML = '<div class="account-switch-empty">No saved accounts yet.</div>'; return; }
    list.innerHTML = accounts.map(account => {
      const isCurrent = account.username.toLowerCase() === current;
      const worldCount = Array.isArray(account.profile.worlds) ? account.profile.worlds.length : 0;
      return `<button class="saved-account-row ${isCurrent ? 'current' : ''}" data-switch-account="${account.username.toLowerCase()}" ${isCurrent ? 'disabled' : ''}><span class="saved-account-avatar">${escapeHTML(account.username.charAt(0).toUpperCase())}</span><span><b>${escapeHTML(account.username)}</b><small>Level ${account.profile.level || 1} • ${worldCount} world${worldCount === 1 ? '' : 's'}</small></span><em>${isCurrent ? 'CURRENT' : 'SWITCH'}</em></button>`;
    }).join('');
  }
  function showAccountScreen(mode = 'signin', username = '') {
    if (game.active) leaveGame();
    settingsModal.classList.remove('show');
    accountSwitcherModal.classList.remove('show');
    sessionMode = 'signed-out'; profile = defaultProfile(); updateProfileUI(); syncCustomizer();
    $('#appShell').setAttribute('inert', '');
    accountScreen.classList.remove('hidden');
    $('#createUsername').value = '';
    $('#createBirthdate').value = '';
    $('#confirmAge').checked = false;
    $('#signInUsername').value = username;
    updateSavedAccountHint();
    selectAuthTab(mode);
  }
  $('#settingsBtn').addEventListener('click', () => settingsModal.classList.add('show'));
  $$('[data-close]').forEach(button => button.addEventListener('click', () => settingsModal.classList.remove('show')));
  settingsModal.addEventListener('click', e => { if (e.target === settingsModal) settingsModal.classList.remove('show'); });
  function openAccountSwitcher() {
    settingsModal.classList.remove('show');
    renderSavedAccounts();
    accountSwitcherModal.classList.add('show');
  }
  $('#switchAccountButton').addEventListener('click', openAccountSwitcher);
  $('#homeSwitchAccountButton').addEventListener('click', openAccountSwitcher);
  $$('[data-close-account-switch]').forEach(button => button.addEventListener('click', () => accountSwitcherModal.classList.remove('show')));
  accountSwitcherModal.addEventListener('click', event => { if (event.target === accountSwitcherModal) accountSwitcherModal.classList.remove('show'); });
  $('#savedAccountsList').addEventListener('click', event => {
    const button = event.target.closest('[data-switch-account]');
    if (!button || button.disabled) return;
    const account = readAccounts()[button.dataset.switchAccount];
    if (!account) { renderSavedAccounts(); return; }
    if (!account.profile?.ageVerified) { showAccountScreen('signin', account.username); return; }
    if (game.active) leaveGame();
    accountSwitcherModal.classList.remove('show');
    rememberAccount(account);
    enterSession(account.profile, 'account');
    showToast('Account switched', `Now playing as ${account.username}`);
  });
  $('#addAnotherAccount').addEventListener('click', () => showAccountScreen('create'));
  $('#signOutButton').addEventListener('click', () => {
    const saved = readSavedAccount();
    showAccountScreen('signin', saved?.username || '');
  });
  const worlds = {};

  const canvas = $('#gameCanvas');
  const ctx = canvas.getContext('2d');
  const game = {
    active: false, paused: false, world: null, userWorldId: null, publishedWorldId: null, canBuild: false, isWorldOwner: false, loadedBlocks: null, worldSize: 12, last: 0, time: 0, keys: {}, buildMode: false, selectedBlock: 1,
    player: { x: 5, y: 5, z: 0, vz: 0, angle: 0 }, camera: { x: 0, y: 0 }, collected: 0,
    coins: [], blocks: [], particles: [], pet: { x: 4.3, y: 5.5, z: 0 }, npc: { x: 7.5, y: 5.5, name: 'Nova' }
  };

  const tileW = 72, tileH = 36, blockH = 33;
  const rand = (min, max) => min + Math.random() * (max - min);
  const shade = (hex, amount) => {
    const n = parseInt(hex.slice(1), 16), r = Math.max(0, Math.min(255, (n >> 16) + amount)), g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amount)), b = Math.max(0, Math.min(255, (n & 255) + amount));
    return `rgb(${r},${g},${b})`;
  };
  function project(x, y, z = 0) {
    return { x: canvas.width / 2 + (x - y) * tileW / 2 - game.camera.x, y: canvas.height * .37 + (x + y) * tileH / 2 - z * blockH - game.camera.y };
  }

  function resize() {
    canvas.width = innerWidth; canvas.height = innerHeight;
    canvas.style.width = innerWidth + 'px'; canvas.style.height = innerHeight + 'px';
  }
  window.addEventListener('resize', resize); resize();

  function generateWorld() {
    game.player = { x: 5, y: 5, z: 0, vz: 0, angle: 0 }; game.camera = { x: 0, y: 0 }; game.pet = { x: 4.3, y: 5.5, z: 0 }; game.collected = 0; game.coins = []; game.blocks = []; game.particles = [];
    const fixed = [[2,2,2,2],[2,3,2,2],[3,2,1,3],[8,3,1,2],[9,3,2,2],[8,4,1,2],[3,8,1,1],[7,8,2,3],[8,8,1,3],[10,7,1,2],[1,7,1,1]];
    if (Array.isArray(game.loadedBlocks)) game.blocks = game.loadedBlocks.map(block => ({ ...block }));
    else fixed.forEach(([x,y,h,type]) => game.blocks.push({ x,y,h,type }));
    [[3.5,5.5],[6.5,2.6],[9.3,6.1],[4.2,9.1],[8.3,9.5],[1.8,3.8],[10.2,3.1],[6.1,8.1]].forEach(([x,y], index) => game.coins.push({ x,y,z:.45,got:false,phase:index }));
    updateQuest();
  }

  function launchGame(key, publishedLaunch = false) {
    const ownedWorld = profile.worlds.find(world => world.id === key);
    const publishedGames = readPublishedGames();
    const publishedWorld = publishedGames.find(world => world.id === key);
    const worldRecord = publishedLaunch ? publishedWorld : ownedWorld;
    const selectedWorld = worldRecord ? worldConfigFromRecord(worldRecord) : worlds[key];
    if (!selectedWorld) return;
    const signedInPlayer = sessionMode === 'account';
    const isWorldOwner = (!!ownedWorld && !publishedLaunch) || (signedInPlayer && String(worldRecord.owner || '').toLowerCase() === profile.name.toLowerCase());
    const invite = (Array.isArray(worldRecord.invites) ? worldRecord.invites : []).find(item => String(item.username || '').toLowerCase() === profile.name.toLowerCase());
    game.world = selectedWorld; game.userWorldId = !publishedLaunch && ownedWorld ? ownedWorld.id : null; game.publishedWorldId = publishedLaunch && publishedWorld ? publishedWorld.id : null; game.isWorldOwner = isWorldOwner; game.canBuild = isWorldOwner || signedInPlayer && !!invite?.canBuild; game.loadedBlocks = Array.isArray(worldRecord.blocks) ? worldRecord.blocks.map(block => ({ ...block })) : null; game.worldSize = Math.max(12, Math.min(32, Number(worldRecord.size) || 12)); game.active = true; game.paused = false; game.buildMode = false; game.time = 0;
    if (publishedLaunch && publishedWorld) { publishedWorld.plays = (publishedWorld.plays || 0) + 1; writePublishedGames(publishedGames); renderPublishedGames(); }
    else if (ownedWorld) { ownedWorld.visits = (ownedWorld.visits || 0) + 1; saveProfile(); }
    $('#worldName').textContent = game.world.name; $('#worldIcon').textContent = game.world.icon; $('#serverName').textContent = game.canBuild ? (game.isWorldOwner ? 'Owner build access' : 'Builder permission granted') : 'Play-only access';
    $('#questTitle').textContent = game.world.quest; $('#questText').textContent = game.world.text;
    $('#gameScreen').classList.add('active'); $('#pausePanel').classList.remove('show'); $('#buildToolbar').classList.remove('show'); $('#mobileBuild').classList.remove('active'); $('#mobileBuild').classList.toggle('locked', !game.canBuild); $('#mobileBuild').textContent = game.canBuild ? 'BUILD' : 'VIEW';
    document.body.style.overflow = 'hidden'; generateWorld(); resize(); beep(330, .08); setTimeout(() => beep(660, .12), 100);
    game.last = performance.now(); requestAnimationFrame(loop);
  }
  $$('[data-game]').forEach(button => button.addEventListener('click', event => { event.stopPropagation(); launchGame(button.dataset.game); }));
  $$('.game-card').forEach(card => card.addEventListener('dblclick', () => launchGame($('.card-play', card).dataset.game)));

  function leaveGame() {
    game.active = false; game.paused = false; $('#gameScreen').classList.remove('active'); $('#gameShopModal').classList.remove('show'); document.body.style.overflow = ''; beep(280, .08);
  }
  function togglePause(force) {
    game.paused = typeof force === 'boolean' ? force : !game.paused;
    $('#pausePanel').classList.toggle('show', game.paused);
  }
  $('#exitGame').addEventListener('click', () => togglePause());
  $('#resumeGame').addEventListener('click', () => togglePause(false));
  $('#leaveGame').addEventListener('click', leaveGame);
  $('#resetPlayer').addEventListener('click', () => { game.player = { x: 5, y: 5, z: 0, vz: 0, angle: 0 }; togglePause(false); showToast('Character reset', 'Back at spawn'); });

  function openGameShop() {
    if (!game.active) return;
    game.paused = true;
    $('#pausePanel').classList.remove('show');
    renderPets();
    $('#gameShopModal').classList.add('show');
    beep(760, .08);
  }
  function closeGameShop() {
    $('#gameShopModal').classList.remove('show');
    if (game.active) game.paused = false;
  }
  $('#gameShopButton').addEventListener('click', openGameShop);
  $('#closeGameShop').addEventListener('click', closeGameShop);
  $('#gameShopModal').addEventListener('click', event => { if (event.target === $('#gameShopModal')) closeGameShop(); });

  function setBuildMode(enabled) {
    if (enabled && !game.canBuild) { showToast('Build permission required', 'The world owner has not allowed you to build'); beep(260, .1); return; }
    game.buildMode = enabled;
    $('#buildToolbar').classList.toggle('show', enabled);
    $('#mobileBuild').classList.toggle('active', enabled);
    beep(enabled ? 700 : 420);
  }

  window.addEventListener('keydown', event => {
    if (!game.active) return;
    const key = event.key.toLowerCase(); game.keys[key] = true;
    if ([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(key)) event.preventDefault();
    if (key === 'escape') { if ($('#gameShopModal').classList.contains('show')) closeGameShop(); else togglePause(); }
    if (key === 'b' && !event.repeat) setBuildMode(!game.buildMode);
    if (key === 'e' && !event.repeat) openGameShop();
    if (key === 'f' && nearNpc()) { showToast('Nova says hello!', 'Keep exploring, Builder!'); game.npc.talk = 2; }
  });
  window.addEventListener('keyup', event => { game.keys[event.key.toLowerCase()] = false; });
  $$('.mobile-controls button[data-key]').forEach(button => {
    const key = button.dataset.key;
    button.addEventListener('pointerdown', e => { e.preventDefault(); game.keys[key] = true; });
    button.addEventListener('pointerup', () => game.keys[key] = false);
    button.addEventListener('pointercancel', () => game.keys[key] = false);
  });
  $('#mobileBuild').addEventListener('click', () => setBuildMode(!game.buildMode));
  $('#mobileInteract').addEventListener('click', () => {
    if (nearNpc()) { showToast('Nova says hello!', 'Keep exploring, Builder!'); game.npc.talk = 2; beep(620); }
    else showToast('Nobody nearby', 'Move closer to another player');
  });
  $$('#buildToolbar button[data-block]').forEach(button => button.addEventListener('click', () => { $$('#buildToolbar button[data-block]').forEach(b => b.classList.toggle('active', b === button)); game.selectedBlock = +button.dataset.block; beep(620); }));
  $('#expandPlatform').addEventListener('click', () => {
    if (!game.active || !game.userWorldId) { showToast('Draft worlds only', 'Open your own world to expand it'); return; }
    if (game.worldSize >= 32) { showToast('Maximum size reached', 'This platform is already 32 × 32'); return; }
    game.worldSize = Math.min(32, game.worldSize + 4);
    const record = profile.worlds.find(world => world.id === game.userWorldId);
    if (record) { record.size = game.worldSize; saveProfile(); }
    showToast('Platform expanded!', `${game.worldSize} × ${game.worldSize} tiles`);
    beep(820, .12);
  });

  function screenToTile(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const sx = clientX - rect.left - canvas.clientWidth/2 + game.camera.x;
    const sy = clientY - rect.top - canvas.clientHeight*.37 + game.camera.y;
    return { x: Math.round(sy/tileH + sx/tileW), y: Math.round(sy/tileH - sx/tileW) };
  }
  function saveWorldBlocks() {
    const savedBlocks = game.blocks.map(block => ({ x:block.x, y:block.y, h:block.h, type:block.type }));
    if (game.userWorldId) {
      const record = profile.worlds.find(world => world.id === game.userWorldId);
      if (!record) return;
      record.blocks = savedBlocks;
      saveProfile();
      return;
    }
    if (game.publishedWorldId && game.canBuild) {
      const published = readPublishedGames();
      const liveWorld = published.find(world => world.id === game.publishedWorldId);
      if (!liveWorld) return;
      liveWorld.blocks = savedBlocks;
      liveWorld.lastBuiltBy = profile.name;
      liveWorld.updatedAt = new Date().toISOString();
      writePublishedGames(published);
    }
  }
  canvas.addEventListener('contextmenu', event => event.preventDefault());
  canvas.addEventListener('pointerdown', event => {
    if (!game.buildMode || game.paused || !game.canBuild) return;
    const tile = screenToTile(event.clientX, event.clientY);
    if (tile.x < 0 || tile.y < 0 || tile.x >= game.worldSize || tile.y >= game.worldSize) return;
    const index = game.blocks.findIndex(block => block.x === tile.x && block.y === tile.y);
    const removing = event.pointerType === 'mouse' ? event.button === 0 : game.selectedBlock === 0;
    const placementType = game.selectedBlock === 0 ? 1 : game.selectedBlock;
    if (removing) { if (index >= 0) game.blocks.splice(index, 1); }
    else if (index >= 0) game.blocks[index].h = Math.min(4, game.blocks[index].h + 1);
    else game.blocks.push({ x: tile.x, y: tile.y, h: 1, type: placementType });
    saveWorldBlocks();
    spawnParticles(tile.x + .5, tile.y + .5, .4, game.world.accent, 10); beep(removing ? 300 : 540);
  });

  function highestBlockAt(x, y) {
    const tx = Math.floor(x), ty = Math.floor(y), block = game.blocks.find(item => item.x === tx && item.y === ty);
    return block ? block.h : 0;
  }
  function nearNpc() { return Math.hypot(game.player.x - game.npc.x, game.player.y - game.npc.y) < 1.45; }

  function update(dt) {
    if (game.paused) return;
    game.time += dt;
    const p = game.player, speed = (game.keys.shift ? 4.4 : 3.2) * dt;
    let dx = 0, dy = 0;
    if (game.keys.w || game.keys.arrowup) { dx -= speed; dy -= speed; }
    if (game.keys.s || game.keys.arrowdown) { dx += speed; dy += speed; }
    if (game.keys.a || game.keys.arrowleft) { dx -= speed; dy += speed; }
    if (game.keys.d || game.keys.arrowright) { dx += speed; dy -= speed; }
    if (dx || dy) { const scale = Math.SQRT1_2; dx *= scale; dy *= scale; p.angle = Math.atan2(dy, dx); }
    const nx = Math.max(.25, Math.min(game.worldSize - .25, p.x + dx)), ny = Math.max(.25, Math.min(game.worldSize - .25, p.y + dy));
    const currentFloor = highestBlockAt(p.x, p.y), nextFloor = highestBlockAt(nx, ny);
    if (nextFloor <= currentFloor + 1 || p.z > nextFloor * .9) { p.x = nx; p.y = ny; }
    const floor = highestBlockAt(p.x, p.y);
    if ((game.keys[' '] || game.keys.space) && p.z <= floor + .01) { p.vz = 7.4; beep(360, .05, .012); }
    p.vz -= 18 * dt; p.z += p.vz * dt;
    if (p.z < floor) { p.z = floor; p.vz = 0; }
    const target = project(p.x, p.y, p.z);
    game.camera.x += (target.x - canvas.width/2) * dt * 2.2;
    game.camera.y += (target.y - canvas.height*.54) * dt * 2.2;
    if (profile.equippedPet) {
      const followX = Math.max(.25, Math.min(game.worldSize - .25, p.x - .72));
      const followY = Math.max(.25, Math.min(game.worldSize - .25, p.y + .48));
      const followSpeed = Math.min(1, dt * 5.5);
      game.pet.x += (followX - game.pet.x) * followSpeed;
      game.pet.y += (followY - game.pet.y) * followSpeed;
      game.pet.z = highestBlockAt(game.pet.x, game.pet.y);
    }
    game.coins.forEach(coin => {
      if (!coin.got && Math.hypot(p.x-coin.x,p.y-coin.y) < .52 && Math.abs(p.z-coin.z) < 1.2) {
        coin.got = true; game.collected++; profile.coins += 5; profile.xp = Math.min(500, profile.xp + 18); saveProfile();
        spawnParticles(coin.x,coin.y,coin.z,game.world.accent,18); showToast(game.world.name === 'CRYSTAL CAVERNS' ? 'Crystal recovered!' : 'Coin collected!', '+5 R • +18 XP'); updateQuest(); beep(920,.1,.035);
        if (game.collected === 5) setTimeout(() => { showToast('Quest complete!', '+50 R reward'); profile.coins += 50; saveProfile(); beep(1100,.2,.04); }, 500);
      }
    });
    game.particles.forEach(particle => { particle.z += particle.vz*dt; particle.x += particle.vx*dt; particle.y += particle.vy*dt; particle.vz -= 5*dt; particle.life -= dt; });
    game.particles = game.particles.filter(particle => particle.life > 0);
    if (game.npc.talk) game.npc.talk -= dt;
    $('#interactPrompt').classList.toggle('show', nearNpc());
  }

  function updateQuest() {
    $('#questCount').textContent = `${Math.min(5,game.collected)}/5`;
    $('#questProgress').style.width = `${Math.min(100,game.collected/5*100)}%`;
  }
  let toastTimer;
  function showToast(title, text) {
    const toast = $('#toast'); $('b',toast).textContent = title; $('small',toast).textContent = text; toast.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
  }
  function spawnParticles(x,y,z,color,count) { for(let i=0;i<count;i++) game.particles.push({x,y,z,vx:rand(-1,1),vy:rand(-1,1),vz:rand(1.5,4),life:rand(.4,.9),color}); }

  function drawDiamond(x,y,top,left,right,height=0) {
    const p = project(x,y,height), w=tileW/2,h=tileH/2;
    ctx.fillStyle=top;ctx.beginPath();ctx.moveTo(p.x,p.y-h);ctx.lineTo(p.x+w,p.y);ctx.lineTo(p.x,p.y+h);ctx.lineTo(p.x-w,p.y);ctx.closePath();ctx.fill();
    if(height>0){const bottom=project(x,y,0);ctx.fillStyle=left;ctx.beginPath();ctx.moveTo(p.x-w,p.y);ctx.lineTo(p.x,p.y+h);ctx.lineTo(bottom.x,bottom.y+h);ctx.lineTo(bottom.x-w,bottom.y);ctx.closePath();ctx.fill();ctx.fillStyle=right;ctx.beginPath();ctx.moveTo(p.x+w,p.y);ctx.lineTo(p.x,p.y+h);ctx.lineTo(bottom.x,bottom.y+h);ctx.lineTo(bottom.x+w,bottom.y);ctx.closePath();ctx.fill();}
  }

  function drawBlock(block) {
    const colors = block.type===3 ? ['#68ebff','#2a9bad','#1a748a'] : block.type===2 ? ['#99a3af','#69737e','#505966'] : [game.world.ground,shade(game.world.ground,-30),shade(game.world.ground,-45)];
    const p=project(block.x+.5,block.y+.5,block.h), w=tileW/2,h=tileH/2,b=project(block.x+.5,block.y+.5,0);
    ctx.fillStyle=colors[0];ctx.beginPath();ctx.moveTo(p.x,p.y-h);ctx.lineTo(p.x+w,p.y);ctx.lineTo(p.x,p.y+h);ctx.lineTo(p.x-w,p.y);ctx.closePath();ctx.fill();
    ctx.fillStyle=colors[1];ctx.beginPath();ctx.moveTo(p.x-w,p.y);ctx.lineTo(p.x,p.y+h);ctx.lineTo(b.x,b.y+h);ctx.lineTo(b.x-w,b.y);ctx.closePath();ctx.fill();
    ctx.fillStyle=colors[2];ctx.beginPath();ctx.moveTo(p.x+w,p.y);ctx.lineTo(p.x,p.y+h);ctx.lineTo(b.x,b.y+h);ctx.lineTo(b.x+w,b.y);ctx.closePath();ctx.fill();
    if(block.type===3){ctx.save();ctx.shadowColor='#5feaff';ctx.shadowBlur=20;ctx.strokeStyle='#9ff6ff';ctx.stroke();ctx.restore();}
  }

  function drawAvatar(x,y,z,isNpc=false) {
    const p=project(x,y,z), bounce=Math.sin(game.time*8)*((game.keys.w||game.keys.a||game.keys.s||game.keys.d)&&!isNpc?2:0), scale=1;
    ctx.save();ctx.translate(p.x,p.y-42+bounce);ctx.scale(scale,scale);
    ctx.fillStyle='#0004';ctx.beginPath();ctx.ellipse(0,43,22,8,0,0,Math.PI*2);ctx.fill();
    const shirt=isNpc?'#22b89a':profile.shirt, skin=isNpc?'#e9a96d':profile.skin, pants=isNpc?'#29355c':(profile.pants||'#28325e'), accent=isNpc?'#e9f4ff':(profile.accent||'#55e6ff');
    // legs
    ctx.fillStyle=pants;ctx.fillRect(-17,20,14,29);ctx.fillRect(3,20,14,29);
    // arms and body
    ctx.fillStyle=skin;ctx.fillRect(-27,-12,10,31);ctx.fillRect(17,-12,10,31);ctx.fillStyle=shirt;ctx.fillRect(-18,-17,36,40);
    if(!isNpc&&profile.outfit==='stripe'){ctx.fillStyle=accent;ctx.fillRect(-4,-17,8,40);}
    else if(!isNpc&&profile.outfit==='hoodie'){ctx.strokeStyle=accent;ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,-14,12,0,Math.PI);ctx.stroke();}
    else if(!isNpc&&profile.outfit==='cyber'){ctx.strokeStyle=accent;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-12,4);ctx.lineTo(-3,4);ctx.lineTo(2,-6);ctx.lineTo(7,13);ctx.lineTo(14,13);ctx.stroke();}
    else{ctx.fillStyle='#fff';ctx.font='bold 18px Chakra Petch';ctx.textAlign='center';ctx.fillText(isNpc?'N':'R',0,10);}
    // head
    ctx.fillStyle=skin;ctx.fillRect(-15,-47,30,27);ctx.fillStyle='#202330';ctx.fillRect(-8,-37,3,4);ctx.fillRect(6,-37,3,4);ctx.fillRect(-4,-29,9,2);
    ctx.fillStyle=isNpc?'#e9f4ff':(profile.hairColor||'#2b1b18');
    if(isNpc||profile.hair==='spikes'){ctx.beginPath();ctx.moveTo(-17,-46);ctx.lineTo(-13,-60);ctx.lineTo(-6,-50);ctx.lineTo(0,-63);ctx.lineTo(6,-50);ctx.lineTo(14,-59);ctx.lineTo(17,-45);ctx.closePath();ctx.fill();}
    else if(profile.hair==='cap'){ctx.beginPath();ctx.ellipse(0,-49,18,10,0,Math.PI,0);ctx.fill();ctx.fillRect(8,-50,16,4);}
    if(isNpc){ctx.fillStyle='#111827cc';ctx.fillRect(-25,-80,50,15);ctx.fillStyle='#fff';ctx.font='bold 8px Inter';ctx.fillText('NOVA',0,-70);}
    ctx.restore();
  }

  function drawPet() {
    const pet = [...petCatalog, ...(profile.customPets || [])].find(item => item.id === profile.equippedPet);
    if (!pet) return;
    const p = project(game.pet.x, game.pet.y, game.pet.z), bob = Math.sin(game.time * 5) * 2;
    ctx.save(); ctx.translate(p.x, p.y - 22 + bob);
    ctx.fillStyle = '#0005'; ctx.beginPath(); ctx.ellipse(0, 23, 18, 6, 0, 0, Math.PI * 2); ctx.fill();
    if (pet.type === 'dragon') { ctx.fillStyle = pet.accent; ctx.beginPath(); ctx.moveTo(-14,-7);ctx.lineTo(-27,-18);ctx.lineTo(-22,3);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(14,-7);ctx.lineTo(27,-18);ctx.lineTo(22,3);ctx.closePath();ctx.fill(); }
    if (pet.type === 'cat' || pet.type === 'dragon') { ctx.fillStyle = pet.color; ctx.beginPath();ctx.moveTo(-13,-17);ctx.lineTo(-9,-30);ctx.lineTo(-2,-18);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(13,-17);ctx.lineTo(9,-30);ctx.lineTo(2,-18);ctx.closePath();ctx.fill(); }
    if (pet.type === 'pup') { ctx.fillStyle = pet.accent; ctx.fillRect(-18,-20,7,15);ctx.fillRect(11,-20,7,15); }
    ctx.fillStyle = pet.color; ctx.fillRect(-15,-19,30,27); ctx.fillRect(-11,8,8,12); ctx.fillRect(3,8,8,12);
    if (pet.type === 'bot') { ctx.strokeStyle = pet.accent;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,-19);ctx.lineTo(0,-29);ctx.stroke();ctx.fillStyle=pet.accent;ctx.fillRect(-3,-33,6,6); }
    ctx.fillStyle = '#182035'; ctx.fillRect(-8,-9,4,5);ctx.fillRect(4,-9,4,5);
    ctx.fillStyle = pet.accent; ctx.fillRect(-10,1,20,3);
    ctx.fillStyle = '#101728dd';ctx.fillRect(-25,-48,50,13);ctx.fillStyle='#fff';ctx.font='bold 7px Inter';ctx.textAlign='center';ctx.fillText(pet.name.toUpperCase(),0,-39);
    ctx.restore();
  }

  function drawCoin(coin) {
    const p=project(coin.x,coin.y,coin.z+Math.sin(game.time*2.8+coin.phase)*.16), squash=Math.abs(Math.cos(game.time*2.4+coin.phase));
    ctx.save();ctx.translate(p.x,p.y-19);ctx.shadowColor=game.world.accent;ctx.shadowBlur=18;ctx.fillStyle=game.world.accent;ctx.beginPath();ctx.ellipse(0,0,10*squash+2,14,0,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#4d3b12';ctx.font='bold 9px Chakra Petch';ctx.textAlign='center';ctx.fillText(game.world===worlds.caverns?'◆':'R',0,3);ctx.restore();
  }

  function drawDecor() {
    const edge = game.worldSize - 1;
    [[1.1,1.3],[edge-.5,1.1],[.7,edge-1.3],[edge,edge-.2]].forEach(([x,y],i)=>{
      const p=project(x,y,0);ctx.fillStyle=i%2?'#754a2d':'#5a3a27';ctx.fillRect(p.x-3,p.y-32,6,32);ctx.fillStyle=shade(game.world.ground,i%2?15:25);ctx.beginPath();ctx.arc(p.x,p.y-42,17,0,Math.PI*2);ctx.arc(p.x-11,p.y-33,13,0,Math.PI*2);ctx.arc(p.x+11,p.y-33,13,0,Math.PI*2);ctx.fill();
    });
  }

  function render() {
    const w=canvas.width,h=canvas.height,gradient=ctx.createLinearGradient(0,0,0,h);gradient.addColorStop(0,game.world.sky[0]);gradient.addColorStop(1,game.world.sky[1]);ctx.fillStyle=gradient;ctx.fillRect(0,0,w,h);
    // distant silhouettes
    ctx.fillStyle='#ffffff10';for(let i=0;i<12;i++){const x=(i*173-game.camera.x*.08)%(w+180)-90, height=70+(i*47)%170;ctx.fillRect(x,h*.22-height/2,80,height);}
    const groundTop=game.world.ground,groundLeft=shade(groundTop,-35),groundRight=shade(groundTop,-50);
    const size=game.worldSize;
    for(let sum=0;sum<=2*(size-1);sum++)for(let x=0;x<size;x++){const y=sum-x;if(y<0||y>=size)continue;const p=project(x+.5,y+.5,0),tw=tileW/2,th=tileH/2;ctx.fillStyle=(x+y)%2?groundTop:shade(groundTop,5);ctx.beginPath();ctx.moveTo(p.x,p.y-th);ctx.lineTo(p.x+tw,p.y);ctx.lineTo(p.x,p.y+th);ctx.lineTo(p.x-tw,p.y);ctx.closePath();ctx.fill();ctx.strokeStyle='#ffffff0b';ctx.stroke();if(x===size-1||y===size-1){ctx.fillStyle=x===size-1?groundRight:groundLeft;ctx.beginPath();ctx.moveTo(p.x+(x===size-1?tw:-tw),p.y);ctx.lineTo(p.x,p.y+th);ctx.lineTo(p.x,p.y+th+35);ctx.lineTo(p.x+(x===size-1?tw:-tw),p.y+35);ctx.closePath();ctx.fill();}}
    const drawables=[];game.blocks.forEach(block=>drawables.push({sort:block.x+block.y+.1,fn:()=>drawBlock(block)}));game.coins.filter(c=>!c.got).forEach(c=>drawables.push({sort:c.x+c.y,fn:()=>drawCoin(c)}));drawables.push({sort:game.npc.x+game.npc.y,fn:()=>drawAvatar(game.npc.x,game.npc.y,0,true)});if(profile.equippedPet)drawables.push({sort:game.pet.x+game.pet.y+.05,fn:drawPet});drawables.push({sort:game.player.x+game.player.y,fn:()=>drawAvatar(game.player.x,game.player.y,game.player.z,false)});drawables.sort((a,b)=>a.sort-b.sort).forEach(d=>d.fn());
    drawDecor();
    game.particles.forEach(particle=>{const p=project(particle.x,particle.y,particle.z);ctx.globalAlpha=Math.max(0,particle.life*1.5);ctx.fillStyle=particle.color;ctx.fillRect(p.x-3,p.y-3,6,6);ctx.globalAlpha=1;});
  }

  function loop(now) {
    if (!game.active) return;
    const dt=Math.min(.034,(now-game.last)/1000||0);game.last=now;update(dt);render();requestAnimationFrame(loop);
  }
})();
