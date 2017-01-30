import {SpyObject} from "./spyobject";
import {Activate} from "../../../../main/webapp/app/account/activate/activate.service";
import Spy = jasmine.Spy;

export class MockActivate extends SpyObject {

    getSpy: Spy;
    fakeResponse: any;

    constructor() {
        super(Activate);

        this.fakeResponse = null;
        this.getSpy = this.spy('get').andReturn(this);
    }

    subscribe(callback: any) {
        callback(this.fakeResponse);
    }
}
