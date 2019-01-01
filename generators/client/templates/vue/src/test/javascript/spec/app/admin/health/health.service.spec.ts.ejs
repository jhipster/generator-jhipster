import HealthService from '@/admin/health/health.service';

describe('Health Service', () => {
  let healthService: HealthService;

  beforeEach(() => {
    healthService = new HealthService();
  });

  describe('transformHealthData', () => {
    it('should flatten empty health data', () => {
      const data = {};
      const expected = [];
      expect(healthService.transformHealthData(data)).toEqual(expected);
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
      expect(healthService.transformHealthData(data)).toEqual(expected);
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
      expect(healthService.transformHealthData(data)).toEqual(expected);
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
      expect(healthService.transformHealthData(data)).toEqual(expected);
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
      expect(healthService.transformHealthData(data)).toEqual(expected);
    });
  });
});
