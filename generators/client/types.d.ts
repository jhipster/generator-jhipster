import type { HandleCommandTypes } from '../../lib/command/index.ts';
import type { addIconImport, addItemToMenu, addRoute } from '../angular/support/needles.ts';
import type {
  Application as CommonApplication,
  Config as CommonConfig,
  Features as CommonFeatures,
  Options as CommonOptions,
  Source as CommonSource,
} from '../common/types.ts';
import type { Config as JavascriptConfig, Options as JavascriptOptions, Source as JavascriptSource } from '../javascript/types.ts';

import type command from './command.ts';
import type { Entity } from './entity.ts';
import type { GetWebappTranslationCallback } from './translation.ts';

type Command = HandleCommandTypes<typeof command>;

export * from './entity.ts';

export type { CommonFeatures as Features };

export type Config = JavascriptConfig & CommonConfig & Command['Config'];

export type Options = JavascriptOptions & CommonOptions & Command['Options'];

export type Application<E extends Entity = Entity> = Command['Application'] &
  CommonApplication<E> & {
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
    addEntityTranslationKey: (arg: { translationKey: string; translationValue: string; language: string }) => void;
  };
