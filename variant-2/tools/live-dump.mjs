// Dump the shared reviewer board (comments + text edits) from Firestore, so the
// current state is visible outside the app. Anonymous sign-in, then a REST read
// of boards/variant2/{comments,edits}. Usage:  node variant-2/tools/live-dump.mjs
//
// In a sandbox that routes egress through a proxy, it honours HTTPS_PROXY and the
// CA bundle automatically; on a normal machine it just works.
import fs from 'node:fs';

const KEY = 'AIzaSyCA5lz0Yh8fBUmFbAC5JkxBHG8CrvUPTM4';
const PROJECT = 'day1-wireframe';
const BOARD = 'variant2';

// route through the proxy when present (sandbox), else direct
if (process.env.HTTPS_PROXY) {
  try {
    const { ProxyAgent, setGlobalDispatcher } = await import('undici');
    const ca = process.env.NODE_EXTRA_CA_CERTS && fs.existsSync(process.env.NODE_EXTRA_CA_CERTS)
      ? fs.readFileSync(process.env.NODE_EXTRA_CA_CERTS) : undefined;
    setGlobalDispatcher(new ProxyAgent({ uri: process.env.HTTPS_PROXY, requestTls: ca ? { ca } : undefined }));
  } catch {}
}

const val = (v) => v == null ? '' : (v.stringValue ?? v.integerValue ?? v.doubleValue ?? v.booleanValue ??
  (v.arrayValue ? (v.arrayValue.values || []).map(val) : (v.mapValue ? Object.fromEntries(Object.entries(v.mapValue.fields || {}).map(([k, x]) => [k, val(x)])) : '')));
const fields = (doc) => Object.fromEntries(Object.entries(doc.fields || {}).map(([k, v]) => [k, val(v)]));

async function main() {
  const auth = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${KEY}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ returnSecureToken: true }),
  }).then(r => r.json());
  if (!auth.idToken) throw new Error('anon sign-in failed: ' + JSON.stringify(auth));

  for (const col of ['comments', 'edits']) {
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents/boards/${BOARD}/${col}?pageSize=300`;
    const data = await fetch(url, { headers: { Authorization: 'Bearer ' + auth.idToken } }).then(r => r.json());
    const docs = (data.documents || []).map(fields);
    console.log(`\n=== ${col} (${docs.length}) ===`);
    for (const d of docs) {
      if (col === 'comments') console.log(`• [${d.screen}] ${d.category || d.type} — ${d.text}${d.who && d.who !== 'anonymous' ? '  (' + d.who + ')' : ''}${d.resolved ? '  [resolved]' : ''}`);
      else console.log(`• ${d.path}\n    → ${d.text}${d.who && d.who !== 'anonymous' ? '   (' + d.who + ')' : ''}`);
    }
  }
}
main().catch(e => { console.error(e); process.exit(1); });
