// Shared Firebase setup (Auth + Realtime Database) with Seamless Offline/Demo Fallback.
// Paste your config from Firebase Console > Project settings > Your apps (Web) if you want live cloud sync.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, onAuthStateChanged as fbOnAuthStateChanged, signOut as fbSignOut, GoogleAuthProvider, signInWithPopup as fbSignInWithPopup, RecaptchaVerifier, signInWithPhoneNumber, signInWithEmailAndPassword as fbSignInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getDatabase, ref as fbRef, get as fbGet, set as fbSet, push as fbPush, update as fbUpdate, remove as fbRemove, onValue as fbOnValue, query as fbQuery, limitToLast as fbLimitToLast } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";

// Check if user saved custom config in localStorage, or use default
const savedConfigStr = localStorage.getItem("sg_firebase_config");
let activeConfig = null;
if (savedConfigStr) {
  try { activeConfig = JSON.parse(savedConfigStr); } catch (e) { activeConfig = null; }
}

const firebaseConfig = activeConfig || {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Check if real config is present
const hasRealFirebase = Boolean(
  firebaseConfig.apiKey &&
  !firebaseConfig.apiKey.includes("YOUR_") &&
  firebaseConfig.projectId &&
  !firebaseConfig.projectId.includes("YOUR_")
);

// -------------------------------------------------------------
// DEFAULT DATA SET FOR GURUKULAM
// -------------------------------------------------------------
export const DEFAULT_COURSES = [
  {
    id: "bhagavad-gita",
    title: "Bhagavad Gita for Beginners",
    desc: "Understand the timeless spiritual wisdom of the Bhagavad Gita explained simply with daily life applications.",
    type: "free",
    lessons: 12,
    imageUrl: "images/bhagavth gita.png",
    videoUrl: "https://www.youtube.com/watch?v=2b1z9CgH-Vw",
    published: true,
    createdAt: 1727800000000
  },
  {
    id: "sanskrit-basics",
    title: "Sanskrit Basics & Pronunciation",
    desc: "Learn to read, pronounce, and understand Samskritam vocabulary, mantras, and shlokas with correct intonation.",
    type: "paid",
    lessons: 24,
    imageUrl: "images/sanskrit basics.png",
    videoUrl: "",
    published: true,
    createdAt: 1727801000000
  },
  {
    id: "indian-history",
    title: "Indian History True Perspective",
    desc: "Discover the authentic civilizational heritage, historical milestones, and contributions of ancient Bharat.",
    type: "paid",
    lessons: 28,
    imageUrl: "images/india history.png",
    videoUrl: "",
    published: true,
    createdAt: 1727802000000
  },
  {
    id: "ramayanam",
    title: "Ramayana Deep Study",
    desc: "An in-depth exploration of Valmiki Ramayana, character ethics, dharma, and leadership virtues.",
    type: "paid",
    lessons: 32,
    imageUrl: "images/ramayanam.png",
    videoUrl: "",
    published: true,
    createdAt: 1727803000000
  },
  {
    id: "yoga-daily",
    title: "Yoga for Daily Life",
    desc: "Daily guided asanas, pranayama, and mindfulness routines for physical vitality and spiritual calm.",
    type: "paid",
    lessons: 20,
    imageUrl: "",
    videoUrl: "",
    published: true,
    createdAt: 1727804000000
  },
  {
    id: "vishnu-sahasranamam",
    title: "Vishnu Sahasranamam Chanting & Meaning",
    desc: "Learn the proper chanting, stotra cadence, and profound philosophical meanings of the 1,000 sacred names.",
    type: "free",
    lessons: 10,
    imageUrl: "",
    videoUrl: "",
    published: true,
    createdAt: 1727805000000
  },
  {
    id: "intro-vedas",
    title: "Introduction to the Vedas",
    desc: "Foundational overview of the four Vedas, Upanishads, Vedic vision of reality, and cultural ethos.",
    type: "paid",
    lessons: 18,
    imageUrl: "",
    videoUrl: "",
    published: true,
    createdAt: 1727806000000
  },
  {
    id: "temple-culture",
    title: "Temple Culture & Architecture",
    desc: "Understand the sacred geometry, Agama shastras, and spiritual symbolism behind ancient Indian temples.",
    type: "paid",
    lessons: 16,
    imageUrl: "",
    videoUrl: "",
    published: true,
    createdAt: 1727807000000
  }
];

export const DEFAULT_LIVE = [
  {
    id: "live-gita",
    title: "Bhagavad Gita – Chapter 2",
    teacher: "Acharya Dr. Srinivas Sharma",
    startsAt: Date.now() + 2 * 3600 * 1000,
    link: "https://meet.google.com/gurukulam-live",
    createdAt: Date.now()
  },
  {
    id: "live-sanskrit",
    title: "Sanskrit Basics & Shloka Recitation",
    teacher: "Acharya Veda Prakash",
    startsAt: Date.now() + 5 * 3600 * 1000,
    link: "https://meet.google.com/gurukulam-sanskrit",
    createdAt: Date.now()
  },
  {
    id: "live-yoga",
    title: "Yoga for Daily Life",
    teacher: "Smt. Anasuya Devi",
    startsAt: Date.now() + 8 * 3600 * 1000,
    link: "https://meet.google.com/gurukulam-yoga",
    createdAt: Date.now()
  },
  {
    id: "live-vishnu",
    title: "Vishnu Sahasranamam Chanting",
    teacher: "Sri Parthasarathy garu",
    startsAt: Date.now() + 24 * 3600 * 1000,
    link: "https://meet.google.com/gurukulam-vishnu",
    createdAt: Date.now()
  }
];

export const DEFAULT_COMMUNITY = {
  gita: {
    m1: { uid: "u_lakshmi", name: "Lakshmi Devi", text: "Can someone explain Karma Yoga in simple words for my son?", at: Date.now() - 3600000 },
    m2: { uid: "u_acharya", name: "Acharya Srinivas", text: "Do your duty with full effort, and offer the result to the Divine. Join today's live class for examples. 🙏", at: Date.now() - 1800000 }
  },
  sanskrit: {
    m1: { uid: "u_ram", name: "Ramesh Sharma", text: "Hari Om! How do we distinguish between short and long vowels in recitation?", at: Date.now() - 7200000 },
    m2: { uid: "u_acharya", name: "Acharya Veda Prakash", text: "Hrasva takes one matra, Dirgha takes two matras. Listen to the audio lessons in course 2.", at: Date.now() - 3600000 }
  },
  yoga: {
    m1: { uid: "u_priya", name: "Priya Rao", text: "Namaste! What time does the morning Surya Namaskar session start?", at: Date.now() - 5000000 },
    m2: { uid: "u_anasuya", name: "Smt. Anasuya Devi", text: "Every morning at 6:30 AM IST. Link is in the Live tab!", at: Date.now() - 2000000 }
  },
  temple: {
    m1: { uid: "u_vijay", name: "Vijay Kumar", text: "Fascinating discussion on Dravidian vs Nagara temple architecture.", at: Date.now() - 10000000 }
  },
  parents: {
    m1: { uid: "u_sudha", name: "Sudha Rani", text: "My daughter loves the stories from Bala Gurukulam!", at: Date.now() - 8000000 }
  }
};

export const DEFAULT_NOTIFICATIONS = [
  {
    id: "n_welcome",
    title: "Welcome to Sanathana Gurukulam 🙏",
    message: "Begin your sacred journey with the Bhagavad Gita for Beginners course.",
    type: "announcement",
    icon: "🕉️",
    link: "course.html?id=bhagavad-gita",
    createdAt: Date.now() - 3600000 * 4
  },
  {
    id: "n_live_class",
    title: "Upcoming Live Sanskrit Session",
    message: "Acharya Veda Prakash is hosting a live chanting and pronunciation session. All sadhakas are welcome.",
    type: "live",
    icon: "🎥",
    link: "live.html",
    createdAt: Date.now() - 3600000
  }
];

// -------------------------------------------------------------
// LOCAL / MOCK ENGINE (used if Firebase not configured or offline)
// -------------------------------------------------------------
const LS_DB_KEY = "sg_gurukulam_db_v1";
const LS_USER_KEY = "sg_gurukulam_user_v1";

function initMockDB() {
  const existing = localStorage.getItem(LS_DB_KEY);
  if (existing) {
    try { return JSON.parse(existing); } catch (e) {}
  }
  const initial = {
    courses: {},
    liveClasses: {},
    notifications: {},
    community: DEFAULT_COMMUNITY,
    users: {
      "learner-1": { name: "Learner", email: "learner@gurukulam.org", role: "learner", createdAt: Date.now() },
      "admin-1": { name: "Acharya (Admin)", email: "admin@gurukulam.org", role: "admin", createdAt: Date.now() }
    },
    enrollments: {
      "learner-1": {
        "bhagavad-gita": { progress: 35, enrolledAt: Date.now() - 86400000 * 3, done: { L1: true, L2: true, L3: true, L4: true } }
      }
    }
  };
  DEFAULT_COURSES.forEach(c => { initial.courses[c.id] = c; });
  DEFAULT_LIVE.forEach(l => { initial.liveClasses[l.id] = l; });
  DEFAULT_NOTIFICATIONS.forEach(n => { initial.notifications[n.id] = n; });
  localStorage.setItem(LS_DB_KEY, JSON.stringify(initial));
  return initial;
}

let mockDB = initMockDB();

// Ensure mock notifications exist in existing localStorage
if (mockDB && (!mockDB.notifications || !Object.keys(mockDB.notifications).length)) {
  mockDB.notifications = {};
  DEFAULT_NOTIFICATIONS.forEach(n => { mockDB.notifications[n.id] = n; });
  localStorage.setItem(LS_DB_KEY, JSON.stringify(mockDB));
}

// Ensure mock live classes have upcoming dates for testing
if (mockDB && mockDB.liveClasses) {
  const now = Date.now();
  const allPast = Object.values(mockDB.liveClasses).every(l => (l.startsAt || 0) < now - 3600000);
  if (allPast) {
    let offsetHours = 2;
    Object.values(mockDB.liveClasses).forEach(l => {
      l.startsAt = now + offsetHours * 3600 * 1000;
      offsetHours += 3;
    });
    localStorage.setItem(LS_DB_KEY, JSON.stringify(mockDB));
  }
}

function saveMockDB() {
  localStorage.setItem(LS_DB_KEY, JSON.stringify(mockDB));
  notifyListeners();
}

function getMockValue(pathStr) {
  const parts = pathStr.split("/").filter(Boolean);
  let curr = mockDB;
  for (const p of parts) {
    if (curr == null || typeof curr !== "object") return null;
    curr = curr[p];
  }
  return curr !== undefined ? JSON.parse(JSON.stringify(curr)) : null;
}

function setMockValue(pathStr, val) {
  const parts = pathStr.split("/").filter(Boolean);
  if (!parts.length) { mockDB = val; saveMockDB(); return; }
  let curr = mockDB;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (!curr[p] || typeof curr[p] !== "object") curr[p] = {};
    curr = curr[p];
  }
  curr[parts[parts.length - 1]] = JSON.parse(JSON.stringify(val));
  saveMockDB();
}

