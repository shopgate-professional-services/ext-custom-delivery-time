import {
  MODE_STATIC,
  MODE_PROPERTY,
  CONDITION_ALWAYS,
  CONDITION_IF_SET,
  CONDITION_UNLESS_SET,
} from '../constants';
import { getPropertyValue, isPropertySet, resolveDeliveryText } from './index';

const properties = [
  {
    label: 'Lieferzeit',
    value: '5-7 Werktage',
  },
  {
    label: 'Vorbestellung',
    value: 'ja',
  },
  {
    label: 'Leer',
    value: '',
  },
  {
    label: 'Zahl',
    value: 3,
  },
  {
    label: 'BoolWahr',
    value: true,
  },
  {
    label: 'BoolFalsch',
    value: false,
  },
  {
    label: 'Objekt',
    value: {
      deep: 1,
    },
  },
];

const baseSettings = {
  mode: MODE_STATIC,
  text: 'Lieferung in 2-3 Werktagen',
  property: '',
  conditionMode: CONDITION_ALWAYS,
  conditionProperty: '',
  conditionValues: [],
  fallbackProperty: '',
};

describe('getPropertyValue()', () => {
  it('should return the value of a matching property', () => {
    expect(getPropertyValue(properties, 'Lieferzeit')).toBe('5-7 Werktage');
  });

  it('should ignore surrounding whitespace in the configured label', () => {
    expect(getPropertyValue(properties, ' Lieferzeit ')).toBe('5-7 Werktage');
  });

  it('should stringify numeric values', () => {
    expect(getPropertyValue(properties, 'Zahl')).toBe('3');
  });

  it('should stringify a boolean true', () => {
    expect(getPropertyValue(properties, 'BoolWahr')).toBe('true');
  });

  it('should return null for a boolean false', () => {
    expect(getPropertyValue(properties, 'BoolFalsch')).toBeNull();
  });

  it('should return null for a value which is neither text, number nor boolean', () => {
    expect(getPropertyValue(properties, 'Objekt')).toBeNull();
  });

  it('should return null for an empty value', () => {
    expect(getPropertyValue(properties, 'Leer')).toBeNull();
  });

  it('should return null for an unknown property', () => {
    expect(getPropertyValue(properties, 'Unbekannt')).toBeNull();
  });

  it('should return null when the properties are not loaded', () => {
    expect(getPropertyValue(null, 'Lieferzeit')).toBeNull();
  });
});

describe('isPropertySet()', () => {
  it('should be true for a property with a value', () => {
    expect(isPropertySet(properties, 'Vorbestellung')).toBe(true);
  });

  it('should be false for a property with an empty value', () => {
    expect(isPropertySet(properties, 'Leer')).toBe(false);
  });

  it('should be false for an unknown property', () => {
    expect(isPropertySet(properties, 'Unbekannt')).toBe(false);
  });

  it('should respect configured values', () => {
    expect(isPropertySet(properties, 'Vorbestellung', ['ja'])).toBe(true);
    expect(isPropertySet(properties, 'Vorbestellung', ['nein'])).toBe(false);
  });
});

