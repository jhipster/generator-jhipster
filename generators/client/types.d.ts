import type { CommandTypeMap } from '../../lib/command/index.ts';
import type {
  Application as CommonApplication,
  Config as CommonConfig,
  Features as CommonFeatures,
  Options as CommonOptions,
  Source as CommonSource,
} from '../common/types.ts';
import type {
  Config as JavascriptConfig,
  Options as JavascriptOptions,
  Source as JavascriptSource,
} from '../javascript-simple-application/types.ts';

import type { ClientAddedApplicationProperties } from './application.ts';
import type command from './command.ts';
import type { Entity } from './entity.ts';

type Command = CommandTypeMap<typeof command>;

export type { Entity, Field, Relationship } from './entity.ts';

export type { CommonFeatures as Features };

export type Config = JavascriptConfig & CommonConfig & Command['Config'];

export type Options = JavascriptOptions & CommonOptions & Command['Options'];

export type Application<E extends Entity = Entity> = Command['Application'] & CommonApplication<E> & ClientAddedApplicationProperties & {};

/** An item of a menu: the route it links to, its Font Awesome icon (asterisk by default), and its text, translated with translationKey. */
export type ClientMenuItem = {
  route: string;
  translationKey?: string;
  name?: string;
  icon?: string;
};

/** A route of the administration, loaded lazily from modulePath. */
export type ClientAdminRoute = {
  route: string;
  modulePath: string;
  pageTitle?: string;
  title?: string;
  moduleName?: string;
  component?: boolean;
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

type EntityTranslationKey = { translationKey: string; translationValue: string; language: string };

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
    /**
     * Register a Font Awesome icon, like circle-info. Optional: a client framework implements it when it registers its icons.
     */
    addIconImport?(args: { icon: string }): void;
    /**
     * Add a route to the administration. Optional: a client framework implements it when it has the administration routes.
     */
    addAdminRoute?(args: ClientAdminRoute): void;
    /**
     * Add an item to the administration menu, and register its icon. Optional, like the other menu methods.
     */
    addItemToAdminMenu?(args: ClientMenuItem): void;
    /**
     * Add an item at the end of the account menu, shown with or without an authenticated account, and register its icon.
     * Optional: a client framework implements it when its account menu has the add-element-to-account-menu needle.
     */
    addItemToAccountMenu?(args: ClientMenuItem): void;
    /**
     * Add webpack config.
     *
     * @deprecated webpack is not supported by any client framework anymore.
     */
    addWebpackConfig?(args: { config: string }): void;
    addEntityTranslationKey: (arg: EntityTranslationKey | EntityTranslationKey[]) => void;
  };
