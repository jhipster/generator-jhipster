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
    selector: 'jhi-metrics-system',
    template: `
        <h4>Misc</h4>
        <div class="row" *ngIf="!updating">
            <div class="col-md-9">Process CPU usage</div>
            <div class="col-md-3 text-right">{{100 * systemMetrics["process.cpu.usage"] | number:'1.0-2'}} %</div>
        </div>
        <ngb-progressbar [value]="100 * systemMetrics['process.cpu.usage']" [striped]="true" [animated]="false" type="success" *ngIf="!updating">
            <span>{{100 * systemMetrics["process.cpu.usage"] | number:'1.0-2'}} %</span>
        </ngb-progressbar>
        <div class="row" *ngIf="!updating">
            <div class="col-md-9">System CPU usage</div>
            <div class="col-md-3 text-right">{{100 * systemMetrics["system.cpu.usage"] | number:'1.0-2'}} %</div>
        </div>
        <ngb-progressbar [value]="100 * systemMetrics['system.cpu.usage']" [striped]="true" [animated]="false" type="success" *ngIf="!updating">
            <span>{{100 * systemMetrics["system.cpu.usage"] | number:'1.0-2'}} %</span>
        </ngb-progressbar>
        <div class="row" *ngIf="!updating">
            <div class="col-md-9">System CPU count</div>
            <div class="col-md-3 text-right">{{systemMetrics["system.cpu.count"]}}</div>
        </div>
        <div class="row" *ngIf="!updating">
            <div class="col-md-9">System 1m Load average</div>
            <div class="col-md-3 text-right">{{systemMetrics["system.load.average.1m"] | number:'1.0-2'}}</div>
        </div>
        <div class="row" *ngIf="!updating">
            <div class="col-md-9">Uptime (in seconds)</div>
            <div class="col-md-3 text-right">{{1000 * systemMetrics["process.uptime"] | date: 'HH:mm:ss'}} s</div>
        </div>`
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
}
