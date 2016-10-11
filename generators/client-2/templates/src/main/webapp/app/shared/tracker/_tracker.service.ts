declare var SockJS;
declare var Stomp;
import { Injectable, Inject } from '@angular/core';
import { Observable, Observer } from 'rxjs/Rx';
<%_ if (authenticationType === 'oauth2') { _%>
import { LocalStorageService } from 'ng2-webstorage';
<%_ } _%>

import { CSRFService } from '../auth/csrf.service';
<%_ if (authenticationType === 'jwt' || authenticationType === 'uaa') { _%>
import { AuthServerProvider } from '../auth/auth-jwt.service';
<%_ } _%>

@Injectable()
export class <%=jhiPrefixCapitalized%>TrackerService {
    stompClient = null;
    subscriber = null;
    connection: Promise<any>;
    connectedPromise: any;
    listener: Observable<any>;
    listenerObserver: Observer<any>;
    alreadyConnectedOnce: boolean = false;

    constructor(
        @Inject('$rootScope') private $rootScope,
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
        if (this.connectedPromise === null) this.connection = this.createConnection();
        //building absolute path so that websocket doesnt fail when deploying with a context path
        var loc = this.$window.location;
        var url = '//' + loc.host + loc.pathname + 'websocket/tracker';
        <%_ if (authenticationType === 'oauth2') { _%>
        /*jshint camelcase: false */
        var authToken = this.$json.stringify(this.$localStorage.retrieve('authenticationToken')).access_token;
        url += '?access_token=' + authToken;
        <%_ } if (authenticationType === 'jwt' || authenticationType === 'uaa') { _%>
        var authToken = this.authServerProvider.getToken();
        if(authToken) {
            url += '?access_token=' + authToken;
        }
        <%_ } _%>
        var socket = new SockJS(url);
        this.stompClient = Stomp.over(socket);
        var stateChangeStart;
        var headers = {};
        <%_ if (authenticationType === 'session') { _%>
        headers['X-CSRF-TOKEN'] = this.csrfService.getCSRF('CSRF-TOKEN');
        <%_ } _%>
        this.stompClient.connect(headers, () => {
            this.connectedPromise('success');
            this.connectedPromise = null;
            this.sendActivity();
            if (!this.alreadyConnectedOnce) {
                stateChangeStart = this.$rootScope.$on('$stateChangeStart', () => {
                    this.sendActivity();
                });
                this.alreadyConnectedOnce = true;
            }
        });
        this.$rootScope.$on('$destroy', () => {
            if(stateChangeStart && stateChangeStart !== null){
                stateChangeStart();
            }
        });
    }

    disconnect () {
        if (this.stompClient !== null) {
            this.stompClient.disconnect();
            this.stompClient = null;
        }
    }

    receive () {
        return this.listener;
    }

    sendActivity() {
        if (this.stompClient !== null && this.stompClient.connected) {
            this.stompClient.send(
                '/topic/activity',
                {},
                JSON.stringify({'page': this.$rootScope.toState.name})
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
