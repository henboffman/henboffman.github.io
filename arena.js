// ── Element Classification ──
const ELEMENT_ROLES = {
  h1:{role:'boss',hp:120,atk:30,def:22},
  h2:{role:'commander',hp:95,atk:26,def:18},
  h3:{role:'officer',hp:75,atk:22,def:15},
  h4:{role:'officer',hp:65,atk:20,def:14},
  h5:{role:'officer',hp:55,atk:18,def:12},
  h6:{role:'officer',hp:48,atk:16,def:11},
  nav:{role:'shield',hp:80,atk:12,def:32},
  button:{role:'striker',hp:55,atk:36,def:10},
  a:{role:'scout',hp:35,atk:22,def:6},
  img:{role:'ranger',hp:60,atk:32,def:8},
  svg:{role:'ranger',hp:55,atk:28,def:8},
  video:{role:'artillery',hp:90,atk:42,def:6},
  audio:{role:'artillery',hp:75,atk:38,def:5},
  canvas:{role:'artillery',hp:85,atk:40,def:7},
  form:{role:'engineer',hp:75,atk:16,def:28},
  input:{role:'engineer',hp:42,atk:20,def:16},
  select:{role:'engineer',hp:40,atk:18,def:15},
  textarea:{role:'engineer',hp:50,atk:18,def:18},
  table:{role:'fortress',hp:100,atk:12,def:38},
  thead:{role:'fortress',hp:60,atk:8,def:25},
  tbody:{role:'fortress',hp:70,atk:10,def:28},
  tr:{role:'fortress',hp:30,atk:6,def:15},
  td:{role:'infantry',hp:22,atk:8,def:8},
  th:{role:'officer',hp:35,atk:12,def:12},
  ul:{role:'squad',hp:55,atk:22,def:18},
  ol:{role:'squad',hp:55,atk:22,def:18},
  li:{role:'squad',hp:28,atk:14,def:10},
  dl:{role:'squad',hp:50,atk:20,def:16},
  div:{role:'infantry',hp:40,atk:14,def:12},
  p:{role:'civilian',hp:30,atk:10,def:8},
  span:{role:'messenger',hp:18,atk:7,def:4},
  em:{role:'messenger',hp:16,atk:8,def:3},
  strong:{role:'striker',hp:25,atk:15,def:5},
  b:{role:'striker',hp:22,atk:14,def:5},
  i:{role:'messenger',hp:16,atk:7,def:3},
  section:{role:'barracks',hp:70,atk:18,def:22},
  article:{role:'barracks',hp:68,atk:18,def:20},
  aside:{role:'barracks',hp:55,atk:14,def:18},
  main:{role:'vanguard',hp:80,atk:20,def:24},
  header:{role:'vanguard',hp:65,atk:22,def:20},
  footer:{role:'rearguard',hp:55,atk:12,def:24},
  figure:{role:'ranger',hp:50,atk:24,def:10},
  figcaption:{role:'civilian',hp:22,atk:8,def:6},
  blockquote:{role:'civilian',hp:35,atk:12,def:12},
  pre:{role:'engineer',hp:45,atk:16,def:14},
  code:{role:'engineer',hp:35,atk:18,def:10},
  label:{role:'messenger',hp:20,atk:8,def:5},
  details:{role:'engineer',hp:40,atk:14,def:16},
  summary:{role:'scout',hp:30,atk:16,def:8},
  iframe:{role:'artillery',hp:95,atk:44,def:4},
  hr:{role:'infantry',hp:15,atk:5,def:10},
  br:{role:'messenger',hp:5,atk:1,def:1},
};
const DEFAULT_STATS = {role:'infantry',hp:25,atk:10,def:8};

// ── CSS injected into preview iframes ──
const ARENA_IFRAME_CSS = `
  [data-arena-id] {
    transition: filter 0.5s ease, opacity 0.5s ease, transform 0.5s ease, box-shadow 0.5s ease !important;
    position: relative;
  }
  /* Hit flash */
  @keyframes arenaHit {
    0%   { filter: brightness(1) !important; }
    25%  { filter: brightness(0.2) saturate(3) hue-rotate(-20deg) !important;
           box-shadow: inset 0 0 30px rgba(255,0,0,0.6), 0 0 15px rgba(255,0,0,0.3) !important; }
    100% { filter: brightness(1) !important; }
  }
  [data-arena-id].arena-hit {
    animation: arenaHit 0.2s ease !important;
  }
  /* Damage tiers */
  [data-arena-id].arena-dmg-1 {
    box-shadow: inset 0 0 5px rgba(255,60,0,0.15) !important;
  }
  [data-arena-id].arena-dmg-2 {
    box-shadow: inset 0 0 12px rgba(255,60,0,0.25) !important;
    filter: brightness(0.9) sepia(0.1) !important;
  }
  [data-arena-id].arena-dmg-3 {
    box-shadow: inset 0 0 20px rgba(255,60,0,0.35) !important;
    filter: brightness(0.75) sepia(0.2) !important;
  }
  [data-arena-id].arena-dmg-4 {
    box-shadow: inset 0 0 30px rgba(255,30,0,0.4) !important;
    filter: brightness(0.6) sepia(0.35) saturate(1.3) !important;
    opacity: 0.8 !important;
  }
  /* Defeat (legacy fallback) */
  @keyframes arenaDefeat {
    0%   { opacity: 1; transform: scale(1); filter: brightness(1); }
    15%  { filter: brightness(3) saturate(0) !important; }
    30%  { filter: brightness(0.2) sepia(1) saturate(3) !important; opacity: 0.8; }
    50%  { transform: scale(0.97) rotate(0.8deg); opacity: 0.5;
           filter: grayscale(0.8) brightness(0.4) !important; }
    75%  { transform: scale(0.94) rotate(-0.4deg) translateY(2px); opacity: 0.15;
           filter: grayscale(1) brightness(0.2) !important; }
    100% { transform: scale(0.9) translateY(4px); opacity: 0;
           filter: grayscale(1) brightness(0) !important; }
  }
  [data-arena-id].arena-defeated {
    animation: arenaDefeat 0.5s ease forwards !important;
    pointer-events: none !important;
  }
  /* Scar: ghost of a defeated element */
  [data-arena-id].arena-scar {
    opacity: 0.06 !important;
    filter: grayscale(1) brightness(0.3) !important;
    animation: none !important;
    pointer-events: none !important;
    outline: 1px dashed rgba(255,60,0,0.08) !important;
    outline-offset: -1px;
  }
  /* Survivor flicker */
  @keyframes arenaSurvivorFlicker {
    0%,100% { opacity: var(--arena-opacity, 0.85); }
    8%  { opacity: 0.5;  }  22% { opacity: var(--arena-opacity, 0.85); }
    35% { opacity: 0.4;  }  48% { opacity: var(--arena-opacity, 0.85); }
    60% { opacity: 0.55; }  75% { opacity: var(--arena-opacity, 0.85); }
    88% { opacity: 0.45; }
  }
  @keyframes arenaSmolder {
    0%,100% { box-shadow: inset 0 0 8px rgba(255,60,0,0.1); }
    50%     { box-shadow: inset 0 0 25px rgba(255,60,0,0.3), 0 0 12px rgba(255,60,0,0.1); }
  }
  @keyframes arenaDangle {
    0%,100% { transform: rotate(var(--arena-rot, 0.5deg)) translateY(0); }
    50%     { transform: rotate(var(--arena-rot, 0.5deg)) translateY(2px); }
  }
  [data-arena-id].arena-survivor {
    animation: arenaSmolder 4s ease-in-out infinite !important;
    outline: 1px solid rgba(255,60,0,0.12) !important;
    outline-offset: -1px;
  }
  [data-arena-id].arena-survivor.arena-barely-alive {
    animation: arenaSurvivorFlicker 2.5s ease-in-out infinite,
               arenaSmolder 2s ease-in-out infinite,
               arenaDangle 3s ease-in-out infinite !important;
  }
  [data-arena-id].arena-survivor.arena-wounded {
    animation: arenaSmolder 3s ease-in-out infinite !important;
    filter: brightness(0.85) sepia(0.1) !important;
  }
  /* Level-up scaling in preview */
  @keyframes arenaLevelUp {
    0%   { filter: brightness(1); }
    40%  { filter: brightness(2.5) saturate(0) !important; }
    100% { filter: brightness(1); }
  }
  [data-arena-id].arena-lv2 { transform: scale(1.06) !important; box-shadow: 0 0 8px rgba(255,170,0,0.2) !important; z-index:2; }
  [data-arena-id].arena-lv3 { transform: scale(1.12) !important; box-shadow: 0 0 14px rgba(255,170,0,0.3) !important; z-index:3; }
  [data-arena-id].arena-lv4 { transform: scale(1.18) !important; box-shadow: 0 0 20px rgba(255,170,0,0.4) !important; z-index:4; }
  [data-arena-id].arena-lv5 { transform: scale(1.25) !important; box-shadow: 0 0 28px rgba(255,170,0,0.5) !important; z-index:5;
    outline: 2px solid rgba(255,170,0,0.5) !important; }
  [data-arena-id].arena-level-up { animation: arenaLevelUp 0.3s ease !important; }

  /* ── Enhanced Critical Hit (invert flash + expanding glow ring) ── */
  @keyframes arenaCrit {
    0%   { filter: brightness(1); box-shadow: 0 0 0 rgba(255,255,0,0); }
    10%  { filter: invert(1) brightness(2) !important; }
    25%  { filter: brightness(0) !important; box-shadow: 0 0 40px rgba(255,255,0,0.8), 0 0 80px rgba(255,255,0,0.3) !important; }
    50%  { filter: brightness(0.1) saturate(5) hue-rotate(-40deg) !important; box-shadow: 0 0 20px rgba(255,255,0,0.4) !important; }
    100% { filter: brightness(1); box-shadow: 0 0 0 rgba(255,255,0,0); }
  }
  [data-arena-id].arena-crit { animation: arenaCrit 0.35s ease !important; }

  /* War-torn page */
  body.arena-war-torn {
    filter: sepia(0.12) contrast(1.05) brightness(0.7) !important;
  }
  body.arena-war-torn::after {
    content: '';
    position: fixed; inset: 0;
    background: radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%);
    pointer-events: none; z-index: 999999;
  }

  /* ═══════════════════════════════════════
     ── New Iframe Battle Animations ──
     ═══════════════════════════════════════ */

  /* Fighting stance — pulsing orange glow (infinite) */
  @keyframes arenaFighting {
    0%, 100% { box-shadow: 0 0 8px rgba(255,102,0,0.3), inset 0 0 4px rgba(255,102,0,0.1) !important; }
    50% { box-shadow: 0 0 20px rgba(255,102,0,0.6), inset 0 0 10px rgba(255,102,0,0.2) !important; }
  }
  [data-arena-id].arena-fighting {
    animation: arenaFighting 0.8s ease-in-out infinite !important;
    outline: 2px solid rgba(255,102,0,0.4) !important;
  }

  /* Attacking — scale up + lunge + brightness flash */
  @keyframes arenaAttacking {
    0% { transform: scale(1) translateX(0); filter: brightness(1); }
    30% { transform: scale(1.08) translateX(calc(var(--arena-atk-dir, 1) * 8px)); filter: brightness(1.6) !important; }
    100% { transform: scale(1) translateX(0); filter: brightness(1); }
  }
  [data-arena-id].arena-attacking {
    animation: arenaAttacking 0.35s ease !important;
  }

  /* Recoil — physical shake + skew + brightness dip */
  @keyframes arenaRecoil {
    0% { transform: translate(0) skewX(0); filter: brightness(1); }
    20% { transform: translate(calc(var(--arena-kb-dir, -1) * 6px), 2px) skewX(calc(var(--arena-kb-dir, -1) * -3deg)); filter: brightness(0.3) saturate(2) !important; }
    50% { transform: translate(calc(var(--arena-kb-dir, -1) * 3px), -1px) skewX(calc(var(--arena-kb-dir, -1) * 2deg)); }
    100% { transform: translate(0) skewX(0); filter: brightness(1); }
  }
  [data-arena-id].arena-recoil {
    animation: arenaRecoil 0.4s ease !important;
  }

  /* Death variant 1: Shatter — clip-path fracture + flash + fade */
  @keyframes arenaDeathShatter {
    0% { opacity: 1; clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); filter: brightness(1); }
    15% { filter: brightness(3) saturate(0) !important; }
    40% { opacity: 0.6; clip-path: polygon(5% 5%, 48% 0, 50% 50%, 0 48%, 52% 2%, 95% 5%, 100% 48%, 52% 50%, 98% 52%, 95% 95%, 50% 98%, 50% 50%, 2% 52%, 5% 95%, 48% 98%, 50% 50%); }
    70% { opacity: 0.3; filter: brightness(0.3) !important; }
    100% { opacity: 0; transform: scale(1.1); filter: brightness(0) !important; }
  }
  [data-arena-id].arena-death-shatter {
    animation: arenaDeathShatter 0.6s ease forwards !important;
    pointer-events: none !important;
  }

  /* Death variant 2: Melt — scaleY collapse + sepia + spread */
  @keyframes arenaDeathMelt {
    0% { opacity: 1; transform: scaleY(1) scaleX(1); filter: brightness(1); }
    30% { filter: sepia(1) saturate(2) brightness(1.5) !important; }
    60% { opacity: 0.5; transform: scaleY(0.4) scaleX(1.3) translateY(8px); filter: sepia(1) brightness(0.6) !important; }
    100% { opacity: 0; transform: scaleY(0.05) scaleX(1.5) translateY(15px); filter: brightness(0) !important; }
  }
  [data-arena-id].arena-death-melt {
    animation: arenaDeathMelt 0.6s ease forwards !important;
    pointer-events: none !important;
  }

  /* Death variant 3: Explode — scale up flash + shrink + fade */
  @keyframes arenaDeathExplode {
    0% { opacity: 1; transform: scale(1); filter: brightness(1); }
    20% { transform: scale(1.3); filter: brightness(4) saturate(0) !important; }
    50% { opacity: 0.5; transform: scale(0.6); filter: brightness(0.5) !important; }
    100% { opacity: 0; transform: scale(0.2); filter: brightness(0) !important; }
  }
  [data-arena-id].arena-death-explode {
    animation: arenaDeathExplode 0.5s ease forwards !important;
    pointer-events: none !important;
  }

  /* Death variant 4: Dissolve — blur + contrast spike + fade */
  @keyframes arenaDeathDissolve {
    0% { opacity: 1; filter: brightness(1) blur(0); }
    30% { filter: contrast(2) brightness(1.5) blur(1px) !important; }
    60% { opacity: 0.4; filter: contrast(3) brightness(0.5) blur(3px) !important; }
    100% { opacity: 0; filter: blur(8px) brightness(0) !important; }
  }
  [data-arena-id].arena-death-dissolve {
    animation: arenaDeathDissolve 0.7s ease forwards !important;
    pointer-events: none !important;
  }

  /* Death variant 5: Collapse — scaleY to 0 + scaleX expand */
  @keyframes arenaDeathCollapse {
    0% { opacity: 1; transform: scaleY(1) scaleX(1); }
    40% { opacity: 0.7; transform: scaleY(0.3) scaleX(1.4) translateY(8px); filter: brightness(0.4) !important; }
    100% { opacity: 0; transform: scaleY(0) scaleX(1.8) translateY(12px); filter: brightness(0) !important; }
  }
  [data-arena-id].arena-death-collapse {
    animation: arenaDeathCollapse 0.6s ease forwards !important;
    pointer-events: none !important;
  }

  /* Buffed — green glow pulse */
  @keyframes arenaBuffed {
    0% { box-shadow: 0 0 0 rgba(68,204,119,0) !important; }
    50% { box-shadow: 0 0 20px rgba(68,204,119,0.6), inset 0 0 10px rgba(68,204,119,0.3) !important; }
    100% { box-shadow: 0 0 0 rgba(68,204,119,0) !important; }
  }
  [data-arena-id].arena-buffed {
    animation: arenaBuffed 0.6s ease !important;
  }

  /* Streak — persistent fire glow (infinite) */
  @keyframes arenaStreak {
    0%, 100% { box-shadow: 0 0 8px rgba(255,51,51,0.3), 0 0 4px rgba(255,102,0,0.2) !important; }
    50% { box-shadow: 0 0 20px rgba(255,51,51,0.6), 0 0 12px rgba(255,102,0,0.4), 0 0 4px rgba(255,200,0,0.3) !important; }
  }
  [data-arena-id].arena-streak {
    animation: arenaStreak 1.5s ease-in-out infinite !important;
  }

  /* Last Stand — red pulsing glow (infinite) */
  @keyframes arenaLastStand {
    0%, 100% { box-shadow: 0 0 6px rgba(255,0,0,0.2) !important; }
    50% { box-shadow: 0 0 18px rgba(255,0,0,0.5), inset 0 0 8px rgba(255,0,0,0.2) !important; filter: brightness(1.1) saturate(1.3); }
  }
  [data-arena-id].arena-last-stand {
    animation: arenaLastStand 1s ease-in-out infinite !important;
    outline: 1px solid rgba(255,0,0,0.3) !important;
  }

  /* Dodged — brief shimmer + translate */
  @keyframes arenaDodged {
    0% { transform: translateX(0); filter: brightness(1); }
    30% { transform: translateX(calc(var(--arena-kb-dir, -1) * -10px)); filter: brightness(2) saturate(0.5) !important; opacity: 0.6; }
    60% { transform: translateX(calc(var(--arena-kb-dir, -1) * 3px)); opacity: 0.8; }
    100% { transform: translateX(0); filter: brightness(1); opacity: 1; }
  }
  [data-arena-id].arena-dodged {
    animation: arenaDodged 0.3s ease !important;
  }

  /* Counter — quick bright flash + scale pulse */
  @keyframes arenaCounter {
    0% { transform: scale(1); filter: brightness(1); }
    40% { transform: scale(1.1); filter: brightness(2.5) saturate(0.5) !important; }
    100% { transform: scale(1); filter: brightness(1); }
  }
  [data-arena-id].arena-counter {
    animation: arenaCounter 0.3s ease !important;
  }
`;

