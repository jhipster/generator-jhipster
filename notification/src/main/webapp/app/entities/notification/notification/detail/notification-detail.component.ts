import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { INotification } from '../notification.model';

@Component({
  selector: 'jhi-notification-detail',
  templateUrl: './notification-detail.component.html',
  imports: [SharedModule, RouterModule],
})
export class NotificationDetailComponent {
  notification = input<INotification | null>(null);

  previousState(): void {
    window.history.back();
  }
}
