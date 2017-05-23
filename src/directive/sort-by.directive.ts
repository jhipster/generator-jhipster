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
import { Directive, Host, HostListener, Input, ElementRef, Renderer } from '@angular/core';
import { JhiSortDirective } from './sort.directive';
import { ConfigService } from '../config.service';

@Directive({
    selector: '[jhiSortBy]'
})
export class JhiSortByDirective {
    @Input() jhiSortBy: string;

    sortAscIcon = 'fa-sort-asc';
    sortDescIcon = 'fa-sort-desc';

    jhiSort: JhiSortDirective;

    constructor(@Host() jhiSort: JhiSortDirective, private el: ElementRef, private renderer: Renderer, configService: ConfigService) {
        this.jhiSort = jhiSort;
        let config = configService.getConfig();
        this.sortAscIcon = config.sortAscIcon;
        this.sortDescIcon = config.sortDescIcon;
    }

    @HostListener('click') onClick() {
        if (this.jhiSort.predicate && this.jhiSort.predicate !== '_score') {
            this.jhiSort.sort(this.jhiSortBy);
            this.applyClass();
        }
    }

    private applyClass () {
        let childSpan = this.el.nativeElement.children[1];
        let add = this.sortAscIcon;
        if (!this.jhiSort.ascending) {
            add = this.sortDescIcon;
        }
        this.renderer.setElementClass(childSpan, add, true);
    };
}
