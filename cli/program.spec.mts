/* eslint-disable no-unused-expressions, no-console */

import { describe, expect, it, beforeEach } from 'esmocha';

import { defaultHelpers as helpers } from '../lib/testing/index.js';
import { createProgram } from './program.mjs';

describe('cli - program', () => {
  beforeEach(async () => {
    await helpers.prepareTemporaryDir();
  });

  describe('adding a negative option', () => {
    it('when executing should not set insight', async () => {
      const command = await createProgram().parseAsync(['jhipster', 'jhipster']);
      expect(command.opts().insight).toBeUndefined();
    });
    it('when executing with --insight should set insight to true', async () => {
      const command = await createProgram().parseAsync(['jhipster', 'jhipster', '--insight']);
      expect(command.opts().insight).toBe(true);
    });
    it('when executing with --no-insight should set insight to true', async () => {
      const command = await createProgram().parseAsync(['jhipster', 'jhipster', '--no-insight']);
      expect(command.opts().insight).toBe(false);
    });
  });

  describe('adding a option with default value', () => {
    it('when executing should not set insight', async () => {
      const command = await createProgram().parseAsync(['jhipster', 'jhipster']);
      expect(command.opts().skipYoResolve).toBe(false);
    });
    it('when executing with --skip-yo-resolve should set insight to true', async () => {
      const command = await createProgram().parseAsync(['jhipster', 'jhipster', '--skip-yo-resolve']);
      expect(command.opts().skipYoResolve).toBe(true);
    });
    it('when executing with --no-skip-yo-resolve should set insight to false', async () => {
      const command = await createProgram().parseAsync(['jhipster', 'jhipster', '--no-skip-yo-resolve']);
      expect(command.opts().skipYoResolve).toBe(false);
    });
  });
});
