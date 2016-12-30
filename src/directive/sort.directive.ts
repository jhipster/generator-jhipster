/*
 * Copyright 2016 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { Directive, Input, Output, OnInit, Renderer, EventEmitter, ElementRef } from '@angular/core';
import { ConfigHelper } from '../helper';

@Directive({
    selector: '[jhiSort]'
})
export class JhiSortDirective implements OnInit {
    @Input() predicate: string;
    @Input() ascending: boolean;
    @Input() callback: Function;
    @Input() sortIcon = 'fa-sort';
    @Input() sortAscIcon = 'fa-sort-asc';
    @Input() sortDescIcon = 'fa-sort-desc';
    @Input() sortIconSelector = 'span.fa';

    @Output() JhiSortChange: EventEmitter<any> = new EventEmitter();
    @Output() ascendingChange: EventEmitter<any> = new EventEmitter();
    element: any;

    constructor(el: ElementRef, renderer: Renderer) {
        this.element = el.nativeElement;
        let config = ConfigHelper.getConfig();
        this.sortIcon = config.sortIconSelector;
        this.sortAscIcon = config.sortAscIcon;
        this.sortDescIcon = config.sortDescIcon;
        this.sortIconSelector = config.sortIconSelector;
    }

    ngOnInit() {
        this.resetClasses();
         // TODO needs to be validated
        if (this.predicate && this.predicate !== '_score') {
            this.applyClass(this.element.querySelectorAll('th[jhiSortBy=\'' + this.predicate + '\']')[0]);
        }
    }

    sort (field: any) {
        if (field !== this.predicate) {
            this.ascending = true;
        } else {
            this.ascending = !this.ascending;
        }
        this.predicate = field;
        //$scope.$apply(); TODO not sure if something needs to be done here
        this.callback();
    }

    private resetClasses() {
        let allThIcons = this.element.querySelectorAll(this.sortIconSelector)[0];
        allThIcons.classList.remove(this.sortAscIcon + ' ' + this.sortDescIcon);
        allThIcons.classList.add(this.sortIcon);
    };

    private applyClass (element: any) {
        let thisIcon = element.querySelectorAll(this.sortIconSelector)[0],
            remove = this.sortIcon + ' ' + this.sortDescIcon,
            add = this.sortAscIcon;
        if (!this.ascending) {
            remove = this.sortIcon + ' ' + this.sortAscIcon;
            add = this.sortDescIcon;
        }
        this.resetClasses();
        thisIcon.classList.remove(remove);
        thisIcon.classList.add(add);
    };
}
