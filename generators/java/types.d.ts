import type { ExportGeneratorOptionsFromCommand, ExportStoragePropertiesFromCommand } from '../../lib/command/index.ts';
import type {
  Application as BaseApplicationApplication,
  Config as BaseApplicationConfig,
  Entity as BaseApplicationEntity,
  Field as BaseApplicationField,
  Options as BaseApplicationOptions,
  Relationship as BaseApplicationRelationship,
  Source as BaseApplicationSource,
} from '../base-application/types.d.ts';
import type GraalvmCommand from '../java-simple-application/generators/graalvm/command.ts';
import type { Application as GradleApplication } from '../java-simple-application/generators/gradle/types.ts';
import type {
  Application as JavaSimpleApplicationApplication,
  Config as JavaSimpleApplicationConfig,
  Options as JavaSimpleApplicationOptions,
  Source as JavaSimpleApplicationSource,
} from '../java-simple-application/types.ts';
import type { Application as LanguagesApplication } from '../languages/types.ts';

import type { JavaAddedApplicationProperties } from './application.ts';

export type {
  ConditionalJavaDefinition,
  JavaArtifact,
  JavaArtifactType,
  JavaArtifactVersion,
  JavaDefinition,
  JavaDependency,
  JavaDependencyVersion,
  JavaNeedleOptions,
  SpringBean,
} from '../java-simple-application/types.ts';

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
  relationshipUpdateBackReference?: boolean;
  relationshipNameCapitalizedPlural?: string;
  ignoreOtherSideProperty?: boolean;
}

export interface Entity<F extends Field = Field, R extends Relationship = Relationship> extends BaseApplicationEntity<F, R> {
  dtoMapstruct: boolean;
  dtoAny: boolean;

  entityDomainLayer?: boolean;

  propertyJavaFilteredType?: string;

  dtoSuffix?: string;

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

  /** Import swagger Schema annotation */
  importApiModelProperty?: boolean;
  relationshipsContainOtherSideIgnore?: boolean;
}

export type Config = BaseApplicationConfig & JavaSimpleApplicationConfig & ExportStoragePropertiesFromCommand<typeof GraalvmCommand>;

export type Options = BaseApplicationOptions & JavaSimpleApplicationOptions & ExportGeneratorOptionsFromCommand<typeof GraalvmCommand>;

type DatabaseApplication = {
  jhiTablePrefix: string;
};

type SpringApplication = {
  generateSpringAuditor: boolean;
};

export type Application<E extends BaseApplicationEntity<BaseApplicationField, BaseApplicationRelationship> = Entity<Field, Relationship>> =
  BaseApplicationApplication<E> &
    JavaSimpleApplicationApplication &
    JavaAddedApplicationProperties &
    GradleApplication &
    SpringApplication &
    LanguagesApplication &
    DatabaseApplication;

export type Source = BaseApplicationSource & JavaSimpleApplicationSource;
