import { Injectable, Inject } from '@angular/core';
import { Observable, Observer, Subscription } from 'rxjs/Rx';
import { UIRouter } from 'ui-router-ng2';
<%_ if (authenticationType === 'oauth2') { _%>
import { LocalStorageService } from 'ng2-webstorage';
<%_ } _%>

import { CSRFService } from '../auth/csrf.service';
<%_ if (authenticationType === 'jwt' || authenticationType === 'uaa') { _%>
import { AuthServerProvider } from '../auth/auth-jwt.service';
<%_ } _%>

import SockJS = require('sockjs-client');
import Stomp = require('webstomp-client');

@Injectable()
export class <%=jhiPrefixCapitalized%>TrackerService {
    stompClient = null;
    subscriber = null;
    connection: Promise<any>;
    connectedPromise: any;
    listener: Observable<any>;
    listenerObserver: Observer<any>;
    alreadyConnectedOnce: boolean = false;
    private subscription: Subscription;

    constructor(
        private uiRouter: UIRouter,
        <%_ if (authenticationType === 'jwt' || authenticationType === 'uaa') { _%>
        private authServerProvider: AuthServerProvider,
        <%_ } if (authenticationType === 'oauth2') { _%>
        private $localStorage: LocalStorageService,
        <%_ } _%>
        private $document: Document,
        private $window: Window,
        private csrfService: CSRFService
    ) {
        this.connection = this.createConnection();
        this.listener = this.createListener();
    }

    connect () {
        if (this.connectedPromise === null) {
          this.connection = this.createConnection();
        }
        // building absolute path so that websocket doesnt fail when deploying with a context path
        const loc = this.$window.location;
        const url = '//' + loc.host + loc.pathname + 'websocket/tracker';
        <%_ if (authenticationType === 'oauth2') { _%>
        /*jshint camelcase: false */
        const authToken = this.$json.stringify(this.$localStorage.retrieve('authenticationToken')).access_token;
        url += '?access_token=' + authToken;
        <%_ } if (authenticationType === 'jwt' || authenticationType === 'uaa') { _%>
        const authToken = this.authServerProvider.getToken();
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
                this.subscription = this.uiRouter.globals.success$.subscribe((event) => {
                  this.sendActivity();
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
        if (this.subscription !== null) {
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
                JSON.stringify({'page': this.uiRouter.globals.current.name}), // body
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
