import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { AccountService } from './account.service';
<%_ if (websocket === 'spring-websocket') { _%>
import { <%=jhiPrefixCapitalized%>TrackerService } from '../tracker/tracker.service'; // Barrel doesnt work here. No idea why!
<%_ } _%>

@Injectable()
export class Principal {
    private identityObj: any;
    private authenticated = false;
    private authenticationState = new Subject<any>();

    constructor(
        private account: AccountService<% if (websocket === 'spring-websocket') { %>,
        private trackerService: <%=jhiPrefixCapitalized%>TrackerService<% } %>
    ) {}

    authenticate (identity) {
        this.identityObj = identity;
        this.authenticated = identity !== null;
        this.authenticationState.next(this.identityObj);
    }

    hasAnyAuthority (authorities: string[]): Promise<boolean> {
        if (!this.authenticated || !this.identityObj || !this.identityObj.authorities) {
            return Promise.resolve(false);
        }

        for (let i = 0; i < authorities.length; i++) {
            if (this.identityObj.authorities.indexOf(authorities[i]) !== -1) {
                return Promise.resolve(true);
            }
        }

        return Promise.resolve(false);
    }

    hasAuthority (authority: string): Promise<boolean> {
        if (!this.authenticated) {
           return Promise.resolve(false);
        }

        return this.identity().then(id => {
            return Promise.resolve(id.authorities && id.authorities.indexOf(authority) !== -1);
        }, () => {
            return Promise.resolve(false);
        });
    }

    identity (force?: boolean): Promise<any> {
        if (force === true) {
            this.identityObj = undefined;
        }

        // check and see if we have retrieved the identityObj     data from the server.
        // if we have, reuse it by immediately resolving
        if (this.identityObj) {
            return Promise.resolve(this.identityObj);
        }

        // retrieve the identityObj data from the server, update the identity object, and then resolve.
        return this.account.get().toPromise().then(account => {
            if (account) {
                this.identityObj = account;
                this.authenticated = true;
                <%_ if (websocket === 'spring-websocket') { _%>
                this.trackerService.connect();
                <%_ } _%>
            } else {
                this.identityObj = null;
                this.authenticated = false;
            }
            this.authenticationState.next(this.identityObj);
            return this.identityObj;
        }).catch(err => {
            <%_ if (websocket === 'spring-websocket') { _%>
            if (this.trackerService.stompClient && this.trackerService.stompClient.connected) {
                this.trackerService.disconnect();
            }
            <%_ } _%>
            this.identityObj = null;
            this.authenticated = false;
            this.authenticationState.next(this.identityObj);
            return null;
        });
    }

    isAuthenticated (): boolean {
        return this.authenticated;
    }

    isIdentityResolved (): boolean {
        return this.identityObj !== undefined;
    }

    getAuthenticationState(): Observable<any> {
        return this.authenticationState.asObservable();
    }

    getImageUrl(): String {
        return this.isIdentityResolved () ? this.identityObj.imageUrl : null;
    }
}
