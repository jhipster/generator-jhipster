import { describe, expect, it } from 'esmocha';
import { findLanguageForTag, generateLanguagesWebappOptions } from './languages.js';

describe('generator - languages - support', () => {
  describe('generateLanguagesWebappOptions', () => {
    describe('when called with empty array', () => {
      it('return empty', () => {
        expect(generateLanguagesWebappOptions([])).toEqual([]);
      });
    });
    describe('when called with languages array', () => {
      it('return languages pipe syntax', () => {
        expect(generateLanguagesWebappOptions(['en', 'fr'].map(lang => findLanguageForTag(lang)!))).toEqual([
          "'en': { name: 'English' }",
          "'fr': { name: 'Français' }",
        ]);
      });
    });
  });
});
