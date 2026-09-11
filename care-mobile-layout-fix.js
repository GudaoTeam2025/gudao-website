(() => {
  const labLayout = document.querySelector('.lab-layout');
  const trianglePanel = document.querySelector('.triangle-panel');
  const originalSummary = trianglePanel?.querySelector('.triangle-summary');

  if (!labLayout || !trianglePanel || !originalSummary) {
    console.warn('GUDAO care layout fix: required elements were not found.');
    return;
  }

  /* 避免重複載入時建立多份容器。 */
  let column = labLayout.querySelector(':scope > .triangle-column');
  if (!column) {
    column = document.createElement('div');
    column.className = 'triangle-column';
    labLayout.insertBefore(column, trianglePanel);
    column.appendChild(trianglePanel);
  }

  /* 狀態卡移到三角形外面，保持既有 ID，care.js 可繼續更新文字。 */
  let statusCard = column.querySelector(':scope > .triangle-status-card');
  if (!statusCard) {
    statusCard = document.createElement('section');
    statusCard.className = 'triangle-status-card';
    statusCard.setAttribute('aria-label', '目前環境狀態說明');
    column.appendChild(statusCard);
  }

  statusCard.append(...originalSummary.childNodes);
  originalSummary.remove();

  /* 徹底移除造成白線的風流元素。風滑桿與文字建議仍正常運作。 */
  trianglePanel.querySelectorAll('.airflow, #airflow').forEach(element => element.remove());

  /* 視窗改變時，通知動態 SVG 重新取得三角節點位置。 */
  const notifyResize = () => window.dispatchEvent(new Event('resize'));
  requestAnimationFrame(notifyResize);

  if (document.fonts?.ready) {
    document.fonts.ready.then(notifyResize);
  }
})();