// ── Proxy Config ──
const PROXIES = [
  url => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  url => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
  url => `https://corsproxy.org/?url=${encodeURIComponent(url)}`,
];

const WAYBACK_API = 'https://archive.org/wayback/available?url=';

function isBlankOrPlaceholder(html) {
  if (!html || html.length < 200) return true;

  const lower = html.toLowerCase();
  const head = lower.slice(0, 3000);
  const blockerPatterns = [
    'access denied', '403 forbidden', 'just a moment',
    'checking your browser', 'enable javascript', 'captcha',
    'cloudflare', 'please verify', 'bot detection',
    'sorry, you have been blocked', 'attention required',
    'ray id', 'cf-browser-verification', 'challenge-platform',
  ];
  if (blockerPatterns.some(p => head.includes(p))) return true;

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const text = (doc.body?.textContent || '').replace(/\s+/g, ' ').trim();
  if (text.length < 50) return true;

  const meaningful = doc.body?.querySelectorAll(
    'h1,h2,h3,h4,h5,h6,p,a,img,nav,ul,ol,li,table,form,button,input,section,article,main,header,footer'
  ) || [];
  if (meaningful.length < 3) return true;

  return false;
}

async function fetchWaybackSnapshot(url) {
  const apiUrl = WAYBACK_API + encodeURIComponent(url);
  const resp = await fetch(apiUrl, { signal: AbortSignal.timeout(10000) });
  if (!resp.ok) throw new Error('Wayback API unavailable');
  const data = await resp.json();
  const snapshot = data?.archived_snapshots?.closest;
  if (!snapshot || snapshot.status !== '200') throw new Error('No Wayback snapshot available');

  // Use the raw/id_ URL to skip the Wayback Machine toolbar injection
  const rawUrl = snapshot.url.replace(/\/web\/(\d+)\//, '/web/$1id_/');

  // Try fetching directly first (web.archive.org usually allows CORS)
  try {
    const r = await fetch(rawUrl, { signal: AbortSignal.timeout(15000) });
    if (r.ok) return { html: await r.text(), timestamp: snapshot.timestamp, url: rawUrl };
  } catch(e) { /* fall through to proxies */ }

  // Fall back to CORS proxies
  let lastErr;
  for (const proxy of PROXIES) {
    try {
      const r = await fetch(proxy(rawUrl), { signal: AbortSignal.timeout(15000) });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return { html: await r.text(), timestamp: snapshot.timestamp, url: rawUrl };
    } catch(e) { lastErr = e; }
  }
  throw new Error(`Could not fetch Wayback snapshot: ${lastErr?.message}`);
}

async function fetchSite(url, onStatus) {
  let html = null;
  let lastErr;
  let waybackUsed = false;

  // Try CORS proxies first
  for (const proxy of PROXIES) {
    try {
      const resp = await fetch(proxy(url), { signal: AbortSignal.timeout(15000) });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      html = await resp.text();
      break;
    } catch(e) { lastErr = e; }
  }

  // Check if content is usable
  const needsWayback = !html || isBlankOrPlaceholder(html);

  if (needsWayback) {
    const reason = !html ? 'Fetch failed' : 'Blocked or blank page detected';
    if (onStatus) onStatus(`${reason} \u2014 trying Wayback Machine...`);

    try {
      const wb = await fetchWaybackSnapshot(url);
      if (!isBlankOrPlaceholder(wb.html)) {
        if (onStatus) {
          const ts = wb.timestamp;
          const dateStr = `${ts.slice(0,4)}-${ts.slice(4,6)}-${ts.slice(6,8)}`;
          onStatus(`Using Wayback Machine snapshot from ${dateStr}`);
        }
        return { html: wb.html, wayback: true, timestamp: wb.timestamp };
      }
    } catch(e) {
      // Wayback also failed
    }

    // If original fetch got something, use it anyway
    if (html) return { html, wayback: false };

    throw new Error(`Could not fetch site (all proxies and Wayback Machine failed): ${lastErr?.message}`);
  }

  return { html, wayback: false };
}

// ── Parse & Extract Elements (with per-element a11y detection) ──
function extractElements(html, baseUrl) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const elements = [];
  const SKIP = new Set(['html','head','body','meta','link','style','script','noscript',
    'title','template','slot','source','track','wbr','col','colgroup','data',
    'datalist','dialog','embed','map','area','object','param','picture','portal','base']);

  doc.querySelectorAll('script,noscript').forEach(s => s.remove());
  doc.querySelectorAll('iframe').forEach(f => f.remove());
  doc.querySelectorAll('object,embed').forEach(e => e.remove());
  doc.querySelectorAll('meta[http-equiv]').forEach(m => m.remove());

  function walk(node) {
    if (node.nodeType !== 1) return;
    const tag = node.tagName.toLowerCase();
    if (SKIP.has(tag)) {
      if (tag === 'html' || tag === 'head' || tag === 'body') {
        for (const child of node.children) walk(child);
      }
      return;
    }
    const text = (node.textContent || '').trim().slice(0, 80);
    const childCount = node.children.length;
    const attrCount = node.attributes.length;
    const hasClasses = node.classList.length > 0;
    const id = 'a' + Math.random().toString(36).slice(2, 8);

    node.setAttribute('data-arena-id', id);

    // Per-element accessibility detection
    const a11y = {};
    if (tag === 'img' && node.hasAttribute('alt') && node.getAttribute('alt').trim().length > 0) {
      a11y.hasAlt = true;
    }
    if (node.hasAttribute('aria-label') || node.hasAttribute('aria-labelledby')) {
      a11y.hasAriaLabel = true;
    }
    if (node.hasAttribute('role') && node.getAttribute('role') !== 'presentation' && node.getAttribute('role') !== 'none') {
      a11y.hasMeaningfulRole = true;
    }
    if (tag === 'input' && node.id) {
      const labelEl = doc.querySelector(`label[for="${CSS.escape(node.id)}"]`);
      if (labelEl) a11y.hasLabel = true;
    }

    elements.push({tag, text, childCount, attrCount, hasClasses, id, a11y});

    if (elements.length < 200) {
      for (const child of node.children) walk(child);
    }
  }

  walk(doc.documentElement);

  let baseTag = doc.querySelector('base');
  if (!baseTag) {
    baseTag = doc.createElement('base');
    doc.head.prepend(baseTag);
  }
  baseTag.href = baseUrl;

  const styleTag = doc.createElement('style');
  styleTag.textContent = ARENA_IFRAME_CSS;
  doc.head.appendChild(styleTag);

  const modifiedHtml = doc.documentElement.outerHTML;

  if (elements.length > 150) {
    elements.sort((a,b) => {
      const sa = ELEMENT_ROLES[a.tag] || DEFAULT_STATS;
      const sb = ELEMENT_ROLES[b.tag] || DEFAULT_STATS;
      return (sb.hp + sb.atk) - (sa.hp + sa.atk);
    });
    elements.length = 150;
  }
  return { elements, modifiedHtml, doc };
}

