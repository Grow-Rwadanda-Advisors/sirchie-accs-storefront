import SearchResults from '@dropins/storefront-product-discovery/containers/SearchResults.js';
import { render as provider } from '@dropins/storefront-product-discovery/render.js';
import { search, fetchGraphQl } from '@dropins/storefront-product-discovery/api.js';
import { Button, provider as UI } from '@dropins/tools/components.js';
import * as cartApi from '@dropins/storefront-cart/api.js';
import { tryRenderAemAssetsImage } from '@dropins/tools/lib/aem/assets.js';
import { readBlockConfig } from '../../scripts/aem.js';
import { fetchPlaceholders, getProductLink, getProductSku } from '../../scripts/commerce.js';
import '../../scripts/initializers/search.js';

let instanceCount = 0;

/**
 * SKUs linked to the current product page's product (related, upsell or crosssell).
 * @param {string} linkType The product link type
 * @returns {Promise<string[]>} Linked SKUs, empty when there are none
 */
async function fetchLinkedSkus(linkType) {
  const sku = getProductSku();
  if (!sku) return [];
  const { data } = await fetchGraphQl(
    `query ($sku: String!, $type: String!) {
      products(skus: [$sku]) { links(linkTypes: [$type]) { product { sku } } }
    }`,
    { variables: { sku, type: linkType } },
  );
  return (data?.products?.[0]?.links ?? []).map((link) => link.product?.sku).filter(Boolean);
}

/**
 * Featured Products — Figma 125:516. Key/value block:
 * Title, Subtitle, Count (products to show), optional Category (category path) and
 * optional Source (related, upsell or crosssell: the links of the product being viewed,
 * for the Related Products section of the product page).
 * Products come from the catalog through the product discovery drop-in, so the cards
 * match those on listing and search pages.
 * @param {Element} block The featured products block element
 */
export default async function decorate(block) {
  instanceCount += 1;
  const scope = `featured-products-${instanceCount}`;
  const config = readBlockConfig(block);
  const pageSize = Number(config.count) || 8;
  const labels = await fetchPlaceholders();

  // the section only exists on a product page with linked products
  let linkedSkus;
  if (config.source) {
    linkedSkus = await fetchLinkedSkus(config.source).catch(() => []);
    if (!linkedSkus.length) {
      (block.closest('.section') || block).remove();
      return;
    }
  }

  // products with options are configured on the product page, as on the listing page
  const requiresPdpConfiguration = (product) => product.typename === 'ComplexProductView'
    || product.attributes?.some((attr) => attr.name === 'ac_giftcard');

  const addToCartButton = (product) => {
    const wrapper = document.createElement('div');
    const label = labels.Global?.AddProductToCart || 'Add to Cart';
    const props = {
      'aria-label': `${label} ${product.name || product.sku}`,
      children: label,
      variant: 'primary',
    };
    if (requiresPdpConfiguration(product)) {
      UI.render(Button, { ...props, href: getProductLink(product.urlKey, product.sku) })(wrapper);
    } else {
      UI.render(Button, {
        ...props,
        disabled: !product.inStock,
        onClick: () => cartApi.addProductsToCart([{ sku: product.sku, quantity: 1 }]),
      })(wrapper);
    }
    return wrapper;
  };

  const header = document.createElement('div');
  header.className = 'featured-products-header';
  const heading = document.createElement('h2');
  heading.textContent = config.title || 'Featured Products';
  header.append(heading);
  if (config.subtitle) {
    const subtitle = document.createElement('p');
    subtitle.className = 'featured-products-subtitle';
    subtitle.textContent = config.subtitle;
    header.append(subtitle);
  }

  const results = document.createElement('div');
  results.className = 'featured-products-list';

  block.replaceChildren(header, results);

  provider.render(SearchResults, {
    scope,
    routeProduct: (product) => getProductLink(product.urlKey, product.sku),
    slots: {
      // Figma card: product name over a "SKU: <sku>" line
      ProductName: (ctx) => {
        const { product } = ctx;
        const name = document.createElement('a');
        name.className = 'featured-products-name';
        name.href = getProductLink(product.urlKey, product.sku);
        name.textContent = product.name || product.sku;
        const sku = document.createElement('p');
        sku.className = 'featured-products-sku';
        sku.textContent = `SKU: ${product.sku}`;
        const group = document.createElement('div');
        group.append(name, sku);
        ctx.replaceWith(group);
      },
      ProductActions: (ctx) => {
        const actions = document.createElement('div');
        actions.className = 'product-discovery-product-actions';
        const button = addToCartButton(ctx.product);
        button.className = 'product-discovery-product-actions__add-to-cart';
        actions.append(button);
        ctx.replaceWith(actions);
      },
      ProductImage: (ctx) => {
        const { product, defaultImageProps } = ctx;
        const wrapper = document.createElement('a');
        wrapper.href = getProductLink(product.urlKey, product.sku);
        wrapper.setAttribute('aria-label', product.name || product.sku);
        tryRenderAemAssetsImage(ctx, {
          alias: product.sku,
          imageProps: defaultImageProps,
          wrapper,
          params: { width: defaultImageProps.width, height: defaultImageProps.height },
        });
      },
    },
  })(results);

  const filter = [{ attribute: 'visibility', in: ['Catalog', 'Catalog, Search'] }];
  if (config.category) filter.push({ attribute: 'categoryPath', eq: config.category });
  if (linkedSkus) filter.push({ attribute: 'sku', in: linkedSkus });

  await search({ phrase: config.phrase || '', pageSize, filter }, { scope })
    .catch(() => { block.classList.add('featured-products--error'); });
}
