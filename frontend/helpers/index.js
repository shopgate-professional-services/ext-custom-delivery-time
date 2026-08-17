import {
  MODE_PROPERTY,
  CONDITION_ALWAYS,
  CONDITION_IF_SET,
  CONDITION_UNLESS_SET,
} from '../constants';

/**
 * Reads the value of a product property. Properties consist of a label and a value. Shops deliver
 * the value in its native type, so a flag property can arrive as a boolean rather than a string.
 * A boolean false is treated like an empty value - a flag that exists on every product but is only
 * true on some would be useless as a condition otherwise.
 * @param {Object[]|null} properties The product properties.
 * @param {string} label The label of the wanted property.
 * @returns {string|null} The value, or null when the property is missing, empty or false.
 */
export const getPropertyValue = (properties, label) => {
  const wantedLabel = typeof label === 'string' ? label.trim() : '';

  if (!wantedLabel || !Array.isArray(properties)) {
    return null;
  }

  const property = properties.find(entry => (
    entry && typeof entry.label === 'string' && entry.label.trim() === wantedLabel
  ));

  if (!property) {
    return null;
  }

  const { value } = property;

  if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean') {
    return null;
  }

  if (value === false) {
    return null;
  }

  const text = `${value}`.trim();

  return text === '' ? null : text;
};

/**
 * Tells whether a property counts as "set". Without configured values every non empty value
 * counts, otherwise only the listed ones do.
 * @param {Object[]|null} properties The product properties.
 * @param {string} label The label of the property.
 * @param {string[]} [values] The values which count as "set".
 * @returns {boolean}
 */
export const isPropertySet = (properties, label, values = []) => {
  const value = getPropertyValue(properties, label);

  if (value === null) {
    return false;
  }

  if (values.length) {
    return values.includes(value);
  }

  return true;
};

/**
 * Determines the text which replaces the original delivery time text.
 * @param {Object} settings The extension settings.
 * @param {Object[]|null} properties The product properties. Null while they are unknown - either
 *   because they are still being fetched, or because the request for them failed.
 * @returns {string|null} The replacement text, or null to keep the original text. When a condition
 *   prevents the replacement, the value of the configured fallback property is used instead.
 */
export const resolveDeliveryText = (settings, properties) => {
  const {
    mode,
    text,
    property,
    conditionMode,
    conditionProperty,
    conditionValues,
    fallbackProperty,
  } = settings;

  /**
   * Properties are only needed for a property based text or for a condition. A static text which
   * is applied to every product must not depend on them - the properties come from a separate
   * request which may still be pending, or may have failed entirely.
   */
  const needsProperties = mode === MODE_PROPERTY || conditionMode !== CONDITION_ALWAYS;

  if (needsProperties && !Array.isArray(properties)) {
    return null;
  }

  if (conditionMode === CONDITION_IF_SET &&
    !isPropertySet(properties, conditionProperty, conditionValues)) {
    return getPropertyValue(properties, fallbackProperty);
  }

  if (conditionMode === CONDITION_UNLESS_SET &&
    isPropertySet(properties, conditionProperty, conditionValues)) {
    return getPropertyValue(properties, fallbackProperty);
  }

  if (mode === MODE_PROPERTY) {
    return getPropertyValue(properties, property);
  }

  return text || null;
};
