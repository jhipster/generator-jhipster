import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { LogsService } from './logs.service';

describe('Logs Service', () => {
  let service: LogsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(LogsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('Service methods', () => {
    it('should change log level', () => {
      service.changeLevel('main', 'ERROR').subscribe();

      const req = httpMock.expectOne({ method: 'POST' });
      expect(req.request.body).toEqual({ configuredLevel: 'ERROR' });
    });
  });
});
