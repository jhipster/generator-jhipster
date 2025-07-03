import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { IUserData } from '../user-data.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../user-data.test-samples';

import { UserDataService } from './user-data.service';

const requireRestSample: IUserData = {
  ...sampleWithRequiredData,
};

describe('UserData Service', () => {
  let service: UserDataService;
  let httpMock: HttpTestingController;
  let expectedResult: IUserData | IUserData[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(UserDataService);
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

    it('should create a UserData', () => {
      const userData = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(userData).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a UserData', () => {
      const userData = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(userData).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a UserData', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of UserData', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a UserData', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addUserDataToCollectionIfMissing', () => {
      it('should add a UserData to an empty array', () => {
        const userData: IUserData = sampleWithRequiredData;
        expectedResult = service.addUserDataToCollectionIfMissing([], userData);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(userData);
      });

      it('should not add a UserData to an array that contains it', () => {
        const userData: IUserData = sampleWithRequiredData;
        const userDataCollection: IUserData[] = [
          {
            ...userData,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addUserDataToCollectionIfMissing(userDataCollection, userData);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a UserData to an array that doesn't contain it", () => {
        const userData: IUserData = sampleWithRequiredData;
        const userDataCollection: IUserData[] = [sampleWithPartialData];
        expectedResult = service.addUserDataToCollectionIfMissing(userDataCollection, userData);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(userData);
      });

      it('should add only unique UserData to an array', () => {
        const userDataArray: IUserData[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const userDataCollection: IUserData[] = [sampleWithRequiredData];
        expectedResult = service.addUserDataToCollectionIfMissing(userDataCollection, ...userDataArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const userData: IUserData = sampleWithRequiredData;
        const userData2: IUserData = sampleWithPartialData;
        expectedResult = service.addUserDataToCollectionIfMissing([], userData, userData2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(userData);
        expect(expectedResult).toContain(userData2);
      });

      it('should accept null and undefined values', () => {
        const userData: IUserData = sampleWithRequiredData;
        expectedResult = service.addUserDataToCollectionIfMissing([], null, userData, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(userData);
      });

      it('should return initial array if no UserData is added', () => {
        const userDataCollection: IUserData[] = [sampleWithRequiredData];
        expectedResult = service.addUserDataToCollectionIfMissing(userDataCollection, undefined, null);
        expect(expectedResult).toEqual(userDataCollection);
      });
    });

    describe('compareUserData', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareUserData(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 15609 };
        const entity2 = null;

        const compareResult1 = service.compareUserData(entity1, entity2);
        const compareResult2 = service.compareUserData(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 15609 };
        const entity2 = { id: 20887 };

        const compareResult1 = service.compareUserData(entity1, entity2);
        const compareResult2 = service.compareUserData(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 15609 };
        const entity2 = { id: 15609 };

        const compareResult1 = service.compareUserData(entity1, entity2);
        const compareResult2 = service.compareUserData(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
