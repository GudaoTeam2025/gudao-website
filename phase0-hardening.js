/*
  Add AFTER sales-registration.js:
  <script src="phase0-hardening.js?v=1"></script>

  Phase 0 UI hardening only. This does not turn a front-end PIN into secure authentication.
*/
(() => {
  const maskName = value => {
    const text = String(value || '').trim();
    if (!text) return '';
    return text.length === 1 ? '＊' : text.slice(0, 1) + '＊'.repeat(Math.min(3, text.length - 1));
  };

  const maskSocial = value => {
    const text = String(value || '').trim();
    if (!text) return '';
    const at = text.startsWith('@') ? '@' : '';
    const raw = at ? text.slice(1) : text;
    return at + raw.slice(0, 2) + '＊'.repeat(Math.max(3, Math.min(8, raw.length - 2)));
  };

  function harden() {
    document.querySelectorAll('.demo').forEach(element => {
      if (element.dataset.phase0Done) return;
      element.dataset.phase0Done = '1';
      const warning = document.createElement('strong');
      warning.className = 'phase0-warning';
      warning.textContent = 'PIN 僅供防誤觸，不是高安全性登入。';
      element.prepend(document.createElement('br'));
      element.prepend(warning);
    });

    document.querySelectorAll('.record').forEach(record => {
      if (record.dataset.privacyMasked) return;
      const name = record.querySelector('h2');
      const meta = record.querySelector('.record-meta');
      if (name) name.textContent = maskName(name.textContent);
      if (meta) {
        const parts = meta.textContent.split('｜');
        if (parts.length > 1) meta.textContent = `${maskSocial(parts.shift())}｜${parts.join('｜')}`;
        else meta.textContent = maskSocial(meta.textContent);
      }
      record.dataset.privacyMasked = '1';
    });
  }

  const observer = new MutationObserver(harden);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  harden();
})();
