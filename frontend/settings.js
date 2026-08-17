// Resolved values from the generated frontend/config.json (destination: frontend). The file is
// written by the SDK per environment and therefore not part of the repository.
// eslint-disable-next-line import/no-unresolved
import config from './config.json';
import {
  MODE_STATIC,
  MODE_PROPERTY,
  CONDITION_ALWAYS,
  CONDITION_IF_SET,
  CONDITION_UNLESS_SET,
} from './constants';

const MODES = [MODE_STATIC, MODE_PROPERTY];
const CONDITION_MODES = [CONDITION_ALWAYS, CONDITION_IF_SET, CONDITION_UNLESS_SET];

/**
 * Turns a config value into a trimmed string.
 * @param {*} value The raw config value.
 * @returns {string}
 */
const toText = value => (typeof value === 'string' ? value.trim() : '');

/**
 * Turns a comma separated config value into a list of trimmed entries.
 * @param {*} value The raw config value.
 * @returns {string[]}
 */
const toList = value => toText(value)
  .split(',')
  .map(entry => entry.trim())
  .filter(Boolean);

/**
 * Falls back to a default when the configured value is not one of the supported ones. An admin
 * config value is only delivered once it has been saved in the Developer Center, so every key
 * needs a working fallback.
 * @param {*} value The raw config value.
 * @param {string[]} supported The supported values.
 * @param {string} fallback The value to use when the config value is not supported.
 * @returns {string}
 */
const toOneOf = (value, supported, fallback) => (
  supported.includes(toText(value)) ? toText(value) : fallback
);

export const settings = {
  mode: toOneOf(config.mode, MODES, MODE_STATIC),
  text: toText(config.text),
  property: toText(config.property),
  conditionMode: toOneOf(config.conditionMode, CONDITION_MODES, CONDITION_ALWAYS),
  conditionProperty: toText(config.conditionProperty),
  conditionValues: toList(config.conditionValues),
  fallbackProperty: toText(config.fallbackProperty),
};

/**
 * The extension only interferes with the product detail page when it is configured completely.
 * An incomplete configuration leaves the original delivery time text untouched.
 */
export const isEnabled = (
  (settings.mode === MODE_STATIC ? !!settings.text : !!settings.property) &&
  (settings.conditionMode === CONDITION_ALWAYS || !!settings.conditionProperty)
);
