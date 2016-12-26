import { Directive, Input } from '@angular/core';

@Directive({
    selector: '[<%=jhiPrefix%>Sort]'
})
export class <%=jhiPrefixCapitalized%>SortDirective {

    @Input() predicate: string;
    @Input() ascending: boolean;
    @Input() callback: Function;
    
    constructor() { }

    sort (field) {
        if (field !== this.predicate) {
            this.ascending = true;
        } else {
            this.ascending = !this.ascending;
        }
        this.predicate = field;

        this.callback();
    }
}
