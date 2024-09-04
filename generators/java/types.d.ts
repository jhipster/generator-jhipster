import { RequireOneOrNone } from 'type-fest';
import { GradleApplication, GradleNeedleOptions } from '../gradle/types.js';
import { EditFileCallback } from '../base/api.js';
import { MavenDefinition } from '../maven/types.js';
import { ExportStoragePropertiesFromCommand } from '../../lib/command/index.js';
import { JavaAnnotation } from './support/add-java-annotation.ts';
import { Command as OpenapiGeneratorCommand } from './generators/openapi-generator/command.js';
import { Command as BootstrapCommand } from './generators/bootstrap/command.js';

type JavaBootstrapStorageProperties = ExportStoragePropertiesFromCommand<BootstrapCommand>;
type JavaOpenapiGeneratorStorageProperties = ExportStoragePropertiesFromCommand<OpenapiGeneratorCommand>;

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
  mavenDefinition?: MavenDefinition;
};

export type JavaNeedleOptions = GradleNeedleOptions;

export type JavaApplication = JavaBootstrapStorageProperties &
  GradleApplication & {
    javaVersion: string;

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

    addOpenapiGeneratorPlugin: boolean;
  };

export type ConditionalJavaDefinition = JavaDefinition & { condition?: boolean };

export type JavaSourceType = {
  /**
   * Add a JavaDefinition to the application.
   * A version requires a valid version otherwise it will be ignored.
   * A dependency with versionRef requires a valid referenced version at `versions` otherwise it will be ignored.
   */
  addJavaDefinition?(definition: JavaDefinition, options?: JavaNeedleOptions): void;
  addJavaDefinitions?(
    optionsOrDefinition: JavaNeedleOptions | ConditionalJavaDefinition,
    ...definitions: ConditionalJavaDefinition[]
  ): void;
  addJavaDependencies?(dependency: JavaDependency[], options?: JavaNeedleOptions): void;
  hasJavaProperty?(propertyName: string): boolean;
  hasJavaManagedProperty?(propertyName: string): boolean;

  /**
   * Edit a Java file by adding static imports, imports and annotations.
   * Callbacks are passed to the editFile method.
   */
  editJavaFile?: (
    file: string,
    { staticImports, imports, annotations }: { staticImports?: string[]; imports?: string[]; annotations?: JavaAnnotation[] },
    ...editFileCallback: EditFileCallback[]
  ) => void;
};
