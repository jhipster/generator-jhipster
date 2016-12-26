import { Injectable } from '@angular/core';
import { Observable, Observer, Subscription} from 'rxjs/Rx';

@Injectable()
export class EventManager {

    observable: Observable<any>;
    observer: Observer<any>;

    constructor() {
        this.observable = Observable.create((observer: Observer<any>) => {
            this.observer = observer;
        }).share();
    }

    broadcast(event) {
        this.observer.next(event);
    }

    subscribe(eventName, callback) {
        let subscriber: Subscription = this.observable.filter((event) => {
            return event.name === eventName;
        }).subscribe(callback);
        return subscriber;
    }

    destroy(subscriber: Subscription) {
        subscriber.unsubscribe();
    }
}
