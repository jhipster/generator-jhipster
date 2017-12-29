import * as moment from 'moment';

import { APP_FORMAT_DATETIME_LOCAL } from '../../config/constants';

export const convertDateTimeFromServer = (date: any) => {
    if (date) {
        return moment(date).format(APP_FORMAT_DATETIME_LOCAL);
    } else {
        return null;
    }
};
