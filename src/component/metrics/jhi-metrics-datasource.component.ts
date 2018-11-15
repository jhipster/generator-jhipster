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
    selector: 'jhi-metrics-datasource',
    templateUrl: './jhi-metrics-datasource.component.html'
})
export class JhiMetricsDatasourceComponent {

    /**
     * object containing all datasource related metrics
     */
    @Input() datasourceMetrics: {
        active: any;
        min: any;
        idle: any;
        max: any;
        usage: any;
        acquire: any;
        creation: any;
    };

    /**
     * boolean field saying if the metrics are in the process of being updated
     */
    @Input() updating: boolean;

    filterNaN(input) {
        if (isNaN(input)) {
            return 0;
        }
        return input;
    }
}
