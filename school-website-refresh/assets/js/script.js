'use strict';

const header = document.querySelector('[data-header]');
const backTop = document.querySelector('[data-back-top]');

window.addEventListener('scroll', () => {
  const y = window.scrollY;
  header.classList.toggle('scrolled', y > 40);
  backTop.classList.toggle('show', y > 600);
}, { passive: true });

backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ---------- Mobile nav ---------- */
const nav = document.querySelector('[data-nav]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const overlay = document.querySelector('[data-nav-overlay]');

const closeNav = () => {
  nav.classList.remove('open');
  menuToggle.classList.remove('open');
  overlay.classList.remove('show');
  document.body.style.overflow = '';
  menuToggle.setAttribute('aria-expanded', 'false');
};

menuToggle.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  menuToggle.classList.toggle('open', isOpen);
  overlay.classList.toggle('show', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});

overlay.addEventListener('click', closeNav);
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeNav));
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeNav(); });

/* ---------- Reveal on scroll ---------- */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ---------- Animated counters ---------- */
const animateCount = el => {
  const target = parseFloat(el.dataset.count);
  const suffix = el.dataset.suffix || '';
  const duration = 1600;
  const start = performance.now();

  const tick = now => {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(target * eased).toLocaleString() + suffix;
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

const countObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCount(entry.target);
      countObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-count]').forEach(el => countObserver.observe(el));

/* ---------- Active nav link on scroll ---------- */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav a[href^="#"]');

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link =>
        link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`)
      );
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => sectionObserver.observe(s));

/* ---------- Hero image slider ---------- */
const track = document.querySelector('[data-slider-track]');
const dotsWrap = document.querySelector('[data-slider-dots]');

if (track && dotsWrap) {
  const slideCount = track.children.length;
  let current = 0;
  let timer = null;

  const go = i => {
    current = (i + slideCount) % slideCount;
    [...track.children].forEach((s, k) => s.classList.toggle('active', k === current));
    [...dotsWrap.children].forEach((d, k) => d.classList.toggle('active', k === current));
  };

  const restart = () => {
    if (timer) clearInterval(timer);
    timer = setInterval(() => go(current + 1), 7000);
  };

  for (let i = 0; i < slideCount; i++) {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    dot.addEventListener('click', () => { go(i); restart(); });
    dotsWrap.appendChild(dot);
  }

  const frame = track.closest('.hero-frame');
  frame.addEventListener('mouseenter', () => { clearInterval(timer); timer = null; });
  frame.addEventListener('mouseleave', restart);

  go(0);
  restart();
}
