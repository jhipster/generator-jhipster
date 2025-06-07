import type { ClientSourceType } from '../client/types.js';
import type { DockerSourceType } from '../docker/types.js';
import type { LanguagesSource } from '../languages/types.js';
import type { SpringBootSourceType } from '../server/types.js';
import type { Source as BaseApplicationSource } from './types.js';

export type SourceAll = BaseApplicationSource & SpringBootSourceType & ClientSourceType & LanguagesSource & DockerSourceType;
