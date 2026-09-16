/**
 * Forge System Chapter Switcher
 * Handles switching between TRAIN, FUEL, RECOVER, GROW, and PROGRESS screens.
 * Supports mouse clicks and keyboard accessibility (Enter/Space).
 */
export function initSystemSwitcher() {
  const chapterItems = document.querySelectorAll('.system-chapter-item');
  const screenViews = document.querySelectorAll('.system-screen-view');

  if (!chapterItems.length || !screenViews.length) return;

  const selectChapter = (item) => {
    const targetChapter = item.getAttribute('data-chapter');

    // Update chapter item active states
    chapterItems.forEach((ci) => {
      ci.classList.remove('is-active');
      ci.setAttribute('aria-selected', 'false');
    });
    item.classList.add('is-active');
    item.setAttribute('aria-selected', 'true');

    // Update screen view visibility
    screenViews.forEach((sv) => {
      if (sv.getAttribute('data-view') === targetChapter) {
        sv.classList.add('is-visible');
      } else {
        sv.classList.remove('is-visible');
      }
    });
  };

  chapterItems.forEach((item) => {
    item.addEventListener('click', () => selectChapter(item));

    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectChapter(item);
      }
    });
  });
}
