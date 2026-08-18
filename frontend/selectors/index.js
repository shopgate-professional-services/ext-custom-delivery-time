import { createSelector } from 'reselect';
import { getProductDataById, getProductPropertiesUnfiltered } from '@shopgate/engage/product';

/**
 * Collects the properties of a product. Two sources are merged:
 *  - the properties fetched via shopgate.catalog.getProductProperties.v1 (unfiltered, so that the
 *    theme side productPropertiesFilter setting cannot hide a property from this extension)
 *  - additionalProperties on the product data, which other extensions can add via a backend step
 *    hooked into getProducts / getProductsByIds / getProduct :afterFetchProducts. Both sources are
 *    read for the selected variant, so a backend extension has to supply the variants as well
 *    (ext-products-properties reads them from the base product instead).
 *
 * Returns null until the fetched properties have arrived - that state is deliberately different
 * from an empty array, which means "loaded, but the product has no properties". The product data
 * alone is not enough to consider them loaded: it usually arrives before the properties do, so
 * evaluating a condition against additionalProperties only would judge a product by half its
 * properties and show a text which flips as soon as the rest arrives.
 * @returns {Function}
 */
export const makeGetProperties = () => createSelector(
  getProductDataById,
  getProductPropertiesUnfiltered,
  (productData, productProperties) => {
    if (productProperties === null) {
      return null;
    }

    const { additionalProperties } = productData || {};

    const properties = [
      ...(Array.isArray(additionalProperties) ? additionalProperties : []),
      ...productProperties,
    ].filter(property => property && typeof property.label === 'string');

    // Remove duplicates. Properties from additionalProperties win. Labels are compared trimmed,
    // the same way the helpers match a configured label against them.
    return properties.filter((property, index) => (
      index === properties.findIndex(({ label }) => label.trim() === property.label.trim())
    ));
  }
);
