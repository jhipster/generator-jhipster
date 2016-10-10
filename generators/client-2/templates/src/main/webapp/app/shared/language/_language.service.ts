import { Injectable, Inject } from '@angular/core';

import { TranslateService } from 'ng2-translate/ng2-translate';

import { LANGUAGES } from './language.constants';
import { <%=angular2AppName%>SharedCommonModule } from '../../shared';

@Injectable()
export class <%=jhiPrefixCapitalized%>LanguageService {

    currentLang = 'en';
    currentLocation = 'home';

    constructor (public translateService: TranslateService){
        this.translateService = translateService;
        this.translateService.currentLang = this.currentLang;
     }


    changeLanguage(languageKey) {
       this.translateService.use(languageKey+'/'+ this.currentLocation);
    }

    setLocation(){
       this.translateService.use(this.currentLang+'/'+this.currentLocation);
    }

    getAll(): Promise<any> {
        return Promise.resolve(LANGUAGES);
    }

    getCurrent(): Promise<any> {
        return Promise.resolve(this.currentLang);
    }
}
