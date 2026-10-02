/* ============ shared site behaviors ============ */
(function () {
  /* theme switch */
  const root = document.documentElement;
  const knob = document.getElementById('themeKnob');
  function setTheme(mode) {
    root.classList.toggle('dark', mode === 'dark');
    if (knob) knob.textContent = mode === 'dark' ? '☾' : '☀';
    try { localStorage.setItem('nk-theme', mode); } catch (e) {}
  }
  let saved = null;
  try { saved = localStorage.getItem('nk-theme'); } catch (e) {}
  setTheme(saved || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  const sw = document.getElementById('themeSw');
  if (sw) sw.addEventListener('click', () =>
    setTheme(root.classList.contains('dark') ? 'light' : 'dark'));

  /* scroll reveal + stat bars */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    e.target.querySelectorAll('.bar i').forEach(b => b.style.width = b.dataset.w);
    io.unobserve(e.target);
  }), { threshold: .15 });
  document.querySelectorAll('.rv').forEach(el => io.observe(el));

  /* release accordions */
  document.querySelectorAll('.rel-head').forEach(h => h.addEventListener('click', () => {
    h.parentElement.classList.toggle('open');
  }));
})();

/* ============ typed hero line (index only) ============ */
(function () {
  const el = document.getElementById('typed');
  if (!el) return;
  const lines = [
    'go build ./... && echo "works on prod too"',
    'pip install tokenly-auth  # 1,480 downloads and counting',
    'aws lambda invoke --function-name ship-it',
    'nmap -sV --authorized-only target.com',
    'curl -s nirbhay.me/hire | jq .available  # true'
  ];
  let li = 0;
  function typeLine() {
    const s = lines[li]; let i = 0; el.textContent = '';
    const iv = setInterval(() => {
      el.textContent = s.slice(0, ++i);
      if (i >= s.length) { clearInterval(iv); setTimeout(erase, 2400); }
    }, 34);
  }
  function erase() {
    const iv = setInterval(() => {
      el.textContent = el.textContent.slice(0, -1);
      if (!el.textContent.length) { clearInterval(iv); li = (li + 1) % lines.length; setTimeout(typeLine, 350); }
    }, 12);
  }
  typeLine();
})();

/* ============ pipeline machine (index only) ============ */
(function () {
  const pipe = document.getElementById('pipe');
  if (!pipe) return;
  const stages = document.querySelectorAll('#pipe .stage');
  const packet = document.getElementById('packet');
  const log = document.getElementById('log');
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const stageLogs = [
    ['git push origin main', 'ok', 'a1b2c3d · "fix: final final v2"'],
    ['go build ./...', 'ok', 'compiled in 1.8s · 0 warnings'],
    ['go test ./...', 'ok', '42 passed · 0 failed · cov 91%'],
    ['deploy → cloudflare edge', 'ok', 'healthcheck 200 OK · live ✓']
  ];
  const idle = [
    ['GET /api/health', 'inf', '200 · 3ms'],
    ['cache hit ratio', 'inf', '97.4%'],
    ['dynamodb', 'inf', 'wcu 4 · rcu 11'],
    ['lambda.invoke', 'inf', 'duration 214ms'],
    ['redis', 'inf', 'mem 41mb · evictions 0'],
    ['suspicious header?', 'wrn', 'investigated · was fine'],
    ['deploy freq', 'inf', '4.2/day'],
    ['uptime', 'ok', '99.98%']
  ];
  function centerOf(st) {
    const r = st.querySelector('.node').getBoundingClientRect();
    const pr = pipe.getBoundingClientRect();
    return r.left - pr.left + r.width / 2 - 6;
  }
  function pushLog(txt, cls, msg) {
    const d = document.createElement('div'); d.className = 'ln';
    const t = new Date().toTimeString().slice(0, 8);
    const sym = cls === 'ok' ? '✓' : cls === 'wrn' ? '!' : '›';
    d.innerHTML = `<span class="t">${t}</span> <span class="${cls}">${sym} ${txt}</span> <span class="t">${msg}</span>`;
    log.appendChild(d);
    while (log.children.length > 7) log.removeChild(log.firstChild);
  }
  let run = 0;
  async function cycle() {
    run++;
    stages.forEach(s => { s.classList.remove('active', 'done'); s.querySelector('.stt').textContent = ''; });
    for (let i = 0; i < 4; i++) {
      const st = stages[i]; st.classList.add('active'); st.querySelector('.stt').textContent = 'running';
      packet.style.transform = `translateX(${centerOf(st)}px)`;
      packet.style.background = 'var(--blu)';
      await wait(900 + Math.random() * 500);
      pushLog(...stageLogs[i]);
      st.querySelector('.stt').textContent = 'done ✓';
      st.classList.remove('active'); st.classList.add('done');
      packet.style.background = 'var(--grn)';
      await wait(300);
    }
    if (run === 1) {
      const ci = document.getElementById('ci');
      if (ci) { ci.classList.add('done'); document.getElementById('ci-txt').textContent = 'build #248 passed'; }
    }
    for (let k = 0; k < 5; k++) { pushLog(...idle[Math.random() * idle.length | 0]); await wait(700); }
    cycle();
  }
  ['git fetch origin', 'docker pull base:latest', 'GET /api/health', 'cache warm'].forEach((t, i) =>
    pushLog(t, i % 2 ? 'inf' : 'ok', i % 2 ? '200 · 4ms' : 'done'));
  requestAnimationFrame(() => { packet.style.transform = `translateX(${centerOf(stages[0])}px)`; cycle(); });
  addEventListener('resize', () => packet.style.transform = `translateX(${centerOf(stages[0])}px)`);
})();

