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
'use strict';

describe('Controller Tests', function () {

    describe('<%=jhiPrefixCapitalized%>HealthCheckController', function () {
        var $scope, jhiHealthService; // actual implementations
        var createController; // local utility functions

        beforeEach(inject(function ($injector, <%=jhiPrefixCapitalized%>HealthService) {
            $scope = $injector.get('$rootScope').$new();
            jhiHealthService = <%=jhiPrefixCapitalized%>HealthService;
            var locals = {
                '$scope': $scope
            };
            createController = function() {
                $injector.get('$controller')('<%=jhiPrefixCapitalized%>HealthCheckController as vm', locals);
            };
            createController();
        }));

        describe('baseName and subSystemName', function () {
            it('should return the basename when it has no sub system', function () {
                expect($scope.vm.baseName('base')).toBe('base');
            });

            it('should return the basename when it has sub systems', function () {
                expect($scope.vm.baseName('base.subsystem.system')).toBe('base');
            });

            it('should return the sub system name', function () {
                expect($scope.vm.subSystemName('subsystem')).toBe('');
            });

            it('should return the subsystem when it has multiple keys', function () {
                expect($scope.vm.subSystemName('subsystem.subsystem.system')).toBe(' - subsystem.system');
            });


        });

        describe('transformHealthData', function () {
            it('should flatten empty health data', function () {
                var data = {};
                var expected = [];
                expect(jhiHealthService.transformHealthData(data)).toEqual(expected);
            });

            it('should flatten health data with no subsystems', function () {
                var data = {
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
                var expected = [
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
                        'status': 'UP',
                        'error': 'mail.a.b.c'
                    }
                ];
                expect(jhiHealthService.transformHealthData(data)).toEqual(expected);
            });

            it('should flatten health data with subsystems at level 1, main system has no additional information', function () {
                var data = {
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
                var expected = [
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
                        'status': 'UP',
                        'error': 'mail.a.b.c'
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
                        'status': 'DOWN',
                        'error': 'system.subsystem1.error',
                        'details': {
                            'property2': 'system.subsystem2.property2'
                        }
                    }
                ];
                expect(jhiHealthService.transformHealthData(data)).toEqual(expected);
            });

            it('should flatten health data with subsystems at level 1, main system has additional information', function () {
                var data = {
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
                var expected = [
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
                        'status': 'UP',
                        'error': 'mail.a.b.c'
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
                        'status': 'DOWN',
                        'error': 'system.subsystem1.error',
                        'details': {
                            'property2': 'system.subsystem2.property2'
                        }
                    }
                ];
                expect(jhiHealthService.transformHealthData(data)).toEqual(expected);
            });

            it('should flatten health data with subsystems at level 1, main system has additional error', function () {
                var data = {
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
                var expected = [
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
                        'status': 'UP',
                        'error': 'mail.a.b.c'
                    },
                    {
                        'name': 'system',
                        'status': 'DOWN',
                        'error': 'show me'
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
                        'status': 'DOWN',
                        'error': 'system.subsystem1.error',
                        'details': {
                            'property2': 'system.subsystem2.property2'
                        }
                    }
                ];
                expect(jhiHealthService.transformHealthData(data)).toEqual(expected);
            });
        });

    });
});
