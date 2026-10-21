/* Live from zerodaily.in: the latest real headlines */
(function () {
  var box = document.getElementById('live');
  if (!box || !window.fetch) return;
  var API = 'https://api.zerodaily.in';
  var list = box.querySelector('.h-wire');
  var CATS = { cybersec: 'Security', ai: 'AI', hardware: 'Silicon', finance: 'Finance', defense_aerospace: 'Defense', robotics: 'Robotics', software: 'Software' };

  function ago(iso) {
    var s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
    if (s < 90) return 'just now';
    if (s < 3600) return Math.round(s / 60) + ' min ago';
    if (s < 86400) return Math.round(s / 3600) + ' h ago';
    return Math.round(s / 86400) + ' d ago';
  }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  }

  fetch(API + '/api/v1/feed')
    .then(function (r) { if (!r.ok) throw r; return r.json(); })
    .then(function (d) { return d.data || []; })
    .then(function (items) {
    if (!items.length) return;

    /* one story per desk, newest first, so the wire shows the spread */
    var seen = {}, pick = [];
    items.forEach(function (a) {
      if (pick.length < 4 && !seen[a.category]) { seen[a.category] = 1; pick.push(a); }
    });

    pick.forEach(function (a) {
      var li = el('li');
      var link = el('a');
      link.href = 'https://zerodaily.in/a/' + encodeURIComponent(a.short_code);
      link.target = '_blank';
      link.rel = 'noopener';
      if (a.image_url) {
        var img = el('img');
        img.src = a.image_url; img.alt = ''; img.loading = 'lazy'; img.width = 64; img.height = 64;
        img.onerror = function () { img.remove(); };
        link.appendChild(img);
      }
      var txt = el('div', 'h-wire-text');
      var meta = el('p', 'h-wire-meta');
      meta.appendChild(el('span', 'h-tag', CATS[a.category] || a.category));
      meta.appendChild(document.createTextNode(' ' + ago(a.published_at)));
      txt.appendChild(meta);
      txt.appendChild(el('p', 'h-wire-head', a.heading));
      link.appendChild(txt);
      li.appendChild(link);
      list.appendChild(li);
    });

    box.hidden = false;
    var idx = document.querySelector('.h-index a[href="#live"]');
    if (idx) idx.hidden = false;
  }).catch(function () { /* section stays hidden */ });
})();
