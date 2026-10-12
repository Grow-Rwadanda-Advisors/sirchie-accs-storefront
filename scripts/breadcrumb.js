import { rootLink } from './commerce.js';

/**
 * Builds the Home > ... > current bar used on product and category pages
 * (Figma 212:2246). Styles live in styles/lazy-styles.css under .breadcrumb.
 * The bar goes at the top of the block's section, above any authored heading.
 * @param {Element} block The block the bar belongs to
 * @param {{ name: string, path: string }[]} trail Ancestors first, current page last
 * @param {boolean} [linkLast] Link the last crumb too (product pages: it is the category)
 * @returns {Element|null} The nav element, or null when there is no trail
 */
export default function buildBreadcrumb(block, trail, linkLast = false) {
  if (!trail?.length || document.querySelector('main .breadcrumb')) return null;
  const nav = document.createElement('nav');
  nav.className = 'breadcrumb';
  nav.setAttribute('aria-label', 'Breadcrumb');
  const list = document.createElement('ol');
  const home = document.createElement('li');
  home.innerHTML = `<a href="${rootLink('/')}">Home</a>`;
  list.append(home);
  trail.forEach((crumb, i) => {
    const item = document.createElement('li');
    const last = i === trail.length - 1;
    if (last) item.setAttribute('aria-current', 'page');
    if (last && !linkLast) {
      item.textContent = crumb.name;
    } else {
      const link = document.createElement('a');
      link.href = rootLink(`/${crumb.path}`);
      link.textContent = crumb.name;
      item.append(link);
    }
    list.append(item);
  });
  nav.append(list);
  (block.closest('.section') || block).prepend(nav);
  return nav;
}
