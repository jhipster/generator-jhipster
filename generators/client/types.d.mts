import { OptionalGenericDerivedProperty } from '../base/application.mjs';
import type { CommonClientServerApplication } from '../base-application/types.mjs';

type ClientFrameworkType = 'no' | 'angular' | 'react' | 'vue' | 'svelte';

declare const CLIENT_FRAMEWORK = 'clientFramework';

type ClientFramework = {
  [CLIENT_FRAMEWORK]: ClientFrameworkType;
};

type ClientFrameworkApplication = OptionalGenericDerivedProperty<ClientFramework, ClientFramework[typeof CLIENT_FRAMEWORK]>;

export type ClientApplication = CommonClientServerApplication &
  ClientFrameworkApplication & {
    withAdminUi: boolean;
    webappLoginRegExp: string;
    webappEnumerationsDir?: string;
  };

/**
 * @private
 * Add external resources to root file(index.html).
 */
export type ClientResources = {
  /**
   * @param {string} resource - Resources added to root file.
   */
  resource: string;
  /**
   * @param {string} comment - comment to add before resources content.
   */
  comment?: string | null;
};
export type ClientSourceType = {
  addExternalResourceToRoot?(resources: ClientResources): void;
};
