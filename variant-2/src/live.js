// Shared reviewer comments, backed by the same Firestore project variant 1 uses.
// Anonymous sign-in gives every browser a stable identity so the security rules
// can stop one reviewer editing another's note. Reviewers type their name once a
// session. If Firebase cannot load (offline, from disk, blocked), init resolves
// to unavailable and the comment store falls back to this browser's localStorage.
//
// Board is 'variant2', a separate board from variant 1's 'main', so the two
// storylines' comments never mix. The Firestore rules (boards/{board}/comments)
// accept any board id, require `type` in [concept|flow|screen|copy], and only
// let updates touch resolved/replies — so moving a pin is delete+recreate.

const CONFIG = {
  apiKey: 'AIzaSyCA5lz0Yh8fBUmFbAC5JkxBHG8CrvUPTM4',
  authDomain: 'day1-wireframe.firebaseapp.com',
  projectId: 'day1-wireframe',
  storageBucket: 'day1-wireframe.firebasestorage.app',
  messagingSenderId: '367069618921',
  appId: '1:367069618921:web:9b1b91920772a719dc4678',
};
const BOARD = 'variant2';
const SDK = 'https://www.gstatic.com/firebasejs/10.12.2/';

export const Live = {
  ok: false,
  uid: null,
  error: null,
  _fns: null,
  _col: null,
  _initPromise: null,

  init() {
    if (this._initPromise) return this._initPromise;
    this._initPromise = (async () => {
      try {
        const [{ initializeApp }, auth, store] = await Promise.all([
          import(SDK + 'firebase-app.js'),
          import(SDK + 'firebase-auth.js'),
          import(SDK + 'firebase-firestore.js'),
        ]);
        const app = initializeApp(CONFIG);
        const a = auth.getAuth(app);
        const cred = await auth.signInAnonymously(a);
        this.uid = cred.user.uid;
        const db = store.getFirestore(app);
        this._col = store.collection(db, 'boards', BOARD, 'comments');
        this._edits = store.collection(db, 'boards', BOARD, 'edits');
        this._fns = store;
        this.ok = true;
        return true;
      } catch (e) {
        this.error = (e && e.message) || String(e);
        this.ok = false;
        return false;
      }
    })();
    return this._initPromise;
  },

  // live stream of every comment on the board, oldest first
  watch(cb) {
    if (!this.ok) return () => {};
    const s = this._fns;
    return s.onSnapshot(s.query(this._col, s.orderBy('at')),
      snap => cb(snap.docs.map(d => Object.assign({ id: d.id }, d.data()))),
      err => { this.error = err.message; cb(null, err); });
  },

  async add(c) {
    const s = this._fns;
    const ref = await s.addDoc(this._col, {
      // rule-required fields
      screen: c.sceneId, x: c.x, y: c.y, type: c.type, text: c.text,
      who: c.who || 'anonymous', uid: this.uid, resolved: !!c.resolved,
      // variant-2 metadata (extra fields are allowed by the create rule)
      sceneTitle: c.sceneTitle || c.sceneId, stageKey: c.stageKey || '',
      category: c.category || '', anchor: c.anchor || '',
      replies: c.replies || [], at: new Date().toISOString(),
    });
    return ref.id;
  },

  async reply(id, who, text) {
    const s = this._fns;
    return s.updateDoc(s.doc(this._col, id), {
      replies: s.arrayUnion({ who: who || 'anonymous', text, at: new Date().toISOString() }),
    });
  },

  async setResolved(id, on, who) {
    const s = this._fns;
    return s.updateDoc(s.doc(this._col, id), {
      resolved: !!on, resolvedBy: on ? (who || 'anonymous') : '', resolvedAt: on ? new Date().toISOString() : '',
    });
  },

  async remove(id) {
    const s = this._fns;
    return s.deleteDoc(s.doc(this._col, id));
  },

  /* --- direct edits to the wording (shared) --- */
  watchEdits(cb) {
    if (!this.ok) return () => {};
    const s = this._fns;
    return s.onSnapshot(this._edits,
      snap => cb(snap.docs.map(d => d.data())),
      err => cb(null, err));
  },

  async setEdit(path, text, who, history) {
    const s = this._fns;
    return s.setDoc(s.doc(this._edits, editKey(path)), {
      path, text, who: who || 'anonymous', at: new Date().toISOString(), history: (history || []).slice(-12),
    });
  },

  async clearEdit(path) {
    const s = this._fns;
    return s.deleteDoc(s.doc(this._edits, editKey(path)));
  },
};

// a Firestore document id cannot contain a slash or these other characters
function editKey(path) { return String(path).replace(/[\/\.#\[\]]/g, '~'); }
