import { Pipe, PipeTransform } from '@angular/core';
import { Moment } from 'moment';
import moment = require('moment');

@Pipe({name: 'moment'})
export class MomentToStringPipe implements PipeTransform {
    transform(value: Moment): string {
        if (value) {
            return value.format('YYYY-MM-DDThh:mm');
        }
        return null;
    }
}
