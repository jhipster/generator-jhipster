import { Component, OnInit } from '@angular/core';
import { JhiLanguageService } from 'ng-jhipster';

import { Session } from './session.model';
import { SessionsService } from './sessions.service';
import { Principal } from '../../shared';

@Component({
    selector: '<%=jhiPrefix%>-sessions',
    templateUrl: './sessions.component.html'
})
export class SessionsComponent implements OnInit {

    account: any;
    error: string;
    success: string;
    sessions: Session[];

    constructor(
        private jhiLanguageService: JhiLanguageService,
        private sessionsService: SessionsService,
        private principal: Principal
    ) {
        this.jhiLanguageService.setLocations(['sessions']);
    }

    ngOnInit() {
        this.sessionsService.findAll().subscribe(sessions => this.sessions = sessions);

        this.principal.identity().then((account) => {
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
