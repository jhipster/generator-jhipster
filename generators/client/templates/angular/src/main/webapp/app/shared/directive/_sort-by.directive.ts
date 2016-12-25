import { Directive, Host, HostListener, Input } from '@angular/core';
import { <%=jhiPrefixCapitalized%>SortDirective } from './sort.directive';

@Directive({
    selector: '[<%=jhiPrefix%>SortBy]'
})
export class <%=jhiPrefixCapitalized%>SortByDirective {
    @Input() <%=jhiPrefix%>SortBy: string;

    jhSort: JhSortDirective;

    constructor(@Host() jhSort: <%=jhiPrefixCapitalized%>SortDirective) {
        this.jhSort = jhSort;
    }

    @HostListener('click') onClick() {
        this.jhSort.sort(this.<%=jhiPrefix%>SortBy);
    }
}
