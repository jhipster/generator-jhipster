import { LANGUAGES } from './language.constants';
import { Injectable, Inject } from '@angular/core';

@Injectable()
export class <%=jhiPrefixCapitalized%>LanguageService {

    constructor(
        @Inject('$translate') private $translate,
        @Inject('tmhDynamicLocale') private tmhDynamicLocale
    ) { }

    changeLanguage(languageKey) {
        this.$translate.use(languageKey);
        this.tmhDynamicLocale.set(languageKey);
    }

    getAll(): Promise<any> {
        return Promise.resolve(LANGUAGES);
    }

    getCurrent(): Promise<any> {
        var language = this.$translate.storage().get('NG_TRANSLATE_LANG_KEY');
        return Promise.resolve(language);
    }
}
