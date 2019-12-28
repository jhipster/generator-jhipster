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
    selector: 'jhi-metrics-cache',
    template: `
        <h3 jhiTranslate="metrics.cache.title">Cache statistics</h3>
        <div class="table-responsive" *ngIf="!updating">
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th jhiTranslate="metrics.cache.cachename">Cache name</th>
                        <th class="text-right" data-translate="metrics.cache.hits">Cache Hits</th>
                        <th class="text-right" data-translate="metrics.cache.misses">Cache Misses</th>
                        <th class="text-right" data-translate="metrics.cache.gets">Cache Gets</th>
                        <th class="text-right" data-translate="metrics.cache.puts">Cache Puts</th>
                        <th class="text-right" data-translate="metrics.cache.removals">Cache Removals</th>
                        <th class="text-right" data-translate="metrics.cache.evictions">Cache Evictions</th>
                        <th class="text-right" data-translate="metrics.cache.hitPercent">Cache Hit %</th>
                        <th class="text-right" data-translate="metrics.cache.missPercent">Cache Miss %</th>
                    </tr>
                </thead>
                <tbody>
                    <tr *ngFor="let entry of (cacheMetrics | keys)">
                        <td>{{ entry.key }}</td>
                        <td class="text-right">{{ entry.value['cache.gets.hit'] }}</td>
                        <td class="text-right">{{ entry.value['cache.gets.miss'] }}</td>
                        <td class="text-right">{{ entry.value['cache.gets.hit'] + entry.value['cache.gets.miss'] }}</td>
                        <td class="text-right">{{ entry.value['cache.puts'] }}</td>
                        <td class="text-right">{{ entry.value['cache.removals'] }}</td>
                        <td class="text-right">{{ entry.value['cache.evictions'] }}</td>
                        <td class="text-right">
                            {{
                                filterNaN(
                                    (100 * entry.value['cache.gets.hit']) / (entry.value['cache.gets.hit'] + entry.value['cache.gets.miss'])
                                ) | number: '1.0-4'
                            }}
                        </td>
                        <td class="text-right">
                            {{
                                filterNaN(
                                    (100 * entry.value['cache.gets.miss']) /
                                        (entry.value['cache.gets.hit'] + entry.value['cache.gets.miss'])
                                ) | number: '1.0-4'
                            }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    `
})
export class JhiMetricsCacheComponent {
    /**
     * object containing all cache related metrics
     */
    @Input() cacheMetrics: {};

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
