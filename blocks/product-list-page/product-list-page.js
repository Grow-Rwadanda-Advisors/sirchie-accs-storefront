import { readBlockConfig } from '../../scripts/aem.js';

/**
 * Category and search results page. The block shows its loading frame at once and
 * pulls in the product discovery drop-in afterwards (see render.js), so the rest of
 * the page is not blank while the catalog answers.
 * @param {Element} block The product list block
 */
export default async function decorate(block) {
  // the authored rows are replaced by the frame, so the config is kept on the block
  block.dataset.config = JSON.stringify(readBlockConfig(block));
  block.classList.add('product-list-page--loading');
  block.innerHTML = `
    <div class="search__wrapper">
      <div class="search__result-info" role="status" aria-live="polite"></div>
      <div class="search__product-list"></div>
    </div>
  `;
  import('./render.js')
    .then(({ default: render }) => render(block))
    .catch((e) => {
      block.classList.remove('product-list-page--loading');
      console.error('Error loading the product list', e);
    });
}
