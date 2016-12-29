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

import {ComponentFixture, TestBed, async } from '@angular/core/testing';
import {JhiItemCountComponent} from '../../src/component/jhi-item-count.component';


function getElementHtml(element: ComponentFixture<JhiItemCountComponent>): string {
    return element.nativeElement.querySelector('.jhi-item-count').innerHTML.trim();
}

describe('JhiItemCountComponent test', () => {

    let comp: JhiItemCountComponent;
    let fixture: ComponentFixture<JhiItemCountComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [JhiItemCountComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(JhiItemCountComponent);
        comp = fixture.componentInstance;
    });

    describe('UI logic tests', () => {
        it('should initialize with undefined', () => {
            expect(comp.page).toBeUndefined();
            expect(comp.itemsPerPage).toBeUndefined();
            expect(comp.total).toBeUndefined();
        });

        it('should change the content on page change', () => {
            comp.page = 1;
            comp.itemsPerPage = 10;
            comp.total = 100;
            fixture.detectChanges();

            expect(getElementHtml(fixture)).toBe(`Showing 1 -
            10
            of 100 items.`);

            comp.page = 2;
            fixture.detectChanges();

            expect(getElementHtml(fixture)).toBe(`Showing 11 -
            20
            of 100 items.`);
        });
    });
});
