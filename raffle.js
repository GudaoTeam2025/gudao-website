(() => {
  const startInput = document.querySelector('#start-number');
  const endInput = document.querySelector('#end-number');
  const prizeList = document.querySelector('#prize-list');
  const addPrizeButton = document.querySelector('#add-prize');
  const initializeButton = document.querySelector('#initialize');
  const resetButton = document.querySelector('#reset-all');
  const drawButton = document.querySelector('#draw');
  const copyButton = document.querySelector('#copy-results');
  const setupMessage = document.querySelector('#setup-message');
  const currentPrize = document.querySelector('#current-prize');
  const remainingCount = document.querySelector('#remaining-count');
  const remainingPrizes = document.querySelector('#remaining-prizes');
  const winnerNumber = document.querySelector('#winner-number');
  const winnerPrize = document.querySelector('#winner-prize');
  const winnerList = document.querySelector('#winner-list');

  let candidates = [];
  let drawQueue = [];
  let winners = [];
  let initialized = false;

  function addPrizeRow(name = '', quantity = 1) {
    const row = document.createElement('div');
    row.className = 'prize-row';
    row.innerHTML = `
      <label class="prize-name-label">
        獎項名稱
        <input class="prize-name" type="text" maxlength="60" placeholder="例如：龍舌蘭一株" value="${escapeHtml(name)}">
      </label>
      <label class="prize-quantity-label">
        名額
        <input class="prize-quantity" type="number" min="1" max="1000" value="${quantity}" inputmode="numeric">
      </label>
      <button class="remove-prize" type="button" aria-label="刪除此獎項">刪除</button>
    `;

    row.querySelector('.remove-prize').addEventListener('click', () => {
      if (prizeList.children.length === 1) {
        showMessage('至少需要保留一個獎項。', true);
        return;
      }
      row.remove();
    });

    prizeList.appendChild(row);
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function readPrizeQueue() {
    const rows = [...prizeList.querySelectorAll('.prize-row')];
    const queue = [];

    for (const row of rows) {
      const name = row.querySelector('.prize-name').value.trim();
      const quantity = Number(row.querySelector('.prize-quantity').value);

      if (!name) {
        throw new Error('請填寫每一個獎項名稱。');
      }
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 1000) {
        throw new Error(`「${name}」的名額必須是 1 至 1000 的整數。`);
      }

      for (let i = 1; i <= quantity; i += 1) {
        queue.push({ name, position: i, total: quantity });
      }
    }

    return queue;
  }

  function initializeRaffle() {
    try {
      const start = Number(startInput.value);
      const end = Number(endInput.value);

      if (!Number.isInteger(start) || !Number.isInteger(end)) {
        throw new Error('起始號碼與結束號碼必須是整數。');
      }
      if (start < 1 || end < 1 || end < start) {
        throw new Error('號碼範圍不正確，結束號碼必須大於或等於起始號碼。');
      }
      if (end - start + 1 > 100000) {
        throw new Error('單次抽獎最多支援 100,000 個號碼。');
      }

      const queue = readPrizeQueue();
      const totalCandidates = end - start + 1;

      if (queue.length > totalCandidates) {
        throw new Error(`總獎項名額 ${queue.length} 名，大於候選號碼 ${totalCandidates} 名。`);
      }

      candidates = Array.from({ length: totalCandidates }, (_, index) => start + index);
      drawQueue = queue;
      winners = [];
      initialized = true;

      startInput.disabled = true;
      endInput.disabled = true;
      addPrizeButton.disabled = true;
      initializeButton.disabled = true;
      prizeList.querySelectorAll('input, button').forEach(element => { element.disabled = true; });

      winnerNumber.textContent = 'READY';
      winnerPrize.textContent = '按下「抽出下一位」開始';
      winnerList.innerHTML = '<li class="empty-state">尚無中獎紀錄</li>';
      copyButton.disabled = true;
      drawButton.disabled = false;

      updateStatus();
      showMessage(`本輪抽獎已建立，共 ${totalCandidates} 個候選號碼、${queue.length} 個中獎名額。`);
    } catch (error) {
      showMessage(error.message, true);
    }
  }

  function secureRandomIndex(length) {
    if (length <= 0) throw new Error('沒有可抽取的號碼。');

    const maxUint32 = 0x100000000;
    const limit = maxUint32 - (maxUint32 % length);
    const values = new Uint32Array(1);
    let value;

    do {
      crypto.getRandomValues(values);
      value = values[0];
    } while (value >= limit);

    return value % length;
  }

  function drawNext() {
    if (!initialized || drawQueue.length === 0 || candidates.length === 0) return;

    drawButton.disabled = true;
    const prize = drawQueue[0];
    let ticks = 0;

    const animation = window.setInterval(() => {
      const previewIndex = secureRandomIndex(candidates.length);
      winnerNumber.textContent = String(candidates[previewIndex]).padStart(3, '0');
      ticks += 1;

      if (ticks >= 16) {
        window.clearInterval(animation);
        finalizeDraw(prize);
      }
    }, 55);
  }

  function finalizeDraw(prize) {
    const selectedIndex = secureRandomIndex(candidates.length);
    const selectedNumber = candidates.splice(selectedIndex, 1)[0];
    drawQueue.shift();

    const winner = {
      number: selectedNumber,
      prize: prize.name,
      position: prize.position,
      total: prize.total
    };
    winners.push(winner);

    winnerNumber.textContent = String(selectedNumber).padStart(3, '0');
    winnerPrize.textContent = formatPrize(prize);
    renderWinners();
    updateStatus();
    copyButton.disabled = false;

    if (drawQueue.length === 0) {
      drawButton.disabled = true;
      showMessage('本輪所有獎項皆已抽出。中獎號碼不會重複。');
    } else {
      drawButton.disabled = false;
    }
  }

  function formatPrize(prize) {
    return prize.total > 1
      ? `${prize.name}（第 ${prize.position} / ${prize.total} 名）`
      : prize.name;
  }

  function updateStatus() {
    remainingCount.textContent = String(candidates.length);
    remainingPrizes.textContent = String(drawQueue.length);
    currentPrize.textContent = drawQueue.length > 0 ? formatPrize(drawQueue[0]) : '本輪抽獎完成';
  }

  function renderWinners() {
    winnerList.innerHTML = winners.map((winner, index) => `
      <li>
        <span class="winner-order">${String(index + 1).padStart(2, '0')}</span>
        <strong>${String(winner.number).padStart(3, '0')}</strong>
        <span>${escapeHtml(winner.prize)}${winner.total > 1 ? `（${winner.position}/${winner.total}）` : ''}</span>
      </li>
    `).join('');
  }

  async function copyResults() {
    const resultText = winners.map((winner, index) =>
      `${index + 1}. ${winner.prize}${winner.total > 1 ? `（${winner.position}/${winner.total}）` : ''}：${winner.number}`
    ).join('\n');

    try {
      await navigator.clipboard.writeText(resultText);
      copyButton.textContent = '已複製';
      window.setTimeout(() => { copyButton.textContent = '複製結果'; }, 1400);
    } catch {
      showMessage('瀏覽器無法自動複製，請手動選取中獎紀錄。', true);
    }
  }

  function resetAll() {
    candidates = [];
    drawQueue = [];
    winners = [];
    initialized = false;

    startInput.disabled = false;
    endInput.disabled = false;
    addPrizeButton.disabled = false;
    initializeButton.disabled = false;
    prizeList.querySelectorAll('input, button').forEach(element => { element.disabled = false; });

    winnerNumber.textContent = '---';
    winnerPrize.textContent = '建立本輪抽獎後即可開始';
    currentPrize.textContent = '尚未建立抽獎';
    remainingCount.textContent = '0';
    remainingPrizes.textContent = '0';
    winnerList.innerHTML = '<li class="empty-state">尚無中獎紀錄</li>';
    drawButton.disabled = true;
    copyButton.disabled = true;
    showMessage('已重設，可以建立新一輪抽獎。');
  }

  function showMessage(text, isError = false) {
    setupMessage.textContent = text;
    setupMessage.classList.toggle('error', isError);
  }

  addPrizeButton.addEventListener('click', () => addPrizeRow());
  initializeButton.addEventListener('click', initializeRaffle);
  resetButton.addEventListener('click', resetAll);
  drawButton.addEventListener('click', drawNext);
  copyButton.addEventListener('click', copyResults);

  addPrizeRow('頭獎', 1);
  addPrizeRow('貳獎', 1);
})();
