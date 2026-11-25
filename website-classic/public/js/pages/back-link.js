/* "Back" link: go to the previous page when there is one. */
var backLink = document.querySelector('[data-back-link]');
if (backLink) backLink.addEventListener('click', function (e) { if (history.length > 1) { e.preventDefault(); history.back(); } });
