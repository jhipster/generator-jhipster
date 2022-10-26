import type { ClientApplication } from '../client/types.mjs';
import type { SpringBootApplication } from '../server/types.mjs';

export type ClientServerApplication = ClientApplication & SpringBootApplication;
