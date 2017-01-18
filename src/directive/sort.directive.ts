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
import { Directive, Input, Output, Renderer, EventEmitter, ElementRef } from '@angular/core';
import { ConfigHelper } from '../helper';

@Directive({
    selector: '[jhiSort]'
})
export class JhiSortDirective {
    @Input() predicate: string;
    @Input() ascending: boolean;
    @Input() callback: Function;

    sortIcon = 'fa-sort';
    sortAscIcon = 'fa-sort-asc';
    sortDescIcon = 'fa-sort-desc';
    sortIconSelector = 'span.fa';

    @Output() predicateChange: EventEmitter<any> = new EventEmitter();
    @Output() ascendingChange: EventEmitter<any> = new EventEmitter();

    element: any;

    constructor(el: ElementRef, renderer: Renderer) {
        this.element = el.nativeElement;
        let config = ConfigHelper.getConfig();
        this.sortIcon = config.sortIcon;
        this.sortAscIcon = config.sortAscIcon;
        this.sortDescIcon = config.sortDescIcon;
        this.sortIconSelector = config.sortIconSelector;
    }

    sort (field: any) {
        this.resetClasses();
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

    private resetClasses() {
        let allThIcons = this.element.querySelectorAll(this.sortIconSelector);
        allThIcons.forEach((value) => {
            value.classList.remove(this.sortAscIcon);
            value.classList.remove(this.sortDescIcon);
            value.classList.add(this.sortIcon);
        });
    };
}
