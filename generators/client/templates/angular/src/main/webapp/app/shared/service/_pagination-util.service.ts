import { Injectable } from '@angular/core';

@Injectable()
export class PaginationUtil  {

    parseAscending (sort: string) {
        let sortArray = sort.split(',');
        if (sortArray.length > 1){
            return sort.split(',').slice(-1)[0] === 'asc';
        } else {
            sortArray = sort.split('%2C');
            if (sortArray.length > 1){
                return sort.split('%2C').slice(-1)[0] === 'asc';
            }
            return true;
        }
    }

    // query params are strings, and need to be parsed
    parsePage (page: string) {
        return parseInt(page);
    }

    // sort can be in the format `id,asc` or `id`
    parsePredicate (sort: string) {
        let sortArray = sort.split(',');
        if (sortArray.length > 1){
            sortArray.pop();
        }
        return sortArray.join(',');
    }
}
