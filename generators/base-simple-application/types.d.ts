import type { Config as BaseConfig } from '../base/types.ts';
import type { WriteContext } from '../base-core/api.ts';
import type { Application as ProjectNameApplication } from '../project-name/types.ts';

import type { BaseSimpleApplicationAddedApplicationProperties } from './application.ts';

export type { Features, Options, Source } from '../base/types.ts';

export type Application = WriteContext &
  ProjectNameApplication &
  BaseSimpleApplicationAddedApplicationProperties &
  Pick<BaseConfig, 'removeNeedles'>;

export type Config = BaseConfig & {
  baseName?: string;
};
