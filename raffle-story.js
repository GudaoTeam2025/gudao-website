(() => {
  const resultList = document.querySelector('#result-list');
  const exportCsvButton = document.querySelector('#export-results');
  const progressChip = document.querySelector('#progress-chip');
  const resultsHead = document.querySelector('.results-head');

  if (!resultList || !exportCsvButton || !progressChip || !resultsHead) {
    console.warn('GUDAO story export: required raffle elements were not found.');
    return;
  }

  const storyButton = document.createElement('button');
  storyButton.id = 'export-story';
  storyButton.className = 'story-export-button';
  storyButton.type = 'button';
  storyButton.disabled = true;
  storyButton.textContent = '獲獎名單圖';
  exportCsvButton.insertAdjacentElement('afterend', storyButton);

  const message = document.createElement('p');
  message.className = 'story-export-message';
  message.setAttribute('aria-live', 'polite');
  resultsHead.parentElement.appendChild(message);

  function parseProgress() {
    const match = String(progressChip.textContent || '').match(/(\d+)\s*\/\s*(\d+)/);
    return match ? { completed: Number(match[1]), total: Number(match[2]) } : null;
  }

  function collectResults() {
    return [...resultList.querySelectorAll('.result-row')].map((row, index) => {
      const prize = row.querySelector('.result-prize')?.textContent?.trim() || `獎項 ${index + 1}`;
      const winnerText = row.querySelector('.result-winner')?.innerText?.trim() || '';
      const lines = winnerText.split(/\n+/).map(value => value.trim()).filter(Boolean);
      return {
        order: index + 1,
        prize,
        number: lines[0] || '---',
        account: lines.slice(1).join(' ') || ''
      };
    });
  }

  function updateButton() {
    const progress = parseProgress();
    const results = collectResults();
    const complete = Boolean(progress && progress.total > 0 && progress.completed === progress.total);
    storyButton.disabled = !complete || results.length < progress?.total;
    storyButton.title = complete ? '產生 1080 × 1920 PNG' : '完成所有獎項後即可產生';
  }

  const observer = new MutationObserver(updateButton);
  observer.observe(resultList, { childList: true, subtree: true });
  observer.observe(progressChip, { childList: true, characterData: true, subtree: true });

  function roundedRect(ctx, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + width, y, x + width, y + height, r);
    ctx.arcTo(x + width, y + height, x, y + height, r);
    ctx.arcTo(x, y + height, x, y, r);
    ctx.arcTo(x, y, x + width, y, r);
    ctx.closePath();
  }

  function fitText(ctx, text, maxWidth, startSize, minSize, weight = 800) {
    let size = startSize;
    do {
      ctx.font = `${weight} ${size}px Arial, "Microsoft JhengHei", sans-serif`;
      if (ctx.measureText(text).width <= maxWidth) return size;
      size -= 2;
    } while (size > minSize);
    return minSize;
  }

  function drawCover(ctx, page, totalPages, totalWinners, sourceLabel) {
    ctx.fillStyle = '#262C31';
    ctx.fillRect(0, 0, 1080, 1920);

    ctx.fillStyle = '#FF8510';
    ctx.fillRect(0, 0, 1080, 24);
    ctx.fillRect(76, 148, 8, 144);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#FF8510';
    ctx.font = '800 30px Arial, "Microsoft JhengHei", sans-serif';
    ctx.fillText('GUDAO LOTTERY RESULT', 108, 178);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 88px Arial, "Microsoft JhengHei", sans-serif';
    ctx.fillText('孤島抽獎', 108, 278);

    ctx.fillStyle = 'rgba(255,255,255,.62)';
    ctx.font = '600 28px Arial, "Microsoft JhengHei", sans-serif';
    ctx.fillText(`${sourceLabel}｜共 ${totalWinners} 位中獎者`, 108, 330);

    if (totalPages > 1) {
      ctx.textAlign = 'right';
      ctx.fillStyle = '#FF8510';
      ctx.font = '800 26px Arial, sans-serif';
      ctx.fillText(`${page} / ${totalPages}`, 972, 180);
    }
  }

  async function loadLogo() {
    return new Promise(resolve => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => resolve(null);
      image.src = `assets/brand/logo.png?story=${Date.now()}`;
    });
  }

  function drawLogo(ctx, logo) {
    if (logo) {
      const box = 108;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(864, 232, box, box);
      const ratio = Math.min((box - 12) / logo.width, (box - 12) / logo.height);
      const width = logo.width * ratio;
      const height = logo.height * ratio;
      ctx.drawImage(logo, 864 + (box - width) / 2, 232 + (box - height) / 2, width, height);
    }
  }

  function drawResultCard(ctx, item, index, y, cardHeight) {
    roundedRect(ctx, 76, y, 928, cardHeight, 4);
    ctx.fillStyle = index % 2 === 0 ? '#F3F2EF' : '#FFFFFF';
    ctx.fill();

    ctx.fillStyle = '#FF8510';
    ctx.fillRect(76, y, 9, cardHeight);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#823B35';
    ctx.font = '800 24px Arial, sans-serif';
    ctx.fillText(`#${String(item.order).padStart(2, '0')}`, 112, y + 44);

    const prizeSize = fitText(ctx, item.prize, 560, 40, 25, 900);
    ctx.fillStyle = '#262C31';
    ctx.font = `900 ${prizeSize}px Arial, "Microsoft JhengHei", sans-serif`;
    ctx.fillText(item.prize, 112, y + 92);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#FF8510';
    ctx.font = '900 65px Arial, "Microsoft JhengHei", sans-serif';
    ctx.fillText(String(item.number).padStart(3, '0'), 954, y + 80);

    if (item.account) {
      const accountSize = fitText(ctx, item.account, 390, 28, 18, 800);
      ctx.fillStyle = '#345339';
      ctx.font = `800 ${accountSize}px Arial, "Microsoft JhengHei", sans-serif`;
      ctx.fillText(item.account, 954, y + 122);
    } else {
      ctx.fillStyle = '#667078';
      ctx.font = '700 22px Arial, "Microsoft JhengHei", sans-serif';
      ctx.fillText('手動編號模式', 954, y + 122);
    }
  }

  function drawFooter(ctx) {
    ctx.textAlign = 'left';
    ctx.fillStyle = '#FF8510';
    ctx.font = '800 24px Arial, sans-serif';
    ctx.fillText('PASSION TO THE ISLAND', 76, 1816);
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(255,255,255,.48)';
    ctx.font = '600 22px Arial, "Microsoft JhengHei", sans-serif';
    ctx.fillText(new Date().toLocaleString('zh-TW'), 1004, 1816);
  }

  function downloadCanvas(canvas, filename) {
    return new Promise(resolve => {
      canvas.toBlob(blob => {
        if (!blob) return resolve(false);
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = filename;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        resolve(true);
      }, 'image/png', 1);
    });
  }

  storyButton.addEventListener('click', async () => {
    const results = collectResults();
    const progress = parseProgress();
    if (!progress || progress.completed !== progress.total || !results.length) {
      message.className = 'story-export-message error';
      message.textContent = '請完成所有獎項後再產生限動圖。';
      return;
    }

    storyButton.disabled = true;
    storyButton.textContent = '產生中...';
    message.className = 'story-export-message';
    message.textContent = '正在繪製 1080 × 1920 限動圖片。';

    try {
      const logo = await loadLogo();
      const perPage = 8;
      const pages = [];
      for (let index = 0; index < results.length; index += perPage) {
        pages.push(results.slice(index, index + perPage));
      }
      const sourceLabel = results.some(item => item.account) ? 'SUPABASE 雲端名單' : '手動編號範圍';
      const date = new Date().toISOString().slice(0, 10);

      for (let pageIndex = 0; pageIndex < pages.length; pageIndex += 1) {
        const canvas = document.createElement('canvas');
        canvas.width = 1080;
        canvas.height = 1920;
        const ctx = canvas.getContext('2d');
        drawCover(ctx, pageIndex + 1, pages.length, results.length, sourceLabel);
        drawLogo(ctx, logo);

        const items = pages[pageIndex];
        const availableHeight = 1330;
        const gap = 16;
        const cardHeight = Math.min(154, (availableHeight - gap * (items.length - 1)) / items.length);
        let y = 408;
        items.forEach((item, index) => {
          drawResultCard(ctx, item, index, y, cardHeight);
          y += cardHeight + gap;
        });
        drawFooter(ctx);

        const suffix = pages.length > 1 ? `-${pageIndex + 1}` : '';
        await downloadCanvas(canvas, `孤島抽獎結果-${date}${suffix}.png`);
        if (pages.length > 1) await new Promise(resolve => setTimeout(resolve, 350));
      }

      message.className = 'story-export-message success';
      message.textContent = pages.length > 1
        ? `已產生 ${pages.length} 張 9:16 限動圖片。`
        : '已產生 1 張 9:16 限動圖片。';
    } catch (error) {
      console.error(error);
      message.className = 'story-export-message error';
      message.textContent = '圖片產生失敗，請重新整理後再試。';
    } finally {
      storyButton.textContent = '產生 IG 限動圖';
      updateButton();
    }
  });

  updateButton();
})();
