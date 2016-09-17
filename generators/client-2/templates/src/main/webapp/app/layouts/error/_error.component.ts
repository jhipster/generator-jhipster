import { Component, OnInit, Inject } from '@angular/core';

@Component({
    selector: 'error',
    templateUrl: 'app/layouts/error/error.html'
})
export class ErrorComponent implements OnInit {
    errorMessage: string;

    constructor() {}

    ngOnInit() {
        //TODO need to see how the error message can be passed here
    }
}
