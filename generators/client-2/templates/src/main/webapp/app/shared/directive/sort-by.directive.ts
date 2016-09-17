import { Directive, Host } from '@angular/core';
import { JhSortDirective } from './sort.directive';

@Directive({
    selector: '[jh-sort-by]',
    inputs: ['jhSortBy'],
    host: {
        '(click)': 'onClick()'
    }
})
export class JhSortByDirective {
    jhSortBy: string;
    jhSort: JhSortDirective;
    constructor(@Host() jhSort: JhSortDirective) {
        this.jhSort = jhSort;
    }
    onClick() {
        this.jhSort.sort(this.jhSortBy);
    }
}
