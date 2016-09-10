import { Directive, Input } from '@angular/core';
import { NG_VALIDATORS } from '@angular/forms';
import { forwardRef } from '@angular/core';
import { numberOfBytes } from './number-of-bytes'

function validateMaxbytesFactory() {
    return (c: FormControl, maxbytes: number) => {
        return (c.value || numberOfBytes(c.value) <= maxbytes) ? null : {
            maxbytes: {
                valid: false
            }
        };
    };
}

@Directive({
    selector: '[maxbytes][ngModel]',
    inputs: ['maxbytes'],
    providers: [
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => MaxbytesValidator), multi: true }
    ]
})
export class MaxbytesValidator {
    maxbytes: number;
    validator: Function;

    constructor() {
        this.validator = validateMaxbytesFactory();
    }
    validate(c: FormControl) {
        return this.validator(c, maxbytes);
    }
}
