/*
 Copyright 2013-2020 the original author or authors from the JHipster project.

 This file is part of the JHipster project, see https://www.jhipster.tech/
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
import { AfterContentInit, ContentChild, Directive, Host, HostListener, Input } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';

import { JhiConfigService } from '../config.service';
import { JhiSortDirective } from './sort.directive';

@Directive({
    selector: '[jhiSortBy]'
})
export class JhiSortByDirective implements AfterContentInit {
    @Input() jhiSortBy: string;
    @ContentChild(FaIconComponent, { static: true }) iconComponent: FaIconComponent;

    sortIcon: IconDefinition;
    sortAscIcon: IconDefinition;
    sortDescIcon: IconDefinition;

    constructor(@Host() private jhiSort: JhiSortDirective, configService: JhiConfigService) {
        this.jhiSort = jhiSort;
        const config = configService.getConfig();
        this.sortIcon = config.sortIcon;
        this.sortAscIcon = config.sortAscIcon;
        this.sortDescIcon = config.sortDescIcon;
    }

    ngAfterContentInit(): void {
        if (this.jhiSort.predicate && this.jhiSort.predicate !== '_score' && this.jhiSort.predicate === this.jhiSortBy) {
            this.updateIconDefinition(this.iconComponent, this.jhiSort.ascending ? this.sortAscIcon : this.sortDescIcon);
            this.jhiSort.activeIconComponent = this.iconComponent;
        }
    }

    @HostListener('click')
    onClick() {
        if (this.jhiSort.predicate && this.jhiSort.predicate !== '_score') {
            this.jhiSort.sort(this.jhiSortBy);
            this.updateIconDefinition(this.jhiSort.activeIconComponent, this.sortIcon);
            this.updateIconDefinition(this.iconComponent, this.jhiSort.ascending ? this.sortAscIcon : this.sortDescIcon);
            this.jhiSort.activeIconComponent = this.iconComponent;
        }
    }

    private updateIconDefinition(iconComponent: FaIconComponent, icon: IconDefinition) {
        if (iconComponent) {
            iconComponent.icon = icon.iconName;
            iconComponent.render();
        }
    }
}
