import type { GitHubMatrix } from './github-matrix.ts';

export type JHipsterGitHubMatrix = GitHubMatrix & {
  name: string;
  'app-sample'?: string;
  'build-jhipster-bom'?: boolean;
  'gradle-cache'?: boolean;
  'jhipster-bom-cicd-version'?: string;
  'jhipster-bom-branch'?: string;
  'sonar-analyse'?: 'true' | 'false';
  workspaces?: 'true' | 'false';
  'skip-frontend-tests'?: 'true' | 'false';
  'skip-compare'?: 'true' | 'false';
  'skip-backend-tests'?: 'true' | 'false';
};

export type JHipsterGitHubInputMatrix = JHipsterGitHubMatrix & {
  generatorOptions: Record<string, any>;
};

export type WorkflowSample = JHipsterGitHubInputMatrix & {
  environment?: string;
  war?: number | string | boolean;
  entity?: string;
  'jdl-entity'?: string;
  'jdl-samples'?: string;
  'extra-args'?: string;
};

export type WorkflowSamples = {
  include: WorkflowSample[];
};
