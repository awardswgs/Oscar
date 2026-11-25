/* ==========================================================================
   app.js — Página de votação (index.html) + utilitários compartilhados
   --------------------------------------------------------------------------
   Estrutura do arquivo:
     1. CATEGORIAS  ← ✏️ EDITE AQUI os indicados da sua turma
     2. Utilitários (DOM, imagens, troféu SVG, toasts, modais)
     3. Efeitos visuais (poeira dourada ambiente + confetes)
     4. Detecção de navegador interno (WhatsApp/Instagram)
     5. Backend (Firebase ou Modo Demonstração)
     6. Apuração (tally) — usada no painel e no encerramento
     7. Interface da votação (só roda no index.html)
   ========================================================================== */
(function () {
  'use strict';

  /* ========================================================================
     1. PARTICIPANTES E CATEGORIAS — ✏️ EDITE AQUI
     ------------------------------------------------------------------------
     • Para acrescentar os próximos participantes, basta adicionar na lista
       HOMENS ou MULHERES abaixo — eles entram automaticamente na categoria
       correspondente e também em "Quebra Galho da Turma" (TODOS).
     • id: identificador único, sem espaços (NÃO mude depois que a votação
       começar, senão os votos antigos não serão contados).
     ======================================================================== */
  const HOMENS = [
    { id: 'anthony',     nome: 'Anthony',     foto: 'fotos/Anthony.jpeg' },
    { id: 'arthur-braz', nome: 'Arthur Braz', foto: 'fotos/Arthur Braz.jpeg' },
    { id: 'bernardo',    nome: 'Bernardo',    foto: 'fotos/Bernardo.jpeg' },
    { id: 'elisson',     nome: 'Élisson',     foto: 'fotos/Élisson.jpeg' },
    { id: 'enzo',        nome: 'Enzo',        foto: 'fotos/Enzo.jpeg' },
    { id: 'feitosa',     nome: 'Feitosa',     foto: 'fotos/Feitosa.jpeg' },
    { id: 'gabriel',     nome: 'Gabriel',     foto: 'fotos/Gabriel.jpeg' },
    { id: 'gustavo',     nome: 'Gustavo',     foto: 'fotos/Gustavo.jpeg' },
    { id: 'paulo-d',     nome: 'Paulo D.',    foto: 'fotos/Paulo D.jpeg' },
    { id: 'victor',      nome: 'Victor',      foto: 'fotos/Victor.jpeg' },
    { id: 'zocatelli',   nome: 'Zocatelli',   foto: 'fotos/Zocatelli.jpeg' }
  ];

  const MULHERES = [
    { id: 'alana',               nome: 'Alana',               foto: 'fotos/Alana.jpeg' },
    { id: 'amanda-gabrielly',    nome: 'Amanda Gabrielly',    foto: 'fotos/Amanda Gabrielly.jpeg' },
    { id: 'amanda-melo',         nome: 'Amanda Melo',         foto: 'fotos/Amanda Melo.jpeg' },
    { id: 'amanda-sophia',       nome: 'Amanda Sophia',       foto: 'fotos/Amanda Sophia.jpeg' },
    { id: 'ana-beatriz',         nome: 'Ana Beatriz',         foto: 'fotos/Ana Beatriz.jpeg' },
    { id: 'ana-louise',          nome: 'Ana Louise',          foto: 'fotos/Ana Louise.jpeg' },
    { id: 'anna-julia-miguel',   nome: 'Anna Julia Miguel',   foto: 'fotos/Anna Julia Miguel.jpeg' },
    { id: 'anna-julia-carvalho', nome: 'Anna Júlia Carvalho', foto: 'fotos/Anna Júlia Caravalho.jpeg' },
    { id: 'carolinne',           nome: 'Carolinne',           foto: 'fotos/Carolinne.jpeg' },
    { id: 'gabriela-rejane',     nome: 'Gabriela Rejane',     foto: 'fotos/Gabriela Rejane.jpeg' },
    { id: 'gabrielle',           nome: 'Gabrielle',           foto: 'fotos/Gabrielle.jpeg' },
    { id: 'isabela',             nome: 'Isabela',             foto: 'fotos/Isabela.jpeg' },
    { id: 'isadora',             nome: 'Isadora',             foto: 'fotos/Isadora.jpeg' },
    { id: 'graziele',            nome: 'Graziele',            foto: 'fotos/Graziele.jpeg' },
    { id: 'julia',               nome: 'Julia',               foto: 'fotos/Julia.jpeg' },
    { id: 'kamilla',             nome: 'Kamilla',             foto: 'fotos/Kamilla.jpeg' },
    { id: 'leticia',             nome: 'Letícia',             foto: 'fotos/Letícia.jpeg' },
    { id: 'livia',               nome: 'Livia',               foto: 'fotos/Livia.jpeg' },
    { id: 'maria-luiza',         nome: 'Maria Luiza',         foto: 'fotos/Maria Luiza.jpeg' },
    { id: 'mariana-g',           nome: 'Mariana G.',          foto: 'fotos/Mariana G.jpeg' },
    { id: 'medeiros',            nome: 'Medeiros',            foto: 'fotos/Medeiros.jpeg' },
    { id: 'nathalia',            nome: 'Nathalia',            foto: 'fotos/Nathalia.jpeg' },
    { id: 'nicole',              nome: 'Nicole',              foto: 'fotos/Nicole.jpeg' },
    { id: 'romao',               nome: 'Romão',               foto: 'fotos/Romão.jpeg' },
    { id: 'talita',              nome: 'Talita',              foto: 'fotos/Talita.jpeg' },
    { id: 'yasmin-martins',      nome: 'Yasmin Martins',      foto: 'fotos/Yasmin Martins.jpeg' },
    { id: 'yasmin-rodrigues',    nome: 'Yasmin Rodrigues',    foto: 'fotos/Yasmin Rodrigues.jpeg' }
  ];

  const TODOS = [...HOMENS, ...MULHERES].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

  const CATEGORIAS = [
    {
      id: 'homem-bem-vestido',
      titulo: 'Homem Mais Bem Vestido da Noite',
      descricao: 'Elegância, estilo e presença de tapete vermelho na grande noite do Terceirão.',
      indicados: HOMENS
    },
    {
      id: 'mulher-bem-vestida',
      titulo: 'Mulher Mais Bem Vestida da Noite',
      descricao: 'Glamour, sofisticação e o look que parou a cerimônia do Oscar Awards.',
      indicados: MULHERES
    },
    {
      id: 'quebra-galho',
      titulo: 'Quebra Galho da Turma',
      descricao: 'Quem sempre ajuda a turma com atividade mesmo que em cima da hora.',
      indicados: TODOS
    }
  ];

  /* ========================================================================
     2. UTILITÁRIOS
     ======================================================================== */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const pad = (n) => String(n).padStart(2, '0');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** Escapa texto para inserir com segurança em HTML. */
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const CFG = window.GALA_CONFIG || {};
  const EV = Object.assign({ nome: 'OSCAR AWARDS', ano: 2026, turma: 'Grande Gala do Terceirão', subtitulo: '', sessao: 'Sexta-feira • 19h00 • Ao Vivo', totalAlunos: 0 }, CFG.evento || {});

  function initials(nome) {
    return String(nome || '?').trim().split(/\s+/).slice(0, 2).map((p) => p[0] || '').join('').toUpperCase();
  }

  /** Gera um avatar elegante (iniciais douradas) para quando a foto falhar. */
  function avatarURI(nome) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"><defs><linearGradient id="b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2a2a2e"/><stop offset="1" stop-color="#0c0c0e"/></linearGradient><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F9E27D"/><stop offset="1" stop-color="#B8902B"/></linearGradient></defs><rect width="400" height="500" fill="url(#b)"/><circle cx="200" cy="235" r="125" fill="none" stroke="url(#g)" stroke-width="3" opacity=".55"/><text x="200" y="275" text-anchor="middle" font-family="Georgia,serif" font-size="112" fill="url(#g)">${esc(initials(nome))}</text></svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  /** <img> com dimensões explícitas (evita CLS) e fallback automático para as iniciais. */
  function imgTag(src, nome, cls = '') {
    return `<img class="${cls}" src="${esc(src || avatarURI(nome))}" alt="${esc(nome)}" width="400" height="500" data-nome="${esc(nome)}" loading="lazy" decoding="async" referrerpolicy="no-referrer">`;
  }
  document.addEventListener('error', (e) => {
    const t = e.target;
    if (t && t.tagName === 'IMG' && t.dataset.nome !== undefined && !t.dataset.fallback) {
      t.dataset.fallback = '1';
      t.src = avatarURI(t.dataset.nome);
    }
  }, true);

  /** Troféu dourado em SVG (cada instância tem um gradiente com ID único). */
  let svgSeq = 0;
  function trophySVG(cls = '') {
    const id = 'tg' + (++svgSeq);
    return `<svg class="trophy ${cls}" viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF4C2"/><stop offset=".3" stop-color="#F9E27D"/><stop offset=".6" stop-color="#D4AF37"/><stop offset="1" stop-color="#8C6A1C"/></linearGradient></defs><path fill="url(#${id})" d="M18 5h28v4h8.5A2.5 2.5 0 0 1 57 11.5V15c0 7.4-5.3 13.2-12.2 14.2A14.5 14.5 0 0 1 35 37v6h5.5a3.5 3.5 0 0 1 3.5 3.5V50H20v-3.5a3.5 3.5 0 0 1 3.5-3.5H29v-6a14.5 14.5 0 0 1-9.8-7.8C12.3 28.2 7 22.4 7 15v-3.5A2.5 2.5 0 0 1 9.5 9H18V5Zm-6 9v1c0 4.6 2.9 8.4 7 9.6-.6-1.7-1-3.6-1-5.6v-5h-6Zm40 0h-6v5c0 2-.4 3.9-1 5.6 4.1-1.2 7-5 7-9.6v-1Z"/><rect x="15" y="52" width="34" height="7" rx="2.5" fill="url(#${id})"/><path d="M27 13l2.2 4.4 4.8.7-3.5 3.4.8 4.8-4.3-2.3-4.3 2.3.8-4.8-3.5-3.4 4.8-.7z" fill="#fff" opacity=".35" transform="translate(5 0)"/></svg>`;
  }

  /** Coroa de louros dourada em SVG (estilo Oscar / The Game Awards). */
  function laurelSVG() {
    return `<svg class="laurel" viewBox="0 0 220 96" aria-hidden="true"><g fill="none" stroke="#D4AF37" stroke-width="1.6" stroke-linecap="round"><path d="M58 82C32 72 18 46 28 18" opacity=".75"/><path d="M162 82C188 72 202 46 192 18" opacity=".75"/></g><g fill="#F9E27D" opacity=".88"><ellipse cx="26" cy="24" rx="7" ry="3.2" transform="rotate(-50 26 24)"/><ellipse cx="21" cy="37" rx="7.5" ry="3.2" transform="rotate(-28 21 37)"/><ellipse cx="22" cy="51" rx="7.5" ry="3.2" transform="rotate(-8 22 51)"/><ellipse cx="29" cy="64" rx="7.5" ry="3.2" transform="rotate(14 29 64)"/><ellipse cx="40" cy="74" rx="7" ry="3" transform="rotate(34 40 74)"/><ellipse cx="52" cy="81" rx="6.5" ry="2.8" transform="rotate(50 52 81)"/><ellipse cx="36" cy="31" rx="6" ry="2.6" transform="rotate(14 36 31)" opacity=".65"/><ellipse cx="34" cy="45" rx="6" ry="2.6" transform="rotate(30 34 45)" opacity=".65"/><ellipse cx="38" cy="58" rx="6" ry="2.6" transform="rotate(48 38 58)" opacity=".65"/><ellipse cx="194" cy="24" rx="7" ry="3.2" transform="rotate(50 194 24)"/><ellipse cx="199" cy="37" rx="7.5" ry="3.2" transform="rotate(28 199 37)"/><ellipse cx="198" cy="51" rx="7.5" ry="3.2" transform="rotate(8 198 51)"/><ellipse cx="191" cy="64" rx="7.5" ry="3.2" transform="rotate(-14 191 64)"/><ellipse cx="180" cy="74" rx="7" ry="3" transform="rotate(-34 180 74)"/><ellipse cx="168" cy="81" rx="6.5" ry="2.8" transform="rotate(-50 168 81)"/><ellipse cx="184" cy="31" rx="6" ry="2.6" transform="rotate(-14 184 31)" opacity=".65"/><ellipse cx="186" cy="45" rx="6" ry="2.6" transform="rotate(-30 186 45)" opacity=".65"/><ellipse cx="182" cy="58" rx="6" ry="2.6" transform="rotate(-48 182 58)" opacity=".65"/></g></svg>`;
  }

  function sealSVG() {
    return `<svg class="seal" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="28" fill="none" stroke="#D4AF37" stroke-width="2" stroke-dasharray="3 3"/><circle cx="32" cy="32" r="22" fill="rgba(212,175,55,.12)" stroke="#F9E27D" stroke-width="1.5"/><path d="M22 33l7 7 14-15" fill="none" stroke="#F9E27D" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }

  /* ---- Toasts ---- */
  function toast(msg, type = 'info', ms = 4000) {
    let wrap = $('#toasts');
    if (!wrap) { wrap = document.createElement('div'); wrap.id = 'toasts'; document.body.appendChild(wrap); }
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    t.setAttribute('role', 'status');
    t.innerHTML = msg;
    wrap.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, ms);
  }

  /* ---- Modal de confirmação (retorna Promise<boolean>) ---- */
  function modal({ title, html = '', confirmText = 'Confirmar', cancelText = 'Cancelar', danger = false, icon = '', requireText = '' }) {
    return new Promise((resolve) => {
      const ov = document.createElement('div');
      ov.className = 'modal-overlay';
      ov.innerHTML = `
        <div class="modal glass" role="dialog" aria-modal="true" aria-label="${esc(title)}">
          ${icon ? `<div class="modal-icon">${icon}</div>` : ''}
          <h3 class="modal-title">${title}</h3>
          <div class="modal-body">${html}</div>
          ${requireText ? `<label class="modal-require">Digite <b>${esc(requireText)}</b> para confirmar<input type="text" autocomplete="off" autocapitalize="characters" spellcheck="false"></label>` : ''}
          <div class="modal-actions">
            ${cancelText ? `<button class="btn btn-ghost" data-act="cancel">${cancelText}</button>` : ''}
            <button class="btn ${danger ? 'btn-danger' : 'btn-gold'}" data-act="ok" ${requireText ? 'disabled' : ''}>${confirmText}</button>
          </div>
        </div>`;
      document.body.appendChild(ov);
      requestAnimationFrame(() => ov.classList.add('show'));
      const okBtn = ov.querySelector('[data-act="ok"]');
      const input = ov.querySelector('.modal-require input');
      if (input) input.addEventListener('input', () => { okBtn.disabled = input.value.trim().toUpperCase() !== requireText.toUpperCase(); });
      const close = (v) => {
        document.removeEventListener('keydown', onKey, true);
        ov.classList.remove('show');
        setTimeout(() => ov.remove(), 300);
        resolve(v);
      };
      const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); close(false); } };
      document.addEventListener('keydown', onKey, true);
      ov.addEventListener('click', (e) => {
        if (e.target === ov) return close(false);
        const a = e.target.closest('[data-act]');
        if (a && !a.disabled) close(a.dataset.act === 'ok');
      });
      setTimeout(() => (input || okBtn).focus(), 60);
    });
  }

  function copyLink(url = location.href.split('#')[0]) {
    const done = () => toast('🔗 Link copiado! Cole no Chrome ou Safari.', 'success');
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url).then(done).catch(() => window.prompt('Copie o link:', url));
    } else {
      window.prompt('Copie o link:', url);
    }
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-copy-link]');
    if (b) { e.preventDefault(); copyLink(); }
  });

  function friendlyError(e) {
    const code = (e && e.code) || '';
    const map = {
      'auth/popup-closed-by-user': 'Login cancelado.',
      'auth/unauthorized-domain': `Este domínio (<b>${esc(location.hostname || 'arquivo local')}</b>) não está autorizado no Firebase. Vá em Authentication → Settings → Authorized domains.`,
      'auth/network-request-failed': 'Sem conexão com a internet. Tente novamente.',
      'auth/operation-not-allowed': 'O login com Google não está ativado no Firebase (Authentication → Sign-in method).',
      'auth/too-many-requests': 'Muitas tentativas. Aguarde um pouco e tente de novo.',
      'auth/disallowed-useragent': 'O Google bloqueia login dentro deste app. Abra o link no Chrome ou Safari.',
      'permission-denied': 'Permissão negada pelas regras de segurança.',
      'unavailable': 'Servidor indisponível ou sem internet. Tente novamente.',
      'failed-precondition': 'O Firestore ainda não foi criado neste projeto.'
    };
    return map[code] || (e && e.message ? esc(e.message) : 'Algo deu errado. Tente novamente.');
  }

  /* ========================================================================
     3. EFEITOS VISUAIS
     ======================================================================== */

  /** Poeira dourada flutuando ao fundo (leve: 1x DPR, ~24 FPS). */
  function initAmbient() {
    if (reduceMotion || $('.ambient-canvas')) return;
    const c = document.createElement('canvas');
    c.className = 'ambient-canvas';
    c.setAttribute('aria-hidden', 'true');
    document.body.prepend(c);
    const ctx = c.getContext('2d', { alpha: true });
    let W = 0, H = 0, running = true, last = 0;
    const ps = [];
    const resize = () => {
      W = innerWidth; H = innerHeight;
      c.width = W; c.height = H;
    };
    resize();
    addEventListener('resize', resize, { passive: true });
    const N = innerWidth < 700 ? 16 : 26;
    for (let i = 0; i < N; i++) {
      ps.push({
        x: Math.random() * W, y: Math.random() * H,
        r: Math.random() * 1.4 + 0.5,
        vx: (Math.random() - 0.5) * 0.22, vy: -(Math.random() * 0.35 + 0.08),
        a: Math.random(), va: (Math.random() * 0.014 + 0.004) * (Math.random() < 0.5 ? -1 : 1)
      });
    }
    function tick(now) {
      if (!running) return;
      requestAnimationFrame(tick);
      if (now - last < 42) return; // ~24 FPS para poeira ambiente
      last = now;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#F9E27D';
      for (const p of ps) {
        p.x += p.vx; p.y += p.vy; p.a += p.va;
        if (p.a > 0.85 || p.a < 0.08) p.va *= -1;
        if (p.y < -6) { p.y = H + 6; p.x = Math.random() * W; }
        ctx.globalAlpha = Math.max(0.05, Math.min(0.75, p.a));
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
    }
    document.addEventListener('visibilitychange', () => {
      running = !document.hidden;
      if (running) { last = 0; requestAnimationFrame(tick); }
    });
    requestAnimationFrame(tick);
  }

  /** Motor de confetes dourados (canvas, sem bibliotecas). */
  const Confetti = (() => {
    let canvas, ctx, raf = null, W = 0, H = 0;
    let parts = [];
    const COLORS = ['#F9E27D', '#D4AF37', '#FFF4C2', '#B8902B', '#E8C65A', '#FFFFFF', '#F2D77A'];
    function ensure() {
      if (canvas) return;
      canvas = document.createElement('canvas');
      canvas.className = 'confetti-canvas';
      canvas.setAttribute('aria-hidden', 'true');
      document.body.appendChild(canvas);
      ctx = canvas.getContext('2d');
      resize();
      addEventListener('resize', resize);
    }
    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      W = innerWidth; H = innerHeight;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function make(x, y, vx, vy, size = 1, gravity = 0.22) {
      const r = Math.random();
      return {
        x, y, vx, vy, g: gravity,
        w: (6 + Math.random() * 7) * size, h: (4 + Math.random() * 5) * size,
        rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3,
        tilt: Math.random() * Math.PI * 2, vt: 0.05 + Math.random() * 0.12,
        color: COLORS[(Math.random() * COLORS.length) | 0],
        shape: r < 0.22 ? 'circle' : r < 0.36 ? 'star' : 'rect',
        life: 0, max: 260 + Math.random() * 140
      };
    }
    function star(c, s) {
      c.beginPath();
      for (let i = 0; i < 10; i++) {
        const rad = i % 2 ? s * 0.45 : s;
        const a = (i * Math.PI) / 5 - Math.PI / 2;
        c.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
      }
      c.closePath(); c.fill();
    }
    function loop() {
      if (raf) return;
      const step = () => {
        ctx.clearRect(0, 0, W, H);
        parts = parts.filter((p) => p.life < p.max && p.y < H + 40 && p.x > -60 && p.x < W + 60);
        for (const p of parts) {
          p.life++;
          p.vx *= 0.985; p.vy = Math.min(p.vy + p.g, 7);
          p.tilt += p.vt; p.rot += p.vr;
          p.x += p.vx + Math.sin(p.tilt) * 0.7; p.y += p.vy;
          const fade = p.life > p.max - 50 ? (p.max - p.life) / 50 : 1;
          ctx.save();
          ctx.globalAlpha = Math.max(0, fade);
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.scale(1, Math.cos(p.tilt));
          ctx.fillStyle = p.color;
          if (p.shape === 'circle') { ctx.beginPath(); ctx.arc(0, 0, p.h * 0.55, 0, Math.PI * 2); ctx.fill(); }
          else if (p.shape === 'star') star(ctx, p.w * 0.6);
          else ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        }
        if (parts.length) raf = requestAnimationFrame(step);
        else { raf = null; ctx.clearRect(0, 0, W, H); }
      };
      raf = requestAnimationFrame(step);
    }
    function burst({ x = innerWidth / 2, y = innerHeight / 2, count = 120, angle = -Math.PI / 2, spread = Math.PI * 2, speed = 12, size = 1 } = {}) {
      ensure();
      const n = reduceMotion ? Math.ceil(count / 5) : count;
      for (let i = 0; i < n; i++) {
        const a = angle + (Math.random() - 0.5) * spread;
        const v = speed * (0.45 + Math.random() * 0.75);
        parts.push(make(x, y, Math.cos(a) * v, Math.sin(a) * v, size));
      }
      loop();
    }
    function cannons() {
      const h = innerHeight;
      burst({ x: -10, y: h * 0.85, angle: -Math.PI / 3.2, spread: 0.8, count: 85, speed: 20 });
      burst({ x: innerWidth + 10, y: h * 0.85, angle: -Math.PI + Math.PI / 3.2, spread: 0.8, count: 85, speed: 20 });
    }
    function rain(ms = 3000) {
      ensure();
      const end = performance.now() + ms;
      (function drop() {
        const n = reduceMotion ? 1 : innerWidth < 700 ? 3 : 6;
        for (let i = 0; i < n; i++) parts.push(make(Math.random() * W, -20, (Math.random() - 0.5) * 2, 1.5 + Math.random() * 2.5, 1, 0.05));
        loop();
        if (performance.now() < end) setTimeout(drop, 45);
      })();
    }
    function sparkle(x, y) { burst({ x, y, count: 22, speed: 6, size: 0.55 }); }
    return { burst, cannons, rain, sparkle };
  })();

  /* ========================================================================
     4. NAVEGADOR INTERNO (WhatsApp / Instagram / Facebook / TikTok…)
     ------------------------------------------------------------------------
     O Google bloqueia login em "webviews" (erro disallowed_useragent).
     Detectamos esses navegadores e orientamos a abrir no Chrome/Safari.
     ======================================================================== */
  function detectInApp() {
    const ua = navigator.userAgent || '';
    const apps = [
      ['WhatsApp', /WhatsApp/i], ['Instagram', /Instagram/i], ['Facebook', /FBAN|FBAV|FB_IAB|FBIOS|FB4A/i],
      ['Messenger', /Messenger|MessengerForiOS/i], ['TikTok', /musical_ly|BytedanceWebview|TikTok/i],
      ['Snapchat', /Snapchat/i], ['LinkedIn', /LinkedInApp/i], ['Telegram', /Telegram/i], ['Line', /\bLine\//i],
      ['Twitter/X', /Twitter/i], ['Discord', /Discord/i]
    ];
    for (const [name, re] of apps) if (re.test(ua)) return name;
    if (/Android/i.test(ua) && /; wv\)/i.test(ua)) return 'app';
    return null;
  }
  const isIOS = () => /iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = () => /Android/i.test(navigator.userAgent);

  function chromeIntentURL() {
    if (!isAndroid() || !/^https?:$/.test(location.protocol)) return null;
    const fallback = encodeURIComponent(location.href.split('#')[0]);
    return `intent://${location.host}${location.pathname}${location.search}#Intent;scheme=${location.protocol.replace(':', '')};package=com.android.chrome;S.browser_fallback_url=${fallback};end`;
  }

  /** Modal explicando como abrir no navegador. Retorna true se a pessoa quiser tentar mesmo assim. */
  function showInAppHelp(appName) {
    const nome = appName && appName !== 'app' ? appName : 'este aplicativo';
    const steps = isIOS()
      ? `<li>Toque no ícone <b>•••</b> ou em <b>compartilhar</b> (canto da tela)</li><li>Escolha <b>“Abrir no Safari”</b> ou <b>“Abrir no navegador”</b></li>`
      : `<li>Toque nos <b>três pontinhos ⋮</b> no canto superior</li><li>Escolha <b>“Abrir no Chrome”</b> ou <b>“Abrir no navegador”</b></li>`;
    const intent = chromeIntentURL();
    return modal({
      icon: '<div class="inapp-icon">🌐</div>',
      title: 'Abra no seu navegador',
      html: `<p>Você está usando o navegador interno do <b>${esc(nome)}</b>. Por segurança, o Google pode bloquear o login aqui dentro.</p>
             <ol class="inapp-steps">${steps}</ol>
             <div class="inapp-actions">
               ${intent ? `<a class="btn btn-gold btn-block" href="${esc(intent)}">Abrir no Chrome</a>` : ''}
               <button class="btn btn-outline btn-block" data-copy-link>Copiar link do site</button>
             </div>`,
      confirmText: 'Tentar mesmo assim',
      cancelText: 'Entendi'
    });
  }

  /* ========================================================================
     5. BACKEND — Firebase (compat SDK carregado sob demanda) ou Modo Demo
     ======================================================================== */
  const Backend = (() => {
    const fc = CFG.firebaseConfig || {};
    const DEMO = !fc.apiKey || !fc.projectId || /COLE|AQUI|SUA_|XXXX/i.test(fc.apiKey);
    const SDK_VERSION = '10.12.2';
    const sdk = (n) => `https://www.gstatic.com/firebasejs/${SDK_VERSION}/firebase-${n}-compat.js`;
    let auth = null, db = null;

    // --- helpers do modo demo (localStorage + eventos entre abas) ---
    const K_EVT = 'gala_demo_evento', K_VOTOS = 'gala_demo_votos', K_USER = 'gala_demo_user';
    const LS = {
      get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (_) { return d; } },
      set(k, v) { localStorage.setItem(k, JSON.stringify(v)); }
    };
    const bus = new EventTarget();
    const emit = (t) => bus.dispatchEvent(new Event(t));
    addEventListener('storage', (e) => {
      if (e.key === K_EVT) emit('evento');
      if (e.key === K_VOTOS) emit('votos');
      if (e.key === K_USER) emit('auth');
    });
    const deny = (msg) => { const e = new Error(msg); e.code = 'permission-denied'; return e; };
    const subscribe = (topic, fn) => { bus.addEventListener(topic, fn); setTimeout(fn, 0); return () => bus.removeEventListener(topic, fn); };

    function loadScript(src) {
      return new Promise((res, rej) => {
        const s = document.createElement('script');
        s.src = src; s.async = false;
        s.onload = res; s.onerror = () => rej(new Error('Falha ao carregar o Firebase. Verifique sua internet.'));
        document.head.appendChild(s);
      });
    }

    async function init() {
      if (DEMO) {
        if (!LS.get(K_EVT, null)) LS.set(K_EVT, { votacaoAberta: true, criadoEm: Date.now() });
        return;
      }
      await loadScript(sdk('app'));
      await Promise.all([loadScript(sdk('auth')), loadScript(sdk('firestore'))]);
      if (!firebase.apps.length) firebase.initializeApp(fc);
      auth = firebase.auth();
      db = firebase.firestore();
      auth.useDeviceLanguage();
      try { await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL); } catch (_) { /* navegador sem storage */ }
    }

    function onAuth(cb) {
      if (DEMO) return subscribe('auth', () => cb(LS.get(K_USER, null)));
      return auth.onAuthStateChanged(cb);
    }

    /** Login robusto: tenta popup; se o ambiente bloquear, cai para redirect. */
    async function login() {
      if (DEMO) {
        const u = { uid: 'demo-' + Math.random().toString(36).slice(2, 10), displayName: 'Convidado(a)', email: 'convidado@oscar2026.com', photoURL: '' };
        LS.set(K_USER, u); emit('auth');
        return u;
      }
      const provider = new firebase.auth.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      try {
        const r = await auth.signInWithPopup(provider);
        return r.user;
      } catch (e) {
        const fallback = ['auth/popup-blocked', 'auth/operation-not-supported-in-this-environment', 'auth/web-storage-unsupported', 'auth/cancelled-popup-request', 'auth/internal-error'];
        if (fallback.includes(e.code)) {
          await auth.signInWithRedirect(provider); // a página será recarregada
          return null;
        }
        throw e;
      }
    }

    /** Processa a volta do login por redirect (retorna erro, se houver). */
    async function consumeRedirect() {
      if (DEMO) return null;
      try { await auth.getRedirectResult(); return null; } catch (e) { return e; }
    }

    async function logout() {
      if (DEMO) { localStorage.removeItem(K_USER); emit('auth'); return; }
      await auth.signOut();
    }

    function watchEvento(cb, onErr) {
      if (DEMO) return subscribe('evento', () => cb(LS.get(K_EVT, null)));
      return db.doc('config/evento').onSnapshot((s) => cb(s.exists ? s.data() : null), onErr);
    }

    async function getEvento() {
      if (DEMO) return LS.get(K_EVT, null);
      const s = await db.doc('config/evento').get();
      return s.exists ? s.data() : null;
    }

    async function getMyVote(uid) {
      if (DEMO) return LS.get(K_VOTOS, {})[uid] || null;
      const s = await db.doc('votos/' + uid).get();
      return s.exists ? s.data() : null;
    }

    async function submitVote(uid, escolhas) {
      if (DEMO) {
        const all = LS.get(K_VOTOS, {});
        if (all[uid]) throw deny('Já votou');
        if (!(LS.get(K_EVT, {}) || {}).votacaoAberta) throw deny('Votação encerrada');
        all[uid] = { escolhas, criadoEm: Date.now() };
        LS.set(K_VOTOS, all); emit('votos');
        return;
      }
      // set() num documento que já existe vira "update" → bloqueado pelas regras.
      await db.doc('votos/' + uid).set({ escolhas, criadoEm: firebase.firestore.FieldValue.serverTimestamp() });
    }

    /* ---- Somente admin ---- */
    function watchVotes(cb, onErr) {
      if (DEMO) return subscribe('votos', () => cb(Object.entries(LS.get(K_VOTOS, {})).map(([id, d]) => ({ id, ...d }))));
      return db.collection('votos').onSnapshot((qs) => cb(qs.docs.map((d) => ({ id: d.id, ...d.data() }))), onErr);
    }

    async function getAllVotes() {
      if (DEMO) return Object.entries(LS.get(K_VOTOS, {})).map(([id, d]) => ({ id, ...d }));
      const qs = await db.collection('votos').get();
      return qs.docs.map((d) => ({ id: d.id, ...d.data() }));
    }

    async function initEvento() {
      if (DEMO) { LS.set(K_EVT, { votacaoAberta: true, criadoEm: Date.now() }); emit('evento'); return true; }
      const ref = db.doc('config/evento');
      const s = await ref.get();
      if (s.exists) return false;
      await ref.set({ votacaoAberta: true, nomeEvento: `${EV.nome} ${EV.ano}`, criadoEm: firebase.firestore.FieldValue.serverTimestamp() });
      return true;
    }

    async function publishResults(resultados) {
      if (DEMO) {
        const ev = LS.get(K_EVT, {}) || {};
        LS.set(K_EVT, { ...ev, votacaoAberta: false, encerradoEm: Date.now(), resultadosFinais: { ...resultados, publicadoEm: Date.now() } });
        emit('evento'); return;
      }
      const ts = firebase.firestore.FieldValue.serverTimestamp();
      await db.doc('config/evento').set({ votacaoAberta: false, encerradoEm: ts, resultadosFinais: { ...resultados, publicadoEm: ts } }, { merge: true });
    }

    async function reopen() {
      if (DEMO) {
        const ev = LS.get(K_EVT, {}) || {};
        delete ev.resultadosFinais;
        LS.set(K_EVT, { ...ev, votacaoAberta: true, reabertoEm: Date.now() });
        emit('evento'); return;
      }
      await db.doc('config/evento').set({
        votacaoAberta: true,
        resultadosFinais: firebase.firestore.FieldValue.delete(),
        reabertoEm: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    }

    /* ---- Ferramentas exclusivas do modo demo ---- */
    function demoSeed(n = 25) {
      const all = LS.get(K_VOTOS, {});
      for (let i = 0; i < n; i++) {
        const escolhas = {};
        CATEGORIAS.forEach((c) => {
          // sorteio com "peso" para gerar um placar mais interessante
          const w = c.indicados.map((_, k) => Math.random() * (c.indicados.length - k * 0.6));
          escolhas[c.id] = c.indicados[w.indexOf(Math.max(...w))].id;
        });
        all['seed-' + Math.random().toString(36).slice(2, 10)] = { escolhas, criadoEm: Date.now() - Math.random() * 3600e3 };
      }
      LS.set(K_VOTOS, all); emit('votos');
    }
    function demoReset() {
      [K_EVT, K_VOTOS, K_USER].forEach((k) => localStorage.removeItem(k));
      LS.set(K_EVT, { votacaoAberta: true, criadoEm: Date.now() });
      emit('evento'); emit('votos'); emit('auth');
    }

    async function resetAll() {
      if (DEMO) {
        demoReset();
        return;
      }
      // Apaga todos os documentos da coleção votos em lotes de 450
      const qs = await db.collection('votos').get();
      for (let i = 0; i < qs.docs.length; i += 450) {
        const batch = db.batch();
        qs.docs.slice(i, i + 450).forEach((d) => batch.delete(d.ref));
        await batch.commit();
      }
      await db.doc('config/evento').set({
        votacaoAberta: true,
        nomeEvento: `${EV.nome} ${EV.ano}`,
        resultadosFinais: firebase.firestore.FieldValue.delete(),
        encerradoEm: firebase.firestore.FieldValue.delete(),
        reabertoEm: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    }

    const toDate = (v) => (v && typeof v.toDate === 'function' ? v.toDate() : typeof v === 'number' ? new Date(v) : null);

    return { DEMO, init, onAuth, login, consumeRedirect, logout, watchEvento, getEvento, getMyVote, submitVote, watchVotes, getAllVotes, initEvento, publishResults, reopen, resetAll, demoSeed, demoReset, toDate };
  })();

  /* ========================================================================
     6. APURAÇÃO — soma os votos por categoria
     ------------------------------------------------------------------------
     Retorna { totalVotos, categorias: [ { id, titulo, descricao, total,
       indicados: [{ id, nome, apelido, foto, votos }], vencedores: [ids] } ] }
     (Array para preservar a ordem das categorias no Firestore.)
     ======================================================================== */
  function tally(votes, categorias = CATEGORIAS) {
    return {
      totalVotos: votes.length,
      categorias: categorias.map((c) => {
        const counts = {};
        c.indicados.forEach((n) => { counts[n.id] = 0; });
        let total = 0;
        for (const v of votes) {
          const id = v && v.escolhas ? v.escolhas[c.id] : null;
          if (id && Object.prototype.hasOwnProperty.call(counts, id)) { counts[id]++; total++; }
        }
        const max = Math.max(0, ...Object.values(counts));
        return {
          id: c.id,
          titulo: c.titulo || '',
          descricao: c.descricao || '',
          total,
          indicados: c.indicados.map((n) => ({ id: n.id, nome: n.nome || '', apelido: n.apelido || '', foto: n.foto || '', votos: counts[n.id] })),
          vencedores: max > 0 ? c.indicados.filter((n) => counts[n.id] === max).map((n) => n.id) : []
        };
      })
    };
  }

  const pct = (v, t) => (t ? Math.round((v / t) * 1000) / 10 : 0);
  const fmtPct = (v, t) => `${pct(v, t).toLocaleString('pt-BR')}%`;

  /**
   * Monta o objeto público salvo em config/evento.resultadosFinais.
   * Categorias NÃO incluídas em reveladasMap têm seus votos e vencedores
   * zerados no banco para impedir qualquer spoiler (inclusive via DevTools).
   */
  function buildPublicResults(fullTally, reveladasMap = {}, palcoIdx = 0) {
    const rev = {};
    fullTally.categorias.forEach((c) => { if (reveladasMap && reveladasMap[c.id]) rev[c.id] = true; });
    const todasReveladas = fullTally.categorias.length > 0 && fullTally.categorias.every((c) => !!rev[c.id]);
    const categorias = fullTally.categorias.map((c) => {
      const isRev = !!rev[c.id];
      return {
        id: c.id,
        titulo: c.titulo,
        descricao: c.descricao,
        revelada: isRev,
        total: isRev ? c.total : 0,
        vencedores: isRev ? c.vencedores : [],
        indicados: c.indicados.map((n) => ({
          id: n.id,
          nome: n.nome,
          apelido: n.apelido,
          foto: n.foto,
          votos: isRev ? n.votos : 0
        }))
      };
    });
    const safeIdx = Math.max(0, Math.min(categorias.length - 1, Number(palcoIdx) || 0));
    return {
      totalVotos: fullTally.totalVotos,
      palcoIdx: safeIdx,
      reveladas: rev,
      todasReveladas,
      categorias
    };
  }

  /* Exporta para o admin.js */
  window.Gala = { CATEGORIAS, EV, Backend, tally, buildPublicResults, Confetti, toast, modal, esc, imgTag, avatarURI, trophySVG, laurelSVG, sealSVG, friendlyError, detectInApp, showInAppHelp, initAmbient, copyLink, $, $$, sleep, pad, pct, fmtPct, reduceMotion };

  /* ========================================================================
     7. INTERFACE DE VOTAÇÃO — só no index.html
     ======================================================================== */
  if (document.body.dataset.page === 'index') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootIndex);
    else bootIndex();
  }

  function bootIndex() {
    const DRAFT_KEY = 'gala_rascunho_v1';
    const PENDING_KEY = 'gala_login_pendente';
    const N = CATEGORIAS.length;
    const VOTING_VIEWS = ['voting', 'review', 'success', 'voted'];

    const state = {
      view: 'loading',
      user: null,
      authReady: false,
      evento: undefined,     // undefined = carregando, null = não existe
      idx: 0,
      escolhas: loadDraft(),
      fromReview: false,
      busy: false,
      closedKey: null,
      closedMode: 'spotlight', // 'spotlight' (1 por 1 sincronizado) | 'grid' (todos, só após liberar tudo)
      spotIdx: 0,
      prevRevMap: {},
      prevPalcoIdx: -1,
      resultados: null,
      submitting: false
    };

    /* ---------- Rascunho local (sobrevive ao redirect do login) ---------- */
    function loadDraft() { try { return JSON.parse(localStorage.getItem(DRAFT_KEY)) || {}; } catch (_) { return {}; } }
    function saveDraft() { try { localStorage.setItem(DRAFT_KEY, JSON.stringify(state.escolhas)); } catch (_) {} }
    function clearDraft() { state.escolhas = {}; try { localStorage.removeItem(DRAFT_KEY); } catch (_) {} }

    const findNominee = (cat, id) => cat.indicados.find((n) => n.id === id) || null;
    const firstName = (u) => ((u && (u.displayName || u.email)) || 'Convidado').split(/[\s@]/)[0];

    /* ---------- Troca de telas ---------- */
    function showView(name) {
      if (state.view === name) return;
      state.view = name;
      $$('.view').forEach((v) => {
        const on = v.dataset.view === name;
        v.hidden = !on;
        if (on) { v.classList.remove('view-enter'); void v.offsetWidth; v.classList.add('view-enter'); }
      });
      document.body.dataset.view = name;
      window.scrollTo(0, 0);
      updateProgress();
    }
    function setLoading(text) { $('#loading-text').textContent = text; }

    /* ---------- Preenche textos fixos do evento ---------- */
    function fillStatic() {
      document.title = `${EV.nome} ${EV.ano} · Votação Oficial`;
      $$('[data-ev="nome"]').forEach((el) => (el.textContent = EV.nome));
      $$('[data-ev="ano"]').forEach((el) => (el.textContent = EV.ano));
      $$('[data-ev="turma"]').forEach((el) => (el.textContent = EV.turma || 'Cerimônia Oficial'));
      $$('[data-ev="subtitulo"]').forEach((el) => (el.textContent = EV.subtitulo));
      $$('[data-ev="ncat"]').forEach((el) => (el.textContent = N));
      $$('[data-trophy]').forEach((el) => (el.innerHTML = trophySVG(el.dataset.trophy)));
      $$('[data-laurel]').forEach((el) => (el.innerHTML = laurelSVG()));
      const seal = $('#voted-seal'); if (seal) seal.innerHTML = sealSVG();
      renderGalaShowcase();
    }

    /** Cartão VIP "Cerimônia Ao Vivo" com números da noite e prévia das categorias. */
    function renderGalaShowcase() {
      const box = $('#countdown');
      if (!box) return;
      const totalInd = CATEGORIAS.reduce((acc, c) => acc + c.indicados.length, 0);
      const sessao = EV.sessao || 'Cerimônia Ao Vivo';
      box.hidden = false;
      box.className = 'gala-showcase glass';
      box.innerHTML = `
        <div class="gala-live-head">
          <span class="gala-live-pill"><i></i>URNAS ABERTAS</span>
          <span class="gala-live-time">${esc(sessao)}</span>
        </div>
        <div class="gala-metrics">
          <div class="gala-metric">
            <b>${pad(N)}</b>
            <small>Troféus em jogo</small>
          </div>
          <div class="gala-metric">
            <b>${pad(totalInd)}</b>
            <small>Indicações</small>
          </div>
          <div class="gala-metric">
            <b>VIP</b>
            <small>Revelação no telão</small>
          </div>
        </div>
        <div class="gala-cat-preview">
          <span class="gala-cat-label">Categorias da noite</span>
          <div class="gala-cat-chips">
            ${CATEGORIAS.map((c, i) => `<span class="gala-chip"><em>${pad(i + 1)}</em> ${esc(c.titulo)}</span>`).join('')}
          </div>
        </div>`;
    }

    /* ---------- Roteamento principal ---------- */
    function route() {
      if (state.evento === undefined) { setLoading('Preparando o tapete vermelho…'); return showView('loading'); }
      const ev = state.evento;

      if (ev && ev.votacaoAberta === false) { renderClosed(ev); return showView('closed'); }
      if (!ev) { return showView('notready'); }

      // Votação aberta
      if (!state.authReady) { setLoading('Conferindo credenciais…'); return showView('loading'); }
      if (state.busy) return;
      if (!state.user && VOTING_VIEWS.includes(state.view)) { renderHero(); return showView('hero'); }
      if (['loading', 'notready', 'closed'].includes(state.view)) { renderHero(); showView('hero'); }
      else if (state.view === 'hero') renderHero();
      maybeResumePending();
    }

    function maybeResumePending() {
      if (state.user && state.evento && state.evento.votacaoAberta === true && sessionStorage.getItem(PENDING_KEY) === '1') {
        startFlow();
      }
    }

    /* ---------- Hero ---------- */
    function renderHero() {
      const u = state.user;
      $('#btn-google').hidden = !!u;
      const secretLogout = $('#btn-hero-logout');
      if (secretLogout) secretLogout.hidden = !u;
      $('#auth-chip').innerHTML = u
        ? `<span class="chip-avatar">${u.photoURL ? `<img src="${esc(u.photoURL)}" alt="" referrerpolicy="no-referrer">` : esc(initials(u.displayName || u.email))}</span>
           <span class="chip-text">Conectado como <b>${esc(firstName(u))}</b></span>`
        : `<span class="chip-dot"></span><span class="chip-text">Login com Google garante <b>1 voto por pessoa</b></span>`;
    }

    /* ---------- Login ---------- */
    async function doLogin() {
      const app = detectInApp();
      if (app && !Backend.DEMO) {
        const tryAnyway = await showInAppHelp(app);
        if (!tryAnyway) { sessionStorage.removeItem(PENDING_KEY); return; }
      }
      const btns = [$('#btn-start'), $('#btn-google')];
      btns.forEach((b) => b && b.classList.add('is-loading'));
      try {
        await Backend.login(); // onAuth cuida do resto
      } catch (e) {
        sessionStorage.removeItem(PENDING_KEY);
        if (e.code === 'auth/popup-closed-by-user') toast('Login cancelado.', 'info');
        else if (detectInApp() || e.code === 'auth/disallowed-useragent') showInAppHelp(detectInApp());
        else toast(friendlyError(e), 'error', 7000);
      } finally {
        btns.forEach((b) => b && b.classList.remove('is-loading'));
      }
    }

    /* ---------- Início do fluxo de votação ---------- */
    async function startFlow() {
      if (!state.user) { sessionStorage.setItem(PENDING_KEY, '1'); return doLogin(); }
      sessionStorage.removeItem(PENDING_KEY);
      if (state.busy) return;
      state.busy = true;
      setLoading('Verificando seu convite…');
      showView('loading');
      try {
        const vote = await Backend.getMyVote(state.user.uid);
        if (vote) { renderMyChoices('#voted-choices', vote.escolhas); renderVoted(); showView('voted'); return; }
        const pending = CATEGORIAS.findIndex((c) => !state.escolhas[c.id]);
        if (pending === -1) { renderReview(); showView('review'); return; }
        state.idx = pending;
        state.fromReview = false;
        renderCategory('none');
        showView('voting');
      } catch (e) {
        toast(friendlyError(e), 'error', 6000);
        renderHero(); showView('hero');
      } finally {
        state.busy = false;
      }
    }

    /* ---------- Barra de progresso ---------- */
    function updateProgress() {
      const fill = $('#progress-fill');
      const label = $('#vote-counter');
      const answered = CATEGORIAS.filter((c) => state.escolhas[c.id]).length;
      let p = 0;
      if (state.view === 'voting') p = ((state.idx + 1) / N) * 100;
      else if (state.view === 'review') p = 100;
      fill.style.width = p + '%';
      document.body.classList.toggle('show-progress', state.view === 'voting' || state.view === 'review');
      if (label) label.innerHTML = `Categoria <b>${state.idx + 1}</b> de ${N}`;
      const dots = $('#vote-dots');
      if (dots) {
        dots.innerHTML = CATEGORIAS.map((c, i) =>
          `<button class="dot ${i === state.idx ? 'is-current' : ''} ${state.escolhas[c.id] ? 'is-done' : ''}" data-goto="${i}" aria-label="Ir para ${esc(c.titulo)}"></button>`).join('');
      }
      const ans = $('#vote-answered');
      if (ans) ans.textContent = `${answered}/${N} escolhidos`;
    }

    /* ---------- Categoria (uma por vez) ---------- */
    function nomineeCard(cat, n, i) {
      const sel = state.escolhas[cat.id] === n.id;
      return `
        <button class="nominee ${sel ? 'is-selected' : ''}" data-id="${esc(n.id)}" aria-pressed="${sel}" style="--i:${i}">
          <span class="nominee-frame">
            ${imgTag(n.foto, n.nome, 'nominee-img')}
            <span class="nominee-shade"></span>
            <span class="nominee-bezel" aria-hidden="true"></span>
            <span class="nominee-num" aria-hidden="true">${pad(i + 1)}</span>
            <span class="nominee-badge"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.2l7.1-.6z"/></svg>SELECIONADO</span>
            <span class="nominee-check" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>
          </span>
          <span class="nominee-info">
            <span class="nominee-name">${esc(n.nome)}</span>
            ${n.apelido ? `<span class="nominee-nick">${esc(n.apelido)}</span>` : ''}
          </span>
        </button>`;
    }

    function renderCategory(dir = 'none') {
      const cat = CATEGORIAS[state.idx];
      const stage = $('#cat-stage');
      const hasSel = !!state.escolhas[cat.id];
      const html = `
        <header class="cat-head">
          <div class="cat-kicker"><span></span>CATEGORIA ${pad(state.idx + 1)}<span></span></div>
          <h2 class="cat-title">${esc(cat.titulo)}</h2>
          <p class="cat-desc">${esc(cat.descricao)}</p>
        </header>
        <div class="nominee-grid count-${cat.indicados.length} ${hasSel ? 'has-selection' : ''}">
          ${cat.indicados.map((n, i) => nomineeCard(cat, n, i)).join('')}
        </div>
        <p class="cat-hint">${reduceMotion ? '' : '<span class="hint-ico">👆</span>'} Toque em um indicado para escolher</p>`;
      const apply = () => {
        stage.innerHTML = html;
        stage.className = 'cat-stage ' + (dir === 'next' ? 'enter-next' : dir === 'prev' ? 'enter-prev' : 'enter-fade');
        updateNav(); updateProgress();
      };
      if (dir === 'none' || reduceMotion) apply();
      else { stage.className = 'cat-stage ' + (dir === 'next' ? 'leave-next' : 'leave-prev'); setTimeout(apply, 180); }
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    }

    function updateNav() {
      const cat = CATEGORIAS[state.idx];
      const has = !!state.escolhas[cat.id];
      const prev = $('#btn-prev'), next = $('#btn-next');
      prev.querySelector('span').textContent = state.idx === 0 ? 'Início' : 'Anterior';
      const isLast = state.idx === N - 1;
      next.querySelector('span').textContent = state.fromReview ? 'Voltar à revisão' : isLast ? 'Revisar votos' : 'Próxima categoria';
      next.classList.toggle('is-disabled', !has);
      next.classList.toggle('is-ready', has);
      next.setAttribute('aria-disabled', String(!has));
    }

    function selectNominee(btn) {
      const cat = CATEGORIAS[state.idx];
      const id = btn.dataset.id;
      const was = state.escolhas[cat.id] === id;
      state.escolhas[cat.id] = id;
      saveDraft();
      $$('.nominee', $('#cat-stage')).forEach((b) => {
        const on = b.dataset.id === id;
        b.classList.toggle('is-selected', on);
        b.setAttribute('aria-pressed', String(on));
      });
      $('.nominee-grid').classList.add('has-selection');
      if (!was) {
        const r = btn.getBoundingClientRect();
        Confetti.sparkle(r.left + r.width / 2, r.top + r.height * 0.42);
        if (navigator.vibrate) navigator.vibrate(12);
      }
      updateNav(); updateProgress();
    }

    function goNext() {
      const cat = CATEGORIAS[state.idx];
      if (!state.escolhas[cat.id]) {
        const g = $('.nominee-grid');
        g.classList.remove('shake'); void g.offsetWidth; g.classList.add('shake');
        toast('Escolha um indicado para continuar ✨', 'info', 2200);
        return;
      }
      if (state.fromReview || state.idx === N - 1) { state.fromReview = false; renderReview(); showView('review'); return; }
      state.idx++;
      renderCategory('next');
    }
    function goPrev() {
      if (state.idx === 0) { renderHero(); showView('hero'); return; }
      state.idx--;
      renderCategory('prev');
    }
    function goTo(i) {
      if (i === state.idx || i < 0 || i >= N) return;
      const dir = i > state.idx ? 'next' : 'prev';
      state.idx = i;
      renderCategory(dir);
    }

    /* ---------- Revisão ---------- */
    function renderReview() {
      const missing = CATEGORIAS.filter((c) => !state.escolhas[c.id]);
      $('#review-list').innerHTML = CATEGORIAS.map((c, i) => {
        const n = findNominee(c, state.escolhas[c.id]);
        return `
          <li class="review-item glass ${n ? '' : 'is-missing'}" style="--i:${i}">
            <div class="review-thumb">${n ? imgTag(n.foto, n.nome) : '<span>?</span>'}</div>
            <div class="review-text">
              <span class="review-cat">${pad(i + 1)} · ${esc(c.titulo)}</span>
              <strong>${n ? esc(n.nome) : 'Nenhum indicado escolhido'}</strong>
              ${n && n.apelido ? `<em>${esc(n.apelido)}</em>` : ''}
            </div>
            <button class="btn btn-outline btn-sm" data-edit="${i}">${n ? 'Alterar' : 'Escolher'}</button>
          </li>`;
      }).join('');
      const warn = $('#review-warning');
      warn.hidden = missing.length === 0;
      warn.innerHTML = missing.length ? `⚠️ Falta${missing.length > 1 ? 'm' : ''} <b>${missing.length}</b> categoria${missing.length > 1 ? 's' : ''} para completar sua cédula.` : '';
      const btn = $('#btn-confirm');
      btn.disabled = missing.length > 0;
    }

    async function confirmVotes() {
      if (state.submitting) return;
      const missing = CATEGORIAS.filter((c) => !state.escolhas[c.id]);
      if (missing.length) return toast('Complete todas as categorias antes de enviar.', 'error');
      const ok = await modal({
        icon: sealSVG(),
        title: 'Lacrar seu envelope?',
        html: '<p>Depois de confirmar, seu voto é <b>definitivo</b> e não poderá ser alterado. O voto é secreto: ninguém vê parciais até a cerimônia.</p>',
        confirmText: 'Confirmar meus votos',
        cancelText: 'Revisar mais'
      });
      if (!ok) return;
      const btn = $('#btn-confirm');
      state.submitting = true;
      btn.classList.add('is-loading'); btn.disabled = true;
      // Envia somente IDs válidos das categorias atuais
      const escolhas = {};
      CATEGORIAS.forEach((c) => { if (findNominee(c, state.escolhas[c.id])) escolhas[c.id] = state.escolhas[c.id]; });
      try {
        await Backend.submitVote(state.user.uid, escolhas);
        clearDraft();
        renderMyChoices('#success-choices', escolhas);
        $('#success-name').textContent = firstName(state.user);
        showView('success');
        setTimeout(() => { Confetti.cannons(); Confetti.rain(2600); }, 250);
        if (navigator.vibrate) navigator.vibrate([20, 60, 30]);
      } catch (e) {
        if (e.code === 'permission-denied') {
          const v = await Backend.getMyVote(state.user.uid).catch(() => null);
          if (v) { renderMyChoices('#voted-choices', v.escolhas); renderVoted(); showView('voted'); toast('Você já tinha votado — mostramos seu voto registrado.', 'info'); }
          else toast('Não foi possível registrar: a votação pode ter sido encerrada.', 'error', 6000);
        } else {
          toast(friendlyError(e), 'error', 6000);
        }
      } finally {
        state.submitting = false;
        btn.classList.remove('is-loading'); btn.disabled = false;
      }
    }

    /* ---------- Minhas escolhas (sucesso / já votou) ---------- */
    function renderMyChoices(sel, escolhas = {}) {
      $(sel).innerHTML = CATEGORIAS.map((c, i) => {
        const n = findNominee(c, escolhas[c.id]);
        return `
          <li class="choice glass" style="--i:${i}">
            <div class="choice-photo">${n ? imgTag(n.foto, n.nome) : '<span>—</span>'}</div>
            <div class="choice-text">
              <span class="choice-cat">${esc(c.titulo)}</span>
              <strong>${n ? esc(n.nome) : 'Sem escolha'}</strong>
            </div>
          </li>`;
      }).join('');
    }
    function renderVoted() {
      $('#voted-name').textContent = firstName(state.user);
    }

    /* ---------- Votação encerrada: vencedores ---------- */
    function winnerCard(c, i) {
      const winners = c.indicados.filter((n) => (c.vencedores || []).includes(n.id));
      const sorted = [...c.indicados].sort((a, b) => b.votos - a.votos);
      const tie = winners.length > 1;
      const top = winners[0];
      const bars = sorted.map((n) => `
        <div class="bar-row ${winners.includes(n) ? 'is-win' : ''}">
          <span class="bar-name">${esc(n.nome)}</span>
          <span class="bar-val">${fmtPct(n.votos, c.total)} <small>(${n.votos})</small></span>
          <div class="bar"><i style="--w:${pct(n.votos, c.total)}%"></i></div>
        </div>`).join('');
      return `
        <article class="winner-card glass" style="--i:${i}">
          <div class="winner-kicker">${pad(i + 1)} · ${esc(c.titulo)}</div>
          ${top ? `
            <div class="winner-photo-wrap ${tie ? 'is-tie' : ''}">
              <div class="winner-rays"></div>
              ${winners.map((w) => `<div class="winner-photo">${imgTag(w.foto, w.nome)}</div>`).join('')}
              <div class="winner-trophy">${trophySVG()}</div>
            </div>
            ${tie ? '<span class="tie-badge">EMPATE</span>' : ''}
            <h3 class="winner-name">${winners.map((w) => esc(w.nome)).join(' <span>&amp;</span> ')}</h3>
            ${!tie && top.apelido ? `<p class="winner-nick">${esc(top.apelido)}</p>` : ''}
            <p class="winner-stats"><b>${top.votos}</b> voto${top.votos === 1 ? '' : 's'} · ${fmtPct(top.votos, c.total)}</p>
          ` : `<div class="winner-empty">Nenhum voto nesta categoria</div>`}
          <button class="btn btn-ghost btn-sm winner-toggle" data-toggle-score aria-expanded="false">Ver placar <span>▾</span></button>
          <div class="score" hidden>${bars}<p class="score-total">${c.total} voto${c.total === 1 ? '' : 's'} na categoria</p></div>
        </article>`;
    }

    /** Verifica se uma categoria já foi liberada pelo organizador no painel. */
    function isCatRev(c, r) {
      if (!c || !r) return false;
      if (typeof c.revelada === 'boolean') return c.revelada;
      if (r.reveladas && typeof r.reveladas === 'object') return !!r.reveladas[c.id];
      return true; // compatibilidade com resultados antigos sem trava
    }

    function renderClosed(ev) {
      const r = ev.resultadosFinais;
      const key = JSON.stringify(r || null);
      if (key === state.closedKey) return;
      const isFirstLoad = state.closedKey === null;
      state.closedKey = key;
      state.resultados = r || null;
      const grid = $('#winners-grid');
      const spot = $('#winners-spotlight');
      const toolbar = $('#closed-toolbar');
      const meta = $('#closed-meta');
      if (!r || !Array.isArray(r.categorias) || !r.categorias.length) {
        meta.innerHTML = '';
        toolbar.hidden = true;
        spot.hidden = true;
        grid.hidden = false;
        grid.innerHTML = `<div class="closed-wait glass"><div class="spinner-ring"></div><p>Os envelopes estão sendo conferidos.<br>Os vencedores aparecerão aqui em instantes.</p></div>`;
        $('#btn-toggle-all').hidden = true;
        return;
      }

      const cats = r.categorias;
      const palcoIdx = Math.max(0, Math.min(cats.length - 1, Number(r.palcoIdx) || 0));
      const newRevMap = {};
      let newlyUnlockedIdx = -1;
      cats.forEach((c, idx) => {
        const rev = isCatRev(c, r);
        newRevMap[c.id] = rev;
        if (rev && !state.prevRevMap[c.id]) newlyUnlockedIdx = idx;
      });
      const revCount = Object.values(newRevMap).filter(Boolean).length;
      const allUnlocked = revCount === cats.length;

      // Se o ADM mudou a categoria no palco ou acabou de liberar uma nova categoria, acompanha ao vivo!
      if (newlyUnlockedIdx !== -1) {
        state.spotIdx = newlyUnlockedIdx;
      } else if (palcoIdx !== state.prevPalcoIdx || isFirstLoad) {
        state.spotIdx = palcoIdx;
      }
      if (state.spotIdx >= cats.length) state.spotIdx = 0;

      const shouldBurst = newlyUnlockedIdx !== -1 || (isFirstLoad && isCatRev(cats[state.spotIdx], r));
      state.prevRevMap = newRevMap;
      state.prevPalcoIdx = palcoIdx;

      toolbar.hidden = false;
      const d = Backend.toDate(r.publicadoEm);
      meta.innerHTML = `<span><b>${r.totalVotos}</b> votos computados</span><span class="sep">✦</span><span><b>${revCount}/${cats.length}</b> troféus revelados</span>${d ? `<span class="sep">✦</span><span>Publicado em ${d.toLocaleDateString('pt-BR')}</span>` : ''}`;

      // Atualiza botão "Ver Todos" (bloqueado até todas as categorias serem liberadas pelo ADM)
      const btnGrid = $('#btn-mode-grid');
      if (btnGrid) {
        btnGrid.innerHTML = allUnlocked
          ? `🏛️ Ver Todos (${cats.length})`
          : `🔒 Ver Todos (${revCount}/${cats.length})`;
        btnGrid.classList.toggle('is-locked-tab', !allUnlocked);
      }

      // Renderiza na grade apenas as categorias já liberadas
      grid.innerHTML = cats.filter((c) => isCatRev(c, r)).map(winnerCard).join('');

      if (!allUnlocked && state.closedMode === 'grid') {
        state.closedMode = 'spotlight';
      }
      applyClosedMode(state.closedMode, shouldBurst);
    }

    /** Alterna entre Palco 1 por 1 (Anti-Spoiler) e Galeria Completa. */
    function applyClosedMode(mode, shouldBurst = false) {
      const r = state.resultados;
      const cats = (r && r.categorias) || [];
      const revCount = cats.filter((c) => isCatRev(c, r)).length;
      const allUnlocked = cats.length > 0 && revCount === cats.length;

      if (mode === 'grid' && !allUnlocked) {
        toast(`🔒 Sem spoilers! A galeria completa será liberada quando todos os ${cats.length} troféus forem anunciados (${revCount}/${cats.length} liberados).`, 'info', 3800);
        return;
      }

      state.closedMode = mode;
      $$('[data-closed-mode]').forEach((b) => {
        const on = b.dataset.closedMode === mode;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-selected', String(on));
      });
      const isGrid = mode === 'grid';
      $('#winners-grid').hidden = !isGrid;
      $('#winners-spotlight').hidden = isGrid;
      $('#btn-toggle-all').hidden = !isGrid;
      if (!isGrid) {
        renderSpotlight(false);
      }
      if (shouldBurst) {
        setTimeout(() => { Confetti.cannons(); Confetti.rain(3200); }, 280);
      }
    }

    /** Verifica se o visitante pode visualizar determinada categoria no celular. */
    function canViewCat(idx) {
      const r = state.resultados;
      if (!r || !r.categorias || !r.categorias[idx]) return false;
      const palcoIdx = Math.max(0, Math.min(r.categorias.length - 1, Number(r.palcoIdx) || 0));
      return isCatRev(r.categorias[idx], r) || idx === palcoIdx;
    }

    /** Renderiza o palco 1 por 1 sincronizado com o ADM (sem spoiler das próximas). */
    function renderSpotlight(burstOnEnter = false) {
      const r = state.resultados;
      const spot = $('#winners-spotlight');
      if (!r || !r.categorias || !spot) return;
      const cats = r.categorias;
      const palcoIdx = Math.max(0, Math.min(cats.length - 1, Number(r.palcoIdx) || 0));
      if (!canViewCat(state.spotIdx)) state.spotIdx = palcoIdx;
      const i = Math.max(0, Math.min(cats.length - 1, state.spotIdx));
      state.spotIdx = i;
      const c = cats[i];
      const prevCat = i > 0 ? cats[i - 1] : null;
      const prevAllowed = i > 0 && canViewCat(i - 1);
      const nextCat = i < cats.length - 1 ? cats[i + 1] : null;
      const nextAllowed = i < cats.length - 1 && canViewCat(i + 1);
      const isRevealed = isCatRev(c, r);
      const revCount = cats.filter((cat) => isCatRev(cat, r)).length;
      const allUnlocked = revCount === cats.length;

      // Barra de pílulas das categorias (com cadeado 🔒 nas que o ADM ainda não liberou)
      const pills = `
        <div class="spot-nav-top">
          <span class="spot-step-count">TROFÉU <b>${pad(i + 1)}</b> DE ${pad(cats.length)} · <b>${revCount}/${cats.length}</b> REVELADOS</span>
          <div class="spot-pills" role="tablist" aria-label="Categorias">
            ${cats.map((cat, idx) => {
              const rev = isCatRev(cat, r);
              const allowed = canViewCat(idx);
              const ico = rev ? '✓' : allowed ? '✉️' : '🔒';
              return `<button class="spot-pill ${idx === i ? 'is-current' : ''} ${rev ? 'is-done' : ''} ${!allowed ? 'is-locked' : ''}" data-spot-goto="${idx}" title="${esc(cat.titulo)}">
                <b>${ico} ${pad(idx + 1)}</b><span>${esc(cat.titulo)}</span>
              </button>`;
            }).join('')}
          </div>
        </div>`;

      if (!isRevealed) {
        // CATEGORIA NO PALCO EM SUSPENSE (O ADM ainda não liberou o vencedor desta categoria)
        spot.innerHTML = `
          ${pills}
          <article class="spot-stage glass is-envelope">
            <div class="spot-live-wait"><i></i>NO PALCO AGORA · AGUARDANDO REVELAÇÃO</div>
            <div class="cat-kicker" style="margin-top:12px;"><span></span>CATEGORIA ${pad(i + 1)} · INDICADOS<span></span></div>
            <h2 class="spot-cat-title gold-text">${esc(c.titulo)}</h2>
            ${c.descricao ? `<p class="spot-cat-desc">${esc(c.descricao)}</p>` : ''}
            <div class="spot-nominees">
              ${c.indicados.map((n, k) => `
                <div class="spot-nom-card" data-spot-nom="${k}" style="--i:${k}">
                  <div class="spot-nom-photo">${imgTag(n.foto, n.nome)}</div>
                  <strong>${esc(n.nome)}</strong>
                  ${n.apelido ? `<small>${esc(n.apelido)}</small>` : ''}
                </div>`).join('')}
            </div>
            <div class="spot-sealed-box glass">
              <span class="spot-sealed-ico">✉️</span>
              <div>
                <strong>Envelope Lacrado — Sem Spoilers!</strong>
                <p>Olhe para o palco! Assim que o apresentador anunciar o campeão, o resultado aparecerá aqui na sua tela automaticamente com confetes.</p>
              </div>
            </div>
            <nav class="spot-actions">
              <button class="btn btn-ghost" data-spot-prev ${prevAllowed ? '' : 'disabled'}>← Categoria anterior</button>
              <button class="btn btn-outline ${nextAllowed ? '' : 'is-locked-btn'}" data-spot-next>
                <span>${nextCat ? `${nextAllowed ? 'Próxima:' : '🔒 Bloqueada:'} ${pad(i + 2)} · ${esc(nextCat.titulo)}` : '🔒 Aguardando revelação'}</span>
              </button>
            </nav>
          </article>`;
        return;
      }

      // VENCEDOR LIBERADO PELO ADM (HORA DE SUBIR NO PALCO E PEGAR O TROFÉU)
      const winners = c.indicados.filter((n) => (c.vencedores || []).includes(n.id));
      const sorted = [...c.indicados].sort((a, b) => b.votos - a.votos);
      const tie = winners.length > 1;
      const top = winners[0];
      const bars = sorted.map((n) => `
        <div class="bar-row ${winners.includes(n) ? 'is-win' : ''}">
          <span class="bar-name">${esc(n.nome)}</span>
          <span class="bar-val">${fmtPct(n.votos, c.total)} <small>(${n.votos})</small></span>
          <div class="bar"><i style="--w:${pct(n.votos, c.total)}%"></i></div>
        </div>`).join('');

      spot.innerHTML = `
        ${pills}
        <article class="spot-stage glass is-winner">
          <div class="spot-call-badge">🏆 HORA DO TROFÉU · SUBA AO PALCO!</div>
          <div class="cat-kicker" style="margin-top:12px;"><span></span>CATEGORIA ${pad(i + 1)}<span></span></div>
          <h2 class="spot-cat-sub">${esc(c.titulo)}</h2>

          ${top ? `
            <div class="spot-hero-wrap ${tie ? 'is-tie' : ''}">
              <div class="spot-rays" aria-hidden="true"></div>
              <div class="spot-laurel" aria-hidden="true">${laurelSVG()}</div>
              <div class="spot-photos">
                ${winners.map((w) => `<div class="spot-photo">${imgTag(w.foto, w.nome)}</div>`).join('')}
              </div>
              <div class="spot-trophy-badge">${trophySVG()}</div>
            </div>
            <p class="spot-win-label">${tie ? 'OS CAMPEÕES · EMPATE' : 'GRANDE VENCEDOR(A)'}</p>
            <h3 class="spot-win-name gold-text">${winners.map((w) => esc(w.nome)).join(' <span>&amp;</span> ')}</h3>
            ${!tie && top.apelido ? `<p class="spot-win-nick">${esc(top.apelido)}</p>` : ''}
            <div class="spot-win-stats">
              <span><b>${top.votos}</b> voto${top.votos === 1 ? '' : 's'}</span>
              <span class="sep">◆</span>
              <span><b>${fmtPct(top.votos, c.total)}</b> da preferência</span>
            </div>
          ` : `<div class="winner-empty">Nenhum voto registrado nesta categoria</div>`}

          <div class="spot-celebrate">
            <button class="btn btn-outline btn-sm" data-spot-confetti>🎉 Soltar Confetes (Hora da Foto!)</button>
            <button class="btn btn-ghost btn-sm winner-toggle" data-toggle-score aria-expanded="false">Ver placar da categoria <span>▾</span></button>
            <div class="score spot-score" hidden>${bars}<p class="score-total">${c.total} voto${c.total === 1 ? '' : 's'} na categoria</p></div>
          </div>

          <nav class="spot-actions">
            <button class="btn btn-ghost btn-lg" data-spot-prev ${prevAllowed ? '' : 'disabled'}>
              <span>← ${prevCat ? `${pad(i)} · ${esc(prevCat.titulo)}` : 'Início'}</span>
            </button>
            ${nextCat ? `
              <button class="btn ${nextAllowed ? 'btn-gold' : 'btn-outline is-locked-btn'} btn-lg" data-spot-next>
                <span>${nextAllowed
                  ? `Próximo Troféu: ${pad(i + 2)} · ${esc(nextCat.titulo)} →`
                  : `🔒 Próximo: ${pad(i + 2)} · ${esc(nextCat.titulo)} (Aguardando ADM…)`}</span>
              </button>
            ` : allUnlocked ? `
              <button class="btn btn-gold btn-lg" data-closed-mode="grid">
                <span>🏛️ Ver Galeria com Todos os Campeões</span>
              </button>
            ` : `
              <button class="btn btn-outline is-locked-btn btn-lg" data-closed-mode="grid">
                <span>🔒 Galeria Completa (${revCount}/${cats.length} liberadas)</span>
              </button>
            `}
          </nav>
        </article>`;

      if (burstOnEnter) {
        Confetti.cannons();
      }
    }

    function stepSpotlight(delta) {
      if (!state.resultados) return;
      const cats = state.resultados.categorias;
      const next = state.spotIdx + delta;
      if (next < 0) return;
      if (next >= cats.length) {
        applyClosedMode('grid');
        return;
      }
      if (!canViewCat(next)) {
        const blockedCat = cats[next];
        toast(`🔒 Sem spoilers! A categoria "${blockedCat ? blockedCat.titulo : ''}" só será liberada quando o apresentador anunciar no palco.`, 'info', 3600);
        return;
      }
      state.spotIdx = next;
      renderSpotlight(isCatRev(cats[next], state.resultados));
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    }

    /* ---------- Eventos (delegação) ---------- */
    document.addEventListener('click', (e) => {
      const t = e.target;
      if (t.closest('#btn-start')) return startFlow();
      if (t.closest('#btn-google')) { sessionStorage.removeItem(PENDING_KEY); return doLogin(); }
      if (t.closest('[data-action="logout"]')) {
        Backend.logout().then(() => toast('Você saiu da sua conta.', 'info'));
        return;
      }
      const nom = t.closest('.nominee');
      if (nom) return selectNominee(nom);
      if (t.closest('#btn-next')) return goNext();
      if (t.closest('#btn-prev')) return goPrev();
      if (t.closest('#btn-exit-vote') || t.closest('[data-go-home]')) { renderHero(); return showView('hero'); }
      const dot = t.closest('[data-goto]');
      if (dot) return goTo(+dot.dataset.goto);
      const edit = t.closest('[data-edit]');
      if (edit) { state.idx = +edit.dataset.edit; state.fromReview = true; renderCategory('none'); return showView('voting'); }
      if (t.closest('#btn-back-review')) { state.idx = N - 1; state.fromReview = false; renderCategory('none'); return showView('voting'); }
      if (t.closest('#btn-confirm')) return confirmVotes();
      if (t.closest('[data-share]')) {
        const url = location.href.split('#')[0];
        const msg = `🏆 Já votei no ${EV.nome} ${EV.ano}! Escolha os vencedores da turma também: ${url}`;
        window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank', 'noopener');
        return;
      }
      const tg = t.closest('[data-toggle-score]');
      if (tg) {
        const box = tg.nextElementSibling;
        box.hidden = !box.hidden;
        tg.setAttribute('aria-expanded', String(!box.hidden));
        tg.firstChild.textContent = box.hidden ? 'Ver placar ' : 'Ocultar placar ';
        return;
      }
      if (t.closest('#btn-toggle-all')) {
        const boxes = $$('.winner-card .score');
        const open = boxes.some((b) => b.hidden);
        boxes.forEach((b) => {
          b.hidden = !open;
          const btn = b.previousElementSibling;
          btn.setAttribute('aria-expanded', String(open));
          btn.firstChild.textContent = open ? 'Ocultar placar ' : 'Ver placar ';
        });
        t.closest('#btn-toggle-all').textContent = open ? 'Ocultar placar completo' : 'Ver placar completo';
        return;
      }
      if (t.closest('[data-inapp-help]')) return showInAppHelp(detectInApp());
      if (t.closest('[data-dismiss-banner]')) { $('#inapp-banner').hidden = true; document.body.classList.remove('has-banner'); }

      // Controles do Modo Palco 1 por 1 (Votação Encerrada)
      const modeBtn = t.closest('[data-closed-mode]');
      if (modeBtn) return applyClosedMode(modeBtn.dataset.closedMode);
      const spotGoto = t.closest('[data-spot-goto]');
      if (spotGoto) {
        const idx = +spotGoto.dataset.spotGoto;
        if (!canViewCat(idx)) {
          const cats = (state.resultados && state.resultados.categorias) || [];
          toast(`🔒 Sem spoilers! A categoria "${cats[idx] ? cats[idx].titulo : ''}" será liberada ao vivo pelo apresentador.`, 'info', 3500);
          return;
        }
        state.spotIdx = idx;
        renderSpotlight(isCatRev(state.resultados.categorias[idx], state.resultados));
        return;
      }
      if (t.closest('[data-spot-prev]')) return stepSpotlight(-1);
      if (t.closest('[data-spot-next]')) return stepSpotlight(1);
      if (t.closest('[data-spot-confetti]')) { Confetti.cannons(); Confetti.rain(2500); return; }
      if (t.closest('#btn-closed-fs')) {
        if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
        else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {});
        return;
      }
    });

    // Teclado (PC): setas navegam entre categorias na votação E no Modo Palco 1 por 1
    document.addEventListener('keydown', (e) => {
      if ($('.modal-overlay')) return;
      if (state.view === 'voting') {
        if (e.key === 'ArrowRight') goNext();
        if (e.key === 'ArrowLeft') goPrev();
      } else if (state.view === 'closed' && state.closedMode !== 'grid') {
        if (e.key === 'ArrowRight') { e.preventDefault(); stepSpotlight(1); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); stepSpotlight(-1); }
      }
    });

    // Gesto de deslizar (celular) na área da categoria
    (function swipe() {
      let x0 = null, y0 = null;
      const area = $('#cat-stage');
      area.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
      area.addEventListener('touchend', (e) => {
        if (x0 === null) return;
        const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
        x0 = null;
        if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.8) {
          if (dx < 0 && state.escolhas[CATEGORIAS[state.idx].id]) goNext();
          else if (dx > 0 && state.idx > 0) goPrev();
        }
      }, { passive: true });
    })();

    /* ---------- Aviso de navegador interno ---------- */
    function setupInAppBanner() {
      const app = detectInApp();
      if (!app || Backend.DEMO) return;
      const b = $('#inapp-banner');
      $('#inapp-name').textContent = app === 'app' ? 'de um aplicativo' : `do ${app}`;
      b.hidden = false;
      document.body.classList.add('has-banner');
    }

    /* ---------- Inicialização ---------- */
    (async function start() {
      fillStatic();
      initAmbient();
      route();
      try {
        await Backend.init();
      } catch (e) {
        setLoading('');
        $('#loading-text').innerHTML = `Não foi possível conectar.<br><small>${friendlyError(e)}</small><br><button class="btn btn-outline btn-sm" onclick="location.reload()">Tentar novamente</button>`;
        return;
      }
      setupInAppBanner();
      Backend.consumeRedirect().then((err) => {
        if (!err) return;
        sessionStorage.removeItem(PENDING_KEY);
        if (detectInApp()) showInAppHelp(detectInApp());
        else toast(friendlyError(err), 'error', 7000);
      });
      Backend.onAuth((u) => {
        state.user = u;
        state.authReady = true;
        route(); // sem usuário em telas de votação → volta para o início
      });
      Backend.watchEvento(
        (ev) => { state.evento = ev; route(); },
        (err) => {
          console.error(err);
          $('#loading-text').innerHTML = `Não foi possível ler o status da votação.<br><small>${friendlyError(err)}</small>`;
        }
      );
    })();
  }
})();
