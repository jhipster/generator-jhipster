import { Directive, Host } from '@angular/core';
import { JhSort } from './sort.directive';

@Directive({
    selector: '[jh-sort-by]',
    inputs: ['jhSortBy'],
    host: {
        '(click)': 'onClick()'
    }
})
export class JhSortBy {
    jhSortBy: string;
    jhSort: JhSort;
    constructor(@Host() jhSort: JhSort) {
        this.jhSort = jhSort;
    }
    onClick() {
        this.jhSort.sort(this.jhSortBy);
    }
}
