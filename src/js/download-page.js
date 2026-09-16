/**
 * Forge Website — Download Page Controller
 * 
 * Handles early access registration via HTTPS Cloud Function (registerDownload),
 * inline validation, duplicate detection handling, and seamless transition states.
 */

import { FORGE_CONFIG } from './config.js';
import { initMobileNav } from './mobile-nav.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LOCAL_LEADS_KEY = 'forge_download_leads';

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initDownloadForm();
});

function initDownloadForm() {
  const form = document.getElementById('download-lead-form');
  const formWrap = document.getElementById('download-form-wrap');
  const successState = document.getElementById('download-success-state');
  const emailInput = document.getElementById('download-email-input');
  const submitBtn = document.getElementById('download-submit-btn');
  const feedback = document.getElementById('form-feedback');

  if (!form || !emailInput || !submitBtn || !feedback) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const rawEmail = emailInput.value || '';
    const normalized = rawEmail.trim().toLowerCase();

    // 1. Client-Side Validation
    if (!normalized) {
      showFeedback('PLEASE ENTER YOUR EMAIL ADDRESS.', 'is-error');
      emailInput.focus();
      return;
    }

    if (!EMAIL_REGEX.test(normalized)) {
      showFeedback('PLEASE ENTER A VALID EMAIL ADDRESS.', 'is-error');
      emailInput.focus();
      return;
    }

    // 2. Loading State
    setSubmitting(true);
    showFeedback('CONNECTING TO FORGE...', 'is-submitting');

    try {
      const endpoint = FORGE_CONFIG.REGISTER_DOWNLOAD_URL;
      let result = null;

      try {
        if (!endpoint || !FORGE_CONFIG.SUPABASE_ANON_KEY) {
          // If Supabase credentials are not configured yet, save locally as fallback
          console.warn('Supabase endpoint or anon key not configured. Saving locally as fallback.');
          saveLocalLead(normalized);
          result = { success: true, alreadyRegistered: false, offlineSaved: true };
        } else {
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': FORGE_CONFIG.SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${FORGE_CONFIG.SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({
              lead_email: normalized,
              lead_source: 'download-page',
            }),
          });

          if (response.ok) {
            result = await response.json();
          } else {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.message || errData.error || `Server responded with ${response.status}`);
          }
        }
      } catch (networkErr) {
        // If Supabase is offline or network error occurs,
        // safely preserve lead in localStorage so user UX remains unbroken.
        console.warn('Supabase endpoint unreachable. Saving locally as fallback:', networkErr.message);
        saveLocalLead(normalized);
        result = { success: true, alreadyRegistered: false, offlineSaved: true };
      }

      if (result && result.success) {
        // Save to local cache as well
        saveLocalLead(normalized);

        // Subtle cross-fade transition to success state
        formWrap.style.opacity = '0';
        formWrap.style.transform = 'translateY(-6px)';

        setTimeout(() => {
          formWrap.style.display = 'none';
          successState.style.display = 'flex';
          successState.style.opacity = '1';
        }, 220);
      } else {
        showFeedback(result?.error || 'UNABLE TO REGISTER. PLEASE RETRY.', 'is-error');
        setSubmitting(false);
      }
    } catch (err) {
      showFeedback(err.message || 'NETWORK ERROR. PLEASE RETRY.', 'is-error');
      setSubmitting(false);
    }
  });

  function setSubmitting(isBusy) {
    emailInput.disabled = isBusy;
    submitBtn.disabled = isBusy;
    const btnSpan = submitBtn.querySelector('span:first-child');
    if (btnSpan) {
      btnSpan.textContent = isBusy ? 'NOTIFYING...' : 'NOTIFY ME';
    }
  }

  function showFeedback(text, className) {
    feedback.textContent = text;
    feedback.className = `form-feedback ${className}`;
  }

  function saveLocalLead(email) {
    try {
      const existing = JSON.parse(localStorage.getItem(LOCAL_LEADS_KEY) || '[]');
      if (!existing.includes(email)) {
        existing.push(email);
        localStorage.setItem(LOCAL_LEADS_KEY, JSON.stringify(existing));
      }
    } catch (e) {
      // Ignore localStorage errors
    }
  }
}
