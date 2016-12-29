import {ComponentFixture, TestBed, async} from '@angular/core/testing';
import {CapitalizePipe} from '../../../../../../main/webapp/app/shared/pipe/capitalize.pipe';


describe('capitalizepipe Tests', () => {

    let value ="jhipster";
    let pipe:CapitalizePipe;

    beforeEach(() => {
        pipe = new CapitalizePipe();
    });

    it('Should capitalize the first letter and lower the rest in words', () => {
        var result = pipe.transform(value);

        expect(result).toEqual("Jhipster");
    });
})
