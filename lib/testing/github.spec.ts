import { describe, expect, it } from 'esmocha';
import { parseIssue } from './github.ts';

describe('github', () => {
  it('should parse full issue spec', () => {
    expect(parseIssue('jhipster/generator-jhipster#12345')).toEqual({
      owner: 'jhipster',
      repository: 'generator-jhipster',
      issue: '12345',
    });
  });
  it('should parse repo with issue', () => {
    expect(parseIssue('generator-jhipster-entity-audit#12345')).toEqual({
      repository: 'generator-jhipster-entity-audit',
      issue: '12345',
    });
  });
  it('should parse issue', () => {
    expect(parseIssue('12345')).toEqual({ issue: '12345' });
  });
  it('should not parse with missing repo', () => {
    expect(() => parseIssue('jhipster/12345')).toThrowError('Invalid issue format: jhipster/12345');
  });
  it('should not parse with invalid issue number', () => {
    expect(() => parseIssue('a')).toThrowError('Invalid issue format: a');
  });
});
