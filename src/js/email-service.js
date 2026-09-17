/**
 * Forge Website — Email / Waitlist Service
 * 
 * Handles client-side email validation, Supabase RPC integration (register_download),
 * duplicate detection handling, and accessible UX feedback states.
 */

import { FORGE_CONFIG } from './config.js';

// Simple RFC 5322 compatible email pattern
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STORAGE_KEY = 'forge_subscribers';

export async function submitEmail(email, source = 'footer-signup') {
  const normalized = (email || '').trim().toLowerCase();

  // 1. Validation check
  if (!normalized || !EMAIL_REGEX.test(normalized)) {
    return {
      success: false,
      status: 'invalid',
      message: 'ENTER A VALID EMAIL.',
    };
  }

  // 2. Check Supabase endpoint and credentials
  const endpoint = FORGE_CONFIG.REGISTER_DOWNLOAD_URL;
  const anonKey = FORGE_CONFIG.SUPABASE_ANON_KEY;

  if (!endpoint || !anonKey) {
    console.error('Supabase configuration missing: REGISTER_DOWNLOAD_URL or SUPABASE_ANON_KEY not set.');
    return {
      success: false,
      status: 'error',
      message: 'SERVICE UNAVAILABLE. PLEASE TRY AGAIN.',
    };
  }

  // 3. Supabase RPC Submission
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
      },
      body: JSON.stringify({
        lead_email: normalized,
        lead_source: source,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const errMsg = errData.message || errData.error || `Server error (${response.status})`;
      throw new Error(errMsg);
    }

    const result = await response.json();

    // 4. Verify RPC returned success: true
    if (result && result.success) {
      // Update local storage cache for client-side record
      const existingSubscribers = getLocalSubscribers();
      if (!existingSubscribers.includes(normalized)) {
        existingSubscribers.push(normalized);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(existingSubscribers));
        } catch (e) {
          // ignore localStorage quota errors
        }
      }

      return {
        success: true,
        status: 'success',
        alreadyRegistered: Boolean(result.alreadyRegistered),
        message: "YOU'RE IN.",
        subMessage: "Thanks — we'll keep you posted.",
      };
    }

    return {
      success: false,
      status: 'error',
      message: result?.error || 'UNABLE TO REGISTER. PLEASE RETRY.',
    };
  } catch (err) {
    console.error('Supabase registration error:', err);
    return {
      success: false,
      status: 'error',
      message: 'UNABLE TO REGISTER. PLEASE RETRY.',
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
export function initEmailForm(formSelector = '.newsletter-form', feedbackSelector = null) {
  const forms = document.querySelectorAll(formSelector);
  if (!forms.length) return;

  forms.forEach((form) => {
    if (form.dataset.initialized === 'true') return;
    form.dataset.initialized = 'true';

    const input = form.querySelector('input[type="email"]');
    const submitBtn = form.querySelector('button[type="submit"]');
    const feedbackContainer = feedbackSelector 
      ? document.querySelector(feedbackSelector)
      : (form.querySelector('.newsletter-feedback') || form.parentElement?.querySelector('.newsletter-feedback') || form.nextElementSibling);

    if (!input || !submitBtn) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const btnSpan = submitBtn.querySelector('span');
      const originalBtnText = btnSpan ? btnSpan.textContent : submitBtn.textContent;
      const emailValue = input.value;
      const leadSource = form.getAttribute('data-lead-source') || 'footer-signup';

      // Base classes for feedback container to preserve layout styling
      const baseFeedbackClass = feedbackContainer
        ? (feedbackContainer.dataset.baseClass || feedbackContainer.className.replace(/\bis-(success|warning|error|submitting)\b/g, '').trim())
        : '';
      if (feedbackContainer) {
        feedbackContainer.dataset.baseClass = baseFeedbackClass;
        feedbackContainer.innerHTML = '';
        feedbackContainer.className = baseFeedbackClass;
      }

      // Loading State
      submitBtn.disabled = true;
      if (btnSpan) {
        btnSpan.textContent = 'JOINING...';
      } else {
        submitBtn.textContent = 'JOINING...';
      }
      form.classList.add('is-submitting');

      const result = await submitEmail(emailValue, leadSource);

      // Restore button
      submitBtn.disabled = false;
      if (btnSpan) {
        btnSpan.textContent = originalBtnText;
      } else {
        submitBtn.textContent = originalBtnText;
      }
      form.classList.remove('is-submitting');

      if (feedbackContainer) {
        if (result.success) {
          form.classList.add('is-success');
          input.value = '';
          input.disabled = true;
          submitBtn.disabled = true;

          feedbackContainer.className = `${baseFeedbackClass} is-success`.trim();
          feedbackContainer.innerHTML = `
            <p class="feedback-title">${result.message}</p>
            <p class="feedback-sub">${result.subMessage}</p>
          `;
        } else if (result.status === 'invalid') {
          feedbackContainer.className = `${baseFeedbackClass} is-error`.trim();
          feedbackContainer.innerHTML = `
            <p class="feedback-title">${result.message}</p>
          `;
          input.focus();
        } else {
          feedbackContainer.className = `${baseFeedbackClass} is-error`.trim();
          feedbackContainer.innerHTML = `
            <p class="feedback-title">${result.message}</p>
          `;
        }
      }
    });
  });
}
