import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { IAuthority } from '../authority.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../authority.test-samples';

import { AuthorityService } from './authority.service';

const requireRestSample: IAuthority = {
  ...sampleWithRequiredData,
};

describe('Authority Service', () => {
  let service: AuthorityService;
  let httpMock: HttpTestingController;
  let expectedResult: IAuthority | IAuthority[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(AuthorityService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  describe('Service methods', () => {
    it('should find an element', () => {
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.find('ABC').subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should create a Authority', () => {
      const authority = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(authority).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of Authority', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a Authority', () => {
      const expected = true;

      service.delete('ABC').subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addAuthorityToCollectionIfMissing', () => {
      it('should add a Authority to an empty array', () => {
        const authority: IAuthority = sampleWithRequiredData;
        expectedResult = service.addAuthorityToCollectionIfMissing([], authority);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(authority);
      });

      it('should not add a Authority to an array that contains it', () => {
        const authority: IAuthority = sampleWithRequiredData;
        const authorityCollection: IAuthority[] = [
          {
            ...authority,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addAuthorityToCollectionIfMissing(authorityCollection, authority);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a Authority to an array that doesn't contain it", () => {
        const authority: IAuthority = sampleWithRequiredData;
        const authorityCollection: IAuthority[] = [sampleWithPartialData];
        expectedResult = service.addAuthorityToCollectionIfMissing(authorityCollection, authority);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(authority);
      });

      it('should add only unique Authority to an array', () => {
        const authorityArray: IAuthority[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const authorityCollection: IAuthority[] = [sampleWithRequiredData];
        expectedResult = service.addAuthorityToCollectionIfMissing(authorityCollection, ...authorityArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const authority: IAuthority = sampleWithRequiredData;
        const authority2: IAuthority = sampleWithPartialData;
        expectedResult = service.addAuthorityToCollectionIfMissing([], authority, authority2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(authority);
        expect(expectedResult).toContain(authority2);
      });

      it('should accept null and undefined values', () => {
        const authority: IAuthority = sampleWithRequiredData;
        expectedResult = service.addAuthorityToCollectionIfMissing([], null, authority, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(authority);
      });

      it('should return initial array if no Authority is added', () => {
        const authorityCollection: IAuthority[] = [sampleWithRequiredData];
        expectedResult = service.addAuthorityToCollectionIfMissing(authorityCollection, undefined, null);
        expect(expectedResult).toEqual(authorityCollection);
      });
    });

    describe('compareAuthority', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareAuthority(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { name: '572a7ecc-bf76-43f4-8026-46b42fba586d' };
        const entity2 = null;

        const compareResult1 = service.compareAuthority(entity1, entity2);
        const compareResult2 = service.compareAuthority(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { name: '572a7ecc-bf76-43f4-8026-46b42fba586d' };
        const entity2 = { name: 'c56c1cf7-aca8-48fe-ad81-eeebbf872cb1' };

        const compareResult1 = service.compareAuthority(entity1, entity2);
        const compareResult2 = service.compareAuthority(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { name: '572a7ecc-bf76-43f4-8026-46b42fba586d' };
        const entity2 = { name: '572a7ecc-bf76-43f4-8026-46b42fba586d' };

        const compareResult1 = service.compareAuthority(entity1, entity2);
        const compareResult2 = service.compareAuthority(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
