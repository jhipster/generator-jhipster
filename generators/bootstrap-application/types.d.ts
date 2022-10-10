import type { ClientApplication } from '../bootstrap-application-client/types';
import type { SpringBootApplication } from '../bootstrap-application-server/types';

export type ClientServerApplication = ClientApplication & SpringBootApplication;
