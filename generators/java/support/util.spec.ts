import { describe, expect, it } from 'esmocha';

import { getMainClassName } from './util.ts';

describe('generator > java', () => {
  describe('getMainClassName', () => {
    describe('when called with name', () => {
      it('return the app name', () => {
        expect(getMainClassName({ baseName: 'myTest' })).toBe('MyTestApp');
      });
    });
    describe('when called with name having App', () => {
      it('return the app name', () => {
        expect(getMainClassName({ baseName: 'myApp' })).toBe('MyApp');
      });
    });
    describe('when called with name having invalid java chars', () => {
      it('return the default app name', () => {
        expect(getMainClassName({ baseName: '9myApp' })).toBe('Application');
      });
    });
  });
});
