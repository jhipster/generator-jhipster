import { Component, Input } from '@angular/core';

@Component({
    selector: '<%=jhiPrefix%>-item-count',
    template: `
        <div class="info">
            Showing {{((page - 1) * itemsPerPage) == 0 ? 1 : ((page - 1) * itemsPerPage + 1)}} -
            {{(page * itemsPerPage) < total ? (page * itemsPerPage) : total}}
            of {{total}} items.
        </div>`
})
export class <%=jhiPrefixCapitalized%>ItemCountComponent {
    @Input() page: any;
    @Input() total: any;
    @Input('items-per-page') itemsPerPage: any;

    constructor() {}
}
