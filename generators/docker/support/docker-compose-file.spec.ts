import { describe, expect, it } from 'esmocha';
import { createDockerComposeFile } from './docker-compose-file.js';

describe('generator - docker - docker-compose-file', () => {
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