// ── Stat Calculation (with per-element a11y bonuses) ──
function calcStats(el) {
  const base = ELEMENT_ROLES[el.tag] || DEFAULT_STATS;
  let hp = base.hp, atk = base.atk, def = base.def;
  if (el.text.length > 0) hp += Math.min(el.text.length * 0.3, 20);
  if (el.childCount > 0) def += Math.min(el.childCount * 1.5, 15);
  if (el.attrCount > 2) atk += Math.min(el.attrCount * 1, 8);
  if (el.hasClasses) { hp += 5; def += 3; }

  // Per-element a11y bonuses
  const a11y = el.a11y || {};
  if (a11y.hasAlt) { atk += 5; def += 3; }
  if (a11y.hasAriaLabel) hp += 8;
  if (a11y.hasMeaningfulRole) def += 4;
  if (a11y.hasLabel) def += 5;

  return { ...el, role: base.role, hp: Math.round(hp), maxHp: Math.round(hp),
           atk: Math.round(atk), def: Math.round(def), alive: true,
           xp: 0, level: 1, kills: 0, streak: 0, crits: 0, a11y };
}

// ── Army-Wide Accessibility Detection & Cascading Buffs ──
function detectArmyA11y(doc, army) {
  const practices = [];

  // 1. lang attribute on html
  const htmlEl = doc.querySelector('html');
  if (htmlEl && htmlEl.getAttribute('lang')) practices.push('lang');

  // 2. Heading hierarchy
  const headings = [...doc.querySelectorAll('h1,h2,h3,h4,h5,h6')];
  let hierarchyOk = true;
  let lastLevel = 0;
  for (const h of headings) {
    const level = parseInt(h.tagName[1]);
    if (level > lastLevel + 1 && lastLevel > 0) { hierarchyOk = false; break; }
    lastLevel = level;
  }
  if (headings.length >= 2 && hierarchyOk) practices.push('headingHierarchy');

  // 3. >80% img alt coverage
  const imgs = doc.querySelectorAll('img');
  if (imgs.length > 0) {
    const withAlt = [...imgs].filter(img => img.hasAttribute('alt') && img.alt.trim().length > 0).length;
    if (withAlt / imgs.length > 0.8) practices.push('altCoverage');
  } else {
    practices.push('altCoverage');
  }

  // 4. Skip-nav links
  const links = doc.querySelectorAll('a[href^="#"]');
  const hasSkipNav = [...links].some(a => {
    const text = a.textContent.toLowerCase();
    return text.includes('skip') || text.includes('jump to');
  });
  if (hasSkipNav) practices.push('skipNav');

  // 5. ARIA landmarks (>=2)
  const landmarkRoles = ['banner','navigation','main','contentinfo','complementary','search'];
  const landmarkSelector = landmarkRoles.map(r => `[role="${r}"]`).join(',');
  const semanticLandmarks = doc.querySelectorAll('nav,main,header,footer,aside');
  const ariaLandmarks = landmarkSelector ? doc.querySelectorAll(landmarkSelector) : [];
  const allLandmarks = new Set([...semanticLandmarks, ...ariaLandmarks]);
  if (allLandmarks.size >= 2) practices.push('ariaLandmarks');

  // 6. Meta viewport
  const viewport = doc.querySelector('meta[name="viewport"]');
  if (viewport) practices.push('viewport');

  // 7. Semantic HTML (>=3 different semantic elements)
  const semanticTags = ['main','nav','header','footer','article','section','aside','figure','figcaption','details','summary','time','mark'];
  const usedSemantic = new Set();
  for (const tag of semanticTags) {
    if (doc.querySelector(tag)) usedSemantic.add(tag);
  }
  if (usedSemantic.size >= 3) practices.push('semanticHTML');

  const count = practices.length;

  // Determine tier
  let tier = null;
  if (count >= 7) {
    tier = { name: 'A11y Champion', level: 3, statMult: 0.15, dodgeChance: 0.08, critResist: 0.20 };
  } else if (count >= 5) {
    tier = { name: 'Accessible', level: 2, statMult: 0.10, dodgeChance: 0, critResist: 0.15 };
  } else if (count >= 3) {
    tier = { name: 'Standards Compliant', level: 1, statMult: 0.05, dodgeChance: 0, critResist: 0 };
  }

  // Apply per-practice bonuses
  for (const u of army) {
    if (practices.includes('lang')) u.def += 2;
    if (practices.includes('headingHierarchy')) u.atk += 3;
    if (practices.includes('altCoverage')) { u.atk += 2; u.def += 2; }
    if (practices.includes('skipNav')) { u.hp += 3; u.maxHp += 3; }
    if (practices.includes('ariaLandmarks')) u.def += 2;
    if (practices.includes('viewport')) { u.hp += 2; u.maxHp += 2; }
    if (practices.includes('semanticHTML')) { u.atk += 2; u.hp += 2; u.maxHp += 2; }

    // Cascading tier multiplier
    if (tier) {
      u.hp = Math.round(u.hp * (1 + tier.statMult));
      u.maxHp = Math.round(u.maxHp * (1 + tier.statMult));
      u.atk = Math.round(u.atk * (1 + tier.statMult));
      u.def = Math.round(u.def * (1 + tier.statMult));
      u.a11yTier = tier;
    }
  }

  return { practices, tier, count };
}

// ── Role Synergies ──
function applySynergies(army) {
  const active = [];
  const roles = new Set(army.filter(u => u.alive).map(u => u.role));
  const byRole = r => army.filter(u => u.alive && u.role === r);

  // Shield Wall: shield + fortress → +6 DEF to both
  if (roles.has('shield') && roles.has('fortress')) {
    [...byRole('shield'), ...byRole('fortress')].forEach(u => u.def += 6);
    active.push('Shield Wall');
  }

  // Strike Force: striker + scout → +5 ATK to both
  if (roles.has('striker') && roles.has('scout')) {
    [...byRole('striker'), ...byRole('scout')].forEach(u => u.atk += 5);
    active.push('Strike Force');
  }

  // Command Chain: boss + commander + officer → +3 ATK/DEF, +10 HP to all three
  if (roles.has('boss') && roles.has('commander') && roles.has('officer')) {
    [...byRole('boss'), ...byRole('commander'), ...byRole('officer')].forEach(u => {
      u.atk += 3; u.def += 3; u.hp += 10; u.maxHp += 10;
    });
    active.push('Command Chain');
  }

  // Fire Support: artillery + ranger → +4 ATK to both
  if (roles.has('artillery') && roles.has('ranger')) {
    [...byRole('artillery'), ...byRole('ranger')].forEach(u => u.atk += 4);
    active.push('Fire Support');
  }

  // Engineering Corps: engineer + fortress → +12 HP to engineers
  if (roles.has('engineer') && roles.has('fortress')) {
    byRole('engineer').forEach(u => { u.hp += 12; u.maxHp += 12; });
    active.push('Engineering Corps');
  }

  return active;
}

// ── DOM helpers ──
const $ = id => document.getElementById(id);
let currentView = 'cards';

function switchView(view) {
  currentView = view;
  $('btn-cards').classList.toggle('active', view === 'cards');
  $('btn-preview').classList.toggle('active', view === 'preview');
  $('btn-split').classList.toggle('active', view === 'split');
  $('btn-cards').setAttribute('aria-pressed', view === 'cards');
  $('btn-preview').setAttribute('aria-pressed', view === 'preview');
  $('btn-split').setAttribute('aria-pressed', view === 'split');

  const cards = $('cards-view');
  const preview = $('preview-view');

  cards.style.maxHeight = '';
  cards.querySelector('.army-left').style.maxHeight = '';
  cards.querySelector('.army-right').style.maxHeight = '';
  preview.classList.remove('split-mode');

  if (view === 'cards') {
    cards.classList.remove('hidden'); cards.style.display = 'flex';
    preview.classList.remove('visible'); preview.style.display = 'none';
  } else if (view === 'preview') {
    cards.classList.add('hidden'); cards.style.display = 'none';
    preview.classList.add('visible'); preview.style.display = 'flex';
  } else {
    cards.classList.remove('hidden'); cards.style.display = 'flex';
    cards.style.maxHeight = '30vh';
    cards.querySelector('.army-left').style.maxHeight = '30vh';
    cards.querySelector('.army-right').style.maxHeight = '30vh';
    preview.classList.add('visible','split-mode'); preview.style.display = 'flex';
  }
}

// ── Preview iframe helpers ──
function getPreviewDoc(frameId) {
  try {
    return $(frameId)?.contentDocument;
  } catch { return null; }
}

function getPreviewEl(unit, side) {
  const doc = getPreviewDoc(side === 1 ? 'preview-frame-1' : 'preview-frame-2');
  if (!doc) return null;
  return doc.querySelector(`[data-arena-id="${unit.id}"]`);
}

function syncPreviewHit(unit, side) {
  const el = getPreviewEl(unit, side);
  if (!el) return;
  el.classList.remove('arena-hit');
  void el.offsetWidth;
  el.classList.add('arena-hit');
  setTimeout(() => el.classList.remove('arena-hit'), 200);
}

