import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { IPost } from '../post.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../post.test-samples';

import { PostService } from './post.service';

const requireRestSample: IPost = {
  ...sampleWithRequiredData,
};

describe('Post Service', () => {
  let service: PostService;
  let httpMock: HttpTestingController;
  let expectedResult: IPost | IPost[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(PostService);
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

    it('should create a Post', () => {
      const post = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(post).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a Post', () => {
      const post = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(post).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a Post', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of Post', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a Post', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addPostToCollectionIfMissing', () => {
      it('should add a Post to an empty array', () => {
        const post: IPost = sampleWithRequiredData;
        expectedResult = service.addPostToCollectionIfMissing([], post);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(post);
      });

      it('should not add a Post to an array that contains it', () => {
        const post: IPost = sampleWithRequiredData;
        const postCollection: IPost[] = [
          {
            ...post,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addPostToCollectionIfMissing(postCollection, post);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a Post to an array that doesn't contain it", () => {
        const post: IPost = sampleWithRequiredData;
        const postCollection: IPost[] = [sampleWithPartialData];
        expectedResult = service.addPostToCollectionIfMissing(postCollection, post);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(post);
      });

      it('should add only unique Post to an array', () => {
        const postArray: IPost[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const postCollection: IPost[] = [sampleWithRequiredData];
        expectedResult = service.addPostToCollectionIfMissing(postCollection, ...postArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const post: IPost = sampleWithRequiredData;
        const post2: IPost = sampleWithPartialData;
        expectedResult = service.addPostToCollectionIfMissing([], post, post2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(post);
        expect(expectedResult).toContain(post2);
      });

      it('should accept null and undefined values', () => {
        const post: IPost = sampleWithRequiredData;
        expectedResult = service.addPostToCollectionIfMissing([], null, post, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(post);
      });

      it('should return initial array if no Post is added', () => {
        const postCollection: IPost[] = [sampleWithRequiredData];
        expectedResult = service.addPostToCollectionIfMissing(postCollection, undefined, null);
        expect(expectedResult).toEqual(postCollection);
      });
    });

    describe('comparePost', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.comparePost(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 21634 };
        const entity2 = null;

        const compareResult1 = service.comparePost(entity1, entity2);
        const compareResult2 = service.comparePost(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 21634 };
        const entity2 = { id: 2872 };

        const compareResult1 = service.comparePost(entity1, entity2);
        const compareResult2 = service.comparePost(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 21634 };
        const entity2 = { id: 21634 };

        const compareResult1 = service.comparePost(entity1, entity2);
        const compareResult2 = service.comparePost(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
