/* Buttons carry data-act="functionName". No inline onclick: the site's content-security policy forbids it. */
document.addEventListener('click', function (e) {
  var b = e.target && e.target.closest && e.target.closest('[data-act]');
  var fn = b && window[b.getAttribute('data-act')];
  if (typeof fn === 'function') { e.preventDefault(); fn(); }
});
