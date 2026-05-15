// ============================================================
//  MÎK AI — app.js  (FIXED v3 — bulletproof mobile auth)
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

// ── Wait for full page load before doing ANYTHING ────────────
window.addEventListener("load", function () {

  // ── Init Firebase ────────────────────────────────────────
  firebase.initializeApp(FIREBASE_CONFIG);
  const auth     = firebase.auth();
  const provider = new firebase.auth.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  // ── DOM refs ─────────────────────────────────────────────
  const googleBtn = document.getElementById("googleBtn");
  const statusMsg = document.getElementById("statusMsg");

  // ── Helpers ──────────────────────────────────────────────
  function showStatus(msg, type) {
    if (!statusMsg) return;
    statusMsg.textContent = msg;
    statusMsg.className   = type || "loading";
    statusMsg.style.display = "block";
  }

  function setLoading(on) {
    if (!googleBtn) return;
    googleBtn.disabled     = on;
    googleBtn.textContent  = on ? "Signing in…" : "Sign in with Google";
  }

  // ── Send Firebase token → Railway backend ─────────────────
  async function authenticateWithBackend(idToken) {
    const res = await fetch(BACKEND_URL + "/auth/google", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ idToken: idToken }),
    });
    if (!res.ok) throw new Error("Backend error " + res.status);
    return res.json();
  }

  // ── Save session ──────────────────────────────────────────
  function saveSession(data, firebaseUser) {
    try {
      if (data && data.token) localStorage.setItem("mik_token", data.token);
      localStorage.setItem("mik_user", JSON.stringify({
        uid:   firebaseUser.uid,
        name:  firebaseUser.displayName  || "MÎK User",
        email: firebaseUser.email        || "",
        photo: firebaseUser.photoURL     || "",
      }));
    } catch(e) {
      console.warn("localStorage error:", e);
    }
  }

  // ── STEP 1: Handle redirect result FIRST (top priority) ───
  // This must run before anything else on every page load
  setLoading(true);
  showStatus("Checking login status…", "loading");

  auth.getRedirectResult()
    .then(async function(result) {

      if (result && result.user) {
        // ✅ User just came back from Google redirect
        showStatus("Verifying with MÎK AI…", "loading");

        try {
          const idToken = await result.user.getIdToken();
          const data    = await authenticateWithBackend(idToken);
          saveSession(data, result.user);
          showStatus("Welcome " + (result.user.displayName || "") + "! 🪐", "success");

          setTimeout(function() {
            window.location.replace("index.html");
          }, 800);

        } catch(backendErr) {
          console.error("Backend error:", backendErr);
          // Even if backend fails, save basic user and proceed
          saveSession({}, result.user);
          window.location.replace("index.html");
        }

      } else {
        // ✅ Normal page load — not returning from Google
        setLoading(false);
        showStatus("", "");
        statusMsg.style.display = "none";

        // Check if already logged in
        const existingToken = localStorage.getItem("mik_token");
        const existingUser  = localStorage.getItem("mik_user");
        if (existingToken && existingUser) {
          window.location.replace("index.html");
        }
      }

    })
    .catch(function(err) {
      console.error("getRedirectResult error:", err);
      setLoading(false);

      // Common errors and friendly messages
      if (err.code === "auth/network-request-failed") {
        showStatus("No internet. Check connection.", "error");
      } else if (err.code === "auth/unauthorized-domain") {
        showStatus("Domain not authorized. Add it in Firebase Console.", "error");
      } else {
        showStatus(err.message || "Login failed. Try again.", "error");
      }
    });

  // ── STEP 2: Button click → go to Google ──────────────────
  if (googleBtn) {
    googleBtn.addEventListener("click", function() {
      setLoading(true);
      showStatus("Redirecting to Google…", "loading");
      auth.signInWithRedirect(provider).catch(function(err) {
        console.error("Redirect error:", err);
        setLoading(false);
        showStatus(err.message || "Could not redirect. Try again.", "error");
      });
    });
  }

  // ── Global logout ─────────────────────────────────────────
  window.mikLogout = function() {
    auth.signOut().then(function() {
      localStorage.removeItem("mik_token");
      localStorage.removeItem("mik_user");
      window.location.replace("login.html");
    });
  };

}); // end window.load
