import { Sanitizer } from '@angular/core';
<%_ if (enableTranslation){ _%>
import { TranslateService } from 'ng2-translate/ng2-translate';
<%_ } _%>

import { AlertService } from './alert.service';

export function alertServiceProvider(toast?: boolean) {
    // set below to true to make alerts look like toast
    let isToast = toast ? toast : false;
    return {
        provide: AlertService,
        useFactory: (sanitizer: Sanitizer<% if (enableTranslation){ %>, translateService: TranslateService<% } %>) => new AlertService(sanitizer<% if (enableTranslation){ %>, translateService<% } %>, isToast),
        deps: [Sanitizer<% if (enableTranslation){ %>, TranslateService<% } %>]
    }
}
