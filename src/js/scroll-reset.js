/**
 * Forge Website — Global Route Change Scroll Reset
 * 
 * Ensures every newly opened route/page starts strictly at the top (scrollY = 0)
 * and prevents browser scroll restoration glitches.
 */

// Disable automatic scroll restoration on reload/route navigation
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

function resetScrollInstant() {
  if (!window.location.hash) {
    const html = document.documentElement;
    const originalBehavior = html ? html.style.scrollBehavior : '';
    
    if (html) html.style.scrollBehavior = 'auto';
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (html) html.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;

    // Restore smooth scroll for on-page interactions after initial render
    requestAnimationFrame(() => {
      if (html) html.style.scrollBehavior = originalBehavior;
    });
  }
}

// Immediate execution as soon as script evaluates
resetScrollInstant();

// On pageshow (e.g. bfcache, standard route transition)
window.addEventListener('pageshow', (event) => {
  // If user used browser back/forward and the page was cached in bfcache,
  // event.persisted might be true. If it was a fresh link click, reset to top.
  if (!window.location.hash && !event.persisted) {
    resetScrollInstant();
  }
});

// On DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', resetScrollInstant);
} else {
  resetScrollInstant();
}

// On window load
window.addEventListener('load', () => {
  if (!window.location.hash) {
    resetScrollInstant();
  }
});

// Intercept internal route navigation clicks to ensure target opens at top
document.addEventListener('click', (e) => {
  const link = e.target.closest('a');
  if (!link) return;
  const href = link.getAttribute('href');
  if (!href) return;

  // If navigating to another internal route without anchor
  if ((href.startsWith('/') || href.endsWith('.html')) && !href.includes('#')) {
    // Normal route navigation
    sessionStorage.setItem('forge_route_nav', Date.now().toString());
  }
}, { capture: true });
