(() => {
  const panel = document.querySelector('.triangle-panel');
  const lightNode = document.querySelector('.factor-light');
  const windNode = document.querySelector('.factor-wind');
  const waterNode = document.querySelector('.factor-water');

  if (!panel || !lightNode || !windNode || !waterNode) {
    console.warn('GUDAO triangle fix: triangle elements were not found.');
    return;
  }

  /* 避免重複載入時產生多個 SVG。 */
  panel.querySelectorAll('.care-triangle-svg').forEach(element => element.remove());

  const svgNamespace = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNamespace, 'svg');
  svg.classList.add('care-triangle-svg');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('preserveAspectRatio', 'none');

  const edges = [
    [lightNode, windNode],
    [lightNode, waterNode],
    [windNode, waterNode],
  ].map(() => {
    const line = document.createElementNS(svgNamespace, 'line');
    svg.appendChild(line);
    return line;
  });

  /* 放在節點與植株後方。 */
  panel.prepend(svg);

  function nodeGeometry(node, panelRect) {
    const rect = node.getBoundingClientRect();
    return {
      x: rect.left - panelRect.left + rect.width / 2,
      y: rect.top - panelRect.top + rect.height / 2,
      radius: Math.min(rect.width, rect.height) / 2,
    };
  }

  function clippedEdge(start, end, startPadding = 2, endPadding = 2) {
    const deltaX = end.x - start.x;
    const deltaY = end.y - start.y;
    const distance = Math.hypot(deltaX, deltaY) || 1;
    const unitX = deltaX / distance;
    const unitY = deltaY / distance;

    return {
      x1: start.x + unitX * (start.radius + startPadding),
      y1: start.y + unitY * (start.radius + startPadding),
      x2: end.x - unitX * (end.radius + endPadding),
      y2: end.y - unitY * (end.radius + endPadding),
    };
  }

  function drawTriangle() {
    const panelRect = panel.getBoundingClientRect();
    if (!panelRect.width || !panelRect.height) return;

    svg.setAttribute('viewBox', `0 0 ${panelRect.width} ${panelRect.height}`);

    const light = nodeGeometry(lightNode, panelRect);
    const wind = nodeGeometry(windNode, panelRect);
    const water = nodeGeometry(waterNode, panelRect);

    const coordinates = [
      clippedEdge(light, wind),
      clippedEdge(light, water),
      clippedEdge(wind, water),
    ];

    edges.forEach((line, index) => {
      const edge = coordinates[index];
      line.setAttribute('x1', edge.x1.toFixed(2));
      line.setAttribute('y1', edge.y1.toFixed(2));
      line.setAttribute('x2', edge.x2.toFixed(2));
      line.setAttribute('y2', edge.y2.toFixed(2));
    });
  }

  let animationFrame = 0;
  function requestDraw() {
    cancelAnimationFrame(animationFrame);
    animationFrame = requestAnimationFrame(drawTriangle);
  }

  const resizeObserver = new ResizeObserver(requestDraw);
  resizeObserver.observe(panel);
  resizeObserver.observe(lightNode);
  resizeObserver.observe(windNode);
  resizeObserver.observe(waterNode);

  window.addEventListener('resize', requestDraw, { passive: true });
  window.addEventListener('orientationchange', requestDraw, { passive: true });
  window.addEventListener('load', requestDraw, { once: true });

  if (document.fonts?.ready) {
    document.fonts.ready.then(requestDraw);
  }

  requestDraw();
})();
