/* Scroll progress */
window.addEventListener('scroll',()=>{
  const s=document.documentElement;
  document.getElementById('prog').style.width=
    (s.scrollTop/(s.scrollHeight-s.clientHeight))*100+'%';
});

/* Fade-in on scroll */
const io=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
},{threshold:.1,rootMargin:'0px 0px -40px 0px'});

document.querySelectorAll('.fade,.fade-l,.fade-r').forEach((el,i)=>{
  el.style.transitionDelay=(i%6)*.08+'s';
  io.observe(el);
});
