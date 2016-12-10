import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';

@Injectable()
export class DateUtils {

    constructor (private datePipe:DatePipe) {}

    convertDateTimeFromServer (date: any) {
        if (date) {
            return new Date(date);
        } else {
            return null;
        }
    }

    convertLocalDateFromServer (date: any) {
        if (date) {
            let dateString = date.split('-');
            return new Date(dateString[0], dateString[1] - 1, dateString[2]);
        }
        return null;
    }

    convertLocalDateToServer (date: any) {
        if (date) {
            return this.datePipe.transform(date, 'yyyy-MM-dd');
        } else {
            return null;
        }
    }

    dateformat () {
        return 'yyyy-MM-dd';
    }
}
