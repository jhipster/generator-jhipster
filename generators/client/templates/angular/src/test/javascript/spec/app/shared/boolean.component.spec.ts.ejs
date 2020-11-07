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
import { JhiBooleanComponent } from '../../src/component/jhi-boolean.component';
import { JhiConfigService } from '../../src/config.service';

function getElementHtml(element: ComponentFixture<JhiBooleanComponent>): string {
    const res = element.nativeElement.querySelector('span');
    return (res && res.innerHTML) ? res.innerHTML.trim() : '';
}

function getElementAttribute(element: ComponentFixture<JhiBooleanComponent>, value: string): string {
    let res = element.nativeElement.querySelector('span');
    if (res && res.attributes) {
        res = res.attributes.getNamedItem(value);
        return (res && res.value) ? res.value.trim() : '';
    }
    return '';
}

describe('JhiBooleanComponent test', () => {

    let comp: JhiBooleanComponent;
    let fixture: ComponentFixture<JhiBooleanComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [JhiBooleanComponent],
            providers: [
                {
                    provide: JhiConfigService,
                    useValue: new JhiConfigService({defaultI18nLang: 'en', i18nEnabled: true})
                }
            ]
        }).compileComponents();
    }));
    beforeEach(() => {
        fixture = TestBed.createComponent(JhiBooleanComponent);
        comp = fixture.componentInstance;
    });

    describe('UI logic tests', () => {
        it('should initialize with defaults', () => {
            expect(comp.value).toBeFalsy();
            expect(comp.classTrue).toBeUndefined();
            expect(comp.classFalse).toBeUndefined();
            expect(comp.textTrue).toBeUndefined();
            expect(comp.textFalse).toBeUndefined();
        });

        it('should apply fa-times and text-danger', () => {
            comp.value = false;
            fixture.detectChanges();
            expect(getElementAttribute(fixture, 'class')).toBe('fa fa-lg fa-times text-danger');
        });

        it('should apply fa-check and text-success', () => {
            comp.value = true;
            fixture.detectChanges();
            expect(getElementAttribute(fixture, 'class')).toBe('fa fa-lg fa-check text-success');
        });

        it('should apply fa fa-lg fa-times', () => {
            comp.value = false;
            comp.classFalse = 'fa fa-lg fa-times';
            fixture.detectChanges();
            expect(getElementAttribute(fixture, 'class')).toBe('fa fa-lg fa-times');
        });

        it('should apply fa fa-lg fa-check', () => {
            comp.value = true;
            comp.classTrue = 'fa fa-lg fa-check';
            fixture.detectChanges();
            expect(getElementAttribute(fixture, 'class')).toBe('fa fa-lg fa-check');
        });

        it('should apply nothing on false', () => {
            comp.value = false;
            comp.classFalse = '';
            fixture.detectChanges();
            expect(getElementAttribute(fixture, 'class')).toBe('');
        });

        it('should apply nothing on true', () => {
            comp.value = true;
            comp.classTrue = '';
            fixture.detectChanges();
            expect(getElementAttribute(fixture, 'class')).toBe('');
        });

        it('should apply badge-danger and write deactivated', () => {
            comp.value = false;
            comp.textTrue = 'activated';
            comp.textFalse = 'deactivated';
            fixture.detectChanges();
            expect(getElementAttribute(fixture, 'class')).toBe('badge badge-danger');
            expect(getElementHtml(fixture)).toBe('deactivated');
        });

        it('should apply override-danger and write deactivated', () => {
            comp.value = false;
            comp.classTrue = 'override-success';
            comp.classFalse = 'override-danger';
            comp.textTrue = 'activated';
            comp.textFalse = 'deactivated';
            fixture.detectChanges();
            expect(getElementAttribute(fixture, 'class')).toBe('override-danger');
            expect(getElementHtml(fixture)).toBe('deactivated');
        });

        it('should apply badge-success and write activated', () => {
            comp.value = true;
            comp.textTrue = 'activated';
            comp.textFalse = 'deactivated';
            fixture.detectChanges();
            expect(getElementAttribute(fixture, 'class')).toBe('badge badge-success');
            expect(getElementHtml(fixture)).toBe('activated');
        });

        it('should apply override-success and write activated', () => {
            comp.value = true;
            comp.textTrue = 'activated';
            comp.textFalse = 'deactivated';
            comp.classTrue = 'override-success';
            comp.classFalse = 'override-danger';
            fixture.detectChanges();
            expect(getElementAttribute(fixture, 'class')).toBe('override-success');
            expect(getElementHtml(fixture)).toBe('activated');
        });
    });
});
