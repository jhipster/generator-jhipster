import { Component, OnInit } from '@angular/core';
import { ProfileService } from './profile.service';
import { ProfileInfo } from './profile-info.model';

@Component({
    selector: '<%=jhiPrefix%>-page-ribbon',
    template: `<div class="ribbon {{cssClass}}"><a href=""<% if (enableTranslation) { %> jhiTranslate="global.ribbon.{{ribbonEnv}}"<% } %>>{{ribbonEnv}}</a></div>`,
    styleUrls: [
        <%_ if (useSass) { _%>
        'page-ribbon.scss'
        <%_ } else { _%>
        'page-ribbon.css'
        <%_ } _%>
    ]
})
export class PageRibbonComponent implements OnInit {

    profileInfo: ProfileInfo;
    ribbonEnv: string;
    cssClass: string;

    constructor(private profileService: ProfileService) {
        this.cssClass = 'hidden';
    }

    ngOnInit() {
        this.profileService.getProfileInfo().subscribe(profileInfo => {
            this.profileInfo = profileInfo;
            this.ribbonEnv = profileInfo.ribbonEnv;
            if (profileInfo.inProduction) {
                this.cssClass = 'hidden';
            } else {
                this.cssClass = '';
            }
        });
    }
}
