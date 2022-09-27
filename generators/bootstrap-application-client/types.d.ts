import { OptionalGenericDerivedProperty } from '../base/application';
import type { Application } from '../base-application/tasks.js';
import type { CommonClientServerApplication } from '../bootstrap-application-base/types';

type ClientFrameworkType = 'no' | 'angular' | 'react' | 'vue';

declare const CLIENT_FRAMEWORK = 'clientFramework';

type ClientFramework = {
  [CLIENT_FRAMEWORK]: ClientFrameworkType;
};

type ClientFrameworkApplication = OptionalGenericDerivedProperty<ClientFramework, ClientFramework[typeof CLIENT_FRAMEWORK]>;

export type ClientApplication = Application &
  CommonClientServerApplication &
  ClientFrameworkApplication & {
    withAdminUi: boolean;
    webappLoginRegExp: string;
  };
