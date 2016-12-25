import { Directive, Host, HostListener, Input } from '@angular/core';
import { <%=jhiPrefixCapitalized%>SortDirective } from './sort.directive';

@Directive({
    selector: '[<%=jhiPrefix%>SortBy]'
})
export class <%=jhiPrefixCapitalized%>SortByDirective {
    @Input() <%=jhiPrefix%>SortBy: string;

    <%=jhiPrefix%>Sort: <%=jhiPrefixCapitalized%>SortDirective;

    constructor(@Host() <%=jhiPrefix%>Sort: <%=jhiPrefixCapitalized%>SortDirective) {
        this.<%=jhiPrefix%>Sort = <%=jhiPrefix%>Sort;
    }

    @HostListener('click') onClick() {
        this.jhSort.sort(this.<%=jhiPrefix%>SortBy);
    }
}
