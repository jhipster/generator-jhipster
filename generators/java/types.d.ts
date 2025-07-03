import type { RequireOneOrNone } from 'type-fest';
import type { Application as GradleApplication, GradleNeedleOptions, Source as GradleSource } from '../gradle/types.js';
import type { EditFileCallback } from '../base-core/api.js';
import type { MavenDefinition, Source as MavenSource } from '../maven/types.js';
import type { ExportGeneratorOptionsFromCommand, ExportStoragePropertiesFromCommand } from '../../lib/command/index.js';
import type { OptionWithDerivedProperties } from '../base-application/internal/types/application-options.js';
import type {
  Application as BaseApplicationApplication,
  Config as BaseApplicationConfig,
  Entity as BaseApplicationEntity,
  Field as BaseApplicationField,
  Options as BaseApplicationOptions,
  Relationship as BaseApplicationRelationship,
  Source as BaseApplicationSource,
} from '../base-application/index.ts';
import type { JavaAnnotation } from './support/add-java-annotation.ts';
import type {
  Application as JavaBootstrapApplication,
  Config as JavaBootstrapConfig,
  Options as JavaBootstrapOptions,
} from './generators/bootstrap/types.js';
import type {
  Application as BuildToolApplication,
  Config as BuildToolConfig,
  Options as BuildToolOptions,
} from './generators/build-tool/types.js';
import type GraalvmCommand from './generators/graalvm/command.js';

type Property = {
  propertyJavaFilterName?: string;
  propertyJavaFilterJavaBeanName?: string;
  propertyJavaFilterType?: string;
  propertyJavaFilteredType?: string;
  propertyJavaBeanName?: string;
  propertyDtoJavaType?: string;
};

export type Field = BaseApplicationField &
  Property & {
    javaFieldType?: string;
    fieldInJavaBeanMethod?: string;
    fieldJavaBuildSpecification?: string;
    fieldJavadoc?: string;
    fieldJavaValueGenerator?: string;
    javaValueGenerator?: string;

    propertyJavaCustomFilter?: { type: string; superType: string; fieldType: string };

    javaValueSample1?: string;
    javaValueSample2?: string;
    fieldValidateRulesPatternJava?: string;
  };

export interface Relationship extends BaseApplicationRelationship, Property {
  relationshipJavadoc?: string;
  propertyDtoJavaType?: string;
}

export interface Entity<F extends Field = Field, R extends Relationship = Relationship> extends BaseApplicationEntity<F, R> {
  dtoMapstruct: boolean;
  dtoAny: boolean;

  entityDomainLayer?: boolean;

  propertyJavaFilteredType?: string;

  dtoClass?: string;
  dtoInstance?: string;

  entityJavadoc?: string;
  entityApiDescription?: string;

  entityClass: string;
  entityClassPlural: string;
  entityAbsoluteClass: string;
  /** Entity folder relative to project root */
  entityAbsoluteFolder: string;
  /** Full entity package */
  entityAbsolutePackage?: string;
  /** Entity folder relative to src/main/java folder */
  entityJavaPackageFolder?: string;

  persistClass: string;
  persistInstance: string;
  restClass: string;
  restInstance: string;

  skipJunitTests?: string;
}

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

export type Config = BaseApplicationConfig &
  JavaBootstrapConfig &
  BuildToolConfig &
  ExportStoragePropertiesFromCommand<typeof GraalvmCommand>;

export type Options = BaseApplicationOptions &
  JavaBootstrapOptions &
  BuildToolOptions &
  ExportGeneratorOptionsFromCommand<typeof GraalvmCommand>;

type DatabaseApplication = {
  jhiTablePrefix: string;
};

type CommonProperties = {
  authenticationUsesCsrf: boolean;
};

type SpringApplication = {
  generateSpringAuditor: boolean;
};

export type Application<E extends BaseApplicationEntity<BaseApplicationField, BaseApplicationRelationship> = Entity<Field, Relationship>> =
  BaseApplicationApplication<E> &
    JavaBootstrapApplication &
    BuildToolApplication &
    GradleApplication &
    CommonProperties &
    SpringApplication &
    DatabaseApplication & {
      reactive?: boolean;
      buildToolUnknown?: boolean;
      buildToolExecutable: string;

      prettierJava: boolean;

      addOpenapiGeneratorPlugin: boolean;
      useNpmWrapper: boolean;
      graalvmReachabilityMetadata: string;

      cucumberTests: boolean;
      gatlingTests: boolean;

      imperativeOrReactive: string;
      optionalOrMono: string;
      optionalOrMonoOfNullable: string;
      listOrFlux: string;
      optionalOrMonoClassPath: string;
      wrapMono: (className: string) => string;
      listOrFluxClassPath: string;
      reactorBlock: string;
      reactorBlockOptional: string;

      domains: string[];
      jhipsterDependenciesVersion?: string;
    };

export type ConditionalJavaDefinition = JavaDefinition & { condition?: boolean };

export type SpringBean = { package: string; beanClass: string; beanName: string };

export type Source = BaseApplicationSource &
  MavenSource &
  GradleSource & {
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
    addMainLog?({ name, level }: { name: string; level: string }): void;
    addTestLog?({ name, level }: { name: string; level: string }): void;

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
