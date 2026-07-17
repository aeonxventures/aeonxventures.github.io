
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


// User-requested dynamic banner slider.
document.querySelectorAll('[data-banner-slider]').forEach(slider=>{
  const slides=[...slider.querySelectorAll('[data-banner-slide]')];
  const dots=[...slider.querySelectorAll('[data-banner-dot]')];
  const previous=slider.querySelector('.banner-slider-prev');
  const next=slider.querySelector('.banner-slider-next');

  if(slides.length<2)return;

  let activeIndex=0;
  let timer=null;
  let paused=false;
  let touchStartX=0;

  function showSlide(index){
    activeIndex=(index+slides.length)%slides.length;

    slides.forEach((slide,slideIndex)=>{
      const selected=slideIndex===activeIndex;
      slide.classList.toggle('active',selected);
      slide.setAttribute('aria-hidden',String(!selected));
    });

    dots.forEach((dot,dotIndex)=>{
      const selected=dotIndex===activeIndex;
      dot.classList.toggle('active',selected);
      dot.setAttribute('aria-selected',String(selected));
    });
  }

  function move(direction){
    showSlide(activeIndex+direction);
    restart();
  }

  function restart(){
    window.clearInterval(timer);
    timer=window.setInterval(()=>{
      if(!paused && !document.hidden)showSlide(activeIndex+1);
    },5200);
  }

  previous?.addEventListener('click',()=>move(-1));
  next?.addEventListener('click',()=>move(1));
  dots.forEach(dot=>dot.addEventListener('click',()=>{
    showSlide(Number(dot.dataset.bannerDot||0));
    restart();
  }));

  slider.addEventListener('mouseenter',()=>{
    paused=true;
    slider.classList.add('is-paused');
  });
  slider.addEventListener('mouseleave',()=>{
    paused=false;
    slider.classList.remove('is-paused');
  });
  slider.addEventListener('focusin',()=>paused=true);
  slider.addEventListener('focusout',()=>paused=false);

  slider.addEventListener('keydown',event=>{
    if(event.key==='ArrowLeft')move(-1);
    if(event.key==='ArrowRight')move(1);
  });

  slider.addEventListener('touchstart',event=>{
    touchStartX=event.changedTouches[0]?.clientX||0;
  },{passive:true});

  slider.addEventListener('touchend',event=>{
    const touchEndX=event.changedTouches[0]?.clientX||0;
    const difference=touchEndX-touchStartX;
    if(Math.abs(difference)>45)move(difference>0?-1:1);
  },{passive:true});

  slider.setAttribute('tabindex','0');
  showSlide(0);
  restart();
});



// Temporary recipient with restored AEONX sending/success experience.
const aeonxContactForm = document.getElementById('contactForm');
const enquiryOverlay = document.getElementById('enquiryOverlay');
const enquirySpinner = document.getElementById('enquirySpinner');
const enquirySuccess = document.getElementById('enquirySuccess');
const enquiryError = document.getElementById('enquiryError');
const enquiryTitle = document.getElementById('enquiryTitle');
const enquiryMessage = document.getElementById('enquiryMessage');
const enquiryDone = document.getElementById('enquiryDone');

function showEnquiryState(state, customMessage = '') {
  if (!enquiryOverlay) return;

  enquiryOverlay.classList.add('visible');
  enquiryOverlay.setAttribute('aria-hidden', 'false');
  enquiryOverlay.dataset.state = state;
  document.body.classList.add('enquiry-open');

  enquirySpinner?.classList.toggle('hidden', state !== 'sending');
  enquirySuccess?.classList.toggle('visible', state === 'success');
  enquiryError?.classList.toggle('visible', state === 'error');
  enquiryDone?.classList.toggle('visible', state !== 'sending');

  if (state === 'sending') {
    enquiryTitle.textContent = 'Sending Enquiry';
    enquiryMessage.textContent = 'Please wait while we send your details.';
  } else if (state === 'success') {
    enquiryTitle.textContent = 'Enquiry Sent Successfully';
    enquiryMessage.textContent =
      customMessage || 'Thank you. Our team will contact you shortly.';
  } else {
    enquiryTitle.textContent = 'Unable to Send';
    enquiryMessage.textContent =
      customMessage || 'Please try again or contact us through WhatsApp.';
  }
}

function closeEnquiryOverlayAndReturnHome() {
  enquiryOverlay?.classList.remove('visible');
  enquiryOverlay?.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('enquiry-open');

  window.setTimeout(() => {
    const homeSection = document.getElementById('home');
    if (homeSection) {
      homeSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, 180);
}

enquiryDone?.addEventListener('click', closeEnquiryOverlayAndReturnHome);

enquiryOverlay?.addEventListener('click', (event) => {
  if (
    event.target === enquiryOverlay &&
    enquiryOverlay.dataset.state !== 'sending'
  ) {
    closeEnquiryOverlayAndReturnHome();
  }
});

document.addEventListener('keydown', (event) => {
  if (
    event.key === 'Escape' &&
    enquiryOverlay?.classList.contains('visible') &&
    enquiryOverlay.dataset.state !== 'sending'
  ) {
    closeEnquiryOverlayAndReturnHome();
  }
});

aeonxContactForm?.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (window.location.protocol === 'file:') {
    showEnquiryState(
      'error',
      'Open the website with VS Code Live Server or from the live website. FormSubmit cannot work from a file:// page.'
    );
    return;
  }

  const submitButton = aeonxContactForm.querySelector('button[type="submit"]');
  const originalButtonHTML = submitButton?.innerHTML || 'Submit Project Enquiry';

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.innerHTML = 'Sending Enquiry...';
  }

  showEnquiryState('sending');

  try {
    const formData = new FormData(aeonxContactForm);
    const payload = Object.fromEntries(formData.entries());

    const response = await fetch(
      'https://formsubmit.co/ajax/haseeb13000@gmail.com',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(payload)
      }
    );

    const result = await response.json().catch(() => ({}));
    const responseMessage = String(result.message || '');

    if (!response.ok || result.success === false) {
      throw new Error(responseMessage || 'Unable to submit form.');
    }

    if (/activat|confirm/i.test(responseMessage)) {
      throw new Error('ACTIVATION_REQUIRED');
    }

    aeonxContactForm.reset();

    // Keep the sending state visible briefly so the transition feels natural.
    window.setTimeout(() => {
      showEnquiryState(
        'success',
        'Thank you. Our team will contact you shortly.'
      );
    }, 650);
  } catch (error) {
    console.error('Form submission error:', error);

    const activationRequired =
      String(error?.message || '') === 'ACTIVATION_REQUIRED' ||
      /activat|confirm/i.test(String(error?.message || ''));

    window.setTimeout(() => {
      showEnquiryState(
        'error',
        activationRequired
          ? 'Check haseeb13000@gmail.com and click the FormSubmit activation link first.'
          : 'Unable to send. Please try again or contact us through WhatsApp.'
      );
    }, 350);
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.innerHTML = originalButtonHTML;
    }
  }
});
