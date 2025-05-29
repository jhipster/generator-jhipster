import { describe, expect, it } from 'esmocha';
import { getFrontendAppName } from './basename.js';

describe('generator > base', () => {
  describe('getFrontendAppName', () => {
    describe('when called with name having App', () => {
      it('returns the frontend app name', () => {
        expect(getFrontendAppName({ baseName: 'myAmazingApp' })).toBe('myAmazingApp');
      });
    });
    describe('when called with name', () => {
      it('returns the frontend app name with the App suffix added', () => {
        expect(getFrontendAppName({ baseName: 'myAwesomeProject' })).toBe('myAwesomeProjectApp');
      });
    });
    describe('when called with name starting with a digit', () => {
      it('returns the default frontend app name - App', () => {
        expect(getFrontendAppName({ baseName: '1derful' })).toBe('App');
      });
    });
  });
});
