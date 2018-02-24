import { Pipe, PipeTransform } from '@angular/core';
import { Moment } from 'moment';

@Pipe({name: 'moment'})
export class MomentToStringPipe implements PipeTransform {
    transform(value: Moment, format = 'YYYY-MM-DDThh:mm'): string {
        if (value) {
            return value.format(format);
        }
        return null;
    }
}
