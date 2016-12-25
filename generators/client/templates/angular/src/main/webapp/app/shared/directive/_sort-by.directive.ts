import { Directive, Host, HostListener, Input } from '@angular/core';
import { <%=jhiPrefixCapitalized%>SortDirective } from './sort.directive';

@Directive({
    selector: '[<%=jhiPrefix%>SortBy]'
})
export class <%=jhiPrefixCapitalized%>SortByDirective {

    @Input() <%=jhiPrefix%>SortBy: string;

    <%=jhiPrefix%>Sort: <%=jhiPrefixCapitalized%>SortDirective;

    constructor(@Host() <%=jhiPrefix%>Sort: <%=jhiPrefixCapitalized%>SortDirective,  private el: ElementRef, private _renderer: Renderer) {
        this.<%=jhiPrefix%>Sort = <%=jhiPrefix%>Sort;
    }

    @HostListener('click') onClick() {
    	if (this.<%=jhiPrefix%>Sort.predicate && this.<%=jhiPrefix%>Sort.predicate !== '_score') {
        	this.<%=jhiPrefix%>Sort.sort(this.<%=jhiPrefix%>SortBy);
        	this.applyClass();
        }
    }

    applyClass () {
        let childSpan = this.el.nativeElement.children[1],
            sortDesc = 'fa-sort-desc',
            add = 'fa-sort-asc';
        if (!this.<%=jhiPrefix%>Sort.ascending) {
            add = sortDesc;
        }
        this.resetClasses(childSpan);
        this._renderer.setElementClass(childSpan, add, true);
    }

    resetClasses (childSpan) {
        let remove = childSpan.className;
        let classesToRemove = remove.split(' ');
        this._renderer.setElementClass(childSpan, classesToRemove[1], false);
    }
}
