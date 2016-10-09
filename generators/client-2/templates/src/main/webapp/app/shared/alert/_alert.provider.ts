import { Sanitizer } from '@angular/core';
import { AlertService } from './alert.service';

export function alertServiceProvider(toast?: boolean) {
    // set below to true to make alerts look like toast
    let isToast = toast ? toast : false;
    return {
        provide: AlertService,
        useFactory: (sanitizer: Sanitizer) => new AlertService(sanitizer, isToast),
        deps: [Sanitizer]
    }
}
