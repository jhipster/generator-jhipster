import { Injectable } from '@angular/core';

@Injectable()
export class SocialService {

    constructor () {}

    getProviderSetting (provider) {
        switch (provider) {
            case 'google': return 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email';
            case 'facebook': return 'public_profile,email';
            case 'twitter': return '';
            // jhipster-needle-add-social-button
            default: return 'Provider setting not defined';
        }
    }

    getProviderURL (provider) {
        return 'signin/' + provider;
    }

}