function updateMockValue(pathStr, updates) {
  const parts = pathStr.split("/").filter(Boolean);
  let curr = mockDB;
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    if (!curr[p] || typeof curr[p] !== "object") curr[p] = {};
    curr = curr[p];
  }
  Object.assign(curr, JSON.parse(JSON.stringify(updates)));
  saveMockDB();
}

function removeMockValue(pathStr) {
  const parts = pathStr.split("/").filter(Boolean);
  if (!parts.length) { mockDB = {}; saveMockDB(); return; }
  let curr = mockDB;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (!curr[p] || typeof curr[p] !== "object") return;
    curr = curr[p];
  }
  delete curr[parts[parts.length - 1]];
  saveMockDB();
}

const listeners = [];
function notifyListeners() {
  listeners.forEach(fn => fn());
}

// Mock User Storage
export function getMockUser() {
  const s = localStorage.getItem(LS_USER_KEY);
  if (!s) return null;
  try { return JSON.parse(s); } catch (e) { return null; }
}

export function setMockUser(userObj) {
  if (userObj) {
    localStorage.setItem(LS_USER_KEY, JSON.stringify(userObj));
    // Ensure user in users table
    if (!mockDB.users[userObj.uid]) {
      mockDB.users[userObj.uid] = {
        name: userObj.displayName || "Learner",
        email: userObj.email || "",
        phone: userObj.phoneNumber || "",
        photo: userObj.photoURL || "",
        role: userObj.role || "learner",
        createdAt: Date.now()
      };
      saveMockDB();
    }
  } else {
    localStorage.removeItem(LS_USER_KEY);
  }
  triggerAuthListeners();
}

