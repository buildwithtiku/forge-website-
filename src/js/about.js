import { initMobileNav } from './mobile-nav.js';
import { initScrollReveal } from './scroll-reveal.js';

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initScrollReveal();

  // Navigation shrink on scroll
  const header = document.querySelector('#site-header');
  const updateNav = () => {
    if (!header) return;
    if (window.scrollY > 40) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  };

  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  // Smooth scroll for anchors
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
