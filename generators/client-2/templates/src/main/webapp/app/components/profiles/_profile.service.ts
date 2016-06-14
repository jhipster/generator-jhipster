import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import 'rxjs/add/operator/toPromise';

import {ProfileInfo} from './profile-info'

@Injectable()
export class ProfileService {

    private profileInfoUrl = 'api/profile-info';

    constructor(private http: Http) {

    }

    getProfileInfo(): Promise<ProfileInfo> {
        return this.http.get(this.profileInfoUrl)
            .toPromise()
            .then(response => {
                let data = response.json().data;
                let pi = new ProfileInfo();
                pi.activeProfiles = data.activeProfiles;
                pi.ribbonEnv = data.ribbonEnv;
                pi.inProduction = data.activeProfiles.indexOf("prod") !== -1;
                pi.swaggerDisabled = data.activeProfiles.indexOf("no-swagger") !== -1;
                return pi;

            })
            .catch(this.handleError);
    }

    private handleError(error: any) {
        console.error('An error occurred', error);
        return Promise.reject(error.message || error);
    }
}
