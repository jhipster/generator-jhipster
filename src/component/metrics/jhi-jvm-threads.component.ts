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
import {Component, Input} from '@angular/core';

@Component({
    selector: 'jhi-jvm-threads',
    template: `
        <b jhiTranslate="metrics.jvm.threads.title">Threads</b> (Total: {{threadStats.threadDumpAll}}) <a class="hand" (click)="refreshThreadDumpData()" data-toggle="modal"
                                                                                                          data-target="#threadDump">
            <fa-icon [icon]="'eye'"></fa-icon>
        </a>
        <p><span jhiTranslate="metrics.jvm.threads.runnable">Runnable</span> {{threadStats.threadDumpRunnable}}</p>
        <ngb-progressbar [value]="threadStats.threadDumpRunnable" [max]="threadStats.threadDumpAll" [striped]="true" [animated]="false" type="success">
            <span>{{threadStats.threadDumpRunnable * 100 / threadStats.threadDumpAll | number:'1.0-0'}}%</span>
        </ngb-progressbar>
        <p><span jhiTranslate="metrics.jvm.threads.timedwaiting">Timed Waiting</span> ({{threadStats.threadDumpTimedWaiting}})</p>
        <ngb-progressbar [value]="threadStats.threadDumpTimedWaiting" [max]="threadStats.threadDumpAll" [striped]="true" [animated]="false" type="warning">
            <span>{{threadStats.threadDumpTimedWaiting * 100 / threadStats.threadDumpAll | number:'1.0-0'}}%</span>
        </ngb-progressbar>
        <p><span jhiTranslate="metrics.jvm.threads.waiting">Waiting</span> ({{threadStats.threadDumpWaiting}})</p>
        <ngb-progressbar [value]="threadStats.threadDumpWaiting" [max]="threadStats.threadDumpAll" [striped]="true" [animated]="false" type="warning">
            <span>{{threadStats.threadDumpWaiting * 100 / threadStats.threadDumpAll | number:'1.0-0'}}%</span>
        </ngb-progressbar>
        <p><span jhiTranslate="metrics.jvm.threads.blocked">Blocked</span> ({{threadStats.threadDumpBlocked}})</p>
        <ngb-progressbar [value]="threadStats.threadDumpBlocked" [max]="threadStats.threadDumpAll" [striped]="true" [animated]="false" type="success">
            <span>{{threadStats.threadDumpBlocked * 100 / threadStats.threadDumpAll | number:'1.0-0'}}%</span>
        </ngb-progressbar>`
})
export class JhiJvmThreadsComponent {

    /**
     * object containing thread related metrics
     */
    @Input() threadStats: {
        threadDumpAll: number;
        threadDumpRunnable: number;
        threadDumpTimedWaiting: number;
        threadDumpWaiting: number;
        threadDumpBlocked: number;
    };

    @Input() refreshThreadDumpData: Function;

}
