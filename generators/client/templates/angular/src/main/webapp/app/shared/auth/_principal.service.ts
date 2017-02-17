import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { AccountService } from './account.service';
<%_ if (websocket === 'spring-websocket') { _%>
import { <%=jhiPrefixCapitalized%>TrackerService } from '../tracker/tracker.service'; // Barrel doesnt work here. No idea why!
<%_ } _%>

@Injectable()
export class Principal {
    private identity: any;
    private authenticated = false;
    private authenticationState = new Subject<any>();

    constructor(
        private account: AccountService<% if (websocket === 'spring-websocket') { %>,
        private trackerService: <%=jhiPrefixCapitalized%>TrackerService<% } %>
    ) {}

    authenticate (identity) {
        this.identity = identity;
        this.authenticated = identity !== null;
        this.authenticationState.next(this.identity);
    }

    hasAnyAuthority (authorities: string[]): Promise<boolean> {
        if (!this.authenticated || !this.identity || !this.identity.authorities) {
            return Promise.resolve(false);
        }

        for (let i = 0; i < authorities.length; i++) {
            if (this.identity.authorities.indexOf(authorities[i]) !== -1) {
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
            this.identity = undefined;
        }

        // check and see if we have retrieved the identity data from the server.
        // if we have, reuse it by immediately resolving
        if (this.identity) {
            return Promise.resolve(this.identity);
        }

        // retrieve the identity data from the server, update the identity object, and then resolve.
        return this.account.get().toPromise().then(account => {
            if (account) {
                this.identity = account;
                this.authenticated = true;
                <%_ if (websocket === 'spring-websocket') { _%>
                this.trackerService.connect();
                <%_ } _%>
            } else {
                this.identity = null;
                this.authenticated = false;
            }
            this.authenticationState.next(this.identity);
            return this.identity;
        }).catch(err => {
            <%_ if (websocket === 'spring-websocket') { _%>
            if (this.trackerService.stompClient && this.trackerService.stompClient.connected) {
                this.trackerService.disconnect();
            }
            <%_ } _%>
            this.identity = null;
            this.authenticated = false;
            this.authenticationState.next(this.identity);
            return null;
        });
    }

    isAuthenticated (): boolean {
        return this.authenticated;
    }

    isIdentityResolved (): boolean {
        return this.identity !== undefined;
    }

    getAuthenticationState(): Observable<any> {
        return this.authenticationState.asObservable();
    }

    getImageUrl(): String {
        return this.isIdentityResolved () ? this.identity.imageUrl : null;
    }
}
