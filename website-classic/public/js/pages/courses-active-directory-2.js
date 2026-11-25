(function(){
  const COURSE_NAME = 'Learn Active Directory';
  const COURSE_PRICE = 799;
  const ORIGINAL_PRICE = 1599;
  const fmt = n => Number(n).toLocaleString('en-IN');
  const url = `/courses/payment.html?course=${encodeURIComponent(COURSE_NAME)}&amount=${COURSE_PRICE}`;
  const priceHTML = `<span class="tg-price-tag" style="display:inline-flex;align-items:center;gap:8px;margin-left:12px;font-family:'JetBrains Mono',monospace;font-weight:700;vertical-align:middle;flex-wrap:wrap;justify-content:center;">`+
    `<span style="text-decoration:line-through;color:rgba(255,255,255,0.45);font-size:13px;">₹${fmt(ORIGINAL_PRICE)}</span>`+
    `<span style="color:#00FF9C;font-size:18px;">₹${fmt(COURSE_PRICE)}</span>`+
    (ORIGINAL_PRICE > COURSE_PRICE ? `<span style="background:#FF3B3B;color:#fff;font-size:10px;padding:3px 8px;border-radius:6px;letter-spacing:0.5px;">${Math.round((ORIGINAL_PRICE - COURSE_PRICE) / ORIGINAL_PRICE * 100)}% OFF</span>` : '')+
    `</span>`;
  document.querySelectorAll('a[href*="/courses/payment.html"]').forEach(a => {
    a.href = url;
    if (a.classList.contains('btn-enroll') || a.classList.contains('cta-btn')) {
      if (!a.querySelector('.tg-price-tag')) a.insertAdjacentHTML('beforeend', priceHTML);
      a.style.flexWrap = 'wrap';
      a.style.gap = '8px';
    }
  });
})();
