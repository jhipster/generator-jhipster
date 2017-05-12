<%#
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
-%>
import { Component, OnInit, OnDestroy } from '@angular/core';

import { <%=jhiPrefixCapitalized%>TrackerService } from '../../shared';

@Component({
    selector: '<%=jhiPrefix%>-tracker',
    templateUrl: './tracker.component.html'
})
export class <%=jhiPrefixCapitalized%>TrackerComponent implements OnInit, OnDestroy {

    activities: any[] = [];

    constructor(
        private trackerService: <%=jhiPrefixCapitalized%>TrackerService
    ) {
    }

    showActivity(activity: any) {
        let existingActivity = false;
        for (let index = 0; index < this.activities.length; index++) {
            if (this.activities[index].sessionId === activity.sessionId) {
                existingActivity = true;
                if ( activity.page === 'logout' ) {
                    this.activities.splice(index, 1);
                } else {
                    this.activities[index] = activity;
                }
            }
        }
        if (!existingActivity && (activity.page !== 'logout')) {
            this.activities.push(activity);
        }
    }

    ngOnInit() {
        this.trackerService.subscribe();
        this.trackerService.receive().subscribe((activity) => {
            this.showActivity(activity);
        });
    }

    ngOnDestroy() {
        this.trackerService.unsubscribe();
    }
}
