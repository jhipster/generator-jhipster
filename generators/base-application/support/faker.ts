/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
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
import { Faker, type LocaleDefinition, type Randomizer, base, en, generateMersenne53Randomizer } from '@faker-js/faker';
import Randexp from 'randexp';
import { types as TokenType } from 'ret';

import { languageToFakerLanguage } from '../../languages/support/languages.ts';

/** The tokens of `ret`, the parser of randexp, used to draw a value within a length. */
type Token = {
  type: number;
  stack?: Token[];
  options?: Token[][];
  remember?: boolean;
  groupNumber?: number;
  followedBy?: boolean;
  notFollowedBy?: boolean;
  min?: number;
  max?: number;
  value?: Token | number;
};

type LengthRange = [min: number, max: number];

class RandexpWithFaker extends Randexp {
  faker: Faker;
  declare tokens: Token;
  declare _gen: (token: Token, groups: (string | null)[]) => string;
  declare _randSelect: <T>(array: T[]) => T;
  /** Range of lengths each token can generate. */
  private readonly ranges = new WeakMap<Token, LengthRange>();
  /** The groups being measured, a back reference inside its own group not measured. */
  private readonly measuring = new Set<Token>();
  /** The groups a back reference refers to, by their number less one: in the order of their opening parenthesis. */
  private groupsByNumber?: Token[];

  constructor(regexp: string | RegExp, flags: string | undefined, faker: Faker) {
    super(regexp, flags);
    this.max = 5;
    this.faker = faker;
    if (this.faker === undefined) {
      throw new Error('Faker is required');
    }
    // In order to have consistent results with RandExp, the RNG is seeded.
    this.randInt = (from: number, to?: number): number => faker.number.int({ min: from, max: to });
  }

  /**
   * Generates a value, of a length within `min` and `max` when given.
   * Each choice (an option, a repetition count, the length of each part of a sequence) is drawn among those that keep the
   * value within them. Without a choice limited by them, the value is the one of randexp.
   * A group takes the length of its back references after it in the same sequence, which then have the length it got. A
   * back reference elsewhere (in a repetition, or to a group inside another one) is only known to be of a length of its
   * group, and one inside its own group is not measured; lookaheads are ignored, as in randexp: the value may not be within
   * the length, or not match them.
   */
  override gen(length?: { min?: number; max?: number }): string {
    if (!length) {
      return super.gen();
    }
    const [tokensMin, tokensMax] = this.lengthRange(this.tokens);
    const lo = Math.max(length.min ?? 0, tokensMin);
    const hi = Math.min(length.max ?? Infinity, tokensMax);
    return lo > hi ? super.gen() : this.genWithin(this.tokens, [], lo, hi);
  }

  private lengthRange(token: Token): LengthRange {
    let range = this.ranges.get(token);
    if (!range) {
      this.measuring.add(token);
      range = this.computeLengthRange(token);
      this.measuring.delete(token);
      this.ranges.set(token, range);
    }
    return range;
  }

  private rememberedGroups(): Token[] {
    if (!this.groupsByNumber) {
      const groups: Token[] = [];
      const visit = (token: Token) => {
        if (token.type === TokenType.GROUP && token.remember) {
          groups.push(token);
        }
        for (const stack of token.options ?? (token.stack ? [token.stack] : [])) {
          stack.forEach(visit);
        }
        if (token.type === TokenType.REPETITION) {
          visit(token.value as Token);
        }
      };
      visit(this.tokens);
      this.groupsByNumber = groups;
    }
    return this.groupsByNumber;
  }

  private computeLengthRange(token: Token): LengthRange {
    switch (token.type) {
      case TokenType.ROOT:
      case TokenType.GROUP: {
        if (token.followedBy || token.notFollowedBy) {
          return [0, 0];
        }
        const ranges = (token.options ?? [token.stack!]).map(stack => this.stackLengthRange(stack));
        return [Math.min(...ranges.map(([min]) => min)), Math.max(...ranges.map(([, max]) => max))];
      }
      case TokenType.POSITION:
        return [0, 0];
      case TokenType.SET:
      case TokenType.CHAR:
        return [1, 1];
      case TokenType.REPETITION: {
        const [min, max] = this.lengthRange(token.value as Token);
        // An item that is always empty, like `(?:)*`, has no length however many times it is repeated.
        return [token.min! * min, token.max === 0 || max === 0 ? 0 : token.max! * max];
      }
      case TokenType.REFERENCE: {
        const group = this.rememberedGroups()[(token.value as number) - 1];
        return group && !this.measuring.has(group) ? this.lengthRange(group) : [0, Infinity];
      }
      default:
        return [0, Infinity];
    }
  }

  private stackLengthRange(stack: Token[]): LengthRange {
    let min = 0;
    let max = 0;
    for (const token of stack) {
      const [tokenMin, tokenMax] = this.lengthRange(token);
      min += tokenMin;
      max += tokenMax;
    }
    return [min, max];
  }

  /** Average length of a token generated without a length, a repetition without a bound having up to `max` more items. */
  private averageLength(token: Token): number {
    if (token.type === TokenType.REPETITION) {
      const maxCount = token.max === Infinity ? token.min! + this.max : token.max!;
      return ((token.min! + maxCount) / 2) * this.averageLength(token.value as Token);
    }
    if (token.type === TokenType.ROOT || token.type === TokenType.GROUP) {
      if (token.followedBy || token.notFollowedBy) {
        return 0;
      }
      const stacks = token.options ?? [token.stack!];
      const total = stacks.reduce((sum, stack) => sum + stack.reduce((length, item) => length + this.averageLength(item), 0), 0);
      return total / stacks.length;
    }
    const [min, max] = this.lengthRange(token);
    return max === Infinity ? min + this.max / 2 : (min + max) / 2;
  }

