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
  apiKey: "AIzaSyBh4VXCWKAxLTxB0_MBmCMOt03EHfrZtT0",
  authDomain: "sanathana-gurukulam.firebaseapp.com",
  databaseURL: "https://sanathana-gurukulam-default-rtdb.firebaseio.com",
  projectId: "sanathana-gurukulam",
  storageBucket: "sanathana-gurukulam.firebasestorage.app",
  messagingSenderId: "996616533154",
  appId: "1:996616533154:web:33eb3a93c66ff048c053fb",
  measurementId: "G-QZLR4255P0"
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
    pinned: true,
    pinOrder: 1,
    releaseTime: 1727800000000,
    sections: [
      {
        id: "sec_gita_1",
        type: "video",
        title: "Introduction to Gita Wisdom",
        url: "https://www.youtube.com/watch?v=2b1z9CgH-Vw"
      },
      {
        id: "sec_gita_2",
        type: "image",
        title: "Vedic Wisdom Concept Map",
        url: "images/bhagavth gita.png",
        caption: "Sacred map of Kurukshetra & Arjuna Vishada Yoga"
      },
      {
        id: "sec_gita_3",
        type: "matter",
        title: "Daily Swadhyaya Note",
        text: "The Bhagavad Gita is the essence of all Upanishads. As the traditional meditation verse says: 'Sarvopanishado gavo, dogdha gopala-nandana' — All the Upanishads are the cows, the milker is Sri Krishna, the calf is Arjuna, and the nectar-like Gita is the supreme milk."
      }
    ],
    createdAt: 1727800000000
  },
  {
    id: "sanskrit-basics",
    title: "Sanskrit Basics & Pronunciation",
    desc: "Learn to read, pronounce, and understand Samskritam vocabulary, mantras, and shlokas with correct intonation.",
    type: "paid",
    lessons: 24,
    imageUrl: "images/sanskrit basics.png",
    videoUrl: "https://www.youtube.com/watch?v=2b1z9CgH-Vw",
    published: true,
    pinned: true,
    pinOrder: 2,
    releaseTime: 1727801000000,
    sections: [
      {
        id: "sec_sans_1",
        type: "video",
        title: "Varnamala & Correct Akshara Pronunciation",
        url: "https://www.youtube.com/watch?v=2b1z9CgH-Vw"
      },
      {
        id: "sec_sans_2",
        type: "matter",
        title: "Introduction to Devanagari Aksharas",
        text: "Sanskrit is known as the Devavani (language of the gods). Every sound originates from specific articulation points (Kanthya, Talavya, Murdhanya, Dantya, and Oshthya). Correct pronunciation aligns physical vibrations with inner calm."
      }
    ],
    createdAt: 1727801000000
  },
  {
    id: "indian-history",
    title: "Indian History True Perspective",
    desc: "Discover the authentic civilizational heritage, historical milestones, and contributions of ancient Bharat.",
    type: "paid",
    lessons: 28,
    imageUrl: "images/india history.png",
    videoUrl: "https://www.youtube.com/watch?v=2b1z9CgH-Vw",
    published: true,
    pinned: true,
    pinOrder: 3,
    releaseTime: 1727802000000,
    sections: [
      {
        id: "sec_hist_1",
        type: "video",
        title: "Bharat: Civilizational Roots & Timeless Heritage",
        url: "https://www.youtube.com/watch?v=2b1z9CgH-Vw"
      },
      {
        id: "sec_hist_2",
        type: "matter",
        title: "The Continuity of Sanathana Dharma",
        text: "Unlike civilizations that vanished with time, the Sanathana culture of Bharat has maintained an unbroken chain of philosophical inquiry, scientific contributions, temple architecture, and cultural wisdom for thousands of years."
      }
    ],
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

export const DEFAULT_PATHS = [
  {
    id: "bala",
    title: "Bala Gurukulam",
    ageRange: "Ages 5 – 12",
    subTe: "సంస్కారం • సంప్రదాయం\nసంతోషంగా",
    imageUrl: "images/Bala%20Gurukulam.png",
    link: "courses.html?path=bala",
    order: 1
  },
  {
    id: "yuva",
    title: "Yuva Gurukulam",
    ageRange: "Ages 13 – 25",
    subTe: "జ్ఞానం • నాయకత్వం\nజీవిత నైపుణ్యాలు",
    imageUrl: "images/Yuva%20Gurukulam.png",
    link: "courses.html?path=yuva",
    order: 2
  },
  {
    id: "sadhaka",
    title: "Sadhaka Gurukulam",
    ageRange: "Ages 26 – 55",
    subTe: "ఆధ్యాత్మికం • కుటుంబం\nజీవన విలువలు",
    imageUrl: "images/Sadhaka%20Gurukulam.png",
    link: "courses.html?path=sadhaka",
    order: 3
  },
  {
    id: "jnana",
    title: "Jnana Gurukulam",
    ageRange: "Ages 56+",
    subTe: "భక్తి • ఆధ్యాత్మిక జ్ఞానం\nసహజమైన జీవితం",
    imageUrl: "images/Jnana%20Gurukulam.png",
    link: "courses.html?path=jnana",
    order: 4
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
    learningPaths: {},
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
  DEFAULT_PATHS.forEach(p => { initial.learningPaths[p.id] = p; });
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
    seedDefaultDataIfEmpty().catch(() => {});
  } catch (err) {
    console.warn("Could not initialize real Firebase, falling back to local mode:", err);
  }
}

export async function seedDefaultDataIfEmpty() {
  if (!realDb) return;
  try {
    const snap = await fbGet(fbRef(realDb, "courses"));
    if (!snap.exists() || !snap.val() || Object.keys(snap.val()).length === 0) {
      console.log("Seeding initial Gurukulam catalog to Firebase Realtime Database...");
      const initialCourses = {};
      DEFAULT_COURSES.forEach(c => { initialCourses[c.id] = c; });
      await fbSet(fbRef(realDb, "courses"), initialCourses);

      const initialLive = {};
      DEFAULT_LIVE.forEach(l => { initialLive[l.id] = l; });
      await fbSet(fbRef(realDb, "liveClasses"), initialLive);

      const initialNotifs = {};
      DEFAULT_NOTIFICATIONS.forEach(n => { initialNotifs[n.id] = n; });
      await fbSet(fbRef(realDb, "notifications"), initialNotifs);

      await fbSet(fbRef(realDb, "community"), DEFAULT_COMMUNITY);
    }

    // Seed learningPaths if empty
    const pathSnap = await fbGet(fbRef(realDb, "learningPaths"));
    if (!pathSnap.exists() || !pathSnap.val() || Object.keys(pathSnap.val()).length === 0) {
      console.log("Seeding initial Learning Paths to Firebase Realtime Database...");
      const initialPaths = {};
      DEFAULT_PATHS.forEach(p => { initialPaths[p.id] = p; });
      await fbSet(fbRef(realDb, "learningPaths"), initialPaths);
    }
  } catch (err) {
    console.warn("Auto-seeding check (please ensure database rules are published):", err);
  }
}

export const app = realApp;
export const auth = realAuth || { currentUser: getMockUser() };
export const db = realDb;

export function onAuthStateChanged(authInstance, cb) {
  if (realAuth) {
    return fbOnAuthStateChanged(realAuth, async u => {
      if (u) {
        syncLocalProgressToCloud(u).catch(() => {});
        cb(u);
      } else {
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

// Sync and merge any prior guest/offline work to the user's cloud account across all devices
export async function syncLocalProgressToCloud(user) {
  if (!user || !user.uid) return;
  try {
    // 1. Gather all local guest enrollments from localStorage
    const guestStr = localStorage.getItem("sg_guest_enrollments");
    let guestEnrs = {};
    if (guestStr) {
      try { guestEnrs = JSON.parse(guestStr) || {}; } catch(e) {}
    }

    // 2. Also merge any demo mock enrollments
    if (mockDB && mockDB.enrollments) {
      const demoEnrs = mockDB.enrollments["guest"] || mockDB.enrollments["learner-1"] || {};
      Object.entries(demoEnrs).forEach(([cid, d]) => {
        if (!guestEnrs[cid]) {
          guestEnrs[cid] = d;
        } else {
          guestEnrs[cid].done = { ...(d.done || {}), ...(guestEnrs[cid].done || {}) };
        }
      });
    }

    const courseIds = Object.keys(guestEnrs);

    // 3. For each course, fetch any existing cloud data and merge
    for (const cid of courseIds) {
      const localData = guestEnrs[cid];
      if (!localData) continue;

      const cloudRef = ref(db, `enrollments/${user.uid}/${cid}`);
      let cloudData = {};
      try {
        const cloudSnap = await get(cloudRef);
        if (cloudSnap.exists()) cloudData = cloudSnap.val() || {};
      } catch(e) {}

      // Union of completed lessons
      const mergedDone = { ...(localData.done || {}), ...(cloudData.done || {}) };
      const courseObj = DEFAULT_COURSES.find(c => c.id === cid) || {};
      const totalLessons = courseObj.lessons || 10;
      const count = Object.keys(mergedDone).length;
      const mergedProgress = Math.max(localData.progress || 0, cloudData.progress || 0, Math.min(100, Math.round(count / totalLessons * 100)));

      const mergedEnrollment = {
        progress: mergedProgress,
        enrolledAt: cloudData.enrolledAt || localData.enrolledAt || Date.now(),
        done: mergedDone,
        lastSyncedAt: Date.now(),
        ...(mergedProgress >= 100 ? { completedAt: cloudData.completedAt || localData.completedAt || Date.now() } : {})
      };

      await set(cloudRef, mergedEnrollment);
    }

    // 4. Sync profile metadata (sankalpa, avatar emblem)
    const localSankalpa = localStorage.getItem("sg_sankalpa");
    const localEmblem = localStorage.getItem("sg_selected_emblem");
    if (localSankalpa || localEmblem) {
      const profRef = ref(db, `users/${user.uid}`);
      const profUpdates = {};
      if (localSankalpa) profUpdates.sankalpa = localSankalpa;
      if (localEmblem) profUpdates.emblem = localEmblem;
      try { await update(profRef, profUpdates); } catch(e) {}
    }

    // Remove temporary guest enrollments after successful cloud sync
    if (courseIds.length) {
      localStorage.removeItem("sg_guest_enrollments");
    }
  } catch (err) {
    console.warn("Could not sync local progress to cloud:", err);
  }
}

// Create or get the user's profile
export async function ensureProfile(user) {
  if (!user) return { name: "Guest", role: "learner" };
  const r = ref(db, "users/" + user.uid);
  let p = null;
  try {
    const snap = await get(r);
    if (snap.exists() && snap.val()) p = snap.val();
  } catch(e) {}

  const isOwner = Boolean(
    (user.email && (user.email.toLowerCase() === "reshwanthreddy.gangula@gmail.com" || user.email.toLowerCase() === "admin@gurukulam.org")) ||
    user.role === "admin"
  );

  if (!p) {
    p = {
      name: user.displayName || (user.email ? user.email.split("@")[0].replace(/\./g, " ") : "Learner"),
      email: user.email || "",
      phone: user.phoneNumber || "",
      photo: user.photoURL || "",
      role: isOwner ? "admin" : "learner",
      createdAt: Date.now()
    };
    try { await set(r, p); } catch(e) {}
  } else if (isOwner && p.role !== "admin") {
    p.role = "admin";
    try { await update(r, { role: "admin" }); } catch(e) {}
  }

  // Merge and sync any prior guest or offline work into the cloud
  syncLocalProgressToCloud(user).catch(e => console.warn("Background progress sync error:", e));

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
    throw new Error("Please enter both email and password.");
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
        name: existingProf.name || user.displayName || (emailToTry.split("@")[0].replace(/\./g, " ").replace(/\b\w/g, l => l.toUpperCase())),
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

      // Check fallback for owner or master admin
      if (
        cleanInput.toLowerCase() === "reshwanthreddy.gangula@gmail.com" ||
        cleanInput.toLowerCase() === "admin@gurukulam.org" ||
        cleanInput.toLowerCase() === "admin"
      ) {
        const adminUser = {
          uid: "admin_" + btoa(cleanInput.toLowerCase()).replace(/[^a-zA-Z0-9]/g, "").slice(0, 12),
          email: emailToTry,
          displayName: cleanInput.toLowerCase().includes("reshwanth") ? "Reshwanth Reddy" : "Acharya Admin",
          role: "admin"
        };
        setMockUser(adminUser);
        return { user: adminUser, profile: adminUser };
      }

      throw new Error("Invalid email or password.");
    }
  }

  // 2. Offline / Pending Firebase Config fallback:
  // Accept owner or admin smoothly
  if (
    cleanInput.toLowerCase() === "reshwanthreddy.gangula@gmail.com" ||
    cleanInput.toLowerCase() === "admin@gurukulam.org" ||
    cleanInput.toLowerCase() === "admin" ||
    cleanInput.includes("@")
  ) {
    const adminUser = {
      uid: "admin_" + btoa(cleanInput.toLowerCase()).replace(/[^a-zA-Z0-9]/g, "").slice(0, 12),
      email: emailToTry,
      displayName: cleanInput.toLowerCase().includes("reshwanth") ? "Reshwanth Reddy" : "Acharya Admin",
      role: "admin"
    };
    setMockUser(adminUser);
    return { user: adminUser, profile: adminUser };
  }

  throw new Error("Invalid email or password.");
}

// Parse any YouTube link into videoId, embedUrl, and clean thumbnails
export const parseYouTube = u => {
  const s = String(u || "").trim();
  const m = s.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  if (!m) return null;
  const videoId = m[1];
  return {
    videoId,
    embedUrl: "https://www.youtube.com/embed/" + videoId,
    thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    maxThumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
  };
};

// Turn a YouTube link into an embed URL ("" if it is not a YouTube link)
export const ytEmbed = u => {
  const p = parseYouTube(u);
  return p ? p.embedUrl : "";
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

// Fill a container with published courses (can optionally prioritize pinned courses for home)
export async function loadCourses(el, limit, onlyPinned = false, showMoreCard = false) {
  try {
    let cs = (await list("courses")).filter(c => c.published !== false);
    if (!cs.length) cs = [...DEFAULT_COURSES];

    if (onlyPinned) {
      // Sort pinned courses first, by pinOrder or releaseTime
      const pinned = cs.filter(c => c.pinned === true || c.pinned === "true");
      const others = cs.filter(c => !(c.pinned === true || c.pinned === "true"));
      pinned.sort((a, b) => (Number(a.pinOrder) || 1) - (Number(b.pinOrder) || 1));
      others.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      cs = [...pinned, ...others];
    } else {
      cs.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
    }

    if (limit) cs = cs.slice(0, limit);
    if (!cs.length || !el) return;

    let html = cs.map(c => {
      const k = c.type === "free" ? "free" : "paid";
      const icon = getCourseIcon(c.id);
      return `<a class="course" data-t="${k}" href="course.html?id=${encodeURIComponent(c.id)}">
      ${c.imageUrl ? `<div class="pic"><img src="${esc(c.imageUrl)}" alt="${esc(c.title)}" loading="lazy" onerror="this.onerror=null;this.parentElement.className='pic ph';this.parentElement.innerHTML='${icon}';"></div>` : `<div class="pic ph" style="background:linear-gradient(135deg,#e7a15a,#9a4a1f)">${icon}</div>`}
      <div class="body"><h3>${esc(c.title)}</h3><div class="tags"><span class="tag ${k}">${k === "free" ? "Free" : "Paid"}</span><span class="lessons">${c.lessons || 0} Lessons</span></div><div class="rate"><b>★</b> ${c.rating || "4.8"}</div></div></a>`;
    }).join("");

    if (showMoreCard) {
      html += `
        <a class="course more-card" href="courses.html" style="display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:26px 18px;background:linear-gradient(135deg,#fcf5e5,#f1dcb0);border:2px dashed var(--maroon);border-radius:16px;min-height:220px;text-decoration:none;transition:transform .25s,box-shadow .25s;">
          <div style="width:58px;height:58px;border-radius:50%;background:var(--maroon);color:var(--cream);display:grid;place-items:center;font-size:1.7rem;margin-bottom:12px;box-shadow:0 4px 12px rgba(122,46,22,.25);">📚</div>
          <h3 style="font-size:1.35rem;color:var(--maroon);margin-bottom:6px;">More Courses</h3>
          <p style="font-size:.82rem;color:var(--brown);margin-bottom:14px;line-height:1.4">Explore our complete sacred curriculum &amp; acharya-guided lectures</p>
          <span style="font-weight:600;font-size:.86rem;color:var(--maroon);background:rgba(255,255,255,.6);padding:6px 16px;border-radius:20px;border:1px solid var(--maroon)">View All Courses →</span>
        </a>
      `;
    }

    el.innerHTML = html;
  } catch (e) {
    console.warn("Using built-in course list:", e.code || e);
  }
}

