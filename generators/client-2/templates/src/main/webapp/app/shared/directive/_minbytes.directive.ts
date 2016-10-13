import { Directive, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NG_VALIDATORS } from '@angular/forms';
import { forwardRef } from '@angular/core';
import { numberOfBytes } from './number-of-bytes';

function validateMinbytesFactory() {
    return (c: FormControl, minbytes: number) => {
        return (c.value || numberOfBytes(c.value) >= minbytes) ? null : {
            minbytes: {
                valid: false
            }
        };
    };
}

@Directive({
    selector: '[minbytes][ngModel]',
    providers: [
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => MinbytesValidator), multi: true }
    ]
})
export class MinbytesValidator {
    @Input() minbytes: number;
    validator: Function;

    constructor() {
        this.validator = validateMinbytesFactory();
    }
    validate(c: FormControl) {
        return this.validator(c, this.minbytes);
    }
}
