import { Directive, Host, HostListener, Input } from '@angular/core';
import { JhSortDirective } from './sort.directive';

@Directive({
    selector: '[<%=jhiPrefix%>-sort-by]'
})
export class JhSortByDirective {
    @Input('<%=jhiPrefix%>-sort-by') jhSortBy: string;
    jhSort: JhSortDirective;

    constructor(@Host() jhSort: JhSortDirective) {
        this.jhSort = jhSort;
    }

    @HostListener('click') onClick() {
        this.jhSort.sort(this.jhSortBy);
    }
}
