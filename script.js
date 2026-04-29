/* ============================================================
   PORTFOLIO — script.js
   Features: loader, custom cursor, navbar, scroll reveal,
             project filter, skill bar animation,
             form validation, back-to-top, smooth scroll
   ============================================================ */

let isVerified = false;

'use strict';

/* ─── HELPER: run after DOM is ready ──────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

  initLoader();
  initCursor();
  initNavbar();
  initScrollReveal();
  initProjectFilter();
  initSkillBars();
  initContactForm();
  initBackToTop();
  initFooterYear();
  initPremiumStars();

});

/* ================================================================
   1. LOADER
================================================================ */
function initLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;

  // Hide after page assets are ready (min 600ms for effect)
  const minDelay = 800;
  const start    = Date.now();

  window.addEventListener('load', () => {
    const elapsed = Date.now() - start;
    const wait    = Math.max(0, minDelay - elapsed);

    setTimeout(() => {
      loader.classList.add('hidden');
      // Remove from DOM after transition
      loader.addEventListener('transitionend', () => loader.remove(), { once: true });
    }, wait);
  });
}

/* ================================================================
   2. CUSTOM CURSOR
================================================================ */
function initCursor() {
  const cursor   = document.getElementById('cursor');
  const follower = document.getElementById('cursor-follower');
  if (!cursor || !follower) return;

  // Only activate on pointer devices
  if (!window.matchMedia('(hover: hover)').matches) return;

  let mouseX = -100, mouseY = -100;
  let followerX = -100, followerY = -100;
  let rafId;

  // Update dot position immediately
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top  = mouseY + 'px';
  });

  // Animate follower with lag
  function animateFollower() {
    followerX += (mouseX - followerX) * 0.14;
    followerY += (mouseY - followerY) * 0.14;
    follower.style.left = followerX + 'px';
    follower.style.top  = followerY + 'px';
    rafId = requestAnimationFrame(animateFollower);
  }
  rafId = requestAnimationFrame(animateFollower);

  // Hover state on interactive elements
  const interactiveSelector = 'a, button, input, textarea, [role="tab"], .project-card, .icon-item';

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(interactiveSelector)) {
      document.body.classList.add('cursor-hover');
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(interactiveSelector)) {
      document.body.classList.remove('cursor-hover');
    }
  });

  // Hide when leaving window
  document.addEventListener('mouseleave', () => {
    cursor.style.opacity   = '0';
    follower.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    cursor.style.opacity   = '1';
    follower.style.opacity = '0.6';
  });
}

/* ================================================================
   3. NAVBAR — scroll behavior & mobile menu
================================================================ */
function initNavbar() {
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.mobile-link');
  if (!navbar) return;

  /* --- Scroll class --- */
  let lastY = 0;

  function onScroll() {
    const y = window.scrollY;

    // Add .scrolled after 50px
    navbar.classList.toggle('scrolled', y > 50);

    lastY = y;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on init

  /* --- Active link highlighting --- */
  const sections = document.querySelectorAll('section[id]');
  const navLinksAll = document.querySelectorAll('.nav-links a');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinksAll.forEach(link => {
          link.classList.toggle('active-nav', link.getAttribute('href') === '#' + id);
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(sec => sectionObserver.observe(sec));

  /* --- Mobile menu toggle --- */
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', isOpen);
      mobileMenu.classList.toggle('open', isOpen);
      mobileMenu.setAttribute('aria-hidden', !isOpen);
    });

    // Close when a link is clicked
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        mobileMenu.classList.remove('open');
        mobileMenu.setAttribute('aria-hidden', 'true');
      });
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!navbar.contains(e.target) && mobileMenu.classList.contains('open')) {
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        mobileMenu.classList.remove('open');
        mobileMenu.setAttribute('aria-hidden', 'true');
      }
    });
  }

  /* --- Smooth scroll for ALL anchor links --- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const offset = navbar.offsetHeight + 16;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ================================================================
   4. SCROLL REVEAL (IntersectionObserver)
================================================================ */
function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
  if (!revealEls.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target); // only once
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  revealEls.forEach(el => observer.observe(el));
}

/* ================================================================
   5. PROJECT FILTER
================================================================ */
function initProjectFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards      = document.querySelectorAll('.project-card');
  if (!filterBtns.length || !cards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const filter = btn.dataset.filter;

      cards.forEach(card => {
        const match = filter === 'all' || card.dataset.category === filter;

        if (match) {
          card.classList.remove('hidden-card');
          // Re-trigger reveal animation
          card.classList.remove('revealed');
          requestAnimationFrame(() => {
            requestAnimationFrame(() => card.classList.add('revealed'));
          });
        } else {
          card.classList.add('hidden-card');
        }
      });
    });
  });
}

