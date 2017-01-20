import { Routes, CanActivate } from '@angular/router';

import { UserRouteAccessService } from '../shared';

import {
    activateRoute,
    passwordRoute,
    passwordResetFinishRoute,
    passwordResetInitRoute,
    registerRoute,
    <%_ if (authenticationType === 'session') { _%>
    sessionsRoute,
    <%_ } _%>
    <%_ if (enableSocialSignIn) { _%>
    socialRegisterRoute,
        <%_ if (authenticationType == 'jwt') { _%>
    socialAuthRoute,
        <%_ } _%>
    <%_ } _%>
    settingsRoute
} from './';

let ACCOUNT_ROUTES = [
   activateRoute,
   passwordRoute,
   passwordResetFinishRoute,
   passwordResetInitRoute,
   registerRoute,
    <%_ if (authenticationType === 'session') { _%>
   sessionsRoute,
    <%_ } _%>
    <%_ if (enableSocialSignIn) { _%>
    <%_ if (authenticationType == 'jwt') { _%>
    socialAuthRoute,
    <%_ } _%>
   socialRegisterRoute,
    <%_ } _%>
   settingsRoute
];

export const accountState: Routes = [{
    path: '',
    children: ACCOUNT_ROUTES
}];
