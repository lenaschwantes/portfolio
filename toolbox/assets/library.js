// toolbox — biblioteca: ferramentas (FMHY) e repos (GitHub Trending) nas mesmas categorias,
// em blocos próprios dentro de cada uma. TOOLS vem de tools.js e REPOS de data.js.
(() => {
  const { $, esc, safeUrl, toast, copy, icon } = TB;
  const { t, cat: catName, sec: secName, num } = I18N;
  const pickT = () => t('stamp');

  // ── categorias ─────────────────────────────────────────────────────────────
  const CATS = ['AI', 'Developer', 'Game dev', 'Internet & Search', 'Privacy & Security', 'Files & PDF', 'Text & Writing',
    'Image & Design', 'Video', 'Audio', 'Social Media', 'System', 'Linux & macOS', 'Mobile', 'Learning', 'Business', 'Useful Sites'];
  // categoria do repo (pipeline) → categoria comum
  const REPO_CAT = {
    'Claude Skills': 'AI', 'Agentic AI': 'AI', 'LLMs & Models': 'AI', 'Image & Video': 'Image & Design',
    'Games & Creative': 'Image & Design', 'Audio & Voice': 'Audio', 'Security': 'Privacy & Security',
    'Learning': 'Learning', 'Self-hosted': 'System', 'Data & Analytics': 'Developer', 'Web & APIs': 'Developer',
    'DevTools': 'Developer', 'Automation & Bots': 'Developer', 'Other': 'Developer',
  };
  // repos de engine/framework de jogo vão para "Game dev" (o pipeline mistura com arte e gráficos em "Games & Creative")
  const GAMEDEV = /game ?engine|\bgodot\b|\bunity\b|\bunreal engine\b|\bbevy\b|\bphaser\b|\bpygame\b|\braylib\b|\blove2d\b|\bdefold\b|\blibgdx\b|\bmonogame\b|rpg ?maker|game framework|game development|\b(2d|3d|html5|browser|multiplayer|indie|pixel)\b.{0,25}\bgames?\b.{0,15}\b(engine|framework|library|toolkit|maker|editor|template|sdk)\b|\bgames?\b.{0,12}\b(engine|framework|sdk|toolkit|maker)\b/i;
  const repoCat = r => GAMEDEV.test(r.name + ' ' + (r.desc || '')) && !/comfyui|\becs\b/i.test(r.name + ' ' + (r.desc || '')) ? 'Game dev' : (REPO_CAT[r.category] || 'Developer');
  const COMMERCIAL = new Set(['MIT', 'Apache-2.0', 'BSD-3-Clause', 'BSD-2-Clause', 'ISC', '0BSD', 'Unlicense', 'CC0-1.0', 'Zlib', 'BSL-1.0', 'MIT-0']);
  const DAY = 864e5, NOW = Date.now(), CHUNK = 48;
  const ageDays = d => d ? Math.floor((NOW - Date.parse(d)) / DAY) : Infinity;
  const fmtK = n => n == null ? '—' : n >= 1e4 ? Math.round(n / 1e3) + 'k' : n >= 1e3 ? (n / 1e3).toFixed(1) + 'k' : String(n);
  const ago = d => { const n = ageDays(d); return n === Infinity ? '—' : n < 1 ? t('ago.today') : n < 30 ? t('ago.d', { n }) : n < 365 ? t('ago.mo', { n: Math.floor(n / 30) }) : t('ago.y', { n: (n / 365).toFixed(1) }); };
  const health = r => r.archived ? ['', t('h.archived')] : ageDays(r.pushed) <= 90 ? ['ok', t('h.active')] : ageDays(r.pushed) <= 365 ? ['warn', t('h.slowing')] : ['', t('h.inactive')];

  // ── cadastro: quem exige conta nova perde prioridade; conta de outro serviço (Google, Meta…) não conta ──
  const LINKED = /google|meta|facebook|discord|github|microsoft|apple|telegram|steam|reddit|twitter|\bx for\b/i;
  const NEEDS_ACCOUNT = /^(requires? )?sign-?up( required)?$|^signup required$|^account required$|phone #|^paid$|^limited registration$|sign-?up\s*\+/i;
  const NO_ACCOUNT = /^no sign-?up$|^no signup$/i;
  function accountPenalty(tags) {
    if (tags.some(g => NO_ACCOUNT.test(g.trim()))) return 5;                       // sem cadastro: leve empurrão
    if (tags.some(g => NEEDS_ACCOUNT.test(g.trim()) && !LINKED.test(g))) return -35;  // conta nova: desce
    return 0;                                                                         // conta de outro serviço ou opcional
  }

  const MINE_REPOS = new Set((TOOLS_META.mineRepos || []).map(n => n.toLowerCase()));

  // ── dados unificados ───────────────────────────────────────────────────────
  const ITEMS = [];
  TOOLS.forEach((t, i) => ITEMS.push({
    kind: 't', id: 't:' + t.url.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/+$/, '') + '#' + t.section,
    name: t.name, url: t.url, desc: t.desc || t.sub || t.section, tags: t.tags || [], links: t.links || [],
    cat: t.cat, section: t.section, sub: t.sub || '', pick: !!t.pick, starred: !!t.starred, mine: !!t.mine, ord: i,
    alt: t.alt || [], oss: !!t.oss, stars: t.stars, kw: t.kw || [],
    // open source do OpenAlternative: dá pra usar sem conta (ou hospedar), leva o mesmo empurrão de "No Sign-Up"
    score: (t.mine ? 60 : 0) + (t.pick ? 30 : 0) + (t.starred ? 20 : 0) + (t.oss ? 5 : accountPenalty(t.tags || [])),
  }));
  REPOS.forEach((r, i) => ITEMS.push({
    kind: 'r', id: 'r:' + r.name, name: r.name, url: r.url || 'https://github.com/' + r.name, desc: r.desc || '', tags: [],
    cat: repoCat(r), section: r.category || 'Other', sub: '',
    lang: r.lang, stars: r.stars, days: r.days || 0, rating: r.rating, license: r.license, pushed: r.pushed,
    archived: !!r.archived, last_seen: r.last_seen, ord: 100000 + i, mine: MINE_REPOS.has(r.name.toLowerCase()),
    score: (MINE_REPOS.has(r.name.toLowerCase()) ? 60 : 0) + ({ High: 15, Medium: 8 }[r.rating] || 0) + Math.min(r.days || 0, 300) / 30 - (r.archived ? 50 : 0),
  }));
  ITEMS.forEach(x => { x.hay = (x.name + ' ' + x.desc + ' ' + x.tags.join(' ') + ' ' + x.section + ' ' + x.sub + ' ' + (x.lang || '') + ' ' + (x.alt || []).join(' ') + ' ' + (x.kw || []).join(' ')).toLowerCase(); });
  const BY_ID = new Map(ITEMS.map(x => [x.id, x]));
  const nT = TOOLS.length, nR = REPOS.length;

  // ── salvos (migra as listas antigas de favoritos) ──────────────────────────
  const KEY = 'toolbox.saved';
  let saved = new Set();
  try {
    saved = new Set(JSON.parse(localStorage.getItem(KEY) || 'null') || [
      ...JSON.parse(localStorage.getItem('toolFavs') || '[]').map(id => 't:' + id),
      ...JSON.parse(localStorage.getItem('favs') || '[]').map(n => 'r:' + n),
    ]);
  } catch {}
  const persist = () => { try { localStorage.setItem(KEY, JSON.stringify([...saved])); } catch {} $('savedN').textContent = saved.size; };

  // ── estado (espelhado na URL) ──────────────────────────────────────────────
  const S = { q: '', type: 'all', cat: '', sec: '', sub: '', sort: 'rec', pick: false, fav: false, lang: '', lic: '', st: '', open: null, list: null };
  // lista compartilhada: os ids vão no próprio link (?list=), em base64url, sem servidor nem conta
  const encList = ids => btoa(String.fromCharCode(...new TextEncoder().encode(ids.join('\n')))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const decList = s => { try { return new TextDecoder().decode(Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0))).split('\n').filter(id => BY_ID.has(id)); } catch { return null; } };
  let LIST = new Set();
  function readURL() {
    const p = new URLSearchParams(location.search);
    S.q = p.get('q') || ''; S.type = ['tools', 'repos'].includes(p.get('type')) ? p.get('type') : 'all';
    S.cat = CATS.includes(p.get('cat')) ? p.get('cat') : '';
    [S.sec, S.sub = ''] = (p.get('sec') || '').split(' › '); if (p.get('sub')) S.sub = p.get('sub');
    S.sort = ['rec', 'name', 'stars', 'recent'].includes(p.get('sort')) ? p.get('sort') : 'rec';
    S.pick = p.get('pick') === '1'; S.fav = p.get('fav') === '1';
    S.list = p.get('list') ? decList(p.get('list')) : null; LIST = new Set(S.list || []);
    S.lang = p.get('lang') || ''; S.lic = p.get('lic') || ''; S.st = p.get('st') || p.get('status') || '';
    const open = p.get('open') || (p.get('tool') && 't:' + p.get('tool')) || (p.get('repo') && 'r:' + p.get('repo'));
    S.open = BY_ID.has(open) ? open : null;
    if (p.get('repo') && S.type === 'all') S.type = 'repos';
  }
  function writeURL(replace) {
    const p = new URLSearchParams();
    if (S.q) p.set('q', S.q); if (S.type !== 'all') p.set('type', S.type); if (S.cat) p.set('cat', S.cat);
    if (S.sec) p.set('sec', S.sec); if (S.sub) p.set('sub', S.sub); if (S.sort !== 'rec') p.set('sort', S.sort);
    if (S.pick) p.set('pick', '1'); if (S.fav) p.set('fav', '1'); if (S.list) p.set('list', encList(S.list));
    if (S.lang) p.set('lang', S.lang); if (S.lic) p.set('lic', S.lic); if (S.st) p.set('st', S.st);
    if (S.open) p.set('open', S.open);
    if (I18N.lang !== 'en') p.set('l', I18N.lang);   // link compartilhado abre no mesmo idioma
    const url = p.toString() ? `?${p}` : location.pathname;
    replace ? history.replaceState(null, '', url) : history.pushState(null, '', url);
  }

  // ── filtro e ordem ─────────────────────────────────────────────────────────
  let words = [], HL = null;
  const repoFilters = () => S.lang || S.lic || S.st;
  const browsing = () => !S.q && !S.cat && !S.pick && !S.fav && !S.list && S.type === 'all' && !repoFilters();
  function matches(x, ignoreType) {
    if (!ignoreType && S.type === 'tools' && x.kind !== 't') return false;
    if (!ignoreType && S.type === 'repos' && x.kind !== 'r') return false;
    if (S.cat && x.cat !== S.cat) return false;
    if (S.sec && x.section !== S.sec) return false;
    if (S.sub && x.sub !== S.sub) return false;
    if (S.pick && !(x.mine || x.pick || (x.kind === 'r' && x.rating === 'High'))) return false;
    if (S.fav && !saved.has(x.id)) return false;
    if (S.list && !LIST.has(x.id)) return false;
    if (x.kind === 'r') {
      if (S.lang && x.lang !== S.lang) return false;
      if (S.lic === 'commercial' && !COMMERCIAL.has(x.license)) return false;
      if (S.st === 'alive' && x.archived) return false;
      if (S.st === 'active' && (x.archived || ageDays(x.pushed) > 90)) return false;
    } else if (repoFilters() && S.type === 'repos') return false;
    return words.every(w => x.hay.includes(w));
  }
  function order(list) {
    // nome bate: topo; busca pelo app pago que a ferramenta substitui ("photoshop" → GIMP): logo abaixo
    const nameHit = x => !words.length ? 0 : words.every(w => x.name.toLowerCase().includes(w)) ? 100
      : x.alt?.length && words.every(w => x.alt.join(' ').toLowerCase().includes(w)) ? 90 : 0;
    const by = {
      rec: (a, b) => (nameHit(b) + b.score) - (nameHit(a) + a.score) || a.ord - b.ord,
      name: (a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
      stars: (a, b) => (b.stars ?? -1) - (a.stars ?? -1) || (nameHit(b) + b.score) - (nameHit(a) + a.score),
      recent: (a, b) => (b.pushed || '').localeCompare(a.pushed || '') || (nameHit(b) + b.score) - (nameHit(a) + a.score),
    }[S.sort];
    return list.sort(by);
  }
  const hl = s => { const e = esc(s); return HL ? e.replace(HL, m => `<mark>${m}</mark>`) : e; };

  // ── cartões ────────────────────────────────────────────────────────────────
  const saveBtn = x => `<button class="save" data-save="${esc(x.id)}" aria-pressed="${saved.has(x.id)}" aria-label="${saved.has(x.id) ? t('card.unsave') : t('card.save')} ${esc(x.name)}">${saved.has(x.id) ? '★' : '☆'}</button>`;
  const avatar = (name, size) => `<span class="ico avatar" style="width:${size}px;height:${size}px"><img src="https://github.com/${esc(name.split('/')[0])}.png?size=${size * 2}" alt="" loading="lazy" width="${size}" height="${size}"></span>`;
  function card(x) {
    if (x.kind === 't') {
      return `<article class="card t${x.id === S.open ? ' sel' : ''}" data-open="${esc(x.id)}">
        <div class="c-top">${icon(x.url, x.name, 28)}<span class="c-kind kind">${t('card.tool')} · ${esc(x.sub || secName(x.section))}</span>${saveBtn(x)}</div>
        ${x.pick ? `<span class="stamp">${pickT()}</span>` : ''}
        <h3 class="c-name"><a href="${esc(safeUrl(x.url))}" target="_blank" rel="noopener">${hl(x.name)}</a></h3>
        <p class="c-desc">${hl(x.desc)}</p>
        <div class="c-meta">${x.mine ? `<span class="mine">${t('card.mine')}</span>` : ''}${x.starred ? `<span>${t('card.fmhy')}</span>` : ''}${x.alt.length ? `<span class="alt">${t('card.alt', { x: x.alt.slice(0, 2).map(hl).join(', ') })}</span>` : ''}${x.tags.slice(0, x.alt.length ? 1 : 2).map(t => `<span>${hl(t)}</span>`).join('')}</div>
        <button class="c-hit" data-open="${esc(x.id)}" aria-label="${t('card.open')} ${esc(x.name)}"></button>
      </article>`;
    }
    const [h, hlabel] = health(x), [owner, repo] = x.name.split('/');
    return `<article class="card r${x.archived ? ' dim' : ''}${x.id === S.open ? ' sel' : ''}" data-open="${esc(x.id)}">
      <div class="c-top">${avatar(x.name, 28)}<span class="c-kind kind r">${t('card.repo')} · ${esc(x.lang === 'Javascript' ? 'JavaScript' : x.lang)} · ${esc(secName(x.section))}</span>${saveBtn(x)}</div>
      <h3 class="c-name"><a href="${esc(safeUrl(x.url))}" target="_blank" rel="noopener"><span style="color:var(--muted);font-weight:400">${hl(owner)}/</span>${hl(repo)}</a></h3>
      <p class="c-desc">${hl(x.desc || t('card.noDesc'))}</p>
      <div class="c-meta">${x.mine ? `<span class="mine">${t('card.mine')}</span>` : ''}<span>★ ${fmtK(x.stars)}</span><span>${t('card.days', { n: x.days })}</span><span>${esc(x.license || t('card.noLic'))}</span><span><i class="dot ${h}"></i>${hlabel}</span></div>
      <button class="c-hit" data-open="${esc(x.id)}" aria-label="${t('card.open')} ${esc(x.name)}"></button>
    </article>`;
  }
  function repoRow(x, i) {
    const [owner, repo] = x.name.split('/');
    return `<li><div class="row" role="button" tabindex="0" data-open="${esc(x.id)}">
      <span class="rk">${String(i + 1).padStart(2, '0')}</span>${avatar(x.name, 28)}
      <span><span class="r-name"><small>${esc(owner)}/</small>${esc(repo)}</span>
      <span class="r-desc">${esc(x.desc || t('card.noDesc'))}</span>
      <span class="r-meta">★ ${fmtK(x.stars)} · ${t('card.days', { n: x.days })} · ${esc(x.lang === 'Javascript' ? 'JS' : x.lang)}</span></span></div></li>`;
  }

  // ── índice lateral ─────────────────────────────────────────────────────────
  function renderIndex() {
    const pool = ITEMS.filter(x => (S.type === 'all' || (S.type === 'tools') === (x.kind === 't')));
    const counts = {}; pool.forEach(x => counts[x.cat] = (counts[x.cat] || 0) + 1);
    $('index').innerHTML = `<h2>${t('idx.title')}</h2><ol>
      <li><button data-cat="" aria-current="${!S.cat}"><span class="no">00</span><span>${t('idx.all')}</span><span class="ct">${num(pool.length)}</span></button></li>` +
      CATS.filter(c => counts[c]).map((c, i) => `<li><button data-cat="${esc(c)}" aria-current="${S.cat === c}">
        <span class="no">${String(i + 1).padStart(2, '0')}</span><span>${esc(catName(c))}</span><span class="ct">${num(counts[c])}</span></button></li>`).join('') + '</ol>';
  }

  // ── modo navegar: um capítulo por categoria ────────────────────────────────
  // intervalo entre capítulos: os repos que ficaram mais tempo em alta, em lista tipográfica grande
  function hallOfFame() {
    const top = ITEMS.filter(x => x.kind === 'r').sort((a, b) => b.days - a.days).slice(0, 10);
    return `<section class="interlude" aria-labelledby="hof">
      <div class="il-head"><p class="mono">${t('hof.eyebrow')}</p>
        <h2 id="hof">${t('hof.title')}</h2>
        <p class="il-note">${t('hof.note', { n: top[0].days })}</p></div>
      <ol class="il-list">${top.map((x, i) => `<li><button data-open="${esc(x.id)}">
        <span class="il-rk">${String(i + 1).padStart(2, '0')}</span>
        <span class="il-name">${esc(x.name.split('/')[1])}<small>${esc(x.name.split('/')[0])}</small></span>
        <span class="il-days">${x.days}<small>${t('hof.days')}</small></span></button></li>`).join('')}</ol>
    </section>`;
  }
  function renderChapters() {
    $('main').innerHTML = CATS.map((c, i) => {
      const tools = ITEMS.filter(x => x.kind === 't' && x.cat === c);
      const repos = ITEMS.filter(x => x.kind === 'r' && x.cat === c && !x.archived);
      if (!tools.length && !repos.length) return '';
      const topT = order(tools.slice()).slice(0, 7);
      const topR = repos.slice().sort((a, b) => b.days - a.days || (b.stars || 0) - (a.stars || 0)).slice(0, 6);
      const secs = [...new Set(tools.map(x => x.section))].slice(0, 8);
      const nRepoAll = ITEMS.filter(x => x.kind === 'r' && x.cat === c).length;
      return `<section class="chapter" id="ch-${i + 1}">
        <div class="ch-head"><span class="ch-no">${String(i + 1).padStart(2, '0')}</span><h2>${esc(catName(c))}</h2>
          <span class="count">${num(tools.length)} ${t('ch.tools')}${nRepoAll ? ` · ${num(nRepoAll)} ${t('ch.repos')}` : ''}</span>
          ${secs.length ? `<div class="ch-secs">${secs.map(s => `<button data-cat="${esc(c)}" data-sec="${esc(s)}">${esc(secName(s))}</button>`).join('')}</div>` : ''}</div>
        <div class="${topR.length && topT.length ? 'ch-split' + (i % 2 ? ' flip' : '') : ''}">
          ${topT.length ? `<div><div class="block-h"><span class="kind">${t('blk.tools')}</span><button data-cat="${esc(c)}" data-type="tools">${t('blk.allTools', { n: num(tools.length) })}</button></div>
            <div class="grid">${topT.map(card).join('')}</div></div>` : ''}
          ${topR.length ? `<div><div class="block-h"><span class="kind r">${t('blk.repos')}</span><button data-cat="${esc(c)}" data-type="repos">${t('blk.allRepos', { n: num(nRepoAll) })}</button></div>
            <ol class="replist">${topR.map(repoRow).join('')}</ol></div>` : ''}
        </div></section>` + (i === 1 ? hallOfFame() : '');
    }).join('');
  }

  // ── modo explorar: filtros, seções e resultados ────────────────────────────
  let list = [], shown = 0;
  function sectionChips() {
    if (!S.cat) return '';
    const pool = ITEMS.filter(x => x.cat === S.cat && (S.type === 'all' || (S.type === 'tools') === (x.kind === 't')));
    const secs = new Map(); pool.forEach(x => secs.set(x.section, (secs.get(x.section) || 0) + 1));
    let html = `<div class="chips" role="group" aria-label="Section"><button class="chip" data-sec="" aria-pressed="${!S.sec}">${t('res.allSecs')}</button>` +
      [...secs].map(([s, n]) => `<button class="chip" data-sec="${esc(s)}" aria-pressed="${S.sec === s}">${esc(secName(s))}<span class="n">${n}</span></button>`).join('') + '</div>';
    if (S.sec) {
      const subs = new Map(); pool.filter(x => x.section === S.sec && x.sub).forEach(x => subs.set(x.sub, (subs.get(x.sub) || 0) + 1));
      if (subs.size) html += `<div class="chips sub" role="group" aria-label="Subsection"><button class="chip" data-sub="" aria-pressed="${!S.sub}">${t('res.allSubs')}</button>` +
        [...subs].map(([s, n]) => `<button class="chip" data-sub="${esc(s)}" aria-pressed="${S.sub === s}">${esc(s)}<span class="n">${n}</span></button>`).join('') + '</div>';
    }
    return html;
  }
  function title() {
    if (S.list) return t('res.shared');
    if (S.fav) return t('res.saved');
    if (S.q) return `“${esc(S.q)}”`;
    if (S.cat) return esc(S.sub || (S.sec ? secName(S.sec) : catName(S.cat)));
    return S.type === 'tools' ? t('res.allTools') : S.type === 'repos' ? t('res.allRepos') : t('res.all');
  }
  function shareBar(list) {
    if (S.list) return list.length ? `<div class="share-bar"><span>${t('share.from', { n: num(list.length) })}</span>
      <button class="chip on" data-share="import">${t('share.import')}</button></div>` : '';
    if (!S.fav || !list.length) return '';
    return `<div class="share-bar" role="group" aria-label="${t('share.lead')}"><span>${t('share.lead')}</span>
      <button class="chip on" data-share="link">${t('share.link')}</button>
      <button class="chip" data-share="wa">WhatsApp</button>
      <button class="chip" data-share="mail">${t('share.mail')}</button>
      <button class="chip" data-share="text">${t('share.text')}</button>
      <button class="chip" data-share="md">${t('share.md')}</button></div>`;
  }
  function share(how) {
    if (how === 'import') {
      const before = saved.size; S.list.forEach(id => saved.add(id)); persist();
      toast(t('toast.imported', { n: num(saved.size - before) }));
      return update({ list: null, fav: true, open: null }, { top: true });
    }
    const items = order(ITEMS.filter(x => saved.has(x.id)));
    const link = location.origin + location.pathname + '?list=' + encList(items.map(x => x.id)) + (I18N.lang !== 'en' ? '&l=' + I18N.lang : '');
    const line = x => `- ${x.name} — ${x.url}`;
    // WhatsApp e e-mail têm limite de tamanho: mandam os 20 primeiros e o link com a lista inteira
    const short = () => [t('share.subject'), '', ...items.slice(0, 20).map(line), ...(items.length > 20 ? [t('share.more', { n: num(items.length - 20) })] : []), '', t('share.full') + ' ' + link].join('\n');
    if (how === 'link') {
      if (navigator.share && matchMedia('(pointer:coarse)').matches) return navigator.share({ title: t('share.subject'), url: link }).catch(() => {});
      return copy(link, t('toast.linkCopied'));
    }
    if (how === 'wa') return window.open('https://wa.me/?text=' + encodeURIComponent(short()), '_blank', 'noopener');
    if (how === 'mail') return void (location.href = 'mailto:?subject=' + encodeURIComponent(t('share.subject')) + '&body=' + encodeURIComponent(short()));
    if (how === 'text') return copy([t('share.subject'), '', ...items.map(line), '', t('share.full') + ' ' + link].join('\n'), t('toast.copied'));
    if (how === 'md') {
      const md = [`# ${t('share.subject')}`, '', ...items.map(x => `- [${x.name.replace(/[\[\]]/g, '')}](${x.url})${x.desc ? ' — ' + x.desc.replace(/\s+/g, ' ') : ''}`), '', `[${t('share.full')}](${link})`, ''].join('\n');
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([md], { type: 'text/markdown' })); a.download = 'toolbox-saved.md';
      document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    }
  }
  function renderExplore() {
    list = order(ITEMS.filter(x => matches(x)));
    const nt = list.filter(x => x.kind === 't').length, nr = list.length - nt;
    const osint = /Intelligence/.test(S.sec) || /\bosint\b/i.test(S.q);
    let html = `<div class="results-head"><h2>${title()}</h2>
      <span class="count">${S.type === 'all' ? t('res.count', { t: num(nt), r: num(nr) }) : num(list.length)}</span>
      <button class="link clear" data-clear>${t('res.clear')}</button></div>` + shareBar(list) + sectionChips() +
      (osint ? `<p class="note">${t('res.osint')}</p>` : '');
    if (!list.length) {
      html += `<div class="empty"><h3>${S.fav ? t('empty.saved') : t('empty.none')}</h3>
        <p>${S.fav ? t('empty.savedP') : t('empty.noneP')}</p>
        <button class="btn" data-clear>${t('res.clear')}</button></div>`;
      $('main').innerHTML = html; shown = 0; $('more').textContent = ''; return;
    }
    if (S.type === 'all') {
      // os dois tipos separados em grupos, cada um com atalho para ver tudo daquele tipo
      const T = list.filter(x => x.kind === 't'), R = list.filter(x => x.kind === 'r');
      html += `<div class="results">` +
        (T.length ? `<div class="group"><div class="block-h"><span class="kind">${t('grp.tools', { n: num(T.length) })}</span>${T.length > 12 ? `<button data-type="tools">${t('grp.allTools', { n: num(T.length) })}</button>` : ''}</div><div class="grid">${T.slice(0, 12).map(card).join('')}</div></div>` : '') +
        (R.length ? `<div class="group"><div class="block-h"><span class="kind r">${t('grp.repos', { n: num(R.length) })}</span>${R.length > 12 ? `<button data-type="repos">${t('grp.allRepos', { n: num(R.length) })}</button>` : ''}</div><div class="grid">${R.slice(0, 12).map(card).join('')}</div></div>` : '') + `</div>`;
      $('main').innerHTML = html; shown = list.length; $('more').textContent = '';
      return;
    }
    html += `<div class="results"><div class="grid" id="grid"></div></div>`;
    $('main').innerHTML = html; shown = 0; more();
  }
  function more() {
    const grid = $('grid'); if (!grid || shown >= list.length) return;
    const next = list.slice(shown, shown + CHUNK);
    grid.insertAdjacentHTML('beforeend', next.map(card).join(''));
    shown += next.length;
    $('more').textContent = shown < list.length ? t('more.some', { a: num(shown), b: num(list.length) }) : list.length > CHUNK ? t('more.all', { n: num(list.length) }) : '';
  }
  new IntersectionObserver(es => es.some(e => e.isIntersecting) && more(), { rootMargin: '800px' }).observe($('more'));

  // ── controles ──────────────────────────────────────────────────────────────
  function syncControls() {
    $('q').value = S.q; $('sort').value = S.sort; $('pick').checked = S.pick;
    $('lang').value = S.lang; $('lic').value = S.lic; $('st').value = S.st;
    document.querySelectorAll('#type button').forEach(b => b.setAttribute('aria-pressed', b.dataset.t === S.type));
    $('repoFilters').hidden = S.type !== 'repos';
    $('btnSaved').setAttribute('aria-pressed', S.fav);
    $('pickLabel').textContent = t(S.type === 'repos' ? 'pick.repos' : S.type === 'tools' ? 'pick.tools' : 'pick.all');
  }
  function render(opts = {}) {
    words = S.q.toLowerCase().split(/\s+/).filter(Boolean);
    const w = words.map(x => esc(x).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    HL = w.length ? new RegExp(w.join('|'), 'gi') : null;
    syncControls(); renderIndex();
    browsing() ? (renderChapters(), $('more').textContent = '') : renderExplore();
    syncDrawer();
    if (opts.top) TB.scrollTo($('library'), { immediate: TB.reduced });
  }
  const update = (patch, opts = {}) => { Object.assign(S, patch); writeURL(opts.replace); render(opts); };

  // ── painel de detalhes ─────────────────────────────────────────────────────
  let SIMILAR = null;
  async function similarFor(name) {
    if (!SIMILAR) {
      const r = await fetch('data/similar.json'); if (!r.ok) throw new Error(r.status);
      const { names, sim } = await r.json(); SIMILAR = new Map(names.map((n, i) => [n, sim[i].map(j => names[j])]));
    }
    return (SIMILAR.get(name) || []).map(n => BY_ID.get('r:' + n)).filter(Boolean);
  }
  const relRow = x => `<li><button data-open="${esc(x.id)}">${x.kind === 'r' ? avatar(x.name, 28) : icon(x.url, x.name, 28)}
    <span><span class="r-name">${esc(x.name)}</span><span class="r-desc">${esc(x.desc || '')}</span></span></button></li>`;
  function drawerHtml(x) {
    const share = location.origin + location.pathname + '?open=' + encodeURIComponent(x.id);
    const actions = `<div class="d-actions"><a class="btn primary" href="${esc(safeUrl(x.url))}" target="_blank" rel="noopener">${x.kind === 'r' ? t('d.openGh') : t('d.openSite')}</a>
      <button class="btn" data-save="${esc(x.id)}">${saved.has(x.id) ? t('d.saved') : t('d.save')}</button>
      <button class="btn" data-copy="${esc(share)}">${t('d.copy')}</button></div>`;
    if (x.kind === 't') {
      const near = order(ITEMS.filter(y => y.kind === 't' && y.section === x.section && y.sub === x.sub && y.id !== x.id)).slice(0, 6);
      return `<span class="d-kind">${t('card.tool')}</span>
        <div class="d-title">${icon(x.url, x.name, 44)}<h2>${esc(x.name)}</h2></div>
        <p class="d-desc">${esc(x.desc)}</p>
        <dl class="d-facts"><dt>${t('d.cat')}</dt><dd><button data-cat="${esc(x.cat)}">${esc(catName(x.cat))}</button></dd>
          <dt>${t('d.sec')}</dt><dd><button data-cat="${esc(x.cat)}" data-sec="${esc(x.section)}">${esc(secName(x.section))}</button>${x.sub ? ` › <button data-cat="${esc(x.cat)}" data-sec="${esc(x.section)}" data-sub="${esc(x.sub)}">${esc(x.sub)}</button>` : ''}</dd>
          ${x.mine ? `<dt>${t('d.mine')}</dt><dd class="mine">${t('card.mine')}</dd>` : ''}${x.pick || x.starred ? `<dt>${t('d.by')}</dt><dd>${[x.pick && t('d.byMe'), x.starred && t('d.byFmhy')].filter(Boolean).join(' · ')}</dd>` : ''}
          ${x.alt.length ? `<dt>${t('d.alt')}</dt><dd>${x.alt.map(esc).join(' · ')}</dd>` : ''}
          ${x.oss ? `<dt>${t('d.oss')}</dt><dd>${t('d.ossYes')}${x.stars ? ` · ★ ${fmtK(x.stars)}` : ''}</dd>` : ''}
          ${x.tags.length ? `<dt>${t('d.notes')}</dt><dd>${x.tags.map(esc).join(' · ')}</dd>` : ''}</dl>
        ${actions}
        ${x.links.length ? `<div class="d-h">${t('d.links')}</div><ul class="links">${x.links.map(l => `<li><span>${esc(l.label)}</span><a class="link" href="${esc(safeUrl(l.url))}" target="_blank" rel="noopener">${esc(l.url.replace(/^https?:\/\//, ''))}</a></li>`).join('')}</ul>` : ''}
        ${near.length ? `<div class="d-h">${t('d.more', { x: esc(x.sub || secName(x.section)) })}</div><ul class="rel">${near.map(relRow).join('')}</ul>` : ''}`;
    }
    const [h, hlabel] = health(x), clone = `git clone ${x.url}.git`;
    return `<span class="d-kind">${t('card.repo')} · ${esc(secName(x.section))}</span>
      <div class="d-title">${avatar(x.name, 44)}<h2>${esc(x.name)}</h2></div>
      <p class="d-desc">${esc(x.desc || t('card.noDesc'))}</p>
      <dl class="d-facts">${x.mine ? `<dt>${t('d.mine')}</dt><dd class="mine">${t('card.mine')}</dd>` : ''}<dt>${t('d.status')}</dt><dd><i class="dot ${h}"></i>${hlabel}${x.pushed ? ` · ${t('d.lastCommit', { x: ago(x.pushed) })}` : ''}</dd>
        <dt>${t('d.stars')}</dt><dd>${x.stars != null ? num(x.stars) : '—'}</dd>
        <dt>${t('d.trending')}</dt><dd>${t('d.daysSince', { n: x.days })}${x.last_seen ? ` · ${t('d.lastOn', { x: x.last_seen })}` : ''}</dd>
        <dt>${t('d.lang')}</dt><dd>${esc(x.lang === 'Javascript' ? 'JavaScript' : x.lang)}</dd>
        <dt>${t('d.lic')}</dt><dd>${x.license ? esc(x.license) + (COMMERCIAL.has(x.license) ? ` · ${t('d.commercial')}` : /GPL|-SA/i.test(x.license) ? ` · ${t('d.copyleft')}` : '') : t('d.noLic')}</dd>
        <dt>${t('d.cat')}</dt><dd><button data-cat="${esc(x.cat)}" data-type="repos" data-sec="${esc(x.section)}">${esc(secName(x.section))}</button></dd></dl>
      ${actions}
      <div class="d-h">${t('d.use')}</div><div class="code"><code>${esc(clone)}</code><button data-copy="${esc(clone)}">${t('d.copyCmd')}</button></div>
      ${x.section === 'Claude Skills' ? `<p class="hint-line">${t('d.skill')}</p>` : ''}
      <div class="d-h">${t('d.similar')}</div><ul class="rel" id="similar"><li class="hint-line">${t('d.loading')}</li></ul>`;
  }
  async function fillSimilar(x) {
    try {
      const items = (await similarFor(x.name)).slice(0, 5);
      if (S.open !== x.id || !$('similar')) return;
      $('similar').innerHTML = items.length ? items.map(relRow).join('') : `<li class="hint-line">${t('d.noSim')}</li>`;
    } catch { $('similar') && ($('similar').innerHTML = `<li class="hint-line">${t('d.simErr')}</li>`); }
  }
  let lastFocus = null;
  function syncDrawer() {
    const x = S.open && BY_ID.get(S.open), d = $('drawer');
    document.querySelectorAll('.card').forEach(c => c.classList.toggle('sel', c.dataset.open === S.open));
    if (!x) {
      if (d.classList.contains('open')) { d.classList.remove('open'); $('scrim').classList.remove('on'); d.setAttribute('aria-hidden', 'true'); TB.lock(false); lastFocus?.focus?.({ preventScroll: true }); }
      return;
    }
    $('dBody').innerHTML = drawerHtml(x); $('dBody').scrollTop = 0;
    if (!d.classList.contains('open')) { lastFocus = document.activeElement; TB.lock(true); }
    d.classList.add('open'); $('scrim').classList.add('on'); d.setAttribute('aria-hidden', 'false');
    $('dClose').focus({ preventScroll: true });
    if (x.kind === 'r') fillSimilar(x);
  }
  const openItem = id => { S.open = id; writeURL(); syncDrawer(); };
  const closeItem = () => { if (!S.open) return; S.open = null; writeURL(); syncDrawer(); };

  // ── eventos ────────────────────────────────────────────────────────────────
  document.addEventListener('click', e => {
    if (e.target.closest('a')) return;
    const el = e.target.closest('[data-save],[data-copy],[data-share],[data-cat],[data-type],[data-sec],[data-sub],[data-open],[data-clear]');
    if (!el) return;
    const d = el.dataset;
    if (d.share) return share(d.share);
    if (d.save) {
      saved.has(d.save) ? saved.delete(d.save) : saved.add(d.save); persist();
      document.querySelectorAll(`[data-save="${CSS.escape(d.save)}"]`).forEach(b => {
        const on = saved.has(d.save); b.setAttribute('aria-pressed', on);
        b.textContent = b.classList.contains('btn') ? (on ? t('d.saved') : t('d.save')) : (on ? '★' : '☆');
      });
      toast(saved.has(d.save) ? t('toast.saved') : t('toast.removed'));
      if (S.fav) render(); return;
    }
    if (d.copy) return copy(d.copy, t('toast.copied'));
    if (d.clear !== undefined) return update({ q: '', cat: '', sec: '', sub: '', pick: false, fav: false, list: null, lang: '', lic: '', st: '', type: 'all', open: null }, { top: true });
    if (d.open && !el.matches('[data-cat],[data-type],[data-sec]')) return openItem(d.open);
    const patch = { open: null };
    if (d.cat !== undefined) Object.assign(patch, { cat: d.cat, sec: '', sub: '' });
    if (d.type) patch.type = d.type;
    if (d.sec !== undefined) Object.assign(patch, { sec: d.sec, sub: '' });
    if (d.sub !== undefined) patch.sub = d.sub;
    update(patch, { top: true });
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.matches('.replist .row')) return openItem(e.target.dataset.open);
    const typing = /INPUT|SELECT|TEXTAREA/.test(document.activeElement?.tagName);
    if (e.key === 'Escape') { if (S.open) return closeItem(); if (typing) document.activeElement.blur(); return; }
    if (typing || e.ctrlKey || e.metaKey || e.altKey || S.open) return;
    if (e.key === '/') { e.preventDefault(); $('q').focus(); }
    else if (e.key === 'j' || e.key === 'k') {
      const cards = [...document.querySelectorAll('#main .card')]; if (!cards.length) return;
      let i = cards.findIndex(c => c.classList.contains('kb'));
      i = Math.max(0, Math.min(cards.length - 1, i + (e.key === 'j' ? 1 : -1)));
      cards.forEach((c, j) => c.classList.toggle('kb', j === i));
      cards[i].scrollIntoView({ block: 'center', behavior: TB.reduced ? 'auto' : 'smooth' });
      if (i >= cards.length - 4) more();
    } else if (e.key === 'Enter') {
      const c = document.querySelector('#main .card.kb'); if (c) openItem(c.dataset.open);
    }
  });
  let qt;
  $('q').addEventListener('input', () => { clearTimeout(qt); qt = setTimeout(() => update({ q: $('q').value.trim(), open: null }, { replace: true }), 180); });
  $('q').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); clearTimeout(qt); update({ q: $('q').value.trim(), open: null }, { replace: true, top: true }); } });
  $('sort').addEventListener('change', e => update({ sort: e.target.value }));
  $('pick').addEventListener('change', e => update({ pick: e.target.checked }, { top: true }));
  ['lang', 'lic', 'st'].forEach(id => $(id).addEventListener('change', e => update({ [id]: e.target.value }, { top: true })));
  $('type').addEventListener('click', e => { const b = e.target.closest('button'); if (b) update({ type: b.dataset.t, sec: '', sub: '' }, { top: true }); });
  $('btnSaved').addEventListener('click', () => update({ fav: !S.fav, list: null, open: null }, { top: true }));
  $('dClose').addEventListener('click', closeItem);
  $('scrim').addEventListener('click', closeItem);
  addEventListener('popstate', () => { readURL(); render(); });

  // ── início ─────────────────────────────────────────────────────────────────
  document.querySelectorAll('[data-count]').forEach(el => {
    const n = { tools: nT, repos: nR, picks: ITEMS.filter(x => x.pick).length, cats: CATS.length }[el.dataset.count] ?? 0;
    el.textContent = num(n);
    if (window.gsap && !TB.reduced) {
      const o = { v: 0 };
      gsap.to(o, { v: n, duration: 1.4, ease: 'power2.out', onUpdate: () => { el.textContent = num(Math.round(o.v)); } });
    }
  });
  $('updated').textContent = TOOLS_META.generated;
  // colagem da abertura: uma escolha a dedo por seção, espalhadas na metade direita,
  // em posições fixas (semente) para a composição não mudar a cada visita
  (() => {
    const box = $('collage'); if (!box) return;
    const picks = [...new Map(ITEMS.filter(x => x.pick).map(x => [x.section, x])).values()];
    const n = matchMedia('(max-width:760px)').matches ? 7 : 14;
    let seed = 7; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    const cells = [];   // grade 4x4 na área à direita, um ícone por célula com folga aleatória
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) cells.push([c, r]);
    cells.sort(() => rnd() - .5);
    // telas largas: grade 4x4 à direita do texto · telas médias e celular: faixa da largura inteira abaixo do texto
    const strip = matchMedia('(max-width:1100px)').matches;
    box.innerHTML = picks.slice(0, n).map((x, i) => {
      const [c, r] = cells[i % cells.length];
      // na tela larga a colagem fica só na faixa acima dos números (não cobre o "6,019")
      const avail = strip ? 0 : Math.max(160, document.querySelector('.figures').offsetTop - 90);
      const left = strip ? 2 + i * (86 / n) + rnd() * 3 : 64 + c * 8 + rnd() * 3;
      const top = strip ? `${10 + rnd() * 45}%` : `${24 + r * (avail - 24) / 4 + rnd() * 10}px`;
      const rot = (rnd() * 16 - 8).toFixed(1);
      return `<a href="./?open=${encodeURIComponent(x.id)}" data-open="${esc(x.id)}" tabindex="-1" style="left:${left}%;top:${top};--r:${rot}deg" data-depth="${(0.4 + rnd()).toFixed(2)}">${icon(x.url, x.name, 30)}<span class="tip">${esc(x.name)}</span></a>`;
    }).join('');
    box.addEventListener('click', e => { const a = e.target.closest('a[data-open]'); if (a) { e.preventDefault(); e.stopPropagation(); openItem(a.dataset.open); } }, true);
    // leve deslocamento com o mouse (paralaxe), desligado para quem reduz movimento
    if (TB.reduced || !window.gsap || matchMedia('(hover:none)').matches) return;
    const els = [...box.querySelectorAll('a')];
    box.parentElement.addEventListener('pointermove', e => {
      const b = box.getBoundingClientRect(), dx = (e.clientX - b.left) / b.width - .5, dy = (e.clientY - b.top) / b.height - .5;
      els.forEach(el => gsap.to(el, { x: -dx * 28 * el.dataset.depth, y: -dy * 22 * el.dataset.depth, duration: .8, ease: 'power3.out' }));
    });
  })();
  document.querySelectorAll('#type .n').forEach(el => el.textContent = num({ all: nT + nR, tools: nT, repos: nR }[el.dataset.n]));
  // ── abertura: "Tipo Notion, só que open source:" girando com alternativas reais ──
  function heroSwap() {
    const box = $('swap'), app = $('swapApp'), ul = $('swapAlts'); if (!box) return;
    const FAMOUS = ['Notion', 'Adobe Photoshop', 'Slack', 'Google Analytics', 'Figma', 'Trello', 'ChatGPT', 'Zapier', 'Vercel',
      'Canva', 'Dropbox', 'Zoom', 'Claude Code', 'Postman', 'Jira', 'Google Docs', '1Password', 'Airtable', 'Miro', 'Obsidian'];
    const by = new Map();
    ITEMS.forEach(x => (x.alt || []).forEach(a => { if (FAMOUS.includes(a)) { if (!by.has(a)) by.set(a, new Map()); by.get(a).set(x.url, x); } }));
    const rank = x => (x.mine ? 3e6 : 0) + (x.pick ? 2e6 : 0) + (x.starred ? 1e6 : 0) + (x.stars || 0);
    const deck = FAMOUS.filter(a => by.get(a)?.size >= 3).map(a => [a, [...by.get(a).values()].sort((p, q) => rank(q) - rank(p)).slice(0, 4)]);
    if (!deck.length) return;
    let i = 0;
    const show = () => {
      const [name, alts] = deck[i];
      app.textContent = name; app.dataset.q = name; app.setAttribute('aria-label', t('swap.app', { x: name }));
      ul.innerHTML = alts.map(x => `<li><button type="button" data-open="${esc(x.id)}">${icon(x.url, x.name, 22)}<span>${esc(x.name)}</span></button></li>`).join('');
    };
    show();
    app.addEventListener('click', () => update({ q: app.dataset.q, type: 'all', cat: '', sec: '', sub: '', pick: false, fav: false, list: null, open: null }, { top: true }));
    if (TB.reduced || deck.length < 2) return;
    // troca a cada 3,5 s; para enquanto o mouse ou o foco estão na frase, ou com a aba escondida
    let held = false;
    ['pointerenter', 'focusin'].forEach(e => box.addEventListener(e, () => { held = true; }));
    ['pointerleave', 'focusout'].forEach(e => box.addEventListener(e, () => { held = box.matches(':focus-within'); }));
    setInterval(() => {
      if (held || document.hidden || scrollY > innerHeight) return;
      box.classList.add('out');
      setTimeout(() => { i = (i + 1) % deck.length; show(); box.classList.remove('out'); }, 250);
    }, 3500);
  }

  persist(); readURL(); render(); heroSwap();
  TB.smooth(); TB.intro();
})();
