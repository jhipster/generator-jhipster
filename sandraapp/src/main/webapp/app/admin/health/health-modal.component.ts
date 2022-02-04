import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { HealthKey, HealthDetails } from './health.service';

@Component({
  selector: 'jhi-health-modal',
  templateUrl: './health-modal.component.html',
})
export class HealthModalComponent {
  health?: { key: HealthKey; value: HealthDetails };

  constructor(public activeModal: NgbActiveModal) {}

  readableValue(value: any): string {
    if (this.health && this.health.key === 'diskSpace') {
      // Should display storage space in an human readable unit
      const val = value / 1073741824;
      if (val > 1) {
        // Value
        return val.toFixed(2) + ' GB';
      } else {
        return (value / 1048576).toFixed(2) + ' MB';
      }
    }

    if (typeof value === 'object') {
      return JSON.stringify(value);
    } else {
      return value.toString();
    }
  }

  dismiss(): void {
    this.activeModal.dismiss();
  }
}
