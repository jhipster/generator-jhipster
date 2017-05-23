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
import { Component, Input } from '@angular/core';
import { ConfigService } from '../config.service';

/**
 * A component that will take care of item count statistics of a pagination.
 */
@Component({
    selector: 'jhi-item-count',
    template: `
        <div *ngIf="i18nEnabled; else noI18n" class="info jhi-item-count" 
            jhiTranslate="global.item-count" 
            translateValues="{{i18nValues()}}"
            [attr.translateValues]="i18nValues()">  /* [attr.translateValues] is used to get entire values in tests */
        </div>
        <ng-template #noI18n class="info jhi-item-count">
            Showing {{((page - 1) * itemsPerPage) == 0 ? 1 : ((page - 1) * itemsPerPage + 1)}} -
            {{(page * itemsPerPage) < total ? (page * itemsPerPage) : total}}
            of {{total}} items.
        </ng-template>`
})
export class JhiItemCountComponent {

   /**
    *  current page number.
    */
    @Input() page: number;

   /**
    *  Total number of items.
    */
    @Input() total: number;

   /**
    *  Number of items per page.
    */
    @Input() itemsPerPage: number;

    /**
     * True if the generated application use i18n
     */
    i18nEnabled: boolean;

    /**
     * "translate-values" JSON of the template
     */
    i18nValues(): string {
        const first = ((this.page - 1) * this.itemsPerPage) === 0 ? 1 : ((this.page - 1) * this.itemsPerPage + 1);
        const second = (this.page * this.itemsPerPage) < this.total ? (this.page * this.itemsPerPage) : this.total;
        return '{first: \'' + first + '\', second: \'' + second + '\', total: \'' + this.total + '\'}';
    }

    constructor(config: ConfigService) {
        this.i18nEnabled = config.CONFIG_OPTIONS.i18nEnabled;
    }

}
