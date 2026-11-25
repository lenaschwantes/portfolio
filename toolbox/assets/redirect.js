// a página de repos agora faz parte da biblioteca: leva os filtros antigos junto
(() => {
  const p = new URLSearchParams(location.search), out = new URLSearchParams({ type: 'repos' });
  if (p.get('q')) out.set('q', p.get('q'));
  if (p.get('lang')) out.set('lang', p.get('lang'));
  if (p.get('status')) out.set('st', p.get('status'));
  if (p.get('lic') === '__commercial__') out.set('lic', 'commercial');
  if (p.get('fav') === '1') out.set('fav', '1');
  if (p.get('repo')) out.set('open', 'r:' + p.get('repo'));
  location.replace('./?' + out);
})();
