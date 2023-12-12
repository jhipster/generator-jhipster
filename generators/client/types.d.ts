import type { addIconImport, addItemToMenu, addRoute } from '../angular/support/needles.js';
import type { AngularApplication } from '../angular/types.js';
import type { OptionWithDerivedProperties } from '../base-application/application-options.js';
import type { CypressApplication } from '../cypress/types.js';

type ClientFrameworkType = ['no', 'angular', 'react', 'vue', 'svelte'];

type ClientFrameworkApplication = OptionWithDerivedProperties<'clientFramework', ClientFrameworkType>;

export type ClientApplication = ClientFrameworkApplication &
  AngularApplication &
  CypressApplication & {
    withAdminUi: boolean;
    webappLoginRegExp: string;
    webappEnumerationsDir?: string;
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
export type ClientSourceType = {
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
