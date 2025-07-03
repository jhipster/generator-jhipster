import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { IUserData, NewUserData } from '../user-data.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IUserData for edit and NewUserDataFormGroupInput for create.
 */
type UserDataFormGroupInput = IUserData | PartialWithRequiredKeyOf<NewUserData>;

type UserDataFormDefaults = Pick<NewUserData, 'id'>;

type UserDataFormGroupContent = {
  id: FormControl<IUserData['id'] | NewUserData['id']>;
  address: FormControl<IUserData['address']>;
};

export type UserDataFormGroup = FormGroup<UserDataFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class UserDataFormService {
  createUserDataFormGroup(userData: UserDataFormGroupInput = { id: null }): UserDataFormGroup {
    const userDataRawValue = {
      ...this.getFormDefaults(),
      ...userData,
    };
    return new FormGroup<UserDataFormGroupContent>({
      id: new FormControl(
        { value: userDataRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      address: new FormControl(userDataRawValue.address),
    });
  }

  getUserData(form: UserDataFormGroup): IUserData | NewUserData {
    return form.getRawValue() as IUserData | NewUserData;
  }

  resetForm(form: UserDataFormGroup, userData: UserDataFormGroupInput): void {
    const userDataRawValue = { ...this.getFormDefaults(), ...userData };
    form.reset(
      {
        ...userDataRawValue,
        id: { value: userDataRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): UserDataFormDefaults {
    return {
      id: null,
    };
  }
}
