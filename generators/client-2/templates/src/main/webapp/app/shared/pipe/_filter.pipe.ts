import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'filter', pure: false })
export class FilterPipe implements PipeTransform {

    private filterByStringAndField(filter, field) {
        return value => {
            return !filter || (value[field] && value[field].toLowerCase().indexOf(filter.toLowerCase()) !== -1);
        }
    }

    // from https://github.com/VadimDez/ng2-filter-pipe
    private filterByString(filter) {
        return value => {
            return !filter || value.toLowerCase().indexOf(filter.toLowerCase()) !== -1;
        }
    }

    private filterDefault(filter) {
        return value => {
            return !filter || filter == value;
        }
    }

    private filterByObject(filter) {
        return value => {
            for (let key in filter) {
                if (!value.hasOwnProperty(key)) {
                    return false;
                }

                const type = typeof value[key];
                let isMatching;

                if (type === 'string') {
                    isMatching = this.filterByString(filter[key])(value[key]);
                } else if (type === 'object') {
                    isMatching = this.filterByObject(filter[key])(value[key]);
                } else {
                    isMatching = this.filterDefault(filter[key])(value[key]);
                }

                if (!isMatching) {
                    return false;
                }
            }

            return true;
        }
    }

    transform(input: Array<any>, filter: string, field: string): any {
        if (!filter) {
            return input;
        }
        const type = typeof filter;
        if (type === 'string') {
            if (field) {
                return input.filter(this.filterByStringAndField(filter, field));
            }
            return input.filter(this.filterByString(filter));
        }

        if (type === 'object') {
            return input.filter(this.filterByObject(filter));
        }
    }
}
