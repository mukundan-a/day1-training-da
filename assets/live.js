/* ============================================================================
   live.js — shared comments, backed by Firestore

   Anonymous sign-in happens silently: nobody logs in, but every browser gets a
   stable identity so the security rules can stop one reviewer editing or
   deleting another's comment. Reviewers still type their name each session.

   If Firebase cannot load — offline, opened from disk, blocked — this resolves
   to unavailable and comments.js falls back to this browser's local storage.
   ========================================================================= */

const CONFIG = {
  apiKey: "AIzaSyCA5lz0Yh8fBUmFbAC5JkxBHG8CrvUPTM4",
  authDomain: "day1-wireframe.firebaseapp.com",
  projectId: "day1-wireframe",
  storageBucket: "day1-wireframe.firebasestorage.app",
  messagingSenderId: "367069618921",
  appId: "1:367069618921:web:9b1b91920772a719dc4678"
};

const BOARD = 'main';
const SDK = 'https://www.gstatic.com/firebasejs/10.12.2/';

const Live = {
  ok: false,
  uid: null,
  error: null,
  _fns: null,
  _col: null,
  _onChange: null,

  async init() {
    try {
      const [{ initializeApp }, auth, store] = await Promise.all([
        import(SDK + 'firebase-app.js'),
        import(SDK + 'firebase-auth.js'),
        import(SDK + 'firebase-firestore.js')
      ]);

      const app = initializeApp(CONFIG);
      const a = auth.getAuth(app);
      const cred = await auth.signInAnonymously(a);
      this.uid = cred.user.uid;

      const db = store.getFirestore(app);
      this._col = store.collection(db, 'boards', BOARD, 'comments');
      this._fns = store;
      this.ok = true;
      return true;
    } catch (e) {
      this.error = (e && e.message) || String(e);
      this.ok = false;
      return false;
    }
  },

  /* live stream of every comment on the board */
  watch(cb) {
    if (!this.ok) return () => {};
    const s = this._fns;
    return s.onSnapshot(s.query(this._col, s.orderBy('at')), snap => {
      cb(snap.docs.map(d => Object.assign({ id: d.id }, d.data())));
    }, err => {
      this.error = err.message;
      cb(null, err);
    });
  },

  async add(note) {
    const s = this._fns;
    return s.addDoc(this._col, {
      screen: note.screen,
      x: note.x, y: note.y,
      type: note.type,
      text: note.text,
      who: note.who || 'anonymous',
      uid: this.uid,
      at: new Date().toISOString(),
      resolved: false,
      replies: []
    });
  },

  async reply(id, who, text) {
    const s = this._fns;
    return s.updateDoc(s.doc(this._col, id), {
      replies: s.arrayUnion({ who: who || 'anonymous', text, at: new Date().toISOString() })
    });
  },

  async setResolved(id, on, who) {
    const s = this._fns;
    return s.updateDoc(s.doc(this._col, id), {
      resolved: !!on,
      resolvedBy: on ? (who || 'anonymous') : '',
      resolvedAt: on ? new Date().toISOString() : ''
    });
  },

  async remove(id) {
    const s = this._fns;
    return s.deleteDoc(s.doc(this._col, id));
  },

  /* one-shot import: push a whole exported file onto the shared board */
  async addMany(notes) {
    let n = 0;
    for (const note of notes) { await this.add(note); n++; }
    return n;
  }
};

window.Live = Live;
Live.init().then(ok => {
  window.dispatchEvent(new CustomEvent('live-ready', { detail: { ok } }));
});
