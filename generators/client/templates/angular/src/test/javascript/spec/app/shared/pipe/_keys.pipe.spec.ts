import {ComponentFixture, TestBed, async} from '@angular/core/testing';
import {KeysPipe} from '../../../../../../main/webapp/app/shared/pipe/keys.pipe';

describe('keyspipe Tests', () => {

    let value ={"one" : 1, "two" : 2, "three": 3 };
    let pipe:KeysPipe;

    beforeEach(() => {
        pipe = new KeysPipe();
    });

    it('Should associate key to a value ', () => {
        var result = pipe.transform(value, null);

        expect(result).toEqual([{"key":"one","value":1},{"key":"two","value":2},{"key":"three","value":3}]);
    });
})
