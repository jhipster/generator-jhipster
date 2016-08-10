import { upgradeAdapter } from './upgrade_adapter';
import { HTTP_PROVIDERS, XSRFStrategy, CookieXSRFStrategy } from '@angular/http';
import { disableDeprecatedForms, provideForms } from '@angular/forms';
import './app.module';

upgradeAdapter.addProvider(HTTP_PROVIDERS);
upgradeAdapter.addProvider(disableDeprecatedForms());
upgradeAdapter.addProvider(provideForms());
upgradeAdapter.addProvider({
   provide: XSRFStrategy, useValue:  new CookieXSRFStrategy('CSRF-TOKEN', 'X-CSRF-TOKEN')
});
upgradeAdapter.bootstrap(document.body, ['<%=angularAppName%>.app'], {strictDi: true});
