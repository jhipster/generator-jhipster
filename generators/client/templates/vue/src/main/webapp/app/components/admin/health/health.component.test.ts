import { shallowMount, createLocalVue } from '@vue/test-utils';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import * as config from '../../../shared/config';
import HealthComponent from '@/components/admin/health/Health.vue';
import HealthModal from '@/components/admin/health/HealthModal.vue';
import HealthService from '@/components/admin/health/HealthService.vue';

const localVue = createLocalVue();
const mockedAxios: any = axios;

config.initVueApp(localVue);
const i18n = config.initI18N(localVue);
const store = config.initVueXStore(localVue);
localVue.mixin(HealthService);
localVue.component('font-awesome-icon', FontAwesomeIcon);
localVue.component('health-modal', HealthModal);
localVue.component('b-modal', {});

jest.mock('axios', () => ({
    get: jest.fn()
}));
jest.mock('@/constants.ts', () =>({
    SERVER_API_URL: ''
}));

describe('Health Component', () => {
    let wrapper;
    let comp;

    beforeEach(() => {
        wrapper = shallowMount(HealthComponent, { store, i18n, localVue });
        comp = wrapper.vm;
    });

    it('should be a Vue instance', () => {
        expect(wrapper.isVueInstance()).toBeTruthy();
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
            expect(comp.transformHealthData(data)).toEqual(expected);
        });

        it('should flatten health data with no subsystems', () => {
            const data = {
                details: {
                    status: 'UP',
                    db: {
                        status: 'UP',
                        database: 'H2',
                        hello: '1'
                    },
                    mail: {
                        status: 'UP',
                        error: 'mail.a.b.c'
                    }
                }
            };
            const expected = [
                {
                    name: 'db',
                    status: 'UP',
                    details: {
                        database: 'H2',
                        hello: '1'
                    }
                },
                {
                    name: 'mail',
                    error: 'mail.a.b.c',
                    status: 'UP'
                }
            ];
            expect(comp.transformHealthData(data)).toEqual(expected);
        });

        it('should flatten health data with subsystems at level 1, main system has no additional information', () => {
            const data = {
                details: {
                    status: 'UP',
                    db: {
                        status: 'UP',
                        database: 'H2',
                        hello: '1'
                    },
                    mail: {
                        status: 'UP',
                        error: 'mail.a.b.c'
                    },
                    system: {
                        status: 'DOWN',
                        subsystem1: {
                            status: 'UP',
                            property1: 'system.subsystem1.property1'
                        },
                        subsystem2: {
                            status: 'DOWN',
                            error: 'system.subsystem1.error',
                            property2: 'system.subsystem2.property2'
                        }
                    }
                }
            };
            const expected = [
                {
                    name: 'db',
                    status: 'UP',
                    details: {
                        database: 'H2',
                        hello: '1'
                    }
                },
                {
                    name: 'mail',
                    error: 'mail.a.b.c',
                    status: 'UP'
                },
                {
                    name: 'system.subsystem1',
                    status: 'UP',
                    details: {
                        property1: 'system.subsystem1.property1'
                    }
                },
                {
                    name: 'system.subsystem2',
                    error: 'system.subsystem1.error',
                    status: 'DOWN',
                    details: {
                        property2: 'system.subsystem2.property2'
                    }
                }
            ];
            expect(comp.transformHealthData(data)).toEqual(expected);
        });

        it('should flatten health data with subsystems at level 1, main system has additional information', () => {
            const data = {
                details: {
                    status: 'UP',
                    db: {
                        status: 'UP',
                        database: 'H2',
                        hello: '1'
                    },
                    mail: {
                        status: 'UP',
                        error: 'mail.a.b.c'
                    },
                    system: {
                        status: 'DOWN',
                        property1: 'system.property1',
                        subsystem1: {
                            status: 'UP',
                            property1: 'system.subsystem1.property1'
                        },
                        subsystem2: {
                            status: 'DOWN',
                            error: 'system.subsystem1.error',
                            property2: 'system.subsystem2.property2'
                        }
                    }
                }
            };
            const expected = [
                {
                    name: 'db',
                    status: 'UP',
                    details: {
                        database: 'H2',
                        hello: '1'
                    }
                },
                {
                    name: 'mail',
                    error: 'mail.a.b.c',
                    status: 'UP'
                },
                {
                    name: 'system',
                    status: 'DOWN',
                    details: {
                        property1: 'system.property1'
                    }
                },
                {
                    name: 'system.subsystem1',
                    status: 'UP',
                    details: {
                        property1: 'system.subsystem1.property1'
                    }
                },
                {
                    name: 'system.subsystem2',
                    error: 'system.subsystem1.error',
                    status: 'DOWN',
                    details: {
                        property2: 'system.subsystem2.property2'
                    }
                }
            ];
            expect(comp.transformHealthData(data)).toEqual(expected);
        });

        it('should flatten health data with subsystems at level 1, main system has additional error', () => {
            const data = {
                details: {
                    status: 'UP',
                    db: {
                        status: 'UP',
                        database: 'H2',
                        hello: '1'
                    },
                    mail: {
                        status: 'UP',
                        error: 'mail.a.b.c'
                    },
                    system: {
                        status: 'DOWN',
                        error: 'show me',
                        subsystem1: {
                            status: 'UP',
                            property1: 'system.subsystem1.property1'
                        },
                        subsystem2: {
                            status: 'DOWN',
                            error: 'system.subsystem1.error',
                            property2: 'system.subsystem2.property2'
                        }
                    }
                }
            };
            const expected = [
                {
                    name: 'db',
                    status: 'UP',
                    details: {
                        database: 'H2',
                        hello: '1'
                    }
                },
                {
                    name: 'mail',
                    error: 'mail.a.b.c',
                    status: 'UP'
                },
                {
                    name: 'system',
                    error: 'show me',
                    status: 'DOWN'
                },
                {
                    name: 'system.subsystem1',
                    status: 'UP',
                    details: {
                        property1: 'system.subsystem1.property1'
                    }
                },
                {
                    name: 'system.subsystem2',
                    error: 'system.subsystem1.error',
                    status: 'DOWN',
                    details: {
                        property2: 'system.subsystem2.property2'
                    }
                }
            ];
            expect(comp.transformHealthData(data)).toEqual(expected);
        });
    });

    describe('getBadgeClass', () => {
        it('should get badge class', () => {
            const upBadgeClass = comp.getBadgeClass('UP')
            const downBadgeClass = comp.getBadgeClass('DOWN')
            expect(upBadgeClass).toEqual('badge-success');
            expect(downBadgeClass).toEqual('badge-danger');
        });
    });

    describe('refresh', () => {
        it('should call refresh on init', async () => {
            // GIVEN
            mockedAxios.get.mockReturnValue(Promise.resolve({}));

            // WHEN
            comp.refresh();
            await comp.$nextTick();

            // THEN
            expect(mockedAxios.get).toHaveBeenCalledWith('management/health');
            expect(comp.updatingHealth).toEqual(false);
        });
        it('should handle a 503 on refreshing health data', async () => {
            // GIVEN
            mockedAxios.get.mockReturnValue(Promise.reject({}));

            // WHEN
            comp.refresh();
            await comp.$nextTick();

            // THEN
            expect(mockedAxios.get).toHaveBeenCalledWith('management/health');
            expect(comp.updatingHealth).toEqual(false);
        });
    });

});
