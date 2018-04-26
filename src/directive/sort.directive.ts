/*
 Copyright 2013-2017 the original author or authors from the JHipster project.

 This file is part of the JHipster project, see https://jhipster.github.io/
 for more information.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
import { Directive, Input, Output, Renderer, EventEmitter, ElementRef } from '@angular/core';
import { JhiConfigService } from '../config.service';

@Directive({
    selector: '[jhiSort]'
})
export class JhiSortDirective {
    @Input() predicate: string;
    @Input() ascending: boolean;
    @Input() callback: Function;

    sortIcon = 'fa-sort';
    sortAscIcon = 'fa-sort-up';
    sortDescIcon = 'fa-sort-down';
    sortIconSelector = 'span.fa';

    @Output() predicateChange: EventEmitter<any> = new EventEmitter();
    @Output() ascendingChange: EventEmitter<any> = new EventEmitter();

    element: any;

    constructor(el: ElementRef, renderer: Renderer, configService: JhiConfigService) {
        this.element = el.nativeElement;
        const config = configService.getConfig();
        this.sortIcon = config.sortIcon;
        this.sortAscIcon = config.sortAscIcon;
        this.sortDescIcon = config.sortDescIcon;
        this.sortIconSelector = config.sortIconSelector;
    }

    sort(field: any) {
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
        const allThIcons = this.element.querySelectorAll(this.sortIconSelector);
        // Use normal loop instead of forEach because IE does not support forEach on NodeList.
        for (let i = 0; i < allThIcons.length; i++) {
            allThIcons[i].classList.remove(this.sortAscIcon);
            allThIcons[i].classList.remove(this.sortDescIcon);
            allThIcons[i].classList.add(this.sortIcon);
        };
    };
}
