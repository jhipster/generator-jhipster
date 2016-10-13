import { Component, Input } from '@angular/core';

@Component({
    selector: 'jhi-item-count',
    inputs: ['page', 'total', 'itemsPerPage:items-per-page'],
    template: `
        <div class="info">
            Showing {{((page - 1) * itemsPerPage) == 0 ? 1 : ((page - 1) * itemsPerPage + 1)}} -
            {{(page * itemsPerPage) < total ? (page * itemsPerPage) : total}}
            of {{total}} items.
        </div>`
})
export class JhiItemCountComponent {
    page: any;
    total: any;
    itemsPerPage: any;

    constructor() {}
}
