<%#
 Copyright 2013-2017 the original author or authors.

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
-%>
import { ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { Renderer, ElementRef } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { <%=angular2AppName%>TestModule } from '../../../../test.module';
import { PasswordResetInitComponent } from '../../../../../../../main/webapp/app/account/password-reset/init/password-reset-init.component';
import { PasswordResetInit } from '../../../../../../../main/webapp/app/account/password-reset/init/password-reset-init.service';


describe('Component Tests', () => {

    describe('PasswordResetInitComponent', function () {
        let fixture: ComponentFixture<PasswordResetInitComponent>;
        let comp: PasswordResetInitComponent;

        beforeEach(() => {
            fixture = TestBed.configureTestingModule({
                imports: [<%=angular2AppName%>TestModule],
                declarations: [PasswordResetInitComponent],
                providers: [
                    PasswordResetInit,
                    {
                        provide: Renderer,
                        useValue: {
                            invokeElementMethod(renderElement: any, methodName: string, args?: any[]) {}
                        }
                    },
                    {
                        provide: ElementRef,
                        useValue: new ElementRef(null)
                    }
                ]
            }).overrideComponent(PasswordResetInitComponent, {
                set: {
                    template: ''
                }
            }).createComponent(PasswordResetInitComponent);
            comp = fixture.componentInstance;
            comp.ngOnInit();
        });

        it('should define its initial state', function () {
            expect(comp.success).toBeUndefined();
            expect(comp.error).toBeUndefined();
            expect(comp.errorEmailNotExists).toBeUndefined();
            expect(comp.resetAccount).toEqual({});
        });

        it('sets focus after the view has been initialized',
            inject([ElementRef], (elementRef: ElementRef) => {
                let element = fixture.nativeElement;
                let node = {
                    focus() {}
                };

                elementRef.nativeElement = element;
                spyOn(element, 'querySelector').and.returnValue(node);
                spyOn(node, 'focus');

                comp.ngAfterViewInit();

                expect(element.querySelector).toHaveBeenCalledWith('#email');
                expect(node.focus).toHaveBeenCalled();
            })
        );

        it('notifies of success upon successful requestReset',
            inject([PasswordResetInit], (service: PasswordResetInit) => {
                spyOn(service, 'save').and.returnValue(Observable.of({}));
                comp.resetAccount.email = 'user@domain.com';

                comp.requestReset();

                expect(service.save).toHaveBeenCalledWith('user@domain.com');
                expect(comp.success).toEqual('OK');
                expect(comp.error).toBeNull();
                expect(comp.errorEmailNotExists).toBeNull();
            })
        );

        it('notifies of unknown email upon email address not registered/400',
            inject([PasswordResetInit], (service: PasswordResetInit) => {
                spyOn(service, 'save').and.returnValue(Observable.throw({
                    status: 400,
                    data: 'email address not registered'
                }));
                comp.resetAccount.email = 'user@domain.com';

                comp.requestReset();

                expect(service.save).toHaveBeenCalledWith('user@domain.com');
                expect(comp.success).toBeNull();
                expect(comp.error).toBeNull();
                expect(comp.errorEmailNotExists).toEqual('ERROR');
            })
        );

        it('notifies of error upon error response',
            inject([PasswordResetInit], (service: PasswordResetInit) => {
                spyOn(service, 'save').and.returnValue(Observable.throw({
                    status: 503,
                    data: 'something else'
                }));
                comp.resetAccount.email = 'user@domain.com';

                comp.requestReset();

                expect(service.save).toHaveBeenCalledWith('user@domain.com');
                expect(comp.success).toBeNull();
                expect(comp.errorEmailNotExists).toBeNull();
                expect(comp.error).toEqual('ERROR');
            })
        );

    });
});
