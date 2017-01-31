import { ActivatedRoute, Params } from '@angular/router';
import { Observable } from 'rxjs';

export class MockActivatedRoute extends ActivatedRoute {
    queryParams: Observable<Params>;

    constructor(parameters?: { [key: string]: any; }) {
        super();
        this.queryParams = Observable.of(parameters);
    }
}

export class MockRouter {
    navigate = jasmine.createSpy('navigate');
}
