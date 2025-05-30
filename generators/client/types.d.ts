import type { addIconImport, addItemToMenu, addRoute } from '../angular/support/needles.js';
import type { ExportApplicationPropertiesFromCommand } from '../../lib/command/index.js';
import type { CypressApplication } from '../cypress/types.js';
import type { JavaScriptApplication, JavaScriptSourceType } from '../javascript/types.js';
import type { PostWritingEntitiesTaskParam } from '../../lib/types/application/tasks.js';
import type { Language } from '../languages/support/languages.ts';
import type { Entity } from '../base-application/index.js';
import type { GetWebappTranslationCallback } from './translation.js';
import type Command from './command.ts';

type ApplicationClientProperties = ExportApplicationPropertiesFromCommand<typeof Command>;

export type FrontendApplication = ApplicationClientProperties &
  JavaScriptApplication &
  CypressApplication & {
    webappLoginRegExp: string;
    clientWebappDir?: string;
    clientThemeNone?: boolean;
    clientThemeAny?: boolean;
    webappEnumerationsDir?: string;
    clientFrameworkBuiltIn?: boolean;
    frontendAppName?: string;
    filterEntitiesForClient?: (entity: Entity[]) => Entity[];
    filterEntitiesAndPropertiesForClient?: (entity: Entity[]) => Entity[];
    filterEntityPropertiesForClient?: (entity: Entity) => Entity;
    getWebappTranslation?: GetWebappTranslationCallback;
  };

/**
 * @deprecated in favor of frontend application.
 */
export type ClientApplication = JavaScriptApplication & FrontendApplication;

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

export type ClientSourceType = JavaScriptSourceType & {
  /**
   * Add style to css file.
   */
  addClientStyle?: (args: { style: string; comment?: string }) => void;
  /**
   * Add entities to client.
   */
  addEntitiesToClient: (arg1: Pick<PostWritingEntitiesTaskParam, 'application' | 'entities'>) => void;
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
