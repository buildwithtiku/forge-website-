/**
 * Forge Website — Email / Waitlist Service
 * 
 * Handles client-side email validation, duplicate detection,
 * persistence, provider integration hooks, and accessible UX feedback states.
 */

import { FORGE_CONFIG } from './config.js';

// Simple RFC 5322 compatible email pattern
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STORAGE_KEY = 'forge_subscribers';

export async function submitEmail(email) {
  const normalized = email.trim().toLowerCase();

  // 1. Validation check
  if (!normalized || !EMAIL_REGEX.test(normalized)) {
    return {
      success: false,
      status: 'invalid',
      message: 'ENTER A VALID EMAIL.',
    };
  }

  // 2. Duplicate check in local storage
  const existingSubscribers = getLocalSubscribers();
  if (existingSubscribers.includes(normalized)) {
    return {
      success: false,
      status: 'duplicate',
      message: "YOU'RE ALREADY ON THE LIST.",
      subMessage: 'Thanks — we already have your email saved.',
    };
  }

  // 3. Network submission if endpoint configured, or local simulation
  try {
    if (FORGE_CONFIG.NEWSLETTER_ENDPOINT) {
      const response = await fetch(FORGE_CONFIG.NEWSLETTER_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalized, timestamp: new Date().toISOString() }),
      });
      if (!response.ok) {
        throw new Error('Server returned non-200');
      }
    } else {
      // Simulate brief network delay for authentic UI feedback
      await new Promise((resolve) => setTimeout(resolve, 550));
    }

    // 4. Save to local storage
    existingSubscribers.push(normalized);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existingSubscribers));

    return {
      success: true,
      status: 'success',
      message: "YOU'RE IN.",
      subMessage: "Thanks — we'll keep you posted.",
    };
  } catch (err) {
    return {
      success: false,
      status: 'error',
      message: 'Something went wrong. Please try again.',
    };
  }
}

function getLocalSubscribers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Initializes email forms across the page
 */
export function initEmailForm(formSelector = '#newsletter-form', feedbackSelector = null) {
  const forms = document.querySelectorAll(formSelector);
  if (!forms.length) return;

  forms.forEach((form) => {
    const input = form.querySelector('input[type="email"]');
    const submitBtn = form.querySelector('button[type="submit"]');
    const feedbackContainer = feedbackSelector 
      ? document.querySelector(feedbackSelector)
      : (form.parentElement?.querySelector('.newsletter-feedback') || form.querySelector('.newsletter-feedback') || document.querySelector('#newsletter-feedback'));

    if (!input || !submitBtn) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const originalBtnText = submitBtn.textContent;
      const emailValue = input.value;

      // Reset feedback
      if (feedbackContainer) {
        feedbackContainer.innerHTML = '';
        feedbackContainer.className = 'newsletter-feedback';
      }

      // Loading State
      submitBtn.disabled = true;
      submitBtn.textContent = 'JOINING...';
      form.classList.add('is-submitting');

      const result = await submitEmail(emailValue);

      // Restore button
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
      form.classList.remove('is-submitting');

      if (feedbackContainer) {
        if (result.success) {
          form.classList.add('is-success');
          input.value = '';
          input.disabled = true;
          submitBtn.disabled = true;

          feedbackContainer.className = 'newsletter-feedback is-success';
          feedbackContainer.innerHTML = `
            <p class="feedback-title">${result.message}</p>
            <p class="feedback-sub">${result.subMessage}</p>
          `;
        } else if (result.status === 'duplicate') {
          feedbackContainer.className = 'newsletter-feedback is-warning';
          feedbackContainer.innerHTML = `
            <p class="feedback-title">${result.message}</p>
            <p class="feedback-sub">${result.subMessage}</p>
          `;
        } else if (result.status === 'invalid') {
          feedbackContainer.className = 'newsletter-feedback is-error';
          feedbackContainer.innerHTML = `
            <p class="feedback-title">${result.message}</p>
          `;
          input.focus();
        } else {
          feedbackContainer.className = 'newsletter-feedback is-error';
          feedbackContainer.innerHTML = `
            <p class="feedback-title">${result.message}</p>
          `;
        }
      }
    });
  });
}
