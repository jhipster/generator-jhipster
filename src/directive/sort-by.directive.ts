import { Directive, Host, HostListener, Input } from '@angular/core';
import { JhiSortDirective } from './sort.directive';

@Directive({
    selector: '[jhiSortBy]'
})
export class JhiSortByDirective {
    @Input() jhiSortBy: string;

    jhiSort: JhiSortDirective;

    constructor(@Host() jhiSort: JhiSortDirective) {
        this.jhiSort = jhiSort;
    }

    @HostListener('click') onClick() {
        this.jhiSort.sort(this.jhiSortBy);
    }
}
