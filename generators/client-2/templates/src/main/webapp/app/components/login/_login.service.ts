import * as angular from 'angular';

import { Injectable } from '@angular/core';

@Injectable()
export class LoginService {
    modalInstance: any;

    constructor () {
        this.modalInstance = null;
    }

    resetModal () : any {
        this.modalInstance = null;
    }

    open (loginTemplate, modalRef)  {
        modalRef.result.then((result) => {
            console.log(`Closed with: ${result}`);
        }, (reason) => {
            console.log(`Dismissed ${reason}`);
        });
    }
}
