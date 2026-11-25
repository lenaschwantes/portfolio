// toolbox — textos em inglês (padrão) e português.
// Idioma: ?l=pt no link, depois a escolha salva no navegador, senão inglês.
// No HTML: data-i18n (texto), data-i18n-html (HTML confiável deste arquivo), data-i18n-ph (placeholder), data-i18n-title.
(() => {
  const D = {
    en: {
      'nav.library': 'Library', 'nav.agent': 'Agent', 'nav.skill': 'skill', 'nav.skillLong': 'Claude ',
      'nav.skillTitle': 'Claude Code skill that searches this library and live GitHub for what fits your project', 'skill.lede': 'Ask Claude "is there a lib for X?" or "what can I use to build Y?" and it searches this library and live GitHub before answering, instead of suggesting tools from memory.', 'skill.install': 'Install', 'skill.copy': 'Copy', 'skill.needs': 'Needs Python 3. Live GitHub search also needs the <a href="https://cli.github.com" target="_blank" rel="noopener">GitHub CLI</a>, logged in.', 'skill.try': 'Try it', 'skill.tryP': 'Or just ask Claude Code for a tool. The skill kicks in on its own.', 'skill.files': 'Files', 'skill.fSkill': 'instructions Claude reads', 'skill.fScout': 'the search script',
      'nav.saved': ' Saved', 'nav.hint': 'press / to search', 'lang.other': 'PT', 'lang.label': 'Ver em português',
      'hero.eyebrow': "ravena's toolbox · restocked",
      'hero.h1': "ravena's toolbox: free tools and open-source repos", 'swap.like': 'Like', 'swap.but': 'but open source:', 'swap.app': 'Search alternatives to {x}',
      'hero.lede': 'Free <span class="kind">tools</span> and <span class="kind r">open-source repos</span>, sorted by what they do. The ones marked in pink I use myself.',
      'hero.sticker': 'hand-picked first',
      'fig.tools': 'tools', 'fig.repos': 'open-source repos', 'fig.picked': 'by hand', 'fig.cats': 'categories',
      'stamp': 'picked',
      'search.label': 'Search tools and repos', 'search.ph': 'What are you building? try “transcribe audio” or “pdf”',
      'type.all': 'All', 'type.tools': 'Tools', 'type.repos': 'Repos', 'type.label': 'Show',
      'sort.rec': 'Recommended first', 'sort.name': 'Name, A to Z', 'sort.stars': 'Most stars (repos)', 'sort.recent': 'Recently updated (repos)',
      'f.anyLang': 'Any language', 'f.anyLic': 'Any license', 'f.commercial': 'OK for commercial use',
      'f.anyStatus': 'Any status', 'f.alive': 'Not archived', 'f.active': 'Commit in last 90 days',
      'pick.all': 'Picked tools + top repos', 'pick.tools': 'Picked tools only', 'pick.repos': 'Top trending only',
      'foot.src': 'Tools from <a href="https://github.com/fmhy/edit" target="_blank" rel="noopener">FMHY</a> and <a href="https://openalternative.co" target="_blank" rel="noopener">OpenAlternative</a>, tool pages only; media piracy and paywall or captcha bypass are left out. Repos from <a href="https://github.com/bonfy/github-trending" target="_blank" rel="noopener">bonfy/github-trending</a> and the GitHub API. Updated twice a month.',
      'foot.code': 'Source on GitHub', 'foot.risk': 'Links go to third-party sites I don\'t run. Check a site before you download or sign in to anything.', 'drawer.head': 'Details · Esc to close', 'drawer.close': 'Close details',
      'idx.title': 'Index', 'idx.all': 'Everything',
      'ch.tools': 'tools', 'ch.repos': 'repos', 'blk.tools': 'Tools', 'blk.repos': 'Most trending repos',
      'blk.allTools': 'All {n} tools →', 'blk.allRepos': 'All {n} repos →',
      'hof.eyebrow': 'Hall of fame · since 2023', 'hof.title': 'The repos that refused<br>to leave the trending page.',
      'hof.note': 'Ranked by how many days each one showed up on GitHub Trending. Next.js has been there {n} days, roughly one in every four.',
      'hof.days': 'days',
      'card.tool': 'Tool', 'card.repo': 'Repo', 'card.fmhy': 'FMHY favorite', 'card.days': '{n} days trending',
      'card.noLic': 'no license', 'card.noDesc': 'No description', 'card.details': 'details →',
      'card.save': 'Save', 'card.unsave': 'Remove from saved', 'card.open': 'Details:', 'card.mine': 'I use this', 'd.mine': 'in my stack', 'card.alt': 'alt. to {x}', 'd.alt': 'alternative to', 'd.oss': 'open source', 'd.ossYes': 'yes, via OpenAlternative',
      'h.active': 'active', 'h.slowing': 'slowing', 'h.inactive': 'inactive', 'h.archived': 'archived',
      'res.saved': 'Saved', 'res.shared': 'Shared list', 'share.lead': 'Take this list with you', 'share.link': 'Share link', 'share.mail': 'Email', 'share.text': 'Copy as text', 'share.md': 'Download .md', 'share.from': 'Someone shared {n} items with you.', 'share.import': 'Save all to my list', 'share.subject': 'My picks from ravena\'s toolbox', 'share.full': 'Full list:', 'share.more': '…and {n} more', 'toast.linkCopied': 'Link copied', 'toast.imported': '{n} new items saved', 'res.allTools': 'All tools', 'res.allRepos': 'All repos', 'res.all': 'Everything',
      'res.count': '{t} tools · {r} repos', 'res.clear': 'Clear filters', 'res.allSecs': 'All sections', 'res.allSubs': 'All',
      'res.osint': '<b>Use OSINT responsibly.</b> Personal data is protected by law (LGPD, GDPR) even when public. Research with a legitimate purpose, such as vetting a partner, checking a scam or auditing your own exposure, and don\'t collect or publish someone\'s data without a lawful basis.',
      'empty.saved': 'Nothing saved yet', 'empty.none': 'Nothing matches',
      'empty.savedP': 'Use ☆ on any tool or repo to keep it here. Saved items stay in this browser.',
      'empty.noneP': 'Try fewer words, another category, or switch between tools and repos.',
      'grp.tools': 'Tools · {n}', 'grp.repos': 'Repos · {n}', 'grp.allTools': 'See all {n} tools →', 'grp.allRepos': 'See all {n} repos →',
      'more.some': '{a} of {b} · keep scrolling', 'more.all': 'All {n} shown',
      'd.openGh': 'Open on GitHub ↗', 'd.openSite': 'Open site ↗', 'd.saved': '★ Saved', 'd.save': '☆ Save', 'd.copy': 'Copy link',
      'd.cat': 'category', 'd.sec': 'section', 'd.by': 'picked by', 'd.byMe': 'toolbox', 'd.byFmhy': 'FMHY editors', 'd.notes': 'notes',
      'd.status': 'status', 'd.stars': 'stars', 'd.trending': 'trending', 'd.lang': 'language', 'd.lic': 'license',
      'd.lastCommit': 'last commit {x}', 'd.daysSince': '{n} days since 2023', 'd.lastOn': 'last on {x}',
      'd.commercial': 'OK for commercial use', 'd.copyleft': 'copyleft', 'd.noLic': 'none declared',
      'd.links': 'Other links', 'd.more': 'More in {x}', 'd.use': 'Use it', 'd.copyCmd': 'Copy',
      'd.skill': 'Claude skill: copy the folder with SKILL.md into ~/.claude/skills/, or follow the README if it ships as a plugin.',
      'd.similar': 'Similar repos', 'd.loading': 'Loading…', 'd.noSim': 'No suggestions for this repo yet.', 'd.simErr': 'Could not load suggestions.',
      'toast.saved': 'Saved in this browser', 'toast.removed': 'Removed from saved', 'toast.copied': 'Copied', 'toast.copyFail': 'Could not copy',
      'ago.today': 'today', 'ago.d': '{n}d ago', 'ago.mo': '{n}mo ago', 'ago.y': '{n}y ago',
      'agent.eyebrow': 'Agent · uses your own AI key',
      'agent.title': 'Describe a project, <em>get the repos that fit.</em>',
      'agent.lede': 'The agent searches the 6k repos in the library by meaning, then asks the AI you choose to pick the ones that really fit and explain why. Answers come in the language you write in.',
      'agent.s1': 'Pick a provider and paste your API key. It stays in this browser and goes only to that provider.',
      'agent.s2': 'Describe what you want to build, in a sentence or two.',
      'agent.s3': 'Open a result to see it in the library, with similar repos and how to install it.',
      'agent.provider': 'AI provider', 'agent.key': 'API key', 'agent.keyNote': 'Stays in this browser and goes only to the provider you pick. Use a key with a spending limit.', 'agent.keyForget': 'Forget key', 'agent.keyGone': 'Key removed from this browser', 'agent.keySaved': 'Key saved only in this browser.',
      'agent.askLabel': 'What do you want to build?', 'agent.ph': 'e.g. a bot that transcribes WhatsApp voice notes', 'agent.btn': 'Find repos',
      'agent.loadingModel': 'Loading the search model', 'agent.starting': 'Starting...',
      'st.loading': 'Loading repos...', 'st.newData': 'New data found, clearing cache...', 'st.emb': 'Loading precomputed embeddings...',
      'st.ready': '>> ready', 'st.error': 'ERROR: ', 'st.needKey': 'Add your API key above first.', 'st.finding': 'finding similar repos...',
      'st.asking': 'asking the AI...', 'st.done': '>> done', 'st.wait': 'Still loading, try again in a moment...',
      'st.noResults': 'No matching repos. Try describing the project in other words.', 'st.why': 'WHY', 'st.recent': 'RECENT:', 'st.remove': 'Remove',
      'st.waiting': 'waiting...',
    },
    pt: {
      'nav.library': 'Biblioteca', 'nav.agent': 'Agente', 'nav.skill': 'skill', 'nav.skillLong': 'Claude ',
      'nav.skillTitle': 'Skill do Claude Code que busca nesta biblioteca e no GitHub o que serve para o seu projeto', 'skill.lede': 'Pergunte ao Claude "tem uma lib pra X?" ou "o que eu uso pra construir Y?" e ele busca nesta biblioteca e no GitHub antes de responder, em vez de sugerir ferramenta de memória.', 'skill.install': 'Instalar', 'skill.copy': 'Copiar', 'skill.needs': 'Precisa de Python 3. A busca ao vivo no GitHub também precisa do <a href="https://cli.github.com" target="_blank" rel="noopener">GitHub CLI</a>, logado.', 'skill.try': 'Testar', 'skill.tryP': 'Ou só peça uma ferramenta ao Claude Code. A skill entra sozinha.', 'skill.files': 'Arquivos', 'skill.fSkill': 'instruções que o Claude lê', 'skill.fScout': 'o script de busca',
      'nav.saved': ' Salvos', 'nav.hint': 'aperte / para buscar', 'lang.other': 'EN', 'lang.label': 'View in English',
      'hero.eyebrow': 'a caixa de ferramentas da ravena · reabastecida em',
      'hero.h1': 'ravena\'s toolbox: ferramentas gratuitas e repos open source', 'swap.like': 'Tipo', 'swap.but': 'só que open source:', 'swap.app': 'Buscar alternativas a {x}',
      'hero.lede': '<span class="kind">Ferramentas</span> gratuitas e <span class="kind r">repos open source</span>, organizados pelo que fazem. As marcadas em rosa eu uso.',
      'hero.sticker': 'escolhas primeiro',
      'fig.tools': 'ferramentas', 'fig.repos': 'repos open source', 'fig.picked': 'a dedo', 'fig.cats': 'categorias',
      'stamp': 'escolha',
      'search.label': 'Buscar ferramentas e repos', 'search.ph': 'O que você está construindo? tente “transcrever áudio” ou “pdf”',
      'type.all': 'Tudo', 'type.tools': 'Ferramentas', 'type.repos': 'Repos', 'type.label': 'Mostrar',
      'sort.rec': 'Recomendados primeiro', 'sort.name': 'Nome, de A a Z', 'sort.stars': 'Mais estrelas (repos)', 'sort.recent': 'Atualizados recentemente (repos)',
      'f.anyLang': 'Qualquer linguagem', 'f.anyLic': 'Qualquer licença', 'f.commercial': 'Pode usar comercialmente',
      'f.anyStatus': 'Qualquer status', 'f.alive': 'Não arquivados', 'f.active': 'Commit nos últimos 90 dias',
      'pick.all': 'Ferramentas escolhidas + repos em alta', 'pick.tools': 'Só ferramentas escolhidas', 'pick.repos': 'Só os mais em alta',
      'foot.src': 'Ferramentas do <a href="https://github.com/fmhy/edit" target="_blank" rel="noopener">FMHY</a> e do <a href="https://openalternative.co" target="_blank" rel="noopener">OpenAlternative</a>, só as páginas de ferramentas; pirataria de mídia e contorno de paywall ou captcha ficam de fora. Repos do <a href="https://github.com/bonfy/github-trending" target="_blank" rel="noopener">bonfy/github-trending</a> e da API do GitHub. Atualizado duas vezes por mês.',
      'foot.code': 'Código no GitHub', 'foot.risk': 'Os links levam a sites de terceiros que não são meus. Confira o site antes de baixar algo ou fazer login.', 'drawer.head': 'Detalhes · Esc para fechar', 'drawer.close': 'Fechar detalhes',
      'idx.title': 'Índice', 'idx.all': 'Tudo',
      'ch.tools': 'ferramentas', 'ch.repos': 'repos', 'blk.tools': 'Ferramentas', 'blk.repos': 'Repos mais em alta',
      'blk.allTools': 'Todas as {n} ferramentas →', 'blk.allRepos': 'Todos os {n} repos →',
      'hof.eyebrow': 'Hall da fama · desde 2023', 'hof.title': 'Os repos que se recusaram<br>a sair do trending.',
      'hof.note': 'Ordenados pelos dias em que cada um apareceu no GitHub Trending. O Next.js esteve lá {n} dias, mais ou menos um em cada quatro.',
      'hof.days': 'dias',
      'card.tool': 'Ferramenta', 'card.repo': 'Repo', 'card.fmhy': 'favorita do FMHY', 'card.days': '{n} dias em alta',
      'card.noLic': 'sem licença', 'card.noDesc': 'Sem descrição', 'card.details': 'detalhes →',
      'card.save': 'Salvar', 'card.unsave': 'Remover dos salvos', 'card.open': 'Detalhes:', 'card.mine': 'eu uso', 'd.mine': 'no meu stack', 'card.alt': 'alt. a {x}', 'd.alt': 'alternativa a', 'd.oss': 'código aberto', 'd.ossYes': 'sim, via OpenAlternative',
      'h.active': 'ativo', 'h.slowing': 'desacelerando', 'h.inactive': 'inativo', 'h.archived': 'arquivado',
      'res.saved': 'Salvos', 'res.shared': 'Lista compartilhada', 'share.lead': 'Leve esta lista com você', 'share.link': 'Compartilhar link', 'share.mail': 'E-mail', 'share.text': 'Copiar como texto', 'share.md': 'Baixar .md', 'share.from': 'Alguém compartilhou {n} itens com você.', 'share.import': 'Salvar tudo na minha lista', 'share.subject': 'Minhas escolhas no ravena\'s toolbox', 'share.full': 'Lista completa:', 'share.more': '…e mais {n}', 'toast.linkCopied': 'Link copiado', 'toast.imported': '{n} itens novos salvos', 'res.allTools': 'Todas as ferramentas', 'res.allRepos': 'Todos os repos', 'res.all': 'Tudo',
      'res.count': '{t} ferramentas · {r} repos', 'res.clear': 'Limpar filtros', 'res.allSecs': 'Todas as seções', 'res.allSubs': 'Todas',
      'res.osint': '<b>Use OSINT com responsabilidade.</b> Dados pessoais são protegidos por lei (LGPD, GDPR) mesmo quando públicos. Pesquise com uma finalidade legítima, como checar um parceiro, verificar um golpe ou ver a sua própria exposição, e não junte nem publique dados de alguém sem base legal.',
      'empty.saved': 'Nada salvo ainda', 'empty.none': 'Nada encontrado',
      'empty.savedP': 'Use ☆ em qualquer ferramenta ou repo para guardar aqui. Os salvos ficam neste navegador.',
      'empty.noneP': 'Tente menos palavras, outra categoria, ou alterne entre ferramentas e repos.',
      'grp.tools': 'Ferramentas · {n}', 'grp.repos': 'Repos · {n}', 'grp.allTools': 'Ver todas as {n} ferramentas →', 'grp.allRepos': 'Ver todos os {n} repos →',
      'more.some': '{a} de {b} · continue rolando', 'more.all': 'Todos os {n} exibidos',
      'd.openGh': 'Abrir no GitHub ↗', 'd.openSite': 'Abrir o site ↗', 'd.saved': '★ Salvo', 'd.save': '☆ Salvar', 'd.copy': 'Copiar link',
      'd.cat': 'categoria', 'd.sec': 'seção', 'd.by': 'escolhida por', 'd.byMe': 'toolbox', 'd.byFmhy': 'editores do FMHY', 'd.notes': 'notas',
      'd.status': 'status', 'd.stars': 'estrelas', 'd.trending': 'em alta', 'd.lang': 'linguagem', 'd.lic': 'licença',
      'd.lastCommit': 'último commit {x}', 'd.daysSince': '{n} dias desde 2023', 'd.lastOn': 'última vez em {x}',
      'd.commercial': 'pode usar comercialmente', 'd.copyleft': 'copyleft', 'd.noLic': 'nenhuma declarada',
      'd.links': 'Outros links', 'd.more': 'Mais em {x}', 'd.use': 'Como usar', 'd.copyCmd': 'Copiar',
      'd.skill': 'Skill do Claude: copie a pasta com SKILL.md para ~/.claude/skills/, ou siga o README se vier como plugin.',
      'd.similar': 'Repos parecidos', 'd.loading': 'Carregando…', 'd.noSim': 'Ainda sem sugestões para este repo.', 'd.simErr': 'Não foi possível carregar as sugestões.',
      'toast.saved': 'Salvo neste navegador', 'toast.removed': 'Removido dos salvos', 'toast.copied': 'Copiado', 'toast.copyFail': 'Não foi possível copiar',
      'ago.today': 'hoje', 'ago.d': 'há {n} dias', 'ago.mo': 'há {n} meses', 'ago.y': 'há {n} anos',
      'agent.eyebrow': 'Agente · usa a sua própria chave de IA',
      'agent.title': 'Descreva um projeto, <em>receba os repos que servem.</em>',
      'agent.lede': 'O agente busca pelo significado entre os 6 mil repos da biblioteca e pede à IA que você escolher para separar os que servem de verdade e explicar por quê. A resposta vem no idioma em que você escrever.',
      'agent.s1': 'Escolha um provedor e cole a sua chave de API. Ela fica neste navegador e só vai para esse provedor.',
      'agent.s2': 'Descreva o que você quer construir, em uma ou duas frases.',
      'agent.s3': 'Abra um resultado para vê-lo na biblioteca, com repos parecidos e como instalar.',
      'agent.provider': 'Provedor de IA', 'agent.key': 'Chave de API', 'agent.keyNote': 'Fica só neste navegador e vai só para o provedor escolhido. Use uma chave com limite de gastos.', 'agent.keyForget': 'Apagar chave', 'agent.keyGone': 'Chave apagada deste navegador', 'agent.keySaved': 'Chave salva só neste navegador.',
      'agent.askLabel': 'O que você quer construir?', 'agent.ph': 'ex.: um bot que transcreve áudios do WhatsApp', 'agent.btn': 'Buscar repos',
      'agent.loadingModel': 'Carregando o modelo de busca', 'agent.starting': 'Iniciando...',
      'st.loading': 'Carregando repos...', 'st.newData': 'Dados novos, limpando o cache...', 'st.emb': 'Carregando embeddings pré-calculados...',
      'st.ready': '>> pronto', 'st.error': 'ERRO: ', 'st.needKey': 'Coloque a sua chave de API acima primeiro.', 'st.finding': 'buscando repos parecidos...',
      'st.asking': 'consultando a IA...', 'st.done': '>> concluído', 'st.wait': 'Ainda carregando, tente de novo em instantes...',
      'st.noResults': 'Nenhum repo encontrado. Tente descrever o projeto com outras palavras.', 'st.why': 'POR QUÊ', 'st.recent': 'RECENTES:', 'st.remove': 'Remover',
      'st.waiting': 'aguardando...',
    },
  };
  // nomes das categorias (os dados vêm em inglês)
  const CAT_PT = {
    'AI': 'IA', 'Developer': 'Desenvolvimento', 'Game dev': 'Desenvolvimento de jogos', 'Internet & Search': 'Internet e busca', 'Privacy & Security': 'Privacidade e segurança',
    'Files & PDF': 'Arquivos e PDF', 'Text & Writing': 'Texto e escrita', 'Image & Design': 'Imagem e design', 'Video': 'Vídeo',
    'Audio': 'Áudio', 'Social Media': 'Redes sociais', 'System': 'Sistema', 'Linux & macOS': 'Linux e macOS', 'Mobile': 'Celular',
    'Learning': 'Aprendizado', 'Business': 'Negócios', 'Useful Sites': 'Sites úteis',
  };

  // seções principais do FMHY e categorias dos repos (as subseções ficam em inglês: são centenas e bem técnicas)
  const SEC_PT = {
    'Developer Learning': 'Aprender programação', 'Language Learning': 'Aprender idiomas', 'Science / Math': 'Ciência e matemática',
    'Skills / Hobbies / DIY': 'Habilidades, hobbies e faça você mesmo', 'Linux Apps': 'Apps para Linux', 'Developer Tools': 'Ferramentas de desenvolvimento',
    'Web Dev Tools': 'Ferramentas para web', 'Android Tools': 'Ferramentas para Android', 'Text Editors': 'Editores de texto', 'Linux Tools': 'Ferramentas para Linux',
    'Maps': 'Mapas', 'Career': 'Carreira', 'Browser Tools': 'Ferramentas de navegador', 'Image Tools': 'Ferramentas de imagem', 'Educational Tools': 'Ferramentas educacionais',
    'iOS Tools': 'Ferramentas para iOS', 'File Tools': 'Ferramentas de arquivos', 'Customization': 'Personalização', 'Text Tools': 'Ferramentas de texto',
    'System Tools': 'Ferramentas de sistema', 'Audio Tools': 'Ferramentas de áudio', 'Audio Editing': 'Edição de áudio', 'Download Images': 'Baixar imagens',
    'IDEs / Code Editors': 'IDEs e editores de código', 'Video Editing': 'Edição de vídeo', 'Hardware Tools': 'Ferramentas de hardware', 'Cybersecurity Tools': 'Cibersegurança',
    'YouTube Tools': 'Ferramentas para YouTube', 'Mac Apps': 'Apps para Mac', 'File Hosts': 'Hospedagem de arquivos', 'Useful Sites': 'Sites úteis',
    'Android Device': 'Aparelho Android', 'Humanities': 'Humanidades', 'Mac Tools': 'Ferramentas para Mac', 'Tracking / Databases': 'Catálogos e bancos de dados',
    'Space': 'Espaço', 'Hosting Tools': 'Hospedagem', 'Image Creation': 'Criação de imagens', 'Design Resources / Ideas': 'Recursos e ideias de design',
    'History': 'História', '3D Models': 'Modelos 3D', 'Video Tools': 'Ferramentas de vídeo', 'News': 'Notícias', 'Discord Tools': 'Ferramentas para Discord',
    'AI Tools': 'Ferramentas de IA', 'Web Privacy': 'Privacidade na web', 'Internet Tools': 'Ferramentas de internet', 'Email Tools': 'Ferramentas de e-mail',
    'AI Chatbots': 'Chatbots de IA', 'Learning Sites': 'Sites de aprendizado', 'Search Tools': 'Ferramentas de busca', 'Indexes': 'Índices', 'URL Tools': 'Ferramentas de links',
    'Image Editing': 'Edição de imagem', 'Audio Generation': 'Geração de áudio', 'Font Tools': 'Ferramentas de fontes', 'Web Development': 'Desenvolvimento web',
    'Privacy / Security': 'Privacidade e segurança', 'Media Servers': 'Servidores de mídia', 'Twitch Tools': 'Ferramentas para Twitch', 'Image Generation': 'Geração de imagens',
    'Reddit Tools': 'Ferramentas para Reddit', 'Proxy': 'Proxy', 'Telegram Tools': 'Ferramentas para Telegram', 'Free Stuff': 'Coisas grátis', 'Fonts': 'Fontes',
    'Programming Languages': 'Linguagens de programação', 'Exam Prep': 'Preparação para provas', 'Video Players': 'Players de vídeo', 'Fediverse Tools': 'Ferramentas do Fediverso',
    'Archiving': 'Arquivamento', 'Photography / Cameras': 'Fotografia e câmeras', 'Aerospace Engineering': 'Engenharia aeroespacial', 'Game Dev Tools': 'Desenvolvimento de jogos', 'Open-source alternatives': 'Alternativas open source',
    'Markup Tools': 'Markdown e LaTeX', 'PDF Tools': 'Ferramentas de PDF', 'Adblocking': 'Bloqueio de anúncios', 'Windows ISOs': 'ISOs do Windows', 'Android Camera': 'Câmera no Android',
    'VPN': 'VPN', 'RSS Tools': 'Ferramentas de RSS', 'Open Source Intelligence': 'Pesquisa em fontes abertas (OSINT)', 'Twitter/X Tools': 'Ferramentas para Twitter/X',
    'File Transfer': 'Transferência de arquivos', 'Startpages / New Tab Pages': 'Páginas iniciais e nova aba', 'Antivirus': 'Antivírus', 'AI Benchmarks': 'Benchmarks de IA',
    'Browser Bookmarks': 'Favoritos do navegador', 'Emulators': 'Emuladores', '4chan Tools': 'Ferramentas para 4chan', 'Linux Guides': 'Guias de Linux',
    'Social Media Tools': 'Ferramentas de redes sociais', 'Documentaries': 'Documentários', 'Royalty Free Music': 'Música livre de royalties', 'Video Generation': 'Geração de vídeo',
    'TikTok Tools': 'Ferramentas para TikTok', 'Blogging Tools': 'Ferramentas para blogs', 'Dynamic DNS & Subdomains': 'DNS dinâmico e subdomínios', 'Dev Communities': 'Comunidades dev',
    'Tumblr Tools': 'Ferramentas para Tumblr', 'Linux Communities': 'Comunidades Linux', 'Unix-Like': 'Sistemas tipo Unix', 'AI Indexes': 'Índices de IA',
    'Bluesky Tools': 'Ferramentas para Bluesky', 'Facebook Tools': 'Ferramentas para Facebook', 'Linux Distros': 'Distros Linux', 'Dev News': 'Notícias dev',
    'Bilibili Tools': 'Ferramentas para Bilibili', 'Instagram Tools': 'Ferramentas para Instagram', 'AI Agents': 'Agentes de IA',
    'Web & APIs': 'Web e APIs', 'Other': 'Outros', 'Security': 'Segurança', 'Learning': 'Aprendizado', 'Image & Video': 'Imagem e vídeo', 'Self-hosted': 'Auto-hospedados',
    'DevTools': 'Ferramentas dev', 'Games & Creative': 'Jogos e criação', 'Agentic AI': 'IA agêntica', 'LLMs & Models': 'LLMs e modelos', 'Automation & Bots': 'Automação e bots',
    'Claude Skills': 'Skills do Claude', 'Data & Analytics': 'Dados e análise', 'Audio & Voice': 'Áudio e voz',
  };

  const KEY = 'toolbox.lang';
  const fromUrl = new URLSearchParams(location.search).get('l');
  let lang = ['en', 'pt'].includes(fromUrl) ? fromUrl : null;
  try { lang = lang || localStorage.getItem(KEY); } catch {}
  if (!['en', 'pt'].includes(lang)) lang = 'en';
  try { if (fromUrl) localStorage.setItem(KEY, lang); } catch {}
  document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';

  const t = (k, vars = {}) => (D[lang][k] ?? D.en[k] ?? k).replace(/\{(\w+)\}/g, (_, v) => vars[v] ?? '');
  const cat = c => lang === 'pt' ? (CAT_PT[c] || c) : c;
  const sec = s => lang === 'pt' ? (SEC_PT[s] || s) : s;
  const num = n => Number(n).toLocaleString(lang === 'pt' ? 'pt-BR' : 'en-US');

  function apply(root = document) {
    root.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    root.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
    root.querySelectorAll('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
    root.querySelectorAll('[data-i18n-title]').forEach(el => { el.title = t(el.dataset.i18nTitle); });
    root.querySelectorAll('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
  }
  // troca de idioma: guarda a escolha e recarrega mantendo o resto do link
  function set(next) {
    try { localStorage.setItem(KEY, next); } catch {}
    const u = new URL(location.href);
    next === 'en' ? u.searchParams.delete('l') : u.searchParams.set('l', next);
    location.href = u.href;
  }
  document.addEventListener('click', e => { if (e.target.closest('[data-setlang]')) set(lang === 'en' ? 'pt' : 'en'); });
  apply();
  // título da aba no idioma escolhido
  if (lang === 'pt') document.title = document.title
    .replace('useful tools and open-source repos', 'ferramentas úteis e repos open source')
    .replace(/^Agent ·/, 'Agente ·');

  window.I18N = { lang, t, cat, sec, num, apply, set };
})();
