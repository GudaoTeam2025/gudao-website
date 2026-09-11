(() => {
  const image = document.querySelector('.plant-stage-visual img');
  const visual = document.querySelector('.plant-stage-visual');

  if (!image || !visual) return;

  /* 強制使用本修正版隨附的正確圖片路徑。 */
  const expectedSource = 'assets/care/agave-center.jpg';
  if (image.getAttribute('src') !== expectedSource) {
    image.setAttribute('src', expectedSource);
  }

  function showFallback() {
    image.hidden = true;
    visual.classList.add('image-missing');
    if (!visual.querySelector('.plant-image-fallback')) {
      const fallback = document.createElement('div');
      fallback.className = 'plant-image-fallback';
      fallback.setAttribute('aria-label', '龍舌蘭植株圖片尚未上傳');
      fallback.innerHTML = '<b>AGAVE</b><small>請確認 assets/care/agave-center.jpg</small>';
      visual.appendChild(fallback);
    }
  }

  function showImage() {
    image.hidden = false;
    visual.classList.remove('image-missing');
    visual.querySelector('.plant-image-fallback')?.remove();
  }

  image.addEventListener('load', showImage);
  image.addEventListener('error', showFallback);

  if (image.complete) {
    image.naturalWidth > 0 ? showImage() : showFallback();
  }
})();
