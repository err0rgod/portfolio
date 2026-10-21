/* Byte, a pixel cat who lives along the bottom of the page.
   Wanders, sits, naps when you go quiet, chases the cursor near the floor, and likes being clicked. */
(function () {
  var A = window.anime;
  var root = document.documentElement;
  var moving = !!A && root.classList.contains('m-js');
  var PX = 3, W = 16, H = 12;

  var FRAMES = {
    walkA: [
      '................', '............X.X.', '............XXX.', 'X..........XXeXX', 'X..........XXXXX', '.X.XXXXXXXXXXXX.',
      '..XXXXXXXXXXXXX.', '...XXXXXXXXXXX..', '...XXXXXXXXXXX..', '...X.X.....X.X..', '...X.X.....X.X..', '................'
    ],
    walkB: [
      '................', '............X.X.', '............XXX.', '.X.........XXeXX', 'X..........XXXXX', 'X..XXXXXXXXXXXX.',
      '.XXXXXXXXXXXXXX.', '...XXXXXXXXXXX..', '...XXXXXXXXXXX..', '....XX.....XX...', '....XX.....XX...', '................'
    ],
    sit: [
      '................', '..........X.X...', '..........XXX...', '.........XXeXX..', '.........XXXXX..', '........XXXXX...',
      '.......XXXXXX...', '......XXXXXXX...', 'XX....XXXXXXX...', '.XX..XXXXXXXX...', '..XXXXXXXXXXX...', '................'
    ],
    sleep: [
      '................', '................', '................', '................', '................', '................',
      '....XXXXXXX.X.X.', '...XXXXXXXXXXXX.', '..XXXXXXXXXXXXX.', '.XXXXXXXXXXXXXX.', 'XXXXXXXXXXXXXXX.', '................'
    ]
  };

  var el = document.createElement('button');
  el.type = 'button';
  el.className = 'pet';
  el.setAttribute('aria-label', 'Byte the cat. Click to pet.');
  el.title = 'Byte';
  var cv = document.createElement('canvas');
  cv.width = W * PX; cv.height = H * PX;
  el.appendChild(cv);
  document.body.appendChild(el);
  var ctx = cv.getContext('2d');

  var frame = 'sit';
  function draw(name) {
    frame = name;
    var ink = getComputedStyle(root).getPropertyValue('--ink').trim() || '#1c1a16';
    var rows = FRAMES[name];
    ctx.clearRect(0, 0, cv.width, cv.height);
    for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) {
      var c = rows[y].charAt(x);
      if (c === '.') continue;
      ctx.fillStyle = c === 'e' ? '#f6c96b' : ink;
      ctx.fillRect(x * PX, y * PX, PX, PX);
    }
  }
  new MutationObserver(function () { draw(frame); }).observe(root, { attributes: true, attributeFilter: ['class'] });

  /* position, remembered across pages in this tab */
  var pos = { x: 24, y: 0 };
  try { var saved = +sessionStorage.getItem('nk-pet-x'); if (saved) pos.x = saved; } catch (e) {}
  var facing = 1;
  function maxX() { return Math.max(0, innerWidth - cv.width - 8); }
  function place() {
    pos.x = Math.min(Math.max(0, pos.x), maxX());
    el.style.transform = 'translate(' + pos.x.toFixed(1) + 'px,' + pos.y.toFixed(1) + 'px)';
    cv.style.transform = facing < 0 ? 'scaleX(-1)' : '';
  }
  addEventListener('beforeunload', function () { try { sessionStorage.setItem('nk-pet-x', Math.round(pos.x)); } catch (e) {} });
  addEventListener('resize', place);
  draw('sit');
  place();

  function puff(text, cls) {
    var p = document.createElement('span');
    p.className = 'pet-puff ' + (cls || '');
    p.textContent = text;
    p.setAttribute('aria-hidden', 'true');
    p.style.left = (pos.x + cv.width * (facing > 0 ? 0.75 : 0.25)) + 'px';
    document.body.appendChild(p);
    if (!moving) { p.style.opacity = 1; setTimeout(function () { p.remove(); }, 900); return; }
    A.animate(p, {
      y: [0, -46], x: [0, (Math.random() - 0.5) * 24], opacity: [{ to: 1, duration: 150 }, { to: 0, duration: 650, delay: 300 }],
      scale: [0.6, 1.1], duration: 1100, ease: 'outQuad', onComplete: function () { p.remove(); }
    });
  }

  /* reduced motion: Byte just sits there and still enjoys a pet */
  if (!moving) {
    el.addEventListener('click', function () { puff('♥', 'heart'); });
    return;
  }

  var state = 'sit', walk = null, legs = 0, lastStir = Date.now(), zTimer = 0;
  setInterval(function () {
    if (state === 'walk' || state === 'chase') { legs = 1 - legs; draw(legs ? 'walkA' : 'walkB'); }
  }, 130);

  function stop() { if (walk) { walk.pause(); walk = null; } }
  function sit() { stop(); state = 'sit'; draw('sit'); }
  function go(x, speed, then) {
    stop();
    x = Math.min(Math.max(0, x), maxX());
    var dist = Math.abs(x - pos.x);
    if (dist < 4) { if (then) then(); return; }
    facing = x > pos.x ? 1 : -1;
    place();
    walk = A.animate(pos, {
      x: x, duration: dist / speed * 1000, ease: speed > 100 ? 'outQuad' : 'linear',
      onUpdate: place, onComplete: function () { walk = null; if (then) then(); }
    });
  }

  function wander() {
    if (state === 'sleep' || state === 'chase' || document.hidden) return;
    if (Date.now() - lastStir > 25000) { nap(); return; }
    if (Math.random() < 0.35) { sit(); return; }
    state = 'walk';
    var span = Math.min(innerWidth * 0.6, 520);
    go(pos.x + (Math.random() - 0.5) * span * 2, 55, sit);
  }
  setInterval(wander, 4200);

  function nap() {
    stop(); state = 'sleep'; draw('sleep');
    clearInterval(zTimer);
    zTimer = setInterval(function () { if (state === 'sleep') puff('z', 'zz'); }, 1500);
  }
  function wake() {
    clearInterval(zTimer);
    lastStir = Date.now();
    if (state === 'sleep') {
      sit();
      A.animate(pos, { y: [{ to: -10, duration: 160, ease: 'outQuad' }, { to: 0, duration: 260, ease: 'inQuad' }], onUpdate: place });
    }
  }

  /* chase the cursor when it comes down near the floor */
  var lastChase = 0;
  addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse') return;
    var near = e.clientY > innerHeight - 160;
    if (!near) { if (state === 'chase') { state = 'walk'; sit(); } return; }
    if (state === 'sleep') { wake(); return; }
    lastStir = Date.now();
    var now = Date.now();
    if (now - lastChase < 250) return;
    lastChase = now;
    var target = e.clientX - cv.width / 2;
    if (Math.abs(target - pos.x) < 30) { if (state === 'chase') sit(); return; }
    state = 'chase';
    go(target, 240, sit);
  }, { passive: true });
  addEventListener('scroll', function () { lastStir = Date.now(); }, { passive: true });
  addEventListener('keydown', function () { lastStir = Date.now(); });

  /* a click is a pet: hop, purr, hearts */
  var pets = 0;
  el.addEventListener('click', function () {
    if (state === 'sleep') { wake(); puff('!', 'zz'); return; }
    lastStir = Date.now();
    sit();
    pets++;
    A.animate(pos, { y: [{ to: -16, duration: 180, ease: 'outQuad' }, { to: 0, duration: 320, ease: 'outBounce' }], onUpdate: place });
    puff('♥', 'heart');
    if (pets % 5 === 0) setTimeout(function () { puff('purr', 'zz'); }, 250);
  });
})();