/* ================================================================
   6. SKILL BAR ANIMATION
================================================================ */
function initSkillBars() {
  const skillItems = document.querySelectorAll('.skill-bar-item');
  if (!skillItems.length) return;

  const triggered = new Set();

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !triggered.has(entry.target)) {
        triggered.add(entry.target);

        const fill = entry.target.querySelector('.skill-fill');
        const track = entry.target.querySelector('.skill-track');
        const levelEl = entry.target.querySelector('.skill-level');

        const pct = parseInt(fill.dataset.pct);

        // Animate bar
        setTimeout(() => {
          fill.style.width = pct + '%';
        }, 200);

        // 🔥 Update text dynamically
        const level = getSkillLevel(pct);
        levelEl.textContent = level.text;

        // Reset classes
        levelEl.classList.remove('beginner', 'intermediate', 'advanced', 'professional');
        levelEl.classList.add(level.class);

        // Accessibility update
        track.setAttribute('aria-valuenow', pct);
      }
    });
  }, { threshold: 0.3 });

  skillItems.forEach(item => observer.observe(item));
}

function getSkillLevel(pct) {
  if (pct <= 30) return { text: "Beginner", class: "beginner" };
  if (pct <= 60) return { text: "Intermediate", class: "intermediate" };
  if (pct <= 90) return { text: "Advanced", class: "advanced" };
  return { text: "Professional", class: "professional" };
}
/* ================================================================
   7. CONTACT FORM VALIDATION
================================================================ */
function initContactForm() {
  const form       = document.getElementById('contactForm');
  const submitBtn  = document.getElementById('submitBtn');
  const successMsg = document.getElementById('formSuccess');
  if (!form) return;

  /* --- Field references --- */
  const fields = {
    name:    { el: document.getElementById('name'),    errorEl: document.getElementById('nameError') },
    email:   { el: document.getElementById('email'),   errorEl: document.getElementById('emailError') },
    subject: { el: document.getElementById('subject'), errorEl: document.getElementById('subjectError') },
    message: { el: document.getElementById('message'), errorEl: document.getElementById('messageError') },
  };

  /* --- Validators --- */
  const validators = {
    name:    (v) => v.trim().length >= 2   ? '' : 'Please enter your full name (min. 2 characters).',
    email:   (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Please enter a valid email address.',
    subject: (v) => v.trim().length >= 3   ? '' : 'Subject must be at least 3 characters.',
    message: (v) => v.trim().length >= 20  ? '' : 'Message should be at least 20 characters.',
  };

  /* --- Live validation on blur --- */
  Object.keys(fields).forEach(key => {
    const { el, errorEl } = fields[key];
    if (!el) return;

    el.addEventListener('blur', () => {
      const error = validators[key](el.value);
      showFieldError(el, errorEl, error);
    });

    // Clear error on input
    el.addEventListener('input', () => {
      if (el.classList.contains('error-field')) {
        const error = validators[key](el.value);
        showFieldError(el, errorEl, error);
      }
    });
  });

/* --- Submit --- */
form.addEventListener('submit', (e) => {
  e.preventDefault();

  let isValid = true;

  // Validate all fields
  Object.keys(fields).forEach(key => {
    const { el, errorEl } = fields[key];
    if (!el) return;
    const error = validators[key](el.value);
    if (error) isValid = false;
    showFieldError(el, errorEl, error);
  });

  // ❌ Stop if validation fails
  if (!isValid) {
    form.style.animation = 'none';
    requestAnimationFrame(() => {
      form.style.animation = 'formShake .4s ease';
    });
    return;
  }

  // 🔐 Invisible reCAPTCHA trigger
  if (!isVerified) {
    if (typeof grecaptcha !== "undefined") {
      grecaptcha.execute();
    } else {
      alert("reCAPTCHA not loaded");
    }
    return;
  }

  // reset after verification
  isVerified = false;

if (successMsg) {
  successMsg.textContent = "";
  successMsg.classList.remove('visible');
}

submitBtn.disabled = true;
submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Sending…';

const timeout = setTimeout(() => {
  if (submitBtn.disabled) {
    submitBtn.disabled = false;
    submitBtn.innerHTML = 'Send Message <i class="fa-solid fa-paper-plane"></i>';

    if (successMsg) {
      successMsg.textContent = "⚠️ Request timed out. Try again.";
      successMsg.classList.add('visible');
    }
  }
}, 8000);

// ✅ Anti-spam: Honeypot check
const honeypot = form.querySelector('[name="company"]');
if (honeypot && honeypot.value.trim() !== "") {
  return; // bot detected → silently stop
}

// 🚀 Send form
emailjs.sendForm(
  "service_u62oj03",
  "template_r3v0ino",
  form,
  "zRxMvoD84k-pTNJvS"
).then(() => {

  clearTimeout(timeout);
  submitBtn.disabled = false;
  submitBtn.innerHTML = 'Send Message <i class="fa-solid fa-paper-plane"></i>';

  // ✅ Reset reCAPTCHA after success
  if (typeof grecaptcha !== "undefined") {
    grecaptcha.reset();
  }

  if (successMsg) {
    successMsg.textContent = "✅ Message sent successfully!";
    successMsg.classList.add('visible');

    setTimeout(() => {
      successMsg.classList.remove('visible');
    }, 4000);
  }

  form.reset();

}).catch((err) => {

  clearTimeout(timeout);
  submitBtn.disabled = false;
  submitBtn.innerHTML = 'Send Message <i class="fa-solid fa-paper-plane"></i>';

  // ✅ Reset reCAPTCHA on failure too
  if (typeof grecaptcha !== "undefined") {
    grecaptcha.reset();
  }

  if (successMsg) {
    successMsg.textContent = "⚠️ Something went wrong. Try again later or email me directly.";
    successMsg.classList.add('visible');
  }

  console.error("EmailJS error:", err);

});


});

  /* Helper */
  function showFieldError(el, errorEl, message) {
    if (!el || !errorEl) return;
    if (message) {
      el.classList.add('error-field');
      errorEl.textContent = message;
    } else {
      el.classList.remove('error-field');
      errorEl.textContent = '';
    }
  }

  /* Add shake keyframes dynamically */
  const shakeStyle = document.createElement('style');
  shakeStyle.textContent = `
    @keyframes formShake {
      0%, 100% { transform: translateX(0); }
      20%       { transform: translateX(-8px); }
      40%       { transform: translateX(8px); }
      60%       { transform: translateX(-5px); }
      80%       { transform: translateX(5px); }
    }
  `;
  document.head.appendChild(shakeStyle);
}

/* ================================================================
   8. BACK TO TOP
================================================================ */
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ================================================================
   9. FOOTER — dynamic year
================================================================ */
function initFooterYear() {
  const el = document.getElementById('footerYear');
  if (el) el.textContent = new Date().getFullYear();
}

/* ================================================================
   10. HERO REVEAL — trigger immediately on load
================================================================ */
(function heroReveal() {
  // Hero elements are already set to opacity:0 via CSS.
  // We reveal them once the DOM is interactive so no observer needed.
  const heroRevealEls = document.querySelectorAll('#hero .reveal-up');

  // Small stagger driven by inline --delay CSS var (already set in HTML)
  heroRevealEls.forEach(el => {
    const delay = parseFloat(getComputedStyle(el).getPropertyValue('--delay')) || 0;
    setTimeout(() => el.classList.add('revealed'), delay * 1000 + 300);
  });
})();


(function() {
  emailjs.init("zRxMvoD84k-pTNJvS"); // replace
})();

function onSubmit(token) {
  console.log("reCAPTCHA triggered ✅", token);
  isVerified = true;
  window.recaptchaToken = token; // 👈 add this line
  document.getElementById("contactForm")
          .dispatchEvent(new Event("submit"));
}



/* ================================================================
   10. Star Falling Animation
================================================================ */

function initPremiumStars() {
  const canvas = document.getElementById("stars-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  let stars = [];
  let shootingStars = [];
  let w, h;
  let isTabActive = true; // ✅ fix tab switch issue

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  // ✅ detect tab visibility
  document.addEventListener("visibilitychange", () => {
    isTabActive = !document.hidden;
  });

  // ⭐ background stars
  function createStar() {
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      size: Math.random() * 1.3,
      opacity: Math.random(),
      twinkle: Math.random() * 0.02
    };
  }

  for (let i = 0; i < 90; i++) {
    stars.push(createStar());
  }

  // ☄️ shooting stars (UPDATED)
  function createShootingStar() {
    return {
      x: Math.random() * w,
      y: -50,                         // ✅ start above screen
      speed: Math.random() * 1.2 + 1, // ✅ slower = longer visible
      size: 3,
      trail: []
    };
  }

  function draw() {
    // ✅ pause rendering when tab inactive
    if (!isTabActive) {
      requestAnimationFrame(draw);
      return;
    }

    ctx.clearRect(0, 0, w, h);

    // ⭐ background stars
    stars.forEach(s => {
      s.opacity += s.twinkle;
      if (s.opacity <= 0 || s.opacity >= 1) s.twinkle *= -1;

      ctx.beginPath();
      ctx.fillStyle = `rgba(255,255,255,${s.opacity})`;
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // ☄️ shooting stars
    shootingStars.forEach((s, i) => {

      // store trail
      s.trail.push({ x: s.x, y: s.y });

      // longer trail
      if (s.trail.length > 35) {
        s.trail.shift();
      }

      // draw trail
      s.trail.forEach((p, index) => {
        const opacity = index / s.trail.length;

        ctx.beginPath();
        ctx.fillStyle = `rgba(129,140,248,${opacity * 0.6})`;
        ctx.arc(p.x, p.y, s.size * opacity, 0, Math.PI * 2);
        ctx.fill();
      });

      // bright head
      ctx.beginPath();
      ctx.fillStyle = "#ffffff";
      ctx.shadowBlur = 30;
      ctx.shadowColor = "#818cf8";
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // movement (slight angle)
      s.x += s.speed * 1.2;
      s.y += s.speed;

      // ✅ remove ONLY after leaving screen
      if (s.y > h + 50) {
        shootingStars.splice(i, 1);
      }
    });

    requestAnimationFrame(draw);
  }

  // ✅ controlled spawning (no burst issue)
  setInterval(() => {
    if (!isTabActive) return;

    if (Math.random() < 0.4) {
      shootingStars.push(createShootingStar());
    }
  }, 1800);

  draw();
}