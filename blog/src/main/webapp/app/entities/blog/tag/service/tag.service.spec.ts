import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { ITag } from '../tag.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../tag.test-samples';

import { TagService } from './tag.service';

const requireRestSample: ITag = {
  ...sampleWithRequiredData,
};

describe('Tag Service', () => {
  let service: TagService;
  let httpMock: HttpTestingController;
  let expectedResult: ITag | ITag[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(TagService);
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

    it('should create a Tag', () => {
      const tag = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(tag).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a Tag', () => {
      const tag = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(tag).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a Tag', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of Tag', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a Tag', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addTagToCollectionIfMissing', () => {
      it('should add a Tag to an empty array', () => {
        const tag: ITag = sampleWithRequiredData;
        expectedResult = service.addTagToCollectionIfMissing([], tag);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(tag);
      });

      it('should not add a Tag to an array that contains it', () => {
        const tag: ITag = sampleWithRequiredData;
        const tagCollection: ITag[] = [
          {
            ...tag,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addTagToCollectionIfMissing(tagCollection, tag);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a Tag to an array that doesn't contain it", () => {
        const tag: ITag = sampleWithRequiredData;
        const tagCollection: ITag[] = [sampleWithPartialData];
        expectedResult = service.addTagToCollectionIfMissing(tagCollection, tag);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(tag);
      });

      it('should add only unique Tag to an array', () => {
        const tagArray: ITag[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const tagCollection: ITag[] = [sampleWithRequiredData];
        expectedResult = service.addTagToCollectionIfMissing(tagCollection, ...tagArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const tag: ITag = sampleWithRequiredData;
        const tag2: ITag = sampleWithPartialData;
        expectedResult = service.addTagToCollectionIfMissing([], tag, tag2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(tag);
        expect(expectedResult).toContain(tag2);
      });

      it('should accept null and undefined values', () => {
        const tag: ITag = sampleWithRequiredData;
        expectedResult = service.addTagToCollectionIfMissing([], null, tag, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(tag);
      });

      it('should return initial array if no Tag is added', () => {
        const tagCollection: ITag[] = [sampleWithRequiredData];
        expectedResult = service.addTagToCollectionIfMissing(tagCollection, undefined, null);
        expect(expectedResult).toEqual(tagCollection);
      });
    });

    describe('compareTag', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareTag(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 19931 };
        const entity2 = null;

        const compareResult1 = service.compareTag(entity1, entity2);
        const compareResult2 = service.compareTag(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 19931 };
        const entity2 = { id: 16779 };

        const compareResult1 = service.compareTag(entity1, entity2);
        const compareResult2 = service.compareTag(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 19931 };
        const entity2 = { id: 19931 };

        const compareResult1 = service.compareTag(entity1, entity2);
        const compareResult2 = service.compareTag(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
