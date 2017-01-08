import { Component, OnInit } from '@angular/core';
import { Transition } from 'ui-router-ng2';

import { User } from './user.model';
import { UserService } from './user.service';

@Component({
    selector: '<%=jhiPrefix%>-user-mgmt-detail',
    templateUrl: './user-management-detail.component.html'
})
export class UserMgmtDetailComponent implements OnInit {

    user: User;

    constructor(private userService: UserService, private trans: Transition) { }

    ngOnInit() {
        this.load(this.trans.params()['login']);
    }

    load (login) {
        this.userService.find(login).subscribe(user => {
            this.user = user;
        });
    }

}
