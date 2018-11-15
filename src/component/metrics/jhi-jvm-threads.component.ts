/*
 Copyright 2013-2017 the original author or authors from the JHipster project.

 This file is part of the JHipster project, see https://jhipster.github.io/
 for more information.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
import {Component, Input, OnInit} from '@angular/core';

import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

import {JhiThreadModalComponent} from './jhi-metrics-modal-threads.component';

@Component({
    selector: 'jhi-jvm-threads',
    templateUrl: './jhi-jvm-threads.component.html'
})
export class JhiJvmThreadsComponent implements OnInit {
    threadStats: {
        threadDumpAll: number;
        threadDumpRunnable: number;
        threadDumpTimedWaiting: number;
        threadDumpWaiting: number;
        threadDumpBlocked: number;
    };

    /**
     * object containing thread related metrics
     */
    @Input() threadData: any;

    constructor(private modalService: NgbModal) {
    }

    ngOnInit() {
        this.threadStats = {
            threadDumpRunnable: 0,
            threadDumpWaiting: 0,
            threadDumpTimedWaiting: 0,
            threadDumpBlocked: 0,
            threadDumpAll: 0
        };

        this.threadData.forEach((value) => {
            if (value.threadState === 'RUNNABLE') {
                this.threadStats.threadDumpRunnable += 1;
            } else if (value.threadState === 'WAITING') {
                this.threadStats.threadDumpWaiting += 1;
            } else if (value.threadState === 'TIMED_WAITING') {
                this.threadStats.threadDumpTimedWaiting += 1;
            } else if (value.threadState === 'BLOCKED') {
                this.threadStats.threadDumpBlocked += 1;
            }
        });

        this.threadStats.threadDumpAll =
            this.threadStats.threadDumpRunnable +
            this.threadStats.threadDumpWaiting +
            this.threadStats.threadDumpTimedWaiting +
            this.threadStats.threadDumpBlocked;
    }

    open() {
        const modalRef = this.modalService.open(JhiThreadModalComponent);
        modalRef.componentInstance.threadDump = this.threadData;
    }
}
