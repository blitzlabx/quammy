(() => {
  const COL = ['#ffd57e', '#ffb6d9', '#c4a1ff', '#ffffff', '#ff8ec8'];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const STAR = '<svg viewBox="0 0 24 24"><path d="M12 0C13 8 16 11 24 12 16 13 13 16 12 24 11 16 8 13 0 12 8 11 11 8 12 0Z"/></svg>';

  // ---- Cute particles: hearts, sparkles and dots that drift up and dodge your finger ----
  const cv = document.getElementById('bg');
  if (cv) {
    const x = cv.getContext('2d');
    const heart = new Path2D('M12 21s-7-4.6-9.5-9A5.2 5.2 0 0 1 12 6a5.2 5.2 0 0 1 9.5 6c-2.5 4.4-9.5 9-9.5 9z');
    const star = new Path2D('M12 0C13 8 16 11 24 12 16 13 13 16 12 24 11 16 8 13 0 12 8 11 11 8 12 0Z');
    let W, H, dpr, P = [], m = { x: -999, y: -999 };
    const mk = (init) => ({
      x: Math.random() * W, y: init ? Math.random() * H : H + 30,
      z: 8 + Math.random() * 14, v: .15 + Math.random() * .4, t: Math.random() * 6.28, w: .4 + Math.random() * .8,
      k: Math.random() < .35 ? 0 : Math.random() < .6 ? 1 : 2, c: COL[Math.random() * COL.length | 0],
      a: .25 + Math.random() * .5, r: Math.random() * 6.28, dr: (Math.random() - .5) * .012, ox: 0, oy: 0
    });
    const size = () => {
      dpr = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      const n = W < 600 ? 22 : 38; P = Array.from({ length: n }, () => mk(true));
    };
    const draw = (p) => {
      x.save(); x.translate(p.x + p.ox, p.y + p.oy); x.rotate(p.r);
      x.globalAlpha = p.a; x.fillStyle = p.c; x.shadowColor = p.c; x.shadowBlur = 8;
      if (p.k === 2) { x.beginPath(); x.arc(0, 0, p.z / 4, 0, 6.28); x.fill(); }
      else { const s = p.z / 24; x.scale(s, s); x.translate(-12, -12); x.fill(p.k ? star : heart); }
      x.restore();
    };
    const tick = () => {
      x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, W, H);
      for (const p of P) {
        p.y -= p.v; p.t += .01 * p.w; p.x += Math.sin(p.t) * .3; p.r += p.dr;
        const dx = p.x - m.x, dy = p.y - m.y, d = Math.hypot(dx, dy);
        if (d < 110) { p.ox += dx / d * (110 - d) * .05; p.oy += dy / d * (110 - d) * .05; }
        p.ox *= .93; p.oy *= .93;
        if (p.y < -30) Object.assign(p, mk(false));
        draw(p);
      }
      if (!reduce) requestAnimationFrame(tick);
    };
    addEventListener('pointermove', (e) => { m.x = e.clientX; m.y = e.clientY; }, { passive: true });
    addEventListener('pointerleave', () => { m.x = m.y = -999; });
    addEventListener('resize', size);
    window._recolor = () => P.forEach(p => { p.c = COL[Math.random() * COL.length | 0]; });
    size(); tick();
  }

  // ---- Sparkle burst: stars pop out of an element when Quammy is very happy ----
  function burst(el, count = 16) {
    if (!el || reduce) return;
    let fx = document.getElementById('fx');
    if (!fx) { fx = document.createElement('div'); fx.id = 'fx'; fx.className = 'fx'; document.body.appendChild(fx); }
    const r = el.getBoundingClientRect();
    for (let i = 0; i < count; i++) {
      const a = (Math.PI * 2 * i) / count + Math.random() * .6, dist = 40 + Math.random() * 70;
      const s = document.createElement('div'); s.className = 'spark';
      s.style.left = r.left + r.width / 2 + 'px'; s.style.top = r.top + r.height / 2 + 'px';
      s.style.setProperty('--dx', Math.cos(a) * dist + 'px'); s.style.setProperty('--dy', Math.sin(a) * dist - 24 + 'px');
      s.style.setProperty('--r', (Math.random() * 360 - 180) + 'deg'); s.style.setProperty('--s', (8 + Math.random() * 12) + 'px');
      s.style.setProperty('--k', COL[i % COL.length]); s.style.animationDelay = Math.random() * .15 + 's';
      s.innerHTML = STAR; s.addEventListener('animationend', () => s.remove()); fx.appendChild(s);
    }
    if (navigator.vibrate) navigator.vibrate(16);
  }

  // ---- Moods: a tiny colored dot shows how she feels ----
  const MOODS = {
    happy: { t: 'Feeling happy', c: '#ff8ec8' }, joy: { t: 'Over the moon', c: '#ffd57e' },
    love: { t: 'Feeling loved', c: '#ff5d9e' }, shy: { t: 'A little shy', c: '#ffb199' },
    care: { t: 'Here for you', c: '#a99bff' }, sleepy: { t: 'Feeling sleepy', c: '#8fa6ff' },
    think: { t: 'Thinking…', c: '#7fe6c4' }
  };
  const RULES = [
    ['joy', /yay|so happy|amazing|best day|squeal|eek|eep|ahh+|can'?t wait|wonderful|congrat|proud of you|🥰|😍|🎉|🤩|💖|✨/gi],
    ['love', /husband|babe|my love|love you|miss you|cuddle|hug|💕|💗|💞|❤|💛|😘/gi],
    ['shy', /shy|blush|hehe|um+\b|ehh|🙈|😳|>\/\/</gi],
    ['care', /sorry|sad|hurt|lonely|tired|here for you|it'?s okay|stressful|🥺|😢|🥹/gi],
    ['sleepy', /sleep|goodnight|good night|yawn|bedtime|😴/gi],
    ['think', /hmm+|let me think|not sure|maybe|🤔/gi]
  ];
  function detectMood(text) {
    let best = 'happy', top = 0, joy = 0;
    for (const [k, re] of RULES) {
      const n = (text.match(re) || []).length;
      if (k === 'joy') joy = n;
      if (n > top) { top = n; best = k; }
    }
    const bangs = (text.match(/!/g) || []).length;
    const very = joy >= 2 || (joy >= 1 && bangs >= 2) || bangs >= 4;
    return { mood: very ? 'joy' : best, veryHappy: very };
  }
  window.Q = { burst, detectMood, MOODS, COL };
})();
