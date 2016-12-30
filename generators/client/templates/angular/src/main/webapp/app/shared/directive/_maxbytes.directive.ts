import { Directive, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NG_VALIDATORS } from '@angular/forms';
import { forwardRef } from '@angular/core';
import { numberOfBytes } from './number-of-bytes';

@Directive({
    selector: '[maxbytes][ngModel]',
    providers: [
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => MaxbytesValidator), multi: true }
    ]
})
export class MaxbytesValidator {
    @Input() maxbytes: number;

    constructor() {
    }
    validate(c: FormControl) {
        return (c.value && numberOfBytes(c.value) <= this.maxbytes) ? null : {
            maxbytes: {
                valid: false
            }
        };
    }
}
