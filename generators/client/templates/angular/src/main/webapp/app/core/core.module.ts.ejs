import { NgModule, LOCALE_ID } from '@angular/core';
import { DatePipe, registerLocaleData } from '@angular/common';
import { Title } from '@angular/platform-browser';
<%_ const localeId = getLocaleId(nativeLanguage); _%>
import locale from '@angular/common/locales/<%= localeId %>';

import {
    <%_ if (websocket === 'spring-websocket') { _%>
    <%=jhiPrefixCapitalized%>TrackerService,
    WindowRef,
    <%_ } _%>
    <%_ if (enableTranslation) { _%>
    JhiLanguageHelper,
    <%_ } _%>
    LoginService,
    <%_ if (authenticationType !== 'oauth2') { _%>
    LoginModalService,
    <%_ } _%>
    <%_ if (enableSocialSignIn) { _%>
    SocialService,
    <%_ } _%>
    AccountService,
    StateStorageService,
    Principal,
    CSRFService,
    AuthServerProvider,
    <%_ if (!skipUserManagement || authenticationType === 'oauth2') { _%>
    UserService,
    <%_ } _%>
    UserRouteAccessService
} from './';
<%_ if (enableI18nRTL) { _%>
import {
    FindLanguageFromKeyPipe
} from 'app/shared';<%_ } _%>

@NgModule({
    imports: [],
    exports: [],
    declarations: [],
    providers: [
        <%_ if (websocket === 'spring-websocket') { _%>
        <%=jhiPrefixCapitalized%>TrackerService,
        WindowRef,
        <%_ } _%>
        LoginService,
        <%_ if (authenticationType !== 'oauth2') { _%>
        LoginModalService,
        <%_ } _%>
        <%_ if (enableSocialSignIn) { _%>
        SocialService,
        <%_ } _%>
        Title,
        {
            provide: LOCALE_ID,
        <%_ if (skipLanguageForLocale(nativeLanguage)) { _%>
            useValue: 'en'
        <%_ } else { _%>
            useValue: '<%= localeId %>'
        <%_ } _%>
        },
        <%_ if (enableI18nRTL) { _%>
        FindLanguageFromKeyPipe,
        <%_ } if (enableTranslation) { _%>
        JhiLanguageHelper,
        <%_ } _%>
        AccountService,
        StateStorageService,
        Principal,
        CSRFService,
        AuthServerProvider,
        <%_ if (!skipUserManagement || authenticationType === 'oauth2') { _%>
        UserService,
        <%_ } _%>
        DatePipe,
        UserRouteAccessService
    ]
})
export class <%=angularXAppName%>CoreModule {
    constructor() {
        registerLocaleData(locale);
    }
}
