<%#
 Copyright 2013-2018 the original author or authors from the JHipster project.

 This file is part of the JHipster project, see http://www.jhipster.tech/
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
import { ComponentFixture, TestBed, async } from '@angular/core/testing';

import { <%=angularXAppName%>TestModule } from '../../../test.module';
import { <%=jhiPrefixCapitalized%>HealthCheckComponent } from '../../../../../../main/webapp/app/admin/health/health.component';
import { <%=jhiPrefixCapitalized%>HealthService } from '../../../../../../main/webapp/app/admin/health/health.service';

describe('Component Tests', () => {

    describe('<%=jhiPrefixCapitalized%>HealthCheckComponent', () => {

        let comp: <%=jhiPrefixCapitalized%>HealthCheckComponent;
        let fixture: ComponentFixture<<%=jhiPrefixCapitalized%>HealthCheckComponent>;
        let service: <%=jhiPrefixCapitalized%>HealthService;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                imports: [<%=angularXAppName%>TestModule],
                declarations: [<%=jhiPrefixCapitalized%>HealthCheckComponent],
                providers: [
                    <%=jhiPrefixCapitalized%>HealthService
                ]
            })
            .overrideTemplate(<%=jhiPrefixCapitalized%>HealthCheckComponent, '')
            .compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(<%=jhiPrefixCapitalized%>HealthCheckComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(<%=jhiPrefixCapitalized%>HealthService);
        });

        describe('baseName and subSystemName', () => {
            it('should return the basename when it has no sub system', () => {
                expect(comp.baseName('base')).toBe('base');
            });

            it('should return the basename when it has sub systems', () => {
                expect(comp.baseName('base.subsystem.system')).toBe('base');
            });

            it('should return the sub system name', () => {
                expect(comp.subSystemName('subsystem')).toBe('');
            });

            it('should return the subsystem when it has multiple keys', () => {
                expect(comp.subSystemName('subsystem.subsystem.system')).toBe(' - subsystem.system');
            });
        });

        describe('transformHealthData', () => {
            it('should flatten empty health data', () => {
                const data = {};
                const expected = [];
                expect(service.transformHealthData(data)).toEqual(expected);
            });
        });

        it('should flatten health data with no subsystems', () => {
            const data = {
                'status': 'UP',
                'db': {
                    'status': 'UP',
                    'database': 'H2',
                    'hello': '1'
                },
                'mail': {
                    'status': 'UP',
                    'error': 'mail.a.b.c'
                }
            };
            const expected = [
                {
                    'name': 'db',
                    'status': 'UP',
                    'details': {
                        'database': 'H2',
                        'hello': '1'
                    }
                },
                {
                    'name': 'mail',
                    'error': 'mail.a.b.c',
                    'status': 'UP'
                }
            ];
            expect(service.transformHealthData(data)).toEqual(expected);
        });

        it('should flatten health data with subsystems at level 1, main system has no additional information', () => {
            const data = {
                'status': 'UP',
                'db': {
                    'status': 'UP',
                    'database': 'H2',
                    'hello': '1'
                },
                'mail': {
                    'status': 'UP',
                    'error': 'mail.a.b.c'
                },
                'system': {
                    'status': 'DOWN',
                    'subsystem1': {
                        'status': 'UP',
                        'property1': 'system.subsystem1.property1'
                    },
                    'subsystem2': {
                        'status': 'DOWN',
                        'error': 'system.subsystem1.error',
                        'property2': 'system.subsystem2.property2'
                    }
                }
            };
            const expected = [
                {
                    'name': 'db',
                    'status': 'UP',
                    'details': {
                        'database': 'H2',
                        'hello': '1'
                    }
                },
                {
                    'name': 'mail',
                    'error': 'mail.a.b.c',
                    'status': 'UP'
                },
                {
                    'name': 'system.subsystem1',
                    'status': 'UP',
                    'details': {
                        'property1': 'system.subsystem1.property1'
                    }
                },
                {
                    'name': 'system.subsystem2',
                    'error': 'system.subsystem1.error',
                    'status': 'DOWN',
                    'details': {
                        'property2': 'system.subsystem2.property2'
                    }
                }
            ];
            expect(service.transformHealthData(data)).toEqual(expected);
        });

        it('should flatten health data with subsystems at level 1, main system has additional information', () => {
            const data = {
                'status': 'UP',
                'db': {
                    'status': 'UP',
                    'database': 'H2',
                    'hello': '1'
                },
                'mail': {
                    'status': 'UP',
                    'error': 'mail.a.b.c'
                },
                'system': {
                    'status': 'DOWN',
                    'property1': 'system.property1',
                    'subsystem1': {
                        'status': 'UP',
                        'property1': 'system.subsystem1.property1'
                    },
                    'subsystem2': {
                        'status': 'DOWN',
                        'error': 'system.subsystem1.error',
                        'property2': 'system.subsystem2.property2'
                    }
                }
            };
            const expected = [
                {
                    'name': 'db',
                    'status': 'UP',
                    'details': {
                        'database': 'H2',
                        'hello': '1'
                    }
                },
                {
                    'name': 'mail',
                    'error': 'mail.a.b.c',
                    'status': 'UP'
                },
                {
                    'name': 'system',
                    'status': 'DOWN',
                    'details': {
                        'property1': 'system.property1'
                    }
                },
                {
                    'name': 'system.subsystem1',
                    'status': 'UP',
                    'details': {
                        'property1': 'system.subsystem1.property1'
                    }
                },
                {
                    'name': 'system.subsystem2',
                    'error': 'system.subsystem1.error',
                    'status': 'DOWN',
                    'details': {
                        'property2': 'system.subsystem2.property2'
                    }
                }
            ];
            expect(service.transformHealthData(data)).toEqual(expected);
        });

        it('should flatten health data with subsystems at level 1, main system has additional error', () => {
            const data = {
                'status': 'UP',
                'db': {
                    'status': 'UP',
                    'database': 'H2',
                    'hello': '1'
                },
                'mail': {
                    'status': 'UP',
                    'error': 'mail.a.b.c'
                },
                'system': {
                    'status': 'DOWN',
                    'error': 'show me',
                    'subsystem1': {
                        'status': 'UP',
                        'property1': 'system.subsystem1.property1'
                    },
                    'subsystem2': {
                        'status': 'DOWN',
                        'error': 'system.subsystem1.error',
                        'property2': 'system.subsystem2.property2'
                    }
                }
            };
            const expected = [
                {
                    'name': 'db',
                    'status': 'UP',
                    'details': {
                        'database': 'H2',
                        'hello': '1'
                    }
                },
                {
                    'name': 'mail',
                    'error': 'mail.a.b.c',
                    'status': 'UP'
                },
                {
                    'name': 'system',
                    'error': 'show me',
                    'status': 'DOWN'
                },
                {
                    'name': 'system.subsystem1',
                    'status': 'UP',
                    'details': {
                        'property1': 'system.subsystem1.property1'
                    }
                },
                {
                    'name': 'system.subsystem2',
                    'error': 'system.subsystem1.error',
                    'status': 'DOWN',
                    'details': {
                        'property2': 'system.subsystem2.property2'
                    }
                }
            ];
            expect(service.transformHealthData(data)).toEqual(expected);
        });
    });
});
