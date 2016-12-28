import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: '<%=jhiPrefix%>-metrics-modal',
    templateUrl: './metrics-modal.component.html'
})
export class <%=jhiPrefixCapitalized%>MetricsMonitoringModalComponent implements OnInit {

    threadDumpFilter: any;
    threadDump: any;
    threadDumpAll: number = 0;
    threadDumpBlocked: number = 0;
    threadDumpRunnable: number = 0;
    threadDumpTimedWaiting: number = 0;
    threadDumpWaiting: number = 0;

    constructor(public activeModal: NgbActiveModal) {}

    ngOnInit() {
        this.threadDump.forEach((value) => {
            if (value.threadState === 'RUNNABLE') {
                this.threadDumpRunnable += 1;
            } else if (value.threadState === 'WAITING') {
                this.threadDumpWaiting += 1;
            } else if (value.threadState === 'TIMED_WAITING') {
                this.threadDumpTimedWaiting += 1;
            } else if (value.threadState === 'BLOCKED') {
                this.threadDumpBlocked += 1;
            }
        });

        this.threadDumpAll = this.threadDumpRunnable + this.threadDumpWaiting +
            this.threadDumpTimedWaiting + this.threadDumpBlocked;
    }

    getTagClass (threadState) {
        if (threadState === 'RUNNABLE') {
            return 'tag-success';
        } else if (threadState === 'WAITING') {
            return 'tag-info';
        } else if (threadState === 'TIMED_WAITING') {
            return 'tag-warning';
        } else if (threadState === 'BLOCKED') {
            return 'tag-danger';
        }
    }
}
