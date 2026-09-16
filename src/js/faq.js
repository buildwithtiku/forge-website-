/**
 * Forge Website — FAQ Accordion Controller
 * 
 * Manages accessible keyboard navigation, ARIA attributes,
 * and smooth opening/closing transitions for FAQ items.
 */

export function initFAQ(containerSelector = '.faq-container') {
  const containers = document.querySelectorAll(containerSelector);
  if (!containers.length) return;

  containers.forEach((container) => {
    const items = container.querySelectorAll('.faq-item');

    items.forEach((item) => {
      const trigger = item.querySelector('.faq-trigger');
      const answerWrapper = item.querySelector('.faq-answer-wrapper');
      if (!trigger || !answerWrapper) return;

      trigger.addEventListener('click', () => {
        const isOpen = item.classList.contains('is-open');

        // Close other items in the same container for clean editorial flow
        items.forEach((otherItem) => {
          if (otherItem !== item && otherItem.classList.contains('is-open')) {
            otherItem.classList.remove('is-open');
            const otherTrigger = otherItem.querySelector('.faq-trigger');
            if (otherTrigger) {
              otherTrigger.setAttribute('aria-expanded', 'false');
            }
          }
        });

        // Toggle current item
        if (isOpen) {
          item.classList.remove('is-open');
          trigger.setAttribute('aria-expanded', 'false');
        } else {
          item.classList.add('is-open');
          trigger.setAttribute('aria-expanded', 'true');
        }
      });
    });
  });
}
