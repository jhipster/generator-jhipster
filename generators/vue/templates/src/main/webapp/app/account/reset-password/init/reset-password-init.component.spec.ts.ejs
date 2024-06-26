import { shallowMount } from '@vue/test-utils';
import axios from 'axios';
import sinon from 'sinon';
import ResetPasswordInit from './reset-password-init.vue';

type ResetPasswordInitComponentType = InstanceType<typeof ResetPasswordInit>;

const axiosStub = {
  get: sinon.stub(axios, 'get'),
  post: sinon.stub(axios, 'post'),
};

describe('Reset Component Init', () => {
  let resetPasswordInit: ResetPasswordInitComponentType;

  beforeEach(() => {
    axiosStub.post.reset();
    const wrapper = shallowMount(ResetPasswordInit, {});
    resetPasswordInit = wrapper.vm;
  });

  it('should reset request be a success', async () => {
    // Given
    axiosStub.post.resolves();

    // When
    await resetPasswordInit.requestReset();

    // Then
    expect(resetPasswordInit.success).toBeTruthy();
  });

  it('should reset request fail as an error', async () => {
    // Given
    axiosStub.post.rejects({
      response: {
        status: null,
        data: {
          type: null,
        },
      },
    });

    // When
    await resetPasswordInit.requestReset();
    await resetPasswordInit.$nextTick();

    // Then
    expect(resetPasswordInit.success).toBe(false);
    expect(resetPasswordInit.error).toEqual('ERROR');
  });
});
