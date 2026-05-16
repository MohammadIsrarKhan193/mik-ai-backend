// app.js is no longer needed for login — logic is now in login.html
// This file handles logout and session utilities for other pages

const BACKEND_URL = "https://mik-ai-backend.onrender.com";

// ── Auth guard — add this to index.html and other protected pages ──
function checkAuth() {
  const token = localStorage.getItem("mik_token");
  const user  = localStorage.getItem("mik_user");
  if (!token || !user) {
    window.location.replace("login.html");
    return null;
  }
  return JSON.parse(user);
}

// ── Logout ────────────────────────────────────────────────────
function mikLogout() {
  localStorage.removeItem("mik_token");
  localStorage.removeItem("mik_user");
  window.location.replace("login.html");
}

// ── Get auth headers for API calls ───────────────────────────
function authHeaders() {
  return {
    "Content-Type": "application/json",
    "Authorization": "Bearer " + localStorage.getItem("mik_token"),
  };
}
