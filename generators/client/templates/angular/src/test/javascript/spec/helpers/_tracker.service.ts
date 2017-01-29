import { SpyObject } from './spyobject';
import { <%=jhiPrefixCapitalized%>TrackerService } from '../../../../main/webapp/app/shared/tracker/tracker.service';

export class MockTrackerService extends SpyObject {

    constructor() {
        super(<%=jhiPrefixCapitalized%>TrackerService);
    }

    connect () {}
}
