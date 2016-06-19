import { Component } from "@angular/core";
import 'rxjs/add/operator/toPromise';
import { <%=jhiPrefixCapitalized%>TrackerService } from "./<%=jhiPrefixCapitalized%>TrackerService";

@Component({
    selector: '<%=jhiPrefix%>-tracker',
    templateUrl: './tracker.html',
    providers: [ <%=jhiPrefixCapitalized%>TrackerService ]
})
export class <%=jhiPrefixCapitalized%>TrackerController{

    constructor(private <%=jhiPrefix%>TrackerService: <%=jhiPrefixCapitalized%>TrackerService){}

    activities: any[] = [];

    showActivity (activity: any) {
        let existingActivity: boolean = false;
        for (let index = 0; index < this.activities.length; index++) {
            if(this.activities[index].sessionId === activity.sessionId) {
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

    this.<%=jhiPrefixCapitalized%>TrackerService.receive().toPromise.then(
        (null,null, (activity) => {
            this.showActivity(activity);
        })    
    );

}