/* ============ real GitHub contribution graph (index only) ============ */
(function () {
  const heat = document.getElementById('heat');
  if (!heat) return;
  const countEl = document.getElementById('hcount');
  const shades = ['var(--line)', 'var(--heat1)', 'var(--heat2)', 'var(--heat3)', 'var(--grn)'];

  function render(weeks) { // weeks: array of 26 arrays of 7 levels (0-4)
    heat.innerHTML = '';
    let total = 0;
    weeks.forEach(wk => wk.forEach(d => {
      const c = document.createElement('i');
      c.style.background = shades[d.l];
      c.title = `${d.c} contributions · ${d.day}`;
      total += d.c;
      heat.appendChild(c);
    }));
    countEl.textContent = total.toLocaleString();
  }

  function fake() {
    const weeks = [];
    for (let w = 0; w < 26; w++) {
      const wk = [];
      for (let d = 0; d < 7; d++) {
        const v = Math.random();
        const l = v > .82 ? 4 : v > .62 ? 3 : v > .42 ? 2 : v > .22 ? 1 : 0;
        wk.push({ l, c: l * 3, day: '' });
      }
      weeks.push(wk);
    }
    render(weeks);
  }

  // fetch the real public contributions graph for github.com/err0rgod
  fetch('https://corsproxy.io/?url=' + encodeURIComponent('https://github.com/users/err0rgod/contributions'))
    .then(r => { if (!r.ok) throw 0; return r.text(); })
    .then(html => {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const tds = [...doc.querySelectorAll('td.ContributionCalendar-day')];
      if (tds.length < 100) throw 0;
      // GitHub renders columns = weeks; take last 26 weeks
      const weeks = [];
      let cur = [];
      tds.forEach(td => {
        const lvl = parseInt(td.getAttribute('data-level') || '0', 10);
        const date = td.getAttribute('data-date') || '';
        const countText = (td.textContent.match(/^\s*(\d+)/) || [0, '0'])[1];
        cur.push({ l: lvl, c: parseInt(countText, 10) || 0, day: date });
        if (cur.length === 7) { weeks.push(cur); cur = []; }
      });
      if (cur.length) weeks.push(cur);
      render(weeks.slice(-26));
    })
    .catch(fake);
})();
