import { Directive, Host, HostListener, Input } from '@angular/core';
import { JhSortDirective } from './sort.directive';

@Directive({
    selector: '[jh-sort-by]',
    host: { '(click)': 'onClick()' }
})
export class JhSortByDirective {
    @Input('jh-sort-by') jhSortBy: string;
    jhSort: JhSortDirective;

    constructor(@Host() jhSort: JhSortDirective) {
        this.jhSort = jhSort;
    }

    onClick() {
        this.jhSort.sort(this.jhSortBy);
    }
}
