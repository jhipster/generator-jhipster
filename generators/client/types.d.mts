import type { AngularApplication } from '../angular/types.mjs';
import type { OptionWithDerivedProperties } from '../base-application/application-options.mjs';
import type { CypressApplication } from '../cypress/types.mjs';

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
};
