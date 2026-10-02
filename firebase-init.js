// Shared Firebase setup (Auth + Realtime Database).
// Paste your config from Firebase Console > Project settings > Your apps (Web).
// databaseURL is shown at the top of Realtime Database > Data.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getDatabase, ref, get, set, push, update, remove, onValue, query, limitToLast } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber, ref, get, set, push, update, remove, onValue, query, limitToLast };

// Escape text before putting it into innerHTML
export const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

// Read a path and return its children as an array of { id, ...data }
export async function list(path) {
  const v = (await get(ref(db, path))).val() || {};
  return Object.entries(v).map(([id, d]) => ({ id, ...d }));
}

// Create the user's profile on first login (role is always "learner"; admins are set in the console)
export async function ensureProfile(user) {
  const r = ref(db, "users/" + user.uid);
  const snap = await get(r);
  if (snap.exists()) return snap.val();
  const p = { name: user.displayName || "Learner", email: user.email || "", phone: user.phoneNumber || "",
              photo: user.photoURL || "", role: "learner", createdAt: Date.now() };
  await set(r, p);
  return p;
}

// Run cb(user, profile) for a signed-in user, otherwise send to the login page
export function requireUser(cb) {
  onAuthStateChanged(auth, async u => {
    if (!u) { location.href = "login.html"; return; }
    cb(u, await ensureProfile(u));
  });
}
export const logout = () => signOut(auth).then(() => (location.href = "login.html"));

// Turn a YouTube link into an embed URL ("" if it is not a YouTube link)
export const ytEmbed = u => { const m = String(u || "").match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/); return m ? "https://www.youtube.com/embed/" + m[1] : ""; };

// Fill a container with published courses from the database.
// If there are none (or they can't be read) the existing HTML is left as it is.
export async function loadCourses(el, limit) {
  try {
    let cs = (await list("courses")).filter(c => c.published === true).sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
    if (limit) cs = cs.slice(0, limit);
    if (!cs.length || !el) return;
    el.innerHTML = cs.map(c => { const k = c.type === "free" ? "free" : "paid";
      return `<a class="course" data-t="${k}" href="course.html?id=${encodeURIComponent(c.id)}">
      ${c.imageUrl ? `<div class="pic"><img src="${esc(c.imageUrl)}" alt="" loading="lazy"></div>` : '<div class="pic ph" style="background:linear-gradient(135deg,#e7a15a,#9a4a1f)">🕉️</div>'}
      <div class="body"><h3>${esc(c.title)}</h3><div class="tags"><span class="tag ${k}">${k === "free" ? "Free" : "Paid"}</span><span class="lessons">${c.lessons || 0} Lessons</span></div></div></a>`; }).join("");
  } catch (e) { console.warn("Using built-in course list:", e.code || e); }
}
