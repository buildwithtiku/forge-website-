/**
 * Subtle Scroll Reveal Controller
 * Respects prefers-reduced-motion and provides slow, deliberate editorial reveals.
 */
export function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced || !('IntersectionObserver' in window)) {
    reveals.forEach((el) => el.classList.add('is-revealed'));
    return;
  }

  const observerOptions = {
    threshold: 0.05,
    rootMargin: '0px 0px 60px 0px'
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        obs.unobserve(entry.target);
      }
    });
  }, observerOptions);

  reveals.forEach((el) => observer.observe(el));
}
