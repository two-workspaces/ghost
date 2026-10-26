// wait:  block until MySQL accepts connections (up to 5 minutes).
// setup: once Ghost is up, create the owner account from GHOST_ADMIN_* so the
//        /ghost setup page is never left open on a public URL.
const net = require('net');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (m) => console.log(`[railway-setup] ${m}`);
const env = process.env;

async function wait() {
  const host = env.database__connection__host, port = +(env.database__connection__port || 3306);
  if (!host) return;
  for (let i = 0; i < 150; i++) {
    const ok = await new Promise((res) => {
      const s = net.connect({ host, port }, () => { s.destroy(); res(true); });
      s.on('error', () => res(false));
      s.setTimeout(2000, () => { s.destroy(); res(false); });
    });
    if (ok) return;
    if (i % 10 === 0) log(`waiting for MySQL at ${host}:${port}`);
    await sleep(2000);
  }
  log('MySQL did not come up in 5 minutes, starting Ghost anyway');
}

async function setup() {
  if (!env.GHOST_ADMIN_EMAIL) return log('GHOST_ADMIN_EMAIL is empty: open /ghost to create the owner account');
  const site = new URL(env.url);
  // Talk to Ghost directly, presenting the request as the public https site.
  const api = `http://127.0.0.1:2368${site.pathname.replace(/\/$/, '')}/ghost/api/admin/authentication/setup/`;
  const headers = { 'Content-Type': 'application/json', 'X-Forwarded-Proto': site.protocol.slice(0, -1), Host: site.host, Origin: site.origin };
  for (let i = 0; i < 300; i++) {
    try {
      const r = await fetch(api, { headers, redirect: 'manual' });
      if (r.status === 200) {
        if ((await r.json()).setup[0].status) return log('owner account already exists');
        const body = { setup: [{ name: env.GHOST_ADMIN_NAME || 'Site Owner', email: env.GHOST_ADMIN_EMAIL,
          password: env.GHOST_ADMIN_PASSWORD, blogTitle: env.GHOST_SITE_TITLE || 'My Ghost Site' }] };
        const p = await fetch(api, { method: 'POST', headers, body: JSON.stringify(body), redirect: 'manual' });
        return log(p.ok ? `owner account created for ${env.GHOST_ADMIN_EMAIL}` : `setup failed: ${p.status} ${await p.text()}`);
      }
    } catch {}
    await sleep(3000);
  }
  log('Ghost did not answer in 15 minutes, owner account not created');
}

(process.argv[2] === 'wait' ? wait : setup)();
