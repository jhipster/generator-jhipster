import type { RequireOneOrNone } from 'type-fest';
import type { GradleApplication, GradleNeedleOptions } from '../gradle/types.js';
import type { EditFileCallback } from '../base/api.js';
import type { MavenDefinition } from '../maven/types.js';
import type { ExportStoragePropertiesFromCommand } from '../../lib/command/index.js';
import type { JavaAnnotation } from './support/add-java-annotation.ts';
import type { default as BootstrapCommand } from './generators/bootstrap/command.js';

type JavaBootstrapStorageProperties = ExportStoragePropertiesFromCommand<typeof BootstrapCommand>;

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

export type JavaDependency = JavaArtifact &
  JavaArtifactVersion & {
    exclusions?: JavaArtifact[];
  };

export type JavaDefinition = {
  versions?: JavaDependencyVersion[];
  dependencies?: JavaDependency[];
  mavenDefinition?: MavenDefinition;
};

export type JavaNeedleOptions = GradleNeedleOptions;

export type JavaApplication = JavaBootstrapStorageProperties &
  GradleApplication & {
    buildToolExecutable: string;
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
    useNpmWrapper: boolean;
    graalvmReachabilityMetadata: string;
    javaNodeBuildPaths: string[];
  };

export type ConditionalJavaDefinition = JavaDefinition & { condition?: boolean };

export type SpringBean = { package: string; beanClass: string; beanName: string };

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
    options: {
      staticImports?: string[];
      imports?: string[];
      annotations?: JavaAnnotation[];
      /**
       * Constructor parameters to add to the class.
       */
      constructorParams?: string[];
      /**
       * Fields to add to the class.
       * Requires a valid constructor.
       */
      fields?: string[];
      /**
       * Spring beans to add to the class.
       */
      springBeans?: SpringBean[];
    },
    ...editFileCallback: EditFileCallback[]
  ) => void;
  /**
   * Add enum values to a Java enum.
   *
   * @example
   * ```js
   * addItemsToJavaEnumFile('src/main/java/my/package/MyEnum.java', {
   *   enumValues: ['VALUE1', 'VALUE2'],
   * });
   * ```
   */
  addItemsToJavaEnumFile?: (
    file: string,
    options: {
      enumName?: string;
      enumValues: string[];
    },
  ) => void;
};
