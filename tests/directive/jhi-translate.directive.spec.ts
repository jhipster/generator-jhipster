/*
 Copyright 2013-Present the original author or authors from the JHipster project.

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
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { JhiConfigService } from '../../src/config.service';
import { JhiTranslateDirective } from '../../src/language';
import { Component } from '@angular/core';

@Component({
    template: `
        <div jhiTranslate="test"></div>
    `
})
class TestJhiTranslateDirectiveComponent {}

describe('JhiTranslate Tests', () => {
    let fixture: ComponentFixture<TestJhiTranslateDirectiveComponent>;
    let configService: JhiConfigService;
    let translateService: TranslateService;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot()],
            declarations: [JhiTranslateDirective, TestJhiTranslateDirectiveComponent],
            providers: [
                {
                    provide: JhiConfigService,
                    useValue: new JhiConfigService({
                        i18nEnabled: false
                    })
                }
            ]
        });
    }));

    beforeEach(() => {
        configService = TestBed.get(JhiConfigService);
        translateService = TestBed.get(TranslateService);

        fixture = TestBed.createComponent(TestJhiTranslateDirectiveComponent);
    });

    it('should not change HTML if i18n is disabled', () => {
        const spy = spyOn(translateService, 'get').and.callThrough();

        fixture.detectChanges();

        expect(spy).not.toHaveBeenCalled();
    });

    it('should change HTML if i18n is enabled', () => {
        const spy = spyOn(translateService, 'get').and.callThrough();

        configService.getConfig = () => ({
            i18nEnabled: true
        });

        fixture.detectChanges();

        expect(spy).toHaveBeenCalled();
    });
});
