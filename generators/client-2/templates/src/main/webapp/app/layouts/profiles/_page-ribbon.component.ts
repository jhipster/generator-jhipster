import { Component, OnInit } from '@angular/core';
import { ProfileService } from './profile.service';
import { ProfileInfo } from './profile-info.model';

@Component({
    selector: 'page-ribbon',
    template: `<div class="ribbon {{cssClass}}"><a href="" translate="global.ribbon.{{ribbonEnv}}">{{ribbonEnv}}</a></div>`
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
            this.cssClass = profileInfo.ribbonEnv;
        });
    }
}
