import { RequireOneOrNone } from 'type-fest';
import { BaseApplication } from '../base-application/types.js';
import { GradleApplication, GradleNeedleOptions } from '../gradle/types.js';

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

export type JavaArtifactVersion = RequireOneOrNone<{ version?: string; versionRef?: string }, 'version' | 'versionRef'>;

export type JavaDependency = JavaArtifact & JavaArtifactVersion;

export type JavaDefinition = {
  versions?: JavaDependencyVersion[];
  dependencies?: JavaDependency[];
};

export type JavaNeedleOptions = GradleNeedleOptions;

export type JavaApplication = BaseApplication &
  GradleApplication & {
    javaVersion: string;

    packageName: string;
    packageFolder: string;
    entityPackages: string[];

    srcMainJava: string;
    srcMainResources: string;
    srcMainWebapp: string;
    srcTestJava: string;
    srcTestResources: string;
    srcTestJavascript: string;

    javaPackageSrcDir: string;
    javaPackageTestDir: string;

    temporaryDir: string;

    /** Java dependency versions */
    javaDependencies: Record<string, string>;
    /** Known properties that can be used */
    javaProperties: Record<string, string | null>;
    /** Known managed properties that can be used */
    javaManagedProperties: Record<string, string | null>;
    /** Pre-defined package JavaDocs */
    packageInfoJavadocs: { packageName: string; documentation: string }[];

    prettierJava: boolean;

    imperativeOrReactive: string;
  };

export type JavaSourceType = {
  /**
   * Add a JavaDefinition to the application.
   * A version requires a valid version otherwise it will be ignored.
   * A dependency with versionRef requires a valid referenced version at `versions` otherwise it will be ignored.
   */
  addJavaDefinition?(definition: JavaDefinition, options?: JavaNeedleOptions): void;
  addJavaDependencies?(dependency: JavaDependency[], options?: JavaNeedleOptions): void;
  hasJavaProperty?(propertyName: string): boolean;
  hasJavaManagedProperty?(propertyName: string): boolean;
};
