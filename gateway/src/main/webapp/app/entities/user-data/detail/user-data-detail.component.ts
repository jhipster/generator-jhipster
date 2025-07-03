import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { IUserData } from '../user-data.model';

@Component({
  selector: 'jhi-user-data-detail',
  templateUrl: './user-data-detail.component.html',
  imports: [SharedModule, RouterModule],
})
export class UserDataDetailComponent {
  userData = input<IUserData | null>(null);

  previousState(): void {
    window.history.back();
  }
}
