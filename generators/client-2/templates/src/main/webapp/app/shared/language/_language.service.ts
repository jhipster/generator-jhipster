import { Injectable, Inject } from '@angular/core';
import { TranslateService, TranslationChangeEvent, LangChangeEvent } from 'ng2-translate/ng2-translate';
import { StateService } from "ui-router-ng2";

import { LANGUAGES } from './language.constants';
import { TranslatePartialLoader } from './translate-partial-loader.provider';


@Injectable()
export class <%=jhiPrefixCapitalized%>LanguageService {

    defaultLang = '<%= nativeLanguage %>';
    defaultLocation = 'global';
    currentLang = '<%= nativeLanguage %>';
    locations: string[] = [];

    constructor (private translateService: TranslateService, private $state: StateService){
        this.init();
    }

    init () {
        this.translateService.setDefaultLang(this.defaultLang);
        this.translateService.currentLang = this.currentLang;
        // FIXME onTranslationChange may not be required at all
        this.translateService.onTranslationChange.subscribe((event: TranslationChangeEvent) => {
            this.updateTitle();
        });
        this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
            this.updateTitle();
        });
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

    /**
     * update the window title using params in the following
     * precendence
     * 1. titleKey parameter
     * 2. $state.$current.data.pageTitle (current state page title)
     * 3. 'global.title'
     */
    updateTitle(titleKey?: string) {
        if (!titleKey && this.$state.current.data && this.$state.current.data.pageTitle) {
            titleKey = this.$state.current.data.pageTitle;
        }
        this.translateService.get(titleKey || 'global.title').subscribe(title => {
            window.document.title = title;
        });
    }
}
