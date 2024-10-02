/**
 * Copyright 2013-2024 the original author or authors from the JHipster project.
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
export function formatDateForChangelog(now: Date): string {
  const nowUTC = new Date(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    now.getUTCHours(),
    now.getUTCMinutes(),
    now.getUTCSeconds(),
  );
  const year = `${nowUTC.getFullYear()}`;

  let month = `${nowUTC.getMonth() + 1}`;
  if (month.length === 1) {
    month = `0${month}`;
  }

  let day = `${nowUTC.getDate()}`;
  if (day.length === 1) {
    day = `0${day}`;
  }

  let hour = `${nowUTC.getHours()}`;
  if (hour.length === 1) {
    hour = `0${hour}`;
  }

  let minute = `${nowUTC.getMinutes()}`;
  if (minute.length === 1) {
    minute = `0${minute}`;
  }

  let second = `${nowUTC.getSeconds()}`;
  if (second.length === 1) {
    second = `0${second}`;
  }

  return `${year}${month}${day}${hour}${minute}${second}`;
}

export function parseChangelog(changelogDate: string): Date {
  if (!changelogDate) {
    throw new Error('changelogDate is required.');
  }
  if (typeof changelogDate !== 'string') {
    throw new Error(`changelogDate ${changelogDate} must be a string.`);
  }
  if (changelogDate.length !== 14) {
    throw new Error(`changelogDate ${changelogDate} is not a valid changelogDate.`);
  }
  const zeroFallback = (val: string, fallback: string) => (/^0+$/.test(val) ? fallback : val);
  const year = zeroFallback(changelogDate.substring(0, 4), '2024');
  const month = zeroFallback(changelogDate.substring(4, 6), '01');
  const day = zeroFallback(changelogDate.substring(6, 8), '01');
  const formattedDate = `${year}-${month}-${day}T${changelogDate.substring(8, 10)}:${changelogDate.substring(10, 12)}:${changelogDate.substring(12, 14)}+00:00`;
  const parsedTimestamp = Date.parse(formattedDate);
  if (isNaN(parsedTimestamp)) {
    throw new Error(`changelogDate ${changelogDate} is not a valid date.`);
  }
  return new Date(parsedTimestamp);
}

/**
 * Parse creationTimestamp option
 * @returns representing the milliseconds elapsed since January 1, 1970, 00:00:00 UTC
 *                   obtained by parsing the given string representation of the creationTimestamp.
 */
export const parseCreationTimestamp = (creationTimestampOption: string): number | undefined => {
  let creationTimestamp;
  if (creationTimestampOption) {
    creationTimestamp = Date.parse(creationTimestampOption);
    if (!creationTimestamp) {
      return undefined;
    }
    if (creationTimestamp > new Date().getTime()) {
      throw new Error(`Creation timestamp should not be in the future: ${creationTimestampOption}.`);
    }
  }
  return creationTimestamp;
};
