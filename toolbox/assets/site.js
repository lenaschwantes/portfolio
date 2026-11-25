// toolbox — utilidades comuns: escape, toast, cópia, ícones, scroll suave e transição entre páginas
(() => {
  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const safeUrl = u => /^https?:\/\//i.test(u || '') ? u : '#';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function toast(msg) {
    let t = $('toast');
    if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; t.setAttribute('role', 'status'); document.body.append(t); }
    t.textContent = msg; t.classList.add('on');
    clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('on'), 1600);
  }
  async function copy(text, msg) {
    const t = k => window.I18N ? I18N.t(k) : ({ 'toast.copied': 'Copied', 'toast.copyFail': 'Could not copy' })[k];
    try { await navigator.clipboard.writeText(text); toast(msg || t('toast.copied')); } catch { toast(t('toast.copyFail')); }
  }
  // ícone real do site (serviço de favicons do Google). Sem ícone, o Google devolve um globo genérico de 16 px:
  // nesse caso, e se der erro, mostra a inicial do nome.
  window.__icoCheck = img => { if (img.naturalWidth && img.naturalWidth <= 16) __icoMono(img); };
  window.__icoMono = img => { const p = img.parentNode; if (!p) return; p.classList.add('mono-ico'); p.textContent = p.dataset.l; };
  // load/error não sobem pelo DOM, mas dá pra ouvir na captura; a CSP bloqueia onload="" no HTML
  document.addEventListener('load', e => { if (e.target.matches?.('.ico img')) __icoCheck(e.target); }, true);
  document.addEventListener('error', e => { if (e.target.matches?.('.ico img')) __icoMono(e.target); }, true);
  function icon(url, name, size = 32) {
    let host = '';
    try { host = new URL(url).hostname; } catch {}
    const letter = esc((name || host || '?').trim()[0]?.toUpperCase() || '?');
    if (!host) return `<span class="ico mono-ico" style="width:${size}px;height:${size}px">${letter}</span>`;
    return `<span class="ico" data-l="${letter}" style="width:${size}px;height:${size}px"><img src="https://www.google.com/s2/favicons?domain=${esc(host)}&amp;sz=64" alt="" loading="lazy" width="${size}" height="${size}"></span>`;
  }

  // scroll suave (Lenis) ligado ao relógio do GSAP, desligado para quem reduz movimento
  let lenis = null;
  function smooth() {
    if (reduced || !window.Lenis) return null;
    lenis = new Lenis({ lerp: 0.12, wheelMultiplier: 1 });
    if (window.gsap) {
      if (window.ScrollTrigger) lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
    return lenis;
  }
  const scrollTo = (target, opts = {}) => lenis ? lenis.scrollTo(target, { offset: -70, ...opts }) :
    (typeof target === 'number' ? scrollTo_(target) : target.scrollIntoView({ block: 'start' }));
  const scrollTo_ = y => window.scrollTo({ top: y });
  const lock = on => { document.documentElement.style.overflow = on ? 'hidden' : ''; lenis && (on ? lenis.stop() : lenis.start()); };

  // entrada dos títulos marcados com [data-split]: palavra por palavra
  function intro() {
    if (reduced || !window.gsap) return;
    document.querySelectorAll('[data-split]').forEach(el => {
      el.innerHTML = el.innerHTML.split(/(<[^>]+>)/).map(part => part.startsWith('<') ? part :
        part.split(/(\s+)/).map(w => w.trim() ? `<span class="w"><span>${w}</span></span>` : w).join('')).join('');
      gsap.from(el.querySelectorAll('.w > span'), { yPercent: 110, duration: .9, ease: 'expo.out', stagger: .045, delay: .05 });
    });
    gsap.from('[data-rise]', { y: 18, opacity: 0, duration: .8, ease: 'power3.out', stagger: .06, delay: .25 });
  }

  // cartões aparecem em grupo quando entram na tela (só uma vez)
  function reveal(nodes) {
    if (reduced || !window.gsap || !window.ScrollTrigger || !nodes.length) return;
    gsap.set(nodes, { opacity: 0, y: 14 });
    ScrollTrigger.batch(nodes, { start: 'top 92%', once: true,
      onEnter: b => gsap.to(b, { opacity: 1, y: 0, duration: .5, ease: 'power2.out', stagger: .035, overwrite: true }) });
  }

  // saída suave ao trocar de página dentro do site
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || a.target || e.metaKey || e.ctrlKey || e.shiftKey || reduced) return;
    const u = new URL(a.href, location.href);
    if (u.origin !== location.origin || u.pathname === location.pathname || a.hasAttribute('download')) return;
    e.preventDefault(); document.body.classList.add('leaving');
    setTimeout(() => { location.href = u.href; }, 220);
  });
  addEventListener('pageshow', () => document.body.classList.remove('leaving'));

  window.TB = { $, esc, safeUrl, toast, copy, icon, smooth, scrollTo, lock, intro, reveal, reduced };
})();
