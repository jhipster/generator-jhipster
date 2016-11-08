import { Component, OnInit, Inject } from '@angular/core';

@Component({
    selector: 'error',
    templateUrl: './error.component.html'
})
export class ErrorComponent implements OnInit {
    errorMessage: string;
    error403: boolean;

    constructor() {}

    ngOnInit() {
        //TODO need to see how the error message can be passed here
    }
}
