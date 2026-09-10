(() => {
  const cfg = window.GUDAO_SUPABASE_CONFIG || {};
  const isConfigured = /^https:\/\/[^/]+\.supabase\.co\/?$/.test(cfg.url || '') && /^(sb_publishable_|eyJ)/.test(cfg.publishableKey || '') && /^[0-9a-f-]{36}$/i.test(cfg.eventId || '');
  const db = isConfigured ? window.supabase.createClient(cfg.url, cfg.publishableKey, { auth: { persistSession: true, autoRefreshToken: true } }) : null;
  const $ = selector => document.querySelector(selector);
  let session = null;
  let source = 'cloud';
  let eventInfo = null;
  let cloudEntries = [];
  let prizes = [];
  let results = [];
  let drawing = false;

  const clean = value => String(value ?? '').trim();
  const csvCell = value => `"${String(value ?? '').replaceAll('"', '""')}"`;
  const setStatus = (selector, text, type = '') => { const element = $(selector); element.textContent = text; element.className = `status-text ${type}`; };

  function setSource(next) {
    source = next;
    $('#source-cloud').classList.toggle('active', next === 'cloud');
    $('#source-manual').classList.toggle('active', next === 'manual');
    $('#cloud-source').hidden = next !== 'cloud';
    $('#manual-source').hidden = next !== 'manual';
    refreshDrawState();
  }

  $('#source-cloud').addEventListener('click', () => setSource('cloud'));
  $('#source-manual').addEventListener('click', () => setSource('manual'));
  $('#auth-button').addEventListener('click', async () => {
    if (session) {
      await db.auth.signOut();
    } else {
      $('#login-modal').hidden = false;
    }
  });
  $('#close-login').addEventListener('click', () => $('#login-modal').hidden = true);
  $('#show-password').addEventListener('click', event => {
    const input = $('#admin-password');
    input.type = input.type === 'password' ? 'text' : 'password';
    event.currentTarget.textContent = input.type === 'password' ? '顯示' : '隱藏';
  });

  $('#login-form').addEventListener('submit', async event => {
    event.preventDefault();
    if (!db) return setStatus('#login-message', 'Supabase 設定尚未完成。', 'error');
    const { error } = await db.auth.signInWithPassword({ email: clean($('#admin-email').value), password: $('#admin-password').value });
    if (error) return setStatus('#login-message', 'Email 或密碼不正確。', 'error');
    $('#admin-password').value = '';
    $('#login-modal').hidden = true;
  });

  $('#load-cloud').addEventListener('click', loadCloudEntries);
  $('#apply-prizes').addEventListener('click', () => {
    prizes = parsePrizes($('#prize-input').value);
    results = [];
    renderResults();
    $('#prize-summary').textContent = prizes.length ? `已設定 ${prizes.length} 個獎項` : '尚未設定獎項';
    refreshDrawState();
  });
  $('#draw-button').addEventListener('click', draw);
  $('#reset-draw').addEventListener('click', () => {
    if (results.length && !confirm('確定清除本次所有抽獎結果？')) return;
    results = [];
    renderResults();
    $('#winner-number').textContent = '---';
    $('#winner-account').textContent = '等待抽獎';
    setStatus('#draw-message', '已清除本次抽獎結果。', 'success');
    refreshDrawState();
  });
  $('#export-results').addEventListener('click', exportResults);
  $('#range-start').addEventListener('input', refreshDrawState);
  $('#range-end').addEventListener('input', refreshDrawState);
  $('#no-repeat').addEventListener('change', refreshDrawState);

  function parsePrizes(text) {
    const output = [];
    text.split(/\r?\n/).map(clean).filter(Boolean).forEach(line => {
      const match = line.match(/^(.*?)\s*[xX×]\s*(\d+)$/);
      if (!match) return output.push(line);
      const name = clean(match[1]);
      const count = Math.min(100, Math.max(1, Number(match[2])));
      for (let i = 0; i < count; i += 1) output.push(name);
    });
    return output;
  }

  function getCandidates() {
    if (source === 'cloud') {
      return cloudEntries.map(entry => ({ number: entry.entry_number, account: entry.ig_account, id: entry.id }));
    }
    const start = Math.floor(Number($('#range-start').value));
    const end = Math.floor(Number($('#range-end').value));
    if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end < start || end - start > 1000000) return [];
    return Array.from({ length: end - start + 1 }, (_, index) => ({ number: start + index, account: '', id: `manual-${start + index}` }));
  }

  function availableCandidates() {
    const candidates = getCandidates();
    if (!$('#no-repeat').checked) return candidates;
    const used = new Set(results.map(result => result.candidate.id));
    return candidates.filter(candidate => !used.has(candidate.id));
  }

  function refreshDrawState() {
    const nextIndex = results.length;
    const currentPrize = prizes[nextIndex];
    const candidates = availableCandidates();
    $('#current-prize').textContent = currentPrize || (prizes.length ? '所有獎項已完成' : '等待設定獎項');
    $('#progress-chip').textContent = `${Math.min(nextIndex, prizes.length)} / ${prizes.length}`;
    $('#draw-button').disabled = drawing || !currentPrize || !candidates.length || (source === 'cloud' && !session);
    if (source === 'cloud' && !session) setStatus('#draw-message', 'Supabase 名單模式需要先登入 Admin。');
    else if (source === 'cloud' && !cloudEntries.length) setStatus('#draw-message', '請先讀取雲端名單。');
    else if (!prizes.length) setStatus('#draw-message', '請先設定獎項。');
    else if (!currentPrize) setStatus('#draw-message', '所有獎項已完成。', 'success');
    else if (!candidates.length) setStatus('#draw-message', '沒有可抽取的參加者。', 'error');
    else setStatus('#draw-message', `可抽取 ${candidates.length} 位參加者。`);
  }

  async function loadCloudEntries() {
    if (!db || !session) return setStatus('#draw-message', '請先登入 Admin。', 'error');
    const [eventResult, entryResult] = await Promise.all([
      db.from('raffle_events').select('id,event_name,registration_open,next_number').eq('id', cfg.eventId).maybeSingle(),
      db.from('raffle_entries').select('id,entry_number,ig_account,created_at').eq('event_id', cfg.eventId).order('entry_number', { ascending: true })
    ]);
    if (eventResult.error) return setStatus('#draw-message', `讀取活動失敗：${eventResult.error.message}`, 'error');
    if (!eventResult.data) return setStatus('#draw-message', '找不到目前 Event ID 對應的活動。', 'error');
    if (entryResult.error) return setStatus('#draw-message', `讀取名單失敗：${entryResult.error.message}`, 'error');
    eventInfo = eventResult.data;
    cloudEntries = entryResult.data || [];
    $('#cloud-count').textContent = `${cloudEntries.length} 位`;
    $('#cloud-event').textContent = `${eventInfo.event_name}｜${eventInfo.registration_open ? '登記中' : '已停止'}｜實際名單 ${cloudEntries.length} 位`;
    setStatus('#draw-message', `已載入 ${cloudEntries.length} 位合格帳號。`, 'success');
    results = [];
    renderResults();
    refreshDrawState();
  }

  function secureRandomIndex(length) {
    if (length < 1) return -1;
    const limit = Math.floor(0x100000000 / length) * length;
    const array = new Uint32Array(1);
    do crypto.getRandomValues(array); while (array[0] >= limit);
    return array[0] % length;
  }

  async function draw() {
    if (drawing) return;
    const prize = prizes[results.length];
    const candidates = availableCandidates();
    if (!prize || !candidates.length) return refreshDrawState();
    drawing = true;
    $('#draw-button').disabled = true;
    $('#draw-display').classList.add('spinning');
    const start = Date.now();
    await new Promise(resolve => {
      const timer = setInterval(() => {
        const temp = candidates[Math.floor(Math.random() * candidates.length)];
        $('#winner-number').textContent = String(temp.number).padStart(3, '0');
        $('#winner-account').textContent = temp.account || '手動編號模式';
        if (Date.now() - start >= 1800) { clearInterval(timer); resolve(); }
      }, 70);
    });
    const winner = candidates[secureRandomIndex(candidates.length)];
    results.push({ prize, candidate: winner, drawnAt: new Date().toISOString() });
    $('#winner-number').textContent = String(winner.number).padStart(3, '0');
    $('#winner-account').textContent = winner.account || '手動編號模式';
    $('#draw-display').classList.remove('spinning');
    drawing = false;
    renderResults();
    refreshDrawState();
  }

  function renderResults() {
    const root = $('#result-list');
    $('#export-results').disabled = !results.length;
    if (!results.length) { root.innerHTML = '<div class="empty">尚無抽獎結果</div>'; return; }
    root.innerHTML = results.map((result, index) => `<article class="result-row"><span class="result-order">#${String(index + 1).padStart(2, '0')}</span><span class="result-prize">${escapeHtml(result.prize)}</span><span class="result-winner">${String(result.candidate.number).padStart(3, '0')}${result.candidate.account ? `<br>${escapeHtml(result.candidate.account)}` : ''}</span></article>`).join('');
  }

  function escapeHtml(value) {
    return String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
  }

  function exportResults() {
    const rows = [['順序', '獎項', '中獎編號', 'IG帳號', '抽獎時間', '名單來源', '活動ID'], ...results.map((result, index) => [index + 1, result.prize, result.candidate.number, result.candidate.account, new Date(result.drawnAt).toLocaleString('zh-TW'), source === 'cloud' ? 'Supabase' : '手動範圍', source === 'cloud' ? cfg.eventId : ''])];
    const csv = '\uFEFF' + rows.map(row => row.map(csvCell).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `孤島抽獎結果-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  if (db) {
    db.auth.getSession().then(({ data }) => {
      session = data.session;
      $('#auth-button').textContent = session ? '登出 Admin' : 'Admin 登入';
      $('#load-cloud').disabled = !session;
      refreshDrawState();
    });
    db.auth.onAuthStateChange((_event, nextSession) => {
      session = nextSession;
      $('#auth-button').textContent = session ? '登出 Admin' : 'Admin 登入';
      $('#load-cloud').disabled = !session;
      if (!session) { cloudEntries = []; eventInfo = null; $('#cloud-count').textContent = '0 位'; $('#cloud-event').textContent = '尚未載入活動'; }
      refreshDrawState();
    });
  } else {
    setStatus('#draw-message', 'supabase-config.js 尚未設定完成。', 'error');
  }

  const savedPrizes = localStorage.getItem('gudao-raffle-prizes-v2');
  if (savedPrizes) $('#prize-input').value = savedPrizes;
  $('#prize-input').addEventListener('change', () => localStorage.setItem('gudao-raffle-prizes-v2', $('#prize-input').value));
  setSource('cloud');
  renderResults();
})();
