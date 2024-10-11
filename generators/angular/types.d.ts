import type { Entity } from '../../lib/types/application/entity.js';
import type { ApplicationType } from '../../lib/types/application/application.js';

export type AngularApplication = {
  angularLocaleId: string;
} & ApplicationType<Entity>;
