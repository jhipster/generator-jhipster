import { Injectable, Inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Observable, Observer, Subscription } from 'rxjs/Rx';

import { CSRFService } from '../auth/csrf.service';
import { WindowRef } from './window.service';
<%_ if (authenticationType === 'jwt' || authenticationType === 'uaa') { _%>
import { AuthServerProvider } from '../auth/auth-jwt.service';
<%_ } _%>
<%_ if (authenticationType === 'oauth2') { _%>
import { AuthServerProvider } from '../auth/auth-oauth2.service';
<%_ } _%>

import * as SockJS from 'sockjs-client';
import * as Stomp from 'webstomp-client';

@Injectable()
export class <%=jhiPrefixCapitalized%>TrackerService {
    stompClient = null;
    subscriber = null;
    connection: Promise<any>;
    connectedPromise: any;
    listener: Observable<any>;
    listenerObserver: Observer<any>;
    alreadyConnectedOnce = false;
    private subscription: Subscription;

    constructor(
        private router: Router,
        <%_ if (authenticationType === 'jwt' || authenticationType === 'uaa' || authenticationType === 'oauth2') { _%>
        private authServerProvider: AuthServerProvider,
        <%_ } _%>
        private $window: WindowRef,
        private csrfService: CSRFService
    ) {
        this.connection = this.createConnection();
        this.listener = this.createListener();
    }

    connect () {
        if (this.connectedPromise === null) {
          this.connection = this.createConnection();
        }
        // building absolute path so that websocket doesn't fail when deploying with a context path
        const loc = this.$window.nativeWindow.location;
        let url = '//' + loc.host + loc.pathname + 'websocket/tracker';
        <%_ if (authenticationType === 'jwt' || authenticationType === 'uaa' || authenticationType === 'oauth2') { _%>
        const authToken = this.authServerProvider.getToken()<% if (authenticationType === 'oauth2') { %>.access_token<% } %>;
        if (authToken) {
            url += '?access_token=' + authToken;
        }
        <%_ } _%>
        const socket = new SockJS(url);
        this.stompClient = Stomp.over(socket);
        let headers = {};
        <%_ if (authenticationType === 'session') { _%>
        headers['X-XSRF-TOKEN'] = this.csrfService.getCSRF('XSRF-TOKEN');
        <%_ } _%>
        this.stompClient.connect(headers, () => {
            this.connectedPromise('success');
            this.connectedPromise = null;
            this.sendActivity();
            if (!this.alreadyConnectedOnce) {
                this.subscription = this.router.events.subscribe((event) => {
                  if (event instanceof NavigationEnd) {
                    this.sendActivity();
                  }
                });
                this.alreadyConnectedOnce = true;
            }
        });
    }

    disconnect () {
        if (this.stompClient !== null) {
            this.stompClient.disconnect();
            this.stompClient = null;
        }
        if (this.subscription) {
            this.subscription.unsubscribe();
            this.subscription = null;
        }
        this.alreadyConnectedOnce = false;
    }

    receive () {
        return this.listener;
    }

    sendActivity() {
        if (this.stompClient !== null && this.stompClient.connected) {
            this.stompClient.send(
                '/topic/activity', // destination
                JSON.stringify({'page': this.router.routerState.snapshot.url}), // body
                {} // header
            );
        }
    }

    subscribe () {
        this.connection.then(() => {
            this.subscriber = this.stompClient.subscribe('/topic/tracker', data => {
                this.listenerObserver.next(JSON.parse(data.body));
            });
        });
    }

    unsubscribe () {
        if (this.subscriber !== null) {
            this.subscriber.unsubscribe();
        }
        this.listener = this.createListener();
    }

    private createListener(): Observable<any> {
        return new Observable(observer => {
            this.listenerObserver = observer;
        });
    }

    private createConnection(): Promise<any> {
        return new Promise((resolve, reject) => this.connectedPromise = resolve);
    }
}
