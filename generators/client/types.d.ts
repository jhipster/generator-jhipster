import type { addIconImport, addItemToMenu, addRoute } from '../angular/support/needles.js';
import type { ExportApplicationPropertiesFromCommand } from '../../lib/command/index.js';
import type { CypressApplication } from '../cypress/types.js';
import type {
  Application as JavascriptApplication,
  Entity as JavascriptEntity,
  Field as JavascriptField,
  Relationship as JavascriptRelationship,
  Source as JavascriptSource,
} from '../javascript/types.js';
import type { Language } from '../languages/support/languages.ts';
import type {
  Application as LanguageApplication,
  Entity as LanguagesEntity,
  Field as LanguagesField,
  Relationship as LanguagesRelationship,
} from '../languages/index.js';
import type { GetWebappTranslationCallback } from './translation.js';
import type Command from './command.ts';

export interface Field extends JavascriptField, LanguagesField {}

export interface Relationship extends JavascriptRelationship, LanguagesRelationship {}

export interface Entity<F extends Field = Field, R extends Relationship = Relationship>
  extends JavascriptEntity<F, R>,
    LanguagesEntity<F, R> {}

type ApplicationClientProperties = ExportApplicationPropertiesFromCommand<typeof Command>;

export type Application<E extends Entity> = ApplicationClientProperties &
  LanguageApplication<E> &
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

export type Source = JavascriptSource & {
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
  addWebpackConfig?(args: { config: string });
  addLanguagesInFrontend?(args: { languagesDefinition: readonly Language[] });
};
