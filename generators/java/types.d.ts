import type { RequireOneOrNone } from 'type-fest';
import type { GradleApplication, GradleNeedleOptions } from '../gradle/types.js';
import type { EditFileCallback } from '../base-core/api.js';
import type { MavenDefinition } from '../maven/types.js';
import type { ExportStoragePropertiesFromCommand } from '../../lib/command/index.js';
import type { OptionWithDerivedProperties } from '../base-application/internal/types/application-options.js';
import type {
  Entity as BaseApplicationEntity,
  Field as BaseApplicationField,
  Relationship as BaseApplicationRelationship,
} from '../base-application/index.ts';
import type { JavaAnnotation } from './support/add-java-annotation.ts';
import type { default as BootstrapCommand } from './generators/bootstrap/command.js';

export type { BaseApplicationEntity as Entity };

type Property = {
  propertyJavaFilterName?: string;
  propertyJavaFilterJavaBeanName?: string;
  propertyJavaFilterType?: string;
  propertyJavaFilteredType?: string;
};

export type Field = BaseApplicationField &
  Property & {
    // Java specific
    propertyJavaBeanName?: string;
    propertyDtoJavaType?: string;
    propertyJavaFilterType?: string;
    fieldInJavaBeanMethod?: string;
    fieldJavaBuildSpecification?: string;
    fieldJavadoc?: string;
    fieldJavaValueGenerator?: string;
    javaValueGenerator?: string;
    propertyJavaFilteredType?: string;

    propertyJavaCustomFilter?: { type: string; superType: string; fieldType: string };

    liquibaseDefaultValueAttributeValue?: string;
    liquibaseDefaultValueAttributeName?: string;
    liquibaseGenerateFakeData?: boolean;
  };

export interface Relationship extends BaseApplicationRelationship, Property {}

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

type DatabaseApplication = {
  jhiTablePrefix: string;
};

type CommonProperties = {
  authenticationUsesCsrf: boolean;
};

type SpringApplication = {
  generateSpringAuditor: boolean;
};

export type JavaBootstrap = JavaBootstrapStorageProperties & {
  javaVersion: string;
  javaCompatibleVersions: string[];
  mainClass: string;

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
};

export type JavaApplication = JavaBootstrap &
  CommonProperties &
  SpringApplication &
  DatabaseApplication &
  GradleApplication & {
    buildToolExecutable: string;

    prettierJava: boolean;

    imperativeOrReactive: string;

    addOpenapiGeneratorPlugin: boolean;
    useNpmWrapper: boolean;
    graalvmReachabilityMetadata: string;

    cucumberTests: boolean;
    gatlingTests: boolean;
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

export type JavaBuildToolApplication = OptionWithDerivedProperties<'buildTool', ['maven', 'gradle']> & {
  buildToolUnknown?: boolean;
};
