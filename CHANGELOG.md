# Changelog

## 1.0.0

Initial release.

- Replaces the delivery time text on the product detail page (portal
  `product.availability`) with a static text or the value of a product property.
- The replacement can be limited by a condition: apply it to every product, only to products
  where a configured property is set, or to every product except those.
- Products excluded by the condition can show the value of a separate fallback property instead
  of the text the shop delivers.
- Property values are matched by label; values delivered as a boolean are supported, `false`
  counting as not set.
