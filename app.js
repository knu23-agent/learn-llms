/* ============================================
   app.js — Main application JS
   - Service Worker registration
   - Theme toggle (dark/light)
   - Scroll progress bar
   - Copy-to-clipboard for code blocks
   ============================================ */

// ── Service Worker ──────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/learn-llms/sw.js', { scope: '/learn-llms/' })
      .catch(err => console.log('SW registration failed:', err));
  });
}

// ── Theme Toggle ────────────────────────────
(function initTheme() {
  const stored = localStorage.getItem('theme');
  if (stored === 'light') document.documentElement.classList.add('light');
})();

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;

  function updateBtn() {
    const isLight = document.documentElement.classList.contains('light');
    btn.innerHTML = isLight
      ? '<span>🌙</span> Dark'
      : '<span>☀️</span> Light';
  }
  updateBtn();

  btn.addEventListener('click', () => {
    document.documentElement.classList.toggle('light');
    const isLight = document.documentElement.classList.contains('light');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    updateBtn();
  });
});

// ── Scroll Progress Bar ──────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const bar = document.getElementById('progress-bar');
  if (!bar) return;

  function updateProgress() {
    const scrollTop = window.scrollY;
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docH > 0 ? (scrollTop / docH) * 100 : 0;
    bar.style.width = pct + '%';
  }
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
});

// ── Copy Buttons for Code Blocks ─────────────
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('pre').forEach(pre => {
    // Skip if already has a copy button
    if (pre.querySelector('.copy-btn')) return;

    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.textContent = 'Copy';
    btn.setAttribute('aria-label', 'Copy code to clipboard');

    btn.addEventListener('click', () => {
      const code = pre.querySelector('code');
      const text = code ? code.innerText : pre.innerText;

      navigator.clipboard.writeText(text).then(() => {
        btn.textContent = '✓ Copied!';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = 'Copy';
          btn.classList.remove('copied');
        }, 2000);
      }).catch(() => {
        // Fallback
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        btn.textContent = '✓ Copied!';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = 'Copy';
          btn.classList.remove('copied');
        }, 2000);
      });
    });

    pre.style.position = 'relative';
    pre.appendChild(btn);
  });
});
