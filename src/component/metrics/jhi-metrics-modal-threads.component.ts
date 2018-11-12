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
import {Component} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'jhi-thread-modal',
    template: `
        <div class="modal-header">
            <h4 class="modal-title" jhiTranslate="metrics.jvm.threads.dump.title">Threads dump</h4>
            <button type="button" class="close" (click)="activeModal.dismiss('closed')">&times;</button>
        </div>
        <div class="modal-body">
            <div class="pad" *ngFor="let entry of threadDump | pureFilter:threadDumpFilter:'lockName' | keys">
                <h6>
                    <span class="badge" [ngClass]="getBadgeClass(entry.value.threadState)">{{entry.value.threadState}}</span>&nbsp;{{entry.value.threadName}} (ID
                    {{entry.value.threadId}})
                    <a (click)="entry.show = !entry.show" href="javascript:void(0);">
                        <span [hidden]="entry.show" jhiTranslate="metrics.jvm.threads.dump.show">Show StackTrace</span>
                        <span [hidden]="!entry.show" jhiTranslate="metrics.jvm.threads.dump.hide">Hide StackTrace</span>
                    </a>
                </h6>
                <div class="card" [hidden]="!entry.show">
                    <div class="card-body">
                        <div *ngFor="let st of entry.value.stackTrace | keys" class="break">
                            <samp>{{st.value.className}}.{{st.value.methodName}}(<code>{{st.value.fileName}}:{{st.value.lineNumber}}</code>)</samp>
                            <span class="mt-1"></span>
                        </div>
                    </div>
                </div>
                <table class="table table-sm table-responsive">
                    <thead>
                    <tr>
                        <th jhiTranslate="metrics.jvm.threads.dump.blockedtime">Blocked Time</th>
                        <th jhiTranslate="metrics.jvm.threads.dump.blockedcount">Blocked Count</th>
                        <th jhiTranslate="metrics.jvm.threads.dump.waitedtime">Waited Time</th>
                        <th jhiTranslate="metrics.jvm.threads.dump.waitedcount">Waited Count</th>
                        <th jhiTranslate="metrics.jvm.threads.dump.lockname">Lock Name</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td>{{entry.value.blockedTime}}</td>
                        <td>{{entry.value.blockedCount}}</td>
                        <td>{{entry.value.waitedTime}}</td>
                        <td>{{entry.value.waitedCount}}</td>
                        <td class="thread-dump-modal-lock" title="{{entry.value.lockName}}"><code>{{entry.value.lockName}}</code></td>
                    </tr>
                    </tbody>
                </table>

            </div>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary float-left" data-dismiss="modal" (click)="activeModal.dismiss('closed')">Done</button>
        </div>`
})
export class JhiThreadModalComponent {
    threadDumpFilter: any;
    threadDump: any;

    constructor(public activeModal: NgbActiveModal) {
    }

    getBadgeClass(threadState) {
        if (threadState === 'RUNNABLE') {
            return 'badge-success';
        } else if (threadState === 'WAITING') {
            return 'badge-info';
        } else if (threadState === 'TIMED_WAITING') {
            return 'badge-warning';
        } else if (threadState === 'BLOCKED') {
            return 'badge-danger';
        }
    }
}
