import { initCinematicScroll } from './cinematic-scroll.js';
import { initMobileNav } from './mobile-nav.js';
import { initScrollReveal } from './scroll-reveal.js';
import { initFAQ } from './faq.js';
import { initDownloadCTA } from './download-cta.js';
import { initEmailForm } from './email-service.js';

document.addEventListener('DOMContentLoaded', () => {
  initCinematicScroll();
  initMobileNav();
  initScrollReveal();
  initFAQ('#home-faq-container');
  initDownloadCTA();
  initEmailForm('.newsletter-form');

  // Smooth scroll for anchor triggers
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
});