function syncPreviewDamage(unit, side) {
  const el = getPreviewEl(unit, side);
  if (!el) return;
  const hpPct = unit.hp / unit.maxHp;
  el.classList.remove('arena-dmg-1','arena-dmg-2','arena-dmg-3','arena-dmg-4');
  if (hpPct < 0.25)      el.classList.add('arena-dmg-4');
  else if (hpPct < 0.5)   el.classList.add('arena-dmg-3');
  else if (hpPct < 0.75)  el.classList.add('arena-dmg-2');
  else if (hpPct < 0.95)  el.classList.add('arena-dmg-1');
}

function syncPreviewDefeat(unit, side) {
  const el = getPreviewEl(unit, side);
  if (!el) return;
  el.classList.remove('arena-dmg-1','arena-dmg-2','arena-dmg-3','arena-dmg-4','arena-hit');
  el.classList.add('arena-defeated');
  setTimeout(() => {
    el.classList.remove('arena-defeated');
    el.classList.add('arena-scar');
  }, 600);
}

function syncPreviewWarTorn(army, side) {
  const doc = getPreviewDoc(side === 1 ? 'preview-frame-1' : 'preview-frame-2');
  if (!doc) return;
  doc.body.classList.add('arena-war-torn');

  for (const unit of army) {
    const el = doc.querySelector(`[data-arena-id="${unit.id}"]`);
    if (!el || !unit.alive) continue;
    const hpPct = unit.hp / unit.maxHp;
    el.classList.remove('arena-dmg-1','arena-dmg-2','arena-dmg-3','arena-dmg-4');
    el.classList.add('arena-survivor');

    if (hpPct < 0.25) {
      el.classList.add('arena-barely-alive');
      el.style.setProperty('--arena-opacity', '0.5');
      el.style.setProperty('--arena-rot', (Math.random()*4-2).toFixed(1)+'deg');
    } else if (hpPct < 0.6) {
      el.classList.add('arena-wounded');
      el.style.setProperty('--arena-opacity', '0.7');
    }
  }
}

// ── New Preview Sync Functions ──
function syncPreviewFighting(unit, side, active) {
  const el = getPreviewEl(unit, side);
  if (!el) return;
  if (active) el.classList.add('arena-fighting');
  else el.classList.remove('arena-fighting');
}

function syncPreviewAttack(unit, side) {
  const el = getPreviewEl(unit, side);
  if (!el) return;
  el.style.setProperty('--arena-atk-dir', side === 1 ? '1' : '-1');
  el.classList.remove('arena-attacking');
  void el.offsetWidth;
  el.classList.add('arena-attacking');
  setTimeout(() => el.classList.remove('arena-attacking'), 350);
}

function syncPreviewRecoil(unit, side, isCrit) {
  const el = getPreviewEl(unit, side);
  if (!el) return;
  el.style.setProperty('--arena-kb-dir', side === 1 ? '-1' : '1');
  el.classList.remove('arena-recoil');
  void el.offsetWidth;
  el.classList.add('arena-recoil');
  if (isCrit) {
    el.classList.remove('arena-crit');
    void el.offsetWidth;
    el.classList.add('arena-crit');
    setTimeout(() => el.classList.remove('arena-crit'), 350);
  }
  setTimeout(() => el.classList.remove('arena-recoil'), 400);
}

function syncPreviewBuff(unit, side) {
  const el = getPreviewEl(unit, side);
  if (!el) return;
  el.classList.remove('arena-buffed');
  void el.offsetWidth;
  el.classList.add('arena-buffed');
  setTimeout(() => el.classList.remove('arena-buffed'), 600);
}

function syncPreviewStreak(unit, side) {
  const el = getPreviewEl(unit, side);
  if (!el) return;
  if (unit.streak >= 2) el.classList.add('arena-streak');
  else el.classList.remove('arena-streak');
}

function syncPreviewLastStand(unit, side) {
  const el = getPreviewEl(unit, side);
  if (!el) return;
  el.classList.add('arena-last-stand');
}

function syncPreviewDodge(unit, side) {
  const el = getPreviewEl(unit, side);
  if (!el) return;
  el.style.setProperty('--arena-kb-dir', side === 1 ? '-1' : '1');
  el.classList.remove('arena-dodged');
  void el.offsetWidth;
  el.classList.add('arena-dodged');
  setTimeout(() => el.classList.remove('arena-dodged'), 300);
}

function syncPreviewCounter(unit, side) {
  const el = getPreviewEl(unit, side);
  if (!el) return;
  el.classList.remove('arena-counter');
  void el.offsetWidth;
  el.classList.add('arena-counter');
  setTimeout(() => el.classList.remove('arena-counter'), 300);
}

function syncPreviewDefeatEnhanced(unit, side) {
  const el = getPreviewEl(unit, side);
  if (!el) return;
  el.classList.remove('arena-dmg-1','arena-dmg-2','arena-dmg-3','arena-dmg-4',
    'arena-hit','arena-fighting','arena-last-stand','arena-streak',
    'arena-recoil','arena-attacking');
  const deaths = ['arena-death-shatter','arena-death-melt','arena-death-explode',
                  'arena-death-dissolve','arena-death-collapse'];
  const deathClass = deaths[Math.floor(Math.random() * deaths.length)];
  el.classList.add(deathClass);
  setTimeout(() => {
    el.classList.remove(deathClass);
    el.classList.add('arena-scar');
  }, 700);
}

// ── Floating Text Helpers ──
function showDodgeText(card) {
  const layer = getCollisionLayer();
  if (!layer || !card) return;
  const pos = getCardCenter(card);
  if (!pos) return;
  const num = document.createElement('div');
  num.className = 'dmg-number dodge-text';
  num.textContent = 'DODGE!';
  num.style.left = (pos.x + randInt(-8, 8)) + 'px';
  num.style.top = (pos.y - 10) + 'px';
  layer.appendChild(num);
  setTimeout(() => num.remove(), 850);
}

function showCounterText(card, dmg) {
  const layer = getCollisionLayer();
  if (!layer || !card) return;
  const pos = getCardCenter(card);
  if (!pos) return;
  const num = document.createElement('div');
  num.className = 'dmg-number counter-text';
  num.textContent = '\u26A1' + dmg;
  num.style.left = (pos.x + randInt(-8, 8)) + 'px';
  num.style.top = (pos.y - 10) + 'px';
  layer.appendChild(num);
  setTimeout(() => num.remove(), 850);
}

function showHealText(card, amount) {
  const layer = getCollisionLayer();
  if (!layer || !card) return;
  const pos = getCardCenter(card);
  if (!pos) return;
  const num = document.createElement('div');
  num.className = 'dmg-number heal-text';
  num.textContent = '+' + amount;
  num.style.left = (pos.x + randInt(-8, 8)) + 'px';
  num.style.top = (pos.y - 10) + 'px';
  layer.appendChild(num);
  setTimeout(() => num.remove(), 850);
}

// ── XP / Level System ──
const XP_PER_LEVEL = 30;
const MAX_LEVEL = 5;

function awardXP(unit, amount) {
  if (unit.level >= MAX_LEVEL) return false;
  unit.xp += amount;
  const needed = XP_PER_LEVEL * unit.level;
  if (unit.xp >= needed) {
    unit.xp -= needed;
    unit.level++;
    unit.atk += 4;
    unit.def += 3;
    const hpGain = Math.round(unit.maxHp * 0.15);
    unit.maxHp += hpGain;
    unit.hp += hpGain;
    applyLevelVisuals(unit);
    return true;
  }
  return false;
}

function applyLevelVisuals(unit) {
  const card = getCard(unit);
  if (card) {
    card.classList.remove('lv2','lv3','lv4','lv5');
    if (unit.level >= 2) card.classList.add('leveled', `lv${Math.min(unit.level, 5)}`);
    card.querySelector('.el-level').textContent = `Lv${unit.level}`;
    card.classList.add('level-up');
    setTimeout(() => card.classList.remove('level-up'), 400);
  }
  const el = getPreviewEl(unit, unit.side);
  if (el) {
    el.classList.remove('arena-lv2','arena-lv3','arena-lv4','arena-lv5');
    if (unit.level >= 2) el.classList.add(`arena-lv${Math.min(unit.level, 5)}`);
    el.classList.add('arena-level-up');
    setTimeout(() => el.classList.remove('arena-level-up'), 300);
  }
}

function applyStreakVisuals(unit) {
  const card = getCard(unit);
  if (card) {
    if (unit.streak >= 2) {
      card.classList.add('on-streak');
      card.querySelector('.streak-badge').textContent = unit.streak;
    } else {
      card.classList.remove('on-streak');
    }
  }
}

function syncPreviewCrit(unit, side) {
  const el = getPreviewEl(unit, side);
  if (!el) return;
  el.classList.remove('arena-crit');
  void el.offsetWidth;
  el.classList.add('arena-crit');
  setTimeout(() => el.classList.remove('arena-crit'), 350);
}

// ── Morale System ──
function applyMoraleBreak(deadUnit, army) {
  if (deadUnit.role !== 'boss' && deadUnit.role !== 'commander') return;
  const loss = deadUnit.role === 'boss' ? 0.12 : 0.06;
  const label = deadUnit.role === 'boss' ? 'COMMANDER FALLEN' : 'OFFICER DOWN';

  for (const u of army) {
    if (!u.alive) continue;
    u.atk = Math.round(u.atk * (1 - loss));
    u.def = Math.round(u.def * (1 - loss));
    const card = getCard(u);
    if (card) {
      card.classList.add('morale-broken');
      setTimeout(() => card.classList.remove('morale-broken'), 800);
    }
  }

  logBattle(`<span class="ko">${label}! &lt;${deadUnit.tag}&gt; is down \u2014 morale shattered! (-${Math.round(loss*100)}% ATK/DEF)</span>`);
}

// ── Battle Engine ──
let battleState = null;