const authListeners = [];
function triggerAuthListeners() {
  const u = getMockUser();
  authListeners.forEach(cb => {
    try { cb(u); } catch (e) { console.error(e); }
  });
}

// -------------------------------------------------------------
// FIREBASE OR FALLBACK WRAPPERS
// -------------------------------------------------------------
let realApp = null;
let realAuth = null;
let realDb = null;

if (hasRealFirebase) {
  try {
    realApp = initializeApp(firebaseConfig);
    realAuth = getAuth(realApp);
    realDb = getDatabase(realApp);
  } catch (err) {
    console.warn("Could not initialize real Firebase, falling back to local mode:", err);
  }
}

export const app = realApp;
export const auth = realAuth || { currentUser: getMockUser() };
export const db = realDb;

export function onAuthStateChanged(authInstance, cb) {
  if (realAuth) {
    return fbOnAuthStateChanged(realAuth, async u => {
      if (u) cb(u);
      else {
        // If not in Firebase Auth, check if mock user is logged in
        const mu = getMockUser();
        cb(mu);
      }
    });
  }
  authListeners.push(cb);
  setTimeout(() => cb(getMockUser()), 0);
  return () => {
    const idx = authListeners.indexOf(cb);
    if (idx !== -1) authListeners.splice(idx, 1);
  };
}

