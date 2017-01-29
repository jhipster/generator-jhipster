import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';

export class MockActivatedRoute extends ActivatedRoute {
    constructor() {
        super();
        this.params = Observable.of({id: 'entityId'});
    }
}
