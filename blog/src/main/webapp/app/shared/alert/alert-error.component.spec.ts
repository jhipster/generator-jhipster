import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';

import { EventManager } from 'app/core/util/event-manager.service';
import { Alert, AlertService } from 'app/core/util/alert.service';

import { AlertErrorComponent } from './alert-error.component';

describe('Alert Error Component', () => {
  let comp: AlertErrorComponent;
  let fixture: ComponentFixture<AlertErrorComponent>;
  let eventManager: EventManager;
  let alertService: AlertService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), AlertErrorComponent],
      providers: [EventManager, AlertService],
    })
      .overrideTemplate(AlertErrorComponent, '')
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlertErrorComponent);
    comp = fixture.componentInstance;
    eventManager = TestBed.inject(EventManager);
    alertService = TestBed.inject(AlertService);
    alertService.addAlert = (alert: Alert, alerts?: Alert[]) => {
      if (alerts) {
        alerts.push(alert);
      }
      return alert;
    };
  });

  describe('Error Handling', () => {
    it('should display an alert on status 0', () => {
      // GIVEN
      eventManager.broadcast({ name: 'blogApp.httpError', content: { status: 0 } });
      // THEN
      expect(comp.alerts().length).toBe(1);
      expect(comp.alerts()[0].translationKey).toBe('error.server.not.reachable');
    });

    it('should display an alert on status 404', () => {
      // GIVEN
      eventManager.broadcast({ name: 'blogApp.httpError', content: { status: 404 } });
      // THEN
      expect(comp.alerts().length).toBe(1);
      expect(comp.alerts()[0].translationKey).toBe('error.url.not.found');
    });

    it('should display an alert on generic error', () => {
      // GIVEN
      eventManager.broadcast({ name: 'blogApp.httpError', content: { error: { message: 'Error Message' } } });
      eventManager.broadcast({ name: 'blogApp.httpError', content: { error: 'Second Error Message' } });
      // THEN
      expect(comp.alerts().length).toBe(2);
      expect(comp.alerts()[0].translationKey).toBe('Error Message');
      expect(comp.alerts()[1].translationKey).toBe('Second Error Message');
    });

    it('should display an alert on status 400 for generic error', () => {
      // GIVEN
      const response = new HttpErrorResponse({
        url: 'http://localhost:8080/api/foos',
        headers: new HttpHeaders(),
        status: 400,
        statusText: 'Bad Request',
        error: {
          type: 'https://www.jhipster.tech/problem/problem-with-message',
          title: 'Bad Request',
          status: 400,
          path: '/api/foos',
          message: 'error.validation',
        },
      });
      eventManager.broadcast({ name: 'blogApp.httpError', content: response });
      // THEN
      expect(comp.alerts().length).toBe(1);
      expect(comp.alerts()[0].translationKey).toBe('error.validation');
    });

    it('should display an alert on status 400 for generic error without message', () => {
      // GIVEN
      const response = new HttpErrorResponse({
        url: 'http://localhost:8080/api/foos',
        headers: new HttpHeaders(),
        status: 400,
        error: 'Bad Request',
      });
      eventManager.broadcast({ name: 'blogApp.httpError', content: response });
      // THEN
      expect(comp.alerts().length).toBe(1);
      expect(comp.alerts()[0].translationKey).toBe('Bad Request');
    });

    it('should display an alert on status 400 for invalid parameters', () => {
      // GIVEN
      const response = new HttpErrorResponse({
        url: 'http://localhost:8080/api/foos',
        headers: new HttpHeaders(),
        status: 400,
        statusText: 'Bad Request',
        error: {
          type: 'https://www.jhipster.tech/problem/problem-with-message',
          title: 'Method argument not valid',
          status: 400,
          path: '/api/foos',
          message: 'error.validation',
          fieldErrors: [{ objectName: 'foo', field: 'minField', message: 'Min' }],
        },
      });
      eventManager.broadcast({ name: 'blogApp.httpError', content: response });
      // THEN
      expect(comp.alerts().length).toBe(1);
      expect(comp.alerts()[0].translationKey).toBe('error.Size');
    });

    it('should display an alert on status 400 for error headers', () => {
      // GIVEN
      const response = new HttpErrorResponse({
        url: 'http://localhost:8080/api/foos',
        headers: new HttpHeaders().append('app-error', 'Error Message').append('app-params', 'foo'),
        status: 400,
        statusText: 'Bad Request',
        error: {
          status: 400,
          message: 'error.validation',
        },
      });
      eventManager.broadcast({ name: 'blogApp.httpError', content: response });
      // THEN
      expect(comp.alerts().length).toBe(1);
      expect(comp.alerts()[0].translationKey).toBe('Error Message');
    });

    it('should display an alert on status 500 with detail', () => {
      // GIVEN
      const response = new HttpErrorResponse({
        url: 'http://localhost:8080/api/foos',
        headers: new HttpHeaders(),
        status: 500,
        statusText: 'Internal server error',
        error: {
          status: 500,
          message: 'error.http.500',
          detail: 'Detailed error message',
        },
      });
      eventManager.broadcast({ name: 'blogApp.httpError', content: response });
      // THEN
      expect(comp.alerts().length).toBe(1);
      expect(comp.alerts()[0].translationKey).toBe('error.http.500');
    });
  });
});
