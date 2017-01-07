import { Component, OnInit } from '@angular/core';
import { <%=jhiPrefixCapitalized%>TrackerService } from '../../shared';

@Component({
    selector: '<%=jhiPrefix%>-tracker',
    templateUrl: './tracker.component.html'
})
export class <%=jhiPrefixCapitalized%>TrackerComponent implements OnInit {

    activities: any[] = [];

    constructor(private trackerService: <%=jhiPrefixCapitalized%>TrackerService) {}

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
        this.trackerService.receive().subscribe(activity => {
            this.showActivity(activity);
        });
    }

}
