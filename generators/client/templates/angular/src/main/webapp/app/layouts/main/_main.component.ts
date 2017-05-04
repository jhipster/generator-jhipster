<%#
 Copyright 2013-2017 the original author or authors.

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
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRouteSnapshot, NavigationEnd, RoutesRecognized } from '@angular/router';

<%_ if (enableTranslation) { _%>
import { JhiLanguageService } from 'ng-jhipster';
import { JhiLanguageHelper, StateStorageService } from '../../shared';
<%_ } else { _%>
import { Title } from '@angular/platform-browser';
import { StateStorageService } from '../../shared';
<%_ } _%>

@Component({
    selector: '<%=jhiPrefix%>-main',
    templateUrl: './main.component.html'
})
export class <%=jhiPrefixCapitalized%>MainComponent implements OnInit {

    constructor(
        <%_ if (enableTranslation) { _%>
        private jhiLanguageHelper: JhiLanguageHelper,
        private jhiLanguageService: JhiLanguageService,
        <%_ } else { _%>
        private titleService: Title,
        <%_ } _%>
        private router: Router,
        private $storageService: StateStorageService,
    ) {
        <%_ if (enableTranslation) { _%>
        // Just for forcing translation loading
        jhiLanguageService.setLocations(['all']);
        <%_ } _%>
    }

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
                this.jhiLanguageHelper.updateTitle(this.getPageTitle(this.router.routerState.snapshot.root));
                <%_ } else { _%>
                this.titleService.setTitle(this.getPageTitle(this.router.routerState.snapshot.root));
                <%_ } _%>
            }
        });
    }
}
