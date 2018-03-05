import { expect } from 'chai';
import { REQUEST, SUCCESS, FAILURE } from 'app/shared/reducers/action-type.util';

import password, { ACTION_TYPES } from 'app/modules/account/password/password.reducer';

describe('Password reducer tests', () => {
  describe('Common tests', () => {
    it('should return the initial state', () => {
      const toTest = password(undefined, {});
      expect(toTest).to.contain({
        loading: false,
        errorMessage: null,
        updateSuccess: false,
        updateFailure: false
      });
    });
  });

  describe('Password update', () => {
    it('should detect a request', () => {
      const toTest = password(undefined, { type: REQUEST(ACTION_TYPES.UPDATE_PASSWORD) });
      expect(toTest).to.contain({
        updateSuccess: false,
        updateFailure: false,
        loading: true
      });
    });
    it('should detect a success', () => {
      const toTest = password(undefined, { type: SUCCESS(ACTION_TYPES.UPDATE_PASSWORD) });
      expect(toTest).to.contain({
        updateSuccess: true,
        updateFailure: false,
        loading: false
      });
    });
    it('should detect a failure', () => {
      const toTest = password(undefined, { type: FAILURE(ACTION_TYPES.UPDATE_PASSWORD) });
      expect(toTest).to.contain({
        updateSuccess: false,
        updateFailure: true,
        loading: false
      });
    });
  });
});
