import { jhipsterOptionTypes, jhipsterOptionValues, jhipsterQuotedOptionNames } from '../jhipster/application-options.js';

export type JDLApplicationOptionValue = string | number | boolean | undefined | never[] | Record<string, string>;
export type JDLApplicationOptionTypeValue = 'string' | 'integer' | 'boolean' | 'list' | 'quotedList';
export type JDLApplicationOptionType = { type: JDLApplicationOptionTypeValue };

export default class JDLApplicationDefinition {
  optionValues: Record<string, JDLApplicationOptionValue> = jhipsterOptionValues;
  optionTypes: Record<string, JDLApplicationOptionType> = jhipsterOptionTypes;
  quotedOptionNames: string[] = jhipsterQuotedOptionNames;

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
  doesOptionValueExist(name, value) {
    if (!this.doesOptionExist(name)) {
      return false;
    }
    const values = this.optionValues[name];
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
  doesOptionExist(optionName) {
    return !!optionName && optionName in this.optionTypes;
  }

  /**
   * Checks whether the corresponding option has a value that should be quoted in the JDL, like the jhipsterVersion
   * attribute.
   * @param {String} optionName - the name of the option to check.
   * @return {boolean} whether it should be quoted in the JDL.
   */
  shouldTheValueBeQuoted(optionName) {
    if (!optionName) {
      throw new Error('An option name has to be passed to know whether it is quoted.');
    }
    return this.quotedOptionNames.includes(optionName);
  }
}
