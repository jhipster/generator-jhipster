import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRouteSnapshot, NavigationEnd } from '@angular/router';

<%_ if (enableTranslation) { _%>
import { JhiLanguageHelper } from '../../shared';
<%_ } else { _%>
import { Title } from '@angular/platform-browser';
<%_ } _%>

@Component({
    selector: '<%=jhiPrefix%>-main',
    templateUrl: './main.component.html'
})
export class <%=jhiPrefixCapitalized%>MainComponent implements OnInit {

    constructor(
        <%_ if (enableTranslation) { _%>
        private jhiLanguageService: JhiLanguageHelper,
        <%_ } else { _%>
        private titleService: Title,
        <%_ } _%>
        private router: Router
    ) {}

    private getPageTitle(routeSnapshot: ActivatedRouteSnapshot) {
        let title: string = (routeSnapshot.data && routeSnapshot.data['pageTitle']) ? routeSnapshot.data['pageTitle'] : '<%= angularAppName %>';
        if (routeSnapshot.firstChild) {
            title = this.getPageTitle(routeSnapshot.firstChild) || title;
        }
        return title;
    }

    ngOnInit() {
        this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                <%_ if (enableTranslation) { _%>
                this.jhiLanguageService.updateTitle(this.getPageTitle(this.router.routerState.snapshot.root));
                <%_ } else { _%>
                 this.titleService.setTitle(this.getPageTitle(this.router.routerState.snapshot.root));
                <%_ } _%>
            }
        });
    }
}
