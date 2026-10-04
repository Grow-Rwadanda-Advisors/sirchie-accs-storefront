import { fetchPlaceholders } from '../../scripts/commerce.js';

const AUTOPLAY_INTERVAL = 6000;
const DESKTOP_MEDIA = '(min-width: 900px)';
let instanceCount = 0;

/**
 * Authors may place two images in a slide's image cell: desktop first, mobile second.
 * They are merged into one art-directed picture so a device only downloads its own file.
 * @param {Element} cell The slide's image cell
 * @param {boolean} eager Whether this image is the page's LCP element
 */
function decorateImage(cell, eager) {
  const [desktop, mobile] = cell.querySelectorAll('picture');
  if (desktop && mobile) {
    const desktopImg = desktop.querySelector('img');
    const { pathname } = new URL(desktopImg.src, window.location.href);
    const format = pathname.split('.').pop();
    const src = (type) => `${pathname}?width=1400&format=${type}&optimize=medium`;
    mobile.prepend(document.createRange().createContextualFragment(`
      <source media="${DESKTOP_MEDIA}" type="image/webp" srcset="${src('webply')}">
      <source media="${DESKTOP_MEDIA}" srcset="${src(format)}">
    `));
    const mobileImg = mobile.querySelector('img');
    if (!mobileImg.alt) mobileImg.alt = desktopImg.alt;
    const wrapper = desktop.parentElement;
    desktop.remove();
    const emptyWrapper = !wrapper.children.length && !wrapper.textContent.trim();
    if (wrapper !== cell && emptyWrapper) wrapper.remove();
  }

  const img = cell.querySelector('img');
  if (eager && img) {
    img.loading = 'eager';
    img.fetchPriority = 'high';
  }
}

function setActiveSlide(block, index) {
  block.dataset.activeSlide = index;
  block.querySelectorAll('.hero-carousel-slide').forEach((slide, i) => {
    const active = i === index;
    slide.setAttribute('aria-hidden', String(!active));
    slide.querySelectorAll('a').forEach((link) => {
      if (active) link.removeAttribute('tabindex');
      else link.setAttribute('tabindex', '-1');
    });
  });
  block.querySelectorAll('.hero-carousel-dot').forEach((dot, i) => {
    dot.setAttribute('aria-current', String(i === index));
  });
}

function showSlide(block, index) {
  const slides = block.querySelectorAll('.hero-carousel-slide');
  const target = (index + slides.length) % slides.length;
  const track = block.querySelector('.hero-carousel-slides');
  track.scrollTo({ left: slides[target].offsetLeft, behavior: 'smooth' });
}

/**
 * Groups what precedes the slide heading with it, as in Figma: a picture-only paragraph
 * becomes the badge on the left; text paragraphs become the eyebrow above the title.
 * @param {Element} content The slide's content cell
 */
function decorateContent(content) {
  const heading = content.querySelector(':scope > :is(h1, h2, h3, h4, h5, h6)');
  if (heading) {
    const children = [...content.children];
    const leading = children.slice(0, children.indexOf(heading));
    const head = document.createElement('div');
    head.className = 'hero-carousel-head';
    const titles = document.createElement('div');
    titles.className = 'hero-carousel-titles';

    leading.forEach((node) => {
      if (node.querySelector('picture') && !node.textContent.trim()) {
        node.classList.add('hero-carousel-badge');
        head.append(node);
      } else {
        node.classList.add('hero-carousel-eyebrow');
        titles.append(node);
      }
    });

    heading.replaceWith(head);
    titles.append(heading);
    head.append(titles);
  }

  content.querySelectorAll('a.button').forEach((link) => link.classList.add('button-chevron'));
}

/**
 * Hero Carousel — Figma 200:2108. Each block row is one slide: first cell the image (or a
 * desktop image then a mobile image), second cell the content (badge, eyebrow, heading,
 * text, CTA).
 * @param {Element} block The hero carousel block element
 */
export default async function decorate(block) {
  instanceCount += 1;
  const id = `hero-carousel-${instanceCount}`;
  const rows = [...block.querySelectorAll(':scope > div')];
  const placeholders = await fetchPlaceholders();

  block.id = id;
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', placeholders.carousel || 'Carousel');

  const track = document.createElement('ul');
  track.className = 'hero-carousel-slides';

  rows.forEach((row, index) => {
    const [image, content] = row.children;
    const slide = document.createElement('li');
    slide.className = 'hero-carousel-slide';
    slide.id = `${id}-slide-${index}`;
    slide.dataset.index = index;
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-roledescription', placeholders.slide || 'Slide');

    // content before image so reading order matches the visual order
    if (content) {
      content.className = 'hero-carousel-content';
      decorateContent(content);
      slide.append(content);
    }
    if (image) {
      image.className = 'hero-carousel-image';
      // the first slide's photo is the page's LCP element
      decorateImage(image, index === 0);
      slide.append(image);
    }

    const heading = slide.querySelector('h1, h2, h3, h4, h5, h6');
    if (heading?.id) slide.setAttribute('aria-labelledby', heading.id);

    track.append(slide);
    row.remove();
  });

  block.append(track);
  setActiveSlide(block, 0);
  if (rows.length < 2) return;

  const controls = document.createElement('nav');
  controls.className = 'hero-carousel-controls';
  const controlsLabel = placeholders.carouselSlideControls || 'Carousel Slide Controls';
  controls.setAttribute('aria-label', controlsLabel);
  const dots = document.createElement('ol');
  dots.className = 'hero-carousel-dots';
  rows.forEach((_, index) => {
    const item = document.createElement('li');
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'hero-carousel-dot';
    dot.setAttribute('aria-controls', `${id}-slide-${index}`);
    const showLabel = placeholders.showSlide || 'Show Slide';
    dot.setAttribute('aria-label', `${showLabel} ${index + 1} ${placeholders.of || 'of'} ${rows.length}`);
    dot.addEventListener('click', () => showSlide(block, index));
    item.append(dot);
    dots.append(item);
  });
  controls.append(dots);
  block.append(controls);
  setActiveSlide(block, 0);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) setActiveSlide(block, Number(entry.target.dataset.index));
    });
  }, { root: track, threshold: 0.5 });
  track.querySelectorAll('.hero-carousel-slide').forEach((slide) => observer.observe(slide));

  // autoplay pauses for pointer, keyboard focus, hidden tabs and reduced-motion users
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let paused = false;
  block.addEventListener('mouseenter', () => { paused = true; });
  block.addEventListener('mouseleave', () => { paused = false; });
  block.addEventListener('focusin', () => { paused = true; });
  block.addEventListener('focusout', (e) => {
    if (!block.contains(e.relatedTarget)) paused = false;
  });
  setInterval(() => {
    if (paused || reducedMotion.matches || document.hidden) return;
    showSlide(block, Number(block.dataset.activeSlide || 0) + 1);
  }, AUTOPLAY_INTERVAL);
}
