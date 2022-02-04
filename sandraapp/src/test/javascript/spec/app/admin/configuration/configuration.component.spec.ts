import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { of } from 'rxjs';

import { TestModule } from '../../../test.module';
import { ConfigurationComponent } from 'app/admin/configuration/configuration.component';
import { ConfigurationService, Bean, PropertySource } from 'app/admin/configuration/configuration.service';

describe('Component Tests', () => {
  describe('ConfigurationComponent', () => {
    let comp: ConfigurationComponent;
    let fixture: ComponentFixture<ConfigurationComponent>;
    let service: ConfigurationService;

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [TestModule],
        declarations: [ConfigurationComponent],
        providers: [ConfigurationService],
      })
        .overrideTemplate(ConfigurationComponent, '')
        .compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(ConfigurationComponent);
      comp = fixture.componentInstance;
      service = fixture.debugElement.injector.get(ConfigurationService);
    });

    describe('OnInit', () => {
      it('Should call load all on init', () => {
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
        spyOn(service, 'getBeans').and.returnValue(of(beans));
        spyOn(service, 'getPropertySources').and.returnValue(of(propertySources));

        // WHEN
        comp.ngOnInit();

        // THEN
        expect(service.getBeans).toHaveBeenCalled();
        expect(service.getPropertySources).toHaveBeenCalled();
        expect(comp.allBeans).toEqual(beans);
        expect(comp.beans).toEqual(beans);
        expect(comp.propertySources).toEqual(propertySources);
      });
    });
  });
});
