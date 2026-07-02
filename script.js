const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');

menuButton?.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
  document.body.classList.toggle('menu-open', isOpen);
});

document.querySelectorAll('.site-nav a').forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

const glow = document.querySelector('.cursor-glow');
window.addEventListener('pointermove', (event) => {
  if (!glow) return;
  glow.style.left = `${event.clientX}px`;
  glow.style.top = `${event.clientY}px`;
});

document.getElementById('year').textContent = new Date().getFullYear();

// AEONX Loader
window.addEventListener("load", () => {
  const loader = document.getElementById("siteLoader");

  if (!loader) return;

  setTimeout(() => {
    loader.classList.add("is-hidden");

    setTimeout(() => {
      loader.remove();
    }, 700);
  }, 2000);
});

// International Phone Number Field
const phoneInput = document.getElementById("phone");
const fullPhoneInput = document.getElementById("fullPhone");
const phoneError = document.getElementById("phoneError");

const phoneIti =
  phoneInput && window.intlTelInput
    ? window.intlTelInput(phoneInput, {
        initialCountry: "in",
        separateDialCode: true,
        countrySearch: true,
        strictMode: true,

        loadUtils: () =>
          import(
            "https://cdn.jsdelivr.net/npm/intl-tel-input@29.1.1/build/js/utils.js"
          )
      })
    : null;
    
// Contact Form Submit Animation
const contactForm = document.getElementById("contactForm");
const submitOverlay = document.getElementById("submitOverlay");
const submitSpinner = document.getElementById("submitSpinner");
const submitCheck = document.getElementById("submitCheck");
const submitTitle = document.getElementById("submitTitle");
const submitMessage = document.getElementById("submitMessage");

contactForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const submitButton = contactForm.querySelector(
    'button[type="submit"]'
  );

  // Sending animation show karo
  submitOverlay.classList.add("is-visible");
  submitOverlay.setAttribute("aria-hidden", "false");

  submitSpinner.classList.remove("is-hidden");
  submitCheck.classList.remove("is-visible");

  submitTitle.textContent = "Sending Enquiry";
  submitMessage.textContent =
    "Please wait while we send your details.";

  submitButton.disabled = true;

  try {
    const formData = new FormData(contactForm);
    const formValues = Object.fromEntries(formData.entries());

    const ajaxEndpoint = contactForm.action.replace(
      "https://formsubmit.co/",
      "https://formsubmit.co/ajax/"
    );

    const response = await fetch(ajaxEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(formValues)
    });

    if (!response.ok) {
      throw new Error("Form submission failed");
    }

    // Green tick show karo
    submitSpinner.classList.add("is-hidden");
    submitCheck.classList.add("is-visible");

    submitTitle.textContent = "Enquiry Sent Successfully";
    submitMessage.textContent =
      "Thank you. Our team will contact you shortly.";

    contactForm.reset();

    // 1.6 seconds baad overlay hide aur Home par return
    setTimeout(() => {
      submitOverlay.classList.remove("is-visible");
      submitOverlay.setAttribute("aria-hidden", "true");

      document.getElementById("home")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

      submitButton.disabled = false;
    }, 1600);
  } catch (error) {
    console.error(error);

    submitSpinner.classList.add("is-hidden");

    submitTitle.textContent = "Unable to Send";
    submitMessage.textContent =
      "Please check your internet connection and try again.";

    setTimeout(() => {
      submitOverlay.classList.remove("is-visible");
      submitOverlay.setAttribute("aria-hidden", "true");
      submitButton.disabled = false;
    }, 2200);
  }
});

// Hero statistics count-up animation
function initHeroStatCounters() {
  const counters = document.querySelectorAll(".stat-counter");
  if (!counters.length) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const animateCounter = (counter) => {
    if (counter.dataset.counted === "true") return;
    counter.dataset.counted = "true";

    const target = Number(counter.dataset.target || 0);
    const suffix = counter.dataset.suffix || "";

    if (reduceMotion) {
      counter.textContent = `${target}${suffix}`;
      return;
    }

    const duration = target > 1000 ? 1900 : 1450;
    const startTime = performance.now();

    const update = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      const value = Math.floor(target * eased);
      counter.textContent = `${value}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        counter.textContent = `${target}${suffix}`;
      }
    };

    requestAnimationFrame(update);
  };

  const statObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      animateCounter(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.45 });

  counters.forEach((counter) => statObserver.observe(counter));
}

// Start after the opening loader has faded, so visitors can see the count-up.
window.addEventListener("load", () => {
  window.setTimeout(initHeroStatCounters, 2750);
});
