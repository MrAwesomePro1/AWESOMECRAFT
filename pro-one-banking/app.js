(() => {
  'use strict';

  const storageKey = 'pro-one-banking-wallets-v1';
  const $ = selector => document.querySelector(selector);
  const escapeHTML = value => String(value).replace(/[&<>'"]/g, character => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' })[character]);
  const format = value => Number(value || 0).toLocaleString();
  const readWholeAmount = value => {
    const amount = Math.floor(Number(value));
    return Number.isFinite(amount) && amount > 0 ? amount : 0;
  };
  let activeWalletId = new URLSearchParams(location.search).get('wallet') || '';
  const requestedPlayer = new URLSearchParams(location.search).get('player') || '';

  function readBank() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
      return saved && typeof saved === 'object' ? { version:1, wallets:{}, ...saved, wallets: saved.wallets && typeof saved.wallets === 'object' ? saved.wallets : {} } : { version:1, wallets:{} };
    } catch (_) { return { version:1, wallets:{} }; }
  }

  function writeBank(bank) {
    localStorage.setItem(storageKey, JSON.stringify({ version:1, wallets: bank.wallets || {}, updatedAt:new Date().toISOString() }));
  }

  function walletIdForName(name) {
    const cleaned = String(name || 'ProOnePlayer').trim().toLowerCase().replace(/[^a-z0-9_]/g, '-') || 'prooneplayer';
    return `robox:${cleaned}`;
  }

  function transaction(change, note, balance) {
    return { id:`bank-${Date.now()}-${Math.random().toString(16).slice(2)}`, app:'Pro One Banking', change, note, balance, at:new Date().toISOString() };
  }

  function getOrCreateWallet(name = requestedPlayer || 'ProOnePlayer') {
    const bank = readBank();
    const id = activeWalletId || walletIdForName(name);
    const owner = String(name || id.replace(/^robox:/, '')).trim() || 'ProOnePlayer';
    if (!bank.wallets[id]) {
      bank.wallets[id] = {
        id,
        owner,
        currency:'Kidtopia Money',
        connectedApps:['Pro One Banking'],
        balance:5000,
        updatedAt:new Date().toISOString(),
        transactions:[transaction(0, 'Wallet opened on Pro One Banking website', 5000)]
      };
      writeBank(bank);
    }
    activeWalletId = id;
    history.replaceState(null, '', `?wallet=${encodeURIComponent(id)}&player=${encodeURIComponent(bank.wallets[id].owner)}`);
    return bank.wallets[id];
  }

  function showToast(message) {
    const toast = $('#toast');
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove('show'), 1700);
  }

  function render() {
    const bank = readBank();
    const wallet = activeWalletId ? bank.wallets[activeWalletId] : null;
    $('#walletStatus').textContent = wallet ? 'Connected wallet' : 'No wallet selected';
    $('#walletBalance').textContent = format(wallet?.balance || 0);
    $('#walletOwner').textContent = wallet ? `${wallet.owner} • ${wallet.currency}` : 'Open from Robox or create a wallet.';
    $('#walletName').value = wallet?.owner || requestedPlayer || '';
    $('#openRoboxLink').href = `../robox-2-0/?version=22${wallet ? `&bankWallet=${encodeURIComponent(wallet.id)}` : ''}`;

    const transactions = Array.isArray(wallet?.transactions) ? wallet.transactions : [];
    $('#transactionList').innerHTML = transactions.length ? transactions.map(item => `
      <article class="transaction">
        <div><b>${escapeHTML(item.note || 'Wallet update')}</b><small>${escapeHTML(item.app || 'Pro One Banking')} • ${new Date(item.at || Date.now()).toLocaleString()}</small></div>
        <em class="${Number(item.change) < 0 ? 'negative' : ''}">${Number(item.change) > 0 ? '+' : ''}K ${format(item.change || 0)}</em>
      </article>
    `).join('') : '<div class="empty">No transactions yet.</div>';

    const wallets = Object.values(bank.wallets || {}).sort((a, b) => String(a.owner).localeCompare(String(b.owner)));
    $('#walletList').innerHTML = wallets.length ? wallets.map(item => `
      <article class="wallet-row">
        <div><b>${escapeHTML(item.owner || 'Wallet')}</b><small>K ${format(item.balance)} • ${escapeHTML(item.id)}</small></div>
        <button data-wallet="${escapeHTML(item.id)}">OPEN</button>
      </article>
    `).join('') : '<div class="empty">No saved wallets on this browser yet.</div>';
  }

  function adjustWallet(direction) {
    const wallet = getOrCreateWallet($('#walletName').value || requestedPlayer || 'ProOnePlayer');
    const amount = readWholeAmount($('#transferAmount').value);
    if (!amount) {
      showToast('Enter an amount of 1 or more');
      return;
    }
    const change = direction === 'withdraw' ? -amount : amount;
    const bank = readBank();
    const current = bank.wallets[wallet.id];
    const startingBalance = Number(current.balance || 0);
    current.balance = direction === 'deposit' ? startingBalance + amount : Math.max(0, startingBalance - amount);
    current.updatedAt = new Date().toISOString();
    current.connectedApps = [...new Set([...(current.connectedApps || []), 'Pro One Banking'])];
    const actualChange = direction === 'deposit' ? amount : current.balance - startingBalance;
    current.transactions = [transaction(actualChange, $('#transferNote').value || (direction === 'deposit' ? 'Exact deposit' : 'Website withdrawal'), current.balance), ...(current.transactions || [])].slice(0, 60);
    writeBank(bank);
    render();
    showToast(direction === 'withdraw' ? 'Withdrawal saved' : 'Deposit saved');
  }

  $('#walletForm').addEventListener('submit', event => {
    event.preventDefault();
    getOrCreateWallet($('#walletName').value || requestedPlayer || 'ProOnePlayer');
    render();
    showToast('Wallet opened');
  });

  $('#createWalletButton').addEventListener('click', () => {
    getOrCreateWallet($('#walletName').value || requestedPlayer || 'ProOnePlayer');
    render();
    showToast('Wallet ready');
  });

  $('#syncWalletButton').addEventListener('click', () => {
    if (!activeWalletId) getOrCreateWallet($('#walletName').value || requestedPlayer || 'ProOnePlayer');
    render();
    showToast('Wallet synced');
  });

  document.addEventListener('click', event => {
    const walletButton = event.target.closest('[data-wallet]');
    if (walletButton) {
      activeWalletId = walletButton.dataset.wallet;
      render();
      showToast('Wallet opened');
      return;
    }
    const transferButton = event.target.closest('[data-transfer]');
    if (transferButton) adjustWallet(transferButton.dataset.transfer);
  });

  window.addEventListener('storage', event => { if (event.key === storageKey) render(); });

  if (activeWalletId || requestedPlayer) getOrCreateWallet(requestedPlayer || activeWalletId.replace(/^robox:/, ''));
  render();
})();
