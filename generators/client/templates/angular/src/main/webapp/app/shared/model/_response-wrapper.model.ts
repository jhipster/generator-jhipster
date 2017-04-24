import { Headers } from '@angular/http';

export class ResponseWrapper {

    constructor(
            public headers: Headers,
            public json: any) {
    }
}
