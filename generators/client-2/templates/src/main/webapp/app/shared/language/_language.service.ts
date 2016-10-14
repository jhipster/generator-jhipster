import { Injectable, Inject } from '@angular/core';
import { TranslateService } from 'ng2-translate/ng2-translate';

import { LANGUAGES } from './language.constants';
import { TranslatePartialLoader } from './translate-partial-loader.provider';


@Injectable()
export class <%=jhiPrefixCapitalized%>LanguageService {

    defaultLang = '<%= nativeLanguage %>';
    defaultLocation = 'global';
    currentLang = '<%= nativeLanguage %>';
    locations: string[] = [];

    constructor (public translateService: TranslateService){
        translateService.setDefaultLang(this.defaultLang);
        this.translateService.currentLang = this.currentLang;
    }


    changeLanguage(languageKey: string) {
        this.currentLang = languageKey;
        this.reload();
    }

    setLocations(locations: string[]) {
        this.locations = locations;
        this.locations.push(this.defaultLocation);
        this.reload();
    }

    addLocation(location: string) {
        if (this.locations.indexOf(location) === -1) {
            this.locations.push(location);
            this.reload();
        }
    }

    reload() {
        this.translateService.setDefaultLang(this.currentLang);
        let translatePartialLoader: TranslatePartialLoader = <TranslatePartialLoader> this.translateService.currentLoader;
        translatePartialLoader.setLocations(this.locations);
        //reset the language cache //FIXME not ideal as this increases the http requests
        this.translateService.resetLang(this.currentLang);
        this.translateService.use(this.currentLang);
    }

    getAll(): Promise<any> {
        return Promise.resolve(LANGUAGES);
    }

    getCurrent(): Promise<any> {
        return Promise.resolve(this.currentLang);
    }
}
