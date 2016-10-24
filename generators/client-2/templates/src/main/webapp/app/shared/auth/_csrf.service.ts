import { Injectable } from '@angular/core';

@Injectable()
export class CSRFService {

    constructor(private $document: Document) {}

    getCSRF(name?: string) {
        name = `${name ? name : 'XSRF-TOKEN'}=`;
        let doc = this.$document;
        if (doc) {
            let ca = doc.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) === ' ') {
                    c = c.substring(1);
                }
                if (c.indexOf(name) !== -1) {
                    return c.substring(name.length, c.length);
                }
            }
        }
        return '';
    }
}
