/* Pixel sign: an 11x11 dot board that spells out the section you're reading.
   Desktop gets it in the left margin; phones get a mini one in a bottom bar that opens the menu. */
(function () {
  var N = 11;
  var ART = {
    intro: [
      '...........', '...........',
      'X...X.X...X', 'XX..X.X..X.', 'XX..X.X.X..', 'X.X.X.XX...', 'X..XX.X.X..', 'X..XX.X..X.', 'X...X.X...X',
      '...........', '...........'
    ],
    live: [
      '...........', '.X.......X.', 'X..X...X..X', 'X.X.....X.X', 'X.X.XXX.X.X', 'X.X.XXX.X.X',
      'X..X.X.X..X', '.X...X...X.', '.....X.....', '....XXX....', '...........'
    ],
    experience: [
      '...........', '....XXX....', '...X...X...', '.XXXXXXXXX.', '.X.......X.', '.X.......X.',
      '.XXXX.XXXX.', '.X...X...X.', '.X.......X.', '.XXXXXXXXX.', '...........'
    ],
    projects: [
      '...........', '......X....', '...X..XX...', '..X...X.X..', '.X...X...X.', 'X....X....X',
      '.X...X...X.', '..X.X...X..', '...XX..X...', '....X......', '...........'
    ],
    contributions: [
      '...........', '..XX.......', '..XX....XX.', '..X.....XX.', '..X.....X..', '..X....X...',
      '..X..XX....', '..XXX......', '..X........', '..XX.......', '..XX.......'
    ],
    writing: [
      '...........', '.XXXXXXXXX.', '...........', '.XXXXXXX...', '...........', '.XXXXXXXXX.',
      '...........', '.XXXXX.....', '...........', '.XXXXXXXX..', '...........'
    ],
    activity: [
      '...........', '........XX.', '........XX.', '.....XX.XX.', '.....XX.XX.', '.....XX.XX.',
      '..XX.XX.XX.', '..XX.XX.XX.', '..XX.XX.XX.', '.XXXXXXXXX.', '...........'
    ],
    contact: [
      '...........', '...........', 'XXXXXXXXXXX', 'XX.......XX', 'X.X.....X.X', 'X..X...X..X',
      'X...X.X...X', 'X....X....X', 'X.........X', 'XXXXXXXXXXX', '...........'
    ]
  };

  var A = window.anime;
  var moving = A && document.documentElement.classList.contains('m-js');
  var OFF = 0.42;

  function board(cls) {
    var el = document.createElement('div');
    el.className = 'sg ' + cls;
    el.setAttribute('aria-hidden', 'true');
    var dots = [];
    for (var i = 0; i < N * N; i++) {
      var d = document.createElement('i');
      var r = Math.floor(i / N) - 5, c = (i % N) - 5;
      d.style.setProperty('--d', Math.round(Math.hypot(r, c) * 22) + 'ms');
      el.appendChild(d);
      dots.push(d);
    }
    return { el: el, dots: dots, on: [], art: null };
  }

  function show(b, art) {
    if (b.art === art) return;
    b.art = art;
    var rows = ART[art] || ART.intro;
    b.dots.forEach(function (d, i) {
      var on = rows[Math.floor(i / N)].charAt(i % N) === 'X';
      b.on[i] = on;
      d.classList.toggle('on', on);
    });
    if (moving) A.animate(b.dots, {
      scale: [{ to: function (_, i) { return b.on[i] ? 1.35 : OFF * 0.6; }, duration: 260, ease: 'outQuad' },
              { to: function (_, i) { return b.on[i] ? 1 : OFF; }, duration: 520, ease: 'outBack' }],
      delay: A.stagger(22, { grid: [N, N], from: 'center' })
    });
  }

  function ripple(b, from) {
    if (!moving) return;
    A.animate(b.dots, {
      scale: [{ to: function (_, i) { return (b.on[i] ? 1 : OFF) * 1.7; }, duration: 170, ease: 'outQuad' },
              { to: function (_, i) { return b.on[i] ? 1 : OFF; }, duration: 600, ease: 'outExpo' }],
      delay: A.stagger(34, { grid: [N, N], from: from })
    });
  }

  /* what is on screen right now */
  var home = document.body.classList.contains('home');
  var secs = [];
  if (home) {
    document.querySelectorAll('.h-index a').forEach(function (a) {
      var el = document.getElementById(a.getAttribute('href').slice(1));
      if (el) secs.push({ el: el, art: el.id, label: a.textContent });
    });
  } else {
    secs.push({ el: document.body, art: 'projects', label: document.title.split(' - ')[0], top: true });
    document.querySelectorAll('.dsec > h2, .h-sec > h2').forEach(function (h) {
      /* motion.js may have split the heading; its screen-reader copy holds the clean text */
      var sr = h.querySelector('.m-sr');
      secs.push({ el: h.parentNode, art: 'projects', label: (sr || h).textContent.trim() });
    });
  }
  function current() {
    var line = innerHeight * 0.4, cur = null;
    secs.forEach(function (s) {
      if (s.top || s.el.hidden) return;
      if (s.el.getBoundingClientRect().top < line) cur = s;
    });
    if (cur) return cur;
    return home ? { art: 'intro', label: 'Hello' } : secs[0];
  }

  /* desktop margin sign */
  var big = board('sg-big');
  var wrap = document.createElement('div');
  wrap.className = 'sg-side';
  var cap = document.createElement('p');
  cap.className = 'sg-cap';
  wrap.appendChild(big.el);
  wrap.appendChild(cap);
  document.body.appendChild(wrap);
  var lastRipple = 0;
  big.el.addEventListener('pointermove', function (e) {
    var now = Date.now();
    if (now - lastRipple < 700) return;
    var idx = big.dots.indexOf(e.target);
    if (idx < 0) return;
    lastRipple = now;
    ripple(big, idx);
  });

  /* phone bar: mini sign + where you are + opens the command palette */
  var k = document.getElementById('kOpen');
  var mini = board('sg-mini');
  var bar = null, barLabel = null;
  if (k) {
    bar = document.createElement('button');
    bar.type = 'button';
    bar.className = 'sg-bar';
    bar.setAttribute('aria-label', 'Open menu');
    barLabel = document.createElement('span');
    barLabel.className = 'sg-label';
    var menu = document.createElement('span');
    menu.className = 'sg-menu';
    menu.textContent = 'Menu';
    bar.appendChild(mini.el);
    bar.appendChild(barLabel);
    bar.appendChild(menu);
    bar.addEventListener('click', function () { k.click(); });
    document.body.appendChild(bar);
  }

  var ticking = false;
  function update() {
    ticking = false;
    var s = current();
    show(big, s.art);
    show(mini, s.art);
    if (cap.textContent !== s.label) cap.textContent = s.label;
    if (bar) {
      if (barLabel.textContent !== s.label) barLabel.textContent = s.label;
      bar.classList.toggle('up', scrollY > 240);
    }
  }
  addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  addEventListener('resize', update);
  update();

  /* now and then a soft wave crosses the sign, so it reads as alive */
  if (moving) setInterval(function () {
    if (document.hidden || !wrap.getClientRects().length) return;
    ripple(big, [0, N - 1, N * N - N, N * N - 1][Math.floor(Math.random() * 4)]);
  }, 7000);
})();
