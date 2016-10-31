import { Injectable } from '@angular/core';
import { Cookie } from 'ng2-cookies/ng2-cookies';

@Injectable()
export class CSRFService {

    constructor() {}

    getCSRF(name?: string) {
        name = `${name ? name : 'XSRF-TOKEN'}=`;
        return Cookie.get(name);
    }
}
