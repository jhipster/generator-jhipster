/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @private
 * Filter Number
 *
 * @param {string} input - input to filter
 * @param isSigned - flag indicating whether to check for signed number or not
 * @param isDecimal - flag indicating whether to check for decimal number or not
 * @returns {number} parsed number if valid input; <code>NaN</code> otherwise
 */
const filterNumber = (input, isSigned, isDecimal) => {
  const signed = isSigned ? '(\\-|\\+)?' : '';
  const decimal = isDecimal ? '(\\.[0-9]+)?' : '';
  const regex = new RegExp(`^${signed}([0-9]+${decimal})$`);

  if (regex.test(input)) return Number(input);

  return NaN;
};

/**
 * @private
 * @param {any} input input
 * @returns {boolean} true if input is number; false otherwise
 */
const isNumber = input => {
  return !isNaN(filterNumber(input));
};

/**
 * @private
 * @param {any} input input
 * @returns {boolean} true if input is a signed number; false otherwise
 */
const isSignedNumber = input => {
  return !isNaN(filterNumber(input, true));
};

/**
 * @private
 * @param {any} input input
 * @returns {boolean} true if input is a signed decimal number; false otherwise
 */
const isSignedDecimalNumber = input => {
  return !isNaN(filterNumber(input, true, true));
};

export { isNumber, isSignedNumber, isSignedDecimalNumber };
