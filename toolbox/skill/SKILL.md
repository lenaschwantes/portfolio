---
name: repo-scout
description: Use sempre que o usuário precisar achar, escolher ou avaliar um repo/lib/ferramenta open source pra um projeto, ex. "que repo eu uso pra X", "tem algo pronto pra Y", "qual lib pra isso", "procura uma ferramenta pra Z", "quero construir X, o que eu aproveito?", "alternativas a org/repo", "tem uma skill do Claude pra X?", ou antes de sugerir qualquer ferramenta externa de memória. Também pra ferramentas que não são repo (site, app, extensão, serviço online): "qual ferramenta uso pra X", "tem um site que faça Y", "app grátis pra Z". Também pra ideias: "me dá ideias de projeto/app", "o que dá pra construir com X", "/repo-scout ideias". Cruza o site toolbox (~12k ferramentas curadas do FMHY + ~6k repos trending) com a GitHub Search API ao vivo.
---

# Repo Scout

O compilado [ravena's toolbox](https://helena.schwantes.com.br/toolbox/) tem ~6k repos que passaram pelo GitHub Trending (Python e JavaScript, 2023 em diante), com categoria (inclui **Claude Skills**), rating (High/Medium/Low), estrelas, último commit, licença e repos parecidos pré-calculados. Esta skill cruza essa curadoria com o GitHub ao vivo pra achar repos que **contribuem diretamente** pra um projeto: coisa que o usuário instala e usa, ou estuda pra construir o dele.

O mesmo site tem também **~12k ferramentas** (sites, apps, extensões, serviços online) importadas das páginas de ferramentas do [FMHY](https://github.com/fmhy/edit), sem as seções de pirataria de mídia e de contorno de paywall/captcha (jailbreaks e prompts, pesos de modelos, roleplay, temp mail e proxies entram). Cada uma tem categoria do site (AI, Developer, Game dev, Business, Internet & Search, Privacy & Security, Files & PDF, Text & Writing, Image & Design, Video, Audio, Social Media, System, Linux & macOS, Mobile, Learning, Useful Sites), seção do FMHY, ⭐ (favorita dos editores do FMHY), ✔ pick (curadoria própria, de `curated/ferramentas.md`) e "eu uso" (`mine`, o que a usuária já usa nos projetos dela, de `curated/i-use.json`; vem primeiro no ranking). Também entram ~870 alternativas open source do [OpenAlternative](https://openalternative.co) (seção "Open-source alternatives" dentro de cada categoria, com `alt`: os apps pagos que elas substituem, e `oss: true`); pra "alternativa grátis/open source ao X", busque `--tools "X"`, porque o nome do app pago entra na busca. Há uma categoria **Business** (CRM, ERP, RH, notas fiscais, formulários). **Game dev** junta engines, assets, sprites, mapas e material pra aprender a fazer jogos.

**Regra: nunca recomendar repo, lib ou ferramenta de memória. Toda recomendação sai de uma rodada do `scout.py`.**

Requisitos: Python 3 e [gh CLI](https://cli.github.com) autenticado (`gh auth login`).

## Modo

- **Projeto** (default): o usuário descreve o que quer construir ou pergunta "qual lib pra X".
- **Ferramenta**: o usuário quer algo pronto pra usar, não código ("qual site/app/ferramenta pra X", "tem algo grátis que faça Y"). Usa `--tools`. Se a resposta puder ser tanto uma ferramenta quanto uma lib, roda `--tools` junto com `--local`/`--gh` na mesma chamada.
- **Alternativas**: o usuário cita um repo e quer opções parecidas, ou o repo citado está arquivado/abandonado.
- **Ideias**: o usuário pede ideias ("ideias", "o que dá pra construir", `/repo-scout ideias [tema]`).

Se o usuário citou um repo específico só pra avaliar, roda o sinal fresco dele (`gh repo view <org/repo> --json nameWithOwner,pushedAt,isArchived,stargazerCount,licenseInfo`) e avalia. Se ele estiver arquivado ou abandonado, emenda com `--similar`.

## A busca: `scout.py`

Sempre por este script, nunca busca improvisada. Ele baixa o compilado (cache semanal), soma candidatos locais se houver um `candidatos.json` ao lado do script, busca no GitHub (por estrelas e por best match), pega sinal fresco de tudo numa query GraphQL só, resolve renomeações, descarta arquivados e marca flags.

```bash
python <pasta-da-skill>/scout.py --local "<kw1|kw2|kw3>" --gh "<kw1 kw2>" --gh "<kw3>" --lang python
python <pasta-da-skill>/scout.py --similar owner/repo
python <pasta-da-skill>/scout.py --local "<kw1|kw2>" --cat "Claude Skills"
```

- `--local`: regex por palavra-chave contra nome+descrição do compilado. Use termos específicos e `\b` em palavras curtas (`\bclip\b` não pega "clipboard"). 3 a 6 termos.
- `--gh`: até 3 queries, **palavras sem aspas, máx 3 por query**.
- `--lang`: filtra compilado e GitHub (`python`, `javascript`). Omite se não importa: o compilado só tem Python e JavaScript, então pra outras linguagens só o GitHub responde.
- `--cat`: filtra o compilado por categoria. Use `"Claude Skills"` quando o pedido for skill, plugin ou ferramenta do Claude Code / agentes.
- `--similar owner/repo`: os 5 repos mais parecidos (embeddings do compilado, só não arquivados). Combina com `--local`/`--gh`.
- `--tools`: regex por palavra-chave contra nome, descrição, tags e seção das ferramentas do site. Mesmas regras do `--local`. Combina com tudo.
- `--tcat`: filtra as ferramentas por categoria do site (parte do nome basta: `"Privacy"`, `"Image"`). Atenção: geradores de IA (imagem, vídeo, voz, música) ficam em `"AI"`, não em `"Image"`/`"Audio"`. Pra quem faz jogo (engine, sprite, tileset, asset de jogo), use `"Game dev"`.
- Saída das ferramentas: `ferramentas[]` com `name, url, desc, tags, onde (categoria › seção › subseção), alt, oss, mine, pick, starred, hits, links` (GitHub e espelhos). Não tem sinal fresco: é a curadoria do FMHY, atualizada a cada 15 dias.
- Saída JSON: `avisos` + `repos[]` com `name, fonte (ambos|compilado|candidato|github), rating, category, hits, stars, pushed, license, flags, desc, url`.
- Se `avisos` vier com erro, mostra pro usuário. `hits` = quantas palavras-chave bateram no compilado: hits 1 em termo genérico costuma ser ruído.

## Modo projeto

1. **Decompor**: quebra o projeto em 2 a 5 peças técnicas (ex. estúdio de vídeo: transcrição, seleção de cortes, reenquadramento, legenda). Pedido de uma lib só = 1 peça.
2. **Buscar**: um `scout.py` por peça (rode em paralelo). Pra peça decisiva com um bom resultado do compilado, rode também `--similar` nele pra não perder a melhor opção.
3. **Julgar** cada resultado, lendo `desc`:
   - Descarta o que não serve pra peça (ruído de palavra-chave).
   - Classifica o papel: **Dependência** (instala e usa), **Referência** (estuda a arquitetura) ou **Concorrente** (produto pronto, serve pra achar o diferencial). Prefere dependências.
   - Flags: "pode estar abandonado" e "copyleft" não desqualificam sozinhos, mas avisa; copyleft nunca como dependência sem dizer.
   - **Curadoria primeiro**: repo `ambos`/`compilado` relevante e sem flag entra. Repo só `github` entra quando cobre peça que o compilado não cobre ou é claramente melhor; diz isso.
   - Se dúvida sobre um repo decisivo, lê o README: `gh api repos/<org/repo>/readme -H "Accept: application/vnd.github.raw" | head -c 3000`.
4. **Output**: uma tabela, agrupada por peça, top 1 a 3 por peça:

| Peça | Repo | Papel | Fonte | Licença | Último push | Por que serve |
|---|---|---|---|---|---|---|
| transcrição | `org/repo` | Dependência | ✅ ambos | MIT | há 2 dias | [1 frase específica pro projeto] |

Fonte: ✅ ambos · 🗂️ compilado · 🧪 candidato · 🔍 github.

Fecha com: qual instalar primeiro e por quê (1 a 2 frases), e a "versão 2h" (install + 5 linhas de uso) da dependência principal. Lista em 1 linha o que foi descartado por flag, se relevante. Se o resultado for uma skill do Claude, a "versão 2h" é como instalar (copiar a pasta com `SKILL.md` pra `~/.claude/skills/` ou instalar como plugin, conforme o README).

## Modo ferramenta

1. `scout.py --tools "<kw1|kw2|kw3>"` (+ `--tcat` se a categoria for óbvia). Se precisar de código também, emenda `--local`/`--gh` na mesma chamada.
2. **Julgar** lendo `desc` e `tags`: descarta ruído de palavra-chave. Ordem de preferência: ✔ pick, depois ⭐, depois o resto. Tags como `Sign-Up`, `No Sign-Up`, `Unlimited`, `10 Daily`, `Self-Hosted` dizem custo e limite: repete as que importam pro pedido.
3. Tabela, top 3 a 6: Ferramenta | Onde no site | ✔/⭐ | Limites (tags) | Por que serve (1 frase).
4. Fecha recomendando uma, com o porquê. Avisa se a escolhida exige cadastro, tem limite diário ou se o uso comercial não está claro.
5. Pedidos de OSINT sobre pessoas: mostra as ferramentas e lembra que dados pessoais são protegidos (LGPD/GDPR) mesmo quando públicos; não monta dossiê de pessoa privada.

## Modo alternativas

1. `scout.py --similar owner/repo` (+ `--gh` com 2 a 3 palavras do que o repo faz, pra cobrir o que não está no compilado).
2. Tabela Repo | Fonte | Estrelas | Último push | Licença | Diferença pro original (1 frase).
3. Fecha recomendando um, com o porquê.

## Modo ideias

1. **Temas**: com tema dado, quebra em 3 a 5 ângulos de produto. Sem tema, escolhe 3 a 5 temas de app de uso geral com cara de portfólio (dá preferência a categorias do compilado com muito High: Agentic AI, Claude Skills, Audio & Voice, Image & Video, Automation & Bots, Web & APIs).
2. **Buscar**: um `scout.py` por tema.
3. **Montar** 3 a 5 ideias, cada uma combinando 2 a 5 repos como peças (tabela Peça | Repo | Papel | Fonte). Pelo menos metade das peças de cada ideia vem do compilado.
4. Pra cada ideia: pitch de 1 linha + o que demonstra num portfólio.
5. Fecha recomendando uma, com o porquê. Oferece rodar o modo projeto nela.

## Regras gerais

- Responde no idioma do usuário, direto, sem hedge.
- Se nada servir, diz claramente em vez de forçar candidato fraco. Se o aviso "nada no compilado" aparecer, repete ele no output.
- Não repete repo que o usuário já rejeitou na conversa pro mesmo caso de uso.
- Máx 2 rodadas de busca por peça/tema: se nada servir, sugere reformular ou construir do zero.
- Repo bom achado só no GitHub: se existir a skill github-discovery, oferece guardar como candidato; senão, oferece adicionar ao `candidatos.json` ao lado do script (mesmo formato do compilado, com `"status": "candidato"`).
- Bug ou falha do `scout.py`: corrige o script e roda `python scout.py --selftest`, não contorna com busca improvisada.
