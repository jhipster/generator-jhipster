import {Component, OnInit} from '@angular/core';
import {ProfileService} from './profile.service';
import {ProfileInfo} from './profile-info';

@Component({
    selector: 'page-ribbon',
    template: '<div class="ribbon hidden"><a href="" translate="global.ribbon.{{ribbonEnv}}">{{ribbonEnv}}</a></div>'
})

export class PageRibbonComponent implements OnInit {

    profileInfo: ProfileInfo;
    ribbonEnv: String;

    constructor(private profileService: ProfileService) {

    }

    getProfileInfo() {
        this.profileService
            .getProfileInfo()
            .then(profileInfo => {
                this.profileInfo = profileInfo;
                this.ribbonEnv = profileInfo.ribbonEnv;
            })
            .catch(error => console.error(error));
    }

    ngOnInit() {
        this.getProfileInfo();
    }
}
