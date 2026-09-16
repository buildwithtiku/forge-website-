/**
 * Forge Website — Central Configuration
 * 
 * Centralized configuration for app store links, download destinations,
 * and global feature toggles.
 */

export const FORGE_CONFIG = {
  // Production store URLs:
  // When live, set APP_DOWNLOAD_URL to the official App Store or Play Store link.
  // When null, all download CTAs smoothly route to the #get-started onboarding section
  // to avoid fake links or broken transitions.
  APP_DOWNLOAD_URL: null, // e.g., 'https://apps.apple.com/app/forge-build-yourself'
  
  APP_STORE_URL: null, // iOS App Store
  PLAY_STORE_URL: null, // Google Play Store
  
  APP_STORE_NAME: 'App Store & Google Play',
  WAITLIST_ANCHOR: '#stay-in-loop',
  
  // Newsletter / Early Access Endpoint
  // Set to webhook URL (e.g. Supabase edge function, Formspree, Resend, or Zapier) when ready.
  // When null, emails are safely validated and saved in localStorage ('forge_subscribers').
  NEWSLETTER_ENDPOINT: null,
  
  // Supabase Configuration
  SUPABASE_URL: (typeof window !== 'undefined' && window.__FORGE_SUPABASE_URL__) ||
    (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_URL) ||
    null,

  SUPABASE_ANON_KEY: (typeof window !== 'undefined' && window.__FORGE_SUPABASE_ANON_KEY__) ||
    (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY) ||
    null,

  // Register Download Lead Endpoint (Supabase RPC register_download)
  get REGISTER_DOWNLOAD_URL() {
    if (typeof window !== 'undefined' && window.__FORGE_REGISTER_URL__) {
      return window.__FORGE_REGISTER_URL__;
    }
    if (this.SUPABASE_URL) {
      return `${this.SUPABASE_URL.replace(/\/+$/, '')}/rest/v1/rpc/register_download`;
    }
    return null;
  },
  
  // Brand details
  BRAND_NAME: 'Forge',
  TAGLINE: 'Build Yourself.',
};
