import type { Simplify } from 'type-fest';

import type { Config as AppConfig, Options as AppOptions } from '../../generators/app/types.d.ts';
import type { Config as BaseConfig, Options as BaseOptions } from '../../generators/base/types.d.ts';
import type { Config as BaseApplicationConfig, Options as BaseApplicationOptions } from '../../generators/base-application/types.d.ts';
import type { Config as BootstrapConfig, Options as BootstrapOptions } from '../../generators/bootstrap/types.d.ts';
import type { Config as ClientConfig, Options as ClientOptions } from '../../generators/client/types.d.ts';
import type { Config as GitConfig, Options as GitOptions } from '../../generators/git/types.d.ts';
import type { Config as JavaConfig, Options as JavaOptions } from '../../generators/java/types.d.ts';
import type { Config as JavascriptConfig, Options as JavascriptOptions } from '../../generators/javascript/entity.ts';
import type { Config as JdlBootstrapConfig, Options as JdlBootstrapOptions } from '../../generators/jdl/generators/bootstrap/types.d.ts';
import type { Config as JdlConfig, Options as JdlOptions } from '../../generators/jdl/types.d.ts';
import type { Config as LanguagesConfig, Options as LanguagesOptions } from '../../generators/languages/entity.ts';
import type { Config as LiquibaseConfig, Options as LiquibaseOptions } from '../../generators/liquibase/types.d.ts';
import type { Config as ProjectNameConfig, Options as ProjectNameOptions } from '../../generators/project-name/types.d.ts';
import type { Config as ServerConfig, Options as ServerOptions } from '../../generators/server/types.d.ts';
import type { Config as SpringBootConfig, Options as SpringBootOptions } from '../../generators/spring-boot/types.d.ts';
import type { Config as SpringCacheConfig, Options as SpringCacheOptions } from '../../generators/spring-cache/types.d.ts';
import type { Config as SpringCloudConfig, Options as SpringCloudOptions } from '../../generators/spring-cloud/types.d.ts';
import type {
  Config as SpringCloudStreanConfig,
  Options as SpringCloudStreamOptions,
} from '../../generators/spring-cloud-stream/types.d.ts';
import type {
  Config as SpringDataRelationalConfig,
  Options as SpringDataRelationalOptions,
} from '../../generators/spring-data-relational/types.d.ts';
import type { YO_RC_CONFIG_KEY } from '../utils/yo-rc.ts';

export type ConfigAll = Simplify<
  AppConfig &
    BaseConfig &
    BaseApplicationConfig &
    BootstrapConfig &
    ClientConfig &
    GitConfig &
    JavaConfig &
    JavascriptConfig &
    JdlBootstrapConfig &
    JdlConfig &
    LanguagesConfig &
    LiquibaseConfig &
    ProjectNameConfig &
    ServerConfig &
    SpringBootConfig &
    SpringCacheConfig &
    SpringCloudConfig &
    SpringCloudStreanConfig &
    SpringDataRelationalConfig & {
      creationTimestamp?: number;
      microfrontends?: { baseName: string }[];
    }
>;

export type OptionsAll = Simplify<
  AppOptions &
    BaseOptions &
    BaseApplicationOptions &
    BootstrapOptions &
    ClientOptions &
    GitOptions &
    JavaOptions &
    JavascriptOptions &
    JdlBootstrapOptions &
    JdlOptions &
    LanguagesOptions &
    LiquibaseOptions &
    ProjectNameOptions &
    ServerOptions &
    SpringBootOptions &
    SpringCacheOptions &
    SpringCloudOptions &
    SpringCloudStreamOptions &
    SpringDataRelationalOptions
>;

export type YoRcContent<Content = ConfigAll> = Record<typeof YO_RC_CONFIG_KEY, Content>;
