import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { IProduct } from '../product.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../product.test-samples';

import { ProductService } from './product.service';

const requireRestSample: IProduct = {
  ...sampleWithRequiredData,
};

describe('Product Service', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;
  let expectedResult: IProduct | IProduct[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(ProductService);
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

    it('should create a Product', () => {
      const product = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(product).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a Product', () => {
      const product = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(product).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a Product', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of Product', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a Product', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addProductToCollectionIfMissing', () => {
      it('should add a Product to an empty array', () => {
        const product: IProduct = sampleWithRequiredData;
        expectedResult = service.addProductToCollectionIfMissing([], product);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(product);
      });

      it('should not add a Product to an array that contains it', () => {
        const product: IProduct = sampleWithRequiredData;
        const productCollection: IProduct[] = [
          {
            ...product,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addProductToCollectionIfMissing(productCollection, product);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a Product to an array that doesn't contain it", () => {
        const product: IProduct = sampleWithRequiredData;
        const productCollection: IProduct[] = [sampleWithPartialData];
        expectedResult = service.addProductToCollectionIfMissing(productCollection, product);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(product);
      });

      it('should add only unique Product to an array', () => {
        const productArray: IProduct[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const productCollection: IProduct[] = [sampleWithRequiredData];
        expectedResult = service.addProductToCollectionIfMissing(productCollection, ...productArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const product: IProduct = sampleWithRequiredData;
        const product2: IProduct = sampleWithPartialData;
        expectedResult = service.addProductToCollectionIfMissing([], product, product2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(product);
        expect(expectedResult).toContain(product2);
      });

      it('should accept null and undefined values', () => {
        const product: IProduct = sampleWithRequiredData;
        expectedResult = service.addProductToCollectionIfMissing([], null, product, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(product);
      });

      it('should return initial array if no Product is added', () => {
        const productCollection: IProduct[] = [sampleWithRequiredData];
        expectedResult = service.addProductToCollectionIfMissing(productCollection, undefined, null);
        expect(expectedResult).toEqual(productCollection);
      });
    });

    describe('compareProduct', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareProduct(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 21536 };
        const entity2 = null;

        const compareResult1 = service.compareProduct(entity1, entity2);
        const compareResult2 = service.compareProduct(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 21536 };
        const entity2 = { id: 11926 };

        const compareResult1 = service.compareProduct(entity1, entity2);
        const compareResult2 = service.compareProduct(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 21536 };
        const entity2 = { id: 21536 };

        const compareResult1 = service.compareProduct(entity1, entity2);
        const compareResult2 = service.compareProduct(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
