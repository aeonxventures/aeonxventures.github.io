
const siteLoader=document.getElementById('siteLoader');
if(siteLoader){
  document.body.classList.add('loader-active');
  window.addEventListener('load',()=>{
    window.setTimeout(()=>{
      siteLoader.classList.add('is-hidden');
      document.body.classList.remove('loader-active');
      window.dispatchEvent(new CustomEvent('aeonx:loader-hidden'));
      window.setTimeout(()=>siteLoader.remove(),700);
    },1800);
  });
}

const header=document.querySelector('.site-header');const menu=document.querySelector('.menu-toggle');const nav=document.querySelector('.site-nav');
function closeMenu(){nav?.classList.remove('open');document.body.classList.remove('menu-open');menu?.setAttribute('aria-expanded','false')}
menu?.addEventListener('click',()=>{const open=nav.classList.toggle('open');document.body.classList.toggle('menu-open',open);menu.setAttribute('aria-expanded',String(open))});
nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
window.addEventListener('scroll',()=>header?.classList.toggle('scrolled',window.scrollY>12),{passive:true});
document.querySelectorAll('#year').forEach(el=>el.textContent=new Date().getFullYear());
const revealObserver=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');revealObserver.unobserve(e.target)}})},{threshold:.12});document.querySelectorAll('.reveal').forEach(el=>revealObserver.observe(el));
const counters=[...document.querySelectorAll('[data-count]')];
let countersStarted=false;

function animateBusinessCounters(){
  if(countersStarted || !counters.length)return;
  countersStarted=true;

  counters.forEach((el,index)=>{
    const target=Number(el.dataset.count||0);
    const suffix=el.dataset.suffix||'';
    const duration=2200+(index*180);
    const delay=index*120;

    window.setTimeout(()=>{
      const start=performance.now();

      function tick(now){
        const progress=Math.min((now-start)/duration,1);
        const eased=1-Math.pow(1-progress,4);
        const value=Math.round(target*eased);
        el.textContent=String(value)+suffix;

        if(progress<1){
          requestAnimationFrame(tick);
        }else{
          el.textContent=String(target)+suffix;
          el.closest('.metric-card')?.classList.add('count-complete');
        }
      }

      requestAnimationFrame(tick);
    },delay);
  });
}

window.addEventListener('aeonx:loader-hidden',()=>window.setTimeout(animateBusinessCounters,180),{once:true});
window.addEventListener('load',()=>{
  if(!siteLoader)window.setTimeout(animateBusinessCounters,300);
  window.setTimeout(animateBusinessCounters,3200);
},{once:true});
const sections=[...document.querySelectorAll('main section[id]')];const navLinks=[...document.querySelectorAll('.site-nav a[href*="#"]')];const activeObserver=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){const id=entry.target.id;navLinks.forEach(a=>a.classList.toggle('active',a.getAttribute('href').endsWith('#'+id)))}})},{rootMargin:'-35% 0px -55% 0px'});sections.forEach(s=>activeObserver.observe(s));


// Testimonial region tabs, arrows, auto-scroll and mobile swipe.
const testimonialSection=document.querySelector('.testimonials-section');
if(testimonialSection){
  const tabs=[...testimonialSection.querySelectorAll('[data-testimonial-tab]')];
  const panels=[...testimonialSection.querySelectorAll('[data-testimonial-panel]')];
  const prevButton=testimonialSection.querySelector('[data-testimonial-prev]');
  const nextButton=testimonialSection.querySelector('[data-testimonial-next]');
  let activeRegion='india';
  let autoTimer=null;
  let paused=false;

  function activePanel(){
    return testimonialSection.querySelector(`[data-testimonial-panel="${activeRegion}"]`);
  }

  function cardStep(track){
    const card=track?.querySelector('.testimonial-card');
    if(!card)return 320;
    const gap=parseFloat(getComputedStyle(track).columnGap||getComputedStyle(track).gap||0);
    return card.getBoundingClientRect().width+gap;
  }

  function moveTestimonials(direction){
    const track=activePanel()?.querySelector('.testimonial-track');
    if(!track)return;
    const step=cardStep(track);
    const max=track.scrollWidth-track.clientWidth;
    if(direction>0 && track.scrollLeft>=max-step*.55){
      track.scrollTo({left:0,behavior:'smooth'});
    }else if(direction<0 && track.scrollLeft<=step*.35){
      track.scrollTo({left:max,behavior:'smooth'});
    }else{
      track.scrollBy({left:direction*step,behavior:'smooth'});
    }
  }

  function selectRegion(region){
    activeRegion=region;
    tabs.forEach(tab=>{
      const selected=tab.dataset.testimonialTab===region;
      tab.classList.toggle('active',selected);
      tab.setAttribute('aria-selected',String(selected));
    });
    panels.forEach(panel=>{
      const selected=panel.dataset.testimonialPanel===region;
      panel.classList.toggle('active',selected);
      panel.hidden=!selected;
      if(selected){
        panel.querySelector('.testimonial-track')?.scrollTo({left:0});
      }
    });
    restartAuto();
  }

  function restartAuto(){
    window.clearInterval(autoTimer);
    autoTimer=window.setInterval(()=>{
      if(!paused && !document.hidden)moveTestimonials(1);
    },4200);
  }

  tabs.forEach(tab=>tab.addEventListener('click',()=>selectRegion(tab.dataset.testimonialTab)));
  prevButton?.addEventListener('click',()=>moveTestimonials(-1));
  nextButton?.addEventListener('click',()=>moveTestimonials(1));

  testimonialSection.addEventListener('mouseenter',()=>paused=true);
  testimonialSection.addEventListener('mouseleave',()=>paused=false);
  testimonialSection.addEventListener('focusin',()=>paused=true);
  testimonialSection.addEventListener('focusout',()=>paused=false);

  restartAuto();
}


// Optional image fallback: replace broken content visuals with an AEONX icon panel.
document.querySelectorAll('img[data-fallback-icon]').forEach(image=>{
  image.addEventListener('error',()=>{
    const fallback=document.createElement('div');
    fallback.className='image-icon-fallback';
    fallback.innerHTML=`<img src="${image.dataset.fallbackIcon}" alt=""><span>AEONX VISUAL</span>`;
    image.replaceWith(fallback);
  },{once:true});
});