async function startBattle() {
  const url1 = $('url1').value.trim();
  const url2 = $('url2').value.trim();
  if (!url1 || !url2) return showError('Enter both URLs');
  try {
    const parsed1 = new URL(url1);
    const parsed2 = new URL(url2);
    if (!['http:', 'https:'].includes(parsed1.protocol) || !['http:', 'https:'].includes(parsed2.protocol)) {
      return showError('Only http and https URLs are allowed');
    }
  } catch { return showError('Enter valid URLs (include https://)'); }

  showError('');
  $('fight-btn').disabled = true;
  $('input-screen').style.display = 'none';
  $('loading-screen').style.display = 'flex';

  try {
    $('loading-text').textContent = 'Fetching challenger 1...';
    const fetch1 = await fetchSite(url1, s => { $('loading-text').textContent = `Challenger 1: ${s}`; });
    $('loading-text').textContent = 'Fetching challenger 2...';
    const fetch2 = await fetchSite(url2, s => { $('loading-text').textContent = `Challenger 2: ${s}`; });

    $('loading-text').textContent = 'Extracting elements...';
    await sleep(300);
    const result1 = extractElements(fetch1.html, url1);
    const result2 = extractElements(fetch2.html, url2);
    const raw1 = result1.elements;
    const raw2 = result2.elements;

    if (raw1.length < 3 || raw2.length < 3) {
      throw new Error('One or both sites returned too few elements to battle.');
    }

    const army1 = raw1.map(calcStats);
    const army2 = raw2.map(calcStats);

    army1.forEach(u => u.side = 1);
    army2.forEach(u => u.side = 2);

    // Accessibility detection
    $('loading-text').textContent = 'Analyzing accessibility...';
    const a11y1 = detectArmyA11y(result1.doc, army1);
    const a11y2 = detectArmyA11y(result2.doc, army2);

    // Role synergies
    const synergies1 = applySynergies(army1);
    const synergies2 = applySynergies(army2);

    $('loading-screen').style.display = 'none';
    $('arena').style.display = 'flex';
    $('site1-name').textContent = url1 + (fetch1.wayback ? ' (archived)' : '');
    $('site2-name').textContent = url2 + (fetch2.wayback ? ' (archived)' : '');
    $('preview-label-1').textContent = new URL(url1).hostname + (fetch1.wayback ? ' \u231B' : '');
    $('preview-label-2').textContent = new URL(url2).hostname + (fetch2.wayback ? ' \u231B' : '');

    battleState = { army1, army2, url1, url2, round: 0, totalRounds: 0,
                    html1: result1.modifiedHtml, html2: result2.modifiedHtml,
                    a11y1, a11y2, synergies1, synergies2,
                    wayback1: fetch1.wayback, wayback2: fetch2.wayback };

    // Display a11y badges
    if (a11y1.tier) {
      const badge1 = $('hp1-badge');
      if (badge1) {
        badge1.className = `a11y-badge tier-${a11y1.tier.level}`;
        badge1.textContent = a11y1.tier.name;
      }
    }
    if (a11y2.tier) {
      const badge2 = $('hp2-badge');
      if (badge2) {
        badge2.className = `a11y-badge tier-${a11y2.tier.level}`;
        badge2.textContent = a11y2.tier.name;
      }
    }

    renderArmy(army1, $('army-left'));
    renderArmy(army2, $('army-right'));

    $('preview-frame-1').srcdoc = '<!DOCTYPE html><html>' + result1.modifiedHtml + '</html>';
    $('preview-frame-2').srcdoc = '<!DOCTYPE html><html>' + result2.modifiedHtml + '</html>';

    switchView('split');

    await sleep(400);

    addScanLine($('army-left'));
    addScanLine($('army-right'));
    $('round-info').textContent = `Scanned: ${army1.length} vs ${army2.length} elements`;
    await sleep(800);

    $('battle-log').classList.add('visible');

    // Log Wayback Machine usage
    if (fetch1.wayback) {
      const ts = fetch1.timestamp || '';
      const dateStr = ts ? `${ts.slice(0,4)}-${ts.slice(4,6)}-${ts.slice(6,8)}` : 'unknown date';
      logBattle(`<span style="color:var(--cyan)">\u231B ${new URL(url1).hostname} loaded from Wayback Machine (snapshot: ${dateStr})</span>`);
    }
    if (fetch2.wayback) {
      const ts = fetch2.timestamp || '';
      const dateStr = ts ? `${ts.slice(0,4)}-${ts.slice(4,6)}-${ts.slice(6,8)}` : 'unknown date';
      logBattle(`<span style="color:var(--red)">\u231B ${new URL(url2).hostname} loaded from Wayback Machine (snapshot: ${dateStr})</span>`);
    }

    // Log a11y results
    if (a11y1.tier) {
      logBattle(`<span style="color:#44cc77">\u26A1 ${new URL(url1).hostname}: ${a11y1.tier.name} (${a11y1.count} a11y practices) \u2014 +${Math.round(a11y1.tier.statMult*100)}% all stats</span>`);
    }
    if (a11y2.tier) {
      logBattle(`<span style="color:#44cc77">\u26A1 ${new URL(url2).hostname}: ${a11y2.tier.name} (${a11y2.count} a11y practices) \u2014 +${Math.round(a11y2.tier.statMult*100)}% all stats</span>`);
    }
    if (synergies1.length) {
      logBattle(`<span style="color:var(--gold)">\u2694 Team 1 synergies: ${synergies1.join(', ')}</span>`);
    }
    if (synergies2.length) {
      logBattle(`<span style="color:var(--gold)">\u2694 Team 2 synergies: ${synergies2.join(', ')}</span>`);
    }

    await runBattle();
  } catch(e) {
    $('loading-screen').style.display = 'none';
    $('input-screen').style.display = 'flex';
    $('fight-btn').disabled = false;
    showError(e.message);
  }
}

function showError(msg) { $('error-msg').textContent = msg; }

function renderArmy(army, container) {
  container.innerHTML = '';
  for (const unit of army) {
    const card = document.createElement('div');
    card.className = 'el-card';
    card.dataset.role = unit.role;
    card.dataset.uid = unit.id;
    card.innerHTML = `<span class="el-tag">&lt;${unit.tag}&gt;</span><span class="el-preview">${escHtml(unit.text.slice(0,40))}</span><span class="el-level">Lv1</span><span class="streak-badge"></span>`;
    card.title = `${unit.role.toUpperCase()} | HP:${unit.hp} ATK:${unit.atk} DEF:${unit.def}`;
    container.appendChild(card);
  }
}

function addScanLine(container) {
  const line = document.createElement('div');
  line.className = 'scan-line';
  container.appendChild(line);
  setTimeout(() => line.remove(), 1600);
}

function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

// ── Core Battle Loop (with healing phase) ──
async function runBattle() {
  const {army1, army2} = battleState;
  const totalHp1 = army1.reduce((s,u) => s + u.maxHp, 0);
  const totalHp2 = army2.reduce((s,u) => s + u.maxHp, 0);
  let roundNum = 0;

  shuffle(army1);
  shuffle(army2);

  while (true) {
    const alive1 = army1.filter(u => u.alive);
    const alive2 = army2.filter(u => u.alive);
    if (alive1.length === 0 || alive2.length === 0) break;

    roundNum++;
    battleState.round = roundNum;
    $('round-info').textContent = `Round ${roundNum}`;

    const maxPairs = Math.min(alive1.length, alive2.length, 12);
    const intensity = Math.random();
    const pairs = intensity < 0.15 ? Math.max(1, Math.ceil(maxPairs * 0.3))
                : intensity < 0.30 ? Math.max(2, Math.ceil(maxPairs * 0.6))
                : maxPairs;
    const fighters1 = pickFighters(alive1, pairs);
    const fighters2 = pickFighters(alive2, pairs);

    await Promise.all(fighters1.map((f, i) => duel(f, fighters2[i])));

    // Healing phase (25% chance per round)
    if (Math.random() < 0.25) {
      const stillAlive1 = army1.filter(u => u.alive);
      const stillAlive2 = army2.filter(u => u.alive);

      for (const [army, side] of [[stillAlive1, 1], [stillAlive2, 2]]) {
        const engineers = army.filter(u => u.role === 'engineer');
        if (engineers.length === 0) continue;
        const healer = engineers[Math.floor(Math.random() * engineers.length)];
        const wounded = army.filter(u => u.hp < u.maxHp && u !== healer);
        if (wounded.length === 0) continue;
        const target = wounded[Math.floor(Math.random() * wounded.length)];
        const healAmt = Math.round(healer.def * 0.5 + randInt(3, 8));
        target.hp = Math.min(target.maxHp, target.hp + healAmt);

        const card = getCard(target);
        if (card) {
          card.classList.add('healed');
          setTimeout(() => card.classList.remove('healed'), 600);
        }
        syncPreviewBuff(target, side);
        showHealText(card, healAmt);
        logBattle(`<span style="color:#44cc77">&lt;${healer.tag}&gt; [engineer] heals &lt;${target.tag}&gt; for ${healAmt} HP!</span>`);
      }
    }

    const curHp1 = army1.filter(u=>u.alive).reduce((s,u)=>s+u.hp,0);
    const curHp2 = army2.filter(u=>u.alive).reduce((s,u)=>s+u.hp,0);
    updateHpBar(curHp1, totalHp1, 'hp1-bar', 'hp1-val');
    updateHpBar(curHp2, totalHp2, 'hp2-bar', 'hp2-val');

    await sleep(randInt(20, 60));
  }

  battleState.totalRounds = roundNum;
  await sleep(200);
  await showAftermath();
}

function pickFighters(alive, count) {
  const weighted = alive.map(u => ({u, w: u.hp + u.atk * 2}));
  weighted.sort((a,b) => b.w - a.w);
  const pool = weighted.slice(0, Math.max(count * 3, 8));
  shuffle(pool);
  return pool.slice(0, count).map(x => x.u);
}

// ── Role-Based Animation Variation ──
const ROLE_DEATHS = {
  boss:      [{a:'supernova',d:0.7},{a:'explode',d:0.65},{a:'topple',d:0.7},{a:'meltdown',d:0.65},{a:'shatter',d:0.6}],
  commander: [{a:'topple',d:0.6},{a:'explode',d:0.6},{a:'shatter',d:0.55},{a:'meltdown',d:0.6},{a:'defeat',d:0.55}],
  officer:   [{a:'defeat',d:0.5},{a:'slash',d:0.45},{a:'shatter',d:0.5},{a:'topple',d:0.55},{a:'burnout',d:0.5}],
  shield:    [{a:'collapse',d:0.6},{a:'crush',d:0.55},{a:'crumble',d:0.6},{a:'sink',d:0.6},{a:'shatter',d:0.55}],
  striker:   [{a:'slash',d:0.4},{a:'launch',d:0.5},{a:'blink',d:0.4},{a:'explode',d:0.45},{a:'vaporize',d:0.4}],
  scout:     [{a:'launch',d:0.4},{a:'blink',d:0.35},{a:'slash',d:0.4},{a:'vaporize',d:0.35},{a:'spiral',d:0.45}],
  ranger:    [{a:'detonate',d:0.5},{a:'burnout',d:0.55},{a:'launch',d:0.5},{a:'explode',d:0.5},{a:'shatter',d:0.5}],
  artillery: [{a:'detonate',d:0.6},{a:'explode',d:0.6},{a:'supernova',d:0.7},{a:'implosion',d:0.55},{a:'burnout',d:0.6}],
  engineer:  [{a:'glitch',d:0.5},{a:'crumble',d:0.5},{a:'implosion',d:0.5},{a:'incinerate',d:0.55},{a:'vaporize',d:0.45}],
  fortress:  [{a:'collapse',d:0.65},{a:'crumble',d:0.65},{a:'crush',d:0.6},{a:'sink',d:0.65},{a:'shatter',d:0.6}],
  squad:     [{a:'defeat',d:0.45},{a:'slash',d:0.4},{a:'launch',d:0.45},{a:'collapse',d:0.45},{a:'blink',d:0.4}],
  infantry:  [{a:'defeat',d:0.45},{a:'crumble',d:0.45},{a:'collapse',d:0.45},{a:'slash',d:0.4},{a:'crush',d:0.4}],
  civilian:  [{a:'defeat',d:0.4},{a:'blink',d:0.35},{a:'vaporize',d:0.35},{a:'spiral',d:0.4},{a:'sink',d:0.45}],
  messenger: [{a:'vaporize',d:0.3},{a:'blink',d:0.3},{a:'spiral',d:0.35},{a:'glitch',d:0.35},{a:'defeat',d:0.3}],
  barracks:  [{a:'collapse',d:0.6},{a:'crumble',d:0.6},{a:'meltdown',d:0.6},{a:'sink',d:0.6},{a:'burnout',d:0.55}],
  vanguard:  [{a:'explode',d:0.55},{a:'topple',d:0.55},{a:'slash',d:0.5},{a:'shatter',d:0.55},{a:'defeat',d:0.5}],
  rearguard: [{a:'collapse',d:0.55},{a:'burnout',d:0.55},{a:'crumble',d:0.55},{a:'crush',d:0.5},{a:'defeat',d:0.5}],
};
const DEFAULT_DEATHS = [{a:'defeat',d:0.5},{a:'crumble',d:0.5},{a:'blink',d:0.4},{a:'collapse',d:0.5}];

