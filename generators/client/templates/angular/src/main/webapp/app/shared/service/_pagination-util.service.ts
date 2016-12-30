import { Injectable } from '@angular/core';

@Injectable()
export class PaginationUtil  {

    parseAscending (sort: string) {
        let sortArray = sort.split(',');
        sortArray = sortArray.length > 1 ? sortArray : sort.split('%2C');
        if (sortArray.length > 1) {
            return sortArray.slice(-1)[0] === 'asc';
        }
        // default to true if no sort defined
        return true;
    }

    // query params are strings, and need to be parsed
    parsePage (page: string) {
        return parseInt(page, 10);
    }

    // sort can be in the format `id,asc` or `id`
    parsePredicate (sort: string) {
        return sort.split(',')[0].split('%2C')[0];
    }
}
