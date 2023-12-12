import type { ClientApplication } from '../client/types.js';
import type { SpringBootApplication } from '../server/types.js';

export type ClientServerApplication = ClientApplication & SpringBootApplication;
