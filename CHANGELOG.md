# Changelog

## 1.0.0-beta.4

- Fixed: on products which carry `additionalProperties`, a condition was evaluated before the
  fetched properties had arrived. The text could briefly show the wrong value and then change.
- Changed: `AVAILABILITY_STATE_OK` is imported from `@shopgate/engage/product` instead of reaching
  into `@shopgate/pwa-common-commerce` directly.

## 1.0.0-beta.3

- Added: `fallbackProperty`. The products a condition excludes from the replacement can now show the
  value of a property instead of the original text.

## 1.0.0-beta.2

- Fixed: property values delivered as a boolean were treated as not set, so `ifSet` never matched
  and `unlessSet` replaced the text on every product. A boolean `true` now becomes the value
  `"true"`, a boolean `false` counts as not set.

## 1.0.0-beta.1

- Initial version: replace the delivery time text on the product detail page with a static text or
  a property value - always, only when a property is set, or except when a property is set.