export function ref(dbInstance, path = "") {
  if (realDb) {
    try { return fbRef(realDb, path); } catch (e) {}
  }
  return { _mockPath: path };
}

export async function get(refObj) {
  if (refObj && !refObj._mockPath && realDb) {
    try { return await fbGet(refObj); } catch (e) { console.warn("Firebase get error, falling back to local:", e); }
  }
  const path = refObj?._mockPath || "";
  const val = getMockValue(path);
  return {
    val: () => val,
    exists: () => val !== null && val !== undefined
  };
}

export async function set(refObj, value) {
  if (refObj && !refObj._mockPath && realDb) {
    try { return await fbSet(refObj, value); } catch (e) { console.warn("Firebase set error, falling back to local:", e); }
  }
  const path = refObj?._mockPath || "";
  setMockValue(path, value);
}

export async function push(refObj, value) {
  const newId = "id_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  if (refObj && !refObj._mockPath && realDb) {
    try { return await fbPush(refObj, value); } catch (e) { console.warn("Firebase push error, falling back to local:", e); }
  }
  const path = (refObj?._mockPath || "") + "/" + newId;
  setMockValue(path, value);
  return { key: newId };
}

export async function update(refObj, updates) {
  if (refObj && !refObj._mockPath && realDb) {
    try { return await fbUpdate(refObj, updates); } catch (e) { console.warn("Firebase update error, falling back to local:", e); }
  }
  const path = refObj?._mockPath || "";
  updateMockValue(path, updates);
}

export async function remove(refObj) {
  if (refObj && !refObj._mockPath && realDb) {
    try { return await fbRemove(refObj); } catch (e) { console.warn("Firebase remove error, falling back to local:", e); }
  }
  const path = refObj?._mockPath || "";
  removeMockValue(path);
}

export function onValue(queryOrRef, callback, errorCb) {
  if (queryOrRef && !queryOrRef._mockPath && realDb) {
    try { return fbOnValue(queryOrRef, callback, errorCb); } catch (e) { console.warn("Firebase onValue error, falling back to local:", e); }
  }
  const path = queryOrRef?._mockPath || "";
  const run = () => {
    const val = getMockValue(path);
    callback({ val: () => val, exists: () => val !== null && val !== undefined });
  };
  run();
  listeners.push(run);
  return () => {
    const idx = listeners.indexOf(run);
    if (idx !== -1) listeners.splice(idx, 1);
  };
}

