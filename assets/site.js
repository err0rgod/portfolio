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
  apply(saved || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));

  if (sw) sw.addEventListener('click', function () {
    apply(root.classList.contains('dark') ? 'light' : 'dark');
  });
})();
