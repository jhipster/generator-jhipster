/**
 * Angular bootstrap Date adapter
 */
import { Injectable } from '@angular/core';
import { NgbDateAdapter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Moment } from 'moment';
import moment = require('moment');

@Injectable()
export class NgbDateMomentAdapter extends NgbDateAdapter<Moment> {

    fromModel(date: Moment): NgbDateStruct {

        return date ? { year: date.year(), month: date.month() + 1, day: date.daysInMonth() } : null;
    }

    toModel(date: NgbDateStruct): Moment {
        return date ? moment(date.year + '-' + date.month + '-' + date.day, 'YYYY-MM-DD') : null;
    }
}
