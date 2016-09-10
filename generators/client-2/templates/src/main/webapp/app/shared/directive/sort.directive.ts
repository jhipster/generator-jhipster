import { Directive, Host, Input, Renderer } from '@angular/core';

@Directive({
    selector: '[jh-sort]',
    inputs: ['predicate:jhSort', 'ascending', 'callback'],
    outputs: ['jhSortChange', 'ascendingChange'],
    host: {
        '(click)': 'onClick()'
    }
})
export class JhSortBy implements OnInit {
    predicate: string;
    ascending: string;
    callback: Function;
    jhSortChange: EventEmitter = new EventEmitter();
    ascendingChange: EventEmitter = new EventEmitter();
    $element: any;

    constructor(el: ElementRef, renderer: Renderer) {
        this.$element = $(el.nativeElement);
    }

    ngOnInit() {
        //TODO needs to be validated
        resetClasses();
        if (this.predicate && this.predicate !== '_score') {
            applyClass($element.find('th[jh-sort-by=\'' + this.predicate + '\']'));
        }

        function applyClass (element) {
            let thisIcon = element.find('span.glyphicon'),
                sortIcon = 'glyphicon-sort',
                sortAsc = 'glyphicon-sort-by-attributes',
                sortDesc = 'glyphicon-sort-by-attributes-alt',
                remove = sortIcon + ' ' + sortDesc,
                add = sortAsc;
            if (!this.ascending) {
                remove = sortIcon + ' ' + sortAsc;
                add = sortDesc;
            }
            resetClasses();
            thisIcon.removeClass(remove);
            thisIcon.addClass(add);
        }

        function resetClasses () {
            var allThIcons = $element.find('span.glyphicon'),
                sortIcon = 'glyphicon-sort',
                sortAsc = 'glyphicon-sort-by-attributes',
                sortDesc = 'glyphicon-sort-by-attributes-alt';
            allThIcons.removeClass(sortAsc + ' ' + sortDesc);
            allThIcons.addClass(sortIcon);
        }
    }

    sort (field) {
        if (field !== this.predicate) {
            this.ascending = true;
        } else {
            this.ascending = !this.ascending;
        }
        this.predicate = field;
        //$scope.$apply(); TODO not sure if something needs to be done here
        this.callback();
    }
}
