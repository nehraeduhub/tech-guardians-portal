window.addEventListener('scroll',()=>{
  const s = document.documentElement;
  const p = (s.scrollTop/(s.scrollHeight-s.clientHeight))*100;
  document.getElementById('progress').style.width = p+'%';
});

const obs = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target);}
  });
},{threshold:0.1,rootMargin:'0px 0px -40px 0px'});

document.querySelectorAll('.fade-up').forEach((el,i)=>{
  el.style.transitionDelay = (i%4)*0.08+'s';
  obs.observe(el);
});
