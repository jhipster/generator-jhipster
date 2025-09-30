import type { Config as BaseConfig } from '../base/types.d.ts';
import type { WriteContext } from '../base-core/api.ts';
import type { Application as ProjectNameApplication } from '../project-name/types.ts';

import type { BaseSimpleApplicationAddedApplicationProperties } from './application.ts';

export type { Source } from '../base/types.ts';
export type { Options } from '../base/types.ts';

export type { Features } from '../base/types.ts';

export type Application = WriteContext & ProjectNameApplication & BaseSimpleApplicationAddedApplicationProperties;

export type Config = BaseConfig & {
  baseName?: string;
};
