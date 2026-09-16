/**
 * Forge Website — Unified Download CTA Handler
 * 
 * Ensures all "Start Building", "Download Forge", and primary action buttons
 * have responsive hover, active press states, keyboard accessibility,
 * and reliable destination routing via FORGE_CONFIG.
 */

import { FORGE_CONFIG } from './config.js';

export function initDownloadCTA() {
  const ctaSelectors = [
    '[data-download-cta]',
    '#nav-cta',
    '#hero-primary-cta',
    '#footer-cta-btn',
    '.mobile-drawer-cta',
  ];

  const ctaElements = document.querySelectorAll(ctaSelectors.join(','));

  ctaElements.forEach((btn) => {
    // Ensure keyboard accessibility
    if (btn.tagName === 'A' && (!btn.getAttribute('href') || btn.getAttribute('href') === '#')) {
      btn.setAttribute('role', 'button');
      btn.setAttribute('tabindex', '0');
    }

    // Click handler
    btn.addEventListener('click', (e) => {
      handleCTAClick(e, btn);
    });

    // Keyboard support (Enter & Space)
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleCTAClick(e, btn);
      }
    });

    // Tactile press state for mobile/desktop feedback
    btn.addEventListener('pointerdown', () => {
      btn.classList.add('is-pressed');
    });

    const removePress = () => btn.classList.remove('is-pressed');
    btn.addEventListener('pointerup', removePress);
    btn.addEventListener('pointerleave', removePress);
    btn.addEventListener('blur', removePress);
  });
}

function handleCTAClick(e, btn) {
  // If production download URL is defined, navigate to it directly
  if (FORGE_CONFIG.APP_DOWNLOAD_URL) {
    e.preventDefault();
    window.open(FORGE_CONFIG.APP_DOWNLOAD_URL, '_blank', 'noopener,noreferrer');
    return;
  }

  // Route to dedicated Forge download / coming-soon page
  e.preventDefault();
  window.location.href = '/download.html';
}
