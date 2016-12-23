import { Directive, Input, Output, OnInit, Renderer, EventEmitter, ElementRef } from '@angular/core';

@Directive({
    selector: '[jh-sort]'
})
export class JhSortDirective implements OnInit {
    @Input() predicate: string;
    @Input() ascending: boolean;
    @Input() callback: Function;
    @Output() predicateChange: EventEmitter<any> = new EventEmitter(false);
    @Output() ascendingChange: EventEmitter<any> = new EventEmitter(false);
    $element: any;

    constructor(el: ElementRef, renderer: Renderer) {
        this.$element = $(el.nativeElement);
    }

    ngOnInit() {
        //TODO needs to be validated
        this.resetClasses();
        if (this.predicate && this.predicate !== '_score') {
            this.applyClass(this.$element.find('th[jh-sort-by=\'' + this.predicate + '\']'));
        }
    }

    applyClass(element) {
        let thisIcon = element.find('span.fa'),
            sortIcon = 'fa-sort',
            sortAsc = 'fa-sort-asc',
            sortDesc = 'fa-sort-desc',
            remove = sortIcon + ' ' + sortDesc,
            add = sortAsc;
        if (!this.ascending) {
            remove = sortIcon + ' ' + sortAsc;
            add = sortDesc;
        }
        this.resetClasses();
        thisIcon.removeClass(remove);
        thisIcon.addClass(add);
    }

    resetClasses() {
        let allThIcons = this.$element.find('span.fa'),
            sortIcon = 'fa-sort',
            sortAsc = 'fa-sort-asc',
            sortDesc = 'fa-sort-desc';
        allThIcons.removeClass(sortAsc + ' ' + sortDesc);
        allThIcons.addClass(sortIcon);
    }

    sort(field) {
        if (field !== this.predicate) {
            this.ascending = true;
        } else {
            this.ascending = !this.ascending;
        }
        this.predicate = field;
        this.predicateChange.emit(field);
        this.ascendingChange.emit(this.ascending);
        this.callback();
    }
}
