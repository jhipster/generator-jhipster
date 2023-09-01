import { expect } from 'esmocha';
import { createDockerComposeFile } from './docker-compose-file.mjs';

describe('generator - base-docker - utils', () => {
  describe('createDockerComposeFile', () => {
    it('should return a docker compose file header with default name', () => {
      expect(createDockerComposeFile()).toMatchInlineSnapshot(`
"# This configuration is intended for development purpose, it's **your** responsibility to harden it for production
name: jhipster
"
`);
    });

    it('should return a docker compose file header with custom name', () => {
      expect(createDockerComposeFile('customService')).toMatchInlineSnapshot(`
"# This configuration is intended for development purpose, it's **your** responsibility to harden it for production
name: customService
"
`);
    });
  });
});
