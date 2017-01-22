import { Injectable } from '@angular/core';
import { SessionStorageService } from 'ng2-webstorage';

@Injectable()
export class StateStorageService {
    constructor(
        private $sessionStorage: SessionStorageService
    ) {}

    getPreviousState() {
        return this.$sessionStorage.retrieve('previousState');
    }

    resetPreviousState() {
        this.$sessionStorage.clear('previousState');
    }

    storePreviousState(previousStateName, previousStateParams) {
        let previousState = { 'name': previousStateName, 'params': previousStateParams };
        this.$sessionStorage.store('previousState', previousState);
    }

    getDestinationState() {
        return this.$sessionStorage.retrieve('destinationState');
    }

    // Migrate to ng-router or remove
    // storeDestinationState(destinationState: StateDeclaration, destinationStateParams, fromState: StateDeclaration) {
    //     let destinationInfo = {
    //         'destination': {
    //             'name': destinationState.name,
    //             'data': destinationState.data,
    //             'parent': destinationState.parent
    //         },
    //         'params': destinationStateParams,
    //         'from': {
    //             'name': fromState.name,
    //             'data': fromState.data,
    //             'parent': fromState.parent
    //          }
    //     };
    //     this.$sessionStorage.store('destinationState', destinationInfo);
    // }
}