export function query(refObj, ...args) {
  if (refObj && !refObj._mockPath && realDb) {
    try { return fbQuery(refObj, ...args); } catch (e) {}
  }
  return refObj;
}

export function limitToLast(n) {
  return n;
}

export { GoogleAuthProvider, RecaptchaVerifier, signInWithPhoneNumber };

export async function signInWithPopup(authInstance, provider) {
  if (realAuth) {
    return await fbSignInWithPopup(realAuth, provider);
  }
  throw new Error("Firebase Auth not configured. Use Quick Learner or Admin login.");
}

// Escape text before putting it into innerHTML
export const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

// Read a path and return its children as an array of { id, ...data }
export async function list(path) {
  try {
    const snap = await get(ref(db, path));
    const v = snap.val() || {};
    return Object.entries(v).map(([id, d]) => ({ id, ...d }));
  } catch (err) {
    console.warn(`list(${path}) error:`, err);
    if (path === "courses") return [...DEFAULT_COURSES];
    if (path === "liveClasses") return [...DEFAULT_LIVE];
    if (path === "notifications") return [...DEFAULT_NOTIFICATIONS];
    return [];
  }
}

// Create or get the user's profile
export async function ensureProfile(user) {
  if (!user) return { name: "Guest", role: "learner" };
  const r = ref(db, "users/" + user.uid);
  const snap = await get(r);
  if (snap.exists() && snap.val()) return snap.val();
  const p = {
    name: user.displayName || "Learner",
    email: user.email || "",
    phone: user.phoneNumber || "",
    photo: user.photoURL || "",
    role: user.role || "learner",
    createdAt: Date.now()
  };
  await set(r, p);
  return p;
}

// Run cb(user, profile) for a signed-in user, otherwise redirect to login.html
export function requireUser(cb) {
  onAuthStateChanged(auth, async u => {
    if (!u) {
      const redirectUrl = encodeURIComponent(location.pathname.split("/").pop() + location.search);
      location.href = "login.html?redirect=" + redirectUrl;
      return;
    }
    const prof = await ensureProfile(u);
    cb(u, prof);
  });
}

// Strictly guard Admin pages - redirects non-admins or unauthenticated visitors to admin-login.html
export function requireAdmin(cb) {
  onAuthStateChanged(auth, async u => {
    if (!u) {
      location.href = "admin-login.html";
      return;
    }
    const prof = await ensureProfile(u);
    if (prof.role !== "admin") {
      location.href = "admin-login.html?unauthorized=1";
      return;
    }
    cb(u, prof);
  });
}

export const logout = async () => {
  if (realAuth) {
    try { await fbSignOut(realAuth); } catch (e) {}
  }
  setMockUser(null);
  location.href = "login.html";
};

export const adminLogout = async () => {
  if (realAuth) {
    try { await fbSignOut(realAuth); } catch (e) {}
  }
  setMockUser(null);
  location.href = "admin-login.html";
};

