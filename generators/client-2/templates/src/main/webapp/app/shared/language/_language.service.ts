import { Injectable, Inject } from '@angular/core';

import { TranslateService } from 'ng2-translate/ng2-translate';

import { LANGUAGES } from './language.constants';

@Injectable()
export class <%=jhiPrefixCapitalized%>LanguageService {

    // TODO: Replace this with nativeLanguage
    currentLang = 'en';
    currentLocation = 'home';

    constructor (public translateService: TranslateService){
        this.translateService = translateService;
        this.translateService.currentLang = this.currentLang;
     }


    changeLanguage(languageKey: string) {
       this.translateService.use(languageKey+'/'+ this.currentLocation);
    }

    setLocation(locationKey: string){
       this.currentLocation = locationKey;
       this.translateService.use(this.currentLang+'/'+this.currentLocation);
    }

    getAll(): Promise<any> {
        return Promise.resolve(LANGUAGES);
    }

    getCurrent(): Promise<any> {
        return Promise.resolve(this.currentLang);
    }
}
