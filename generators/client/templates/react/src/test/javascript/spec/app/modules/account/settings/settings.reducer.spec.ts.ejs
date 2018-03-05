import { expect } from 'chai';
import { REQUEST, SUCCESS, FAILURE } from 'app/shared/reducers/action-type.util';

import account, { ACTION_TYPES } from 'app/modules/account/settings/settings.reducer';

describe('Settings reducer tests', () => {
  describe('Common tests', () => {
    it('should return the initial state', () => {
      const toTest = account(undefined, {});
      expect(toTest).to.contain({
        loading: false,
        errorMessage: null,
        updateSuccess: false,
        updateFailure: false
      });
    });
  });

  describe('Settings update', () => {
    it('should detect a request', () => {
      const toTest = account(undefined, { type: REQUEST(ACTION_TYPES.UPDATE_ACCOUNT) });
      expect(toTest).to.contain({
        updateSuccess: false,
        updateFailure: false,
        loading: true
      });
    });
    it('should detect a success', () => {
      const toTest = account(undefined, { type: SUCCESS(ACTION_TYPES.UPDATE_ACCOUNT) });
      expect(toTest).to.contain({
        updateSuccess: true,
        updateFailure: false,
        loading: false
      });
    });
    it('should detect a failure', () => {
      const toTest = account(undefined, { type: FAILURE(ACTION_TYPES.UPDATE_ACCOUNT) });
      expect(toTest).to.contain({
        updateSuccess: false,
        updateFailure: true,
        loading: false
      });
    });
  });
});