// Admin authentication with Username/Email and Password
export async function signInAdminWithEmail(emailOrUser, password) {
  const cleanInput = String(emailOrUser || "").trim();
  const cleanPass = String(password || "").trim();
  if (!cleanInput || !cleanPass) {
    throw new Error("Please enter both username/email and password.");
  }

  // Normalize username or email
  const emailToTry = cleanInput.includes("@") ? cleanInput.toLowerCase() : (cleanInput.toLowerCase() + "@gurukulam.org");

  // 1. If real Firebase Auth is available, authenticate with Firebase Auth
  if (realAuth) {
    try {
      const cred = await fbSignInWithEmailAndPassword(realAuth, emailToTry, cleanPass);
      const user = cred.user;
      
      // Ensure user profile in database has role: "admin"
      const userRef = ref(db, "users/" + user.uid);
      let existingProf = {};
      try {
        const snap = await get(userRef);
        if (snap.exists()) existingProf = snap.val() || {};
      } catch(e) {}

      const adminProfile = {
        name: existingProf.name || user.displayName || "Acharya Administrator",
        email: user.email || emailToTry,
        role: "admin",
        lastLogin: Date.now()
      };

      try {
        await update(userRef, adminProfile);
      } catch(e) {
        console.warn("Could not update admin role in Realtime DB:", e);
      }

      setMockUser({
        uid: user.uid,
        email: user.email || emailToTry,
        displayName: adminProfile.name,
        role: "admin"
      });

      return { user, profile: adminProfile };
    } catch (fbErr) {
      console.warn("Firebase Auth error:", fbErr.code, fbErr.message);

      // Check if user entered master credentials as fallback even if Firebase Auth is active
      if (
        (cleanInput.toLowerCase() === "admin" || cleanInput.toLowerCase() === "admin@gurukulam.org") &&
        cleanPass === "gurukulam108"
      ) {
        const masterAdmin = {
          uid: "admin-master",
          email: "admin@gurukulam.org",
          displayName: "Acharya Peetham Administrator",
          role: "admin"
        };
        setMockUser(masterAdmin);
        return { user: masterAdmin, profile: masterAdmin };
      }

      // Provide clear friendly error messages
      if (fbErr.code === "auth/invalid-credential" || fbErr.code === "auth/wrong-password" || fbErr.code === "auth/user-not-found") {
        throw new Error("Invalid username/email or password. Please verify your Acharya credentials.");
      } else if (fbErr.code === "auth/too-many-requests") {
        throw new Error("Access temporarily blocked due to many failed attempts. Please try again later.");
      } else if (fbErr.code === "auth/user-disabled") {
        throw new Error("This administrator account has been disabled.");
      }
      throw new Error(fbErr.message || "Failed to authenticate administrator.");
    }
  }

  // 2. Offline / Demo Mode fallback
  if (
    (cleanInput.toLowerCase() === "admin" || cleanInput.toLowerCase() === "admin@gurukulam.org") &&
    cleanPass === "gurukulam108"
  ) {
    const adminUser = {
      uid: "admin-1",
      email: "admin@gurukulam.org",
      displayName: "Acharya Peetham Administrator",
      role: "admin"
    };
    setMockUser(adminUser);
    return { user: adminUser, profile: adminUser };
  }

  throw new Error("Invalid username/email or password. (Hint: Use credentials added in Firebase Console > Authentication > Users, or master admin / gurukulam108)");
}

// Turn a YouTube link into an embed URL ("" if it is not a YouTube link)
export const ytEmbed = u => {
  const m = String(u || "").match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/);
  return m ? "https://www.youtube.com/embed/" + m[1] : "";
};

export const getCourseIcon = id => {
  const s = String(id || "").toLowerCase();
  if (s.includes("gita")) return "📖";
  if (s.includes("sanskrit")) return "🪷";
  if (s.includes("history")) return "📜";
  if (s.includes("ramayan")) return "🏹";
  if (s.includes("yoga")) return "🧘";
  if (s.includes("vishnu")) return "🪔";
  if (s.includes("veda")) return "🕉️";
  if (s.includes("temple")) return "🛕";
  return "🕉️";
};

// Fill a container with published courses
export async function loadCourses(el, limit) {
  try {
    let cs = (await list("courses")).filter(c => c.published !== false).sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
    if (!cs.length) cs = [...DEFAULT_COURSES];
    if (limit) cs = cs.slice(0, limit);
    if (!cs.length || !el) return;
    el.innerHTML = cs.map(c => {
      const k = c.type === "free" ? "free" : "paid";
      const icon = getCourseIcon(c.id);
      return `<a class="course" data-t="${k}" href="course.html?id=${encodeURIComponent(c.id)}">
      ${c.imageUrl ? `<div class="pic"><img src="${esc(c.imageUrl)}" alt="${esc(c.title)}" loading="lazy" onerror="this.onerror=null;this.parentElement.className='pic ph';this.parentElement.innerHTML='${icon}';"></div>` : `<div class="pic ph" style="background:linear-gradient(135deg,#e7a15a,#9a4a1f)">${icon}</div>`}
      <div class="body"><h3>${esc(c.title)}</h3><div class="tags"><span class="tag ${k}">${k === "free" ? "Free" : "Paid"}</span><span class="lessons">${c.lessons || 0} Lessons</span></div><div class="rate"><b>★</b> ${c.rating || "4.8"}</div></div></a>`;
    }).join("");
  } catch (e) {
    console.warn("Using built-in course list:", e.code || e);
  }
}

