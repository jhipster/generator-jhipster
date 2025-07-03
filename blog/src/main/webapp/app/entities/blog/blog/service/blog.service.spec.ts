import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { IBlog } from '../blog.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../blog.test-samples';

import { BlogService } from './blog.service';

const requireRestSample: IBlog = {
  ...sampleWithRequiredData,
};

describe('Blog Service', () => {
  let service: BlogService;
  let httpMock: HttpTestingController;
  let expectedResult: IBlog | IBlog[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(BlogService);
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

    it('should create a Blog', () => {
      const blog = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(blog).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a Blog', () => {
      const blog = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(blog).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a Blog', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of Blog', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a Blog', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addBlogToCollectionIfMissing', () => {
      it('should add a Blog to an empty array', () => {
        const blog: IBlog = sampleWithRequiredData;
        expectedResult = service.addBlogToCollectionIfMissing([], blog);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(blog);
      });

      it('should not add a Blog to an array that contains it', () => {
        const blog: IBlog = sampleWithRequiredData;
        const blogCollection: IBlog[] = [
          {
            ...blog,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addBlogToCollectionIfMissing(blogCollection, blog);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a Blog to an array that doesn't contain it", () => {
        const blog: IBlog = sampleWithRequiredData;
        const blogCollection: IBlog[] = [sampleWithPartialData];
        expectedResult = service.addBlogToCollectionIfMissing(blogCollection, blog);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(blog);
      });

      it('should add only unique Blog to an array', () => {
        const blogArray: IBlog[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const blogCollection: IBlog[] = [sampleWithRequiredData];
        expectedResult = service.addBlogToCollectionIfMissing(blogCollection, ...blogArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const blog: IBlog = sampleWithRequiredData;
        const blog2: IBlog = sampleWithPartialData;
        expectedResult = service.addBlogToCollectionIfMissing([], blog, blog2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(blog);
        expect(expectedResult).toContain(blog2);
      });

      it('should accept null and undefined values', () => {
        const blog: IBlog = sampleWithRequiredData;
        expectedResult = service.addBlogToCollectionIfMissing([], null, blog, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(blog);
      });

      it('should return initial array if no Blog is added', () => {
        const blogCollection: IBlog[] = [sampleWithRequiredData];
        expectedResult = service.addBlogToCollectionIfMissing(blogCollection, undefined, null);
        expect(expectedResult).toEqual(blogCollection);
      });
    });

    describe('compareBlog', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareBlog(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 26836 };
        const entity2 = null;

        const compareResult1 = service.compareBlog(entity1, entity2);
        const compareResult2 = service.compareBlog(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 26836 };
        const entity2 = { id: 18619 };

        const compareResult1 = service.compareBlog(entity1, entity2);
        const compareResult2 = service.compareBlog(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 26836 };
        const entity2 = { id: 26836 };

        const compareResult1 = service.compareBlog(entity1, entity2);
        const compareResult2 = service.compareBlog(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
