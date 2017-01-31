import { Component, OnInit } from '@angular/core';
import { ProfileService } from './profile.service';
import { ProfileInfo } from './profile-info.model';

@Component({
    selector: '<%=jhiPrefix%>-page-ribbon',
    template: `<div class="ribbon" *ngIf="ribbonEnv"><a href=""<% if (enableTranslation) { %> jhiTranslate="global.ribbon.{{ribbonEnv}}"<% } %>>{{ribbonEnv}}</a></div>`,
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

    constructor(private profileService: ProfileService) {}

    ngOnInit() {
        this.profileService.getProfileInfo().subscribe(profileInfo => {
            this.profileInfo = profileInfo;
            this.ribbonEnv = profileInfo.ribbonEnv;
        });
    }
}
