import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { User } from './user.model';
import { UserService } from './user.service';

@Component({
    selector: '<%=jhiPrefix%>-user-mgmt-detail',
    templateUrl: './user-management-detail.component.html'
})
export class UserMgmtDetailComponent implements OnInit {

    user: User;

    constructor(
        <%_ if (enableTranslation) { _%>
        private jhiLanguageService: JhiLanguageService,
        <%_ } _%>
        private userService: UserService,
        private route: ActivatedRoute) {
        <%_ if (enableTranslation) { _%>
        this.jhiLanguageService.setLocations(['user-management']);
        <%_ } _%>
    }

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            this.load(params['login']);
        });
    }

    load (login) {
        this.userService.find(login).subscribe(user => {
            this.user = user;
        });
    }

}
