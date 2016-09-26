import * as angular from 'angular';

import {Component, OnInit, Inject} from '@angular/core';

import { Session } from './session.model';
import { SessionsService } from './sessions.service';

@Component({
    selector: 'sessions',
    templateUrl: 'app/account/sessions/sessions.html'
})
export class SessionsComponent implements OnInit {

    account: any;
    error: string;
    success: string;
    sessions: Session[];
    Principal: any;

    constructor(private sessionsService: SessionsService, @Inject('Principal') Principal) {
        this.Principal = Principal;
    }

    ngOnInit() {
        this.sessionsService.findAll().subscribe(sessions => this.sessions = sessions);

        this.Principal.identity().then(function(account) {
            this.account = account;
        }.bind(this));
    }

    invalidate (series) {
        let vm = this;
        this.sessionsService.delete(encodeURIComponent(series)).subscribe(
            response => {
                if (response.status === 200) {
                    vm.error = null;
                    vm.success = 'OK';
                    this.sessionsService.findAll().subscribe(sessions => this.sessions = sessions);
                } else {
                    vm.success = null;
                    vm.error = 'ERROR';
                }
            });
    }
}
