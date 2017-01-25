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

import { TestBed, inject } from '@angular/core/testing';
import { Sanitizer } from '@angular/core';

import { AlertService } from '../../src/service/alert.service';
import { ConfigHelper } from '../../src/helper';

function mockAlertService(sanitizer: Sanitizer) {
    return new AlertService(sanitizer, false);
}

ConfigHelper.setModuleConfigOptions({
    i18nEnabled: false
});

describe('Alert service test', () => {

    describe('Alert Service Test', () => {
        beforeEach(() => {
            TestBed.configureTestingModule({
                providers: [{
                    provide: AlertService, useFactory: mockAlertService, deps: [Sanitizer]
                }]
            });
            // Make sure we can install mock clock
            jasmine.clock().uninstall();
            jasmine.clock().install();
        });

        afterEach(() => {
            jasmine.clock().uninstall();
        });


        it('should produce a proper alert object and fetch it', inject([AlertService], (service: AlertService) => {
            expect(service.addAlert({
                type: 'success',
                msg: 'Hello Jhipster',
                params: {},
                timeout: 3000,
                toast: true,
                position: 'top left'
            }, [])).toEqual(jasmine.objectContaining({
                type: 'success',
                msg: 'Hello Jhipster',
                id: 0,
                timeout: 3000,
                toast: true,
                position: 'top left',
                scoped: undefined
            }));

            expect(service.get().length).toBe(1);
            expect(service.get()).toContain(jasmine.objectContaining({
                type: 'success',
                msg: 'Hello Jhipster',
                id: 0,
                timeout: 3000,
                toast: true,
                position: 'top left',
                scoped: undefined
            }));
        }));

        it('should produce an alert object with correct id', inject([AlertService], (service: AlertService) => {
            service.info('Hello Jhipster info');
            expect(service.success('Hello Jhipster success')).toEqual(jasmine.objectContaining({
                type: 'success',
                msg: 'Hello Jhipster success',
                id: 1
            }));

            expect(service.get().length).toBe(2);
            expect(service.get()).toContain(jasmine.objectContaining({
                type: 'success',
                msg: 'Hello Jhipster success',
                id: 1
            }));
        }));

        it('should close an alert correctly', inject([AlertService], (service: AlertService) => {
            service.info('Hello Jhipster info');
            service.info('Hello Jhipster info 2');
            expect(service.success('Hello Jhipster success')).toEqual(jasmine.objectContaining({
                type: 'success',
                msg: 'Hello Jhipster success',
                id: 2
            }));

            expect(service.get().length).toBe(3);
            service.closeAlert(1);
            expect(service.get().length).toBe(2);
            expect(service.get()).not.toContain(jasmine.objectContaining({
                type: 'info',
                msg: 'Hello Jhipster info 2',
                id: 1
            }));
            service.closeAlert(2);
            expect(service.get().length).toBe(1);
            expect(service.get()).not.toContain(jasmine.objectContaining({
                type: 'success',
                msg: 'Hello Jhipster success',
                id: 2
            }));
            service.closeAlert(0);
            expect(service.get().length).toBe(0);
            expect(service.get()).not.toContain(jasmine.objectContaining({
                type: 'info',
                msg: 'Hello Jhipster info',
                id: 0
            }));
        }));

        it('should close an alert on timeout correctly', inject([AlertService], (service: AlertService) => {
            service.info('Hello Jhipster info');

            expect(service.get().length).toBe(1);

            jasmine.clock().tick(6000); // increment clock 6000 ms.

            expect(service.get().length).toBe(0);
        }));

        it('should clear alerts', inject([AlertService], (service: AlertService) => {
            service.info('Hello Jhipster info');
            service.error('Hello Jhipster info');
            service.success('Hello Jhipster info');
            expect(service.get().length).toBe(3);
            service.clear();
            expect(service.get().length).toBe(0);
        }));

        it('should produce a scoped alert', inject([AlertService], (service: AlertService) => {
            expect(service.addAlert({
                type: 'success',
                msg: 'Hello Jhipster',
                params: {},
                timeout: 3000,
                toast: true,
                position: 'top left',
                scoped: true
            }, [])).toEqual(jasmine.objectContaining({
                type: 'success',
                msg: 'Hello Jhipster',
                id: 0,
                timeout: 3000,
                toast: true,
                position: 'top left',
                scoped: true
            }));

            expect(service.get().length).toBe(0);
        }));

        it('should produce a success message', inject([AlertService], (service: AlertService) => {
            expect(service.success('Hello Jhipster')).toEqual(jasmine.objectContaining({
                type: 'success',
                msg: 'Hello Jhipster'
            }));
        }));

        it('should produce a success message with custom position', inject([AlertService], (service: AlertService) => {
            expect(service.success('Hello Jhipster', {}, 'bottom left')).toEqual(jasmine.objectContaining({
                type: 'success',
                msg: 'Hello Jhipster',
                position: 'bottom left',
            }));
        }));

        it('should produce a error message', inject([AlertService], (service: AlertService) => {
            expect(service.error('Hello Jhipster')).toEqual(jasmine.objectContaining({
                type: 'danger',
                msg: 'Hello Jhipster'
            }));
        }));

        it('should produce a warning message', inject([AlertService], (service: AlertService) => {
            expect(service.warning('Hello Jhipster')).toEqual(jasmine.objectContaining({
                type: 'warning',
                msg: 'Hello Jhipster'
            }));
        }));

        it('should produce a info message', inject([AlertService], (service: AlertService) => {
            expect(service.info('Hello Jhipster')).toEqual(jasmine.objectContaining({
                type: 'info',
                msg: 'Hello Jhipster'
            }));
        }));
    });
});
