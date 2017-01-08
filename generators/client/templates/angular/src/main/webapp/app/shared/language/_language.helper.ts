import { Injectable } from '@angular/core';
import { TranslateService, TranslationChangeEvent, LangChangeEvent } from 'ng2-translate';
import { StateService } from 'ui-router-ng2';

import { LANGUAGES } from './language.constants';

@Injectable()
export class JhiLanguageHelper {

    constructor (private translateService: TranslateService, private $state: StateService) {
        this.init();
    }

    init () {
        // FIXME onTranslationChange may not be required at all
        this.translateService.onTranslationChange.subscribe((event: TranslationChangeEvent) => {
            this.updateTitle();
        });
        this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
            this.updateTitle();
        });
    }

    getAll(): Promise<any> {
        return Promise.resolve(LANGUAGES);
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
