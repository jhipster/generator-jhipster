export type BaseApplication = {
  jhipsterVersion: string;
  baseName: string;
  capitalizedBaseName: string;
  dasherizedBaseName: string;
  humanizedBaseName: string;

  projectVersion: string;
  projectDescription: string;

  jhiPrefix: string;
  entitySuffix: string;
  dtoSuffix: string;

  skipCommitHook: boolean;
  skipJhipsterDependencies: boolean;
  skipUserManagement: boolean;
};
