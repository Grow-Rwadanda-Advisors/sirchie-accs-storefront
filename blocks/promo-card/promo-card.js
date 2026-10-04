/**
 * Promo Card — Figma "Promotions Grid" cards (159:790).
 * One row: first cell the content (optional picture-only badge before the heading, the
 * heading, any text, list or rule, then a bold link as the call to action); optional second
 * cell an image. Variant "spotlight" centres the heading across the card and renders only
 * its bold words bold ("<strong>PRODUCT</strong> OF THE MONTH").
 * @param {Element} block The promo card block element
 */
export default function decorate(block) {
  const row = block.firstElementChild;
  if (!row) return;
  const [content, image] = row.children;

  if (content) {
    content.className = 'promo-card-content';
    const heading = content.querySelector(':scope > :is(h1, h2, h3, h4, h5, h6)');
    let title = heading;

    if (heading) {
      heading.classList.add('promo-card-heading');
      const badge = heading.previousElementSibling;
      if (badge?.querySelector('picture') && !badge.textContent.trim()) {
        title = document.createElement('div');
        badge.classList.add('promo-card-badge');
        heading.replaceWith(title);
        title.append(badge, heading);
      }
      title.classList.add('promo-card-title');
    }

    const cta = content.querySelector(':scope > .button-wrapper:last-child');
    const body = document.createElement('div');
    body.className = 'promo-card-body';
    [...content.children]
      .filter((child) => child !== title && child !== cta)
      .forEach((child) => body.append(child));

    if (title) title.after(body);
    else content.prepend(body);

    if (cta) {
      cta.classList.add('promo-card-cta');
      cta.querySelectorAll('a.button').forEach((link) => link.classList.add('button-chevron'));
    }
  }

  if (image) image.className = 'promo-card-image';
  block.replaceChildren(...row.children);
}
