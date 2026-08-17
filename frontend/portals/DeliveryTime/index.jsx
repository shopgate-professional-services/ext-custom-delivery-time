import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { Availability as AvailabilityText } from '@shopgate/engage/components';
import { AVAILABILITY_STATE_OK } from '@shopgate/engage/product';
import { useCurrentProduct } from '@shopgate/engage/core';
import { makeGetProperties } from '../../selectors';
import { settings, isEnabled } from '../../settings';
import { resolveDeliveryText } from '../../helpers';

/**
 * Replaces the delivery time text on the product detail page.
 *
 * The component is registered on the product.availability portal, which is an override portal.
 * The original content arrives as children - rendering it is how the component stays out of the
 * way whenever no rule applies.
 * @param {Object} props The component props.
 * @param {JSX.Element} [props.children] The original content of the portal.
 * @param {Object} [props.availability] The availability passed along by the portal.
 * @returns {React.ReactNode} The replacement text, or the original content of the portal.
 */
const DeliveryTime = ({ children, availability }) => {
  // The product context has no default value, so it is undefined outside of a product page. A
  // throw here would take down the whole portal - including the original text - via the error
  // boundary of the Portal component.
  const { productId, variantId } = useCurrentProduct() || {};
  const getProperties = useMemo(makeGetProperties, []);

  // On a variant product the PDP fetches product data and properties for the variant.
  const selectorProps = useMemo(() => ({
    productId: variantId || productId,
  }), [productId, variantId]);

  const properties = useSelector(state => getProperties(state, selectorProps));

  if (!isEnabled) {
    return children;
  }

  const text = resolveDeliveryText(settings, properties);

  if (text === null) {
    return children;
  }

  const { state = AVAILABILITY_STATE_OK } = availability || {};

  return (
    <AvailabilityText
      text={text}
      state={state}
      showWhenAvailable
    />
  );
};

DeliveryTime.propTypes = {
  availability: PropTypes.shape(),
  children: PropTypes.node,
};

DeliveryTime.defaultProps = {
  availability: null,
  children: null,
};

// No memo() here - the Portal component rebuilds the props on every render and spreads a freshly
// created children element into them, so the props identity always changes.
export default DeliveryTime;
