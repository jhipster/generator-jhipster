import type { addIconImport, addItemToMenu, addRoute } from '../angular/support/needles.js';
import type { ExportApplicationPropertiesFromCommand } from '../../lib/command/index.js';
import type { CypressApplication } from '../cypress/types.js';
import type { JavaScriptApplication, JavaScriptSourceType } from '../javascript/types.js';
import type { PostWritingEntitiesTaskParam } from '../../lib/types/application/tasks.js';
import type { PartialAngularApplication } from '../angular/types-deprecated.js';
import type Command from './command.ts';

type ApplicationClientProperties = ExportApplicationPropertiesFromCommand<typeof Command>;

export type FrontendApplication = ApplicationClientProperties &
  JavaScriptApplication &
  CypressApplication & {
    webappLoginRegExp: string;
    clientWebappDir?: string;
    webappEnumerationsDir?: string;
    clientFrameworkBuiltIn?: boolean;
  };

/**
 * Deprecated in favor of frontend application.
 */
export type ClientApplication = JavaScriptApplication & PartialAngularApplication;

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
};
