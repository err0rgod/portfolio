/* Motion layer, built on anime.js. Everything here is decoration: without it the page is complete. */
(function () {
  var root = document.documentElement;
  var A = window.anime;
  if (!A || !root.classList.contains('m-js')) { root.classList.remove('m-js'); return; }
  window.__mOk = true;

  var animate = A.animate, stagger = A.stagger, set = A.utils.set;
  var fine = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;
  var spring = A.createSpring({ stiffness: 150, damping: 12 });
  var $ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  function mk(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  /* Split the direct text of el into masked words of chars (or whole words). Child elements stay as they are. */
  function split(el, mode) {
    var out = [];
    var sr = mk('span', 'm-sr', el.textContent.replace(/\s+/g, ' ').trim());
    $(':scope > *', el).forEach(function (c) { c.setAttribute('aria-hidden', 'true'); });
    Array.prototype.slice.call(el.childNodes).forEach(function (node) {
      if (node.nodeType !== 3 || !node.nodeValue.trim()) return;
      var frag = document.createDocumentFragment();
      node.nodeValue.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
        var w = mk('span', mode === 'blur' ? 'm-b' : 'm-w');
        w.setAttribute('aria-hidden', 'true');
        if (mode === 'chars') {
          part.split('').forEach(function (ch) { var c = mk('span', 'm-c', ch); w.appendChild(c); out.push(c); });
        } else if (mode === 'blur') {
          w.textContent = part; out.push(w);
        } else {
          var c = mk('span', 'm-c', part); w.appendChild(c); out.push(c);
        }
        frag.appendChild(w);
      });
      el.replaceChild(frag, node);
    });
    el.appendChild(sr);
    return out;
  }

  /* Numbers count up from zero. Returns a starter, or null when the text isn't a plain number. */
  function counter(el, dur) {
    var tn = null;
    if (!el) return null;
    for (var n = el.firstChild; n; n = n.nextSibling) if (n.nodeType === 3 && n.nodeValue.trim()) { tn = n; break; }
    if (!tn) return null;
    var m = tn.nodeValue.match(/^(\s*)(\d{1,3}(?:,\d{3})+|\d+)([\s\S]*)$/);
    if (!m || /^[–-]\d/.test(m[3])) return null;
    var goal = +m[2].replace(/,/g, '');
    if (goal < 2) return null;
    var comma = m[2].indexOf(',') > -1;
    function show(v) { tn.nodeValue = m[1] + (comma ? v.toLocaleString('en-US') : v) + m[3]; }
    show(0);
    return function () {
      var o = { v: 0 };
      animate(o, { v: goal, duration: dur || 1800, ease: 'outExpo', onUpdate: function () { show(Math.round(o.v)); }, onComplete: function () { show(goal); } });
    };
  }

  function scramble(el, dur) {
    var final = el.textContent, pool = '!<>-_/[]{}=+*^?#01ABCDEFXZ';
    var o = { p: 0 };
    animate(o, {
      p: 1, duration: dur || 900, ease: 'linear',
      onUpdate: function () {
        var k = Math.floor(o.p * final.length), s = final.slice(0, k);
        for (var i = k; i < final.length; i++) s += final[i] === ' ' ? ' ' : pool[Math.random() * pool.length | 0];
        el.textContent = s;
      },
      onComplete: function () { el.textContent = final; }
    });
  }

  /* ---------- intro ---------- */
  var tl = A.createTimeline({ defaults: { ease: 'outExpo', duration: 1000 } });
  var later = [];

  if (document.body.classList.contains('home')) {
    var hero = document.querySelector('.h-hero');
    var name = split(document.querySelector('.h-who h1'), 'chars');
    var place = document.querySelector('.h-who p');
    var lede = split(document.querySelector('.h-lede'), 'blur');
    var bullets = $('.h-intro li');
    var marks = [], counts = [];
    $('.h-intro li b').forEach(function (b) {
      var go = counter(b, 2200);
      if (go) { counts.push(go); marks.push(b); b.classList.add('m-hl'); }
    });
    var tail = $('.h-cta > *, .h-label, .h-socials > *');

    set(hero, { clipPath: 'inset(48% 0% 48% 0% round 14px)' });
    set('.h-avatar', { opacity: 0, scale: 0.4, rotate: -14 });
    set(name, { y: '110%' });
    set(place, { opacity: 0 });
    set('.h-tools > *', { opacity: 0, y: -10 });
    set(lede, { opacity: 0, y: 14, filter: 'blur(8px)' });
    set(bullets, { opacity: 0, x: -18 });
    set(marks, { '--hlw': '0%' });
    set(tail, { opacity: 0, y: 14 });

    tl.add(hero, { clipPath: 'inset(0% 0% 0% 0% round 14px)', duration: 1300, ease: 'inOutQuart' })
      .add('.h-avatar', { opacity: 1, scale: 1, rotate: 0, ease: spring }, '-=450')
      .add(name, { y: '0%', delay: stagger(32), duration: 1100 }, '<<+=80')
      .call(function () { place.style.opacity = 1; scramble(place, 800); }, '<<+=250')
      .add('.h-tools > *', { opacity: 1, y: 0, delay: stagger(90) }, '<<')
      .add(lede, { opacity: 1, y: 0, filter: 'blur(0px)', delay: stagger(26), duration: 1100 }, '<<+=300')
      .add(bullets, { opacity: 1, x: 0, delay: stagger(110) }, '<<+=350')
      .call(function () { counts.forEach(function (go) { go(); }); }, '<<')
      .add(marks, { '--hlw': '100%', delay: stagger(140), duration: 900, ease: 'inOutCubic' }, '<<+=300')
      .add(tail, { opacity: 1, y: 0, delay: stagger(45), duration: 900 }, '<<+=100');
  } else {
    var bar = document.querySelector('.p-bar');
    var head = document.querySelector('.dhead');
    if (head) {
      var box = head.querySelector('.wrap') || head;
      var h1 = box.querySelector('h1');
      var chars = h1 ? split(h1, 'chars') : [];
      var sub = h1 ? $('.g', h1) : [];
      var rest = $(':scope > :not(h1)', box);
      var tag = box.querySelector('.tagline');
      var words = tag ? split(tag, 'blur') : [];

      if (bar) set(bar, { opacity: 0, y: -12 });
      set(chars, { y: '110%' });
      set(sub, { opacity: 0, y: 12 });
      set(rest.filter(function (e) { return e !== tag; }), { opacity: 0, y: 14 });
      set(words, { opacity: 0, y: 10, filter: 'blur(6px)' });

      var back = rest.filter(function (e) { return e.classList.contains('back'); });
      var links = rest.filter(function (e) { return e !== tag && back.indexOf(e) < 0; });
      [
        [[bar], { opacity: 1, y: 0, duration: 800 }],
        [back, { opacity: 1, y: 0 }, '<<+=100'],
        [chars, { y: '0%', delay: stagger(26), duration: 1100 }, '<<+=100'],
        [sub, { opacity: 1, y: 0 }, '<<+=350'],
        [words, { opacity: 1, y: 0, filter: 'blur(0px)', delay: stagger(10), duration: 900 }, '<<+=150'],
        [links, { opacity: 1, y: 0, delay: stagger(80) }, '<<+=300']
      ].forEach(function (s) {
        var t = s[0].filter(Boolean);
        if (t.length) tl.add(t, s[1], s[2]);
      });
    }
  }
  root.classList.add('m-ready');

  /* ---------- scroll reveals ---------- */
  var handlers = new Map();
  var queue = new Map();
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      var h = handlers.get(e.target);
      if (!queue.has(h)) queue.set(h, []);
      queue.get(h).push(e.target);
    });
    queue.forEach(function (els, h) { h(els); });
    queue.clear();
  }, { rootMargin: '0px 0px -10% 0px' });

  function watch(els, prep, play) {
    els.forEach(function (el) {
      if (handlers.has(el) || el.closest('.dhead')) return;
      prep(el);
      handlers.set(el, play);
      io.observe(el);
    });
  }

  var rise = function (els) { animate(els, { opacity: 1, y: 0, duration: 1000, delay: stagger(80), ease: 'outExpo' }); };
  var hide = function (el) { set(el, { opacity: 0, y: 26 }); };

  watch($('.h-sec > h2, .dsec > h2'), function (el) {
    el._w = el.children.length ? [el] : split(el, 'words');
    set(el._w, { y: '105%' });
    if (el._w[0] === el) set(el, { opacity: 0, y: 20 });
  }, function (els) {
    els.forEach(function (el, i) {
      animate(el._w, { opacity: 1, y: el._w[0] === el ? 0 : '0%', duration: 1100, delay: stagger(60, { start: i * 80 }), ease: 'outExpo' });
    });
  });

  watch($('.dsec > .dsub, .dsec > p, .dsec .dlinks > *, .arch, pre.code, .warnbox, .repo, ul.feat li, .h-row, .cal-total, .h-contact, .h-all, .h-live-more, .h-foot, .p-next'), hide, rise);

  watch($('.sbox'), function (el) {
    hide(el);
    el._go = counter(el.querySelector('.n'), 1700);
  }, function (els) {
    rise(els);
    els.forEach(function (el, i) { if (el._go) setTimeout(el._go, i * 80); });
  });

  watch($('.h-card'), function (el) {
    set(el, { opacity: 0, y: 46 });
    set(el.querySelector('img'), { scale: 1.18 });
    set($('.h-stack span', el), { opacity: 0, scale: 0.6 });
  }, function (els) {
    els.forEach(function (el, i) {
      var d = i * 120;
      animate(el, { opacity: 1, y: 0, duration: 1200, delay: d, ease: 'outExpo' });
      animate(el.querySelector('img'), { scale: 1, duration: 1600, delay: d, ease: 'outExpo' });
      animate($('.h-stack span', el), { opacity: 1, scale: 1, delay: stagger(40, { start: d + 450 }), ease: spring });
    });
  });

  /* experience: the timeline rail draws itself, logos pop on, roles slide in */
  var exp = document.querySelector('.h-exp');
  if (exp) {
    watch([exp], function (el) {
      set(el, { '--draw': 0 });
      set($('.h-logo', el), { opacity: 0, scale: 0.3 });
      set($('.h-jobtext', el), { opacity: 0, x: 24 });
      set($('.h-job[open] li', el), { opacity: 0, x: -10 });
    }, function (els) {
      var el = els[0];
      animate(el, { '--draw': 1, duration: 1600, ease: 'inOutQuart' });
      animate($('.h-logo', el), { opacity: 1, scale: 1, delay: stagger(220), ease: spring });
      animate($('.h-jobtext', el), { opacity: 1, x: 0, duration: 1000, delay: stagger(220, { start: 80 }), ease: 'outExpo' });
      animate($('.h-job[open] li', el), { opacity: 1, x: 0, duration: 800, delay: stagger(70, { start: 500 }), ease: 'outExpo' });
    });
    /* details[open] fires a toggle on load; only animate the ones people click */
    var armed = false;
    setTimeout(function () { armed = true; }, 800);
    $('.h-job', exp).forEach(function (job) {
      job.addEventListener('toggle', function () {
        if (!job.open || !armed) return;
        animate($('li', job), { opacity: [0, 1], x: [-10, 0], duration: 700, delay: stagger(60), ease: 'outExpo' });
      });
    });
  }

  /* contact: the address rises letter by letter, then ripples on hover */
  var email = document.querySelector('.h-sec .email');
  if (email) {
    var letters = split(email, 'chars');
    watch([email], function () { set(letters, { y: '110%' }); }, function () {
      animate(letters, { y: '0%', duration: 900, delay: stagger(18), ease: 'outExpo' });
    });
    email.addEventListener('pointerenter', function () {
      animate(letters, { y: [{ to: '-22%', duration: 180, ease: 'outQuad' }, { to: '0%', duration: 500, ease: spring }], delay: stagger(14) });
    });
  }

  /* GitHub calendar: cells ripple in from today once the data lands */
  var grid = document.querySelector('.cal-grid');
  if (grid) {
    var go = function () {
      var cells = $('i', grid);
      if (!cells.length) return;
      var last = Math.floor((cells.length - 1) / 7);
      set(cells, { opacity: 0, scale: 0 });
      watch([grid], function () {}, function () {
        animate(cells, {
          opacity: 1, scale: [{ to: 1.5, duration: 260, ease: 'outQuad' }, { to: 1, duration: 420, ease: 'outBack' }],
          delay: function (el, i) {
            var col = Math.floor(i / 7), row = i % 7;
            return Math.hypot(last - col, (row - 3) * 1.2) * 16;
          }
        });
      });
    };
    if (grid.children.length) go();
    else new MutationObserver(function (_, mo) { mo.disconnect(); go(); }).observe(grid, { childList: true });
  }

  /* live wire: stories slide in when the feed arrives */
  var live = document.getElementById('live');
  if (live) {
    new MutationObserver(function (_, mo) {
      if (live.hidden) return;
      mo.disconnect();
      watch([live], function (el) {
        set(el, { opacity: 0, y: 26 });
        set($('.h-wire li', el), { opacity: 0, x: -30 });
      }, function (els) {
        animate(els[0], { opacity: 1, y: 0, duration: 900, ease: 'outExpo' });
        animate($('.h-wire li', els[0]), { opacity: 1, x: 0, duration: 1000, delay: stagger(90, { start: 250 }), ease: 'outExpo' });
      });
    }).observe(live, { attributes: true, attributeFilter: ['hidden'] });
  }

  /* ---------- reading progress ---------- */
  var prog = mk('div', 'm-progress');
  prog.setAttribute('aria-hidden', 'true');
  document.body.appendChild(prog);
  var progA = A.createAnimatable(prog, { scaleX: 400, ease: 'out(3)' });
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var max = document.documentElement.scrollHeight - innerHeight;
      progA.scaleX(max > 0 ? Math.min(1, scrollY / max) : 0);
    });
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- theme switch: ink floods out from the toggle ---------- */
  var sw = document.getElementById('themeSw');
  var passing = false;
  if (sw) document.addEventListener('click', function (e) {
    if (passing || !e.target.closest || e.target.closest('#themeSw') !== sw) return;
    e.stopPropagation();
    var r = sw.getBoundingClientRect();
    var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    var R = Math.hypot(Math.max(cx, innerWidth - cx), Math.max(cy, innerHeight - cy));
    var at = 'px at ' + cx + 'px ' + cy + 'px)';
    var ov = mk('div', 'm-wipe');
    ov.style.background = root.classList.contains('dark') ? '#f4f1ea' : '#121110';
    ov.style.clipPath = 'circle(0' + at;
    document.body.appendChild(ov);
    animate(ov, { clipPath: 'circle(' + R + at, duration: 620, ease: 'inOutQuart' }).then(function () {
      passing = true; sw.click(); passing = false;
      animate(ov, { opacity: 0, duration: 420, ease: 'outQuad' }).then(function () { ov.remove(); });
    });
  }, true);

  /* ---------- command palette ---------- */
  new MutationObserver(function () {
    var wrap = document.querySelector('.k-wrap');
    if (!wrap || wrap._m) return;
    wrap._m = true;
    new MutationObserver(function () {
      if (wrap.hidden) return;
      animate(wrap, { opacity: [0, 1], duration: 220, ease: 'outQuad' });
      animate(wrap.querySelector('.k-box'), { opacity: [0, 1], scale: [0.94, 1], y: [-14, 0], duration: 500, ease: spring });
      animate($('.k-list > *', wrap).slice(0, 10), { opacity: [0, 1], x: [-8, 0], duration: 500, delay: stagger(22, { start: 60 }), ease: 'outExpo' });
    }).observe(wrap, { attributes: true, attributeFilter: ['hidden'] });
  }).observe(document.body, { childList: true });

  /* ---------- pointer toys (mouse only) ---------- */
  if (!fine) return;

  /* cards tilt toward the cursor and catch the light */
  $('.h-card').forEach(function (card) {
    var a = null;
    var glare = mk('span', 'm-glare');
    glare.setAttribute('aria-hidden', 'true');
    card.appendChild(glare);
    card.addEventListener('pointermove', function (e) {
      a = a || A.createAnimatable(card, { rotateX: 500, rotateY: 500, scale: 500, ease: 'out(3)' });
      var r = card.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      a.rotateY((px - 0.5) * 12);
      a.rotateX((0.5 - py) * 9);
      a.scale(1.025);
      card.style.setProperty('--gx', (px * 100) + '%');
      card.style.setProperty('--gy', (py * 100) + '%');
    });
    card.addEventListener('pointerleave', function () {
      if (!a) return;
      a.rotateX(0); a.rotateY(0); a.scale(1);
    });
  });

  /* buttons lean toward the cursor */
  $('.h-btn, .h-chip, .btn, .h-k, .theme-sw, .p-home').forEach(function (el) {
    var a = null;
    var pull = el.classList.contains('theme-sw') || el.classList.contains('h-k') ? 0.5 : 0.28;
    el.addEventListener('pointermove', function (e) {
      a = a || A.createAnimatable(el, { x: 450, y: 450, ease: 'out(3)' });
      var r = el.getBoundingClientRect();
      a.x((e.clientX - r.left - r.width / 2) * pull);
      a.y((e.clientY - r.top - r.height / 2) * pull);
    });
    el.addEventListener('pointerleave', function () {
      if (!a) return;
      a.x(0); a.y(0);
    });
  });

  /* the avatar does a little flip when poked */
  var av = document.querySelector('.h-avatar');
  if (av) {
    av.style.cursor = 'pointer';
    av.addEventListener('click', function () {
      animate(av, { rotateY: '+=360', scale: [{ to: 1.15, duration: 250 }, { to: 1, duration: 700, ease: spring }], duration: 900, ease: 'inOutBack' });
    });
  }
})();
