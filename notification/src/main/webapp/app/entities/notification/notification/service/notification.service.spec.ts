import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { INotification } from '../notification.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../notification.test-samples';

import { NotificationService } from './notification.service';

const requireRestSample: INotification = {
  ...sampleWithRequiredData,
};

describe('Notification Service', () => {
  let service: NotificationService;
  let httpMock: HttpTestingController;
  let expectedResult: INotification | INotification[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(NotificationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  describe('Service methods', () => {
    it('should find an element', () => {
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.find(123).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should create a Notification', () => {
      const notification = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(notification).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a Notification', () => {
      const notification = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(notification).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a Notification', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of Notification', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a Notification', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addNotificationToCollectionIfMissing', () => {
      it('should add a Notification to an empty array', () => {
        const notification: INotification = sampleWithRequiredData;
        expectedResult = service.addNotificationToCollectionIfMissing([], notification);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(notification);
      });

      it('should not add a Notification to an array that contains it', () => {
        const notification: INotification = sampleWithRequiredData;
        const notificationCollection: INotification[] = [
          {
            ...notification,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addNotificationToCollectionIfMissing(notificationCollection, notification);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a Notification to an array that doesn't contain it", () => {
        const notification: INotification = sampleWithRequiredData;
        const notificationCollection: INotification[] = [sampleWithPartialData];
        expectedResult = service.addNotificationToCollectionIfMissing(notificationCollection, notification);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(notification);
      });

      it('should add only unique Notification to an array', () => {
        const notificationArray: INotification[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const notificationCollection: INotification[] = [sampleWithRequiredData];
        expectedResult = service.addNotificationToCollectionIfMissing(notificationCollection, ...notificationArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const notification: INotification = sampleWithRequiredData;
        const notification2: INotification = sampleWithPartialData;
        expectedResult = service.addNotificationToCollectionIfMissing([], notification, notification2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(notification);
        expect(expectedResult).toContain(notification2);
      });

      it('should accept null and undefined values', () => {
        const notification: INotification = sampleWithRequiredData;
        expectedResult = service.addNotificationToCollectionIfMissing([], null, notification, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(notification);
      });

      it('should return initial array if no Notification is added', () => {
        const notificationCollection: INotification[] = [sampleWithRequiredData];
        expectedResult = service.addNotificationToCollectionIfMissing(notificationCollection, undefined, null);
        expect(expectedResult).toEqual(notificationCollection);
      });
    });

    describe('compareNotification', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareNotification(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 16124 };
        const entity2 = null;

        const compareResult1 = service.compareNotification(entity1, entity2);
        const compareResult2 = service.compareNotification(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 16124 };
        const entity2 = { id: 16244 };

        const compareResult1 = service.compareNotification(entity1, entity2);
        const compareResult2 = service.compareNotification(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 16124 };
        const entity2 = { id: 16124 };

        const compareResult1 = service.compareNotification(entity1, entity2);
        const compareResult2 = service.compareNotification(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
