import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';

import ConfigurationComponent from './configuration.component';
import { ConfigurationService } from './configuration.service';
import { Bean, PropertySource } from './configuration.model';

describe('ConfigurationComponent', () => {
  let comp: ConfigurationComponent;
  let fixture: ComponentFixture<ConfigurationComponent>;
  let service: ConfigurationService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ConfigurationComponent],
      providers: [provideHttpClient(), ConfigurationService],
    })
      .overrideTemplate(ConfigurationComponent, '')
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigurationComponent);
    comp = fixture.componentInstance;
    service = TestBed.inject(ConfigurationService);
  });

  describe('OnInit', () => {
    it('should call load all on init', () => {
      // GIVEN
      const beans: Bean[] = [
        {
          prefix: 'jhipster',
          properties: {
            clientApp: {
              name: 'jhipsterApp',
            },
          },
        },
      ];
      const propertySources: PropertySource[] = [
        {
          name: 'server.ports',
          properties: {
            'local.server.port': {
              value: '8080',
            },
          },
        },
      ];
      jest.spyOn(service, 'getBeans').mockReturnValue(of(beans));
      jest.spyOn(service, 'getPropertySources').mockReturnValue(of(propertySources));

      // WHEN
      comp.ngOnInit();

      // THEN
      expect(service.getBeans).toHaveBeenCalled();
      expect(service.getPropertySources).toHaveBeenCalled();
      expect(comp.allBeans()).toEqual(beans);
      expect(comp.beans()).toEqual(beans);
      expect(comp.propertySources()).toEqual(propertySources);
    });
  });
});