const ROLE_ATTACKS = {
  boss:'atkSlam',commander:'atkSlam',officer:'atkLunge',
  shield:'atkSlam',striker:'atkDash',scout:'atkDash',
  ranger:'atkBlast',artillery:'atkBlast',engineer:'atkLunge',
  fortress:'atkSlam',squad:'atkLunge',infantry:'atkLunge',
  civilian:'atkLunge',messenger:'atkDash',barracks:'atkSlam',
  vanguard:'atkLunge',rearguard:'atkSlam',
};

const ROLE_HITS = {
  boss:'hitRecoil',commander:'hitRecoil',officer:'hitShake',
  shield:'hitBounce',striker:'hitShake',scout:'hitBounce',
  ranger:'hitShake',artillery:'hitCrackle',engineer:'hitCrackle',
  fortress:'hitRecoil',squad:'hitShake',infantry:'hitShake',
  civilian:'hitBounce',messenger:'hitBounce',barracks:'hitRecoil',
  vanguard:'hitRecoil',rearguard:'hitRecoil',
};

const ROLE_PROJ_COLORS = {
  boss:['#ff4444','#ff2200'],commander:['#ff8833','#ff5500'],officer:['#ffcc44','#ff9900'],
  shield:['#44cc77','#22aa55'],striker:['#ff55aa','#ff2288'],scout:['#5599ff','#3377dd'],
  ranger:['#aa55ff','#8833dd'],artillery:['#cccc44','#aaaa00'],engineer:['#44cccc','#22aaaa'],
  fortress:['#aaaaaa','#888888'],squad:['#88cc44','#66aa22'],infantry:['#8888bb','#6666aa'],
  civilian:['#888888','#666666'],messenger:['#666666','#444444'],barracks:['#9977bb','#7755aa'],
  vanguard:['#99bb44','#77aa22'],rearguard:['#bb9944','#aa7722'],
};

function pickDeath(role) {
  const pool = ROLE_DEATHS[role] || DEFAULT_DEATHS;
  return pool[Math.floor(Math.random() * pool.length)];
}

function applyDeathAnimation(card, unit) {
  if (!card) return;
  const death = pickDeath(unit.role);
  card.style.setProperty('--death-anim', death.a);
  card.style.setProperty('--death-dur', death.d + 's');
  if (death.a === 'launch') {
    const dir = unit.side === 1 ? -1 : 1;
    card.style.setProperty('--launch-x', (dir * randInt(30, 50)) + 'px');
    card.style.setProperty('--launch-rot', (dir * randInt(10, 25)) + 'deg');
  }
  card.classList.add('dying');
  setTimeout(() => card.remove(), Math.round(death.d * 1000) + 100);
}

function getAttackAnim(role) { return ROLE_ATTACKS[role] || 'atkLunge'; }
function getHitAnim(role) { return ROLE_HITS[role] || 'hitShake'; }

function getProjColor(role) {
  const colors = ROLE_PROJ_COLORS[role] || ['#ff6600','#ff4400'];
  return colors;
}

// ── Collision Animation Helpers ──
function getCollisionLayer() { return document.getElementById('collision-layer'); }

function getCardCenter(card) {
  const layer = getCollisionLayer();
  if (!card || !layer) return null;
  const cr = card.getBoundingClientRect();
  const lr = layer.getBoundingClientRect();
  return { x: cr.left - lr.left + cr.width / 2, y: cr.top - lr.top + cr.height / 2 };
}

function fireProjectile(fromCard, toCard, isCrit, role) {
  const layer = getCollisionLayer();
  if (!layer || !fromCard || !toCard) return;
  const from = getCardCenter(fromCard);
  const to = getCardCenter(toCard);
  if (!from || !to) return;
  const dx = to.x - from.x, dy = to.y - from.y;
  const dur = 150;
  const sz = isCrit ? 10 : 6;
  const colors = getProjColor(role);

  const proj = document.createElement('div');
  proj.className = 'projectile' + (isCrit ? ' crit-bolt' : '');
  proj.style.left = (from.x - sz / 2) + 'px';
  proj.style.top = (from.y - sz / 2) + 'px';
  proj.style.background = isCrit ? 'var(--gold)' : colors[0];
  proj.style.boxShadow = isCrit
    ? `0 0 14px var(--gold),0 0 24px var(--gold),0 0 6px #fff`
    : `0 0 8px ${colors[0]},0 0 16px ${colors[1]},0 0 4px #fff`;
  layer.appendChild(proj);
  proj.animate([
    { transform: 'translate(0,0) scale(1)', opacity: 1 },
    { transform: `translate(${dx}px,${dy}px) scale(${isCrit ? 1.5 : 1})`, opacity: 0.6 }
  ], { duration: dur, easing: 'ease-in', fill: 'forwards' });
  setTimeout(() => proj.remove(), dur + 50);

  for (let i = 0; i < 3; i++) {
    const t = document.createElement('div');
    t.className = 'projectile';
    t.style.left = (from.x - 2) + 'px';
    t.style.top = (from.y - 2) + 'px';
    t.style.width = (4 - i) + 'px';
    t.style.height = (4 - i) + 'px';
    t.style.background = colors[0];
    t.style.boxShadow = `0 0 6px ${colors[1]},0 0 3px #fff`;
    layer.appendChild(t);
    t.animate([
      { transform: 'translate(0,0)', opacity: 0.4 - i * 0.1 },
      { transform: `translate(${dx}px,${dy}px)`, opacity: 0 }
    ], { duration: dur, delay: (i + 1) * 20, easing: 'ease-in', fill: 'forwards' });
    setTimeout(() => t.remove(), dur + 120);
  }
}

function showImpact(targetCard, dmg, isCrit, attackerRole) {
  const layer = getCollisionLayer();
  if (!layer || !targetCard) return;
  const pos = getCardCenter(targetCard);
  if (!pos) return;
  const colors = getProjColor(attackerRole || 'infantry');

  const burst = document.createElement('div');
  burst.className = 'impact-burst' + (isCrit ? ' crit-burst' : '');
  burst.style.left = pos.x + 'px';
  burst.style.top = pos.y + 'px';
  if (!isCrit) burst.style.background = `radial-gradient(circle,rgba(255,200,100,0.9) 0%,${colors[1]}88 50%,transparent 70%)`;
  layer.appendChild(burst);
  setTimeout(() => burst.remove(), 350);

  const count = isCrit ? 12 : 6;
  for (let i = 0; i < count; i++) {
    const spark = document.createElement('div');
    spark.className = 'impact-spark';
    spark.style.left = (pos.x - 1.5) + 'px';
    spark.style.top = (pos.y - 1.5) + 'px';
    spark.style.background = isCrit ? 'var(--gold)' : colors[Math.floor(Math.random()*2)];
    spark.style.boxShadow = `0 0 4px ${colors[0]}`;
    const angle = (Math.PI * 2 / count) * i + Math.random() * 0.6;
    const dist = 15 + Math.random() * (isCrit ? 40 : 22);
    const sdx = Math.cos(angle) * dist;
    const sdy = Math.sin(angle) * dist;
    const sparkDur = 200 + Math.random() * 250;
    layer.appendChild(spark);
    spark.animate([
      { transform: 'translate(0,0) scale(1)', opacity: 1 },
      { transform: `translate(${sdx}px,${sdy}px) scale(0)`, opacity: 0 }
    ], { duration: sparkDur, fill: 'forwards' });
    setTimeout(() => spark.remove(), sparkDur + 50);
  }

  const num = document.createElement('div');
  num.className = 'dmg-number' + (isCrit ? ' crit-dmg' : '');
  num.textContent = (isCrit ? '\u2605' : '') + dmg;
  num.style.left = (pos.x + randInt(-8, 8)) + 'px';
  num.style.top = (pos.y - 10) + 'px';
  layer.appendChild(num);
  setTimeout(() => num.remove(), 850);
}

function shakeScreen() {
  const bf = document.querySelector('.battlefield');
  if (!bf) return;
  bf.classList.remove('screen-shake');
  void bf.offsetWidth;
  bf.classList.add('screen-shake');
  setTimeout(() => bf.classList.remove('screen-shake'), 300);
}

