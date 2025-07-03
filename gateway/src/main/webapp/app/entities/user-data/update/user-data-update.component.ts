import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IUserData } from '../user-data.model';
import { UserDataService } from '../service/user-data.service';
import { UserDataFormGroup, UserDataFormService } from './user-data-form.service';

@Component({
  selector: 'jhi-user-data-update',
  templateUrl: './user-data-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class UserDataUpdateComponent implements OnInit {
  isSaving = false;
  userData: IUserData | null = null;

  protected userDataService = inject(UserDataService);
  protected userDataFormService = inject(UserDataFormService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: UserDataFormGroup = this.userDataFormService.createUserDataFormGroup();

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ userData }) => {
      this.userData = userData;
      if (userData) {
        this.updateForm(userData);
      }
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const userData = this.userDataFormService.getUserData(this.editForm);
    if (userData.id !== null) {
      this.subscribeToSaveResponse(this.userDataService.update(userData));
    } else {
      this.subscribeToSaveResponse(this.userDataService.create(userData));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IUserData>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: () => this.onSaveSuccess(),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(): void {
    this.previousState();
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving = false;
  }

  protected updateForm(userData: IUserData): void {
    this.userData = userData;
    this.userDataFormService.resetForm(this.editForm, userData);
  }
}