  private genWithin(token: Token, groups: (string | null)[], lo: number, hi: number): string {
    if (token.type === TokenType.ROOT || token.type === TokenType.GROUP) {
      if (token.followedBy || token.notFollowedBy) {
        return '';
      }
      if (token.remember && token.groupNumber === undefined) {
        token.groupNumber = this.rememberedGroups().indexOf(token);
      }
      let stack = token.stack!;
      if (token.options) {
        const fitting = token.options.filter(option => {
          const [min, max] = this.stackLengthRange(option);
          return min <= hi && max >= lo;
        });
        stack = this._randSelect(fitting.length > 0 ? fitting : token.options);
      }
      const str = this.genStackWithin(stack, groups, lo, hi);
      if (token.remember) {
        groups[token.groupNumber!] = str;
      }
      return str;
    }
    if (token.type === TokenType.REPETITION) {
      const item = token.value as Token;
      const [itemMin, itemMax] = this.lengthRange(item);
      // Counts whose items can fit within the length.
      const from = Math.max(token.min!, itemMax === Infinity ? 0 : Math.ceil(lo / itemMax));
      let to = Math.min(token.max!, itemMin === 0 ? Infinity : Math.floor(hi / itemMin));
      // Without a bound, up to `max` items more than the items of an average length reaching the minimum.
      const needed = Math.max(from, Math.ceil(lo / Math.max(1, this.averageLength(item))));
      if (token.max === Infinity) {
        to = Math.min(to, needed + this.max);
      }
      const count = this.randInt(Math.min(needed, to), Math.max(from, to));
      return this.genStackWithin(
        Array.from({ length: count }, () => item),
        groups,
        lo,
        hi,
      );
    }
    return this._gen(token, groups);
  }

  /**
   * Generates a sequence, each part within a length leaving the minimum and the maximum of the parts after it. A group
   * takes the length of its back references after it in the sequence too, which then have the length it got.
   */
  private genStackWithin(stack: Token[], groups: (string | null)[], lo: number, hi: number): string {
    const groupNumbers = this.rememberedGroups();
    // A back reference has the length of the value its group has when it is generated: the one of a previous repetition
    // until the group is generated again.
    const partRange = (token: Token): LengthRange => {
      const length = token.type === TokenType.REFERENCE ? groups[(token.value as number) - 1]?.length : undefined;
      return length === undefined ? this.lengthRange(token) : [length, length];
    };
    /** Minimum and maximum lengths of the parts after each part. */
    const afterRanges = (): LengthRange[] => {
      const after: LengthRange[] = [[0, 0]];
      for (let i = stack.length - 1; i > 0; i--) {
        const [min, max] = partRange(stack[i]);
        after.unshift([after[0][0] + min, after[0][1] + max]);
      }
      return after;
    };
    /** Minimum and maximum lengths of the parts after a group, but its back references. */
    const afterGroupRange = (index: number, copies: Token[]): LengthRange => {
      let min = 0;
      let max = 0;
      for (const token of stack.slice(index + 1)) {
        if (!copies.includes(token)) {
          const [tokenMin, tokenMax] = partRange(token);
          min += tokenMin;
          max += tokenMax;
        }
      }
      return [min, max];
    };
    const ranges = stack.map(token => this.lengthRange(token));
    let after = afterRanges();
    let str = '';
    for (const [i, token] of stack.entries()) {
      const number = token.type === TokenType.GROUP && token.remember ? groupNumbers.indexOf(token) + 1 : 0;
      const copies = number ? stack.slice(i + 1).filter(next => next.type === TokenType.REFERENCE && next.value === number) : [];
      const [min, max] = ranges[i];
      const [afterMin, afterMax] = copies.length > 0 ? afterGroupRange(i, copies) : after[i];
      const parts = copies.length + 1;
      const partLo = Math.max(min, Math.ceil((lo - str.length - afterMax) / parts), 0);
      const partHi = Math.max(partLo, Math.min(max, Math.floor((hi - str.length - afterMin) / parts)));
      const part = this.genWithin(token, groups, partLo, partHi);
      str += part;
      if (copies.length > 0) {
        after = afterRanges();
      }
    }
    return str;
  }
}

export class FakerWithRandexp extends Faker {
  createRandexp(regexp: string | RegExp, flags?: string) {
    return new RandexpWithFaker(regexp, flags, this);
  }
}

/**
 * Create a randomizer that applies a seed only when the next random value is requested.
 * Reseeding the Mersenne Twister is costly and seeds are reset before every entity template, used or not.
 */
const createLazySeedRandomizer = (): Randomizer => {
  const randomizer = generateMersenne53Randomizer();
  let pendingSeed: number | number[] | undefined;
  return {
    next: () => {
      if (pendingSeed !== undefined) {
        randomizer.seed(pendingSeed);
        pendingSeed = undefined;
      }
      return randomizer.next();
    },
    seed: (seed: number | number[]) => {
      pendingSeed = seed;
    },
  };
};

/**
 * Create a faker instance.
 * @param nativeLanguage - native language
 * @returns Faker instance
 */

export async function createFaker(nativeLanguage = 'en') {
  nativeLanguage = languageToFakerLanguage(nativeLanguage);
  const fakerModule = await import(`@faker-js/faker`);
  const fakerLanguage = nativeLanguage in fakerModule ? nativeLanguage : 'en';
  const locale: LocaleDefinition = (fakerModule as any)[fakerLanguage];

  const faker = new FakerWithRandexp({
    locale: [locale, base, en],
    randomizer: createLazySeedRandomizer(),
  });
  faker.createRandexp = (pattern, m) => new RandexpWithFaker(pattern, m, faker);
  return faker;
}