// ── Duel (with dodge, last stand, counter, crit resistance) ──
async function duel(unit1, unit2) {
  await sleep(randInt(0, 160));

  const card1 = getCard(unit1);
  const card2 = getCard(unit2);

  // Last Stand check (before damage calc)
  const lastStand1 = unit1.hp > 0 && (unit1.hp / unit1.maxHp) < 0.15;
  const lastStand2 = unit2.hp > 0 && (unit2.hp / unit2.maxHp) < 0.15;
  if (lastStand1 && card1 && !card1.classList.contains('last-stand')) {
    card1.classList.add('last-stand');
    syncPreviewLastStand(unit1, unit1.side);
  }
  if (lastStand2 && card2 && !card2.classList.contains('last-stand')) {
    card2.classList.add('last-stand');
    syncPreviewLastStand(unit2, unit2.side);
  }

  // Critical hit chance with crit resistance
  const critResist1 = unit1.a11yTier?.critResist || 0;
  const critResist2 = unit2.a11yTier?.critResist || 0;
  const crit1 = Math.random() < Math.max(0, 0.10 + unit1.streak * 0.05 + (unit1.level - 1) * 0.05 - critResist2);
  const crit2 = Math.random() < Math.max(0, 0.10 + unit2.streak * 0.05 + (unit2.level - 1) * 0.05 - critResist1);
  const critMult1 = crit1 ? 2.5 : 1;
  const critMult2 = crit2 ? 2.5 : 1;
  if (crit1) unit1.crits++;
  if (crit2) unit2.crits++;

  // Dodge check
  const dodge1 = unit1.a11yTier?.dodgeChance ? Math.random() < unit1.a11yTier.dodgeChance : false;
  const dodge2 = unit2.a11yTier?.dodgeChance ? Math.random() < unit2.a11yTier.dodgeChance : false;

  // Damage calculation with last stand multiplier
  const lastStandMult1 = lastStand1 ? 1.4 : 1;
  const lastStandMult2 = lastStand2 ? 1.4 : 1;
  let dmg1to2 = dodge2 ? 0 : Math.max(1, Math.round((unit1.atk * lastStandMult1 - unit2.def + randInt(-3, 5)) * critMult1));
  let dmg2to1 = dodge1 ? 0 : Math.max(1, Math.round((unit2.atk * lastStandMult2 - unit1.def + randInt(-3, 5)) * critMult2));

  // Highlight fighters
  if (card1) card1.classList.add('fighting');
  if (card2) card2.classList.add('fighting');
  syncPreviewFighting(unit1, unit1.side, true);
  syncPreviewFighting(unit2, unit2.side, true);

  // Attack animations
  const atkDur1 = (0.3 + Math.random() * 0.2).toFixed(2) + 's';
  const atkDur2 = (0.3 + Math.random() * 0.2).toFixed(2) + 's';
  const atkDist1 = randInt(16, 24) + 'px';
  const atkDist2 = randInt(16, 24) + 'px';

  if (card1) {
    card1.style.setProperty('--atk-dir', atkDist1);
    card1.style.setProperty('--atk-dur', atkDur1);
    card1.style.setProperty('--atk-anim', getAttackAnim(unit1.role));
    card1.classList.add('attacking');
  }
  if (card2) {
    card2.style.setProperty('--atk-dir', '-' + atkDist2);
    card2.style.setProperty('--atk-dur', atkDur2);
    card2.style.setProperty('--atk-anim', getAttackAnim(unit2.role));
    card2.classList.add('attacking');
  }
  syncPreviewAttack(unit1, unit1.side);
  syncPreviewAttack(unit2, unit2.side);

  // Initiative
  const initiativeGap = randInt(20, 70);
  if (Math.random() < 0.5) {
    fireProjectile(card1, card2, crit1, unit1.role);
    await sleep(initiativeGap);
    fireProjectile(card2, card1, crit2, unit2.role);
  } else {
    fireProjectile(card2, card1, crit2, unit2.role);
    await sleep(initiativeGap);
    fireProjectile(card1, card2, crit1, unit1.role);
  }

  await sleep(randInt(100, 160));

  // Apply damage
  unit2.hp -= dmg1to2;
  unit1.hp -= dmg2to1;

  // Dodge visuals
  if (dodge2) {
    if (card2) {
      card2.classList.remove('attacking');
      card2.classList.add('dodged');
      setTimeout(() => card2.classList.remove('dodged'), 300);
    }
    syncPreviewDodge(unit2, unit2.side);
    showDodgeText(card2);
  }
  if (dodge1) {
    if (card1) {
      card1.classList.remove('attacking');
      card1.classList.add('dodged');
      setTimeout(() => card1.classList.remove('dodged'), 300);
    }
    syncPreviewDodge(unit1, unit1.side);
    showDodgeText(card1);
  }

  // Impact effects for non-dodged attacks
  const impactGap = randInt(0, 40);
  if (!dodge2) {
    showImpact(card2, dmg1to2, crit1, unit1.role);
  }
  if (impactGap > 0) await sleep(impactGap);
  if (!dodge1) {
    showImpact(card1, dmg2to1, crit2, unit2.role);
  }
  if (crit1 || crit2) shakeScreen();

  // Hit reactions (skip for dodged attacks)
  if (!dodge2 && card2) {
    card2.classList.remove('attacking');
    card2.style.setProperty('--hit-anim', getHitAnim(unit2.role));
    card2.style.setProperty('--kb-x',(crit1?'-12':'-6')+'px');
    card2.style.setProperty('--kb-y',randInt(-3,3)+'px');
    card2.classList.add('hit');
  }
  if (!dodge1 && card1) {
    card1.classList.remove('attacking');
    card1.style.setProperty('--hit-anim', getHitAnim(unit1.role));
    card1.style.setProperty('--kb-x',(crit2?'12':'6')+'px');
    card1.style.setProperty('--kb-y',randInt(-3,3)+'px');
    card1.classList.add('hit');
  }

  // Preview recoil effects (replaces basic hit for non-dodged)
  if (!dodge2) {
    syncPreviewRecoil(unit2, unit2.side, crit1);
  }
  if (!dodge1) {
    syncPreviewRecoil(unit1, unit1.side, crit2);
  }

  // Build log line
  let log1 = dodge2
    ? `<span class="atk">&lt;${unit1.tag}&gt;${unit1.level>1?' Lv'+unit1.level:''}</span> attacks &lt;${unit2.tag}&gt; \u2014 <span style="color:var(--cyan);font-weight:bold">DODGE!</span>`
    : `<span class="atk">&lt;${unit1.tag}&gt;${unit1.level>1?' Lv'+unit1.level:''}${lastStand1?' \uD83D\uDD25':''}</span> hits <span class="atk">&lt;${unit2.tag}&gt;</span> for <span class="dmg">${dmg1to2}</span>${crit1?' <span class="ko">CRIT!</span>':''}`;
  let log2 = dodge1
    ? `<span class="atk">&lt;${unit2.tag}&gt;${unit2.level>1?' Lv'+unit2.level:''}</span> attacks &lt;${unit1.tag}&gt; \u2014 <span style="color:var(--cyan);font-weight:bold">DODGE!</span>`
    : `<span class="atk">&lt;${unit2.tag}&gt;${unit2.level>1?' Lv'+unit2.level:''}${lastStand2?' \uD83D\uDD25':''}</span> hits back for <span class="dmg">${dmg2to1}</span>${crit2?' <span class="ko">CRIT!</span>':''}`;
  logBattle(`${log1} | ${log2}`);

  await sleep(randInt(70, 130));
  if (card1) card1.classList.remove('fighting','hit','attacking');
  if (card2) card2.classList.remove('fighting','hit','attacking');
  syncPreviewFighting(unit1, unit1.side, false);
  syncPreviewFighting(unit2, unit2.side, false);

  // Check deaths, award XP, manage streaks
  if (unit2.hp <= 0) {
    unit2.alive = false; unit2.hp = 0; unit2.streak = 0;
    const xpGain = 10 + Math.round((unit2.maxHp + unit2.atk) * 0.15);
    unit1.kills++; unit1.streak++;
    const didLevel = awardXP(unit1, xpGain);
    applyStreakVisuals(unit1);
    syncPreviewStreak(unit1, unit1.side);
    let killMsg = `<span class="ko">&lt;${unit2.tag}&gt; [${unit2.role}] destroyed!</span>`;
    if (unit1.streak >= 3) killMsg += ` <span class="win">&lt;${unit1.tag}&gt; ${unit1.streak}-KILL STREAK!</span>`;
    if (didLevel) killMsg += ` <span class="win">&lt;${unit1.tag}&gt; leveled up to Lv${unit1.level}!</span>`;
    logBattle(killMsg);
    applyDeathAnimation(card2, unit2);
    syncPreviewDefeatEnhanced(unit2, unit2.side);
    applyMoraleBreak(unit2, unit2.side === 1 ? battleState.army1 : battleState.army2);
  } else {
    syncPreviewDamage(unit2, unit2.side);
    if (card2) card2.title = `${unit2.role.toUpperCase()} Lv${unit2.level} | HP:${unit2.hp}/${unit2.maxHp} ATK:${unit2.atk} DEF:${unit2.def} | Kills:${unit2.kills}`;
    // Last stand trigger after damage
    if (unit2.hp > 0 && (unit2.hp / unit2.maxHp) < 0.15 && card2 && !card2.classList.contains('last-stand')) {
      card2.classList.add('last-stand');
      syncPreviewLastStand(unit2, unit2.side);
      logBattle(`<span style="color:#ff4444;font-weight:bold">&lt;${unit2.tag}&gt; enters LAST STAND!</span>`);
    }
  }

  if (unit1.hp <= 0) {
    unit1.alive = false; unit1.hp = 0; unit1.streak = 0;
    const xpGain = 10 + Math.round((unit1.maxHp + unit1.atk) * 0.15);
    unit2.kills++; unit2.streak++;
    const didLevel = awardXP(unit2, xpGain);
    applyStreakVisuals(unit2);
    syncPreviewStreak(unit2, unit2.side);
    let killMsg = `<span class="ko">&lt;${unit1.tag}&gt; [${unit1.role}] destroyed!</span>`;
    if (unit2.streak >= 3) killMsg += ` <span class="win">&lt;${unit2.tag}&gt; ${unit2.streak}-KILL STREAK!</span>`;
    if (didLevel) killMsg += ` <span class="win">&lt;${unit2.tag}&gt; leveled up to Lv${unit2.level}!</span>`;
    logBattle(killMsg);
    applyDeathAnimation(card1, unit1);
    syncPreviewDefeatEnhanced(unit1, unit1.side);
    applyMoraleBreak(unit1, unit1.side === 1 ? battleState.army1 : battleState.army2);
  } else {
    syncPreviewDamage(unit1, unit1.side);
    if (card1) card1.title = `${unit1.role.toUpperCase()} Lv${unit1.level} | HP:${unit1.hp}/${unit1.maxHp} ATK:${unit1.atk} DEF:${unit1.def} | Kills:${unit1.kills}`;
    // Last stand trigger after damage
    if (unit1.hp > 0 && (unit1.hp / unit1.maxHp) < 0.15 && card1 && !card1.classList.contains('last-stand')) {
      card1.classList.add('last-stand');
      syncPreviewLastStand(unit1, unit1.side);
      logBattle(`<span style="color:#ff4444;font-weight:bold">&lt;${unit1.tag}&gt; enters LAST STAND!</span>`);
    }
  }

  // Counterattack phase
  if (unit2.alive && unit2.hp > 0 && unit1.alive && (unit2.role === 'striker' || unit2.role === 'vanguard') && Math.random() < 0.15) {
    const counterDmg = Math.max(1, Math.round(unit2.atk * 0.5));
    unit1.hp -= counterDmg;
    if (card2) {
      card2.classList.add('countering');
      setTimeout(() => card2.classList.remove('countering'), 300);
    }
    syncPreviewCounter(unit2, unit2.side);
    showCounterText(card1, counterDmg);
    logBattle(`<span style="color:var(--gold);font-weight:bold">&lt;${unit2.tag}&gt; COUNTERS for ${counterDmg}!</span>`);
    if (unit1.hp <= 0 && unit1.alive) {
      unit1.alive = false; unit1.hp = 0; unit1.streak = 0;
      unit2.kills++; unit2.streak++;
      awardXP(unit2, 10);
      applyStreakVisuals(unit2);
      syncPreviewStreak(unit2, unit2.side);
      logBattle(`<span class="ko">&lt;${unit1.tag}&gt; slain by counter!</span>`);
      applyDeathAnimation(card1, unit1);
      syncPreviewDefeatEnhanced(unit1, unit1.side);
      applyMoraleBreak(unit1, unit1.side === 1 ? battleState.army1 : battleState.army2);
    }
  }

  if (unit1.alive && unit1.hp > 0 && unit2.alive && (unit1.role === 'striker' || unit1.role === 'vanguard') && Math.random() < 0.15) {
    const counterDmg = Math.max(1, Math.round(unit1.atk * 0.5));
    unit2.hp -= counterDmg;
    if (card1) {
      card1.classList.add('countering');
      setTimeout(() => card1.classList.remove('countering'), 300);
    }
    syncPreviewCounter(unit1, unit1.side);
    showCounterText(card2, counterDmg);
    logBattle(`<span style="color:var(--gold);font-weight:bold">&lt;${unit1.tag}&gt; COUNTERS for ${counterDmg}!</span>`);
    if (unit2.hp <= 0 && unit2.alive) {
      unit2.alive = false; unit2.hp = 0; unit2.streak = 0;
      unit1.kills++; unit1.streak++;
      awardXP(unit1, 10);
      applyStreakVisuals(unit1);
      syncPreviewStreak(unit1, unit1.side);
      logBattle(`<span class="ko">&lt;${unit2.tag}&gt; slain by counter!</span>`);
      applyDeathAnimation(card2, unit2);
      syncPreviewDefeatEnhanced(unit2, unit2.side);
      applyMoraleBreak(unit2, unit2.side === 1 ? battleState.army1 : battleState.army2);
    }
  }

  await sleep(randInt(10, 35));
}

function getCard(unit) {
  return document.querySelector(`.el-card[data-uid="${unit.id}"]`);
}

