import { Component, OnInit, OnDestroy } from '@angular/core';
import { JhiLanguageService } from 'ng-jhipster';

import { <%=jhiPrefixCapitalized%>TrackerService } from '../../shared';

@Component({
    selector: '<%=jhiPrefix%>-tracker',
    templateUrl: './tracker.component.html'
})
export class <%=jhiPrefixCapitalized%>TrackerComponent implements OnInit, OnDestroy {

    activities: any[] = [];

    constructor(
        private jhiLanguageService: JhiLanguageService,
        private trackerService: <%=jhiPrefixCapitalized%>TrackerService
    ) {
        this.jhiLanguageService.setLocations(['tracker']);
    }

    showActivity (activity: any) {
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
        this.trackerService.receive().subscribe(activity => {
            this.showActivity(activity);
        });
    }

    ngOnDestroy() {
        this.trackerService.unsubscribe();
    }

}
