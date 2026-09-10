(() => {
  const originalButton = document.querySelector('#draw-button');
  const currentPrize = document.querySelector('#current-prize');
  const progressChip = document.querySelector('#progress-chip');

  if (!originalButton || !currentPrize || !progressChip) {
    console.warn('GUDAO mobile draw dock: required elements were not found.');
    return;
  }

  /* 若舊版增強程式曾建立慶祝畫面，先移除。 */
  document.querySelectorAll(
    '.raffle-celebration, .raffle-confetti, .mobile-draw-dock, .raffle-mobile-dock'
  ).forEach((element) => element.remove());

  document.body.style.overflow = '';

  const dock = document.createElement('aside');
  dock.className = 'raffle-mobile-dock';
  dock.setAttribute('aria-label', '手機抽獎控制列');
  dock.innerHTML = `
    <div class="raffle-mobile-dock__info">
      <span class="raffle-mobile-dock__label">CURRENT PRIZE</span>
      <strong class="raffle-mobile-dock__prize">等待設定獎項</strong>
      <span class="raffle-mobile-dock__progress">0 / 0</span>
    </div>
    <button class="raffle-mobile-dock__button" type="button" disabled>
      開始抽獎
    </button>
  `;
  document.body.appendChild(dock);

  const dockPrize = dock.querySelector('.raffle-mobile-dock__prize');
  const dockProgress = dock.querySelector('.raffle-mobile-dock__progress');
  const dockButton = dock.querySelector('.raffle-mobile-dock__button');

  function syncDock() {
    dockPrize.textContent = currentPrize.textContent || '等待設定獎項';
    dockProgress.textContent = progressChip.textContent || '0 / 0';
    dockButton.disabled = originalButton.disabled;
    dockButton.textContent = originalButton.textContent || '開始抽獎';
  }

  dockButton.addEventListener('click', () => {
    if (!originalButton.disabled) {
      originalButton.click();
    }
  });

  const observer = new MutationObserver(syncDock);

  observer.observe(originalButton, {
    attributes: true,
    childList: true,
    characterData: true,
    subtree: true,
    attributeFilter: ['disabled'],
  });

  observer.observe(currentPrize, {
    childList: true,
    characterData: true,
    subtree: true,
  });

  observer.observe(progressChip, {
    childList: true,
    characterData: true,
    subtree: true,
  });

  syncDock();
})();
