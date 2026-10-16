(function () {
  var root = document.documentElement;
  var sw = document.getElementById('themeSw');

  function apply(mode) {
    var dark = mode === 'dark';
    root.classList.toggle('dark', dark);
    if (sw) sw.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    try { localStorage.setItem('nk-theme', mode); } catch (e) {}
  }

  var saved = null;
  try { saved = localStorage.getItem('nk-theme'); } catch (e) {}
  apply(saved === 'dark' ? 'dark' : 'light');

  if (sw) sw.addEventListener('click', function () {
    apply(root.classList.contains('dark') ? 'light' : 'dark');
  });
})();

(function () {
  var cal = document.getElementById('ghcal');
  if (!cal || !window.fetch) return;
  var user = cal.getAttribute('data-user');
  var grid = cal.querySelector('.cal-grid');
  var total = cal.querySelector('.cal-total a');

  fetch('https://github-contributions-api.jogruber.de/v4/' + user + '?y=last')
    .then(function (r) { if (!r.ok) throw r; return r.json(); })
    .then(function (data) {
      var days = data.contributions || [];
      if (!days.length) return;
      // pad so the first column starts on Sunday, like GitHub
      var lead = new Date(days[0].date + 'T00:00:00').getDay();
      var html = '';
      for (var i = 0; i < lead; i++) html += '<i style="visibility:hidden"></i>';
      days.forEach(function (d) {
        html += '<i class="l' + d.level + '" title="' + d.count + ' on ' + d.date + '"></i>';
      });
      grid.innerHTML = html;
      total.textContent = data.total.lastYear.toLocaleString() + ' contributions in the last year';
      var sc = cal.querySelector('.cal-scroll');
      sc.scrollLeft = sc.scrollWidth;
    })
    .catch(function () { grid.parentNode.style.display = 'none'; });
})();
