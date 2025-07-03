import { Component, inject } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { HealthDetails, HealthKey } from '../health.model';

@Component({
  selector: 'jhi-health-modal',
  templateUrl: './health-modal.component.html',
  imports: [SharedModule],
})
export default class HealthModalComponent {
  health?: { key: HealthKey; value: HealthDetails };

  private readonly activeModal = inject(NgbActiveModal);

  readableValue(value: any): string {
    if (this.health?.key === 'diskSpace') {
      // should display storage space in a human readable unit
      const val = value / 1073741824;
      if (val > 1) {
        return `${val.toFixed(2)} GB`;
      }
      return `${(value / 1048576).toFixed(2)} MB`;
    }

    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  }

  dismiss(): void {
    this.activeModal.dismiss();
  }
}
