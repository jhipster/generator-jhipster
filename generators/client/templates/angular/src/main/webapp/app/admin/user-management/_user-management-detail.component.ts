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

    constructor(private userService: UserService, private route: ActivatedRoute) { }

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
