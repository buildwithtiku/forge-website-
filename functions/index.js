/**
 * Forge Website — Cloud Functions
 *
 * Secure registration endpoint for the Forge Download waitlist.
 */

const crypto = require("crypto");
const admin = require("firebase-admin");
const {getFirestore, FieldValue} = require("firebase-admin/firestore");
const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = getFirestore();

setGlobalOptions({maxInstances: 10});

// Simple RFC 5322 compatible email pattern
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
  "http://localhost:5000",
  "https://forge-fad14.web.app",
  "https://forge-fad14.firebaseapp.com",
];

/**
 * Masks an email for safe logging without exposing PII.
 * @param {string} email
 * @return {string}
 */
function maskEmail(email) {
  if (!email || typeof email !== "string") return "[invalid]";
  const parts = email.split("@");
  if (parts.length !== 2) return "[malformed]";
  const name = parts[0];
  const domain = parts[1];
  const maskedName = name.length > 2 ?
    `${name[0]}***${name[name.length - 1]}` :
    `${name[0]}***`;
  return `${maskedName}@${domain}`;
}

/**
 * Checks if origin is permitted.
 * @param {string} origin
 * @return {boolean}
 */
function isAllowedOrigin(origin) {
  if (!origin) return true; // Non-browser / same-origin requests
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  // Allow localhost with arbitrary port for local testing
  if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
    return true;
  }
  return false;
}

/**
 * Cloud Function: registerDownload
 * Handles POST requests to register an early access lead in Firestore.
 */
exports.registerDownload = onRequest({
  cors: false, // Explicit custom CORS handler for security
  maxInstances: 10,
}, async (req, res) => {
  const origin = req.headers.origin;

  if (origin && isAllowedOrigin(origin)) {
    res.set("Access-Control-Allow-Origin", origin);
    res.set("Vary", "Origin");
  }

  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");
  res.set("Access-Control-Max-Age", "3600");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({
      success: false,
      error: "Method Not Allowed. Use POST.",
    });
    return;
  }

  const {email, source, page, campaign} = req.body || {};

  if (!email || typeof email !== "string") {
    res.status(400).json({
      success: false,
      error: "Email is required.",
    });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (normalizedEmail.length > 254 || !EMAIL_REGEX.test(normalizedEmail)) {
    res.status(400).json({
      success: false,
      error: "Please provide a valid email address.",
    });
    return;
  }

  // Generate deterministic document ID via SHA-256 hash of normalized email
  const docId = crypto
      .createHash("sha256")
      .update(normalizedEmail)
      .digest("hex");

  const docRef = db.collection("download_leads").doc(docId);

  try {
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      logger.info("Registration: existing lead", {
        masked: maskEmail(normalizedEmail),
      });
      res.status(200).json({
        success: true,
        alreadyRegistered: true,
      });
      return;
    }

    const safeSource = typeof source === "string" ?
      source.trim().slice(0, 100) : "download-page";
    const safePage = typeof page === "string" ?
      page.trim().slice(0, 100) : "download";
    const safeCampaign = typeof campaign === "string" ?
      campaign.trim().slice(0, 100) : "coming-soon";

    const payload = {
      email: normalizedEmail,
      createdAt: FieldValue.serverTimestamp(),
      source: safeSource,
      page: safePage,
      campaign: safeCampaign,
    };

    await docRef.set(payload);

    logger.info("Registration: new lead stored", {
      masked: maskEmail(normalizedEmail),
    });

    res.status(200).json({
      success: true,
      alreadyRegistered: false,
    });
  } catch (error) {
    logger.error("Firestore registration error: " + error.message);
    res.status(500).json({
      success: false,
      error: "Unable to register at this time. Please try again later.",
    });
  }
});
