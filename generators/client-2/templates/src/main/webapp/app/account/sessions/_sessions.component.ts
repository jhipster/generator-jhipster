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

    constructor(private sessionsService: SessionsService, @Inject('Principal') private Principal) {}

    ngOnInit() {
        this.sessionsService.findAll().subscribe(sessions => this.sessions = sessions);

        this.Principal.identity().then((account) => {
            this.account = account;
        });
    }

    invalidate (series) {
        this.sessionsService.delete(encodeURIComponent(series)).subscribe(
            response => {
                if (response.status === 200) {
                    this.error = null;
                    this.success = 'OK';
                    this.sessionsService.findAll().subscribe(sessions => this.sessions = sessions);
                } else {
                    this.success = null;
                    this.error = 'ERROR';
                }
            });
    }
}
