import type { Application } from '../../types/tasks';
import type { ClientServerApplication } from '../bootstrap-application-client-server/types';

export type ClientApplication = Application &
  ClientServerApplication & {
    clientFramework: string;
    withAdminUi: boolean;
  };
