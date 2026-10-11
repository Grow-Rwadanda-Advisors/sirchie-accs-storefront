import { fetchGraphQl } from '@dropins/storefront-product-discovery/api.js';
import decorateFeaturedProducts from '../featured-products/featured-products.js';
import { getProductSku } from '../../scripts/commerce.js';
import { loadCSS } from '../../scripts/aem.js';
import '../../scripts/initializers/search.js';

/**
 * SKUs linked to the product being viewed.
 * @param {string} sku The viewed product
 * @param {string} linkType related, upsell or crosssell
 * @returns {Promise<string[]>} Linked SKUs, empty when there are none
 */
async function fetchLinkedSkus(sku, linkType) {
  const { data } = await fetchGraphQl(
    `query ($sku: String!, $type: String!) {
      products(skus: [$sku]) { links(linkTypes: [$type]) { product { sku } } }
    }`,
    { variables: { sku, type: linkType } },
  );
  return (data?.products?.[0]?.links ?? []).map((link) => link.product?.sku).filter(Boolean);
}

/**
 * Related Products — the product page section under the description (Figma 347:1348).
 * Key/value block: Title, optional Link type (related, upsell or crosssell; default related).
 * Shows the products linked to the viewed product in Commerce, as featured-products cards.
 * The section is removed when the product has no links.
 * @param {Element} block The related products block element
 */
export default async function decorate(block) {
  const sku = getProductSku();
  const linkType = block.textContent.match(/link type\s+(\w+)/i)?.[1]?.toLowerCase() || 'related';
  const skus = sku ? await fetchLinkedSkus(sku, linkType).catch(() => []) : [];
  if (!skus.length) {
    (block.closest('.section') || block).remove();
    return;
  }
  block.classList.add('featured-products');
  await Promise.all([
    loadCSS(`${window.hlx.codeBasePath}/blocks/featured-products/featured-products.css`),
    decorateFeaturedProducts(block, { skus }),
  ]);
}
