import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { UserDataService } from '../service/user-data.service';
import { IUserData } from '../user-data.model';
import { UserDataFormService } from './user-data-form.service';

import { UserDataUpdateComponent } from './user-data-update.component';

describe('UserData Management Update Component', () => {
  let comp: UserDataUpdateComponent;
  let fixture: ComponentFixture<UserDataUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let userDataFormService: UserDataFormService;
  let userDataService: UserDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [UserDataUpdateComponent],
      providers: [
        provideHttpClient(),
        FormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            params: from([{}]),
          },
        },
      ],
    })
      .overrideTemplate(UserDataUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(UserDataUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    userDataFormService = TestBed.inject(UserDataFormService);
    userDataService = TestBed.inject(UserDataService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should update editForm', () => {
      const userData: IUserData = { id: 20887 };

      activatedRoute.data = of({ userData });
      comp.ngOnInit();

      expect(comp.userData).toEqual(userData);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IUserData>>();
      const userData = { id: 15609 };
      jest.spyOn(userDataFormService, 'getUserData').mockReturnValue(userData);
      jest.spyOn(userDataService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ userData });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: userData }));
      saveSubject.complete();

      // THEN
      expect(userDataFormService.getUserData).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(userDataService.update).toHaveBeenCalledWith(expect.objectContaining(userData));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IUserData>>();
      const userData = { id: 15609 };
      jest.spyOn(userDataFormService, 'getUserData').mockReturnValue({ id: null });
      jest.spyOn(userDataService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ userData: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: userData }));
      saveSubject.complete();

      // THEN
      expect(userDataFormService.getUserData).toHaveBeenCalled();
      expect(userDataService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IUserData>>();
      const userData = { id: 15609 };
      jest.spyOn(userDataService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ userData });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(userDataService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });
});
