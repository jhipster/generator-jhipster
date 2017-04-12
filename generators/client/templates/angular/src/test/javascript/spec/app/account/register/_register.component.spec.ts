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
import { ComponentFixture, TestBed, async, inject, tick, fakeAsync } from '@angular/core/testing';
import { Renderer, ElementRef } from '@angular/core';
import { Observable } from 'rxjs/Rx';
<%_ if (enableTranslation) { _%>
import { JhiLanguageService } from 'ng-jhipster';
import { MockLanguageService } from '../../../helpers/mock-language.service';
<%_ } _%>
import { <%=angular2AppName%>TestModule } from '../../../test.module';
import { LoginModalService } from '../../../../../../main/webapp/app/shared';
import { Register } from '../../../../../../main/webapp/app/account/register/register.service';
import { RegisterComponent } from '../../../../../../main/webapp/app/account/register/register.component';


describe('Component Tests', () => {

    describe('RegisterComponent', () => {
        let fixture: ComponentFixture<RegisterComponent>;
        let comp: RegisterComponent;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                imports: [<%=angular2AppName%>TestModule],
                declarations: [RegisterComponent],
                providers: [
                    Register,
                    {
                        provide: LoginModalService,
                        useValue: null
                    },
                    {
                        provide: Renderer,
                        useValue: null
                    },
                    {
                        provide: ElementRef,
                        useValue: null
                    }
                ]
            }).overrideComponent(RegisterComponent, {
                set: {
                    template: ''
                }
            }).compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(RegisterComponent);
            comp = fixture.componentInstance;
            comp.ngOnInit();
        });

        it('should ensure the two passwords entered match', function () {
            comp.registerAccount.password = 'password';
            comp.confirmPassword = 'non-matching';

            comp.register();

            expect(comp.doNotMatch).toEqual('ERROR');
        });

        it('should update success to OK after creating an account',
            inject([Register<% if(enableTranslation) { %>, JhiLanguageService<% } %>],
                fakeAsync((service: Register<% if(enableTranslation) { %>, mockTranslate: MockLanguageService<% } %>) => {
                    spyOn(service, 'save').and.returnValue(Observable.of({}));
                    comp.registerAccount.password = comp.confirmPassword = 'password';

                    comp.register();
                    tick();

                    expect(service.save).toHaveBeenCalledWith({
                        password: 'password',
                        langKey: '<%= nativeLanguage %>'
                    });
                    expect(comp.success).toEqual(true);
                    expect(comp.registerAccount.langKey).toEqual('<%= nativeLanguage %>');
                    <% if(enableTranslation) { %>expect(mockTranslate.getCurrentSpy).toHaveBeenCalled();<% } %>
                    expect(comp.errorUserExists).toBeNull();
                    expect(comp.errorEmailExists).toBeNull();
                    expect(comp.error).toBeNull();
                })
            )
        );

        it('should notify of user existence upon 400/login already in use',
            inject([Register],
                fakeAsync((service: Register) => {
                    spyOn(service, 'save').and.returnValue(Observable.throw({
                        status: 400,
                        _body: 'login already in use'
                    }));
                    comp.registerAccount.password = comp.confirmPassword = 'password';

                    comp.register();
                    tick();

                    expect(comp.errorUserExists).toEqual('ERROR');
                    expect(comp.errorEmailExists).toBeNull();
                    expect(comp.error).toBeNull();
                })
            )
        );

        it('should notify of email existence upon 400/email address already in use',
            inject([Register],
                fakeAsync((service: Register) => {
                    spyOn(service, 'save').and.returnValue(Observable.throw({
                        status: 400,
                        _body: 'email address already in use'
                    }));
                    comp.registerAccount.password = comp.confirmPassword = 'password';

                    comp.register();
                    tick();

                    expect(comp.errorEmailExists).toEqual('ERROR');
                    expect(comp.errorUserExists).toBeNull();
                    expect(comp.error).toBeNull();
                })
            )
        );

        it('should notify of generic error',
            inject([Register],
                fakeAsync((service: Register) => {
                    spyOn(service, 'save').and.returnValue(Observable.throw({
                        status: 503
                    }));
                    comp.registerAccount.password = comp.confirmPassword = 'password';

                    comp.register();
                    tick();

                    expect(comp.errorUserExists).toBeNull();
                    expect(comp.errorEmailExists).toBeNull();
                    expect(comp.error).toEqual('ERROR');
                })
            )
        );
    });
});
