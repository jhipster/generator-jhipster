declare var SockJS;
declare var Stomp;
import { Injectable, Inject } from '@angular/core';

<%_ if (authenticationType === 'jwt' || authenticationType === 'uaa') { _%>,
import { AuthServerProvider } from '../'
<%_ } _%>

@Injectable()
export class <%=jhiPrefixCapitalized%>TrackerService {
    stompClient = null;
    subscriber = null;
    listener: Promise<any>;
    connected: Promise<any>;
    alreadyConnectedOnce: boolean = false;

    constructor(
        @Inject('$rootScope') private $rootScope,
        <%_ if (authenticationType === 'jwt' || authenticationType === 'uaa') { _%>,
        private authServerProvider: AuthServerProvider,
        <%_ } if (authenticationType === 'oauth2') { _%>
        @Inject('$localStorage') private $localStorage,
        <%_ } _%>
        private $document: Document,
        private $window: Window
    ) {
        this.listener = new Promise(() => {});
    }

    connect () {
        //building absolute path so that websocket doesnt fail when deploying with a context path
        var loc = this.$window.location;
        var url = '//' + loc.host + loc.pathname + 'websocket/tracker';
        <%_ if (authenticationType === 'oauth2') { _%>
        /*jshint camelcase: false */
        var authToken = this.$json.stringify(this.$localStorage.authenticationToken).access_token;
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
        headers['X-CSRF-TOKEN'] = this.getCSRF('CSRF-TOKEN');
        <%_ } _%>
        this.stompClient.connect(headers, () => {
            this.connected = Promise.resolve('success');
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
            this.stompClient
                .send('/topic/activity',
                {},
                JSON.stringify({'page': this.$rootScope.toState.name}));
        }
    }

    subscribe () {
        this.connected.then(() => {
            this.subscriber = this.stompClient.subscribe('/topic/tracker', data => {
                this.listener = Promise.resolve(JSON.parse(data.body));
            });
        });
    }

    unsubscribe () {
        if (this.subscriber !== null) {
            this.subscriber.unsubscribe();
        }
        this.listener = new Promise(() => {});
    }

    private getCSRF(name) {
        name = `${name}=`;
        let ca = this.$document.cookie.split(';');
        for(var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1);
            if (c.indexOf(name) != -1) return c.substring(name.length,c.length);
        }
        return '';
    }
}
