// ============================================================
//  MÎK AI — app.js  (Firebase Auth — Mobile-Safe FIXED)
//  Uses signInWithRedirect (fixes sessionStorage error on mobile)
//  Built by Mohammad Israr Khan (Afghanistan) 🪐
// ============================================================

const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyB7gnDvk6rKJPLj-h7ykU6hcWM1YuGqrZQ",
  authDomain:        "mik-ai-app.firebaseapp.com",
  projectId:         "mik-ai-app",
  storageBucket:     "mik-ai-app.firebasestorage.app",
  messagingSenderId: "382112001405",
  appId:             "1:382112001405:web:c7bfe1fb6a2f897a097014",
};

const BACKEND_URL = "https://mik-ai-backend-production.up.railway.app";

// ── Init Firebase ─────────────────────────────────────────────
firebase.initializeApp(FIREBASE_CONFIG);
const auth     = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

// ── DOM refs ──────────────────────────────────────────────────
const googleBtn = document.getElementById("googleBtn");
const statusMsg = document.getElementById("statusMsg");

// ── Helpers ───────────────────────────────────────────────────
function showStatus(msg, type = "loading") {
  statusMsg.innerHTML = type === "loading"
    ? `<span class="spinner"></span>${msg}` : msg;
  statusMsg.className = type;
}
function clearStatus() { statusMsg.textContent = ""; statusMsg.className = ""; }

const GOOGLE_SVG = `<svg class="google-logo" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
  <path fill="#EA4335" d="M24 9.5c3.1 0 5.9 1.1 8.1 2.9l6-6C34.5 3.1 29.5 1 24 1 14.8 1 7 6.7 3.7 14.6l7 5.4C12.4 14 17.7 9.5 24 9.5z"/>
  <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.4 5.7c4.3-4 6.8-9.9 6.8-16.9z"/>
  <path fill="#FBBC05" d="M10.7 28.6A14.7 14.7 0 0 1 9.5 24c0-1.6.3-3.2.7-4.6l-7-5.4A23.9 23.9 0 0 0 0 24c0 3.9.9 7.5 2.5 10.7l8.2-6.1z"/>
  <path fill="#34A853" d="M24 47c5.4 0 10-1.8 13.3-4.8l-7.4-5.7c-1.8 1.2-4.2 1.9-5.9 1.9-6.3 0-11.6-4.5-13.3-10.5l-8.2 6.1C7 41.3 14.8 47 24 47z"/>
</svg> Sign in with Google`;

function setButtonLoading(loading) {
  googleBtn.disabled  = loading;
  googleBtn.innerHTML = loading
    ? `<span class="spinner"></span> Signing in…`
    : GOOGLE_SVG;
}

// ── Send Firebase token to backend ────────────────────────────
async function authenticateWithBackend(idToken) {
  const res = await fetch(`${BACKEND_URL}/auth/google`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ idToken }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Server error ${res.status}`);
  }
  return res.json();
}

// ── Save session ──────────────────────────────────────────────
function saveSession(data, firebaseUser) {
  if (data.token) localStorage.setItem("mik_token", data.token);
  localStorage.setItem("mik_user", JSON.stringify({
    uid:   firebaseUser.uid,
    name:  firebaseUser.displayName,
    email: firebaseUser.email,
    photo: firebaseUser.photoURL,
  }));
}

// ── STEP 1: Button → redirect to Google ──────────────────────
// KEY FIX: signInWithRedirect works on ALL mobile browsers.
// signInWithPopup fails on mobile Chrome with "sessionStorage missing" error.
googleBtn.addEventListener("click", () => {
  setButtonLoading(true);
  showStatus("Redirecting to Google…", "loading");
  auth.signInWithRedirect(provider);
});

// ── STEP 2: After redirect returns → handle result ────────────
// getRedirectResult() must be called on every page load.
// It resolves with user data ONLY when returning from Google redirect.
auth.getRedirectResult()
  .then(async (result) => {
    if (!result || !result.user) return; // Normal page load, skip

    const user = result.user;
    setButtonLoading(true);
    showStatus("Verifying with MÎK AI server…", "loading");

    const idToken = await user.getIdToken();
    const data    = await authenticateWithBackend(idToken);
    saveSession(data, user);

    showStatus(`Welcome, ${user.displayName?.split(" ")[0] || "friend"}! 🪐`, "success");
    setTimeout(() => { window.location.href = "index.html"; }, 1000);
  })
  .catch((err) => {
    console.error("[MÎK AI] Auth error:", err);
    showStatus(err.message || "Sign-in failed. Please try again.", "error");
    setButtonLoading(false);
  });

// ── STEP 3: Already authenticated → skip login page ──────────
auth.onAuthStateChanged(async (user) => {
  if (user && localStorage.getItem("mik_token")) {
    try {
      const idToken = await user.getIdToken(true);
      const data    = await authenticateWithBackend(idToken);
      saveSession(data, user);
    } catch (e) {
      console.warn("[MÎK AI] Token refresh failed, continuing anyway:", e.message);
    }
    window.location.href = "index.html";
  }
});

// ── Global logout (call from any page) ───────────────────────
window.mikLogout = async () => {
  await auth.signOut();
  localStorage.removeItem("mik_token");
  localStorage.removeItem("mik_user");
  window.location.href = "login.html";
};b