describe('resolveDeliveryText()', () => {
  describe('unknown properties', () => {
    it('should replace the text when no properties are needed', () => {
      expect(resolveDeliveryText(baseSettings, null)).toBe('Lieferung in 2-3 Werktagen');
    });

    it('should keep the original text when the text comes from a property', () => {
      const settings = {
        ...baseSettings,
        mode: MODE_PROPERTY,
        property: 'Lieferzeit',
      };

      expect(resolveDeliveryText(settings, null)).toBeNull();
    });

    it('should keep the original text when a condition needs to be evaluated', () => {
      const ifSet = {
        ...baseSettings,
        conditionMode: CONDITION_IF_SET,
        conditionProperty: 'Vorbestellung',
      };
      const unlessSet = {
        ...baseSettings,
        conditionMode: CONDITION_UNLESS_SET,
        conditionProperty: 'Sperrgut',
      };

      expect(resolveDeliveryText(ifSet, null)).toBeNull();
      expect(resolveDeliveryText(unlessSet, null)).toBeNull();
    });
  });

  describe('static text', () => {
    it('should replace the text', () => {
      expect(resolveDeliveryText(baseSettings, properties)).toBe('Lieferung in 2-3 Werktagen');
    });

    it('should keep the original text when no text is configured', () => {
      const settings = {
        ...baseSettings,
        text: '',
      };

      expect(resolveDeliveryText(settings, properties)).toBeNull();
    });
  });

  describe('text from a property', () => {
    const settings = {
      ...baseSettings,
      mode: MODE_PROPERTY,
      property: 'Lieferzeit',
    };

    it('should use the property value', () => {
      expect(resolveDeliveryText(settings, properties)).toBe('5-7 Werktage');
    });

    it('should keep the original text when the property is missing', () => {
      const unknownProperty = {
        ...settings,
        property: 'Unbekannt',
      };

      expect(resolveDeliveryText(unknownProperty, properties)).toBeNull();
    });
  });

  describe('condition ifSet', () => {
    const settings = {
      ...baseSettings,
      conditionMode: CONDITION_IF_SET,
      conditionProperty: 'Vorbestellung',
    };

    it('should replace the text when the property is set', () => {
      expect(resolveDeliveryText(settings, properties)).toBe('Lieferung in 2-3 Werktagen');
    });

    it('should keep the original text when the property is not set', () => {
      const unknownProperty = {
        ...settings,
        conditionProperty: 'Unbekannt',
      };

      expect(resolveDeliveryText(unknownProperty, properties)).toBeNull();
    });

    it('should keep the original text when the value does not match', () => {
      const otherValue = {
        ...settings,
        conditionValues: ['nein'],
      };

      expect(resolveDeliveryText(otherValue, properties)).toBeNull();
    });
  });

  describe('condition unlessSet', () => {
    const settings = {
      ...baseSettings,
      conditionMode: CONDITION_UNLESS_SET,
      conditionProperty: 'Sperrgut',
    };

    it('should replace the text when the property is not set', () => {
      expect(resolveDeliveryText(settings, properties)).toBe('Lieferung in 2-3 Werktagen');
    });

    it('should replace the text on a product without any properties', () => {
      expect(resolveDeliveryText(settings, [])).toBe('Lieferung in 2-3 Werktagen');
    });

    it('should keep the original text when the property is set', () => {
      const propertySet = {
        ...settings,
        conditionProperty: 'Vorbestellung',
      };

      expect(resolveDeliveryText(propertySet, properties)).toBeNull();
    });

    it('should keep the original text when the property is a boolean true', () => {
      const booleanFlag = {
        ...settings,
        conditionProperty: 'BoolWahr',
        conditionValues: ['true'],
      };

      expect(resolveDeliveryText(booleanFlag, properties)).toBeNull();
    });

    it('should replace the text when the property is a boolean false', () => {
      const booleanFlag = {
        ...settings,
        conditionProperty: 'BoolFalsch',
        conditionValues: ['true'],
      };

      expect(resolveDeliveryText(booleanFlag, properties)).toBe('Lieferung in 2-3 Werktagen');
    });
  });

  describe('fallback property for the excluded products', () => {
    const settings = {
      ...baseSettings,
      conditionMode: CONDITION_UNLESS_SET,
      conditionProperty: 'BoolWahr',
      conditionValues: ['true'],
      fallbackProperty: 'Lieferzeit',
    };

    it('should use the fallback value when the condition excludes the product', () => {
      expect(resolveDeliveryText(settings, properties)).toBe('5-7 Werktage');
    });

    it('should use the configured text when the condition does not exclude the product', () => {
      const notExcluded = {
        ...settings,
        conditionProperty: 'Sperrgut',
      };

      expect(resolveDeliveryText(notExcluded, properties)).toBe('Lieferung in 2-3 Werktagen');
    });

    it('should keep the original text when the fallback property is missing', () => {
      const unknownFallback = {
        ...settings,
        fallbackProperty: 'Unbekannt',
      };

      expect(resolveDeliveryText(unknownFallback, properties)).toBeNull();
    });

    it('should also work for a condition which requires the property to be set', () => {
      const ifSet = {
        ...settings,
        conditionMode: CONDITION_IF_SET,
        conditionProperty: 'Unbekannt',
        conditionValues: [],
      };

      expect(resolveDeliveryText(ifSet, properties)).toBe('5-7 Werktage');
    });

    it('should keep the original text when the properties are unknown', () => {
      expect(resolveDeliveryText(settings, null)).toBeNull();
    });

    describe('combined with a property text', () => {
      const propertyText = {
        ...settings,
        mode: MODE_PROPERTY,
        property: 'Vorbestellung',
      };

      it('should use the fallback value when the condition excludes the product', () => {
        expect(resolveDeliveryText(propertyText, properties)).toBe('5-7 Werktage');
      });

      it('should use the configured property when the condition does not exclude the product', () => {
        const notExcluded = {
          ...propertyText,
          conditionProperty: 'Sperrgut',
        };

        expect(resolveDeliveryText(notExcluded, properties)).toBe('ja');
      });
    });
  });

  describe('property text combined with a condition', () => {
    const settings = {
      ...baseSettings,
      mode: MODE_PROPERTY,
      property: 'Lieferzeit',
      conditionMode: CONDITION_IF_SET,
      conditionProperty: 'Vorbestellung',
    };

    it('should use the property value when the condition is met', () => {
      expect(resolveDeliveryText(settings, properties)).toBe('5-7 Werktage');
    });

    it('should keep the original text when the condition is not met', () => {
      const conditionNotMet = {
        ...settings,
        conditionProperty: 'Unbekannt',
      };

      expect(resolveDeliveryText(conditionNotMet, properties)).toBeNull();
    });
  });
});
