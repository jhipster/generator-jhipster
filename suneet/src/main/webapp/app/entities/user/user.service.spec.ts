import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { User, IUser } from './user.model';

import { UserService } from './user.service';

describe('User Service', () => {
  let service: UserService;
  let httpMock: HttpTestingController;
  let expectedResult: IUser | IUser[] | boolean | number | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    expectedResult = null;
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('Service methods', () => {
    it('should return Users', () => {
      service.query().subscribe(received => {
        expectedResult = received.body;
      });

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([new User('ABC', 'user')]);
      expect(expectedResult).toEqual([{ id: 'ABC', login: 'user' }]);
    });

    it('should propagate not found response', () => {
      service.query().subscribe({
        error: (error: HttpErrorResponse) => (expectedResult = error.status),
      });

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush('Internal Server Error', {
        status: 500,
        statusText: 'Inernal Server Error',
      });
      expect(expectedResult).toEqual(500);
    });

    describe('addUserToCollectionIfMissing', () => {
      it('should add a User to an empty array', () => {
        const user: IUser = { id: 'ABC' };
        expectedResult = service.addUserToCollectionIfMissing([], user);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(user);
      });

      it('should not add a User to an array that contains it', () => {
        const user: IUser = { id: 'ABC' };
        const userCollection: IUser[] = [
          {
            ...user,
          },
          { id: 'CBA' },
        ];
        expectedResult = service.addUserToCollectionIfMissing(userCollection, user);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a User to an array that doesn't contain it", () => {
        const user: IUser = { id: 'ABC' };
        const userCollection: IUser[] = [{ id: 'CBA' }];
        expectedResult = service.addUserToCollectionIfMissing(userCollection, user);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(user);
      });

      it('should add only unique User to an array', () => {
        const userArray: IUser[] = [{ id: 'ABC' }, { id: 'CBA' }, { id: '649e503c-9ee5-4831-a543-b25b856b91b4' }];
        const userCollection: IUser[] = [{ id: 'CBA' }];
        expectedResult = service.addUserToCollectionIfMissing(userCollection, ...userArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const user: IUser = { id: 'ABC' };
        const user2: IUser = { id: 'CBA' };
        expectedResult = service.addUserToCollectionIfMissing([], user, user2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(user);
        expect(expectedResult).toContain(user2);
      });

      it('should accept null and undefined values', () => {
        const user: IUser = { id: 'ABC' };
        expectedResult = service.addUserToCollectionIfMissing([], null, user, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(user);
      });

      it('should return initial array if no users is added', () => {
        const userCollection: IUser[] = [{ id: 'CBA' }];
        expectedResult = service.addUserToCollectionIfMissing(userCollection, null, undefined);
        expect(expectedResult).toEqual(userCollection);
      });
    });
  });
});
