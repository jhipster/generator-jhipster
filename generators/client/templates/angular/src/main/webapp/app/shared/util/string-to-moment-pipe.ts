import { Pipe, PipeTransform } from '@angular/core';
import { Moment } from 'moment';
import moment = require('moment');

@Pipe({name: 'string-to-moment'})
export class StringToMomentPipe implements PipeTransform {
    transform(value: string | Moment): Moment {
        if (value) {
            const newValue = moment(value);
            return newValue;
        }
        return null;
    }
}
