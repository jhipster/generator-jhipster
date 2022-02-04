import { TestBed } from '@angular/core/testing';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { LoginModalService } from 'app/core/login/login-modal.service';

// Mock class for NgbModalRef
export class MockNgbModalRef {
  result: Promise<any> = new Promise(resolve => resolve('x'));
}

describe('Service Tests', () => {
  describe('Login Modal Service', () => {
    let service: LoginModalService;
    let modalService: NgbModal;

    beforeEach(() => {
      service = TestBed.get(LoginModalService);
      modalService = TestBed.get(NgbModal);
    });

    describe('Service methods', () => {
      it('Should call open method for NgbModal when open method is called', () => {
        // GIVEN
        const mockModalRef: MockNgbModalRef = new MockNgbModalRef();
        spyOn(modalService, 'open').and.returnValue(mockModalRef);

        // WHEN
        service.open();

        // THEN
        expect(modalService.open).toHaveBeenCalled();
      });

      it('Should call open method for NgbModal one time when open method is called twice', () => {
        // GIVEN
        const mockModalRef: MockNgbModalRef = new MockNgbModalRef();
        spyOn(modalService, 'open').and.returnValue(mockModalRef);

        // WHEN
        service.open();
        service.open();

        // THEN
        expect(modalService.open).toHaveBeenCalledTimes(1);
      });
    });
  });
});
