import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRouteSnapshot, NavigationEnd } from '@angular/router';

import { JhiLanguageHelper } from '../../shared';

@Component({
    selector: '<%=jhiPrefix%>-main',
    templateUrl: './main.component.html'
})
export class <%=jhiPrefixCapitalized%>MainComponent implements OnInit {

	constructor(private router: Router, private jhiLanguageService: JhiLanguageHelper) {}

	private getPageTitle(routeSnapshot: ActivatedRouteSnapshot) {
        let title = routeSnapshot.data ? routeSnapshot.data['pageTitle'] : <%= angularAppName %>;
        if (routeSnapshot.firstChild) {
            title = this.getDeepestTitle(routeSnapshot.firstChild) || title;
        }
        return title;
    }

    ngOnInit() {
        this.router.events.subscribe((event) => {
	        if (event instanceof NavigationEnd) {
	        	this.jhiLanguageService.updateTitle(this.getPageTitle(this.router.routerState.snapshot.root));
	        }
        });
    }
}
