/**
 * Forge Cinematic Scroll Storytelling Engine
 * Smooth 60fps scroll progress calculation using requestAnimationFrame.
 * Drives progressive reveals, sticky stages, and screen transitions.
 */

export function initCinematicScroll() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.innerWidth <= 768;

  // 1. Navigation Shrink on Scroll
  const header = document.querySelector('#site-header');
  const updateNav = () => {
    if (!header) return;
    if (window.scrollY > 40) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  };

  // If reduced motion or mobile, initialize nav and standard reveals only
  if (prefersReduced || isMobile) {
    window.addEventListener('scroll', updateNav, { passive: true });
    updateNav();
    return;
  }

  // Helper to calculate progress of a track (0 to 1)
  const getTrackProgress = (element) => {
    if (!element) return 0;
    const rect = element.getBoundingClientRect();
    const trackHeight = element.offsetHeight - window.innerHeight;
    if (trackHeight <= 0) return 0;
    const scrolled = -rect.top;
    return Math.max(0, Math.min(1, scrolled / trackHeight));
  };

  // 2. Track 1: "You Want to Change"
  const changeTrack = document.querySelector('#change-track');
  const changeSteps = document.querySelectorAll('.change-step');
  const changeQuestion = document.querySelector('#change-question');

  const updateChangeStory = () => {
    if (!changeTrack || !changeSteps.length) return;
    const progress = getTrackProgress(changeTrack);

    // 5 steps: body, confidence, discipline, habits, life (progress 0.05 to 0.75)
    const stepCount = changeSteps.length;
    const activeIndex = Math.min(stepCount - 1, Math.floor(progress * (stepCount + 1)));

    changeSteps.forEach((step, idx) => {
      if (idx <= activeIndex && progress > 0.08) {
        step.classList.add('is-active');
        step.classList.remove('is-past');
      } else {
        step.classList.remove('is-active');
      }
      if (idx < activeIndex && progress > 0.25) {
        step.classList.add('is-past');
      }
    });

    if (changeQuestion) {
      if (progress > 0.8) {
        changeQuestion.classList.add('is-active');
      } else {
        changeQuestion.classList.remove('is-active');
      }
    }
  };

  // 3. Track 2: Problem Pause Sequence ("Starting Over")
  const problemTrack = document.querySelector('#problem-track');
  const pauseMonday = document.querySelector('#pause-monday');
  const pauseWednesday = document.querySelector('#pause-wednesday');
  const pauseNextMonday = document.querySelector('#pause-next-monday');
  const problemNarrative = document.querySelector('#problem-narrative');

  const updateProblemStory = () => {
    if (!problemTrack) return;
    const progress = getTrackProgress(problemTrack);

    // Step 1: Monday (0.05 - 0.35)
    if (pauseMonday) {
      if (progress > 0.05) {
        pauseMonday.classList.add('is-active');
        pauseMonday.classList.remove('is-faded');
      } else {
        pauseMonday.classList.remove('is-active');
      }
      if (progress > 0.35) {
        pauseMonday.classList.add('is-faded');
      }
    }

    // Step 2: Wednesday (0.35 - 0.65)
    if (pauseWednesday) {
      if (progress > 0.35) {
        pauseWednesday.classList.add('is-active');
        pauseWednesday.classList.remove('is-faded');
      } else {
        pauseWednesday.classList.remove('is-active');
      }
      if (progress > 0.65) {
        pauseWednesday.classList.add('is-faded');
      }
    }

    // Step 3: Next Monday (0.65+)
    if (pauseNextMonday) {
      if (progress > 0.65) {
        pauseNextMonday.classList.add('is-active');
      } else {
        pauseNextMonday.classList.remove('is-active');
      }
    }

    // Narrative block reveal (0.8+)
    if (problemNarrative) {
      if (progress > 0.78) {
        problemNarrative.classList.add('is-active');
      } else {
        problemNarrative.classList.remove('is-active');
      }
    }
  };

  // 4. Track 3: The Four Pillars Sticky Morphing
  const pillarsTrack = document.querySelector('#pillars-track');
  const pillarItems = document.querySelectorAll('.pillar-story-item');
  const pillarScreens = document.querySelectorAll('.pillar-screen-view');

  const updatePillarsStory = () => {
    if (!pillarsTrack || !pillarItems.length) return;
    const progress = getTrackProgress(pillarsTrack);

    // 4 pillars: 0 (0-0.25), 1 (0.25-0.5), 2 (0.5-0.75), 3 (0.75-1.0)
    const pillarIndex = Math.min(3, Math.floor(progress * 4));

    pillarItems.forEach((item, idx) => {
      if (idx === pillarIndex) {
        item.classList.add('is-active');
      } else {
        item.classList.remove('is-active');
      }
    });

    pillarScreens.forEach((screen, idx) => {
      if (idx === pillarIndex) {
        screen.classList.add('is-visible');
      } else {
        screen.classList.remove('is-visible');
      }
    });
  };

  // 5. Section 6: "Your Day" Interactive Timeline
  const timelineSteps = document.querySelectorAll('.timeline-step');
  const updateTimeline = () => {
    if (!timelineSteps.length) return;
    const viewportHeight = window.innerHeight;

    timelineSteps.forEach((step) => {
      const rect = step.getBoundingClientRect();
      // Step activates when it reaches the middle 60% of viewport
      if (rect.top < viewportHeight * 0.7 && rect.bottom > viewportHeight * 0.2) {
        step.classList.add('is-active');
      } else {
        step.classList.remove('is-active');
      }
    });
  };

  // 6. Section 7: Product Showcase Horizontal Drift
  const showcaseTrack = document.querySelector('#showcase-slider-track');
  const showcaseSection = document.querySelector('#showcase-section');
  const updateShowcase = () => {
    if (!showcaseTrack || !showcaseSection) return;
    const rect = showcaseSection.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
      const moveX = (progress - 0.5) * 120;
      showcaseTrack.style.transform = `translateX(${-moveX}px)`;
    }
  };

  // Animation Loop via requestAnimationFrame
  let ticking = false;
  const onScroll = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateNav();
        updateChangeStory();
        updateProblemStory();
        updatePillarsStory();
        updateTimeline();
        updateShowcase();
        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  // Initial call
  onScroll();
}
