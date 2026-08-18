## What it does

The extension replaces the delivery time line on the product detail page. Two decisions define its
behaviour, and they are set independently:

**1. Where the new text comes from.** Either a fixed text typed into the extension configuration
(the same for every product), or the value of a product property, which lets every product carry its
own delivery time from the shop.

**2. Which products it applies to.** Either all of them, or a subset selected by a product property:
only the products that carry a certain property, or all products except those. This is how a single
rule can treat, say, frozen goods differently from the rest of the assortment.

Products that a condition excludes normally keep the text the shop delivers. They can instead be
given a text of their own, taken from another property - see the last example below.

Whenever the extension has nothing to say - the configuration is incomplete, the properties of the
product have not been loaded yet, or the configured property does not exist on the product - the
line stays exactly as the shop delivered it. The extension never blanks it out.

## What a "property" is here

Products carry properties - the label/value pairs listed in the properties table on the product
detail page, for example `Material: Cotton` or `deliveryTime: 1-2 business days`. The extension
addresses them by their **label**, and the label has to match exactly; only leading and trailing
whitespace is ignored.

A property counts as **set** when it exists on the product and has a value that is not empty. If
`conditionValues` is filled, it additionally has to match one of the listed values.

Shops send property values in their native type, and flags often arrive as real booleans rather than
text. That case is covered: a boolean `true` is read as the value `"true"`, and a boolean `false`
counts as not set - so a flag that exists on every product and is only `true` on some works as a
condition out of the box. For flags that arrive as text, list the values that mean "on" in
`conditionValues`.

## Configuration

All values are set in the Shopgate Merchant Admin.

| Key | Type | Description |
|---|---|---|
| `mode` | select | Where the text comes from. `static` = the text from `text`, `property` = the value of the property named in `property`. |
| `text` | text | The static replacement text. Only used with `mode: static`. |
| `property` | text | Label of the property whose value is shown. Only used with `mode: property`. |
| `conditionMode` | select | Which products are affected. `always`, `ifSet` or `unlessSet`. |
| `conditionProperty` | text | Label of the property that decides whether the text is replaced. Only used with `ifSet` / `unlessSet`. |
| `conditionValues` | text | Optional comma separated list of values. When filled, the condition property only counts as set if its value is one of them. |
| `fallbackProperty` | text | Label of the property whose value is shown on the products the condition excludes. Only used with `ifSet` / `unlessSet`. |

## Examples

**One wording for the whole assortment.** The shop's delivery text is replaced everywhere:

```json
{
  "mode": "static",
  "text": "Delivered within 2-3 business days",
  "conditionMode": "always"
}
```

**Every product brings its own text.** The shop maintains a `Delivery time` property per product,
and the app shows its value instead of the standard line:

```json
{
  "mode": "property",
  "property": "Delivery time",
  "conditionMode": "always"
}
```

**Only a group of products gets a special text.** Products flagged as preorders get their own
wording; every other product keeps the shop's text:

```json
{
  "mode": "static",
  "text": "Preorder - ships from September 1st",
  "conditionMode": "ifSet",
  "conditionProperty": "Preorder"
}
```

**Everything except one group.** All products get the standard wording, but bulky goods are left
alone because their delivery time is genuinely different:

```json
{
  "mode": "static",
  "text": "Delivered within 2-3 business days",
  "conditionMode": "unlessSet",
  "conditionProperty": "Bulky goods"
}
```

**Everything except one group - and that group gets its own text.** Same as above, but instead of
falling back to whatever the shop sends, the excluded products show a delivery time the shop
maintains for exactly this purpose:

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

Every product shows the static text, except the ones flagged as `frozen: true` - those show the
value of their `deliveryTime` property. If that property is missing on a product, its original text
is kept.

The source of the text and the condition are independent, so they combine freely: `mode: property`
together with `unlessSet` and a `fallbackProperty` means "show each product's own delivery time,
except for the flagged ones, which show a different property".

`fallbackProperty` does not activate the extension on its own: `text` (with `mode: static`) or
`property` (with `mode: property`) always has to be filled as well. A configuration that only fills
`fallbackProperty` leaves the delivery time untouched on every product.
