(() => {
  'use strict';

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const escapeHTML = value => String(value).replace(/[&<>'"]/g, character => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' })[character]);
  const appConfig = window.ROBOX_CONFIG || {};
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

  const defaultProfile = (name = 'Guest_Player') => ({
    name, coins: 100, xp: 0, level: 1, skin: '#f5b640', shirt: '#7557ff', hair: 'spikes',
    dailyClaimed: false, streak: 1, friends: [], worlds: [], deletedWorldIds: [], ageVerified: false, ageGroup: null
  });
  const readSavedAccount = () => {
    try { return JSON.parse(localStorage.getItem('robox-account') || 'null'); }
    catch (_) { return null; }
  };
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

  const saveProfile = () => {
    if (sessionMode === 'account') {
      localStorage.setItem('robox-account', JSON.stringify({ username: profile.name, profile }));
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
    ['walletCoins', 'avatarCoins', 'gameCoins'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = profile.coins; });
    $('#profileLevel').textContent = profile.level;
    $('#profileName').textContent = profile.name;
    $('#welcomeName').textContent = profile.name;
    document.documentElement.style.setProperty('--skin', profile.skin);
    document.documentElement.style.setProperty('--shirt', profile.shirt);
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
    renderFriends();
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
    const saved = readSavedAccount();
    const needsVerification = !!saved && !saved.profile?.ageVerified;
    $('#signInAgeVerification').classList.toggle('hidden', !needsVerification);
  }
  function syncCustomizer() {
    $$('#skinSwatches button').forEach(button => button.classList.toggle('active', button.dataset.color === profile.skin));
    $$('#shirtSwatches button').forEach(button => button.classList.toggle('active', button.dataset.color === profile.shirt));
    $$('#hairStyles button').forEach(button => button.classList.toggle('active', button.dataset.hair === profile.hair));
    $('#studioAvatar .a-hair').className = `a-hair ${profile.hair}`;
  }
  function enterSession(nextProfile, mode) {
    profile = Object.assign(defaultProfile(nextProfile.name), nextProfile);
    if (!Array.isArray(profile.friends)) profile.friends = [];
    if (!Array.isArray(profile.worlds)) profile.worlds = [];
    if (!Array.isArray(profile.deletedWorldIds)) profile.deletedWorldIds = [];
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
  $('#createAccountForm').addEventListener('submit', event => {
    event.preventDefault();
    const username = $('#createUsername').value.trim();
    if (!/^[A-Za-z0-9_]{3,16}$/.test(username)) { showAuthMessage('Use 3–16 letters, numbers, or underscores.'); return; }
    const ageCheck = verifyAge($('#createBirthdate').value, $('#confirmAge').checked);
    if (ageCheck.error) { showAuthMessage(ageCheck.error); return; }
    const next = defaultProfile(username);
    next.ageVerified = true;
    next.ageGroup = ageCheck.ageGroup;
    localStorage.setItem('robox-account', JSON.stringify({ username, profile: next }));
    enterSession(next, 'account');
  });
  $('#signInForm').addEventListener('submit', event => {
    event.preventDefault();
    const saved = readSavedAccount(), username = $('#signInUsername').value.trim();
    if (!saved) { showAuthMessage('No account is saved on this device yet.'); return; }
    if (saved.username.toLowerCase() !== username.toLowerCase()) { showAuthMessage('That player name does not match the saved account.'); return; }
    if (!saved.profile?.ageVerified) {
      const ageCheck = verifyAge($('#signInBirthdate').value, $('#signInConfirmAge').checked);
      if (ageCheck.error) { showAuthMessage(ageCheck.error); return; }
      saved.profile.ageVerified = true;
      saved.profile.ageGroup = ageCheck.ageGroup;
      localStorage.setItem('robox-account', JSON.stringify(saved));
    }
    enterSession(saved.profile, 'account');
  });
  $('#continueGuest').addEventListener('click', () => enterSession(defaultProfile(), 'guest'));
  const savedOnLoad = readSavedAccount();
  if (savedOnLoad) { $('#signInUsername').value = savedOnLoad.username; $('#savedAccountHint').textContent = `Saved player found: ${savedOnLoad.username}`; selectAuthTab('signin'); }

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
    { version:'UPDATE 4 • LATEST', badge:'UPDATE 4', title:'Invites & Permissions', summary:'World owners can invite players by username and decide who gets build access.', features:['Invite exact player usernames','Choose play-only or Can Build','Change permissions or remove invites'] },
    { version:'UPDATE 3', badge:'UPDATE 3', title:'Expandable Worlds', summary:'Creators can grow their platform and share a finished game with everyone.', features:['Expand platforms up to 32 × 32','Publish and update live games','Right-click to place and left-click to wreck'] },
    { version:'UPDATE 2', badge:'UPDATE 2', title:'World Creator', summary:'Every experience begins with a world made by a player.', features:['Create named worlds with four environments','Save block changes automatically','Delete drafts and their published copy'] },
    { version:'UPDATE 1', badge:'UPDATE 1', title:'Accounts & Friends', summary:'Player profiles start clean and stay saved on the device.', features:['Age verification for accounts','Add and unfriend by username','Start daily rewards at Day 1'] }
  ];
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

  $('#soundToggle').addEventListener('click', event => {
    audioEnabled = !audioEnabled;
    event.currentTarget.classList.toggle('muted', !audioEnabled);
    event.currentTarget.querySelector('span').textContent = audioEnabled ? '♪' : '×';
    beep(640);
  });

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
  $('#settingsBtn').addEventListener('click', () => settingsModal.classList.add('show'));
  $$('[data-close]').forEach(button => button.addEventListener('click', () => settingsModal.classList.remove('show')));
  settingsModal.addEventListener('click', e => { if (e.target === settingsModal) settingsModal.classList.remove('show'); });
  $('#signOutButton').addEventListener('click', () => {
    if (game.active) leaveGame();
    settingsModal.classList.remove('show');
    sessionMode = 'signed-out'; profile = defaultProfile(); updateProfileUI(); syncCustomizer();
    $('#appShell').setAttribute('inert', '');
    accountScreen.classList.remove('hidden');
    const saved = readSavedAccount();
    $('#createUsername').value = '';
    if (saved) { $('#signInUsername').value = saved.username; $('#savedAccountHint').textContent = `Saved player found: ${saved.username}`; selectAuthTab('signin'); }
  });
  const worlds = {};

  const canvas = $('#gameCanvas');
  const ctx = canvas.getContext('2d');
  const game = {
    active: false, paused: false, world: null, userWorldId: null, publishedWorldId: null, canBuild: false, isWorldOwner: false, loadedBlocks: null, worldSize: 12, last: 0, time: 0, keys: {}, buildMode: false, selectedBlock: 1,
    player: { x: 5, y: 5, z: 0, vz: 0, angle: 0 }, camera: { x: 0, y: 0 }, collected: 0,
    coins: [], blocks: [], particles: [], npc: { x: 7.5, y: 5.5, name: 'Nova' }
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
    game.player = { x: 5, y: 5, z: 0, vz: 0, angle: 0 }; game.camera = { x: 0, y: 0 }; game.collected = 0; game.coins = []; game.blocks = []; game.particles = [];
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
    game.active = false; game.paused = false; $('#gameScreen').classList.remove('active'); document.body.style.overflow = ''; beep(280, .08);
  }
  function togglePause(force) {
    game.paused = typeof force === 'boolean' ? force : !game.paused;
    $('#pausePanel').classList.toggle('show', game.paused);
  }
  $('#exitGame').addEventListener('click', () => togglePause());
  $('#resumeGame').addEventListener('click', () => togglePause(false));
  $('#leaveGame').addEventListener('click', leaveGame);
  $('#resetPlayer').addEventListener('click', () => { game.player = { x: 5, y: 5, z: 0, vz: 0, angle: 0 }; togglePause(false); showToast('Character reset', 'Back at spawn'); });

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
    if (key === 'escape') togglePause();
    if (key === 'b' && !event.repeat) setBuildMode(!game.buildMode);
    if (key === 'e' && nearNpc()) { showToast('Nova says hello!', 'Keep exploring, Builder!'); game.npc.talk = 2; }
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
    const shirt=isNpc?'#22b89a':profile.shirt, skin=isNpc?'#e9a96d':profile.skin;
    // legs
    ctx.fillStyle=isNpc?'#29355c':'#28325e';ctx.fillRect(-17,20,14,29);ctx.fillRect(3,20,14,29);
    // arms and body
    ctx.fillStyle=skin;ctx.fillRect(-27,-12,10,31);ctx.fillRect(17,-12,10,31);ctx.fillStyle=shirt;ctx.fillRect(-18,-17,36,40);
    ctx.fillStyle='#fff';ctx.font='bold 18px Chakra Petch';ctx.textAlign='center';ctx.fillText(isNpc?'N':'R',0,10);
    // head
    ctx.fillStyle=skin;ctx.fillRect(-15,-47,30,27);ctx.fillStyle='#202330';ctx.fillRect(-8,-37,3,4);ctx.fillRect(6,-37,3,4);ctx.fillRect(-4,-29,9,2);
    ctx.fillStyle=isNpc?'#e9f4ff':'#2b1b18';
    if(isNpc||profile.hair==='spikes'){ctx.beginPath();ctx.moveTo(-17,-46);ctx.lineTo(-13,-60);ctx.lineTo(-6,-50);ctx.lineTo(0,-63);ctx.lineTo(6,-50);ctx.lineTo(14,-59);ctx.lineTo(17,-45);ctx.closePath();ctx.fill();}
    else if(profile.hair==='cap'){ctx.beginPath();ctx.ellipse(0,-49,18,10,0,Math.PI,0);ctx.fill();ctx.fillRect(8,-50,16,4);}
    if(isNpc){ctx.fillStyle='#111827cc';ctx.fillRect(-25,-80,50,15);ctx.fillStyle='#fff';ctx.font='bold 8px Inter';ctx.fillText('NOVA',0,-70);}
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
    const drawables=[];game.blocks.forEach(block=>drawables.push({sort:block.x+block.y+.1,fn:()=>drawBlock(block)}));game.coins.filter(c=>!c.got).forEach(c=>drawables.push({sort:c.x+c.y,fn:()=>drawCoin(c)}));drawables.push({sort:game.npc.x+game.npc.y,fn:()=>drawAvatar(game.npc.x,game.npc.y,0,true)});drawables.push({sort:game.player.x+game.player.y,fn:()=>drawAvatar(game.player.x,game.player.y,game.player.z,false)});drawables.sort((a,b)=>a.sort-b.sort).forEach(d=>d.fn());
    drawDecor();
    game.particles.forEach(particle=>{const p=project(particle.x,particle.y,particle.z);ctx.globalAlpha=Math.max(0,particle.life*1.5);ctx.fillStyle=particle.color;ctx.fillRect(p.x-3,p.y-3,6,6);ctx.globalAlpha=1;});
  }

  function loop(now) {
    if (!game.active) return;
    const dt=Math.min(.034,(now-game.last)/1000||0);game.last=now;update(dt);render();requestAnimationFrame(loop);
  }
})();
