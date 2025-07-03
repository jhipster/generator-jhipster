import { Component, computed, inject, input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { Thread, ThreadState } from 'app/admin/metrics/metrics.model';
import { MetricsModalThreadsComponent } from '../metrics-modal-threads/metrics-modal-threads.component';

@Component({
  selector: 'jhi-jvm-threads',
  templateUrl: './jvm-threads.component.html',
  imports: [SharedModule],
})
export class JvmThreadsComponent {
  threads = input<Thread[] | undefined>();

  threadStats = computed(() => {
    const stats = {
      threadDumpAll: 0,
      threadDumpRunnable: 0,
      threadDumpTimedWaiting: 0,
      threadDumpWaiting: 0,
      threadDumpBlocked: 0,
    };

    this.threads()?.forEach(thread => {
      if (thread.threadState === ThreadState.Runnable) {
        stats.threadDumpRunnable += 1;
      } else if (thread.threadState === ThreadState.Waiting) {
        stats.threadDumpWaiting += 1;
      } else if (thread.threadState === ThreadState.TimedWaiting) {
        stats.threadDumpTimedWaiting += 1;
      } else if (thread.threadState === ThreadState.Blocked) {
        stats.threadDumpBlocked += 1;
      }
    });

    stats.threadDumpAll = stats.threadDumpRunnable + stats.threadDumpWaiting + stats.threadDumpTimedWaiting + stats.threadDumpBlocked;

    return stats;
  });

  private readonly modalService = inject(NgbModal);

  open(): void {
    const modalRef = this.modalService.open(MetricsModalThreadsComponent);
    modalRef.componentInstance.threads = this.threads();
  }
}
