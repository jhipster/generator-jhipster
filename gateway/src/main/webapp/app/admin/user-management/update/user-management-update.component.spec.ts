import { ComponentFixture, TestBed, fakeAsync, inject, tick, waitForAsync } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { Authority } from 'app/config/authority.constants';
import { UserManagementService } from '../service/user-management.service';
import { User } from '../user-management.model';

import UserManagementUpdateComponent from './user-management-update.component';

describe('User Management Update Component', () => {
  let comp: UserManagementUpdateComponent;
  let fixture: ComponentFixture<UserManagementUpdateComponent>;
  let service: UserManagementService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [UserManagementUpdateComponent],
      providers: [
        provideHttpClient(),
        FormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({ user: new User(123, 'user', 'first', 'last', 'first@last.com', true, 'en', [Authority.USER], 'admin') }),
          },
        },
      ],
    })
      .overrideTemplate(UserManagementUpdateComponent, '')
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserManagementUpdateComponent);
    comp = fixture.componentInstance;
    service = TestBed.inject(UserManagementService);
  });

  describe('OnInit', () => {
    it('should load authorities and language on init', inject(
      [],
      fakeAsync(() => {
        // GIVEN
        jest.spyOn(service, 'authorities').mockReturnValue(of(['USER']));

        // WHEN
        comp.ngOnInit();

        // THEN
        expect(service.authorities).toHaveBeenCalled();
        expect(comp.authorities()).toEqual(['USER']);
      }),
    ));
  });

  describe('save', () => {
    it('should call update service on save for existing user', inject(
      [],
      fakeAsync(() => {
        // GIVEN
        const entity = { id: 123 };
        jest.spyOn(service, 'update').mockReturnValue(of(entity));
        comp.editForm.patchValue(entity);
        // WHEN
        comp.save();
        tick(); // simulate async

        // THEN
        expect(service.update).toHaveBeenCalledWith(expect.objectContaining(entity));
        expect(comp.isSaving()).toEqual(false);
      }),
    ));

    it('should call create service on save for new user', inject(
      [],
      fakeAsync(() => {
        // GIVEN
        const entity = { login: 'foo' } as User;
        jest.spyOn(service, 'create').mockReturnValue(of(entity));
        comp.editForm.patchValue(entity);
        // WHEN
        comp.save();
        tick(); // simulate async

        // THEN
        expect(comp.editForm.getRawValue().id).toBeNull();
        expect(service.create).toHaveBeenCalledWith(expect.objectContaining(entity));
        expect(comp.isSaving()).toEqual(false);
      }),
    ));
  });
});
