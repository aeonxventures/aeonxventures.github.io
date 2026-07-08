(() => {
  "use strict";
  const menuToggle = document.querySelector(".menu-toggle");
  const siteNav = document.querySelector(".site-nav");
  const setMenu = (open) => {
    siteNav?.classList.toggle("open", open);
    siteNav?.classList.toggle("is-open", open);
    menuToggle?.classList.toggle("active", open);
    menuToggle?.classList.toggle("is-active", open);
    menuToggle?.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("menu-open", open);
  };
  menuToggle?.addEventListener("click", () => setMenu(menuToggle.getAttribute("aria-expanded") !== "true"));
  siteNav?.querySelectorAll("a").forEach(a => a.addEventListener("click", () => setMenu(false)));

  const toggle = document.querySelector(".site-search-toggle");
  const panel = document.getElementById("siteSearch");
  const input = document.getElementById("siteSearchInput");
  const results = document.getElementById("siteSearchResults");
  const close = document.querySelector(".site-search-close");
  const items = [
    {title:"Product Development & Launch",meta:"Solution",href:"product-development-launch.html",keys:"product vendor manufacturing packaging"},
    {title:"Branding & Creative Design",meta:"Solution",href:"branding-creative-design.html",keys:"logo label box brand creative"},
    {title:"Ecommerce & Marketplace Management",meta:"Solution",href:"ecommerce-marketplace-management.html",keys:"website amazon flipkart listing ads"},
    {title:"Go-to-Market & Business Growth",meta:"Solution",href:"go-to-market-business-growth.html",keys:"startup sales sourcing pricing growth"},
    {title:"About AEONX",meta:"Company",href:"about.html",keys:"Ahsaan Ullah Rahul Singhal founders ventures"},
    {title:"Start a Project",meta:"Contact",href:"index.html#contact",keys:"enquiry whatsapp phone form"}
  ];
  const render = q => {
    if(!results) return;
    const x=(q||"").trim().toLowerCase();
    const matches=x?items.filter(i=>(`${i.title} ${i.meta} ${i.keys}`).toLowerCase().includes(x)):items;
    results.innerHTML=matches.length?matches.map(i=>`<a class="site-search-result" href="${i.href}"><span><strong>${i.title}</strong><small>${i.meta}</small></span><span aria-hidden="true">↗</span></a>`).join(""):'<p class="site-search-empty">No matching service found.</p>';
  };
  const setSearch = open => {
    panel?.classList.toggle("is-open", open); panel?.setAttribute("aria-hidden", String(!open));
    toggle?.setAttribute("aria-expanded", String(open)); document.body.classList.toggle("search-open", open);
    if(open){setMenu(false);render(input?.value);setTimeout(()=>input?.focus(),80)} else if(input) input.value="";
  };
  toggle?.addEventListener("click",()=>setSearch(toggle.getAttribute("aria-expanded")!=="true"));
  close?.addEventListener("click",()=>setSearch(false)); input?.addEventListener("input",()=>render(input.value));
  input?.addEventListener("keydown",e=>{if(e.key==="Escape")setSearch(false);if(e.key==="Enter"){e.preventDefault();results?.querySelector("a")?.click();}});

  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("visible");observer.unobserve(entry.target)}}),{threshold:.1});
  document.querySelectorAll(".reveal").forEach(el=>observer.observe(el));
  const glow=document.querySelector(".cursor-glow");
  if(glow&&matchMedia("(pointer:fine)").matches)addEventListener("pointermove",e=>{glow.style.left=`${e.clientX}px`;glow.style.top=`${e.clientY}px`});
  const year=document.getElementById("year");if(year)year.textContent=new Date().getFullYear();
})();