/* ⌘K / Ctrl K command palette */
(function () {
  var mac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  var EMAIL = 'nirbhay.bin@gmail.com';

  function go(href, blank) {
    return function () { if (blank) window.open(href, '_blank', 'noopener'); else location.href = href; };
  }
  function jump(id) {
    return function () { var e = document.getElementById(id); if (e) e.scrollIntoView({ behavior: 'smooth' }); };
  }
  var items = [
    { g: 'Go to', t: 'Experience', k: 'work jobs plany', run: jump('experience') },
    { g: 'Go to', t: 'Live from zerodaily.in', k: 'news wire headlines', run: jump('live') },
    { g: 'Go to', t: 'Projects', k: 'work', run: jump('projects') },
    { g: 'Go to', t: 'Open source', k: 'pull requests prs contributions', run: jump('contributions') },
    { g: 'Go to', t: 'GitHub activity', k: 'graph commits', run: jump('activity') },
    { g: 'Go to', t: 'Contact', k: 'email reach', run: jump('contact') },
    { g: 'Projects', t: 'ZeroDaily', k: 'news app aws', run: go('zerodaily.html') },
    { g: 'Projects', t: 'Conduit', k: 'browser agents mcp', run: go('conduit.html') },
    { g: 'Projects', t: 'FlexURL', k: 'url shortener links', run: go('flexurl.html') },
    { g: 'Projects', t: 'tokenly', k: 'auth python pypi', run: go('tokenly.html') },
    { g: 'Projects', t: 'All projects', k: 'list', run: go('projects.html') },
    { g: 'Actions', t: 'Copy email address', k: 'mail clipboard', run: function () {
        if (navigator.clipboard) navigator.clipboard.writeText(EMAIL).then(function () { toast('Copied ' + EMAIL); });
        else location.href = 'mailto:' + EMAIL;
      } },
    { g: 'Actions', t: 'Send an email', k: 'mail contact', run: go('mailto:' + EMAIL) },
    { g: 'Actions', t: 'Open resume', k: 'cv pdf', run: go(document.querySelector('a[href*="resume.pdf"]') ? document.querySelector('a[href*="resume.pdf"]').getAttribute('href') : 'assets/resume.pdf', true) },
    { g: 'Actions', t: 'Switch theme', k: 'dark light mode', run: function () { var s = document.getElementById('themeSw'); if (s) s.click(); } },
    { g: 'Elsewhere', t: 'GitHub', k: 'code err0rgod', run: go('https://github.com/err0rgod', true) },
    { g: 'Elsewhere', t: 'LinkedIn', k: 'profile', run: go('https://linkedin.com/in/nirbhay-katiyar', true) },
    { g: 'Elsewhere', t: 'X', k: 'twitter', run: go('https://x.com/err0rgod', true) },
    { g: 'Elsewhere', t: 'Medium', k: 'blog writing', run: go('https://err0rgod.medium.com', true) }
  ];

  var wrap = document.createElement('div');
  wrap.className = 'k-wrap';
  wrap.hidden = true;
  wrap.innerHTML =
    '<div class="k-box" role="dialog" aria-modal="true" aria-label="Command palette">' +
    '<input class="k-in" type="text" placeholder="Type a command or search…" aria-label="Search commands" autocomplete="off" spellcheck="false">' +
    '<ul class="k-list" role="listbox"></ul>' +
    '<p class="k-foot"><span>↑↓ to move</span><span>↵ to open</span><span>esc to close</span></p>' +
    '</div>';
  document.body.appendChild(wrap);
  var input = wrap.querySelector('.k-in'), list = wrap.querySelector('.k-list');
  var shown = [], sel = 0, lastFocus = null;

  function match(it, q) {
    if (!q) return true;
    var hay = (it.t + ' ' + it.k + ' ' + it.g).toLowerCase();
    return q.toLowerCase().split(/\s+/).every(function (w) { return hay.indexOf(w) !== -1; });
  }
  function render() {
    var q = input.value.trim();
    shown = items.filter(function (it) { return match(it, q); });
    if (sel >= shown.length) sel = 0;
    list.innerHTML = '';
    var group = null;
    shown.forEach(function (it, i) {
      if (it.g !== group) {
        group = it.g;
        var h = document.createElement('li');
        h.className = 'k-group';
        h.textContent = group;
        list.appendChild(h);
      }
      var li = document.createElement('li');
      li.className = 'k-item' + (i === sel ? ' on' : '');
      li.setAttribute('role', 'option');
      li.textContent = it.t;
      li.addEventListener('mousemove', function () { if (sel !== i) { sel = i; render(); } });
      li.addEventListener('click', function () { pick(i); });
      list.appendChild(li);
    });
    if (!shown.length) {
      var none = document.createElement('li');
      none.className = 'k-none';
      none.textContent = 'Nothing matches “' + q + '”';
      list.appendChild(none);
    }
    var on = list.querySelector('.on');
    if (on) on.scrollIntoView({ block: 'nearest' });
  }
  function open() {
    lastFocus = document.activeElement;
    wrap.hidden = false;
    input.value = '';
    sel = 0;
    render();
    input.focus();
  }
  function close() {
    wrap.hidden = true;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function pick(i) {
    var it = shown[i];
    if (!it) return;
    close();
    it.run();
  }
  function toast(msg) {
    var t = document.createElement('div');
    t.className = 'k-toast';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 1800);
  }

  input.addEventListener('input', function () { sel = 0; render(); });
  wrap.addEventListener('click', function (e) { if (e.target === wrap) close(); });
  document.addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (wrap.hidden) open(); else close();
      return;
    }
    if (wrap.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); sel = (sel + 1) % Math.max(shown.length, 1); render(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); sel = (sel - 1 + shown.length) % Math.max(shown.length, 1); render(); }
    else if (e.key === 'Enter') { e.preventDefault(); pick(sel); }
  });

  var btn = document.getElementById('kOpen');
  if (btn) {
    btn.querySelector('kbd').textContent = mac ? '⌘K' : 'Ctrl K';
    btn.addEventListener('click', open);
  }
})();
