import { MissingTranslationHandler, MissingTranslationHandlerParams } from 'ng2-translate/ng2-translate';

export class JhiMissingTranslationHandler implements MissingTranslationHandler {
    handle(key: MissingTranslationHandlerParams) {
        return `translation-not-found[${key}]`;
    }
}
