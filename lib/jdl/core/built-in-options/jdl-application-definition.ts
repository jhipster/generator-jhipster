import type { JDLApplicationOptionType, JDLApplicationOptionTypeValue, JDLApplicationOptionValue } from '../types/parsing.ts';

export default class JDLApplicationDefinition {
  optionValues: Record<string, JDLApplicationOptionValue>;
  optionTypes: Record<string, JDLApplicationOptionType>;
  quotedOptionNames: string[];

  constructor({
    optionValues,
    optionTypes,
    quotedOptionNames,
  }: {
    optionValues: Record<string, JDLApplicationOptionValue>;
    optionTypes: Record<string, JDLApplicationOptionType>;
    quotedOptionNames: string[];
  }) {
    this.optionValues = optionValues;
    this.optionTypes = optionTypes;
    this.quotedOptionNames = quotedOptionNames;
  }

  /**
   * Returns the option's type, one of string, boolean, list or integer.
   * @param {String} optionName - the option's name.
   * @returns {string} the option's type.
   */
  getTypeForOption(optionName: string): JDLApplicationOptionTypeValue {
    if (!optionName) {
      throw new Error('A name has to be passed to get the option type.');
    }
    if (!this.optionTypes[optionName]) {
      throw new Error(`Unrecognised application option name: ${optionName}.`);
    }
    return this.optionTypes[optionName].type;
  }

  /**
   * Checks whether the option value exists for the passed option name.
   * @param {String} name - the option name.
   * @param {String|Boolean|Number} value - the option value.
   * @returns {Boolean} whether the option value exists for the name.
   */
  doesOptionValueExist(name: string, value: string | string[]): boolean {
    if (!this.doesOptionExist(name)) {
      return false;
    }
    const values: JDLApplicationOptionValue = this.optionValues[name];
    if (typeof values !== 'object' || Array.isArray(values)) {
      return true;
    }
    if (Array.isArray(value)) {
      return value.every(val => values[val] != null);
    }
    return values[value] != null;
  }

  /**
   * Checks whether the option's exists.
   * @param {String} optionName - the option's name.
   * @returns {Boolean} the option's existence.
   */
  doesOptionExist(optionName: string): boolean {
    return Boolean(optionName && optionName in this.optionTypes);
  }

  /**
   * Checks whether the corresponding option has a value that should be quoted in the JDL, like the jhipsterVersion
   * attribute.
   * @param {String} optionName - the name of the option to check.
   * @return {boolean} whether it should be quoted in the JDL.
   */
  shouldTheValueBeQuoted(optionName: string): boolean {
    if (!optionName) {
      throw new Error('An option name has to be passed to know whether it is quoted.');
    }
    return this.quotedOptionNames.includes(optionName);
  }
}