function updateHpBar(cur, total, barId, valId) {
  const pct = Math.max(0, Math.round((cur / total) * 100));
  $(barId).style.width = pct + '%';
  $(valId).textContent = pct + '%';
  const bar = $(barId).parentElement;
  if (bar) bar.setAttribute('aria-valuenow', pct);
}

function logBattle(html) {
  const log = $('battle-log');
  const entry = document.createElement('div');
  entry.className = 'log-entry';
  entry.innerHTML = html;
  log.appendChild(entry);
  log.scrollTop = log.scrollHeight;
}

// ── Aftermath ──
async function showAftermath() {
  const {army1, army2, url1, url2, totalRounds} = battleState;
  const alive1 = army1.filter(u => u.alive);
  const alive2 = army2.filter(u => u.alive);
  const winner = alive1.length > 0 ? 1 : 2;
  const winnerUrl = winner === 1 ? url1 : url2;
  const winnerAlive = winner === 1 ? alive1 : alive2;
  const loserAlive = winner === 1 ? alive2 : alive1;

  $('round-info').textContent = 'Battle Complete';
  $('arena').classList.add('battle-over');

  document.querySelector('.battlefield').classList.add('war-torn');
  const survivors = document.querySelectorAll('.el-card');
  survivors.forEach(card => {
    const uid = card.dataset.uid;
    const unit = [...army1, ...army2].find(u => u.id === uid);
    if (!unit || !unit.alive) return;
    card.classList.add('survivor');
    const hpPct = unit.hp / unit.maxHp;
    card.style.setProperty('--crack-angle', randInt(45, 170) + 'deg');
    if (hpPct < 0.25) {
      card.classList.add('barely-alive');
      card.style.setProperty('--base-opacity', '0.4');
      card.style.setProperty('--hang-base', `rotate(${randInt(-6,6)}deg)`);
      card.style.transform = `rotate(${randInt(-5,5)}deg) translateY(${randInt(-3,5)}px)`;
    } else if (hpPct < 0.6) {
      card.classList.add('damaged');
      card.style.transform = `rotate(${randInt(-3,3)}deg)`;
      card.style.setProperty('--base-opacity', '0.65');
    }
  });

  const bf = document.querySelector('.battlefield');
  for (let i = 0; i < 25; i++) addSmokeParticle(bf);
  for (let i = 0; i < 15; i++) addEmber(bf);

  syncPreviewWarTorn(army1, 1);
  syncPreviewWarTorn(army2, 2);
  $('preview-view').classList.add('war-torn');

  addPreviewSmoke('smoke-overlay-1');
  addPreviewSmoke('smoke-overlay-2');

  await sleep(800);
  if (currentView === 'cards') switchView('split');

  await sleep(600);

  $('victory-title').textContent = winner === 1 ? 'Challenger 1 Wins!' : 'Challenger 2 Wins!';
  $('winner-url').textContent = winnerUrl;
  const mvp = findMVP(winnerAlive);
  const topKiller = [...winnerAlive].sort((a,b)=>b.kills-a.kills)[0];
  const highestLvl = [...winnerAlive].sort((a,b)=>b.level-a.level)[0];

  // Include a11y tier in victory stats
  const winnerA11y = winner === 1 ? battleState.a11y1 : battleState.a11y2;
  const a11yLine = winnerA11y.tier ? `<br>A11y Tier: ${winnerA11y.tier.name} (${winnerA11y.count} practices)` : '';

  $('victory-stats').innerHTML = `
    Rounds fought: ${totalRounds}<br>
    Survivors: ${winnerAlive.length} elements<br>
    Total destroyed: ${army1.length + army2.length - winnerAlive.length - loserAlive.length} elements<br>
    MVP: &lt;${mvp.tag}&gt; (${mvp.role}) \u2014 Lv${mvp.level}, ${mvp.kills} kills<br>
    Top Killer: &lt;${topKiller.tag}&gt; \u2014 ${topKiller.kills} kills, ${topKiller.crits} crits<br>
    Highest Level: &lt;${highestLvl.tag}&gt; \u2014 Lv${highestLvl.level}${a11yLine}
  `;
  $('victory-banner').classList.add('visible');
  // Focus the battle-again button for keyboard users
  const againBtn = $('victory-banner').querySelector('button');
  if (againBtn) setTimeout(() => againBtn.focus(), 700);
}

function findMVP(alive) {
  if (alive.length === 0) return {tag:'none', role:'none', level:0, kills:0, crits:0};
  return alive.reduce((best, u) => (u.hp > best.hp ? u : best), alive[0]);
}

function addSmokeParticle(container) {
  const p = document.createElement('div');
  p.className = 'smoke-particle';
  p.style.left = randInt(5, 95) + '%';
  p.style.bottom = randInt(0, 30) + '%';
  p.style.setProperty('--smoke-dur', (3 + Math.random() * 4) + 's');
  p.style.setProperty('--smoke-delay', (Math.random() * 3) + 's');
  p.style.setProperty('--smoke-dx', randInt(-20, 20) + 'px');
  p.style.width = randInt(3, 8) + 'px';
  p.style.height = p.style.width;
  container.appendChild(p);
}

function addEmber(container) {
  const e = document.createElement('div');
  e.className = 'ember';
  e.style.left = randInt(10, 90) + '%';
  e.style.bottom = randInt(5, 40) + '%';
  e.style.setProperty('--ember-dur', (2 + Math.random() * 3) + 's');
  e.style.setProperty('--ember-delay', (Math.random() * 4) + 's');
  e.style.setProperty('--ember-dx', randInt(-30, 30) + 'px');
  e.style.setProperty('--ember-dy', randInt(-60, -100) + 'px');
  container.appendChild(e);
}

function addPreviewSmoke(overlayId) {
  const container = $(overlayId);
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('div');
    p.className = 'smoke-particle';
    p.style.left = randInt(5, 95) + '%';
    p.style.bottom = randInt(0, 50) + '%';
    p.style.setProperty('--smoke-dur', (4 + Math.random() * 5) + 's');
    p.style.setProperty('--smoke-delay', (Math.random() * 4) + 's');
    p.style.setProperty('--smoke-dx', randInt(-30, 30) + 'px');
    p.style.width = randInt(6, 14) + 'px';
    p.style.height = p.style.width;
    container.appendChild(p);
  }
  for (let i = 0; i < 10; i++) {
    const e = document.createElement('div');
    e.className = 'ember';
    e.style.left = randInt(10, 90) + '%';
    e.style.bottom = randInt(5, 60) + '%';
    e.style.setProperty('--ember-dur', (2.5 + Math.random() * 3) + 's');
    e.style.setProperty('--ember-delay', (Math.random() * 5) + 's');
    e.style.setProperty('--ember-dx', randInt(-40, 40) + 'px');
    e.style.setProperty('--ember-dy', randInt(-80, -140) + 'px');
    container.appendChild(e);
  }
}

// ── Fullscreen Expand ──
function expandPanel(panelId) {
  if (!battleState || !document.querySelector('#arena').classList.contains('battle-over')) return;

  const viewer = $('fullscreen-viewer');
  const body = $('fs-body');
  const title = $('fs-title');
  body.innerHTML = '';

  if (panelId === 'cards-left' || panelId === 'cards-right') {
    const side = panelId === 'cards-left' ? 1 : 2;
    const army = side === 1 ? battleState.army1 : battleState.army2;
    const url = side === 1 ? battleState.url1 : battleState.url2;
    title.textContent = `${url} \u2014 Battle Cards (${army.filter(u=>u.alive).length} survivors)`;

    const container = document.createElement('div');
    container.className = 'fs-cards war-torn';
    const sourceArmy = side === 1 ? $('army-left') : $('army-right');
    sourceArmy.querySelectorAll('.el-card').forEach(card => {
      container.appendChild(card.cloneNode(true));
    });
    body.appendChild(container);
  }
  else if (panelId === 'preview-1' || panelId === 'preview-2') {
    const side = panelId === 'preview-1' ? 1 : 2;
    const url = side === 1 ? battleState.url1 : battleState.url2;
    const sourceFrame = side === 1 ? $('preview-frame-1') : $('preview-frame-2');
    title.textContent = `${url} \u2014 War-torn Preview`;

    const iframe = document.createElement('iframe');
    iframe.sandbox = 'allow-same-origin';
    iframe.srcdoc = sourceFrame.srcdoc;
    body.appendChild(iframe);

    iframe.onload = () => {
      try {
        const srcDoc = sourceFrame.contentDocument;
        const dstDoc = iframe.contentDocument;
        if (!srcDoc || !dstDoc) return;
        srcDoc.querySelectorAll('[data-arena-id]').forEach(srcEl => {
          const id = srcEl.getAttribute('data-arena-id');
          const dstEl = dstDoc.querySelector(`[data-arena-id="${id}"]`);
          if (dstEl) {
            dstEl.className = srcEl.className;
            dstEl.style.cssText = srcEl.style.cssText;
          }
        });
        if (srcDoc.body) {
          dstDoc.body.className = srcDoc.body.className;
        }
      } catch(e) {}
    };

    const vig = document.createElement('div');
    vig.className = 'vignette';
    body.appendChild(vig);
    const smoke = document.createElement('div');
    smoke.className = 'fs-smoke';
    body.appendChild(smoke);
    addPreviewSmoke_to(smoke);
  }

  viewer.classList.add('visible');
  $('victory-banner').style.display = 'none';
  // Focus the close button for keyboard accessibility
  const closeBtn = viewer.querySelector('.fs-close');
  if (closeBtn) closeBtn.focus();
}

function addPreviewSmoke_to(container) {
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.className = 'smoke-particle';
    p.style.left = randInt(5, 95) + '%';
    p.style.bottom = randInt(0, 50) + '%';
    p.style.setProperty('--smoke-dur', (4 + Math.random() * 5) + 's');
    p.style.setProperty('--smoke-delay', (Math.random() * 4) + 's');
    p.style.setProperty('--smoke-dx', randInt(-30, 30) + 'px');
    p.style.width = randInt(6, 14) + 'px';
    p.style.height = p.style.width;
    container.appendChild(p);
  }
  for (let i = 0; i < 12; i++) {
    const e = document.createElement('div');
    e.className = 'ember';
    e.style.left = randInt(10, 90) + '%';
    e.style.bottom = randInt(5, 60) + '%';
    e.style.setProperty('--ember-dur', (2.5 + Math.random() * 3) + 's');
    e.style.setProperty('--ember-delay', (Math.random() * 5) + 's');
    e.style.setProperty('--ember-dx', randInt(-40, 40) + 'px');
    e.style.setProperty('--ember-dy', randInt(-80, -140) + 'px');
    container.appendChild(e);
  }
}

function closeFullscreen() {
  $('fullscreen-viewer').classList.remove('visible');
  $('fs-body').innerHTML = '';
  $('victory-banner').style.display = '';
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && $('fullscreen-viewer').classList.contains('visible')) {
    closeFullscreen();
  }
});

// Enter key on URL inputs triggers battle
document.addEventListener('DOMContentLoaded', () => {
  const url1 = $('url1');
  const url2 = $('url2');
  if (url1) url1.addEventListener('keydown', e => { if (e.key === 'Enter') startBattle(); });
  if (url2) url2.addEventListener('keydown', e => { if (e.key === 'Enter') startBattle(); });
});

// ── Utilities ──
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function randInt(a,b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}
