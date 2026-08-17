# Shopgate Connect - Custom Delivery Time

Makes the delivery time text on the product detail page configurable. The text can be replaced by a
static text or by the value of a product property - either always, only when a certain property is
set, or always except when a certain property is set.

Frontend only extension: no backend steps, no pipelines.

## Configuration

All values are set in the Shopgate Merchant Admin.

| Key | Type | Description |
|---|---|---|
| `mode` | select | `static` = text from `text`, `property` = value of the property named in `property`. |
| `text` | text | The static replacement text. Only used with `mode: static`. |
| `property` | text | Label of the property whose value is shown. Only used with `mode: property`. |
| `conditionMode` | select | `always`, `ifSet` or `unlessSet`. |
| `conditionProperty` | text | Label of the property that decides whether the text is replaced. Only used with `ifSet` / `unlessSet`. |
| `conditionValues` | text | Optional comma separated list of values for the condition. |
| `fallbackProperty` | text | Label of the property whose value is used on the products the condition excludes. Only used with `ifSet` / `unlessSet`. |

A property counts as **set** when it exists on the product and has a non empty value. When
`conditionValues` is filled, it additionally only counts as set when its value matches one of the
entries.

Property labels are matched exactly, only surrounding whitespace is ignored.

Shops deliver property values in their native type. Booleans are supported: `true` becomes the
value `"true"`, while `false` counts as not set - a flag that exists on every product and is only
`true` on some therefore works as a condition. For flags delivered as text, list the values that
mean "on" in `conditionValues`.

### The four use cases

Static text:

```json
{
  "mode": "static",
  "text": "Delivered within 2-3 business days",
  "conditionMode": "always"
}
```

Text from a property:

```json
{
  "mode": "property",
  "property": "Delivery time",
  "conditionMode": "always"
}
```

Only replace when a property is set:

```json
{
  "mode": "static",
  "text": "Preorder - ships from September 1st",
  "conditionMode": "ifSet",
  "conditionProperty": "Preorder"
}
```

Always replace except when a property is set:

```json
{
  "mode": "static",
  "text": "Delivered within 2-3 business days",
  "conditionMode": "unlessSet",
  "conditionProperty": "Bulky goods"
}
```

Both axes can be combined, e.g. text from a property, but only on products where the condition
property is set.

### A different text for the excluded products

Without `fallbackProperty`, the products a condition excludes keep the text the shop delivers - which
is empty in shops that do not fill the stock info. `fallbackProperty` gives those products a text of
their own:

```json
{
  "mode": "static",
  "text": "Delivered within 2-3 business days",
  "conditionMode": "unlessSet",
  "conditionProperty": "frozen",
  "conditionValues": "true",
  "fallbackProperty": "deliveryTime"
}
```

Every product gets the static text, except the ones flagged as `frozen: true` - those show the value
of their `deliveryTime` property. When that property is missing or empty on a product, the original
text is kept.

`fallbackProperty` does not activate the extension on its own: `text` (with `mode: static`) or
`property` (with `mode: property`) always has to be filled as well. A configuration that only fills
`fallbackProperty` leaves the delivery time untouched on every product.
