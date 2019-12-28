/*
 Copyright 2013-2020 the original author or authors from the JHipster project.

 This file is part of the JHipster project, see https://www.jhipster.tech/
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
import { Component, Input } from '@angular/core';

@Component({
    selector: 'jhi-metrics-system',
    template: `
        <h4>System</h4>
        <div class="row" *ngIf="!updating">
            <div class="col-md-4">Uptime</div>
            <div class="col-md-8 text-right">{{ convertMillisecondsToDuration(systemMetrics['process.uptime']) }}</div>
        </div>
        <div class="row" *ngIf="!updating">
            <div class="col-md-4">Start time</div>
            <div class="col-md-8 text-right">{{ systemMetrics['process.start.time'] | date: 'full' }}</div>
        </div>
        <div class="row" *ngIf="!updating">
            <div class="col-md-9">Process CPU usage</div>
            <div class="col-md-3 text-right">{{ 100 * systemMetrics['process.cpu.usage'] | number: '1.0-2' }} %</div>
        </div>
        <ngb-progressbar
            [value]="100 * systemMetrics['process.cpu.usage']"
            [striped]="true"
            [animated]="false"
            type="success"
            *ngIf="!updating"
        >
            <span>{{ 100 * systemMetrics['process.cpu.usage'] | number: '1.0-2' }} %</span>
        </ngb-progressbar>
        <div class="row" *ngIf="!updating">
            <div class="col-md-9">System CPU usage</div>
            <div class="col-md-3 text-right">{{ 100 * systemMetrics['system.cpu.usage'] | number: '1.0-2' }} %</div>
        </div>
        <ngb-progressbar
            [value]="100 * systemMetrics['system.cpu.usage']"
            [striped]="true"
            [animated]="false"
            type="success"
            *ngIf="!updating"
        >
            <span>{{ 100 * systemMetrics['system.cpu.usage'] | number: '1.0-2' }} %</span>
        </ngb-progressbar>
        <div class="row" *ngIf="!updating">
            <div class="col-md-9">System CPU count</div>
            <div class="col-md-3 text-right">{{ systemMetrics['system.cpu.count'] }}</div>
        </div>
        <div class="row" *ngIf="!updating">
            <div class="col-md-9">System 1m Load average</div>
            <div class="col-md-3 text-right">{{ systemMetrics['system.load.average.1m'] | number: '1.0-2' }}</div>
        </div>
        <div class="row" *ngIf="!updating">
            <div class="col-md-9">Process files max</div>
            <div class="col-md-3 text-right">{{ systemMetrics['process.files.max'] | number: '1.0-0' }}</div>
        </div>
        <div class="row" *ngIf="!updating">
            <div class="col-md-9">Process files open</div>
            <div class="col-md-3 text-right">{{ systemMetrics['process.files.open'] | number: '1.0-0' }}</div>
        </div>
    `
})
export class JhiMetricsSystemComponent {
    /**
     * object containing thread related metrics
     */
    @Input() systemMetrics: {};

    /**
     * boolean field saying if the metrics are in the process of being updated
     */
    @Input() updating: boolean;

    convertMillisecondsToDuration(ms) {
        const times = {
            year: 31557600000,
            month: 2629746000,
            day: 86400000,
            hour: 3600000,
            minute: 60000,
            second: 1000
        };
        let timeString = '';
        for (const key in times) {
            if (Math.floor(ms / times[key]) > 0) {
                let plural = '';
                if (Math.floor(ms / times[key]) > 1) {
                    plural = 's';
                }
                timeString += Math.floor(ms / times[key]).toString() + ' ' + key.toString() + plural + ' ';
                ms = ms - times[key] * Math.floor(ms / times[key]);
            }
        }
        return timeString;
    }
}
