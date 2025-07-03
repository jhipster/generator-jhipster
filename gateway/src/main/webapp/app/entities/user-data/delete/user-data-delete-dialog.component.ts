import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IUserData } from '../user-data.model';
import { UserDataService } from '../service/user-data.service';

@Component({
  templateUrl: './user-data-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class UserDataDeleteDialogComponent {
  userData?: IUserData;

  protected userDataService = inject(UserDataService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.userDataService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
