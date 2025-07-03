import { NgModule, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MissingTranslationHandler, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { missingTranslationHandler, translatePartialLoader } from 'app/config/translation.config';
import { StateStorageService } from 'app/core/auth/state-storage.service';

function lazyTranslatePartialLoader(http: HttpClient): TranslateLoader {
  return new TranslateHttpLoader(http, 'services/store/i18n/', `.json?_=${I18N_HASH}`);
}

@NgModule({
  imports: [
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: lazyTranslatePartialLoader,
        deps: [HttpClient],
      },
      isolate: false,
      extend: true,
    }),
  ],
})
export class LazyTranslationModule {
  private readonly translateService = inject(TranslateService);
  private readonly translateLoader = inject(TranslateLoader);
  private readonly stateStorageService = inject(StateStorageService);

  constructor() {
    const { currentLang } = this.translateService.store;
    this.translateLoader.getTranslation(currentLang).subscribe(translation => {
      this.translateService.setTranslation(currentLang, translation);
    });
  }
}

@NgModule({
  imports: [
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: translatePartialLoader,
        deps: [HttpClient],
      },
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useFactory: missingTranslationHandler,
      },
    }),
  ],
})
export class TranslationModule {
  private readonly translateService = inject(TranslateService);
  private readonly stateStorageService = inject(StateStorageService);

  constructor() {
    this.translateService.setDefaultLang('en');
    // if user have changed language and navigates away from the application and back to the application then use previously chosen language
    const langKey = this.stateStorageService.getLocale() ?? 'en';
    this.translateService.use(langKey);
  }
}
