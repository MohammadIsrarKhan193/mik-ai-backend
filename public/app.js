// ============================================================
//  MÎK AI — app.js  (FIXED v4 — init.json 404 fix)
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

const BACKEND_URL = "https://mik-ai-backend.onrender.com";

window.addEventListener("load", function () {

  // ── Init Firebase with redirect fix ──────────────────────
  // KEY FIX: setPersistence to none prevents init.json lookup issue
  if (!firebase.apps.length) {
    firebase.initializeApp(FIREBASE_CONFIG);
  }

  const auth     = firebase.auth();
  const provider = new firebase.auth.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  // ── KEY FIX: Use session persistence (not local) ─────────
  // This prevents the init.json 404 error on non-Firebase-hosted sites
  auth.setPersistence(firebase.auth.Auth.Persistence.SESSION).catch(function(e) {
    console.warn("Persistence error:", e);
  });

  const googleBtn = document.getElementById("googleBtn");
  const statusMsg = document.getElementById("statusMsg");

  function showStatus(msg, type) {
    if (!statusMsg) return;
    statusMsg.textContent   = msg;
    statusMsg.className     = type || "loading";
    statusMsg.style.display = msg ? "block" : "none";
  }

  function setLoading(on) {
    if (!googleBtn) return;
    googleBtn.disabled    = on;
    googleBtn.textContent = on ? "Signing in…" : "Sign in with Google";
  }

  async function authenticateWithBackend(idToken) {
    const res = await fetch(BACKEND_URL + "/auth/google", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ idToken: idToken }),
    });
    if (!res.ok) throw new Error("Backend error " + res.status);
    return res.json();
  }

  function saveSession(data, firebaseUser) {
    try {
      if (data && data.token) localStorage.setItem("mik_token", data.token);
      localStorage.setItem("mik_user", JSON.stringify({
        uid:   firebaseUser.uid,
        name:  firebaseUser.displayName || "MÎK User",
        email: firebaseUser.email       || "",
        photo: firebaseUser.photoURL    || "",
      }));
    } catch(e) { console.warn("localStorage error:", e); }
  }

  // ── Handle redirect result ────────────────────────────────
  setLoading(true);
  showStatus("Checking login status…", "loading");

  auth.getRedirectResult()
    .then(async function(result) {

      if (result && result.user) {
        showStatus("Verifying with MÎK AI… 🪐", "loading");
        try {
          const idToken = await result.user.getIdToken();
          const data    = await authenticateWithBackend(idToken);
          saveSession(data, result.user);
        } catch(e) {
          // Backend failed but user is authenticated — save anyway
          console.warn("Backend verify failed, proceeding:", e.message);
          saveSession({}, result.user);
        }
        showStatus("Welcome! Redirecting… 🪐", "success");
        setTimeout(function() {
          window.location.replace("index.html");
        }, 600);

      } else {
        // Normal page load
        setLoading(false);
        showStatus("", "");

        // Already logged in? Skip to app
        if (localStorage.getItem("mik_token") && localStorage.getItem("mik_user")) {
          window.location.replace("index.html");
          return;
        }
      }

    })
    .catch(function(err) {
      console.error("Auth error:", err.code, err.message);
      setLoading(false);

      if (err.code === "auth/network-request-failed") {
        showStatus("Network error. Check internet.", "error");
      } else if (err.code === "auth/unauthorized-domain") {
        showStatus("Domain not authorized in Firebase.", "error");
      } else if (err.code === "auth/operation-not-supported-in-this-environment") {
        showStatus("Please use a modern browser.", "error");
      } else {
        showStatus(err.message || "Login failed. Try again.", "error");
      }
    });

  // ── Button click → redirect to Google ────────────────────
  if (googleBtn) {
    googleBtn.addEventListener("click", function() {
      setLoading(true);
      showStatus("Redirecting to Google…", "loading");
      auth.signInWithRedirect(provider).catch(function(err) {
        setLoading(false);
        showStatus(err.message || "Redirect failed.", "error");
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

});
