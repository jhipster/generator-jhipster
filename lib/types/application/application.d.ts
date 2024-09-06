import type { BaseApplication, CommonClientServerApplication } from '../../../generators/base-application/types.js';
import type { ClientSourceType } from '../../../generators/client/types.js';
import type { LanguagesSource } from '../../../generators/languages/types.js';
import type { SpringBootSourceType } from '../../../generators/server/types.js';

export type ApplicationType<Entity> = BaseApplication & Partial<CommonClientServerApplication<Entity>>;
export type BaseApplicationSource = SpringBootSourceType & ClientSourceType & LanguagesSource;
