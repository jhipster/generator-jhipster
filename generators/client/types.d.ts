import type { addIconImport, addItemToMenu, addRoute } from '../angular/support/needles.js';
import type { HandleCommandTypes } from '../../lib/command/index.js';
import type { Application as CypressApplication } from '../cypress/types.js';
import type {
  Application as JavascriptApplication,
  Config as JavascriptConfig,
  Entity as JavascriptEntity,
  Field as JavascriptField,
  Options as JavascriptOptions,
  Relationship as JavascriptRelationship,
  Source as JavascriptSource,
} from '../javascript/types.js';
import type {
  Application as CommonApplication,
  Config as CommonConfig,
  Entity as CommonEntity,
  Features as CommonFeatures,
  Field as CommonField,
  Options as CommonOptions,
  Relationship as CommonRelationship,
  Source as CommonSource,
} from '../common/types.js';
import type { Language } from '../languages/support/languages.ts';
import type { Entity as LanguagesEntity, Field as LanguagesField, Relationship as LanguagesRelationship } from '../languages/types.d.ts';
import type { GetWebappTranslationCallback } from './translation.js';
import type command from './command.ts';

type Command = HandleCommandTypes<typeof command>;

export type { CommonFeatures as Features };

export type Config = JavascriptConfig & CommonConfig & Command['Config'];

export type Options = JavascriptOptions & CommonOptions & Command['Options'];

export interface Field extends JavascriptField, CommonField, LanguagesField {}

export interface Relationship extends JavascriptRelationship, CommonRelationship, LanguagesRelationship {}

export interface Entity<F extends Field = Field, R extends Relationship = Relationship>
  extends JavascriptEntity<F, R>,
    CommonEntity<F, R>,
    LanguagesEntity<F, R> {}

export type Application<E extends Entity = Entity> = Command['Application'] &
  CommonApplication<E> &
  JavascriptApplication<E> &
  CypressApplication & {
    webappLoginRegExp: string;
    clientWebappDir?: string;
    clientThemeNone?: boolean;
    clientThemeAny?: boolean;
    webappEnumerationsDir?: string;
    clientFrameworkBuiltIn?: boolean;
    frontendAppName?: string;
    filterEntitiesForClient?: <const E extends Entity>(entity: E[]) => E[];
    filterEntitiesAndPropertiesForClient?: <const E extends Entity>(entity: E[]) => E[];
    filterEntityPropertiesForClient?: <const E extends Entity>(entity: E) => E;
    getWebappTranslation?: GetWebappTranslationCallback;
  };

export type ClientResources = {
  /**
   * resources added to root file.
   */
  resource: string;
  /**
   * comment to add before resources content.
   */
  comment?: string;
};

export type Source = JavascriptSource &
  CommonSource & {
    /**
     * Add style to css file.
     */
    addClientStyle?: (args: { style: string; comment?: string }) => void;
    /**
     * Add entities to client.
     */
    addEntitiesToClient: <const E extends Entity, const A extends Application<E>>(param: { application: A; entities: E[] }) => void;
    /**
     * Add external resources to root file(index.html).
     */
    addExternalResourceToRoot?(resources: ClientResources): void;
    addIconImport?(args: Parameters<typeof addIconImport>[0]): void;
    addAdminRoute?(args: Omit<Parameters<typeof addRoute>[0], 'needle'>): void;
    addItemToAdminMenu?(args: Omit<Parameters<typeof addItemToMenu>[0], 'needle' | 'enableTranslation' | 'jhiPrefix'>): void;
    /**
     * Add webpack config.
     */
    addWebpackConfig?(args: { config: string }): void;
    addLanguagesInFrontend?(args: { languagesDefinition: readonly Language[] }): void;
  };
