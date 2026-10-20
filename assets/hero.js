/* Noida skyline: pixel art that follows the real time of day in IST */
(function () {
  var cv = document.getElementById('sky');
  if (!cv || !cv.getContext) return;
  var W = 240, H = 96, GROUND = H - 9, TRACK = H - 13;
  cv.width = W; cv.height = H;
  var ctx = cv.getContext('2d');
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var clockEl = document.getElementById('skyClock');
  var moodEl = document.getElementById('skyMood');

  var seed = 20260;
  function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
  function ri(a, b) { return a + Math.floor(rnd() * (b - a + 1)); }

  var MODES = {
    night: { sky: ['#070b1f', '#141b45', '#2c2a5a'], far: '#1a1d3a', near: '#06070e', lit: '#f6c96b', litP: 0.32, stars: 1, label: 'after hours' },
    dawn:  { sky: ['#1c2756', '#7b5f92', '#f0a77c'], far: '#4a4468', near: '#15142a', lit: '#f6c96b', litP: 0.18, stars: 0.35, label: 'sunrise' },
    day:   { sky: ['#5f9fd8', '#9cc8ec', '#e6f0f6'], far: '#9fb2c6', near: '#435066', lit: '#c9d8e6', litP: 0.08, stars: 0, label: 'daylight' },
    dusk:  { sky: ['#1d2654', '#a65a7c', '#f5a25c'], far: '#5b3f63', near: '#1a1020', lit: '#f6c96b', litP: 0.24, stars: 0.4, label: 'golden hour' }
  };

  function ist() {
    var o = {};
    new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
      .formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; });
    return o;
  }
  function modeFor(h) {
    if (h >= 19 || h < 5) return 'night';
    if (h < 7) return 'dawn';
    if (h < 17) return 'day';
    return 'dusk';
  }

  /* world, generated once so the skyline never jumps */
  var far = [], near = [], stars = [], clouds = [];
  for (var x = -4; x < W; ) {
    var w = ri(10, 20);
    far.push({ x: x, w: w, h: ri(22, 44) });
    x += w - ri(0, 3);
  }
  for (x = -2; x < W; ) {
    w = ri(9, 22);
    var b = { x: x, w: w, h: ri(14, 50), win: [] };
    for (var wy = GROUND - b.h + 4; wy < GROUND - 3; wy += 4)
      for (var wx = b.x + 2; wx < b.x + b.w - 2; wx += 3)
        b.win.push({ x: wx, y: wy, on: false });
    near.push(b);
    x += w + ri(0, 3);
  }
  var tallest = near.reduce(function (a, c) { return c.h > a.h ? c : a; });
  tallest.h += 8;
  for (var i = 0; i < 70; i++) stars.push({ x: ri(0, W), y: ri(0, 58), a: 0.35 + rnd() * 0.65, s: 0.6 + rnd() * 2.2, p: rnd() * 6.28 });
  for (i = 0; i < 4; i++) clouds.push({ x: ri(0, W), y: ri(6, 30), w: ri(14, 26), v: 0.6 + rnd() * 0.9 });

  var mode, M, bg = document.createElement('canvas');
  bg.width = W; bg.height = H;

  function mix(a, b, t) {
    var pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
    var r = (pa >> 16) + (((pb >> 16) - (pa >> 16)) * t);
    var g = ((pa >> 8) & 255) + ((((pb >> 8) & 255) - ((pa >> 8) & 255)) * t);
    var bl = (pa & 255) + (((pb & 255) - (pa & 255)) * t);
    return 'rgb(' + (r | 0) + ',' + (g | 0) + ',' + (bl | 0) + ')';
  }
  function disc(c, cx, cy, r, col) {
    c.fillStyle = col;
    for (var y = -r; y <= r; y++) {
      var half = Math.floor(Math.sqrt(r * r - y * y));
      c.fillRect(cx - half, cy + y, half * 2 + 1, 1);
    }
  }

  function paintBackground() {
    var c = bg.getContext('2d');
    /* banded sky: 14 steps reads as pixel art, not a smooth gradient */
    var bands = 14, top = M.sky[0], mid = M.sky[1], low = M.sky[2];
    for (var k = 0; k < bands; k++) {
      var t = k / (bands - 1);
      c.fillStyle = t < 0.55 ? mix(top, mid, t / 0.55) : mix(mid, low, (t - 0.55) / 0.45);
      c.fillRect(0, Math.floor(k * GROUND / bands), W, Math.ceil(GROUND / bands) + 1);
    }
    if (mode === 'night') {
      var mx = tallest.x > W / 2 ? 46 : 196;
      disc(c, mx, 20, 7, '#efe7cf');
      c.fillStyle = '#d8cfb4';
      c.fillRect(mx - 3, 17, 2, 2); c.fillRect(mx + 2, 22, 2, 1); c.fillRect(mx - 1, 24, 1, 1);
    } else if (mode === 'day') {
      disc(c, tallest.x > W / 2 ? 42 : 196, 20, 7, '#fff1b8');
    } else {
      disc(c, mode === 'dawn' ? 58 : 182, GROUND - 46, 10, mode === 'dawn' ? '#ffd28a' : '#ffb766');
    }
    c.fillStyle = M.far;
    far.forEach(function (f) { c.fillRect(f.x, GROUND - f.h, f.w, f.h); });
    c.fillStyle = M.near;
    near.forEach(function (n) { c.fillRect(n.x, GROUND - n.h, n.w, n.h); });
    c.fillRect(tallest.x + (tallest.w >> 1), GROUND - tallest.h - 6, 1, 6);
    c.fillRect(0, GROUND, W, H - GROUND);
    /* elevated metro line */
    c.fillStyle = mode === 'day' ? '#6b7486' : '#2a2c3d';
    c.fillRect(0, TRACK, W, 2);
    for (var px = 6; px < W; px += 18) c.fillRect(px, TRACK + 2, 2, GROUND - TRACK - 2);
  }

  function setMode(m) {
    mode = m; M = MODES[m];
    near.forEach(function (n) { n.win.forEach(function (w) { w.on = rnd() < M.litP; }); });
    paintBackground();
    if (moodEl) moodEl.textContent = 'Noida · ' + M.label;
  }

  var train = { x: -60, next: 2 };
  var shoot = null, nextShoot = 3;
  var last = 0, clockTick = 0;

  function frame(now) {
    var t = now / 1000, dt = Math.min(0.1, t - last || 0);
    last = t;
    ctx.drawImage(bg, 0, 0);

    if (M.stars) {
      stars.forEach(function (s) {
        var a = s.a * M.stars * (0.55 + 0.45 * Math.sin(t * s.s + s.p));
        ctx.fillStyle = 'rgba(255,248,225,' + a.toFixed(2) + ')';
        ctx.fillRect(s.x, s.y, 1, 1);
      });
    }
    if (mode === 'day' || mode === 'dawn') {
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      clouds.forEach(function (cl) {
        cl.x += cl.v * dt;
        if (cl.x > W + 10) cl.x = -cl.w - 10;
        ctx.fillRect(cl.x | 0, cl.y, cl.w, 2);
        ctx.fillRect((cl.x | 0) + 3, cl.y - 2, cl.w - 8, 2);
      });
    }

    /* windows flicker as people come and go */
    ctx.fillStyle = M.lit;
    near.forEach(function (n) {
      n.win.forEach(function (w) {
        if (!reduce && rnd() < 0.0006) w.on = !w.on;
        if (w.on) ctx.fillRect(w.x, w.y, 2, 2);
      });
    });

    /* aircraft warning light on the tallest tower */
    if (Math.floor(t * 1.2) % 2 === 0) {
      ctx.fillStyle = '#ff4d4d';
      ctx.fillRect(tallest.x + (tallest.w >> 1), GROUND - tallest.h - 7, 1, 1);
    }

    /* a shooting star after dark, a packet in flight */
    if (M.stars >= 0.4 && !reduce) {
      if (!shoot && t > nextShoot) shoot = { x: ri(40, W), y: ri(2, 20), life: 0 };
      if (shoot) {
        shoot.life += dt;
        var sx = shoot.x - shoot.life * 90, sy = shoot.y + shoot.life * 38;
        for (var k = 0; k < 8; k++) {
          ctx.fillStyle = 'rgba(255,250,230,' + (0.9 - k * 0.11).toFixed(2) + ')';
          ctx.fillRect((sx + k * 2.3) | 0, (sy - k) | 0, 1, 1);
        }
        if (shoot.life > 0.9) { shoot = null; nextShoot = t + 4 + rnd() * 6; }
      }
    }

    /* the metro */
    if (!reduce) {
      if (train.x < -60 && t > train.next) train.x = -58;
      if (train.x >= -58) {
        train.x += 34 * dt;
        var tx = train.x | 0, body = mode === 'day' ? '#d9dee6' : '#9aa3b5';
        for (var car = 0; car < 3; car++) {
          var cx = tx + car * 17;
          ctx.fillStyle = body;
          ctx.fillRect(cx, TRACK - 5, 15, 5);
          ctx.fillStyle = mode === 'day' ? '#5c7ea8' : '#ffd77a';
          for (var wx2 = 2; wx2 < 14; wx2 += 3) ctx.fillRect(cx + wx2, TRACK - 4, 2, 2);
          ctx.fillStyle = '#22b8b0'; /* Aqua Line */
          ctx.fillRect(cx, TRACK - 1, 15, 1);
        }
        if (train.x > W + 4) { train.x = -61; train.next = t + 9 + rnd() * 8; }
      }
    }

    if (t - clockTick >= 1) {
      clockTick = t;
      var o = ist();
      if (clockEl) clockEl.textContent = o.hour + ':' + o.minute + ':' + o.second + ' IST';
      var m = modeFor(+o.hour);
      if (m !== mode) setMode(m);
    }
    if (!reduce) requestAnimationFrame(frame);
  }

  var first = ist();
  if (clockEl) clockEl.textContent = first.hour + ':' + first.minute + ':' + first.second + ' IST';
  setMode(modeFor(+first.hour));
  if (reduce) {
    frame(performance.now());
    setInterval(function () { frame(performance.now() + 1000); }, 1000);
  } else {
    requestAnimationFrame(frame);
  }
})();
