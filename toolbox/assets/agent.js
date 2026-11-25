// página do agente: busca semântica local (transformers.js) + IA do provedor escolhido, com a chave do próprio visitante
    import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2';

    env.allowLocalModels = false;
    env.useBrowserCache  = true;

    // ── constants ─────────────────────────────────────────────────────────
    const DB_NAME    = 'RepoEmbeddingsDB';
    const DB_VERSION = 1;
    const STORE_NAME = 'embeddings';
    const MODEL_NAME = 'Xenova/all-MiniLM-L6-v2';
    const MAX_LOCAL  = 15;
    const MAX_HIST   = 10;
    const HIST_KEY   = 'agent_history';

    const STREAMING_PROVIDERS = new Set(['anthropic', 'openrouter']);

    // ── state ─────────────────────────────────────────────────────────────
    let extractor, reposData = [], isReady = false;
    let searchHistory = JSON.parse(localStorage.getItem(HIST_KEY) || '[]');

    // ── providers ─────────────────────────────────────────────────────────
    const PROVIDERS = {
        anthropic:  { endpoint: 'https://api.anthropic.com/v1/messages',                                                      model: 'claude-sonnet-5-5',                placeholder: 'sk-ant-...' },
        groq:       { endpoint: 'https://api.groq.com/openai/v1/chat/completions',                                             model: 'llama-3.3-70b-versatile',          placeholder: 'gsk_...'    },
        gemini:     { endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',    model: 'gemini-1.5-flash',                 placeholder: 'AIza...'    },
        openrouter: { endpoint: 'https://openrouter.ai/api/v1/chat/completions',                                               model: 'google/gemini-2.0-flash-exp:free', placeholder: 'sk-or-...'  }
    };

    // ── UI refs ───────────────────────────────────────────────────────────
    const $ = id => document.getElementById(id);
    const ui = {
        provider:     $('provider-select'),
        apiKey:       $('api-key'),
        keyWarn:      $('api-key-warning'),
        query:        $('query-input'),
        searchBtn:    $('search-btn'),
        status:       $('status-msg'),
        progressBar:  $('progress-bar'),
        progressFill: $('progress-fill'),
        progressPct:  $('progress-pct'),
        results:      $('results-container'),
        overlay:      $('loading-overlay'),
        overlayTxt:   $('overlay-status'),
        history:      $('history-container'),
    };

    // ── api key persistence ────────────────────────────────────────────────
    ui.provider.addEventListener('change', () => {
        const p = ui.provider.value;
        ui.apiKey.placeholder = PROVIDERS[p].placeholder;
        const saved = localStorage.getItem(`api_key_${p}`) || '';
        ui.apiKey.value = saved;
        ui.keyWarn.classList.toggle('hidden', !saved);
    });
    ui.apiKey.addEventListener('input', () => {
        const p = ui.provider.value;
        localStorage.setItem(`api_key_${p}`, ui.apiKey.value);
        ui.keyWarn.classList.toggle('hidden', !ui.apiKey.value);
    });
    // apagar a chave salva deste provedor
    $('key-forget').addEventListener('click', () => {
        localStorage.removeItem(`api_key_${ui.provider.value}`);
        ui.apiKey.value = '';
        ui.keyWarn.classList.add('hidden');
        TB.toast(I18N.t('agent.keyGone'));
    });
    const _initKey = localStorage.getItem(`api_key_${ui.provider.value}`) || '';
    ui.apiKey.value = _initKey;
    if (_initKey) ui.keyWarn.classList.remove('hidden');

    // ── hash ──────────────────────────────────────────────────────────────
    async function hashStr(str) {
        const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
        return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('').slice(0,16);
    }

    // ── indexeddb ─────────────────────────────────────────────────────────
    function openDB() {
        return new Promise((res, rej) => {
            const req = indexedDB.open(DB_NAME, DB_VERSION);
            req.onupgradeneeded = e => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME))
                    db.createObjectStore(STORE_NAME, { keyPath: 'url' });
            };
            req.onsuccess = e => res(e.target.result);
            req.onerror   = e => rej(e.target.error);
        });
    }
    async function dbGetAll() {
        const db = await openDB();
        return new Promise((res, rej) => {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const req = tx.objectStore(STORE_NAME).getAll();
            req.onsuccess = () => res(req.result);
            req.onerror   = () => rej(req.error);
        });
    }
    async function dbSave(items) {
        const db = await openDB();
        return new Promise((res, rej) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            items.forEach(item => store.put(item));
            tx.oncomplete = res;
            tx.onerror    = () => rej(tx.error);
        });
    }
    async function dbClear() {
        const db = await openDB();
        return new Promise((res, rej) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            tx.objectStore(STORE_NAME).clear();
            tx.oncomplete = res;
            tx.onerror    = () => rej(tx.error);
        });
    }

    const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

    // ── similarity ────────────────────────────────────────────────────────
    function cosine(a, b) {
        let dot = 0, ma = 0, mb = 0;
        for (let i = 0; i < a.length; i++) { dot += a[i]*b[i]; ma += a[i]*a[i]; mb += b[i]*b[i]; }
        return dot / (Math.sqrt(ma) * Math.sqrt(mb));
    }

    // ── status / progress ─────────────────────────────────────────────────
    function setStatus(msg, type = 'muted') {
        ui.status.dataset.type = type;
        ui.status.innerText = msg;
    }
    function showProg(pct) {
        const c = Math.min(Math.max(pct, 0), 100);
        const f = Math.round(c / 10);
        ui.progressFill.textContent = '█'.repeat(f) + '░'.repeat(10 - f);
        ui.progressPct.innerText = `${Math.round(c)}%`;
        ui.progressBar.classList.remove('hidden');
    }
    function hideProg() { ui.progressBar.classList.add('hidden'); }

    // ── history ───────────────────────────────────────────────────────────
    function saveHistory() { localStorage.setItem(HIST_KEY, JSON.stringify(searchHistory)); }

    function addHistory(q) {
        searchHistory = [q, ...searchHistory.filter(h => h !== q)].slice(0, MAX_HIST);
        saveHistory(); renderHistory();
    }
    function removeHistory(q) {
        searchHistory = searchHistory.filter(h => h !== q);
        saveHistory(); renderHistory();
    }
    function renderHistory() {
        if (!searchHistory.length) { ui.history.classList.add('hidden'); return; }
        ui.history.classList.remove('hidden');
        ui.history.innerHTML =
            `<span class="hist-label">${I18N.t('st.recent')}</span>` +
            searchHistory.map(q => {
                const s = q.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
                return `<span class="hist-pill"><button class="hist-text" data-q="${s}">${s}</button>` +
                       `<button class="hist-rm" data-q="${s}" title="${I18N.t('st.remove')}">&#xD7;</button></span>`;
            }).join('');
        ui.history.querySelectorAll('.hist-text').forEach(b =>
            b.addEventListener('click', () => { ui.query.value = b.dataset.q; ui.searchBtn.click(); }));
        ui.history.querySelectorAll('.hist-rm').forEach(b =>
            b.addEventListener('click', () => removeHistory(b.dataset.q)));
    }

    // ── load precomputed embeddings from build-time JSON ──────────────────
    async function loadPrecomputed() {
        try {
            const r = await fetch('data/embeddings.json');
            if (!r.ok) return null;
            const { dim, urls, q } = await r.json();
            const bytes = new Int8Array(Uint8Array.from(atob(q), c => c.charCodeAt(0)).buffer);
            const map = new Map();
            urls.forEach((url, i) => {
                const v = Float32Array.from(bytes.subarray(i * dim, (i + 1) * dim));
                const norm = Math.hypot(...v) || 1;   // int8 sem escala: renormaliza
                for (let k = 0; k < dim; k++) v[k] /= norm;
                map.set(url, Array.from(v));
            });
            return map;
        } catch { return null; }
    }

    // ── init ──────────────────────────────────────────────────────────────
    async function init() {
        try {
            setStatus(I18N.t('st.loading'), 'info');

            let response;
            for (const path of ['data/repos.json', 'data/repos_enriched.json']) {
                try { const r = await fetch(path); if (r.ok) { response = r; break; } } catch {}
            }
            if (!response) throw new Error('repos.json');

            const reposText  = await response.text();
            const currHash   = await hashStr(reposText);
            const storedHash = localStorage.getItem('repos_hash');

            if (storedHash !== currHash) {
                setStatus(I18N.t('st.newData'), 'warn');
                await dbClear();
                localStorage.setItem('repos_hash', currHash);
            }

            reposData = JSON.parse(reposText);

            // 1) IndexedDB cache (mais rápido nas próximas visitas)
            const cached    = await dbGetAll();
            const cachedMap = new Map(cached.map(c => [c.url, c.embedding]));

            // 2) Arquivo pré-computado em build-time
            setStatus(I18N.t('st.emb'), 'info');
            const precomputed = await loadPrecomputed();

            // Quais repos ainda não têm embedding de nenhuma fonte
            const toEmbed = reposData.filter(r =>
                !cachedMap.has(r.url) && !(precomputed && precomputed.has(r.url))
            );

            if (toEmbed.length > 0) {
                // Só carrega o modelo se realmente precisar (repos novos não cobertos)
                setStatus(`Carregando modelo para ${toEmbed.length} repos novos...`, 'info');
                showProg(0);

                extractor = await pipeline('feature-extraction', MODEL_NAME, {
                    progress_callback: p => {
                        if ((p.status === 'progress' || p.status === 'download') && p.progress != null)
                            showProg(p.progress);
                        else if (p.status === 'done')
                            showProg(100);
                    }
                });

                hideProg();
                showProg(0);
                const batch = [];
                for (let i = 0; i < toEmbed.length; i++) {
                    const r   = toEmbed[i];
                    const txt = `${r.name} ${r.desc || ''} ${r.category || ''} ${r.lang || ''}`;
                    const out = await extractor(txt, { pooling: 'mean', normalize: true });
                    const emb = Array.from(out.data);
                    batch.push({ url: r.url, embedding: emb });
                    r.embedding = emb;
                    const pct = ((i + 1) / toEmbed.length) * 100;
                    if (i % 15 === 0 || i === toEmbed.length - 1) {
                        showProg(pct);
                        setStatus(`Indexando novos: ${i + 1} / ${toEmbed.length}`, 'info');
                    }
                }
                await dbSave(batch);
            }

            // Aplica embeddings em ordem de prioridade: IndexedDB > pré-computado > inline
            reposData.forEach(r => {
                if (r.embedding) return;
                if (cachedMap.has(r.url))         { r.embedding = cachedMap.get(r.url); return; }
                if (precomputed?.has(r.url))       { r.embedding = precomputed.get(r.url); }
            });

            // Salva embeddings do arquivo pré-computado no IndexedDB para acesso offline futuro
            if (precomputed && precomputed.size > 0 && cached.length < reposData.length) {
                const missing = reposData
                    .filter(r => r.embedding && !cachedMap.has(r.url))
                    .map(r => ({ url: r.url, embedding: r.embedding }));
                if (missing.length > 0) dbSave(missing).catch(() => {});
            }

            isReady = true;
            hideProg();
            setStatus(I18N.t('st.ready'), 'success');
            renderHistory();
        } catch (err) {
            hideProg();
            setStatus(I18N.t('st.error') + err.message, 'error');
            console.error(err);
        }
    }

    // ── llm (non-streaming) ───────────────────────────────────────────────
    async function callLLM(provider, apiKey, system, userContent) {
        const cfg = PROVIDERS[provider];
        const headers = { 'Content-Type': 'application/json' };

        if (provider === 'anthropic') {
            Object.assign(headers, { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' });
            const res = await fetch(cfg.endpoint, { method: 'POST', headers, body: JSON.stringify({ model: cfg.model, max_tokens: 2000, system, messages: [{ role: 'user', content: userContent }] }) });
            return (await res.json()).content?.[0]?.text ?? '';
        }
        if (provider === 'gemini') {
            const res = await fetch(`${cfg.endpoint}?key=${apiKey}`, { method: 'POST', headers, body: JSON.stringify({ contents: [{ parts: [{ text: `${system}\n\n${userContent}` }] }] }) });
            return (await res.json()).candidates?.[0]?.content?.parts?.[0]?.text ?? '';
        }
        headers['Authorization'] = `Bearer ${apiKey}`;
        const res = await fetch(cfg.endpoint, { method: 'POST', headers, body: JSON.stringify({ model: cfg.model, messages: [{ role: 'system', content: system }, { role: 'user', content: userContent }] }) });
        return (await res.json()).choices?.[0]?.message?.content ?? '';
    }

    // ── streaming ─────────────────────────────────────────────────────────
    async function streamSSE(res, onEvent) {
        const reader = res.body.getReader();
        const dec = new TextDecoder();
        let buf = '';
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buf += dec.decode(value, { stream: true });
            const lines = buf.split('\n');
            buf = lines.pop();
            for (const line of lines) {
                if (!line.startsWith('data: ')) continue;
                const d = line.slice(6).trim();
                if (d === '[DONE]') continue;
                try { onEvent(JSON.parse(d)); } catch {}
            }
        }
    }
    async function callLLMStream(provider, apiKey, system, userContent, onToken) {
        const cfg = PROVIDERS[provider];
        const headers = { 'Content-Type': 'application/json' };
        let full = '';
        const emit = t => { full += t; onToken(t); };

        if (provider === 'anthropic') {
            Object.assign(headers, { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' });
            const res = await fetch(cfg.endpoint, { method: 'POST', headers, body: JSON.stringify({ model: cfg.model, max_tokens: 2000, stream: true, system, messages: [{ role: 'user', content: userContent }] }) });
            await streamSSE(res, ev => { if (ev.type === 'content_block_delta' && ev.delta?.type === 'text_delta') emit(ev.delta.text); });
            return full;
        }
        headers['Authorization'] = `Bearer ${apiKey}`;
        const res = await fetch(cfg.endpoint, { method: 'POST', headers, body: JSON.stringify({ model: cfg.model, stream: true, messages: [{ role: 'system', content: system }, { role: 'user', content: userContent }] }) });
        await streamSSE(res, ev => { const t = ev.choices?.[0]?.delta?.content; if (t) emit(t); });
        return full;
    }

    // ── agent ─────────────────────────────────────────────────────────────
    async function runAgent(query) {
        const provider = ui.provider.value;
        const apiKey   = ui.apiKey.value.trim();
        if (!apiKey) { setStatus(I18N.t('st.needKey'), 'warn'); ui.apiKey.focus(); return; }

        ui.overlay.classList.remove('hidden');
        ui.results.innerHTML = '';
        addHistory(query);

        try {
            ui.overlayTxt.innerText = I18N.t('st.finding');
            setStatus(I18N.t('st.finding'), 'info');

            const qOut = await extractor(query, { pooling: 'mean', normalize: true });
            const qEmb = Array.from(qOut.data);
            const localResults = reposData
                .filter(r => r.embedding && !r.archived)
                .map(r => ({ ...r, sim: cosine(qEmb, r.embedding) }))
                .sort((a, b) => b.sim - a.sim)
                .slice(0, MAX_LOCAL);

            ui.overlayTxt.innerText = I18N.t('st.asking');
            setStatus(I18N.t('st.asking'), 'info');

            const system = `You are an expert on the repositories in the ravena's toolbox collection. Base your recommendations only on the repos provided. Be direct: explain why each repo fits the user's idea. Write desc and reason in the same language as the user's request.

Return ONLY a valid JSON array with up to 6 objects in this format:
[ { "name": "owner/repo", "url": "...", "desc": "...", "reason": "..." } ]`;

            const context = localResults.map(r => ({
                name: r.name, url: r.url, desc: r.desc || '',
                category: r.category || '', rating: r.rating || '',
                days: r.days || 0, lang: r.lang || ''
            }));
            const userContent = `The user wants: "${query}"\n\nMost similar repos in the collection (${localResults.length}):\n${JSON.stringify(context, null, 2)}`;

            let raw;

            if (STREAMING_PROVIDERS.has(provider)) {
                ui.overlay.classList.add('hidden');
                ui.results.innerHTML = `
                    <div id="stream-box" class="stream-win">
                        <div class="stream-win-bar">
                            <span class="stream-win-title">AI_RESPONSE.EXE</span>
                            <span class="stream-win-live">&#9679; LIVE</span>
                            <span class="stream-win-close">&#x2715;</span>
                        </div>
                        <div id="stream-text" class="stream-win-body"></div>
                    </div>`;
                const el = $('stream-text');
                const cur = document.createElement('span');
                cur.className = 'stream-cursor';
                el.appendChild(cur);
                raw = await callLLMStream(provider, apiKey, system, userContent, t => {
                    cur.insertAdjacentText('beforebegin', t);
                    el.scrollTop = el.scrollHeight;
                });
                $('stream-box')?.remove();
            } else {
                raw = await callLLM(provider, apiKey, system, userContent);
            }

            const match = raw.match(/\[[\s\S]*\]/);
            renderResults(match ? JSON.parse(match[0]) : []);
            setStatus(I18N.t('st.done'), 'success');
        } catch (err) {
            setStatus(I18N.t('st.error') + err.message, 'error');
            ui.results.innerHTML = `<div class="empty-win"><div class="empty-titlebar"><span class="empty-title">ERROR</span><span class="result-close">&#x2715;</span></div><div class="empty-body"><div class="empty-ico">&#x26A0;</div><p class="empty-msg">${esc(err.message)}</p></div></div>`;
            console.error(err);
        } finally {
            ui.overlay.classList.add('hidden');
            ui.overlayTxt.innerText = '';
        }
    }

    // ── render results ────────────────────────────────────────────────────
    function renderResults(repos) {
        if (!repos.length) {
            ui.results.innerHTML = `<div class="empty-win"><div class="empty-titlebar"><span class="empty-title">ERROR — 0 results</span><span class="result-close">&#x2715;</span></div><div class="empty-body"><div class="empty-ico">&#x26A0;</div><p class="empty-msg">${I18N.t('st.noResults')}</p></div></div>`;
            return;
        }
        // resposta da IA é não confiável (descrições de repos podem injetar prompt): escapa tudo
        const safeUrl = u => /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/.test(u || '') ? u : '#';
        ui.results.innerHTML = repos.map((r, i) => `
            <div class="result-card">
                <div class="result-titlebar">
                    <span class="result-num">${String(i+1).padStart(2,'0')}</span>
                    <a href="./?open=${encodeURIComponent('r:' + r.name)}" class="result-name">${esc(r.name)}</a>
                    <a href="${esc(safeUrl(r.url))}" target="_blank" rel="noopener" class="result-gh">GitHub ↗</a>
                </div>
                <div class="result-body">
                    <p class="result-desc">${esc(r.desc)}</p>
                    <div class="result-reason">
                        <div class="result-reason-label">&#x25B6; ${I18N.t('st.why')}</div>
                        <div class="result-reason-body">${esc(r.reason)}</div>
                    </div>
                </div>
            </div>`).join('');
    }

    // ── events ────────────────────────────────────────────────────────────
    ui.searchBtn.addEventListener('click', () => {
        const q = ui.query.value.trim();
        if (!q) return;
        if (!isReady) { setStatus(I18N.t('st.wait'), 'warn'); return; }
        runAgent(q);
    });
    ui.query.addEventListener('keypress', e => { if (e.key === 'Enter') ui.searchBtn.click(); });

    init();
