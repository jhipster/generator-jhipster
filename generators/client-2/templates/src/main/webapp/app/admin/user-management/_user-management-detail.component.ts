import {Component, OnInit, Inject} from '@angular/core';
import { Response } from '@angular/http';

import { User } from './user.model';
import { UserService } from './user.service';

import { Transition } from 'ui-router-ng2';

@Component({
    selector: 'user-mgmt-detail',
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
