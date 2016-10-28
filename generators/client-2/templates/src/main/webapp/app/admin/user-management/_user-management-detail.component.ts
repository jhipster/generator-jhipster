import {Component, OnInit, Inject} from '@angular/core';
import { Response } from '@angular/http';

import { User } from './user.model';
import { UserService } from './user.service';

@Component({
    selector: 'user-mgmt-detail',
    templateUrl: 'app/admin/user-management/user-management-detail.html'
})
export class UserMgmtDetailComponent implements OnInit {

    user: User;

    constructor(private userService: UserService, @Inject('$stateParams') private $stateParams) { }

    ngOnInit() {
        this.load(this.$stateParams.login);
    }

    load (login) {
        this.userService.find(login).subscribe(user => {
            this.user = user;
        });
    }

}
