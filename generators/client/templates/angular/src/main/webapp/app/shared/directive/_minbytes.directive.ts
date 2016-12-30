import { Directive, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NG_VALIDATORS } from '@angular/forms';
import { forwardRef } from '@angular/core';
import { numberOfBytes } from './number-of-bytes';

@Directive({
    selector: '[minbytes][ngModel]',
    providers: [
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => MinbytesValidator), multi: true }
    ]
})
export class MinbytesValidator {
    @Input() minbytes: number;

    constructor() {
    }
    validate(c: FormControl) {
        return (c.value && numberOfBytes(c.value) >= this.minbytes) ? null : {
            minbytes: {
                valid: false
            }
        };
    }
}
