/* eslint-disable @typescript-eslint/consistent-type-imports */
import type { Simplify } from 'type-fest';
import type { ExportStoragePropertiesFromCommand } from '../../lib/command/types.js';
import type { YO_RC_CONFIG_KEY } from '../../lib/utils/yo-rc.ts';
import type { Config as BaseConfig } from '../base/types.js';
import type { Config as JavaConfig } from '../java/types.d.ts';
import type { Config as JavascriptConfig } from '../javascript/types.d.ts';

type BaseApplicationConfig = {
  entities?: string[];
  projectDescription?: string;
};

export type ApplicationConfiguration = Simplify<
  BaseApplicationConfig &
    JavaConfig &
    JavascriptConfig &
    BaseConfig & {
      baseName: string;
      applicationIndex?: number;
      creationTimestamp?: number;
      testFrameworks?: string[];
      microfrontends?: { baseName: string }[];
    } & ExportStoragePropertiesFromCommand<typeof import('../app/command.ts').default> &
    ExportStoragePropertiesFromCommand<typeof import('../base/command.ts').default> &
    ExportStoragePropertiesFromCommand<typeof import('../bootstrap-application-base/command.ts').default> &
    ExportStoragePropertiesFromCommand<typeof import('../client/command.ts').default> &
    ExportStoragePropertiesFromCommand<typeof import('../git/command.ts').default> &
    ExportStoragePropertiesFromCommand<typeof import('../jdl/command.ts').default> &
    ExportStoragePropertiesFromCommand<typeof import('../languages/command.ts').default> &
    ExportStoragePropertiesFromCommand<typeof import('../liquibase/command.ts').default> &
    ExportStoragePropertiesFromCommand<typeof import('../project-name/command.ts').default> &
    ExportStoragePropertiesFromCommand<typeof import('../server/command.ts').default> &
    ExportStoragePropertiesFromCommand<typeof import('../spring-boot/command.ts').default> &
    ExportStoragePropertiesFromCommand<typeof import('../spring-cloud/generators/gateway/command.ts').default> &
    ExportStoragePropertiesFromCommand<typeof import('../spring-data-relational/command.ts').default>
>;

export type YoRcContent<Content = ApplicationConfiguration> = Record<typeof YO_RC_CONFIG_KEY, Content>;
