/* ==========================================================================
   admin.js — Painel do Organizador, Apuração ao Vivo e Modo Cerimônia
   --------------------------------------------------------------------------
   Depende de: firebase-config.js e app.js (que expõe window.Gala)
   ========================================================================== */
(function () {
  'use strict';

  const {
    CATEGORIAS, EV, Backend, tally, buildPublicResults, Confetti, toast, modal, esc, imgTag,
    trophySVG, laurelSVG, friendlyError, initAmbient, copyLink, $, $$, sleep, pad,
    pct, fmtPct, reduceMotion
  } = window.Gala;

  const CFG = window.GALA_CONFIG || {};

  const state = {
    user: null,
    authorized: false,
    evento: undefined,     // undefined = carregando, null = não existe
    votes: [],
    tallyData: tally([]),
    unsubEvento: null,
    unsubVotes: null,
    activeTab: 'live',
    censored: true // Começa SEMPRE censurado ao entrar para evitar spoilers acidentais
  };

  /* ========================================================================
     1. AUTORIZAÇÃO DO ORGANIZADOR
     ------------------------------------------------------------------------
     Verifica ADMIN_UID / ADMIN_EMAIL ANTES de carregar qualquer dado da
     coleção "votos". As regras do Firestore (firestore.rules) reforçam essa
     proteção no servidor.
     ======================================================================== */
  const isPlaceholder = (v) => !v || /SEU_|COLE|AQUI|seu\.email/i.test(String(v));

  function isAdminUser(user) {
    if (!user) return false;
    if (Backend.DEMO) return true;

    const uidSet = !isPlaceholder(CFG.ADMIN_UID);
    const emailSet = !isPlaceholder(CFG.ADMIN_EMAIL);

    // Se nenhum dos dois foi configurado ainda, bloqueia para mostrar o UID na tela
    if (!uidSet && !emailSet) return false;

    const uidOk = !uidSet || user.uid === String(CFG.ADMIN_UID).trim();
    const emailOk = !emailSet || (user.email || '').toLowerCase() === String(CFG.ADMIN_EMAIL).trim().toLowerCase();
    return uidOk && emailOk;
  }

  /* ========================================================================
     2. PORTÃO DE ACESSO (Gate)
     ======================================================================== */
  function showGate(mode) {
    $('#admin-gate').hidden = false;
    $('#admin-shell').hidden = true;
    $('#gate-loading').hidden = mode !== 'loading';
    $('#gate-login').hidden = mode !== 'login';
    $('#gate-denied').hidden = mode !== 'denied';
  }

  function showShell() {
    $('#admin-gate').hidden = true;
    $('#admin-shell').hidden = false;
  }

  function stopListeners() {
    if (state.unsubEvento) { state.unsubEvento(); state.unsubEvento = null; }
    if (state.unsubVotes) { state.unsubVotes(); state.unsubVotes = null; }
  }

  function enterAdmin(user) {
    state.authorized = true;
    showShell();

    // Preenche perfil no cabeçalho
    const av = $('#admin-avatar');
    av.innerHTML = user.photoURL
      ? `<img src="${esc(user.photoURL)}" alt="" referrerpolicy="no-referrer">`
      : `<span class="chip-avatar">${esc((user.displayName || user.email || 'A')[0].toUpperCase())}</span>`;
    $('#admin-email-label').textContent = user.email || user.displayName || 'Organizador';

    if (Backend.DEMO) {
      $('#btn-demo-seed-25').hidden = false;
      $('#btn-demo-seed-5').hidden = false;
    }

    // Só agora conecta nos listeners do Firestore
    stopListeners();

    state.unsubEvento = Backend.watchEvento(
      (ev) => {
        state.evento = ev;
        renderStatus();
        renderControl();
      },
      (err) => showAlert(`Erro ao ler <code>config/evento</code>: ${friendlyError(err)}`, true)
    );

    state.unsubVotes = Backend.watchVotes(
      (votes) => {
        state.votes = votes;
        state.tallyData = tally(votes);
        renderDashboard();
        renderControl();
        if (Ceremony.isOpen()) Ceremony.onDataUpdate();
      },
      (err) => {
        console.error(err);
        showAlert(
          `Não foi possível ler a coleção <code>votos</code> (${friendlyError(err)}). ` +
          `Verifique se o seu UID <code>${esc(user.uid)}</code> está colado no <code>firestore.rules</code> publicado no Firebase.`,
          true
        );
      }
    );
  }

  function showAlert(html, isError = false) {
    const el = $('#admin-alert');
    if (!html) { el.hidden = true; return; }
    el.hidden = false;
    el.classList.toggle('is-error', isError);
    el.innerHTML = html;
  }

  /* ========================================================================
     3. DASHBOARD EM TEMPO REAL
     ======================================================================== */
  function renderStatus() {
    const pill = $('#status-pill');
    const ev = state.evento;
    pill.classList.remove('is-open', 'is-closed');

    if (ev === undefined) {
      pill.innerHTML = '<i></i><span>CARREGANDO</span>';
      return;
    }
    if (ev === null) {
      pill.innerHTML = '<i></i><span>NÃO INICIALIZADA</span>';
      showAlert(
        'O documento <code>config/evento</code> ainda não existe no Firestore. ' +
        '<button class="btn btn-gold btn-sm" style="margin-left:10px" data-quick-init>Inicializar agora</button>'
      );
      return;
    }

    showAlert('');
    if (ev.cortinasFechadas === true) {
      pill.classList.add('is-closed');
      pill.innerHTML = '<i></i><span>CORTINAS FECHADAS</span>';
    } else if (ev.votacaoAberta === true) {
      pill.classList.add('is-open');
      pill.innerHTML = '<i></i><span>VOTAÇÃO ABERTA</span>';
    } else {
      pill.classList.add('is-closed');
      pill.innerHTML = '<i></i><span>ENCERRADA · PUBLICADA</span>';
    }
  }

  function renderDashboard() {
    const data = state.tallyData;
    const total = data.totalVotos;

    // Estatísticas do topo
    $('#stat-votes').textContent = total;

    const totalNominees = CATEGORIAS.reduce((acc, c) => acc + c.indicados.length, 0);
    $('#stat-cats').textContent = CATEGORIAS.length;
    $('#stat-nominees').textContent = `${totalNominees} indicados no total`;

    // Último voto recebido
    const dates = state.votes.map((v) => Backend.toDate(v.criadoEm)).filter(Boolean).sort((a, b) => b - a);
    if (dates.length) {
      const d = dates[0];
      $('#stat-last').textContent = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      $('#stat-mode').textContent = d.toLocaleDateString('pt-BR');
    } else {
      $('#stat-last').textContent = '—';
      $('#stat-mode').textContent = 'Nenhum voto ainda';
    }

    // Estado do botão e banner de censura
    const censorBtn = $('#btn-toggle-censor');
    const censorBanner = $('#live-censor-banner');
    if (censorBtn) {
      censorBtn.setAttribute('aria-pressed', String(state.censored));
      censorBtn.classList.toggle('btn-gold', state.censored);
      censorBtn.classList.toggle('btn-outline', !state.censored);
      censorBtn.textContent = state.censored
        ? '🙈 Censura ATIVA · Desativar'
        : '🙈 Censurar parciais';
    }
    if (censorBanner) censorBanner.hidden = !state.censored;

    // Cards de apuração por categoria
    const grid = $('#live-grid');
    grid.classList.toggle('is-censored', state.censored);
    grid.innerHTML = data.categorias.map((c, i) => {
      if (state.censored) {
        // Modo censurado: ordem original, sem foto/nome/votos/coroa (zero spoiler mesmo olhando de perto)
        return `
          <article class="live-card glass is-censored-card">
            <header>
              <div class="live-idx">${pad(i + 1)}</div>
              <div>
                <h3>${esc(c.titulo)}</h3>
                <p class="live-total">${c.total} voto${c.total === 1 ? '' : 's'} · <span>Parciais ocultas</span></p>
              </div>
            </header>
            <ul class="live-list">
              ${c.indicados.map(() => `
                <li class="live-row is-masked">
                  <span class="live-avatar-locked" aria-hidden="true">🔒</span>
                  <div class="live-main">
                    <div class="live-line">
                      <span class="live-name">••••••••••••</span>
                      <span class="live-val"><b>••</b> · --%</span>
                    </div>
                    <div class="bar"><i style="width:0%"></i></div>
                  </div>
                </li>`).join('')}
            </ul>
          </article>`;
      }

      const sorted = [...c.indicados].sort((a, b) => b.votos - a.votos);
      const winners = c.vencedores || [];
      return `
        <article class="live-card glass">
          <header>
            <div class="live-idx">${pad(i + 1)}</div>
            <div>
              <h3>${esc(c.titulo)}</h3>
              <p class="live-total">${c.total} voto${c.total === 1 ? '' : 's'}${winners.length > 1 ? ' · <b style="color:var(--gold-2)">Empate</b>' : ''}</p>
            </div>
          </header>
          <ul class="live-list">
            ${sorted.map((n) => {
              const isLeader = winners.includes(n.id) && n.votos > 0;
              const p = pct(n.votos, c.total);
              return `
                <li class="live-row ${isLeader ? 'is-leader' : ''}">
                  ${imgTag(n.foto, n.nome, 'live-avatar')}
                  <div class="live-main">
                    <div class="live-line">
                      <span class="live-name">${esc(n.nome)}</span>
                      <span class="live-val"><b>${n.votos}</b> · ${fmtPct(n.votos, c.total)}</span>
                    </div>
                    <div class="bar"><i style="width:${p}%"></i></div>
                  </div>
                  <span class="live-crown" aria-hidden="true">👑</span>
                </li>`;
            }).join('')}
          </ul>
        </article>`;
    }).join('');

    // Lista de quem já votou (apenas nome/e-mail do Google, nunca as escolhas)
    const votersCount = $('#voters-count');
    const votersList = $('#voters-list');
    if (votersCount) votersCount.textContent = `${total} pessoa${total === 1 ? '' : 's'}`;
    if (votersList) {
      if (!state.votes.length) {
        votersList.innerHTML = `<li class="voters-empty">Nenhum voto registrado ainda.</li>`;
      } else {
        const sortedVotes = [...state.votes].sort((a, b) => {
          const da = Backend.toDate(a.criadoEm);
          const db = Backend.toDate(b.criadoEm);
          return (db ? db.getTime() : 0) - (da ? da.getTime() : 0);
        });
        votersList.innerHTML = sortedVotes.map((v, idx) => {
          const d = Backend.toDate(v.criadoEm);
          const hora = d ? d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '';
          const nome = v.nome || v.email || `Votante #${sortedVotes.length - idx}`;
          const email = v.email && v.email !== nome ? v.email : '';
          const init = nome.trim().slice(0, 1).toUpperCase();
          return `
            <li class="voter-item">
              <span class="voter-av" aria-hidden="true">${esc(init)}</span>
              <span class="voter-info">
                <strong>${esc(nome)}</strong>
                ${email ? `<small>${esc(email)}</small>` : ''}
              </span>
              ${hora ? `<span class="voter-time">${hora}</span>` : ''}
            </li>`;
        }).join('');
      }
    }
  }

  /* ========================================================================
     4. CONTROLE, INICIALIZAÇÃO, ENCERRAMENTO E LIBERAÇÃO 1 POR 1 (ANTI-SPOILER)
     ======================================================================== */

  /** Retorna o mapa { [catId]: true } das categorias atualmente liberadas no site público. */
  function getRevealedMap() {
    const ev = state.evento;
    const r = ev && ev.resultadosFinais;
    if (!r) return {};
    if (r.reveladas && typeof r.reveladas === 'object') return { ...r.reveladas };
    if (Array.isArray(r.categorias)) {
      const m = {};
      r.categorias.forEach((c) => {
        if (c.revelada !== false) m[c.id] = true;
      });
      return m;
    }
    return {};
  }

  function getPalcoIdx() {
    const ev = state.evento;
    const r = ev && ev.resultadosFinais;
    return r && typeof r.palcoIdx === 'number' ? r.palcoIdx : 0;
  }

  /** Salva no config/evento apenas as categorias autorizadas pelo ADM (sem spoiler das demais). */
  async function syncPublicStage(revMap, palcoIdx, toastMsg = '') {
    try {
      const freshVotes = state.votes.length ? state.votes : await Backend.getAllVotes();
      const fullTally = tally(freshVotes);
      const publicPayload = buildPublicResults(fullTally, revMap, palcoIdx);
      await Backend.publishResults(publicPayload);
      if (toastMsg) toast(toastMsg, 'success', 3800);
    } catch (e) {
      toast(friendlyError(e), 'error', 6000);
    }
  }

  function renderControl() {
    const ev = state.evento;
    const btnClose = $('#btn-close-voting');
    const btnReopen = $('#btn-reopen-voting');
    const btnInit = $('#btn-init-evento');
    const revealCard = $('#ctrl-reveal-card');
    const kv = $('#ctrl-kv');

    if (ev === undefined) return;

    const exists = ev !== null;
    const curtainsClosed = exists && ev.cortinasFechadas === true;
    const open = exists && ev.votacaoAberta === true;
    const pubDate = exists && ev.resultadosFinais ? Backend.toDate(ev.resultadosFinais.publicadoEm) : null;
    const revMap = getRevealedMap();
    const revCount = CATEGORIAS.filter((c) => !!revMap[c.id]).length;

    kv.innerHTML = `
      <dt>Documento</dt><dd>${exists ? '✅ Criado' : '⚠️ Não existe'}</dd>
      <dt>Cortinas</dt><dd>${!exists ? '🎭 Fechadas' : curtainsClosed ? '🎭 Fechadas' : '🎬 Abertas'}</dd>
      <dt>Status</dt><dd>${!exists ? '—' : open ? '🟢 Aberta' : '🔴 Encerrada'}</dd>
      <dt>Votos na base</dt><dd>${state.votes.length}</dd>
      <dt>Troféus liberados</dt><dd>${!exists || open ? '—' : `${revCount} de ${CATEGORIAS.length}`}</dd>
      <dt>Publicado em</dt><dd>${pubDate ? pubDate.toLocaleString('pt-BR') : 'Não publicado'}</dd>
    `;

    btnInit.disabled = exists;
    btnInit.textContent = exists ? 'config/evento já inicializado ✓' : 'Inicializar config/evento';

    const btnCurtains = $('#btn-toggle-curtains');
    if (btnCurtains) {
      btnCurtains.hidden = !exists;
      if (exists) {
        btnCurtains.classList.toggle('btn-gold', curtainsClosed);
        btnCurtains.classList.toggle('btn-outline', !curtainsClosed);
        btnCurtains.textContent = curtainsClosed
          ? '🎬 Abrir as Cortinas (Liberar Site)'
          : '🎭 Fechar as Cortinas (Modo Espera)';
      }
    }

    if (!exists) {
      btnClose.textContent = 'INICIALIZAR VOTAÇÃO PRIMEIRO';
      btnClose.disabled = true;
      btnReopen.hidden = true;
      if (revealCard) revealCard.hidden = true;
    } else if (open) {
      btnClose.disabled = false;
      btnClose.textContent = 'ENCERRAR VOTAÇÃO (MODO SUSPENSE)';
      btnReopen.hidden = true;
      if (revealCard) revealCard.hidden = true;
    } else {
      btnClose.disabled = false;
      btnClose.textContent = 'ATUALIZAR CONTAGEM DE VOTOS';
      btnReopen.hidden = false;
      if (revealCard) {
        revealCard.hidden = false;
        renderRevealControl(revMap, getPalcoIdx());
      }
    }
  }

  /** Renderiza o painel de controle remoto 1 por 1 (anti-spoiler nos celulares). */
  function renderRevealControl(revMap, palcoIdx) {
    const cats = state.tallyData.categorias;
    const revCount = cats.filter((c) => !!revMap[c.id]).length;
    const pill = $('#reveal-progress-pill');
    if (pill) {
      pill.innerHTML = `<i></i><span>${revCount}/${cats.length} LIBERADAS NOS CELULARES</span>`;
    }

    // Próxima categoria que ainda está trancada (🔒)
    const nextIdx = cats.findIndex((c) => !revMap[c.id]);
    const nextBar = $('#reveal-next-bar');
    if (nextBar) {
      if (nextIdx !== -1) {
        const nc = cats[nextIdx];
        const winners = nc.indicados.filter((n) => (nc.vencedores || []).includes(n.id));
        const winNames = winners.length ? winners.map((w) => esc(w.nome)).join(' &amp; ') : 'Sem votos';
        const onSuspense = palcoIdx === nextIdx && !revMap[nc.id];
        nextBar.innerHTML = `
          <div class="reveal-next-box">
            <div class="reveal-next-info">
              <span class="reveal-next-kicker">PRÓXIMO TROFÉU NA FILA (${pad(nextIdx + 1)} DE ${pad(cats.length)})</span>
              <strong>${esc(nc.titulo)}</strong>
              <small>Campeão apurado (secreto p/ alunos): <b style="color:var(--gold-2)">${winNames}</b></small>
            </div>
            <div class="reveal-next-btns">
              ${onSuspense
                ? `<span class="reveal-stage-tag">✉️ Já em suspense nos celulares</span>`
                : `<button class="btn btn-outline btn-sm" data-adm-suspense="${nextIdx}">✉️ Mostrar Indicados (Suspense)</button>`}
              <button class="btn btn-gold" data-adm-unlock="${nextIdx}">
                <span>🏆 LIBERAR VENCEDOR #${pad(nextIdx + 1)} NOS CELULARES →</span>
              </button>
            </div>
          </div>`;
      } else {
        nextBar.innerHTML = `
          <div class="reveal-next-box is-done">
            <div>
              <strong style="color:var(--gold-2)">🎉 Todos os ${cats.length} troféus foram revelados!</strong>
              <small style="display:block;color:var(--muted)">A galeria completa já está liberada nos celulares da turma.</small>
            </div>
          </div>`;
      }
    }

    // Lista individual de categorias
    const list = $('#ctrl-reveal-list');
    if (list) {
      list.innerHTML = cats.map((c, i) => {
        const isRev = !!revMap[c.id];
        const isStage = palcoIdx === i;
        const winners = c.indicados.filter((n) => (c.vencedores || []).includes(n.id));
        const top = winners[0];
        const winLabel = top
          ? `${winners.map((w) => esc(w.nome)).join(' &amp; ')} <em>(${top.votos}v · ${fmtPct(top.votos, c.total)})</em>`
          : '<em>Sem votos</em>';
        const badge = isRev
          ? `<span class="rev-badge is-rev">🏆 LIBERADA${isStage ? ' · EM FOCO' : ''}</span>`
          : isStage
            ? `<span class="rev-badge is-susp">✉️ EM SUSPENSE NO PALCO</span>`
            : `<span class="rev-badge is-lock">🔒 BLOQUEADA (SEM SPOILER)</span>`;

        return `
          <li class="reveal-row ${isRev ? 'is-rev' : isStage ? 'is-susp' : 'is-lock'}">
            <div class="reveal-row-main">
              <div class="reveal-row-top">
                <span class="reveal-row-num">${pad(i + 1)}</span>
                <strong>${esc(c.titulo)}</strong>
                ${badge}
              </div>
              <div class="reveal-row-win">👑 Campeão: <b>${winLabel}</b></div>
            </div>
            <div class="reveal-row-acts">
              ${!isRev ? `
                ${!isStage ? `<button class="btn btn-ghost btn-sm" data-adm-suspense="${i}" title="Mostra apenas os indicados desta categoria nos celulares">✉️ Suspense</button>` : ''}
                <button class="btn btn-gold btn-sm" data-adm-unlock="${i}">🏆 Liberar Vencedor</button>
              ` : `
                ${!isStage ? `<button class="btn btn-outline btn-sm" data-adm-focus="${i}">🎯 Focar nos Celulares</button>` : ''}
                <button class="btn btn-ghost btn-sm" data-adm-lock="${i}" title="Trancar novamente contra spoilers">🔒 Ocultar</button>
              `}
            </div>
          </li>`;
      }).join('');
    }
  }

  async function handleInitEvento() {
    const btn = $('#btn-init-evento');
    btn.classList.add('is-loading');
    try {
      const created = await Backend.initEvento();
      toast(created ? '✅ Documento config/evento criado! A votação está aberta.' : 'O documento config/evento já existia.', 'success');
    } catch (e) {
      toast(friendlyError(e), 'error', 7000);
    } finally {
      btn.classList.remove('is-loading');
    }
  }

  async function handleCloseVoting() {
    const isAlreadyClosed = state.evento && state.evento.votacaoAberta === false;
    const ok = await modal({
      icon: trophySVG(),
      title: isAlreadyClosed ? 'Atualizar contagem de votos?' : 'Encerrar votação (Modo Suspense)?',
      html: isAlreadyClosed
        ? `<p>Isso recalcula os <b>${state.votes.length}</b> votos mantendo apenas as categorias que você já liberou visíveis nos celulares.</p>`
        : `<p>Ao confirmar, a votação será <b>encerrada</b> (${state.votes.length} votos computados).</p>
           <p>✉️ <b>Zero Spoilers:</b> nenhum vencedor será mostrado nos celulares ainda! Todas as categorias ficam em suspense até você revelar uma por uma no <b>Modo Cerimônia</b> (ou aqui pelo painel).</p>`,
      confirmText: isAlreadyClosed ? 'Atualizar' : 'Encerrar em Modo Suspense',
      cancelText: 'Cancelar',
      requireText: isAlreadyClosed ? '' : 'ENCERRAR'
    });
    if (!ok) return;

    const btn = $('#btn-close-voting');
    btn.classList.add('is-loading');
    try {
      const freshVotes = await Backend.getAllVotes();
      const fullTally = tally(freshVotes);
      // Ao encerrar, começa com ZERO categorias reveladas — só libera quando o ADM revelar no Modo Cerimônia!
      const revMap = isAlreadyClosed ? getRevealedMap() : {};
      const palcoIdx = isAlreadyClosed ? getPalcoIdx() : 0;
      const publicPayload = buildPublicResults(fullTally, revMap, palcoIdx);
      await Backend.publishResults(publicPayload);
      Confetti.cannons();
      toast(
        isAlreadyClosed
          ? '✅ Contagem atualizada!'
          : '✉️ Votação encerrada em Modo Suspense! Nenhum vencedor aparece até você revelar no Modo Cerimônia.',
        'success',
        6000
      );
    } catch (e) {
      toast(friendlyError(e), 'error', 7000);
    } finally {
      btn.classList.remove('is-loading');
    }
  }

  async function handleReopenVoting() {
    const ok = await modal({
      title: 'Reabrir a votação?',
      html: '<p>Os resultados públicos serão ocultados novamente e novos alunos (que ainda não votaram) poderão enviar seus votos.</p>',
      confirmText: 'Reabrir votação',
      cancelText: 'Cancelar',
      danger: true
    });
    if (!ok) return;

    const btn = $('#btn-reopen-voting');
    btn.classList.add('is-loading');
    try {
      await Backend.reopen();
      toast('🔓 Votação reaberta e resultados ocultados.', 'info', 4000);
    } catch (e) {
      toast(friendlyError(e), 'error', 6000);
    } finally {
      btn.classList.remove('is-loading');
    }
  }

  /* ========================================================================
     5. SOM DA CERIMÔNIA (Web Audio API — zero arquivos externos)
     ======================================================================== */
  const Sound = (() => {
    let ctx = null;
    let enabled = true;

    function getCtx() {
      if (!enabled) return null;
      if (!ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) ctx = new AC();
      }
      if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
      return ctx;
    }

    /** Toque suave de suspense a cada passo do holofote. */
    function tick(pitch = 1) {
      const c = getCtx(); if (!c) return;
      const now = c.currentTime;
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = 'triangle';
      o.frequency.setValueAtTime(140 * pitch, now);
      o.frequency.exponentialRampToValueAtTime(65, now + 0.08);
      g.gain.setValueAtTime(0.14, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      o.connect(g).connect(c.destination);
      o.start(now); o.stop(now + 0.1);
    }

    /** Acorde dourado triunfal na hora da revelação. */
    function fanfare() {
      const c = getCtx(); if (!c) return;
      const now = c.currentTime;
      // Acorde maior aberto (Dó - Mi - Sol - Dó - Mi) com brilho suave
      const notes = [261.63, 329.63, 392.0, 523.25, 659.25];
      notes.forEach((freq, i) => {
        const o = c.createOscillator();
        const g = c.createGain();
        o.type = i < 2 ? 'sawtooth' : 'triangle';
        const f = c.createBiquadFilter();
        f.type = 'lowpass';
        f.frequency.setValueAtTime(1800, now);
        o.frequency.setValueAtTime(freq, now + i * 0.055);
        g.gain.setValueAtTime(0.0001, now + i * 0.055);
        g.gain.linearRampToValueAtTime(0.08, now + i * 0.055 + 0.06);
        g.gain.exponentialRampToValueAtTime(0.0008, now + 2.4);
        o.connect(f).connect(g).connect(c.destination);
        o.start(now + i * 0.055);
        o.stop(now + 2.5);
      });
    }

    function toggle() { enabled = !enabled; return enabled; }
    return { tick, fanfare, toggle, isEnabled: () => enabled };
  })();

  /* ========================================================================
     6. MODO CERIMÔNIA / REVELAÇÃO (Tela cheia para projetar no evento)
     ======================================================================== */
  const Ceremony = (() => {
    const root = $('#ceremony');
    const stage = $('#cer-stage');
    let open = false;
    let step = 'select'; // 'select' | 'nominees' | 'spinning' | 'winner'
    let catIdx = 0;
    let showVotes = true;
    const revealed = new Set();

    function getCat(i) {
      return state.tallyData.categorias[i] || null;
    }

    function enter() {
      open = true;
      root.hidden = false;
      document.body.classList.add('no-scroll');
      renderSelect();
      // Tenta entrar em tela cheia (ignora se o navegador exigir outro gesto)
      if (root.requestFullscreen && !document.fullscreenElement) {
        root.requestFullscreen().catch(() => {});
      }
    }

    function exit() {
      open = false;
      root.hidden = true;
      document.body.classList.remove('no-scroll');
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    }

    function toggleFullscreen() {
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      else if (root.requestFullscreen) root.requestFullscreen().catch(() => {});
    }

    function renderSelect() {
      step = 'select';
      stage.innerHTML = `
        <div class="cer-select">
          <div class="cer-brand">
            ${trophySVG()}
            <h1 class="gold-text shine">${esc(EV.nome)}<span>${esc(EV.ano)}</span></h1>
            <p>Selecione a categoria que será anunciada agora</p>
          </div>
          <div class="cer-cat-grid">
            ${state.tallyData.categorias.map((c, i) => `
              <button class="cer-cat glass ${revealed.has(c.id) ? 'is-done' : ''}" data-cer-cat="${i}" style="--i:${i}">
                <span class="cer-cat-n">CATEGORIA ${pad(i + 1)}</span>
                <span class="cer-cat-t">${esc(c.titulo)}</span>
                ${revealed.has(c.id) ? '<span class="cer-cat-done">✓ JÁ REVELADA</span>' : ''}
              </button>`).join('')}
          </div>
        </div>`;
    }

    function renderNominees(i) {
      catIdx = i;
      step = 'nominees';
      const c = getCat(i);
      if (!c) return renderSelect();
      const cols = Math.min(c.indicados.length, 4);

      // Se a votação já foi encerrada, coloca esta categoria em foco nos celulares (sem revelar o vencedor ainda se estiver trancada)
      if (state.evento && state.evento.votacaoAberta === false) {
        syncPublicStage(getRevealedMap(), i);
      }

      stage.innerHTML = `
        <div class="cer-nominees">
          <p class="cer-kicker">Os indicados à categoria ${pad(i + 1)} são…</p>
          <h1 class="cer-title gold-text">${esc(c.titulo)}</h1>
          ${c.descricao ? `<p class="cer-desc">${esc(c.descricao)}</p>` : ''}
          <div class="cer-grid" style="--cols:${cols}">
            ${c.indicados.map((n, k) => `
              <div class="cer-card" data-nom-id="${esc(n.id)}" style="--i:${k}">
                <div class="cer-photo">${imgTag(n.foto, n.nome)}</div>
                <h3>${esc(n.nome)}</h3>
                ${n.apelido ? `<p>${esc(n.apelido)}</p>` : ''}
              </div>`).join('')}
          </div>
          <div id="cer-reveal-wrap">
            <button id="cer-btn-reveal" class="btn btn-gold cer-reveal">
              <span>🏆 REVELAR VENCEDOR</span>
            </button>
          </div>
        </div>`;
    }

    async function revealWinner() {
      if (step !== 'nominees') return;
      const c = getCat(catIdx);
      if (!c) return;
      step = 'spinning';

      const grid = $('.cer-grid', stage);
      const cards = $$('.cer-card', stage);
      const wrap = $('#cer-reveal-wrap', stage);
      wrap.innerHTML = '<p class="cer-suspense">E o troféu vai para…</p>';

      if (!reduceMotion && cards.length > 1) {
        grid.classList.add('is-spinning');
        // Sequência de holofote: começa rápido e vai desacelerando no suspense
        const delays = [90, 90, 100, 110, 120, 140, 165, 195, 235, 285, 350, 440];
        let last = -1;
        for (let k = 0; k < delays.length; k++) {
          if (!open || step !== 'spinning') return;
          let pick = k % cards.length;
          if (pick === last) pick = (pick + 1) % cards.length;
          last = pick;
          cards.forEach((el, idx) => el.classList.toggle('spot', idx === pick));
          Sound.tick(1 + k * 0.04);
          await sleep(delays[k]);
        }
        // Pausa dramática no escuro
        cards.forEach((el) => el.classList.remove('spot'));
        await sleep(360);
      }

      if (!open || step !== 'spinning') return;
      revealed.add(c.id);
      // Libera automaticamente este vencedor nos celulares da turma!
      if (state.evento && state.evento.votacaoAberta === false) {
        const revMap = getRevealedMap();
        revMap[c.id] = true;
        syncPublicStage(revMap, catIdx);
      }
      renderWinner(c);
    }

    function renderWinner(c) {
      step = 'winner';
      const winners = c.indicados.filter((n) => (c.vencedores || []).includes(n.id));
      const tie = winners.length > 1;
      const top = winners[0];
      const hasPrev = catIdx > 0;
      const hasNext = catIdx < state.tallyData.categorias.length - 1;
      const nextCat = hasNext ? state.tallyData.categorias[catIdx + 1] : null;

      Sound.fanfare();
      Confetti.cannons();
      Confetti.rain(4200);

      stage.innerHTML = `
        <div class="cer-winner">
          <div class="cer-rays" aria-hidden="true"></div>
          <div class="spot-call-badge" style="margin-bottom:10px;">🏆 HORA DO TROFÉU · SUBA AO PALCO!</div>
          <div class="cat-kicker"><span></span>CATEGORIA ${pad(catIdx + 1)} · ${esc(c.titulo)}<span></span></div>

          ${top ? `
            <div class="cer-win-photo-wrap">
              ${winners.map((w) => `<div class="cer-win-photo">${imgTag(w.foto, w.nome)}</div>`).join('')}
            </div>
            <div class="cer-win-trophy">${trophySVG()}</div>
            <p class="cer-win-label">${tie ? 'OS VENCEDORES · EMPATE' : 'VENCEDOR(A) OFICIAL'}</p>
            <h1 class="cer-win-name gold-text shine">${winners.map((w) => esc(w.nome)).join(' &amp; ')}</h1>
            ${!tie && top.apelido ? `<p class="cer-win-nick">${esc(top.apelido)}</p>` : ''}
            <p id="cer-win-votes" class="cer-win-votes" ${showVotes ? '' : 'hidden'}>
              ${top.votos} voto${top.votos === 1 ? '' : 's'} · ${fmtPct(top.votos, c.total)}
            </p>
          ` : `
            <div class="cer-win-trophy" style="margin-top:30px">${trophySVG()}</div>
            <h1 class="cer-win-name gold-text" style="font-size:clamp(28px,5vw,56px)">Sem votos nesta categoria</h1>
          `}

          <div class="cer-actions">
            <button class="btn btn-ghost" data-cer-back>☰ Categorias</button>
            ${hasPrev ? `<button class="btn btn-ghost" data-cer-prev>← Anterior</button>` : ''}
            <button class="btn btn-outline" data-cer-confetti>🎉 Mais confetes (Foto!)</button>
            ${hasNext
              ? `<button class="btn btn-gold" data-cer-next>Próximo: ${pad(catIdx + 2)} · ${esc(nextCat.titulo)} →</button>`
              : `<button class="btn btn-gold" data-cer-finish>✨ Finalizar Cerimônia →</button>`}
          </div>
        </div>`;
    }

    function renderFinale() {
      step = 'finale';
      Sound.fanfare();
      Confetti.cannons();
      Confetti.rain(5000);

      const cats = state.tallyData.categorias || [];
      const hall = cats.map((c, i) => {
        const winners = c.indicados.filter((n) => (c.vencedores || []).includes(n.id));
        const names = winners.length ? winners.map((w) => esc(w.nome)).join(' &amp; ') : '—';
        return `<div class="finale-hall-item"><span class="finale-hall-cat">${pad(i + 1)} · ${esc(c.titulo)}</span><strong>🏆 ${names}</strong></div>`;
      }).join('');

      stage.innerHTML = `
        <div class="cer-finale">
          <div class="cat-kicker"><span></span>ENCERRAMENTO OFICIAL · ${esc(EV.nome)} ${esc(EV.ano)}<span></span></div>
          <h1 class="finale-title gold-text">Uma noite para a história!</h1>
          <p class="finale-sub">Obrigado a todo o Terceirão por cada voto, risada, torcida e momento inesquecível. Vocês fizeram deste evento algo único! ✨</p>

          <div class="finale-frame">
            <img src="final.jpg" alt="Agradecemos por ter votado!" width="1280" height="720" loading="eager">
          </div>

          ${cats.length ? `
            <div class="finale-hall">
              <span class="finale-hall-label">Hall da Fama · Campeões de ${esc(EV.ano)}</span>
              <div class="finale-hall-grid">${hall}</div>
            </div>
          ` : ''}

          <p class="finale-credits">✦ Grande Gala do Terceirão · Até sempre, Colégio WGS ✦</p>

          <div class="cer-actions" style="margin-top:24px;">
            <button class="btn btn-ghost" data-cer-back>☰ Voltar às categorias</button>
            <button class="btn btn-gold" data-cer-confetti>🎉 Chuva de Confetes!</button>
          </div>
        </div>`;
    }

    function onDataUpdate() {
      if (step === 'select') renderSelect();
    }

    // Cliques dentro da cerimônia
    root.addEventListener('click', (e) => {
      const catBtn = e.target.closest('[data-cer-cat]');
      if (catBtn) return renderNominees(+catBtn.dataset.cerCat);
      if (e.target.closest('#cer-btn-reveal')) return revealWinner();
      if (e.target.closest('[data-cer-back]')) return renderSelect();
      if (e.target.closest('[data-cer-prev]') && catIdx > 0) return renderNominees(catIdx - 1);
      if (e.target.closest('[data-cer-next]')) return renderNominees(catIdx + 1);
      if (e.target.closest('[data-cer-finish]')) return renderFinale();
      if (e.target.closest('[data-cer-confetti]')) { Confetti.cannons(); return; }
      if (e.target.closest('#cer-btn-exit')) return exit();
      if (e.target.closest('#cer-btn-fs')) return toggleFullscreen();
      if (e.target.closest('#cer-btn-sound')) {
        const on = Sound.toggle();
        $('#cer-btn-sound').textContent = on ? '🔊' : '🔇';
        toast(on ? 'Som da cerimônia ligado' : 'Som silenciado', 'info', 1800);
      }
      if (e.target.closest('#cer-btn-votes')) {
        showVotes = !showVotes;
        const v = $('#cer-win-votes');
        if (v) v.hidden = !showVotes;
        $('#cer-btn-votes').style.opacity = showVotes ? '1' : '.45';
        toast(showVotes ? 'Contagem de votos visível no telão' : 'Contagem de votos oculta no telão', 'info', 2000);
      }
    });

    // Atalhos de teclado na cerimônia
    document.addEventListener('keydown', (e) => {
      if (!open) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        if (step === 'select') exit();
        else renderSelect();
      } else if (e.key === ' ' && step === 'nominees') {
        e.preventDefault();
        revealWinner();
      } else if (e.key === 'ArrowRight' && (step === 'winner' || step === 'nominees')) {
        if (catIdx < state.tallyData.categorias.length - 1) { e.preventDefault(); renderNominees(catIdx + 1); }
      } else if (e.key === 'ArrowLeft' && (step === 'winner' || step === 'nominees')) {
        if (catIdx > 0) { e.preventDefault(); renderNominees(catIdx - 1); }
      } else if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key.toLowerCase() === 'v') {
        showVotes = !showVotes;
        const v = $('#cer-win-votes');
        if (v) v.hidden = !showVotes;
      } else if (e.key.toLowerCase() === 's') {
        const on = Sound.toggle();
        $('#cer-btn-sound').textContent = on ? '🔊' : '🔇';
      }
    });

    return { enter, exit, isOpen: () => open, onDataUpdate };
  })();

  /* ========================================================================
     7. NAVEGAÇÃO DE ABAS E EVENTOS DO PAINEL
     ======================================================================== */
  function switchTab(name) {
    state.activeTab = name;
    $$('.tab').forEach((b) => {
      const on = b.dataset.tab === name;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-selected', String(on));
    });
    ['live', 'ceremony', 'control'].forEach((t) => {
      $('#tab-' + t).hidden = t !== name;
    });
  }

  document.addEventListener('click', (e) => {
    const t = e.target;

    const tab = t.closest('.tab');
    if (tab) return switchTab(tab.dataset.tab);

    if (t.closest('#btn-admin-login')) {
      const b = $('#btn-admin-login');
      b.classList.add('is-loading');
      Backend.login().catch((err) => {
        if (err.code !== 'auth/popup-closed-by-user') toast(friendlyError(err), 'error', 7000);
      }).finally(() => b.classList.remove('is-loading'));
      return;
    }

    if (t.closest('#btn-admin-logout') || t.closest('#btn-denied-logout')) {
      stopListeners();
      state.authorized = false;
      Backend.logout().then(() => toast('Sessão encerrada.', 'info'));
      return;
    }

    if (t.closest('#btn-copy-uid')) {
      const uid = $('#denied-uid').textContent;
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(uid).then(() => toast('✅ UID copiado!', 'success'));
      } else {
        window.prompt('Copie o seu UID:', uid);
      }
      return;
    }

    if (t.closest('#btn-open-ceremony')) return Ceremony.enter();
    if (t.closest('[data-toggle-censor]')) {
      state.censored = !state.censored;
      renderDashboard();
      toast(
        state.censored ? '🙈 Parciais censuradas novamente.' : '👁️ Censura desativada — exibindo parciais ao vivo.',
        'info',
        2200
      );
      return;
    }
    if (t.closest('#btn-init-evento') || t.closest('[data-quick-init]')) return handleInitEvento();
    if (t.closest('#btn-toggle-curtains')) {
      const btn = $('#btn-toggle-curtains');
      const currentlyClosed = !!(state.evento && state.evento.cortinasFechadas === true);
      btn.classList.add('is-loading');
      Backend.setCurtains(!currentlyClosed).then(() => {
        toast(
          !currentlyClosed
            ? '🎭 Cortinas fechadas! Quem abrir o site agora verá a tela de espera.'
            : '🎬 Cortinas abertas! O site já está visível para a turma.',
          'info',
          3600
        );
      }).catch((err) => toast(friendlyError(err), 'error', 6000))
        .finally(() => btn.classList.remove('is-loading'));
      return;
    }
    if (t.closest('#btn-close-voting')) return handleCloseVoting();
    if (t.closest('#btn-reopen-voting')) return handleReopenVoting();

    // Controles de Revelação 1 por 1 (Anti-Spoiler nos Celulares)
    const unlockBtn = t.closest('[data-adm-unlock]');
    if (unlockBtn) {
      const idx = +unlockBtn.dataset.admUnlock;
      const cat = CATEGORIAS[idx];
      if (!cat) return;
      const revMap = getRevealedMap();
      revMap[cat.id] = true;
      Confetti.cannons();
      syncPublicStage(revMap, idx, `🏆 Vencedor de "${cat.titulo}" liberado nos celulares!`);
      return;
    }
    const suspBtn = t.closest('[data-adm-suspense]');
    if (suspBtn) {
      const idx = +suspBtn.dataset.admSuspense;
      const cat = CATEGORIAS[idx];
      if (!cat) return;
      const revMap = getRevealedMap();
      delete revMap[cat.id];
      syncPublicStage(revMap, idx, `✉️ "${cat.titulo}" em suspense nos celulares (só indicados visíveis).`);
      return;
    }
    const focusBtn = t.closest('[data-adm-focus]');
    if (focusBtn) {
      const idx = +focusBtn.dataset.admFocus;
      const cat = CATEGORIAS[idx];
      if (!cat) return;
      syncPublicStage(getRevealedMap(), idx, `🎯 Celulares focados em "${cat.titulo}".`);
      return;
    }
    const lockBtn = t.closest('[data-adm-lock]');
    if (lockBtn) {
      const idx = +lockBtn.dataset.admLock;
      const cat = CATEGORIAS[idx];
      if (!cat) return;
      const revMap = getRevealedMap();
      delete revMap[cat.id];
      // Volta o foco para a última categoria ainda liberada (ou 0)
      const firstRevIdx = Math.max(0, CATEGORIAS.findIndex((c) => !!revMap[c.id]));
      syncPublicStage(revMap, firstRevIdx, `🔒 "${cat.titulo}" bloqueada novamente nos celulares.`);
      return;
    }
    if (t.closest('#btn-reveal-all')) {
      const revMap = {};
      CATEGORIAS.forEach((c) => { revMap[c.id] = true; });
      Confetti.cannons();
      syncPublicStage(revMap, CATEGORIAS.length - 1, '🔓 Todas as categorias foram liberadas nos celulares!');
      return;
    }
    if (t.closest('#btn-lock-keep-first')) {
      const revMap = CATEGORIAS[0] ? { [CATEGORIAS[0].id]: true } : {};
      syncPublicStage(revMap, 0, '🔒 Apenas a 1ª categoria ficou liberada; demais trancadas contra spoiler.');
      return;
    }
    if (t.closest('#btn-lock-all')) {
      syncPublicStage({}, 0, '✉️ Todas as categorias voltaram para suspense (0 liberadas).');
      return;
    }

    if (t.closest('#btn-copy-vote-link')) {
      const voteUrl = new URL('index.html', location.href).href;
      copyLink(voteUrl);
      return;
    }

    // Ferramentas do Modo Demonstração
    if (t.closest('#btn-demo-seed-25')) { Backend.demoSeed(25); toast('✨ +25 votos simulados adicionados!', 'success'); return; }
    if (t.closest('#btn-demo-seed-5')) { Backend.demoSeed(5); toast('✨ +5 votos simulados adicionados!', 'success'); return; }
    if (t.closest('#btn-demo-reset')) {
      modal({
        title: 'Resetar toda a votação?',
        html: '<p>Todos os <b>votos registrados</b> serão apagados, os resultados publicados serão removidos e a votação voltará a ficar <b>aberta do zero</b> para você testar novamente.</p>',
        confirmText: 'Apagar votos e reabrir',
        cancelText: 'Cancelar',
        danger: true
      }).then(async (ok) => {
        if (!ok) return;
        const btn = $('#btn-demo-reset');
        btn.classList.add('is-loading');
        try {
          await Backend.resetAll();
          toast('🔄 Votação resetada! Tudo pronto para testar do zero.', 'success', 4000);
        } catch (err) {
          toast(friendlyError(err), 'error', 7000);
        } finally {
          btn.classList.remove('is-loading');
        }
      });
    }
  });

  /* ========================================================================
     8. INICIALIZAÇÃO
     ======================================================================== */
  async function bootAdmin() {
    document.title = `Painel · ${EV.nome} ${EV.ano}`;
    $$('[data-ev="nome"]').forEach((el) => (el.textContent = EV.nome));
    $$('[data-ev="ano"]').forEach((el) => (el.textContent = EV.ano));
    $$('[data-trophy]').forEach((el) => (el.innerHTML = trophySVG(el.dataset.trophy)));

    initAmbient();
    showGate('loading');

    try {
      await Backend.init();
    } catch (e) {
      $('#gate-loading-text').innerHTML = `Erro ao inicializar Firebase: ${friendlyError(e)}`;
      return;
    }

    await Backend.consumeRedirect();

    Backend.onAuth((user) => {
      state.user = user;
      if (!user) {
        stopListeners();
        state.authorized = false;
        showGate('login');
        return;
      }

      if (!isAdminUser(user)) {
        stopListeners();
        state.authorized = false;
        $('#denied-email').textContent = user.email || 'Sem e-mail';
        $('#denied-uid').textContent = user.uid;
        showGate('denied');
        return;
      }

      enterAdmin(user);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootAdmin);
  else bootAdmin();
})();
