import { XSRFStrategy, CookieXSRFStrategy } from '@angular/http';

export const XSRFStrategyProvider: any = {
    provide: XSRFStrategy,
    useValue:  new CookieXSRFStrategy('CSRF-TOKEN', 'X-CSRF-TOKEN')
}
