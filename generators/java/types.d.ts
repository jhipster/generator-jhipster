import { RequireOneOrNone } from 'type-fest';
import { BaseApplication } from '../base-application/types.js';
import { GradleNeedleOptions } from '../gradle/types.js';

export type JavaDependencyVersion = {
  name: string;
  version: string;
};

export type JavaArtifactType = {
  type?: 'jar' | 'pom';
  scope?: 'compile' | 'provided' | 'runtime' | 'test' | 'system' | 'import' | 'annotationProcessor';
};

export type JavaArtifact = {
  groupId: string;
  artifactId: string;
  classifier?: string;
} & JavaArtifactType;

export type JavaArtifactVersion = RequireOneOrNone<{ version: string; versionRef: string }, 'version' | 'versionRef'>;

export type JavaDependency = JavaArtifact & JavaArtifactVersion;

export type JavaDefinition = {
  versions: JavaDependencyVersion[];
  dependencies: JavaDependency[];
};

export type JavaNeedleOptions = GradleNeedleOptions;

export type JavaApplication = BaseApplication & {
  javaVersion: string;

  packageName: string;
  packageFolder: string;

  srcMainJava: string;
  srcMainResources: string;
  srcMainWebapp: string;
  srcTestJava: string;
  srcTestResources: string;
  srcTestJavascript: string;

  javaPackageSrcDir: string;
  javaPackageTestDir: string;

  temporaryDir: string;

  javaDependencies: Record<string, string>;
  packageInfoJavadocs: { packageName: string; documentation: string }[];

  prettierJava: boolean;

  imperativeOrReactive: string;
};

export type JavaSourceType = {
  addJavaDefinition?(definition: JavaDefinition, options?: JavaNeedleOptions): void;
  addJavaDependencies?(dependency: JavaDependency[], options?: JavaNeedleOptions): void;
};
