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
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { JhiItemCountComponent } from '../../src/component/jhi-item-count.component';
import { JhiTranslateDirective } from '../../src/language/jhi-translate.directive';
import { JhiConfigService } from '../../src/config.service';

function getElementHtml(
    element: ComponentFixture<JhiItemCountComponent>
): string {
    const res = element.nativeElement.querySelector('.jhi-item-count');
    return res && res.innerHTML ? res.innerHTML.trim() : '';
}

describe('JhiItemCountComponent test', () => {
    let comp: JhiItemCountComponent;
    let fixture: ComponentFixture<JhiItemCountComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [JhiItemCountComponent, JhiTranslateDirective],
            imports: [TranslateModule.forRoot()],
            providers: [
                {
                    provide: JhiConfigService,
                    useValue: new JhiConfigService({
                        defaultI18nLang: 'en',
                        i18nEnabled: true
                    })
                }
            ]
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

            expect(comp.i18nValues()).toEqual({
                first: 1,
                second: 10,
                total: 100
            });

            comp.page = 2;
            fixture.detectChanges();

            expect(comp.i18nValues()).toEqual({
                first: 11,
                second: 20,
                total: 100
            });
        });

        it('should not translate the content', () => {
            comp.i18nEnabled = false;
            comp.page = 1;
            comp.itemsPerPage = 10;
            comp.total = 100;
            fixture.detectChanges();
            expect(getElementHtml(fixture)).toBe(``);

            comp.page = 2;
            fixture.detectChanges();
            expect(getElementHtml(fixture)).toBe(``);
        });
    });
});
