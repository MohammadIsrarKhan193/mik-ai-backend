// ============================================================
//  MÎK AI — app.js
//  Firebase Google Login + Railway Backend Auth
//  Built by Mohammad Israr Khan (Afghanistan)
// ============================================================

const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyB7gnDvk6rKJPLj-h7ykU6hcWM1YuGqrZQ",
  authDomain:        "mik-ai-app.firebaseapp.com",
  projectId:         "mik-ai-app",
  storageBucket:     "mik-ai-app.firebasestorage.app",
  messagingSenderId: "382112001405",
  appId:             "1:382112001405:web:c7bfe1fb6a2f897a097014",
};

const BACKEND_URL = "https://mik-ai-backend.onrender.com";

// ── Init Firebase ────────────────────────────────────────────
firebase.initializeApp(FIREBASE_CONFIG);
const auth     = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

// ── DOM refs ─────────────────────────────────────────────────
const googleBtn  = document.getElementById("googleBtn");
const statusMsg  = document.getElementById("statusMsg");

// ── Helpers ──────────────────────────────────────────────────
function showStatus(msg, type = "loading") {
  statusMsg.textContent  = msg;
  statusMsg.className    = type; // "loading" | "success" | "error"
}
function clearStatus() {
  statusMsg.textContent = "";
  statusMsg.className   = "";
}

// ── Google Sign-In ────────────────────────────────────────────
googleBtn.addEventListener("click", async () => {
  googleBtn.disabled = true;
  showStatus("Opening Google sign-in…", "loading");

  try {
    const result = await auth.signInWithPopup(provider);
    const user   = result.user;
    const idToken = await user.getIdToken();

    showStatus("Verifying with MÎK AI server…", "loading");

    // Send token to Railway backend for verification
    const res = await fetch(`${BACKEND_URL}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || `Server error ${res.status}`);
    }

    const data = await res.json();

    // Store session token returned by backend (if any)
    if (data.token) {
      localStorage.setItem("mik_token", data.token);
    }

    // Store basic user info
    localStorage.setItem("mik_user", JSON.stringify({
      uid:    user.uid,
      name:   user.displayName,
      email:  user.email,
      photo:  user.photoURL,
    }));

    showStatus(`Welcome, ${user.displayName?.split(" ")[0] || "friend"}! Redirecting…`, "success");

    setTimeout(() => {
      window.location.href = "chat.html"; // → your main chat page
    }, 1200);

  } catch (err) {
    console.error("[MÎK AI] Auth error:", err);

    // Firebase cancelled by user
    if (err.code === "auth/popup-closed-by-user") {
      clearStatus();
    } else {
      showStatus(err.message || "Sign-in failed. Please try again.", "error");
    }
    googleBtn.disabled = false;
  }
});

// ── Auto-redirect if already logged in ───────────────────────
auth.onAuthStateChanged(user => {
  if (user) {
    const token = localStorage.getItem("mik_token");
    if (token) {
      // Already authenticated — skip login page
      window.location.href = "chat.html";
    }
  }
});
