/**
 * Roots & Flame — scroll, nav, reveal
 */
(function () {
  const nav = document.querySelector('.site-nav');
  const navLinks = document.querySelector('.nav-links');

  function onScroll() {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const toggle = document.querySelector('.nav-toggle');
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => navLinks.classList.toggle('open'));
    navLinks.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => navLinks.classList.remove('open'));
    });
  }

  const sections = document.querySelectorAll('section[id], header[id]');
  const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navAnchors.forEach((a) => {
          a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
        });
      });
    },
    { rootMargin: '-35% 0px -55% 0px', threshold: 0 }
  );
  sections.forEach((s) => spy.observe(s));

  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const reveals = document.querySelectorAll('.reveal');
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08 }
    );
    reveals.forEach((el) => obs.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('visible'));
  }

  const hero = document.querySelector('.m2-hero');
  if (hero) {
    let overlayDismissed = false;

    function dismissHeroOverlay() {
      if (overlayDismissed) return;
      overlayDismissed = true;
      hero.classList.add('overlay-dismissed');
      window.removeEventListener('touchstart', dismissHeroOverlay);
      window.removeEventListener('pointermove', dismissHeroOverlay);
      window.removeEventListener('mousemove', dismissHeroOverlay);
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      dismissHeroOverlay();
    } else {
      window.addEventListener('touchstart', dismissHeroOverlay, { passive: true });
      window.addEventListener('pointermove', dismissHeroOverlay, { passive: true });
      window.addEventListener('mousemove', dismissHeroOverlay, { passive: true });
    }
  }
})();
